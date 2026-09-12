import express from 'express';
import { addReview, getProductReviews } from '../controllers/review.controller.js';
import { optionalAuth } from '../middleware/auth.js';

const router = express.Router();

router.get('/product/:productId', getProductReviews);
router.post('/', optionalAuth, addReview);

export default router;
