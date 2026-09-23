const pool = require('../config/db');

async function getAllTasks(req, res) {
  try {
    const [rows] = await pool.query('SELECT * FROM tasks');
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch tasks' });
  }
}

async function getTaskById(req, res) {
  try {
    const { id } = req.params;
    const [rows] = await pool.query('SELECT * FROM tasks WHERE task_id = ?', [id]);

    if (rows.length === 0) {
      return res.status(404).json({ error: 'Task not found' });
    }

    res.json(rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch task' });
  }
}

async function createTask(req, res) {
  try {
    const { event_id, assigned_to, title, description, due_date, status } = req.body;

    if (!event_id || !title) {
      return res.status(400).json({ error: 'event_id and title are required' });
    }

    const [result] = await pool.query(
      `INSERT INTO tasks (event_id, assigned_to, title, description, due_date, status)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [event_id, assigned_to || null, title, description || null, due_date || null, status || 'pending']
    );

    const [newTask] = await pool.query('SELECT * FROM tasks WHERE task_id = ?', [result.insertId]);
    res.status(201).json(newTask[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to create task' });
  }
}

async function updateTask(req, res) {
  try {
    const { id } = req.params;
    const { event_id, assigned_to, title, description, due_date, status } = req.body;

    const [existing] = await pool.query('SELECT * FROM tasks WHERE task_id = ?', [id]);
    if (existing.length === 0) {
      return res.status(404).json({ error: 'Task not found' });
    }

    await pool.query(
      `UPDATE tasks SET
        event_id = ?, assigned_to = ?, title = ?, description = ?, due_date = ?, status = ?
       WHERE task_id = ?`,
      [event_id, assigned_to, title, description, due_date, status, id]
    );

    const [updated] = await pool.query('SELECT * FROM tasks WHERE task_id = ?', [id]);
    res.json(updated[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to update task' });
  }
}

async function deleteTask(req, res) {
  try {
    const { id } = req.params;

    const [existing] = await pool.query('SELECT * FROM tasks WHERE task_id = ?', [id]);
    if (existing.length === 0) {
      return res.status(404).json({ error: 'Task not found' });
    }

    await pool.query('DELETE FROM tasks WHERE task_id = ?', [id]);
    res.status(204).send();
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to delete task' });
  }
}

module.exports = { getAllTasks, getTaskById, createTask, updateTask, deleteTask };