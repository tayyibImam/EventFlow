const express = require('express');
const router = express.Router();
const verifyToken = require('../middleware/auth.middleware');
const { getAllUsers, getUserById, updateUser, deleteUser } = require('../controllers/users.controller');

// User records (names, emails, roles) are account data, not public reference
// data like venues/vendors/categories — every route here needs a valid JWT
// first, then a role check, unlike the other Phase 1 resources.
function requireAdmin(req, res, next) {
  if (req.user.role !== 'admin') {
    return res.status(403).json({ error: 'Admin access required' });
  }
  next();
}

router.get('/', verifyToken, requireAdmin, getAllUsers);
router.get('/:id', verifyToken, requireAdmin, getUserById);
router.put('/:id', verifyToken, requireAdmin, updateUser);
router.delete('/:id', verifyToken, requireAdmin, deleteUser);

module.exports = router;
