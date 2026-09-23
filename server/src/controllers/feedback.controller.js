const pool = require('../config/db');

async function getAllFeedback(req, res) {
  try {
    const [rows] = await pool.query('SELECT * FROM feedback');
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch feedback' });
  }
}

async function getFeedbackById(req, res) {
  try {
    const { id } = req.params;
    const [rows] = await pool.query('SELECT * FROM feedback WHERE feedback_id = ?', [id]);

    if (rows.length === 0) {
      return res.status(404).json({ error: 'Feedback not found' });
    }

    res.json(rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch feedback' });
  }
}

async function createFeedback(req, res) {
  try {
    const { event_id, guest_id, rating, comment } = req.body;

    if (!event_id || !guest_id || !rating) {
      return res.status(400).json({ error: 'event_id, guest_id, and rating are required' });
    }

    const [result] = await pool.query(
      `INSERT INTO feedback (event_id, guest_id, rating, comment)
       VALUES (?, ?, ?, ?)`,
      [event_id, guest_id, rating, comment || null]
    );

    const [newFeedback] = await pool.query('SELECT * FROM feedback WHERE feedback_id = ?', [result.insertId]);
    res.status(201).json(newFeedback[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to create feedback' });
  }
}

async function updateFeedback(req, res) {
  try {
    const { id } = req.params;
    const { event_id, guest_id, rating, comment } = req.body;

    const [existing] = await pool.query('SELECT * FROM feedback WHERE feedback_id = ?', [id]);
    if (existing.length === 0) {
      return res.status(404).json({ error: 'Feedback not found' });
    }

    await pool.query(
      `UPDATE feedback SET event_id = ?, guest_id = ?, rating = ?, comment = ? WHERE feedback_id = ?`,
      [event_id, guest_id, rating, comment, id]
    );

    const [updated] = await pool.query('SELECT * FROM feedback WHERE feedback_id = ?', [id]);
    res.json(updated[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to update feedback' });
  }
}

async function deleteFeedback(req, res) {
  try {
    const { id } = req.params;

    const [existing] = await pool.query('SELECT * FROM feedback WHERE feedback_id = ?', [id]);
    if (existing.length === 0) {
      return res.status(404).json({ error: 'Feedback not found' });
    }

    await pool.query('DELETE FROM feedback WHERE feedback_id = ?', [id]);
    res.status(204).send();
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to delete feedback' });
  }
}

module.exports = { getAllFeedback, getFeedbackById, createFeedback, updateFeedback, deleteFeedback };