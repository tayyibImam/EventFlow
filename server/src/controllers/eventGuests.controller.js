const crypto = require('crypto');
const pool = require('../config/db');
const { sendMail } = require('../config/mailer');

// GET /api/events/:eventId/guests — list everyone invited to this event
async function getEventGuests(req, res) {
  try {
    const { eventId } = req.params;
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
      const [[event]] = await pool.query('SELECT title FROM events WHERE event_id = ?', [eventId]);

      if (guest?.email) {
        const rsvpLink = `${process.env.CLIENT_URL || 'http://localhost:3000'}/rsvp/${token}`;
        const eventTitle = event?.title || 'an EventFlow event';

        await sendMail({
          to: guest.email,
          subject: `You're invited: ${eventTitle}`,
          text: `Hi ${guest.name},\n\nYou've been invited to ${eventTitle}.\n\nRSVP here: ${rsvpLink}\n\nNo account needed.`,
          html: `
            <p>Hi ${guest.name},</p>
            <p>You've been invited to <strong>${eventTitle}</strong>.</p>
            <p><a href="${rsvpLink}" style="display:inline-block;padding:10px 18px;background:#1B3A5C;color:#fff;border-radius:8px;text-decoration:none;">RSVP Now</a></p>
            <p style="color:#64748b;font-size:12px;">No account needed — this link is unique to you.</p>
          `
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