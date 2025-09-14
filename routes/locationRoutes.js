import express from 'express';
import { getLocations, getNearbyLocations } from '../controllers/locationController.js';

const router = express.Router();

router.route('/').get(getLocations);
router.route('/nearby').get(getNearbyLocations); 

export default router;
