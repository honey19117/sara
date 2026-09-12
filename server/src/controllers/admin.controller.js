import { all, get, run } from '../config/db.js';

export const getDashboardStats = async (req, res, next) => {
  try {
    const revenueStat = await get("SELECT SUM(total_amount) as totalRevenue FROM orders WHERE payment_status = 'PAID'");
    const totalOrdersStat = await get("SELECT COUNT(*) as totalOrders FROM orders");
    const totalCustomersStat = await get("SELECT COUNT(*) as totalCustomers FROM users WHERE role = 'customer'");
    const lowStockStat = await get("SELECT COUNT(*) as lowStockCount FROM products WHERE stock < 10");

    // Orders by Status
    const ordersByStatus = await all(
      "SELECT status, COUNT(*) as count FROM orders GROUP BY status"
    );

    // Recent 10 Orders
    const recentOrders = await all(
      `SELECT o.*, u.name as customer_name, u.email as customer_email
       FROM orders o
       LEFT JOIN users u ON o.user_id = u.id
       ORDER BY o.created_at DESC
       LIMIT 10`
    );

    // Top Selling Products
    const topProducts = await all(
      `SELECT p.id, p.name, p.price, p.stock,
              SUM(oi.quantity) as total_sold,
              SUM(oi.price * oi.quantity) as total_revenue,
              (SELECT image_url FROM product_images WHERE product_id = p.id ORDER BY is_primary DESC LIMIT 1) as image_url
       FROM order_items oi
       JOIN products p ON oi.product_id = p.id
       JOIN orders o ON oi.order_id = o.id
       WHERE o.payment_status = 'PAID'
       GROUP BY p.id
       ORDER BY total_sold DESC
       LIMIT 5`
    );

    res.json({
      success: true,
      stats: {
        totalRevenue: revenueStat?.totalRevenue || 0,
        totalOrders: totalOrdersStat?.totalOrders || 0,
        totalCustomers: totalCustomersStat?.totalCustomers || 0,
        lowStockCount: lowStockStat?.lowStockCount || 0,
        ordersByStatus,
        recentOrders: recentOrders.map(o => ({
          ...o,
          shippingAddress: JSON.parse(o.shipping_address_json || '{}')
        })),
        topProducts
      }
    });
  } catch (error) {
    next(error);
  }
};

// --- Products CRUD ---
export const adminGetProducts = async (req, res, next) => {
  try {
    const products = await all(`
      SELECT p.*, c.name as category_name,
             (SELECT image_url FROM product_images WHERE product_id = p.id ORDER BY is_primary DESC LIMIT 1) as primary_image,
             (SELECT COUNT(*) FROM product_variants WHERE product_id = p.id) as variants_count
      FROM products p
      LEFT JOIN categories c ON p.category_id = c.id
      ORDER BY p.id DESC
    `);
    res.json({ success: true, products });
  } catch (error) {
    next(error);
  }
};

