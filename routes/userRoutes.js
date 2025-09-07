import express from 'express';
import {
  registerUser,
  loginUser,
  getUserProfile,
  verifyUserEmail,
  addUserPoints,
  getLeaderboard,
  forgotPassword, // 1. Import the new functions
  resetPassword,
} from '../controllers/userController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

// Public routes
router.post('/register', registerUser);
router.post('/login', loginUser);
router.get('/verify/:token', verifyUserEmail);
router.get('/leaderboard', getLeaderboard);
router.post('/forgot-password', forgotPassword); // 2. Add the "forgot password" route
router.put('/reset-password/:token', resetPassword); // 3. Add the "reset password" route

// Protected routes
router.get('/profile', protect, getUserProfile);
router.post('/add-points', protect, addUserPoints);

export default router;