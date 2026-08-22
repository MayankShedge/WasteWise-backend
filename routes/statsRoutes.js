import express from 'express';
import { getDashboardStats } from '../controllers/statsController.js';
import { protect, admin } from '../middleware/authMiddleware.js';
import { getCacheStats } from '../utils/cache.js';

const router = express.Router();

router.route('/').get(protect, admin, getDashboardStats);

router.get('/cache-stats', protect, admin, (req, res) => {
  res.json(getCacheStats());
});

export default router;