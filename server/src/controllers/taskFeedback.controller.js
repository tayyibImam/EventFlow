const pool = require('../config/db');

// GET /api/task-feedback — every staff progress/completion note, across
// every task. No server-side scoping by organizer/event (same convention as
// tasks.controller.js and feedback.controller.js) — the client narrows this
// down to an organizer's own events via EventFlowContext.
async function getAllTaskFeedback(req, res) {
  try {
    const [rows] = await pool.query('SELECT * FROM task_feedback ORDER BY submitted_at DESC');
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch task feedback' });
  }
}

// POST /api/task-feedback — a staff member leaving a progress or completion
// note on one of their own tasks. staff_id is always required and is never
// inferred/trusted beyond what's sent — same pattern tasks.controller.js
// already uses for assigned_to.
//
// A 'completed' note also flips the parent task's own status to 'done' —
// and once a task is 'done' (whether that happened via this route or the
// organizer setting it directly from the Tasks page), no further feedback
// of ANY stage can be added for it. That makes the task's own status the
// single source of truth for whether feedback is still open, so this check
// also covers an organizer manually marking a task Done.
//
// The uniq_task_staff_completed key on (task_id, staff_id, completed_marker)
// still backs this with a real DB constraint — the done-status check above
// should always catch a second 'completed' attempt first, but ER_DUP_ENTRY
// is handled below too in case of a race between two requests.
async function createTaskFeedback(req, res) {
  try {
    const { task_id, staff_id, stage, comment } = req.body;

    if (!task_id || !staff_id || !comment) {
      return res.status(400).json({ error: 'task_id, staff_id, and comment are required' });
    }

    const [taskRows] = await pool.query('SELECT status FROM tasks WHERE task_id = ?', [task_id]);
    if (taskRows.length === 0) {
      return res.status(404).json({ error: 'Task not found' });
    }
    if (taskRows[0].status === 'done') {
      return res.status(409).json({ error: 'This task is already marked Done — no further feedback can be added.' });
    }

    const validStages = ['in_progress', 'completed'];
    const finalStage = validStages.includes(stage) ? stage : 'in_progress';

    const [result] = await pool.query(
      'INSERT INTO task_feedback (task_id, staff_id, stage, comment) VALUES (?, ?, ?, ?)',
      [task_id, staff_id, finalStage, comment]
    );

    let taskStatus = taskRows[0].status;
    if (finalStage === 'completed') {
      await pool.query("UPDATE tasks SET status = 'done' WHERE task_id = ?", [task_id]);
      taskStatus = 'done';
    }

    const [newRow] = await pool.query('SELECT * FROM task_feedback WHERE task_feedback_id = ?', [result.insertId]);
    res.status(201).json({ ...newRow[0], task_status: taskStatus });
  } catch (err) {
    if (err.code === 'ER_DUP_ENTRY') {
      return res.status(409).json({ error: 'You already submitted completion feedback for this task — only one is allowed.' });
    }
    console.error(err);
    res.status(500).json({ error: 'Failed to submit task feedback' });
  }
}

// PUT /api/task-feedback/:id/read — organizer marking a note as read. A
// one-way action (no "unread" toggle, matching the "Mark as Read" button it
// backs) and deliberately narrower than a generic update: it only ever
// flips is_read, never stage/comment.
async function markTaskFeedbackRead(req, res) {
  try {
    const { id } = req.params;

    const [existing] = await pool.query('SELECT * FROM task_feedback WHERE task_feedback_id = ?', [id]);
    if (existing.length === 0) {
      return res.status(404).json({ error: 'Feedback not found' });
    }

    await pool.query('UPDATE task_feedback SET is_read = 1 WHERE task_feedback_id = ?', [id]);

    const [updated] = await pool.query('SELECT * FROM task_feedback WHERE task_feedback_id = ?', [id]);
    res.json(updated[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to mark feedback as read' });
  }
}

module.exports = { getAllTaskFeedback, createTaskFeedback, markTaskFeedbackRead };
