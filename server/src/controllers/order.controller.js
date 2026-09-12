import { all, get, run } from '../config/db.js';

export const getUserOrders = async (req, res, next) => {
  try {
    const orders = await all(
      'SELECT * FROM orders WHERE user_id = ? ORDER BY created_at DESC',
      [req.user.id]
    );

    const ordersWithItems = await Promise.all(
      orders.map(async (order) => {
        const items = await all('SELECT * FROM order_items WHERE order_id = ?', [order.id]);
        return {
          ...order,
          shippingAddress: JSON.parse(order.shipping_address_json),
          items
        };
      })
    );

    res.json({ success: true, orders: ordersWithItems });
  } catch (error) {
    next(error);
  }
};

export const getOrderByNumber = async (req, res, next) => {
  try {
    const { orderNumber } = req.params;

    const order = await get('SELECT * FROM orders WHERE order_number = ?', [orderNumber]);
    if (!order) {
      return res.status(404).json({ success: false, message: 'Order not found.' });
    }

    // Auth check: allow if admin, or owner of order, or guest order
    if (req.user && req.user.role !== 'admin' && order.user_id && order.user_id !== req.user.id) {
      return res.status(403).json({ success: false, message: 'Unauthorized access to this order.' });
    }

    const items = await all('SELECT * FROM order_items WHERE order_id = ?', [order.id]);
    const payment = await get('SELECT * FROM payments WHERE order_id = ?', [order.id]);

    res.json({
      success: true,
      order: {
        ...order,
        shippingAddress: JSON.parse(order.shipping_address_json),
        items,
        payment
      }
    });
  } catch (error) {
    next(error);
  }
};

export const trackOrder = async (req, res, next) => {
  try {
    const { orderNumber } = req.params;

    const order = await get(
      'SELECT id, order_number, status, payment_status, tracking_number, carrier_name, estimated_delivery, created_at, updated_at, shipping_address_json FROM orders WHERE order_number = ?',
      [orderNumber.trim()]
    );

    if (!order) {
      return res.status(404).json({ success: false, message: `No order found with number "${orderNumber}".` });
    }

    const items = await all('SELECT product_name, variant_name, quantity, price, image_url FROM order_items WHERE order_id = ?', [order.id]);

    const statusProgression = [
      { key: 'PENDING', label: 'Order Placed', desc: 'Order received and awaiting verification' },
      { key: 'CONFIRMED', label: 'Payment Confirmed', desc: 'Payment verified and sent to fulfillment' },
      { key: 'PROCESSING', label: 'Processing', desc: 'Curating items from premium warehouse vault' },
      { key: 'PACKED', label: 'Custom Luxury Packed', desc: 'Sealed with tamper-evident security ribbon' },
      { key: 'SHIPPED', label: 'Shipped', desc: `Handed over to ${order.carrier_name || 'Express Logistics'}` },
      { key: 'OUT FOR DELIVERY', label: 'Out for Delivery', desc: 'Courier agent en route to your delivery address' },
      { key: 'DELIVERED', label: 'Delivered', desc: 'Package safely delivered with signature verification' }
    ];

    const currentIdx = statusProgression.findIndex(s => s.key === order.status);
    const steps = statusProgression.map((step, idx) => ({
      ...step,
      isCompleted: idx <= currentIdx,
      isCurrent: idx === currentIdx,
      timestamp: idx <= currentIdx ? order.updated_at : null
    }));

    res.json({
      success: true,
      order: {
        orderNumber: order.order_number,
        status: order.status,
        paymentStatus: order.payment_status,
        trackingNumber: order.tracking_number,
        carrierName: order.carrier_name,
        estimatedDelivery: order.estimated_delivery,
        createdAt: order.created_at,
        shippingAddress: JSON.parse(order.shipping_address_json),
        items,
        steps
      }
    });
  } catch (error) {
    next(error);
  }
};

export const cancelOrder = async (req, res, next) => {
  try {
    const { orderNumber } = req.params;
    const { reason } = req.body;

    const order = await get('SELECT * FROM orders WHERE order_number = ?', [orderNumber]);
    if (!order) {
      return res.status(404).json({ success: false, message: 'Order not found.' });
    }

    if (req.user.role !== 'admin' && order.user_id !== req.user.id) {
      return res.status(403).json({ success: false, message: 'Unauthorized.' });
    }

    if (['SHIPPED', 'OUT FOR DELIVERY', 'DELIVERED'].includes(order.status)) {
      return res.status(400).json({
        success: false,
        message: `Order cannot be cancelled because it is already ${order.status.toLowerCase()}. You may request a return upon delivery.`
      });
    }

    // Restore inventory
    const items = await all('SELECT product_id, variant_id, quantity FROM order_items WHERE order_id = ?', [order.id]);
    for (const item of items) {
      if (item.product_id) {
        await run('UPDATE products SET stock = stock + ? WHERE id = ?', [item.quantity, item.product_id]);
      }
      if (item.variant_id) {
        await run('UPDATE product_variants SET stock = stock + ? WHERE id = ?', [item.quantity, item.variant_id]);
      }
    }

    await run(
      `UPDATE orders SET status = 'CANCELLED', notes = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?`,
      [`Cancelled by customer. Reason: ${reason || 'Not specified'}`, order.id]
    );

    res.json({ success: true, message: 'Order has been successfully cancelled and stock restored.' });
  } catch (error) {
    next(error);
  }
};

export const requestReturn = async (req, res, next) => {
  try {
    const { orderNumber } = req.params;
    const { reason } = req.body;

    if (!reason) {
      return res.status(400).json({ success: false, message: 'Please provide a reason for return/refund request.' });
    }

    const order = await get('SELECT * FROM orders WHERE order_number = ?', [orderNumber]);
    if (!order) {
      return res.status(404).json({ success: false, message: 'Order not found.' });
    }

    if (req.user.role !== 'admin' && order.user_id !== req.user.id) {
      return res.status(403).json({ success: false, message: 'Unauthorized.' });
    }

    await run(
      `UPDATE orders SET return_requested = 1, return_reason = ?, refund_status = 'REQUESTED', updated_at = CURRENT_TIMESTAMP WHERE id = ?`,
      [reason, order.id]
    );

    res.json({
      success: true,
      message: 'Return & refund request received. Our luxury concierge team will arrange pick-up within 24-48 hours.'
    });
  } catch (error) {
    next(error);
  }
};
