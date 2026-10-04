const express = require('express');
const router = express.Router();
const verifyToken = require('../middleware/auth.middleware');
const {
  createRequest,
  getMyRequests,
  getAllRequests,
  reviewRequest
} = require('../controllers/cancellationRequests.controller');

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

// Must come before any '/:id'-shaped route would, same reason as
// users.routes.js's /staff-directory.
router.get('/mine', verifyToken, requireOrganizer, getMyRequests);

router.post('/', verifyToken, requireOrganizer, createRequest);
router.get('/', verifyToken, requireAdmin, getAllRequests);
router.put('/:id/review', verifyToken, requireAdmin, reviewRequest);

module.exports = router;
