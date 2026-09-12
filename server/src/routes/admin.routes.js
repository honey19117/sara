import express from 'express';
import {
  getDashboardStats,
  adminGetProducts,
  adminCreateProduct,
  adminUpdateProduct,
  adminDeleteProduct,
  adminGetOrders,
  adminUpdateOrderStatus,
  adminGetCoupons,
  adminCreateCoupon,
  adminToggleCoupon,
  adminDeleteCoupon,
  adminGetReviews,
  adminToggleReview,
  adminDeleteReview,
  adminGetSettings,
  adminUpdateSettings
} from '../controllers/admin.controller.js';
import { authenticateToken, requireAdmin } from '../middleware/auth.js';

const router = express.Router();

// Protect all admin routes
router.use(authenticateToken, requireAdmin);

// Dashboard Analytics
router.get('/stats', getDashboardStats);

// Products
router.get('/products', adminGetProducts);
router.post('/products', adminCreateProduct);
router.put('/products/:id', adminUpdateProduct);
router.delete('/products/:id', adminDeleteProduct);

// Orders
router.get('/orders', adminGetOrders);
router.put('/orders/:id/status', adminUpdateOrderStatus);

// Coupons
router.get('/coupons', adminGetCoupons);
router.post('/coupons', adminCreateCoupon);
router.patch('/coupons/:id/toggle', adminToggleCoupon);
router.delete('/coupons/:id', adminDeleteCoupon);

// Reviews
router.get('/reviews', adminGetReviews);
router.patch('/reviews/:id/toggle', adminToggleReview);
router.delete('/reviews/:id', adminDeleteReview);

// Store Settings
router.get('/settings', adminGetSettings);
router.put('/settings', adminUpdateSettings);

export default router;
