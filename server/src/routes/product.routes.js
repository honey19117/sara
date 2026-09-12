import express from 'express';
import {
  getProducts,
  getProductBySlug,
  getFeaturedProducts,
  getTrendingProducts
} from '../controllers/product.controller.js';

const router = express.Router();

router.get('/', getProducts);
router.get('/featured', getFeaturedProducts);
router.get('/trending', getTrendingProducts);
router.get('/:slug', getProductBySlug);

export default router;
