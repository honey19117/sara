import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Trash2,
  Plus,
  Minus,
  ArrowRight,
  ShoppingBag,
  Tag,
  Check,
  X,
  ShieldCheck,
  Truck,
  Sparkles
} from 'lucide-react';
import { useCart } from '../context/CartContext';
import { formatPrice } from '../utils/formatters';

export const CartPage = () => {
  const {
    items,
    updateQuantity,
    removeFromCart,
    clearCart,
    cartSubtotal,
    discountAmount,
    coupon,
    applyCoupon,
    removeCoupon
  } = useCart();

  const navigate = useNavigate();
  const [couponInput, setCouponInput] = useState('');
  const [isApplyingCoupon, setIsApplyingCoupon] = useState(false);

  const freeShippingThreshold = 2499;
  const progressToFreeShipping = Math.min(100, (cartSubtotal / freeShippingThreshold) * 100);
  const remainingForFreeShipping = Math.max(0, freeShippingThreshold - cartSubtotal);

  const promoCoupons = [
    { code: 'WELCOME10', text: '10% OFF on your luxury order' },
    { code: 'LUXE20', text: '20% OFF for orders over ₹10,000' },
    { code: 'AURAFIRST', text: 'Flat ₹500 OFF for new members' }
  ];

  const handleApplyCoupon = async (e) => {
    e.preventDefault();
    if (!couponInput.trim()) return;
    setIsApplyingCoupon(true);
    try {
      await applyCoupon(couponInput.trim());
      setCouponInput('');
    } catch {
      // toast shown inside context
    } finally {
      setIsApplyingCoupon(false);
    }
  };

  const finalEstimatedTotal = Math.max(0, cartSubtotal - discountAmount);

  if (items.length === 0) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-24 text-center space-y-6 animate-fade-in">
        <div className="w-20 h-20 rounded-full bg-slate-800/60 flex items-center justify-center mx-auto text-slate-500 border border-slate-700">
          <ShoppingBag className="w-10 h-10" />
        </div>
        <div className="space-y-2">
          <h2 className="text-2xl sm:text-3xl font-serif font-bold text-slate-100">
            Your Shopping Bag is Empty
          </h2>
          <p className="text-xs text-slate-400 max-w-sm mx-auto">
            Discover precision Swiss horology, bespoke audio systems, and Italian leather creations.
          </p>
        </div>
        <Link to="/shop" className="btn-gold text-xs px-8 py-3.5 inline-flex items-center gap-2 shadow-glow-gold">
          <span>Explore Curated Catalog</span>
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
            Review Bag
          </div>
          <h1 className="text-3xl font-serif font-bold text-slate-100">
            Shopping Bag ({items.reduce((s, i) => s + i.quantity, 0)} Items)
          </h1>
        </div>
        <button
          onClick={clearCart}
          className="text-xs text-slate-400 hover:text-rose-400 flex items-center gap-1.5 transition-colors self-start sm:self-auto"
        >
          <Trash2 className="w-3.5 h-3.5" /> Clear All Items
        </button>
      </div>

      {/* Free Shipping Alert Bar */}
      <div className="glass-panel p-4 rounded-xl border border-slate-800 space-y-2">
        <div className="flex justify-between items-center text-xs">
          {remainingForFreeShipping === 0 ? (
            <span className="text-emerald-400 font-semibold flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4" /> You qualify for Complimentary Insured Express Shipping!
            </span>
          ) : (
            <span className="text-slate-300">
              Add <strong className="text-amber-300 font-serif">{formatPrice(remainingForFreeShipping)}</strong> more to unlock Complimentary Delivery
            </span>
          )}
          <span className="text-amber-400 font-bold">{Math.round(progressToFreeShipping)}%</span>
        </div>
        <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-amber-500 to-yellow-400 rounded-full transition-all duration-500"
            style={{ width: `${progressToFreeShipping}%` }}
          />
        </div>
      </div>

      {/* Main Grid: Item List & Order Summary */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
        
        {/* Item List */}
        <div className="lg:col-span-2 space-y-4">
          {items.map((item) => (
            <div
              key={`${item.productId}-${item.variantId || 'base'}`}
              className="glass-card p-5 flex flex-col sm:flex-row items-start sm:items-center gap-5 border border-slate-800 hover:border-slate-700"
            >
              <img
                src={item.imageUrl}
                alt={item.name}
                className="w-24 h-24 object-cover rounded-xl bg-aura-950 border border-slate-800 shrink-0"
              />

              <div className="flex-1 min-w-0 space-y-1">
                <Link
                  to={`/product/${item.slug}`}
                  className="font-medium text-slate-100 hover:text-amber-300 text-sm sm:text-base line-clamp-1 transition-colors"
                >
                  {item.name}
                </Link>
                {item.variantName && (
                  <div className="text-xs text-amber-400/90 font-medium">
                    Edition: {item.variantName}
                  </div>
                )}
                <div className="text-sm font-bold text-slate-200 font-serif pt-1">
                  {formatPrice(item.price)}
                </div>
              </div>

              {/* Quantity Controls & Line Total */}
              <div className="flex sm:flex-col items-center sm:items-end justify-between w-full sm:w-auto gap-4">
                <div className="flex items-center border border-slate-700 rounded-xl bg-aura-900 p-1">
                  <button
                    onClick={() => updateQuantity(item.productId, item.variantId, item.quantity - 1)}
                    className="p-1.5 text-slate-400 hover:text-white transition-colors"
                    aria-label="Decrease quantity"
                  >
                    <Minus className="w-3.5 h-3.5" />
                  </button>
                  <span className="w-8 text-center text-xs font-bold text-slate-100">
                    {item.quantity}
                  </span>
                  <button
                    onClick={() => updateQuantity(item.productId, item.variantId, item.quantity + 1)}
                    className="p-1.5 text-slate-400 hover:text-white transition-colors"
                    aria-label="Increase quantity"
                  >
                    <Plus className="w-3.5 h-3.5" />
                  </button>
                </div>

                <div className="flex items-center gap-3">
                  <div className="text-base font-bold font-serif text-slate-100">
                    {formatPrice(item.price * item.quantity)}
                  </div>
                  <button
                    onClick={() => removeFromCart(item.productId, item.variantId)}
                    className="text-slate-500 hover:text-rose-400 p-1.5 transition-colors"
                    aria-label="Remove item"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}

          {/* Continue Shopping Link */}
          <div className="pt-2">
            <Link
              to="/shop"
              className="text-xs text-amber-400 hover:text-amber-300 font-medium inline-flex items-center gap-1.5"
            >
              <span>← Continue Discovering Collection</span>
            </Link>
          </div>
        </div>

        {/* Order Summary & Coupon Card */}
        <div className="glass-panel p-6 rounded-2xl border border-slate-800 space-y-6 sticky top-28">
          <h3 className="text-base font-bold font-serif text-slate-100 pb-3 border-b border-slate-800">
            Order Summary
          </h3>

          {/* Promo Code Input */}
          <div className="space-y-3">
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-300">
              Promotional Certificate
            </label>
            {coupon ? (
              <div className="flex items-center justify-between p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs">
                <div className="flex items-center gap-2">
                  <Tag className="w-4 h-4 text-emerald-400" />
                  <div>
                    <span className="font-bold">{coupon.code}</span>
                    <span className="text-[11px] block text-emerald-400/80">
                      -{formatPrice(discountAmount)} applied
                    </span>
                  </div>
                </div>
                <button
                  onClick={removeCoupon}
                  className="p-1 text-slate-400 hover:text-rose-400 transition-colors"
                  aria-label="Remove coupon"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <form onSubmit={handleApplyCoupon} className="flex gap-2">
                <input
                  type="text"
                  value={couponInput}
                  onChange={(e) => setCouponInput(e.target.value.toUpperCase())}
                  placeholder="e.g. LUXE20"
                  className="flex-1 bg-aura-900 border border-slate-700 rounded-lg px-3 py-2 text-xs text-slate-100 uppercase focus:outline-none focus:border-amber-400"
                />
                <button
                  type="submit"
                  disabled={isApplyingCoupon || !couponInput.trim()}
                  className="btn-outline-gold text-xs px-4 py-2"
                >
                  {isApplyingCoupon ? '...' : 'Apply'}
                </button>
              </form>
            )}

            {/* Quick Coupons suggestion */}
            {!coupon && (
              <div className="space-y-1.5 pt-1">
                <span className="text-[10px] text-slate-400 uppercase font-semibold">Available Codes:</span>
                <div className="flex flex-wrap gap-1.5">
                  {promoCoupons.map((p) => (
                    <button
                      key={p.code}
                      onClick={() => applyCoupon(p.code)}
                      className="px-2 py-1 rounded bg-aura-850 border border-slate-700/80 hover:border-amber-500/40 text-[10px] font-semibold text-amber-300 transition-colors"
                    >
                      {p.code}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Pricing Breakdown */}
          <div className="space-y-2.5 pt-4 border-t border-slate-800 text-xs">
            <div className="flex justify-between text-slate-400">
              <span>Cart Subtotal</span>
              <span className="text-slate-200 font-medium font-serif">{formatPrice(cartSubtotal)}</span>
            </div>

            {discountAmount > 0 && (
              <div className="flex justify-between text-emerald-400 font-medium">
                <span>Promotional Savings</span>
                <span className="font-serif">-{formatPrice(discountAmount)}</span>
              </div>
            )}

            <div className="flex justify-between text-slate-400">
              <span>Estimated Shipping</span>
              <span className="text-slate-200">
                {cartSubtotal >= freeShippingThreshold ? (
                  <span className="text-emerald-400 font-semibold">Complimentary</span>
                ) : (
                  'Calculated at Checkout'
                )}
              </span>
            </div>

            <div className="flex justify-between text-base font-bold text-slate-100 pt-3 border-t border-slate-800">
              <span>Estimated Total</span>
              <span className="text-amber-300 font-serif text-lg">
                {formatPrice(finalEstimatedTotal)}
              </span>
            </div>
            <div className="text-[10px] text-slate-400 text-right">Includes applicable GST taxes</div>
          </div>

          {/* Checkout CTA */}
          <button
            onClick={() => navigate('/checkout')}
            className="w-full btn-gold py-4 flex items-center justify-center gap-2 text-xs font-bold uppercase shadow-glow-gold group"
          >
            <span>Proceed to Secure Checkout</span>
            <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
          </button>

          <div className="text-[11px] text-slate-400 text-center flex items-center justify-center gap-1.5 pt-1">
            <ShieldCheck className="w-4 h-4 text-amber-400" />
            <span>Official Encrypted Razorpay Gateway</span>
          </div>
        </div>

      </div>
    </div>
  );
};
