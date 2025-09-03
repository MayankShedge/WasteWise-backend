import express from 'express';
import { getDashboardStats } from '../controllers/statsController.js';
import { protect, admin } from '../middleware/authMiddleware.js';

const router = express.Router();

// This route is protected and only accessible by admins.
// It points to the getDashboardStats function in our controller.
router.route('/').get(protect, admin, getDashboardStats);

// This is the crucial line that makes the file work with server.js
export default router;