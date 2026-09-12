import { all, get, run } from '../config/db.js';

export const addReview = async (req, res, next) => {
  try {
    const { productId, rating, title, comment, userName } = req.body;

    if (!productId || !rating || !comment) {
      return res.status(400).json({ success: false, message: 'Rating, comment, and product ID are required.' });
    }

    const numericRating = Math.min(5, Math.max(1, parseInt(rating) || 5));
    const reviewerName = req.user ? req.user.name : (userName || 'Verified Connoisseur');
    const userId = req.user ? req.user.id : null;

    const result = await run(
      `INSERT INTO reviews (product_id, user_id, user_name, rating, title, comment, is_approved)
       VALUES (?, ?, ?, ?, ?, ?, 1)`,
      [productId, userId, reviewerName, numericRating, title || '', comment]
    );

    // Recalculate average rating & reviews_count on product
    const stats = await get(
      'SELECT AVG(rating) as avg_rating, COUNT(*) as total FROM reviews WHERE product_id = ? AND is_approved = 1',
      [productId]
    );

    const avgRating = stats.avg_rating ? Math.round(stats.avg_rating * 10) / 10 : numericRating;
    const totalCount = stats.total || 1;

    await run(
      'UPDATE products SET rating = ?, reviews_count = ? WHERE id = ?',
      [avgRating, totalCount, productId]
    );

    const savedReview = await get('SELECT * FROM reviews WHERE id = ?', [result.lastID]);

    res.status(201).json({
      success: true,
      message: 'Thank you! Your verified review has been published.',
      review: savedReview
    });
  } catch (error) {
    next(error);
  }
};

export const getProductReviews = async (req, res, next) => {
  try {
    const { productId } = req.params;

    const reviews = await all(
      'SELECT * FROM reviews WHERE product_id = ? AND is_approved = 1 ORDER BY created_at DESC',
      [productId]
    );

    const breakdown = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };
    reviews.forEach(r => {
      if (breakdown[r.rating] !== undefined) {
        breakdown[r.rating]++;
      }
    });

    res.json({
      success: true,
      total: reviews.length,
      breakdown,
      reviews
    });
  } catch (error) {
    next(error);
  }
};
