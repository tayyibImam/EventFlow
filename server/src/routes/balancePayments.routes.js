const express = require('express');
const router = express.Router();
const verifyToken = require('../middleware/auth.middleware');
const {
  getOutstandingBalances,
  getOverdueBalances,
  initiateBalancePayment
} = require('../controllers/balancePayments.controller');

function requireOrganizer(req, res, next) {
  if (req.user.role !== 'organizer') {
    return res.status(403).json({ error: 'Organizer access required' });
  }
  next();
}

function requireAdmin(req, res, next) {
  if (req.user.role !== 'admin') {
    return res.status(403).json({ error: 'Admin access required' });
  }
  next();
}

router.get('/outstanding', verifyToken, requireOrganizer, getOutstandingBalances);
router.get('/overdue', verifyToken, requireAdmin, getOverdueBalances);
router.post('/initiate', verifyToken, requireOrganizer, initiateBalancePayment);

module.exports = router;
