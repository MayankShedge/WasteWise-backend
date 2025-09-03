import express from 'express';
import { logScan, getScanHistory } from '../controllers/historyController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

// Both routes are protected and require a user to be logged in
router.route('/').post(protect, logScan).get(protect, getScanHistory);

export default router;
