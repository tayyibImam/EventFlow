const express = require('express');
const router = express.Router();
const verifyToken = require('../middleware/auth.middleware');
const {
  getAllVenues,
  getVenueById,
  createVenue,
  updateVenue,
  deleteVenue
} = require('../controllers/venues.controller');

// Venues are a contractual catalog EventFlow itself negotiates with each
// venue — only admins may add/edit/remove one. Same requireAdmin pattern as
// users.routes.js. Reads stay public (venues are public reference data).
function requireAdmin(req, res, next) {
  if (req.user.role !== 'admin') {
    return res.status(403).json({ error: 'Admin access required' });
  }
  next();
}

router.get('/', getAllVenues);
router.get('/:id', getVenueById);
router.post('/', verifyToken, requireAdmin, createVenue);
router.put('/:id', verifyToken, requireAdmin, updateVenue);
router.delete('/:id', verifyToken, requireAdmin, deleteVenue);

module.exports = router;
