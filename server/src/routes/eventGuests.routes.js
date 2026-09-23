const express = require('express');
const router = express.Router({ mergeParams: true });
const {
  getEventGuests,
  inviteGuest,
  updateRsvp,
  removeGuestFromEvent
} = require('../controllers/eventGuests.controller');

router.get('/', getEventGuests);
router.post('/', inviteGuest);
router.put('/:guestId', updateRsvp);
router.delete('/:guestId', removeGuestFromEvent);

module.exports = router;