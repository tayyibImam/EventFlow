const express = require('express');
const router = express.Router({ mergeParams: true });
const {
  getEventVendors,
  updateBooking,
  removeBooking
} = require('../controllers/eventVendors.controller');

router.get('/', getEventVendors);
router.put('/:vendorId', updateBooking);
router.delete('/:vendorId', removeBooking);

module.exports = router;