import React, { createContext, useContext, useState, useEffect, useMemo, useCallback } from 'react';
import { api } from '../services/api';
import { useToast } from './ToastContext';

const CartContext = createContext(null);

export const CartProvider = ({ children }) => {
  const [items, setItems] = useState(() => {
    try {
      const saved = localStorage.getItem('aura_cart_items');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const [coupon, setCoupon] = useState(() => {
    try {
      const saved = localStorage.getItem('aura_cart_coupon');
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });

  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const { showSuccess, showError, showInfo } = useToast();

  // Persist items
  useEffect(() => {
    localStorage.setItem('aura_cart_items', JSON.stringify(items));
  }, [items]);

  // Persist coupon
  useEffect(() => {
    if (coupon) {
      localStorage.setItem('aura_cart_coupon', JSON.stringify(coupon));
    } else {
      localStorage.removeItem('aura_cart_coupon');
    }
  }, [coupon]);

  const addToCart = useCallback((product, variant = null, quantity = 1) => {
    const qty = Math.max(1, parseInt(quantity) || 1);
    const effectivePrice = variant ? variant.price : product.price;
    const availableStock = variant ? variant.stock : product.stock;
    const primaryImg = product.primary_image || (product.images && product.images[0]?.image_url) || product.image_url;

    setItems((prevItems) => {
      const existingIndex = prevItems.findIndex(
        (i) => i.productId === product.id && i.variantId === (variant ? variant.id : null)
      );

      if (existingIndex > -1) {
        const existingItem = prevItems[existingIndex];
        const newQty = existingItem.quantity + qty;

        if (newQty > availableStock) {
          showError(`Cannot add more. Only ${availableStock} units available.`);
          return prevItems;
        }

        const updated = [...prevItems];
        updated[existingIndex] = {
          ...existingItem,
          quantity: newQty,
          price: effectivePrice,
          stock: availableStock
        };
        showSuccess(`Updated ${product.name} quantity to ${newQty}`);
        return updated;
      } else {
        if (qty > availableStock) {
          showError(`Only ${availableStock} units in stock.`);
          return prevItems;
        }

        showSuccess(`Added "${product.name}" to your shopping bag.`);
        return [
          ...prevItems,
          {
            productId: product.id,
            variantId: variant ? variant.id : null,
            name: product.name,
            variantName: variant ? variant.name : null,
            slug: product.slug,
            price: effectivePrice,
            quantity: qty,
            stock: availableStock,
            imageUrl: primaryImg
          }
        ];
      }
    });

    setIsDrawerOpen(true);
  }, [showSuccess, showError]);

  const removeFromCart = useCallback((productId, variantId = null) => {
    setItems((prev) => prev.filter((i) => !(i.productId === productId && i.variantId === variantId)));
    showInfo('Item removed from shopping bag.');
  }, [showInfo]);

  const updateQuantity = useCallback((productId, variantId = null, newQty) => {
    if (newQty <= 0) {
      removeFromCart(productId, variantId);
      return;
    }

    setItems((prev) =>
      prev.map((item) => {
        if (item.productId === productId && item.variantId === variantId) {
          if (newQty > item.stock) {
            showError(`Maximum stock limit is ${item.stock} units.`);
            return item;
          }
          return { ...item, quantity: newQty };
        }
        return item;
      })
    );
  }, [removeFromCart, showError]);

  const clearCart = useCallback(() => {
    setItems([]);
    setCoupon(null);
    localStorage.removeItem('aura_cart_items');
    localStorage.removeItem('aura_cart_coupon');
  }, []);

  // Calculate cart subtotal
  const cartSubtotal = useMemo(() => {
    return items.reduce((acc, item) => acc + item.price * item.quantity, 0);
  }, [items]);

  // Calculate discount amount from applied coupon
  const discountAmount = useMemo(() => {
    if (!coupon || cartSubtotal <= 0) return 0;
    if (coupon.discountType === 'percentage') {
      const computed = (cartSubtotal * coupon.discountValue) / 100;
      return coupon.maxDiscount ? Math.min(computed, coupon.maxDiscount) : computed;
    }
    return Math.min(coupon.discountValue, cartSubtotal);
  }, [coupon, cartSubtotal]);

  const cartCount = useMemo(() => {
    return items.reduce((sum, item) => sum + item.quantity, 0);
  }, [items]);

  const applyCoupon = async (code) => {
    try {
      const data = await api.validateCoupon(code, cartSubtotal);
      if (data.success) {
        setCoupon(data.coupon);
        showSuccess(data.message);
        return data.coupon;
      }
    } catch (error) {
      showError(error.message || 'Invalid coupon code.');
      throw error;
    }
  };

  const removeCoupon = () => {
    setCoupon(null);
    showInfo('Coupon code removed.');
  };

  const openDrawer = () => setIsDrawerOpen(true);
  const closeDrawer = () => setIsDrawerOpen(false);

  const value = {
    items,
    cartCount,
    cartSubtotal,
    discountAmount,
    coupon,
    isDrawerOpen,
    openDrawer,
    closeDrawer,
    addToCart,
    removeFromCart,
    updateQuantity,
    clearCart,
    applyCoupon,
    removeCoupon
  };

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};
