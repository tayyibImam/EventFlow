const express = require('express');
const router = express.Router();
const { getAllEvents, getEventById, createEvent } = require('../controllers/events.controller');

router.get('/', getAllEvents);
router.get('/:id', getEventById);
router.post('/', createEvent); // returns the whole newky created row

module.exports = router;