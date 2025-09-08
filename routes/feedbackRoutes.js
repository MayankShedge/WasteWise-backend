import express from 'express';
import {
  submitFeedback,
  getUserFeedback,
  getFeedbackAnalytics
} from '../controllers/feedbackController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

// All routes are protected (require authentication)
router.use(protect);

// @route   POST /api/feedback
// @desc    Submit user feedback
// @access  Private
router.post('/', submitFeedback);

// @route   GET /api/feedback/my-feedback
// @desc    Get user's feedback history
// @access  Private
router.get('/my-feedback', getUserFeedback);

// @route   GET /api/feedback/analytics
// @desc    Get feedback analytics
// @access  Private
router.get('/analytics', getFeedbackAnalytics);

export default router;
