const pool = require('../config/db');

// Everything here is deliberately unauthenticated — the random token in the
// URL (see eventGuests.controller.js's inviteGuest) is the only credential
// a guest has, standing in for a real emailed invite link.

// GET /api/rsvp/:token — invitation + event + venue details for the guest landing page
async function getInvitationByToken(req, res) {
  try {
    const { token } = req.params;
    const [rows] = await pool.query(
      `SELECT
         eg.event_guest_id, eg.rsvp_status, eg.token,
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

// PUT /api/rsvp/:token — guest updates their own RSVP
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

    await pool.query('UPDATE event_guests SET rsvp_status = ? WHERE token = ?', [rsvp_status, token]);
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

module.exports = { getInvitationByToken, updateRsvpByToken, submitFeedbackByToken };
