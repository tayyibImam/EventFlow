const pool = require('../config/db');

// Every query below explicitly lists columns instead of SELECT * —
// password_hash must never be sent back in an API response.
const SAFE_COLUMNS = 'user_id, name, email, phone, role, created_at';

// GET /api/users/staff-directory — any authenticated user (not just admin),
// since an organizer needs this to assign a task to a real staff account.
// Deliberately narrow: just enough to populate a picker, nothing else.
async function getStaffDirectory(req, res) {
  try {
    const [rows] = await pool.query(
      "SELECT user_id, name, email FROM users WHERE role = 'staff' ORDER BY name"
    );
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch staff directory' });
  }
}

async function getAllUsers(req, res) {
  try {
    const [rows] = await pool.query(`SELECT ${SAFE_COLUMNS} FROM users`);
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch users' });
  }
}

async function getUserById(req, res) {
  try {
    const { id } = req.params;
    const [rows] = await pool.query(`SELECT ${SAFE_COLUMNS} FROM users WHERE user_id = ?`, [id]);

    if (rows.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json(rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch user' });
  }
}

// PUT /api/users/:id — admin-only profile/role edits.
// Deliberately does NOT touch password_hash: password changes should go
// through a dedicated change-password flow that re-hashes with bcrypt, not
// this generic update (never accept a plaintext password here).
async function updateUser(req, res) {
  try {
    const { id } = req.params;
    const { name, email, phone, role } = req.body;

    const validRoles = ['admin', 'organizer', 'staff'];
    if (role && !validRoles.includes(role)) {
      return res.status(400).json({ error: `role must be one of: ${validRoles.join(', ')}` });
    }

    const [existing] = await pool.query('SELECT user_id FROM users WHERE user_id = ?', [id]);
    if (existing.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }

    await pool.query(
      'UPDATE users SET name = ?, email = ?, phone = ?, role = ? WHERE user_id = ?',
      [name, email, phone || null, role, id]
    );

    const [updated] = await pool.query(`SELECT ${SAFE_COLUMNS} FROM users WHERE user_id = ?`, [id]);
    res.json(updated[0]);
  } catch (err) {
    if (err.code === 'ER_DUP_ENTRY') {
      return res.status(409).json({ error: 'An account with this email already exists' });
    }
    console.error(err);
    res.status(500).json({ error: 'Failed to update user' });
  }
}

async function deleteUser(req, res) {
  try {
    const { id } = req.params;

    const [existing] = await pool.query('SELECT user_id FROM users WHERE user_id = ?', [id]);
    if (existing.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }

    await pool.query('DELETE FROM users WHERE user_id = ?', [id]);
    res.status(204).send();
  } catch (err) {
    if (err.code === 'ER_ROW_IS_REFERENCED_2') {
      // events.organizer_id is ON DELETE RESTRICT — this user still owns events
      return res.status(409).json({ error: 'Cannot delete: this user still organizes one or more events' });
    }
    console.error(err);
    res.status(500).json({ error: 'Failed to delete user' });
  }
}

module.exports = { getStaffDirectory, getAllUsers, getUserById, updateUser, deleteUser };
