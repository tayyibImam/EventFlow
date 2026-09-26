const pool = require('../config/db');

async function getAllGuests(req, res) {
  try {
    const [rows] = await pool.query('SELECT * FROM guests');
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch guests' });
  }
}

async function getGuestById(req, res) {
  try {
    const { id } = req.params;
    const [rows] = await pool.query('SELECT * FROM guests WHERE guest_id = ?', [id]);

    if (rows.length === 0) {
      return res.status(404).json({ error: 'Guest not found' });
    }

    res.json(rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch guest' });
  }
}

async function createGuest(req, res) {
  try {
    const { name, email, phone, description } = req.body;

    if (!name) {
      return res.status(400).json({ error: 'name is required' });
    }

    const [result] = await pool.query(
      'INSERT INTO guests (name, email, phone, description) VALUES (?, ?, ?, ?)',
      [name, email || null, phone || null, description || null]
    );

    const [newGuest] = await pool.query('SELECT * FROM guests WHERE guest_id = ?', [result.insertId]);
    res.status(201).json(newGuest[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to create guest' });
  }
}

async function updateGuest(req, res) {
  try {
    const { id } = req.params;
    const { name, email, phone, description } = req.body;

    const [existing] = await pool.query('SELECT * FROM guests WHERE guest_id = ?', [id]);
    if (existing.length === 0) {
      return res.status(404).json({ error: 'Guest not found' });
    }

    await pool.query(
      'UPDATE guests SET name = ?, email = ?, phone = ?, description = ? WHERE guest_id = ?',
      [name, email, phone, description, id]
    );

    const [updated] = await pool.query('SELECT * FROM guests WHERE guest_id = ?', [id]);
    res.json(updated[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to update guest' });
  }
}

async function deleteGuest(req, res) {
  try {
    const { id } = req.params;

    const [existing] = await pool.query('SELECT * FROM guests WHERE guest_id = ?', [id]);
    if (existing.length === 0) {
      return res.status(404).json({ error: 'Guest not found' });
    }

    // event_guests.guest_id is ON DELETE CASCADE — this also removes any
    // RSVP/invitation rows for this guest, which is the intended behavior.
    await pool.query('DELETE FROM guests WHERE guest_id = ?', [id]);
    res.status(204).send();
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to delete guest' });
  }
}

module.exports = { getAllGuests, getGuestById, createGuest, updateGuest, deleteGuest };
