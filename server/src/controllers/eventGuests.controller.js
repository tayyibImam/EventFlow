const crypto = require('crypto');
const pool = require('../config/db');
const { sendMail } = require('../config/mailer');
const { renderEmail, card, button } = require('../utils/emailTemplates');
const { autoDeclineStale } = require('./rsvp.controller');

// `db.js` sets dateStrings: true, so start_datetime/end_datetime arrive as
// plain "YYYY-MM-DD HH:MM:SS" strings, not JS Dates — format directly off
// the string instead of `new Date(...)`, which would reinterpret it in the
// server's local timezone and shift the displayed time.
function formatEventDateTime(startStr, endStr) {
  if (!startStr) return { date: '', time: '' };

  const [startDatePart, startTimePart] = startStr.split(' ');
  const [year, month, day] = startDatePart.split('-').map(Number);
  const MONTHS = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
  const date = `${MONTHS[month - 1]} ${day}, ${year}`;

  const formatClock = (timePart) => {
    if (!timePart) return '';
    const [h, m] = timePart.split(':').map(Number);
    const period = h >= 12 ? 'PM' : 'AM';
    const hour12 = h % 12 === 0 ? 12 : h % 12;
    return `${hour12}:${String(m).padStart(2, '0')} ${period}`;
  };

  const startTime = formatClock(startTimePart);
  const endTime = endStr ? formatClock(endStr.split(' ')[1]) : '';

  return { date, time: endTime ? `${startTime} - ${endTime}` : startTime };
}

// GET /api/events/:eventId/guests — list everyone invited to this event
async function getEventGuests(req, res) {
  try {
    const { eventId } = req.params;

    await autoDeclineStale('eg.event_id = ?', [eventId]);

    const [rows] = await pool.query(
      'SELECT * FROM event_guests WHERE event_id = ?',
      [eventId]
    );
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch event guests' });
  }
}

// POST /api/events/:eventId/guests — invite a guest (always starts as 'invited').
// Generates a random token — this is the only "credential" the guest RSVP
// link needs, since that flow is intentionally unauthenticated (see
// rsvp.controller.js) — then emails that link to the guest via Nodemailer.
// A failed/skipped email never fails the invite itself: the row (and token)
// are already committed, and the organizer can always copy the link
// manually from the Guests page as a fallback.
async function inviteGuest(req, res) {
  try {
    const { eventId } = req.params;
    const { guest_id } = req.body;

    if (!guest_id) {
      return res.status(400).json({ error: 'guest_id is required' });
    }

    const token = crypto.randomBytes(24).toString('hex');

    const [result] = await pool.query(
      'INSERT INTO event_guests (event_id, guest_id, token) VALUES (?, ?, ?)',
      [eventId, guest_id, token]
    );

    const [newInvite] = await pool.query(
      'SELECT * FROM event_guests WHERE event_guest_id = ?',
      [result.insertId]
    );

    let emailSent = false;
    try {
      const [[guest]] = await pool.query('SELECT name, email FROM guests WHERE guest_id = ?', [guest_id]);
      const [[event]] = await pool.query(
        `SELECT e.title, e.start_datetime, e.end_datetime, v.name AS venue_name, v.address AS venue_address, v.city AS venue_city
         FROM events e LEFT JOIN venues v ON e.venue_id = v.venue_id
         WHERE e.event_id = ?`,
        [eventId]
      );

      if (guest?.email) {
        const rsvpLink = `${process.env.CLIENT_URL || 'http://localhost:3000'}/rsvp/${token}`;
        const eventTitle = event?.title || 'an EventFlow event';
        const { date, time } = formatEventDateTime(event?.start_datetime, event?.end_datetime);
        const location = event?.venue_name
          ? `${event.venue_name}${event.venue_city ? `, ${event.venue_city}` : ''}`
          : '';

        const html = renderEmail({
          preheaderText: `You're invited to ${eventTitle} — RSVP inside.`,
          bodyHtml: `
            <p style="margin:0 0 4px;font-size:16px;font-weight:700;color:#1B3A5C;">Hi ${guest.name},</p>
            <p style="margin:12px 0 0;">You've been invited to an event on EventFlow. RSVP below to let the organizer know if you can make it.</p>
            ${card({
              heading: eventTitle,
              rows: [
                { label: 'Date', value: date },
                { label: 'Time', value: time },
                { label: 'Location', value: location || 'To be announced' }
              ]
            })}
            ${button({ text: 'RSVP Now', href: rsvpLink })}
            <p style="margin:0;font-size:12px;color:#64748b;">No account needed — this invite link is unique to you, so you can RSVP straight away.</p>
          `
        });

        await sendMail({
          to: guest.email,
          subject: `You're invited: ${eventTitle}`,
          text: `Hi ${guest.name},\n\nYou've been invited to ${eventTitle}${date ? ` on ${date}${time ? ` at ${time}` : ''}` : ''}${location ? ` at ${location}` : ''}.\n\nRSVP here: ${rsvpLink}\n\nNo account needed.`,
          html
        });
        emailSent = true;
      }
    } catch (mailErr) {
      console.error('inviteGuest: failed to send invite email, invitation was still created:', mailErr);
    }

    res.status(201).json({ ...newInvite[0], email_sent: emailSent });
  } catch (err) {
    if (err.code === 'ER_DUP_ENTRY') {
      return res.status(409).json({ error: 'This guest is already invited to this event' });
    }
    console.error(err);
    res.status(500).json({ error: 'Failed to invite guest' });
  }
}

// PUT /api/events/:eventId/guests/:guestId — update RSVP status
async function updateRsvp(req, res) {
  try {
    const { eventId, guestId } = req.params;
    const { rsvp_status } = req.body;

    const validStatuses = ['invited', 'accepted', 'declined', 'no_response'];
    if (!validStatuses.includes(rsvp_status)) {
      return res.status(400).json({ error: `rsvp_status must be one of: ${validStatuses.join(', ')}` });
    }

    const [existing] = await pool.query(
      'SELECT * FROM event_guests WHERE event_id = ? AND guest_id = ?',
      [eventId, guestId]
    );
    if (existing.length === 0) {
      return res.status(404).json({ error: 'Invitation not found' });
    }

    await pool.query(
      'UPDATE event_guests SET rsvp_status = ? WHERE event_id = ? AND guest_id = ?',
      [rsvp_status, eventId, guestId]
    );

    const [updated] = await pool.query(
      'SELECT * FROM event_guests WHERE event_id = ? AND guest_id = ?',
      [eventId, guestId]
    );
    res.json(updated[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to update RSVP' });
  }
}

// DELETE /api/events/:eventId/guests/:guestId — remove an invitation
async function removeGuestFromEvent(req, res) {
  try {
    const { eventId, guestId } = req.params;

    const [existing] = await pool.query(
      'SELECT * FROM event_guests WHERE event_id = ? AND guest_id = ?',
      [eventId, guestId]
    );
    if (existing.length === 0) {
      return res.status(404).json({ error: 'Invitation not found' });
    }

    await pool.query(
      'DELETE FROM event_guests WHERE event_id = ? AND guest_id = ?',
      [eventId, guestId]
    );
    res.status(204).send();
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to remove invitation' });
  }
}

module.exports = { getEventGuests, inviteGuest, updateRsvp, removeGuestFromEvent };