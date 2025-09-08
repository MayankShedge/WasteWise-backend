import express from 'express';
import { logScan, getScanHistory, getEnhancedAnalytics } from '../controllers/historyController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

// Both routes are protected and require a user to be logged in
router.route('/').post(protect, logScan).get(protect, getScanHistory);

// Enhanced analytics route
router.get('/analytics', protect, getEnhancedAnalytics);

export default router;
