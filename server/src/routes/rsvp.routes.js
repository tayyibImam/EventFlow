const express = require('express');
const router = express.Router();
const {
  getInvitationByToken,
  updateRsvpByToken,
  submitFeedbackByToken
} = require('../controllers/rsvp.controller');

router.get('/:token', getInvitationByToken);
router.put('/:token', updateRsvpByToken);
router.post('/:token/feedback', submitFeedbackByToken);

module.exports = router;
