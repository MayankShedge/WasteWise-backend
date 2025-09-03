import User from '../models/userModel.js';
import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import { sendVerificationEmail } from '../utils/sendEmail.js';

// ... (generateToken, registerUser, verifyUserEmail, loginUser, getUserProfile, addUserPoints functions remain the same)
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: '30d' });
};
const registerUser = async (req, res) => {
  const { name, email, password, secretKey } = req.body;
  const userExists = await User.findOne({ email });
  if (userExists) {
    return res.status(400).json({ message: 'User already exists' });
  }
  const isAdmin = secretKey === process.env.ADMIN_REGISTRATION_KEY;
  const user = await User.create({ name, email, password, isAdmin });
  if (user) {
    const verificationToken = crypto.randomBytes(32).toString('hex');
    user.verificationToken = verificationToken;
    await user.save();
    try {
      await sendVerificationEmail(user.email, verificationToken);
      res.status(201).json({
        message: 'Registration successful! Please check your email to verify your account.',
      });
    } catch (error) {
      console.error('Email sending error:', error);
      res.status(500).json({ message: 'User registered, but email could not be sent.' });
    }
  } else {
    res.status(400).json({ message: 'Invalid user data' });
  }
};
const verifyUserEmail = async (req, res) => {
  const { token } = req.params;
  const user = await User.findOne({ verificationToken: token });
  if (!user) {
    return res.status(400).json({ message: 'Invalid verification token.' });
  }
  user.isVerified = true;
  user.verificationToken = undefined;
  await user.save();
  res.status(200).json({ message: 'Email verified successfully! You can now log in.' });
};
const loginUser = async (req, res) => {
  const { email, password } = req.body;
  const user = await User.findOne({ email });
  if (user && (await user.matchPassword(password))) {
    if (!user.isVerified) {
      return res.status(401).json({ message: 'Please verify your email to log in.' });
    }
    res.json({
      _id: user._id,
      name: user.name,
      email: user.email,
      points: user.points,
      isAdmin: user.isAdmin,
      token: generateToken(user._id),
    });
  } else {
    res.status(401).json({ message: 'Invalid email or password' });
  }
};
const getUserProfile = async (req, res) => {
  res.json(req.user);
};
const addUserPoints = async (req, res) => {
  const pointsToAdd = 10;
  try {
    const user = await User.findById(req.user._id);
    if (user) {
      user.points = user.points + pointsToAdd;
      const updatedUser = await user.save();
      res.json({
        _id: updatedUser._id,
        name: updatedUser.name,
        email: updatedUser.email,
        points: updatedUser.points,
        isAdmin: updatedUser.isAdmin,
        token: req.headers.authorization.split(' ')[1]
      });
    } else {
      res.status(404).json({ message: 'User not found' });
    }
  } catch (error) {
    res.status(500).json({ message: 'Server error while adding points.' });
  }
};

const getLeaderboard = async (req, res) => {
    try {
        const topUsers = await User.find({})
            .sort({ points: -1 }) // Sort by points in descending order
            .limit(10) // Get the top 10 users
            .select('name points'); // Only select the name and points fields
        
        res.json(topUsers);
    } catch (error) {
        res.status(500).json({ message: 'Server error while fetching leaderboard.' });
    }
};


export { registerUser, loginUser, getUserProfile, verifyUserEmail, addUserPoints, getLeaderboard };
