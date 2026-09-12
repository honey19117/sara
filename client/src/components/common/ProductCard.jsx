import React from 'react';
import { Link } from 'react-router-dom';
import { Heart, Star, ShoppingBag, Eye } from 'lucide-react';
import { formatPrice } from '../../utils/formatters';
import { useCart } from '../../context/CartContext';
import { useWishlist } from '../../context/WishlistContext';

export const ProductCard = ({ product }) => {
  const { addToCart } = useCart();
  const { isInWishlist, toggleWishlist } = useWishlist();

  if (!product) return null;

  const inWishlist = isInWishlist(product.id);
  const imageUrl = product.primary_image || (product.images && product.images[0]?.image_url) || product.image_url;
  const isOutOfStock = product.stock <= 0;

  return (
    <div className="group glass-card flex flex-col justify-between overflow-hidden relative transition-all duration-300 hover:-translate-y-1">
      {/* Badges */}
      <div className="absolute top-3 left-3 z-10 flex flex-col gap-1.5">
        {product.discount_percent > 0 && (
          <span className="badge-tag bg-amber-500 text-black shadow-md font-bold">
            {product.discount_percent}% OFF
          </span>
        )}
        {product.is_new_arrival === 1 && (
          <span className="badge-tag bg-blue-500/90 text-white shadow-md">
            New
          </span>
        )}
        {product.is_trending === 1 && !product.is_new_arrival && (
          <span className="badge-tag bg-indigo-500/90 text-white shadow-md">
            Trending
          </span>
        )}
      </div>

      {/* Wishlist Button */}
      <button
        onClick={(e) => {
          e.preventDefault();
          e.stopPropagation();
          toggleWishlist(product);
        }}
        className={`absolute top-3 right-3 z-10 p-2.5 rounded-full backdrop-blur-md transition-all duration-300 ${
          inWishlist
            ? 'bg-rose-500/20 text-rose-400 border border-rose-500/40 shadow-glow-gold'
            : 'bg-aura-900/70 text-slate-300 border border-slate-700/60 hover:text-white hover:border-amber-500/40'
        }`}
        aria-label="Save to Wishlist"
      >
        <Heart className={`w-4 h-4 ${inWishlist ? 'fill-rose-500' : ''}`} />
      </button>

      {/* Image Container with Zoom */}
      <Link to={`/product/${product.slug}`} className="relative block aspect-square overflow-hidden bg-aura-950">
        <img
          src={imageUrl}
          alt={product.name}
          loading="lazy"
          className="w-full h-full object-cover object-center transition-transform duration-700 ease-out group-hover:scale-105"
        />
        {isOutOfStock && (
          <div className="absolute inset-0 bg-black/60 backdrop-blur-[2px] flex items-center justify-center">
            <span className="px-3 py-1 bg-red-900/80 text-red-200 text-xs font-semibold rounded-full border border-red-500/40">
              Sold Out
            </span>
          </div>
        )}
      </Link>

      {/* Card Info */}
      <div className="p-5 flex-1 flex flex-col justify-between">
        <div>
          {/* Category */}
          <div className="text-xs uppercase tracking-wider text-amber-400/80 font-medium mb-1">
            {product.category_name || 'Haute Collection'}
          </div>

          {/* Title */}
          <Link
            to={`/product/${product.slug}`}
            className="block font-medium text-slate-100 group-hover:text-amber-300 transition-colors line-clamp-1 mb-2"
          >
            {product.name}
          </Link>

          {/* Rating */}
          <div className="flex items-center gap-1.5 mb-3">
            <div className="flex items-center text-amber-400">
              <Star className="w-3.5 h-3.5 fill-amber-400" />
            </div>
            <span className="text-xs font-semibold text-slate-200">{product.rating || '5.0'}</span>
            <span className="text-xs text-slate-400">({product.reviews_count || 0})</span>
          </div>
        </div>

        {/* Pricing & Add to Cart */}
        <div className="pt-3 border-t border-slate-800/80 flex items-center justify-between">
          <div>
            <div className="text-lg font-bold text-slate-100 font-serif">
              {formatPrice(product.price)}
            </div>
            {product.compare_price && (
              <div className="text-xs text-slate-400 line-through">
                {formatPrice(product.compare_price)}
              </div>
            )}
          </div>

          <button
            onClick={() => addToCart(product, null, 1)}
            disabled={isOutOfStock}
            className="p-2.5 rounded-lg bg-amber-500/10 border border-amber-500/30 text-amber-300 hover:bg-amber-400 hover:text-black hover:border-amber-400 transition-all active:scale-95 disabled:opacity-40 disabled:pointer-events-none"
            title="Add to Shopping Bag"
            aria-label="Add to cart"
          >
            <ShoppingBag className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
