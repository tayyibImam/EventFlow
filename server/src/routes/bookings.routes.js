const express = require('express');
const router = express.Router({ mergeParams: true });
const verifyToken = require('../middleware/auth.middleware');
const { getAvailability, createBooking } = require('../controllers/bookings.controller');

function requireOrganizer(req, res, next) {
  if (req.user.role !== 'organizer') {
    return res.status(403).json({ error: 'Organizer access required' });
  }
  next();
}

router.get('/availability', verifyToken, getAvailability);
router.post('/bookings', verifyToken, requireOrganizer, createBooking);

module.exports = router;
