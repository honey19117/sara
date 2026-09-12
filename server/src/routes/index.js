import express from 'express';
import authRoutes from './auth.routes.js';
import productRoutes from './product.routes.js';
import categoryRoutes from './category.routes.js';
import cartRoutes from './cart.routes.js';
import couponRoutes from './coupon.routes.js';
import shippingRoutes from './shipping.routes.js';
import paymentRoutes from './payment.routes.js';
import orderRoutes from './order.routes.js';
import reviewRoutes from './review.routes.js';
import adminRoutes from './admin.routes.js';

const router = express.Router();

router.use('/auth', authRoutes);
router.use('/products', productRoutes);
router.use('/categories', categoryRoutes);
router.use('/cart', cartRoutes);
router.use('/coupons', couponRoutes);
router.use('/shipping', shippingRoutes);
router.use('/payment', paymentRoutes);
router.use('/orders', orderRoutes);
router.use('/reviews', reviewRoutes);
router.use('/admin', adminRoutes);

// Health check endpoint
router.get('/health', (req, res) => {
  res.json({
    status: 'healthy',
    platform: 'AURA Luxe E-Commerce Platform',
    timestamp: new Date().toISOString(),
    version: '1.0.0'
  });
});

export default router;
