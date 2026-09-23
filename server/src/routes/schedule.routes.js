const express = require('express');
const router = express.Router();
const {
  getAllSchedule,
  getScheduleById,
  createSchedule,
  updateSchedule,
  deleteSchedule
} = require('../controllers/schedule.controller');

router.get('/', getAllSchedule);
router.get('/:id', getScheduleById);
router.post('/', createSchedule);
router.put('/:id', updateSchedule);
router.delete('/:id', deleteSchedule);

module.exports = router;