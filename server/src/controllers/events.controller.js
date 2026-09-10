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

module.exports = { getAllEvents };