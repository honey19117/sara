import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { useToast } from './ToastContext';

const WishlistContext = createContext(null);

export const WishlistProvider = ({ children }) => {
  const [wishlist, setWishlist] = useState(() => {
    try {
      const saved = localStorage.getItem('aura_wishlist_items');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const { showSuccess, showInfo } = useToast();

  useEffect(() => {
    localStorage.setItem('aura_wishlist_items', JSON.stringify(wishlist));
  }, [wishlist]);

  const isInWishlist = useCallback(
    (productId) => wishlist.some((item) => item.id === productId),
    [wishlist]
  );

  const toggleWishlist = useCallback(
    (product) => {
      setWishlist((prev) => {
        const exists = prev.some((item) => item.id === product.id);
        if (exists) {
          showInfo(`Removed "${product.name}" from your wishlist.`);
          return prev.filter((item) => item.id !== product.id);
        } else {
          showSuccess(`Saved "${product.name}" to your wishlist.`);
          return [...prev, product];
        }
      });
    },
    [showSuccess, showInfo]
  );

  const removeFromWishlist = useCallback(
    (productId) => {
      setWishlist((prev) => prev.filter((item) => item.id !== productId));
      showInfo('Item removed from wishlist.');
    },
    [showInfo]
  );

  const clearWishlist = useCallback(() => {
    setWishlist([]);
    localStorage.removeItem('aura_wishlist_items');
  }, []);

  return (
    <WishlistContext.Provider
      value={{
        wishlist,
        wishlistCount: wishlist.length,
        isInWishlist,
        toggleWishlist,
        removeFromWishlist,
        clearWishlist
      }}
    >
      {children}
    </WishlistContext.Provider>
  );
};

export const useWishlist = () => {
  const context = useContext(WishlistContext);
  if (!context) {
    throw new Error('useWishlist must be used within a WishlistProvider');
  }
  return context;
};
