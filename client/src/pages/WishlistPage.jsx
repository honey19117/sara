import React from 'react';
import { Link } from 'react-router-dom';
import { Heart, ArrowRight, ShoppingBag, Trash2 } from 'lucide-react';
import { useWishlist } from '../context/WishlistContext';
import { useCart } from '../context/CartContext';
import { ProductCard } from '../components/common/ProductCard';

export const WishlistPage = () => {
  const { wishlist, clearWishlist } = useWishlist();
  const { addToCart } = useCart();

  const handleMoveAllToCart = () => {
    wishlist.forEach((item) => {
      addToCart(item, null, 1);
    });
    clearWishlist();
  };

  if (wishlist.length === 0) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-24 text-center space-y-6 animate-fade-in">
        <div className="w-20 h-20 rounded-full bg-slate-800/60 flex items-center justify-center mx-auto text-slate-500 border border-slate-700">
          <Heart className="w-10 h-10" />
        </div>
        <div className="space-y-2">
          <h2 className="text-2xl sm:text-3xl font-serif font-bold text-slate-100">
            Your Private Wishlist is Empty
          </h2>
          <p className="text-xs text-slate-400 max-w-sm mx-auto">
            Save items to your personal curations as you explore the catalog to review or acquire later.
          </p>
        </div>
        <Link to="/shop" className="btn-gold text-xs px-8 py-3.5 inline-flex items-center gap-2 shadow-glow-gold">
          <span>Explore Catalog</span>
          <ArrowRight className="w-4 h-4" />
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between pb-6 border-b border-slate-800 gap-4">
        <div>
          <div className="text-xs font-semibold uppercase tracking-[0.2em] text-amber-400 mb-1">
            Private Registry
          </div>
          <h1 className="text-3xl font-serif font-bold text-slate-100">
            Saved Curations ({wishlist.length})
          </h1>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={clearWishlist}
            className="text-xs text-slate-400 hover:text-rose-400 flex items-center gap-1 transition-colors"
          >
            <Trash2 className="w-3.5 h-3.5" /> Clear All
          </button>
          <button
            onClick={handleMoveAllToCart}
            className="btn-outline-gold text-xs px-5 py-2.5 flex items-center gap-2"
          >
            <ShoppingBag className="w-3.5 h-3.5" />
            <span>Move All to Bag</span>
          </button>
        </div>
      </div>

      {/* Grid of Wishlist Products */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {wishlist.map((product) => (
          <ProductCard key={product.id} product={product} />
        ))}
      </div>
    </div>
  );
};
