import express from 'express';
import { getSchedules, createSchedule, updateSchedule, deleteSchedule } from '../controllers/ScheduleController.js';
import { protect, admin } from '../middleware/authMiddleware.js';

const router = express.Router();

router.route('/')
    .get(getSchedules)
    .post(protect, admin, createSchedule);

router.route('/:id')
    .put(protect, admin, updateSchedule)
    .delete(protect, admin, deleteSchedule);

export default router;

