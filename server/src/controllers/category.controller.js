import { all, get } from '../config/db.js';

export const getCategories = async (req, res, next) => {
  try {
    const categories = await all(`
      SELECT c.*, COUNT(p.id) as product_count
      FROM categories c
      LEFT JOIN products p ON c.id = p.category_id
      GROUP BY c.id
      ORDER BY c.is_featured DESC, c.name ASC
    `);
    res.json({ success: true, categories });
  } catch (error) {
    next(error);
  }
};

export const getCategoryBySlug = async (req, res, next) => {
  try {
    const { slug } = req.params;
    const category = await get('SELECT * FROM categories WHERE slug = ? OR id = ?', [slug, slug]);
    if (!category) {
      return res.status(404).json({ success: false, message: 'Category not found.' });
    }
    res.json({ success: true, category });
  } catch (error) {
    next(error);
  }
};
