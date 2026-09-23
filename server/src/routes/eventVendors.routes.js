const express = require('express');
const router = express.Router({ mergeParams: true });
const {
  getEventVendors,
  bookVendor,
  updateBooking,
  removeBooking
} = require('../controllers/eventVendors.controller');

router.get('/', getEventVendors);
router.post('/', bookVendor);
router.put('/:vendorId', updateBooking);
router.delete('/:vendorId', removeBooking);

module.exports = router;