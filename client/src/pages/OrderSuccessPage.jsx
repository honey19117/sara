import React, { useEffect, useState } from 'react';
import { useParams, useLocation, Link } from 'react-router-dom';
import confetti from 'canvas-confetti';
import {
  CheckCircle2,
  Package,
  Printer,
  ArrowRight,
  ShieldCheck,
  Truck,
  Sparkles,
  MapPin
} from 'lucide-react';
import { api } from '../services/api';
import { formatPrice, formatDate, getOrderStatusBadge } from '../utils/formatters';
import { LoadingSpinner } from '../components/common/LoadingSpinner';

export const OrderSuccessPage = () => {
  const { orderNumber } = useParams();
  const location = useLocation();
  const [order, setOrder] = useState(location.state?.order || null);
  const [loading, setLoading] = useState(!order);

  useEffect(() => {
    // Fire celebratory confetti on mount
    try {
      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 },
        colors: ['#D4AF37', '#F3E5AB', '#AA820A', '#FFFFFF']
      });
    } catch {
      // ignore
    }

    if (!order && orderNumber) {
      api.getOrderDetails(orderNumber).then((res) => {
        if (res.success) setOrder(res.order);
      }).catch(console.error).finally(() => setLoading(false));
    }
  }, [orderNumber, order]);

  const handlePrint = () => {
    window.print();
  };

  if (loading) {
    return <LoadingSpinner size="lg" className="py-32" />;
  }

  if (!order) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-20 text-center space-y-4">
        <h2 className="text-2xl font-serif text-slate-100">Order Information Unavailable</h2>
        <Link to="/shop" className="btn-gold text-xs px-6 py-3">Return to Collection</Link>
      </div>
    );
  }

  const badge = getOrderStatusBadge(order.status);
  const address = order.shippingAddress || (order.shipping_address_json ? JSON.parse(order.shipping_address_json) : {});

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-8 animate-fade-in">
      
      {/* Confirmation Header Banner */}
      <div className="glass-panel p-8 sm:p-10 rounded-3xl border border-amber-500/40 text-center space-y-4 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="w-16 h-16 rounded-full bg-emerald-500/20 border border-emerald-500/40 text-emerald-400 flex items-center justify-center mx-auto">
          <CheckCircle2 className="w-9 h-9" />
        </div>

        <div className="space-y-1">
          <div className="text-xs font-semibold uppercase tracking-[0.25em] text-amber-400">
            Payment Verified & Vault Allocated
          </div>
          <h1 className="text-2xl sm:text-4xl font-serif font-bold text-slate-100">
            Thank You for Your Acquisition
          </h1>
          <p className="text-xs sm:text-sm text-slate-300 max-w-lg mx-auto">
            Your payment has been cryptographically confirmed. Your bespoke pieces are being prepared for insured courier dispatch.
          </p>
        </div>

        <div className="inline-flex items-center gap-3 px-4 py-2 rounded-xl bg-aura-900 border border-slate-700">
          <span className="text-xs text-slate-400 uppercase font-semibold">Order Reference:</span>
          <span className="font-mono text-sm font-bold text-amber-300">{order.order_number}</span>
        </div>
      </div>

      {/* Printable Receipt Card */}
      <div className="glass-panel p-6 sm:p-8 rounded-2xl border border-slate-800 space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-slate-800 gap-4">
          <div>
            <div className="text-xs font-bold uppercase tracking-wider text-slate-400">Status</div>
            <span className={`inline-block px-3 py-1 rounded-full text-xs font-bold border mt-1 ${badge.bg}`}>
              {badge.label}
            </span>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={handlePrint}
              className="btn-ghost text-xs px-4 py-2 flex items-center gap-2 border border-slate-700 rounded-lg hover:border-amber-400"
            >
              <Printer className="w-4 h-4 text-amber-400" />
              <span>Print Official Invoice</span>
            </button>
            <Link
              to={`/order-tracking/${order.order_number}`}
              className="btn-outline-gold text-xs px-4 py-2 flex items-center gap-1.5"
            >
              <Truck className="w-4 h-4" />
              <span>Live Tracking</span>
            </Link>
          </div>
        </div>

        {/* Order Details Breakdown */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 text-xs text-slate-300">
          <div className="space-y-1">
            <h4 className="font-bold uppercase tracking-wider text-slate-400">Delivery Address</h4>
            <div className="text-slate-100 font-semibold">{address.fullName}</div>
            <div>{address.addressLine1} {address.addressLine2}</div>
            <div>{address.city}, {address.state} - {address.pincode}</div>
            <div className="text-slate-400">Phone: {address.phone}</div>
          </div>

          <div className="space-y-1 sm:text-right">
            <h4 className="font-bold uppercase tracking-wider text-slate-400">Logistics Information</h4>
            <div>Carrier: <strong className="text-slate-100">{order.carrier_name || 'Express Courier'}</strong></div>
            <div>AWB Tracking: <span className="font-mono text-amber-300">{order.tracking_number || 'Generated at Dispatch'}</span></div>
            <div>Estimated Delivery: <strong className="text-slate-100">{formatDate(order.estimated_delivery)}</strong></div>
            <div>Order Timestamp: <span className="text-slate-400">{formatDate(order.created_at)}</span></div>
          </div>
        </div>

        {/* Purchased Items Table */}
        <div className="pt-4 border-t border-slate-800 space-y-3">
          <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">
            Acquired Masterpieces
          </h4>
          <div className="space-y-2">
            {order.items?.map((item) => (
              <div key={item.id} className="flex items-center justify-between p-3 rounded-xl bg-aura-900 border border-slate-800 text-xs">
                <div className="flex items-center gap-3">
                  {item.image_url && (
                    <img src={item.image_url} alt={item.product_name} className="w-12 h-12 rounded-lg object-cover bg-aura-950 shrink-0" />
                  )}
                  <div>
                    <div className="font-semibold text-slate-100">{item.product_name}</div>
                    {item.variant_name && <div className="text-[11px] text-amber-400/90">{item.variant_name}</div>}
                    <div className="text-slate-400">Qty: {item.quantity} × {formatPrice(item.price)}</div>
                  </div>
                </div>
                <div className="font-serif font-bold text-slate-100">
                  {formatPrice(item.price * item.quantity)}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Pricing Summary */}
        <div className="pt-4 border-t border-slate-800 flex justify-end">
          <div className="w-full sm:w-72 space-y-2 text-xs">
            <div className="flex justify-between text-slate-400">
              <span>Subtotal:</span>
              <span className="text-slate-200 font-serif">{formatPrice(order.subtotal)}</span>
            </div>
            {order.discount_amount > 0 && (
              <div className="flex justify-between text-emerald-400 font-medium">
                <span>Discount ({order.coupon_code}):</span>
                <span>-{formatPrice(order.discount_amount)}</span>
              </div>
            )}
            <div className="flex justify-between text-slate-400">
              <span>Shipping Fee:</span>
              <span>{order.shipping_charge === 0 ? 'Complimentary' : formatPrice(order.shipping_charge)}</span>
            </div>
            <div className="flex justify-between text-slate-400">
              <span>GST Tax (18%):</span>
              <span>{formatPrice(order.tax_amount)}</span>
            </div>
            <div className="flex justify-between text-base font-bold text-slate-100 pt-2 border-t border-slate-800">
              <span>Total Paid:</span>
              <span className="text-amber-300 font-serif text-lg">{formatPrice(order.total_amount)}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Navigation Buttons */}
      <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
        <Link to={`/order-tracking/${order.order_number}`} className="btn-gold w-full sm:w-auto px-8 py-3.5 text-xs font-bold flex items-center justify-center gap-2">
          <span>Track Live Progress</span>
          <ArrowRight className="w-4 h-4" />
        </Link>
        <Link to="/shop" className="btn-outline-gold w-full sm:w-auto px-8 py-3.5 text-xs font-semibold">
          Continue Exploring Catalog
        </Link>
      </div>

    </div>
  );
};
