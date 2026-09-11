const pool = require('../config/db');

async function getAllEvents(req, res) {
  try {
    const [rows] = await pool.query('SELECT * FROM events');
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch events' });
  }
}

async function getEventById(req, res) {
  try {
    const { id } = req.params;
    const [rows] = await pool.query('SELECT * FROM events WHERE event_id = ?', [id]);

    if (rows.length === 0) {
      return res.status(404).json({ error: 'Event not found' });
    }

    res.json(rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch event' });
  }
}

async function createEvent(req, res) {
  try {
    const {
      title, description, category_id, organizer_id,
      venue_id, start_datetime, end_datetime, status, budget
    } = req.body; // destructured

    if (!title || !organizer_id || !start_datetime || !end_datetime) {
      return res.status(400).json({
        error: 'title, organizer_id, start_datetime, and end_datetime are required'
      });
    }

    const [result] = await pool.query(
      `INSERT INTO events
        (title, description, category_id, organizer_id, venue_id, start_datetime, end_datetime, status, budget)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [title, description || null, category_id || null, organizer_id,
       venue_id || null, start_datetime, end_datetime, status || 'planned', budget || 0]
    );

    const [newEvent] = await pool.query('SELECT * FROM events WHERE event_id = ?', [result.insertId]);
    res.status(201).json(newEvent[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to create event' });
  }
}

module.exports = { getAllEvents, getEventById, createEvent };