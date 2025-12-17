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

router.route('/')
  .get(protect, admin, getReports)
  .post(protect, upload.single('image'), createReport);

router.route('/email-summary').post(protect, admin, emailReportSummary);

router.route('/:id')
  .put(protect, admin, updateReportStatus)
  .delete(protect, admin, deleteReport);

export default router;

