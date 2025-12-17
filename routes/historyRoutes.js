import express from 'express';
import { logScan, getScanHistory, getEnhancedAnalytics } from '../controllers/historyController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

router.route('/').post(protect, logScan).get(protect, getScanHistory);

router.get('/analytics', protect, getEnhancedAnalytics);

export default router;
