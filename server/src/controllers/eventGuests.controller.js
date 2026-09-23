const pool = require('../config/db');

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

// POST /api/events/:eventId/guests — invite a guest (always starts as 'invited')
async function inviteGuest(req, res) {
  try {
    const { eventId } = req.params;
    const { guest_id } = req.body;

    if (!guest_id) {
      return res.status(400).json({ error: 'guest_id is required' });
    }

    const [result] = await pool.query(
      'INSERT INTO event_guests (event_id, guest_id) VALUES (?, ?)',
      [eventId, guest_id]
    );

    const [newInvite] = await pool.query(
      'SELECT * FROM event_guests WHERE event_guest_id = ?',
      [result.insertId]
    );
    res.status(201).json(newInvite[0]);
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