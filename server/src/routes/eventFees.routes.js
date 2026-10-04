const express = require('express');
const router = express.Router();
const verifyToken = require('../middleware/auth.middleware');
const { initiateEventFee } = require('../controllers/eventFees.controller');

function requireOrganizer(req, res, next) {
  if (req.user.role !== 'organizer') {
    return res.status(403).json({ error: 'Organizer access required' });
  }
  next();
}

router.post('/initiate', verifyToken, requireOrganizer, initiateEventFee);

module.exports = router;
