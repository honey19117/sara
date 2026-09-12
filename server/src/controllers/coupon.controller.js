import { get, all } from '../config/db.js';

export const validateCoupon = async (req, res, next) => {
  try {
    const { code, cartSubtotal = 0 } = req.body;

    if (!code || typeof code !== 'string') {
      return res.status(400).json({ success: false, message: 'Please provide a coupon code.' });
    }

    const coupon = await get('SELECT * FROM coupons WHERE UPPER(code) = UPPER(?) AND is_active = 1', [code.trim()]);
    if (!coupon) {
      return res.status(404).json({ success: false, message: 'Invalid or inactive promo coupon code.' });
    }

    if (coupon.expires_at && new Date(coupon.expires_at) < new Date()) {
      return res.status(400).json({ success: false, message: 'This coupon code has expired.' });
    }

    if (coupon.usage_limit && coupon.times_used >= coupon.usage_limit) {
      return res.status(400).json({ success: false, message: 'This coupon code has reached its usage limit.' });
    }

    const subtotal = parseFloat(cartSubtotal) || 0;
    if (subtotal < coupon.min_order_amount) {
      return res.status(400).json({
        success: false,
        message: `This coupon requires a minimum cart subtotal of ₹${coupon.min_order_amount.toLocaleString('en-IN')}.`
      });
    }

    let discountAmount = 0;
    if (coupon.discount_type === 'percentage') {
      discountAmount = (subtotal * coupon.discount_value) / 100;
      if (coupon.max_discount && discountAmount > coupon.max_discount) {
        discountAmount = coupon.max_discount;
      }
    } else if (coupon.discount_type === 'fixed') {
      discountAmount = Math.min(coupon.discount_value, subtotal);
    }

    discountAmount = Math.round(discountAmount * 100) / 100;

    res.json({
      success: true,
      message: `Coupon "${coupon.code}" applied successfully!`,
      coupon: {
        code: coupon.code,
        description: coupon.description,
        discountType: coupon.discount_type,
        discountValue: coupon.discount_value,
        discountAmount
      }
    });
  } catch (error) {
    next(error);
  }
};

export const getAvailableCoupons = async (req, res, next) => {
  try {
    const coupons = await all(
      'SELECT code, description, discount_type, discount_value, min_order_amount, max_discount FROM coupons WHERE is_active = 1 AND (expires_at IS NULL OR expires_at > CURRENT_TIMESTAMP)'
    );
    res.json({ success: true, coupons });
  } catch (error) {
    next(error);
  }
};
