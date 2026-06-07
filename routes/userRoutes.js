import express from 'express';
import {
  registerUser,
  loginUser,
  getUserProfile,
  verifyUserEmail,
  addUserPoints,
  getLeaderboard,
  forgotPassword,
  resetPassword,
  googleAuth,      
} from '../controllers/userController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

router.post('/register', registerUser);
router.post('/login', loginUser);
router.post('/google-auth', googleAuth);          
router.get('/verify/:token', verifyUserEmail);
router.get('/leaderboard', getLeaderboard);
router.post('/forgot-password', forgotPassword);
router.put('/reset-password/:token', resetPassword);

router.get('/profile', protect, getUserProfile);
router.post('/add-points', protect, addUserPoints);

export default router;