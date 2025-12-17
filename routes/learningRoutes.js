import express from 'express';
import {
  getLearningForItem,
  getAllLearningData
} from '../controllers/learningController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

// @route   GET /api/learning/:detectedItem
// @desc    Get learning for specific detected item
// @access  Public (used by scanner)
router.get('/:detectedItem', getLearningForItem);

// @route   GET /api/learning/admin/all
// @desc    Get all learning data (for admin dashboard)
// @access  Private (Admin only)
router.get('/admin/all', protect, getAllLearningData);

export default router;
