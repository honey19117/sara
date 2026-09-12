import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import {
  Heart,
  Star,
  ShoppingBag,
  ShieldCheck,
  Truck,
  RotateCcw,
  Check,
  ChevronDown,
  ChevronUp,
  Plus,
  Minus,
  Sparkles,
  ArrowRight,
  MessageSquare
} from 'lucide-react';
import { api } from '../services/api';
import { useCart } from '../context/CartContext';
import { useWishlist } from '../context/WishlistContext';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { formatPrice, formatDate } from '../utils/formatters';
import { ProductCard } from '../components/common/ProductCard';
import { LoadingSpinner } from '../components/common/LoadingSpinner';
import { Modal } from '../components/common/Modal';

export const ProductDetailPage = () => {
  const { slug } = useParams();
  const navigate = useNavigate();

  const { addToCart } = useCart();
  const { isInWishlist, toggleWishlist } = useWishlist();
  const { user, isAuthenticated } = useAuth();
  const { showSuccess, showError } = useToast();

  const [product, setProduct] = useState(null);
  const [selectedImage, setSelectedImage] = useState('');
  const [selectedVariant, setSelectedVariant] = useState(null);
  const [quantity, setQuantity] = useState(1);
  const [loading, setLoading] = useState(true);

  // Accordion active tabs
  const [openAccordions, setOpenAccordions] = useState({
    details: true,
    shipping: false,
    warranty: false
  });

  // Review Modal state
  const [isReviewModalOpen, setIsReviewModalOpen] = useState(false);
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewTitle, setReviewTitle] = useState('');
  const [reviewComment, setReviewComment] = useState('');
  const [reviewerName, setReviewerName] = useState(user?.name || '');
  const [isSubmittingReview, setIsSubmittingReview] = useState(false);

  useEffect(() => {
    const fetchProduct = async () => {
      setLoading(true);
      try {
        const data = await api.getProductBySlug(slug);
        if (data.success && data.product) {
          setProduct(data.product);
          const primaryImg = data.product.images?.find((img) => img.is_primary)?.image_url || data.product.images?.[0]?.image_url;
          setSelectedImage(primaryImg || '');
          if (data.product.variants && data.product.variants.length > 0) {
            setSelectedVariant(data.product.variants[0]);
          } else {
            setSelectedVariant(null);
          }
          setQuantity(1);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchProduct();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [slug]);

  const toggleAccordion = (key) => {
    setOpenAccordions((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const handleAddToCart = () => {
    if (!product) return;
    addToCart(product, selectedVariant, quantity);
  };

  const handleBuyNow = () => {
    if (!product) return;
    addToCart(product, selectedVariant, quantity);
    navigate('/checkout');
  };

  const handleReviewSubmit = async (e) => {
    e.preventDefault();
    if (!reviewComment.trim()) {
      showError('Please write your review thoughts.');
      return;
    }

    setIsSubmittingReview(true);
    try {
      const data = await api.addReview({
        productId: product.id,
        rating: reviewRating,
        title: reviewTitle,
        comment: reviewComment,
        userName: reviewerName || user?.name || 'Verified Connoisseur'
      });

      if (data.success) {
        showSuccess(data.message);
        setIsReviewModalOpen(false);
        setReviewTitle('');
        setReviewComment('');
        // Reload product to show new review & rating
        const refreshed = await api.getProductBySlug(slug);
        if (refreshed.success) setProduct(refreshed.product);
      }
    } catch (err) {
      showError(err.message || 'Failed to submit review.');
    } finally {
      setIsSubmittingReview(false);
    }
  };

  if (loading) {
    return <LoadingSpinner size="lg" className="py-32" />;
  }

  if (!product) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-20 text-center space-y-4">
        <h2 className="text-2xl font-serif text-slate-200">Masterpiece Not Found</h2>
        <p className="text-xs text-slate-400">The product you are seeking may have been archived or is temporarily unavailable.</p>
        <Link to="/shop" className="btn-gold text-xs px-6 py-3">Return to Collection</Link>
      </div>
    );
  }

  const effectivePrice = selectedVariant ? selectedVariant.price : product.price;
  const availableStock = selectedVariant ? selectedVariant.stock : product.stock;
  const isOutOfStock = availableStock <= 0;
  const inWishlist = isInWishlist(product.id);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-16 animate-fade-in">
      
      {/* Breadcrumbs */}
      <nav className="flex items-center gap-2 text-xs text-slate-400">
        <Link to="/" className="hover:text-amber-300 transition-colors">Home</Link>
        <span>/</span>
        <Link to={`/shop?category=${product.category_slug}`} className="hover:text-amber-300 transition-colors">
          {product.category_name}
        </Link>
        <span>/</span>
        <span className="text-slate-200 truncate">{product.name}</span>
      </nav>

      {/* Main Product Presentation */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-start">
        
        {/* --- IMAGE GALLERY --- */}
        <div className="space-y-4">
          <div className="relative aspect-square rounded-2xl overflow-hidden glass-panel border border-slate-800 bg-aura-950">
            <img
              src={selectedImage}
              alt={product.name}
              className="w-full h-full object-cover object-center transition-all duration-500"
            />
            {product.discount_percent > 0 && (
              <span className="absolute top-4 left-4 badge-tag bg-amber-500 text-black font-bold shadow-md">
                {product.discount_percent}% OFF
              </span>
            )}
            <button
              onClick={() => toggleWishlist(product)}
              className={`absolute top-4 right-4 p-3 rounded-full backdrop-blur-md transition-all ${
                inWishlist
                  ? 'bg-rose-500/20 text-rose-400 border border-rose-500/40 shadow-glow-gold'
                  : 'bg-aura-900/80 text-slate-300 border border-slate-700/60 hover:text-white'
              }`}
              aria-label="Save to Wishlist"
            >
              <Heart className={`w-5 h-5 ${inWishlist ? 'fill-rose-500' : ''}`} />
            </button>
          </div>

          {/* Thumbnails rail */}
          {product.images && product.images.length > 1 && (
            <div className="flex items-center gap-3 overflow-x-auto pb-2">
              {product.images.map((img) => (
                <button
                  key={img.id}
                  onClick={() => setSelectedImage(img.image_url)}
                  className={`relative w-20 h-20 rounded-xl overflow-hidden border-2 shrink-0 transition-all ${
                    selectedImage === img.image_url
                      ? 'border-amber-400 shadow-glow-gold scale-105'
                      : 'border-slate-800 opacity-60 hover:opacity-100'
                  }`}
                >
                  <img src={img.image_url} alt={img.alt_text || 'Thumbnail'} className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* --- PRODUCT DETAILS & SELECTION --- */}
        <div className="space-y-6">
          <div>
            <div className="text-xs uppercase tracking-[0.25em] text-amber-400 font-bold mb-2">
              {product.category_name} • SKU: {selectedVariant?.sku || product.sku}
            </div>
            <h1 className="text-2xl sm:text-4xl font-serif font-bold text-slate-100 leading-tight">
              {product.name}
            </h1>

            {/* Rating Stars */}
            <div className="flex items-center gap-3 mt-3">
              <div className="flex items-center text-amber-400">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Star
                    key={i}
                    className={`w-4 h-4 ${
                      i < Math.round(product.rating || 5) ? 'fill-amber-400' : 'text-slate-600'
                    }`}
                  />
                ))}
              </div>
              <span className="text-sm font-semibold text-slate-200">{product.rating}</span>
              <span className="text-xs text-slate-400">({product.reviews_count} Connoisseur Reviews)</span>
            </div>
          </div>

          {/* Pricing */}
          <div className="p-4 rounded-xl bg-aura-850/80 border border-slate-800 flex items-center justify-between">
            <div>
              <div className="text-3xl font-bold font-serif text-slate-100">
                {formatPrice(effectivePrice)}
              </div>
              {product.compare_price && (
                <div className="text-xs text-slate-400 line-through">
                  Original: {formatPrice(product.compare_price)}
                </div>
              )}
            </div>
            <div className="text-right">
              {isOutOfStock ? (
                <span className="badge-tag bg-rose-500/10 text-rose-400 border border-rose-500/30">
                  Sold Out
                </span>
              ) : availableStock < 10 ? (
                <span className="badge-tag bg-amber-500/10 text-amber-400 border border-amber-500/30">
                  Vault Low Stock: {availableStock} Remaining
                </span>
              ) : (
                <span className="badge-tag bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
                  In Stock ({availableStock} Available)
                </span>
              )}
              <div className="text-[10px] text-slate-400 mt-1">Includes all taxes & duty</div>
            </div>
          </div>

          {/* Short Description */}
          <p className="text-sm text-slate-300 leading-relaxed">
            {product.short_description || product.description}
          </p>

          {/* Variant Selector */}
          {product.variants && product.variants.length > 0 && (
            <div className="space-y-3 pt-2">
              <div className="flex justify-between items-center text-xs">
                <span className="font-bold uppercase tracking-wider text-slate-300">
                  Select Edition / Specification:
                </span>
                <span className="text-amber-300 font-medium">
                  {selectedVariant ? selectedVariant.name : 'Choose one'}
                </span>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
                {product.variants.map((variant) => (
                  <button
                    key={variant.id}
                    onClick={() => {
                      setSelectedVariant(variant);
                      setQuantity(1);
                    }}
                    className={`p-3 rounded-xl border text-left transition-all ${
                      selectedVariant?.id === variant.id
                        ? 'border-amber-400 bg-amber-500/10 text-slate-100 shadow-glow-gold'
                        : 'border-slate-800 bg-aura-850/60 text-slate-400 hover:text-slate-200 hover:border-slate-700'
                    }`}
                  >
                    <div className="text-xs font-semibold truncate">{variant.name}</div>
                    <div className="text-[11px] text-amber-400/90 font-serif mt-0.5">
                      {formatPrice(variant.price)}
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Quantity & Actions */}
          <div className="space-y-4 pt-2">
            <div className="flex items-center gap-4">
              {/* Quantity Counter */}
              <div className="flex items-center border border-slate-700 rounded-xl bg-aura-850 p-1">
                <button
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  disabled={quantity <= 1 || isOutOfStock}
                  className="p-2 text-slate-400 hover:text-white disabled:opacity-30"
                  aria-label="Decrease quantity"
                >
                  <Minus className="w-4 h-4" />
                </button>
                <span className="w-10 text-center font-bold text-sm text-slate-100">
                  {quantity}
                </span>
                <button
                  onClick={() => setQuantity(Math.min(availableStock, quantity + 1))}
                  disabled={quantity >= availableStock || isOutOfStock}
                  className="p-2 text-slate-400 hover:text-white disabled:opacity-30"
                  aria-label="Increase quantity"
                >
                  <Plus className="w-4 h-4" />
                </button>
              </div>

              {/* Add to Bag Button */}
              <button
                onClick={handleAddToCart}
                disabled={isOutOfStock}
                className="flex-1 btn-gold py-3.5 flex items-center justify-center gap-2 shadow-glow-gold"
              >
                <ShoppingBag className="w-4 h-4" />
                <span>Add to Shopping Bag</span>
              </button>
            </div>

            {/* Direct Buy Now Button */}
            <button
              onClick={handleBuyNow}
              disabled={isOutOfStock}
              className="w-full btn-outline-gold py-3.5 flex items-center justify-center gap-2 text-xs font-bold"
            >
              <span>Acquire Now via Razorpay Express</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>

          {/* Product Guarantee Badges */}
          <div className="grid grid-cols-3 gap-3 pt-4 border-t border-slate-800 text-center">
            <div className="p-2.5 rounded-lg bg-aura-850/40 border border-slate-800">
              <Truck className="w-4 h-4 text-amber-400 mx-auto mb-1" />
              <div className="text-[10px] text-slate-300 font-medium">Insured Express</div>
            </div>
            <div className="p-2.5 rounded-lg bg-aura-850/40 border border-slate-800">
              <RotateCcw className="w-4 h-4 text-amber-400 mx-auto mb-1" />
              <div className="text-[10px] text-slate-300 font-medium">7-Day Returns</div>
            </div>
            <div className="p-2.5 rounded-lg bg-aura-850/40 border border-slate-800">
              <ShieldCheck className="w-4 h-4 text-amber-400 mx-auto mb-1" />
              <div className="text-[10px] text-slate-300 font-medium">Authenticity Cert</div>
            </div>
          </div>

          {/* Accordion Tabs */}
          <div className="space-y-3 pt-4 border-t border-slate-800">
            {/* Description Tab */}
            <div className="border border-slate-800 rounded-xl overflow-hidden glass-panel">
              <button
                onClick={() => toggleAccordion('details')}
                className="w-full px-5 py-3.5 flex justify-between items-center text-xs font-bold uppercase tracking-wider text-slate-200 hover:text-amber-300 transition-colors"
              >
                <span>Full Atelier Specifications & Notes</span>
                {openAccordions.details ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
              </button>
              {openAccordions.details && (
                <div className="px-5 pb-5 text-xs text-slate-300 leading-relaxed border-t border-slate-800/60 pt-3 whitespace-pre-line">
                  {product.description}
                </div>
              )}
            </div>

            {/* Shipping Tab */}
            <div className="border border-slate-800 rounded-xl overflow-hidden glass-panel">
              <button
                onClick={() => toggleAccordion('shipping')}
                className="w-full px-5 py-3.5 flex justify-between items-center text-xs font-bold uppercase tracking-wider text-slate-200 hover:text-amber-300 transition-colors"
              >
                <span>Shipping & Delivery Timelines</span>
                {openAccordions.shipping ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
              </button>
              {openAccordions.shipping && (
                <div className="px-5 pb-5 text-xs text-slate-300 leading-relaxed border-t border-slate-800/60 pt-3 space-y-2">
                  <p>• <strong>Complimentary Shipping:</strong> On orders above ₹2,499 across all Indian PIN codes.</p>
                  <p>• <strong>Priority Air Courier:</strong> Dispatched in tamper-evident security vault cases within 24 hours.</p>
                  <p>• <strong>Estimated Delivery:</strong> 2 to 4 business days with real-time SMS & WhatsApp alerts.</p>
                </div>
              )}
            </div>
          </div>

        </div>
      </div>

      {/* --- CUSTOMER REVIEWS SECTION --- */}
      <section className="border-t border-slate-800 pt-16 space-y-8">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="text-xs font-bold uppercase tracking-[0.2em] text-amber-400 mb-1">
              Verified Feedback
            </div>
            <h2 className="text-2xl sm:text-3xl font-serif font-bold text-slate-100">
              Connoisseur Reviews ({product.reviews?.length || 0})
            </h2>
          </div>
          <button
            onClick={() => setIsReviewModalOpen(true)}
            className="btn-outline-gold text-xs px-5 py-2.5 flex items-center gap-2"
          >
            <MessageSquare className="w-3.5 h-3.5" />
            <span>Write a Verified Review</span>
          </button>
        </div>

        {/* Reviews List */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {product.reviews && product.reviews.length > 0 ? (
            product.reviews.map((rev) => (
              <div key={rev.id} className="glass-card p-6 space-y-3">
                <div className="flex justify-between items-start">
                  <div>
                    <div className="flex items-center gap-1 text-amber-400 mb-1">
                      {Array.from({ length: 5 }).map((_, i) => (
                        <Star
                          key={i}
                          className={`w-3.5 h-3.5 ${i < rev.rating ? 'fill-amber-400' : 'text-slate-700'}`}
                        />
                      ))}
                    </div>
                    <h4 className="text-sm font-semibold text-slate-100">{rev.title || 'Exceptional Quality'}</h4>
                  </div>
                  <span className="text-[11px] text-slate-400">{formatDate(rev.created_at)}</span>
                </div>
                <p className="text-xs text-slate-300 leading-relaxed italic">"{rev.comment}"</p>
                <div className="text-[11px] text-amber-400/90 font-medium flex items-center gap-1 pt-1">
                  <Check className="w-3 h-3 text-emerald-400" />
                  <span>{rev.user_name} • Verified Client</span>
                </div>
              </div>
            ))
          ) : (
            <div className="col-span-2 text-center py-8 glass-panel rounded-xl text-xs text-slate-400">
              Be the first to review this exceptional piece.
            </div>
          )}
        </div>
      </section>

      {/* --- RELATED MASTERPIECES --- */}
      {product.related && product.related.length > 0 && (
        <section className="border-t border-slate-800 pt-16 space-y-8">
          <div>
            <div className="text-xs font-bold uppercase tracking-[0.2em] text-amber-400 mb-1">
              Complementary Selections
            </div>
            <h2 className="text-2xl sm:text-3xl font-serif font-bold text-slate-100">
              You May Also Covet
            </h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {product.related.map((rel) => (
              <ProductCard key={rel.id} product={rel} />
            ))}
          </div>
        </section>
      )}

      {/* --- WRITE A REVIEW MODAL --- */}
      <Modal
        isOpen={isReviewModalOpen}
        onClose={() => setIsReviewModalOpen(false)}
        title="Submit Connoisseur Review"
      >
        <form onSubmit={handleReviewSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-2">
              Your Star Rating
            </label>
            <div className="flex items-center gap-2">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  type="button"
                  key={star}
                  onClick={() => setReviewRating(star)}
                  className="p-1 transition-transform hover:scale-110"
                >
                  <Star
                    className={`w-6 h-6 ${
                      star <= reviewRating ? 'fill-amber-400 text-amber-400' : 'text-slate-600'
                    }`}
                  />
                </button>
              ))}
              <span className="text-xs font-semibold text-amber-300 ml-2">{reviewRating} out of 5</span>
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-1.5">
              Reviewer Name
            </label>
            <input
              type="text"
              value={reviewerName}
              onChange={(e) => setReviewerName(e.target.value)}
              placeholder="e.g. Vikramaditya S."
              required
              className="w-full bg-aura-900 border border-slate-700 rounded-lg px-3 py-2 text-xs text-slate-100 focus:outline-none focus:border-amber-400"
            />
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-1.5">
              Review Title
            </label>
            <input
              type="text"
              value={reviewTitle}
              onChange={(e) => setReviewTitle(e.target.value)}
              placeholder="e.g. Sublime sound fidelity & exquisite build"
              required
              className="w-full bg-aura-900 border border-slate-700 rounded-lg px-3 py-2 text-xs text-slate-100 focus:outline-none focus:border-amber-400"
            />
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-1.5">
              Your Review Experience
            </label>
            <textarea
              rows={4}
              value={reviewComment}
              onChange={(e) => setReviewComment(e.target.value)}
              placeholder="Describe your tactile impression, audio precision, or craftsmanship..."
              required
              className="w-full bg-aura-900 border border-slate-700 rounded-lg p-3 text-xs text-slate-100 focus:outline-none focus:border-amber-400 leading-relaxed"
            />
          </div>

          <div className="pt-2 flex justify-end gap-3">
            <button
              type="button"
              onClick={() => setIsReviewModalOpen(false)}
              className="btn-ghost text-xs px-4 py-2"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmittingReview}
              className="btn-gold text-xs px-6 py-2.5 font-bold"
            >
              {isSubmittingReview ? 'Publishing...' : 'Publish Review'}
            </button>
          </div>
        </form>
      </Modal>

    </div>
  );
};
