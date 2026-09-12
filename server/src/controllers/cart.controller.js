import { get } from '../config/db.js';

export const validateCart = async (req, res, next) => {
  try {
    const { items = [] } = req.body;

    if (!Array.isArray(items) || items.length === 0) {
      return res.json({
        success: true,
        items: [],
        subtotal: 0,
        isValid: true,
        warnings: []
      });
    }

    const validatedItems = [];
    const warnings = [];
    let subtotal = 0;
    let isValid = true;

    for (const item of items) {
      const product = await get(
        `SELECT p.id, p.name, p.slug, p.price, p.stock,
                (SELECT image_url FROM product_images WHERE product_id = p.id ORDER BY is_primary DESC LIMIT 1) as image_url
         FROM products p WHERE p.id = ?`,
        [item.productId]
      );

      if (!product) {
        warnings.push(`Item "${item.name || 'Unknown'}" is no longer available.`);
        isValid = false;
        continue;
      }

      let variant = null;
      let effectivePrice = product.price;
      let availableStock = product.stock;
      let variantName = null;

      if (item.variantId) {
        variant = await get('SELECT * FROM product_variants WHERE id = ? AND product_id = ?', [item.variantId, product.id]);
        if (variant) {
          effectivePrice = variant.price;
          availableStock = variant.stock;
          variantName = variant.name;
        }
      }

      let requestedQty = Math.max(1, parseInt(item.quantity) || 1);
      if (requestedQty > availableStock) {
        isValid = false;
        warnings.push(`Only ${availableStock} units of "${product.name}${variantName ? ` (${variantName})` : ''}" available.`);
        requestedQty = Math.max(0, availableStock);
      }

      const itemTotal = effectivePrice * requestedQty;
      subtotal += itemTotal;

      validatedItems.push({
        productId: product.id,
        variantId: variant ? variant.id : null,
        name: product.name,
        variantName: variantName || item.variantName || null,
        slug: product.slug,
        price: effectivePrice,
        quantity: requestedQty,
        stock: availableStock,
        imageUrl: product.image_url || item.imageUrl,
        total: itemTotal
      });
    }

    res.json({
      success: true,
      items: validatedItems,
      subtotal,
      isValid,
      warnings
    });
  } catch (error) {
    next(error);
  }
};