export const adminCreateProduct = async (req, res, next) => {
  try {
    const {
      name, slug, category_id, description, short_description, price, compare_price,
      discount_percent, sku, stock, is_featured, is_trending, is_new_arrival, images = [], variants = []
    } = req.body;

    if (!name || !price || !sku) {
      return res.status(400).json({ success: false, message: 'Name, price, and SKU are required.' });
    }

    const finalSlug = slug || name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');

    const result = await run(
      `INSERT INTO products (
        category_id, name, slug, description, short_description, price, compare_price,
        discount_percent, sku, stock, is_featured, is_trending, is_new_arrival
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        category_id || null, name, finalSlug, description || '', short_description || '',
        parseFloat(price), compare_price ? parseFloat(compare_price) : null,
        discount_percent || 0, sku, parseInt(stock) || 0,
        is_featured ? 1 : 0, is_trending ? 1 : 0, is_new_arrival ? 1 : 0
      ]
    );

    const productId = result.lastID;

    // Images
    for (let i = 0; i < images.length; i++) {
      const img = typeof images[i] === 'string' ? { url: images[i] } : images[i];
      await run(
        'INSERT INTO product_images (product_id, image_url, is_primary, display_order) VALUES (?, ?, ?, ?)',
        [productId, img.url || img.image_url, i === 0 ? 1 : 0, i]
      );
    }

    // Variants
    for (const v of variants) {
      await run(
        'INSERT INTO product_variants (product_id, name, size, color, color_code, sku, price, stock) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
        [productId, v.name, v.size || null, v.color || null, v.color_code || null, v.sku || null, parseFloat(v.price) || parseFloat(price), parseInt(v.stock) || 0]
      );
    }

    res.status(201).json({ success: true, message: 'Product created successfully.', productId });
  } catch (error) {
    next(error);
  }
};

export const adminUpdateProduct = async (req, res, next) => {
  try {
    const { id } = req.params;
    const {
      name, slug, category_id, description, short_description, price, compare_price,
      discount_percent, sku, stock, is_featured, is_trending, is_new_arrival
    } = req.body;

    await run(
      `UPDATE products SET
        category_id = ?, name = ?, slug = ?, description = ?, short_description = ?,
        price = ?, compare_price = ?, discount_percent = ?, sku = ?, stock = ?,
        is_featured = ?, is_trending = ?, is_new_arrival = ?, updated_at = CURRENT_TIMESTAMP
       WHERE id = ?`,
      [
        category_id || null, name, slug, description, short_description,
        parseFloat(price), compare_price ? parseFloat(compare_price) : null,
        discount_percent || 0, sku, parseInt(stock) || 0,
        is_featured ? 1 : 0, is_trending ? 1 : 0, is_new_arrival ? 1 : 0,
        id
      ]
    );

    res.json({ success: true, message: 'Product updated successfully.' });
  } catch (error) {
    next(error);
  }
};

export const adminDeleteProduct = async (req, res, next) => {
  try {
    const { id } = req.params;
    await run('DELETE FROM products WHERE id = ?', [id]);
    res.json({ success: true, message: 'Product deleted.' });
  } catch (error) {
    next(error);
  }
};

// --- Orders Management ---
export const adminGetOrders = async (req, res, next) => {
  try {
    const { status } = req.query;
    let sql = `
      SELECT o.*, u.name as customer_name, u.email as customer_email
      FROM orders o
      LEFT JOIN users u ON o.user_id = u.id
    `;
    const params = [];

    if (status && status !== 'ALL') {
      sql += ' WHERE o.status = ?';
      params.push(status);
    }
    sql += ' ORDER BY o.created_at DESC';

    const orders = await all(sql, params);
    const detailedOrders = await Promise.all(
      orders.map(async (order) => {
        const items = await all('SELECT * FROM order_items WHERE order_id = ?', [order.id]);
        return {
          ...order,
          shippingAddress: JSON.parse(order.shipping_address_json || '{}'),
          items
        };
      })
    );

    res.json({ success: true, orders: detailedOrders });
  } catch (error) {
    next(error);
  }
};

export const adminUpdateOrderStatus = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { status, trackingNumber, carrierName } = req.body;

    const validStatuses = ['PENDING', 'CONFIRMED', 'PROCESSING', 'PACKED', 'SHIPPED', 'OUT FOR DELIVERY', 'DELIVERED', 'CANCELLED', 'RETURNED'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ success: false, message: 'Invalid order status transition.' });
    }

    let sql = 'UPDATE orders SET status = ?, updated_at = CURRENT_TIMESTAMP';
    const params = [status];

    if (trackingNumber) {
      sql += ', tracking_number = ?';
      params.push(trackingNumber);
    }
    if (carrierName) {
      sql += ', carrier_name = ?';
      params.push(carrierName);
    }
    if (status === 'DELIVERED') {
      sql += ", payment_status = 'PAID'";
    }

    sql += ' WHERE id = ?';
    params.push(id);

    await run(sql, params);

    res.json({ success: true, message: `Order status updated to ${status}.` });
  } catch (error) {
    next(error);
  }
};

// --- Coupons Management ---
export const adminGetCoupons = async (req, res, next) => {
  try {
    const coupons = await all('SELECT * FROM coupons ORDER BY id DESC');
    res.json({ success: true, coupons });
  } catch (error) {
    next(error);
  }
};

export const adminCreateCoupon = async (req, res, next) => {
  try {
    const { code, description, discount_type, discount_value, min_order_amount, max_discount, usage_limit, expires_at } = req.body;
    await run(
      `INSERT INTO coupons (code, description, discount_type, discount_value, min_order_amount, max_discount, usage_limit, expires_at, is_active)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, 1)`,
      [code.trim().toUpperCase(), description, discount_type, parseFloat(discount_value), parseFloat(min_order_amount) || 0, max_discount ? parseFloat(max_discount) : null, usage_limit ? parseInt(usage_limit) : null, expires_at || null]
    );
    res.status(201).json({ success: true, message: 'Coupon created.' });
  } catch (error) {
    next(error);
  }
};

export const adminToggleCoupon = async (req, res, next) => {
  try {
    const { id } = req.params;
    await run('UPDATE coupons SET is_active = (CASE WHEN is_active = 1 THEN 0 ELSE 1 END) WHERE id = ?', [id]);
    res.json({ success: true, message: 'Coupon status toggled.' });
  } catch (error) {
    next(error);
  }
};

export const adminDeleteCoupon = async (req, res, next) => {
  try {
    const { id } = req.params;
    await run('DELETE FROM coupons WHERE id = ?', [id]);
    res.json({ success: true, message: 'Coupon deleted.' });
  } catch (error) {
    next(error);
  }
};

// --- Reviews Management ---
export const adminGetReviews = async (req, res, next) => {
  try {
    const reviews = await all(`
      SELECT r.*, p.name as product_name, p.slug as product_slug
      FROM reviews r
      JOIN products p ON r.product_id = p.id
      ORDER BY r.created_at DESC
    `);
    res.json({ success: true, reviews });
  } catch (error) {
    next(error);
  }
};

export const adminToggleReview = async (req, res, next) => {
  try {
    const { id } = req.params;
    await run('UPDATE reviews SET is_approved = (CASE WHEN is_approved = 1 THEN 0 ELSE 1 END) WHERE id = ?', [id]);
    res.json({ success: true, message: 'Review approval toggled.' });
  } catch (error) {
    next(error);
  }
};

export const adminDeleteReview = async (req, res, next) => {
  try {
    const { id } = req.params;
    await run('DELETE FROM reviews WHERE id = ?', [id]);
    res.json({ success: true, message: 'Review deleted.' });
  } catch (error) {
    next(error);
  }
};

// --- Settings ---
export const adminGetSettings = async (req, res, next) => {
  try {
    const rows = await all('SELECT * FROM settings');
    const settings = {};
    rows.forEach(r => { settings[r.key] = r.value; });
    res.json({ success: true, settings });
  } catch (error) {
    next(error);
  }
};

export const adminUpdateSettings = async (req, res, next) => {
  try {
    const settings = req.body;
    for (const [key, value] of Object.entries(settings)) {
      await run(
        'INSERT OR REPLACE INTO settings (key, value, updated_at) VALUES (?, ?, CURRENT_TIMESTAMP)',
        [key, String(value)]
      );
    }
    res.json({ success: true, message: 'Settings updated successfully.' });
  } catch (error) {
    next(error);
  }
};
