import express from 'express';
import multer from 'multer';
import {
  createReport,
  getReports,
  updateReportStatus,
  deleteReport,
  emailReportSummary, // 1. Import the new controller function
} from '../controllers/reportController.js';
import { protect, admin } from '../middleware/authMiddleware.js';
import { storage } from '../config/cloudinary.js';

const router = express.Router();
const upload = multer({ storage });

// Routes for the base path ('/')
router.route('/')
  .get(protect, admin, getReports)
  .post(protect, upload.single('image'), createReport);

// 2. Add the new route for emailing the summary
router.route('/email-summary').post(protect, admin, emailReportSummary);

// Routes for a specific report ID ('/:id')
router.route('/:id')
  .put(protect, admin, updateReportStatus)
  .delete(protect, admin, deleteReport);

export default router;

