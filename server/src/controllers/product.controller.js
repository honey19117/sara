import { all, get } from '../config/db.js';

export const getProducts = async (req, res, next) => {
  try {
    const {
      q,
      category,
      minPrice,
      maxPrice,
      rating,
      inStock,
      sort = 'newest',
      page = 1,
      limit = 12
    } = req.query;

    const offset = (parseInt(page) - 1) * parseInt(limit);
    const conditions = [];
    const params = [];

    if (q) {
      conditions.push('(p.name LIKE ? OR p.description LIKE ? OR p.sku LIKE ?)');
      const searchPattern = `%${q.trim()}%`;
      params.push(searchPattern, searchPattern, searchPattern);
    }

    if (category) {
      conditions.push('(c.slug = ? OR c.id = ?)');
      params.push(category, category);
    }

    if (minPrice) {
      conditions.push('p.price >= ?');
      params.push(parseFloat(minPrice));
    }

    if (maxPrice) {
      conditions.push('p.price <= ?');
      params.push(parseFloat(maxPrice));
    }

    if (rating) {
      conditions.push('p.rating >= ?');
      params.push(parseFloat(rating));
    }

    if (inStock === 'true' || inStock === '1') {
      conditions.push('p.stock > 0');
    }

    const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';

    let orderBy = 'p.created_at DESC';
    if (sort === 'price_asc') orderBy = 'p.price ASC';
    else if (sort === 'price_desc') orderBy = 'p.price DESC';
    else if (sort === 'rating') orderBy = 'p.rating DESC';
    else if (sort === 'popular') orderBy = 'p.reviews_count DESC, p.rating DESC';
    else if (sort === 'newest') orderBy = 'p.created_at DESC';

    // Total count query
    const countSql = `
      SELECT COUNT(DISTINCT p.id) as total
      FROM products p
      LEFT JOIN categories c ON p.category_id = c.id
      ${whereClause}
    `;
    const countResult = await get(countSql, params);
    const total = countResult ? countResult.total : 0;

    // Data query with primary image
    const dataSql = `
      SELECT 
        p.*,
        c.name as category_name,
        c.slug as category_slug,
        (SELECT image_url FROM product_images WHERE product_id = p.id ORDER BY is_primary DESC, display_order ASC LIMIT 1) as primary_image
      FROM products p
      LEFT JOIN categories c ON p.category_id = c.id
      ${whereClause}
      ORDER BY ${orderBy}
      LIMIT ? OFFSET ?
    `;

    const products = await all(dataSql, [...params, parseInt(limit), offset]);

    res.json({
      success: true,
      products,
      pagination: {
        total,
        page: parseInt(page),
        limit: parseInt(limit),
        totalPages: Math.ceil(total / parseInt(limit))
      }
    });
  } catch (error) {
    next(error);
  }
};

export const getProductBySlug = async (req, res, next) => {
  try {
    const { slug } = req.params;

    const product = await get(
      `SELECT p.*, c.name as category_name, c.slug as category_slug
       FROM products p
       LEFT JOIN categories c ON p.category_id = c.id
       WHERE p.slug = ? OR p.id = ?`,
      [slug, slug]
    );

    if (!product) {
      return res.status(404).json({ success: false, message: 'Product not found.' });
    }

    // Images
    const images = await all(
      'SELECT id, image_url, alt_text, is_primary FROM product_images WHERE product_id = ? ORDER BY is_primary DESC, display_order ASC',
      [product.id]
    );

    // Variants
    const variants = await all(
      'SELECT * FROM product_variants WHERE product_id = ? ORDER BY id ASC',
      [product.id]
    );

    // Approved Reviews
    const reviews = await all(
      'SELECT id, user_name, rating, title, comment, created_at FROM reviews WHERE product_id = ? AND is_approved = 1 ORDER BY created_at DESC',
      [product.id]
    );

    // Related products in same category
    const related = await all(
      `SELECT p.id, p.name, p.slug, p.price, p.compare_price, p.rating, p.reviews_count,
              (SELECT image_url FROM product_images WHERE product_id = p.id ORDER BY is_primary DESC LIMIT 1) as primary_image
       FROM products p
       WHERE p.category_id = ? AND p.id != ?
       LIMIT 4`,
      [product.category_id, product.id]
    );

    res.json({
      success: true,
      product: {
        ...product,
        images,
        variants,
        reviews,
        related
      }
    });
  } catch (error) {
    next(error);
  }
};

export const getFeaturedProducts = async (req, res, next) => {
  try {
    const products = await all(
      `SELECT p.*, c.name as category_name,
              (SELECT image_url FROM product_images WHERE product_id = p.id ORDER BY is_primary DESC LIMIT 1) as primary_image
       FROM products p
       LEFT JOIN categories c ON p.category_id = c.id
       WHERE p.is_featured = 1
       LIMIT 8`
    );
    res.json({ success: true, products });
  } catch (error) {
    next(error);
  }
};

export const getTrendingProducts = async (req, res, next) => {
  try {
    const products = await all(
      `SELECT p.*, c.name as category_name,
              (SELECT image_url FROM product_images WHERE product_id = p.id ORDER BY is_primary DESC LIMIT 1) as primary_image
       FROM products p
       LEFT JOIN categories c ON p.category_id = c.id
       WHERE p.is_trending = 1
       LIMIT 8`
    );
    res.json({ success: true, products });
  } catch (error) {
    next(error);
  }
};
