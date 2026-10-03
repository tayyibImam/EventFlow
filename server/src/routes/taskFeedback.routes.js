const express = require('express');
const router = express.Router();
const { getAllTaskFeedback, createTaskFeedback, markTaskFeedbackRead } = require('../controllers/taskFeedback.controller');

router.get('/', getAllTaskFeedback);
router.post('/', createTaskFeedback);
router.put('/:id/read', markTaskFeedbackRead);

module.exports = router;
