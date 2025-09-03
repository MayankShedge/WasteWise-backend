import express from 'express';
import {
  registerUser,
  loginUser,
  getUserProfile,
  verifyUserEmail,
  addUserPoints,
  getLeaderboard, // 1. Import new function
} from '../controllers/userController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

// Public routes
router.post('/register', registerUser);
router.post('/login', loginUser);
router.get('/verify/:token', verifyUserEmail);
router.get('/leaderboard', getLeaderboard); // 2. Add new public route

// Protected routes
router.get('/profile', protect, getUserProfile);
router.post('/add-points', protect, addUserPoints);

export default router;
