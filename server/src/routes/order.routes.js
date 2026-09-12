import express from 'express';
import {
  getUserOrders,
  getOrderByNumber,
  trackOrder,
  cancelOrder,
  requestReturn
} from '../controllers/order.controller.js';
import { authenticateToken, optionalAuth } from '../middleware/auth.js';

const router = express.Router();

router.get('/my-orders', authenticateToken, getUserOrders);
router.get('/track/:orderNumber', trackOrder);
router.get('/:orderNumber', optionalAuth, getOrderByNumber);
router.post('/:orderNumber/cancel', authenticateToken, cancelOrder);
router.post('/:orderNumber/return', authenticateToken, requestReturn);

export default router;
