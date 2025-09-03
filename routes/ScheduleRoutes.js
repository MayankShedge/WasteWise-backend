import express from 'express';
// 1. Import all the necessary controller functions
import { getSchedules, createSchedule, updateSchedule, deleteSchedule } from '../controllers/ScheduleController.js';
import { protect, admin } from '../middleware/authMiddleware.js';

const router = express.Router();

// 2. Define the routes for GET (all) and POST (create new) on the base path
router.route('/')
    .get(getSchedules)
    .post(protect, admin, createSchedule);

// 3. Define the routes for PUT (update) and DELETE on a specific ID
router.route('/:id')
    .put(protect, admin, updateSchedule)
    .delete(protect, admin, deleteSchedule);

export default router;

