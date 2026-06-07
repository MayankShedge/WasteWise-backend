import express from 'express';
import {
  getLocations,
  getNearbyLocations,
  getReportClusters,
  createLocation,
  updateLocation,
  deleteLocation,
} from '../controllers/locationController.js';
import { protect, admin } from '../middleware/authMiddleware.js';

const router = express.Router();

router.get('/',                getLocations);
router.get('/nearby',          getNearbyLocations);
router.get('/report-clusters', getReportClusters);

router.post('/',           protect, admin, createLocation);
router.put('/:id',         protect, admin, updateLocation);
router.delete('/:id',      protect, admin, deleteLocation);

export default router;