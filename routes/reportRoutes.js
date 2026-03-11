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

import { 
  sendDailyAdminReport,
  sendPickupReminders,
  autoCloseOldReports,
  sendWeeklyUserSummaries
} from '../jobs/cronJobs.js';

const router = express.Router();
const upload = multer({ storage });

router.route('/')
  .get(protect, admin, getReports)
  .post(protect, upload.single('image'), createReport);

router.route('/email-summary').post(protect, admin, emailReportSummary);

router.route('/:id')
  .put(protect, admin, updateReportStatus)
  .delete(protect, admin, deleteReport);

router.get('/cron/admin-report', async (req, res) => {
  try {
    await sendDailyAdminReport();
    res.json({ success: true, message: 'Admin report sent successfully' });
  } catch (error) {
    console.error('Cron endpoint error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

router.get('/cron/pickup-reminders', async (req, res) => {
  try {
    await sendPickupReminders();
    res.json({ success: true, message: 'Pickup reminders sent successfully' });
  } catch (error) {
    console.error('Cron endpoint error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

router.get('/cron/auto-close', async (req, res) => {
  try {
    await autoCloseOldReports();
    res.json({ success: true, message: 'Old reports closed successfully' });
  } catch (error) {
    console.error('Cron endpoint error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

router.get('/cron/weekly-summary', async (req, res) => {
  try {
    await sendWeeklyUserSummaries();
    res.json({ success: true, message: 'Weekly summaries sent successfully' });
  } catch (error) {
    console.error('Cron endpoint error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

export default router;

