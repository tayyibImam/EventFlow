const pool = require('../config/db');

async function getAllVenues(req, res) {
  try {
    const [rows] = await pool.query('SELECT * FROM venues');
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch venues' });
  }
}

async function getVenueById(req, res) {
  try {
    const { id } = req.params;
    const [rows] = await pool.query('SELECT * FROM venues WHERE venue_id = ?', [id]);

    if (rows.length === 0) {
      return res.status(404).json({ error: 'Venue not found' });
    }

    res.json(rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch venue' });
  }
}

async function createVenue(req, res) {
  try {
    const { name, address, city, capacity, price_per_day, contact_number } = req.body;

    if (!name || !address || !city || !capacity || !price_per_day) {
      return res.status(400).json({
        error: 'name, address, city, capacity, and price_per_day are required'
      });
    }

    const [result] = await pool.query(
      `INSERT INTO venues (name, address, city, capacity, price_per_day, contact_number)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [name, address, city, capacity, price_per_day, contact_number || null]
    );

    const [newVenue] = await pool.query('SELECT * FROM venues WHERE venue_id = ?', [result.insertId]);
    res.status(201).json(newVenue[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to create venue' });
  }
}

async function updateVenue(req, res) {
  try {
    const { id } = req.params;
    const { name, address, city, capacity, price_per_day, contact_number } = req.body;

    const [existing] = await pool.query('SELECT * FROM venues WHERE venue_id = ?', [id]);
    if (existing.length === 0) {
      return res.status(404).json({ error: 'Venue not found' });
    }

    await pool.query(
      `UPDATE venues SET
        name = ?, address = ?, city = ?, capacity = ?, price_per_day = ?, contact_number = ?
       WHERE venue_id = ?`,
      [name, address, city, capacity, price_per_day, contact_number, id]
    );

    const [updated] = await pool.query('SELECT * FROM venues WHERE venue_id = ?', [id]);
    res.json(updated[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to update venue' });
  }
}

async function deleteVenue(req, res) {
  try {
    const { id } = req.params;

    const [existing] = await pool.query('SELECT * FROM venues WHERE venue_id = ?', [id]);
    if (existing.length === 0) {
      return res.status(404).json({ error: 'Venue not found' });
    }

    // events.venue_id is ON DELETE SET NULL — deleting a venue does not
    // delete any event, it just unlinks the venue from events that used it.
    await pool.query('DELETE FROM venues WHERE venue_id = ?', [id]);
    res.status(204).send();
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to delete venue' });
  }
}

module.exports = { getAllVenues, getVenueById, createVenue, updateVenue, deleteVenue };
