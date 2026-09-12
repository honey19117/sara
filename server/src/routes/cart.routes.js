import express from 'express';
import { validateCart } from '../controllers/cart.controller.js';

const router = express.Router();

router.post('/validate', validateCart);

export default router;
