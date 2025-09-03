// backend/routes/locationRoutes.js

import express from 'express';
import { getLocations } from '../controllers/locationController.js';

const router = express.Router();

router.route('/').get(getLocations);

export default router;