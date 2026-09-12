import express from 'express';
import { validateCoupon, getAvailableCoupons } from '../controllers/coupon.controller.js';

const router = express.Router();

router.get('/', getAvailableCoupons);
router.post('/validate', validateCoupon);

export default router;
