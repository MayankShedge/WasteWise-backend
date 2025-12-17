import express from 'express';
import { getGuideData } from '../controllers/guideController.js';

const router = express.Router();

router.route('/').get(getGuideData);

export default router;