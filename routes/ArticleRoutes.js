import express from 'express';
import multer from 'multer';
import {
    getArticles,
    getArticleById,
    createArticle,
    deleteArticle
} from '../controllers/ArticleController.js';
import { protect, admin } from '../middleware/authMiddleware.js';
import { storage } from '../config/cloudinary.js'; 

const router = express.Router();
const upload = multer({ storage });

// Public routes
router.route('/').get(getArticles);
router.route('/:id').get(getArticleById);

// Admin-only routes
router.route('/').post(protect, admin, upload.single('image'), createArticle);
router.route('/:id').delete(protect, admin, deleteArticle);

export default router;
