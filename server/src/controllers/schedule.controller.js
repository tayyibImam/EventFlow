const pool = require('../config/db');

async function getAllSchedule(req, res) {
  try {
    const [rows] = await pool.query('SELECT * FROM event_schedule');
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch schedule' });
  }
}

async function getScheduleById(req, res) {
  try {
    const { id } = req.params;
    const [rows] = await pool.query('SELECT * FROM event_schedule WHERE schedule_id = ?', [id]);

    if (rows.length === 0) {
      return res.status(404).json({ error: 'Schedule entry not found' });
    }

    res.json(rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch schedule entry' });
  }
}

async function createSchedule(req, res) {
  try {
    const { event_id, activity_title, start_time, end_time, notes } = req.body;

    if (!event_id || !activity_title || !start_time) {
      return res.status(400).json({ error: 'event_id, activity_title, and start_time are required' });
    }

    const [result] = await pool.query(
      `INSERT INTO event_schedule (event_id, activity_title, start_time, end_time, notes)
       VALUES (?, ?, ?, ?, ?)`,
      [event_id, activity_title, start_time, end_time || null, notes || null]
    );

    const [newEntry] = await pool.query('SELECT * FROM event_schedule WHERE schedule_id = ?', [result.insertId]);
    res.status(201).json(newEntry[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to create schedule entry' });
  }
}

async function updateSchedule(req, res) {
  try {
    const { id } = req.params;
    const { event_id, activity_title, start_time, end_time, notes } = req.body;

    const [existing] = await pool.query('SELECT * FROM event_schedule WHERE schedule_id = ?', [id]);
    if (existing.length === 0) {
      return res.status(404).json({ error: 'Schedule entry not found' });
    }

    await pool.query(
      `UPDATE event_schedule SET
        event_id = ?, activity_title = ?, start_time = ?, end_time = ?, notes = ?
       WHERE schedule_id = ?`,
      [event_id, activity_title, start_time, end_time, notes, id]
    );

    const [updated] = await pool.query('SELECT * FROM event_schedule WHERE schedule_id = ?', [id]);
    res.json(updated[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to update schedule entry' });
  }
}

async function deleteSchedule(req, res) {
  try {
    const { id } = req.params;

    const [existing] = await pool.query('SELECT * FROM event_schedule WHERE schedule_id = ?', [id]);
    if (existing.length === 0) {
      return res.status(404).json({ error: 'Schedule entry not found' });
    }

    await pool.query('DELETE FROM event_schedule WHERE schedule_id = ?', [id]);
    res.status(204).send();
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to delete schedule entry' });
  }
}

module.exports = { getAllSchedule, getScheduleById, createSchedule, updateSchedule, deleteSchedule };