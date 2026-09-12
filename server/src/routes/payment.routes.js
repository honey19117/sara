import express from 'express';
import {
  getRazorpayKey,
  createRazorpayOrder,
  verifyPayment,
  recordPaymentFailure
} from '../controllers/payment.controller.js';
import { optionalAuth } from '../middleware/auth.js';

const router = express.Router();

router.get('/key', getRazorpayKey);
router.post('/create-order', optionalAuth, createRazorpayOrder);
router.post('/verify', optionalAuth, verifyPayment);
router.post('/failure', recordPaymentFailure);

export default router;
