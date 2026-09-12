import express from 'express';
import { calculateShipping, validatePincode } from '../controllers/shipping.controller.js';

const router = express.Router();

router.post('/calculate', calculateShipping);
router.get('/pincode/:pincode', validatePincode);

export default router;
