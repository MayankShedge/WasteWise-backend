import express from 'express';
import { getLocations, getNearbyLocations, getReportClusters } from '../controllers/locationController.js';

const router = express.Router();

router.route('/').get(getLocations);
router.route('/nearby').get(getNearbyLocations);
router.route('/report-clusters').get(getReportClusters);   // 👈 new

export default router;