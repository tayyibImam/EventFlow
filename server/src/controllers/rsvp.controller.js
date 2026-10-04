const pool = require('../config/db');

// Everything here is deliberately unauthenticated — the random token in the
// URL (see eventGuests.controller.js's inviteGuest) is the only credential
// a guest has, standing in for a real emailed invite link.

// A guest who never responds is auto-declined once the event is less than a
// day away — run as a lazy on-read sweep (there's no background job runner
// in this app) rather than a real cron. Shared by the guest's own RSVP page
// and the organizer-facing guest list (eventGuests.controller.js) so both
// paths converge on the same cutoff regardless of which is hit first.
async function autoDeclineStale(whereClause, params) {
  await pool.query(
    `UPDATE event_guests eg
     JOIN events e ON e.event_id = eg.event_id
     SET eg.rsvp_status = 'declined'
     WHERE eg.rsvp_status IN ('invited', 'no_response')
       AND e.start_datetime <= NOW() + INTERVAL 1 DAY
       AND ${whereClause}`,
    params
  );
}

// GET /api/rsvp/:token — invitation + event + venue details for the guest landing page
async function getInvitationByToken(req, res) {
  try {
    const { token } = req.params;

    await autoDeclineStale('eg.token = ?', [token]);

    const [rows] = await pool.query(
      `SELECT
         eg.event_guest_id, eg.rsvp_status, eg.rsvp_locked, eg.token,
         g.guest_id, g.name AS guest_name, g.email AS guest_email, g.phone AS guest_phone,
         e.event_id, e.title, e.description, e.start_datetime, e.end_datetime, e.status AS event_status,
         v.name AS venue_name, v.address AS venue_address, v.city AS venue_city
       FROM event_guests eg
       JOIN guests g ON g.guest_id = eg.guest_id
       JOIN events e ON e.event_id = eg.event_id
       LEFT JOIN venues v ON v.venue_id = e.venue_id
       WHERE eg.token = ?`,
      [token]
    );

    if (rows.length === 0) {
      return res.status(404).json({ error: 'Invitation not found' });
    }

    res.json(rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch invitation' });
  }
}

// PUT /api/rsvp/:token — guest updates their own RSVP. Once a guest
// themselves submits accepted/declined here, that choice is locked in —
// they can never flip to the other one afterwards, so a confirmed headcount
// can't quietly change after the fact. Enforced here, not just in the UI,
// since this route is unauthenticated (the token is the only credential).
//
// The lock is tracked by `rsvp_locked`, separate from `rsvp_status` itself,
// because autoDeclineStale() below also sets rsvp_status='declined' for a
// guest who simply never responded — that's a system default, not the
// guest's own decision, so it must NOT lock them out of responding for real
// once they do show up on the link.
//
// Organizers can still override either way from the Guests page (see
// eventGuests.controller.js#updateRsvp), a separate, deliberately
// unrestricted endpoint that never touches this lock.
async function updateRsvpByToken(req, res) {
  try {
    const { token } = req.params;
    const { rsvp_status } = req.body;

    const validStatuses = ['accepted', 'declined', 'no_response'];
    if (!validStatuses.includes(rsvp_status)) {
      return res.status(400).json({ error: `rsvp_status must be one of: ${validStatuses.join(', ')}` });
    }

    const [existing] = await pool.query('SELECT * FROM event_guests WHERE token = ?', [token]);
    if (existing.length === 0) {
      return res.status(404).json({ error: 'Invitation not found' });
    }

    const current = existing[0];
    if (current.rsvp_locked && rsvp_status !== current.rsvp_status) {
      return res.status(409).json({
        error: `You already ${current.rsvp_status} this invitation and can't change your response. Contact the organizer if you need this corrected.`
      });
    }

    // Locks in as soon as the guest makes a real choice — 'no_response' is
    // never sent by the UI, but if it ever is, it doesn't count as a choice.
    const locksIn = rsvp_status === 'accepted' || rsvp_status === 'declined';
    await pool.query(
      'UPDATE event_guests SET rsvp_status = ?, rsvp_locked = rsvp_locked OR ? WHERE token = ?',
      [rsvp_status, locksIn, token]
    );
    const [updated] = await pool.query('SELECT * FROM event_guests WHERE token = ?', [token]);
    res.json(updated[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to update RSVP' });
  }
}

// POST /api/rsvp/:token/feedback — guest leaves feedback for the event they were invited to
async function submitFeedbackByToken(req, res) {
  try {
    const { token } = req.params;
    const { rating, comment } = req.body;

    if (!rating) {
      return res.status(400).json({ error: 'rating is required' });
    }

    const [existing] = await pool.query('SELECT * FROM event_guests WHERE token = ?', [token]);
    if (existing.length === 0) {
      return res.status(404).json({ error: 'Invitation not found' });
    }

    const invite = existing[0];
    const [result] = await pool.query(
      'INSERT INTO feedback (event_id, guest_id, rating, comment) VALUES (?, ?, ?, ?)',
      [invite.event_id, invite.guest_id, rating, comment || null]
    );

    const [newFeedback] = await pool.query('SELECT * FROM feedback WHERE feedback_id = ?', [result.insertId]);
    res.status(201).json(newFeedback[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to submit feedback' });
  }
}

module.exports = { getInvitationByToken, updateRsvpByToken, submitFeedbackByToken, autoDeclineStale };
