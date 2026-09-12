import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Package,
  Truck,
  Printer,
  RotateCcw,
  XCircle,
  Clock,
  ArrowRight,
  ShieldCheck,
  AlertCircle
} from 'lucide-react';
import { api } from '../services/api';
import { formatPrice, formatDate, getOrderStatusBadge } from '../utils/formatters';
import { LoadingSpinner } from '../components/common/LoadingSpinner';
import { Modal } from '../components/common/Modal';
import { useToast } from '../context/ToastContext';

export const MyOrdersPage = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const { showSuccess, showError } = useToast();

  // Action modals
  const [cancelModalOrder, setCancelModalOrder] = useState(null);
  const [cancelReason, setCancelReason] = useState('');
  const [isCancelling, setIsCancelling] = useState(false);

  const [returnModalOrder, setReturnModalOrder] = useState(null);
  const [returnReason, setReturnReason] = useState('');
  const [isReturning, setIsReturning] = useState(false);

  const fetchOrders = async () => {
    setLoading(true);
    try {
      const res = await api.getMyOrders();
      if (res.success) setOrders(res.orders);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  const handleCancelSubmit = async (e) => {
    e.preventDefault();
    if (!cancelModalOrder) return;
    setIsCancelling(true);
    try {
      const res = await api.cancelOrder(cancelModalOrder.order_number, cancelReason);
      if (res.success) {
        showSuccess(res.message);
        setCancelModalOrder(null);
        setCancelReason('');
        fetchOrders();
      }
    } catch (err) {
      showError(err.message || 'Could not cancel order.');
    } finally {
      setIsCancelling(false);
    }
  };

  const handleReturnSubmit = async (e) => {
    e.preventDefault();
    if (!returnModalOrder) return;
    setIsReturning(true);
    try {
      const res = await api.requestReturn(returnModalOrder.order_number, returnReason);
      if (res.success) {
        showSuccess(res.message);
        setReturnModalOrder(null);
        setReturnReason('');
        fetchOrders();
      }
    } catch (err) {
      showError(err.message || 'Could not process return request.');
    } finally {
      setIsReturning(false);
    }
  };

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8 animate-fade-in">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between pb-6 border-b border-slate-800 gap-4">
        <div>
          <div className="text-xs font-semibold uppercase tracking-[0.2em] text-amber-400 mb-1">
            Acquisition History
          </div>
          <h1 className="text-3xl font-serif font-bold text-slate-100">
            My Orders ({orders.length})
          </h1>
        </div>

        <Link
          to="/shop"
          className="btn-outline-gold text-xs px-5 py-2.5 flex items-center gap-2 self-start sm:self-auto"
        >
          <span>Discover New Pieces</span>
          <ArrowRight className="w-4 h-4" />
        </Link>
      </div>

      {loading ? (
        <LoadingSpinner size="lg" className="py-24" />
      ) : orders.length === 0 ? (
        <div className="glass-panel p-12 rounded-3xl border border-slate-800 text-center space-y-4">
          <div className="w-16 h-16 rounded-full bg-slate-800/60 flex items-center justify-center mx-auto text-slate-500">
            <Package className="w-8 h-8" />
          </div>
          <h3 className="text-lg font-bold font-serif text-slate-200">No Orders in Your History</h3>
          <p className="text-xs text-slate-400 max-w-sm mx-auto">
            You have not placed any orders yet. Discover our precision Swiss timepieces and luxury audio gear.
          </p>
          <Link to="/shop" className="btn-gold text-xs px-6 py-3 inline-block">
            Explore Collection
          </Link>
        </div>
      ) : (
        <div className="space-y-6">
          {orders.map((order) => {
            const badge = getOrderStatusBadge(order.status);
            const canCancel = ['PENDING', 'CONFIRMED', 'PROCESSING', 'PACKED'].includes(order.status);
            const canReturn = order.status === 'DELIVERED' && !order.return_requested;

            return (
              <div
                key={order.id}
                className="glass-card p-6 sm:p-7 rounded-2xl border border-slate-800 space-y-6 hover:border-slate-700 transition-all"
              >
                {/* Order Top Bar */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-slate-800 gap-3 text-xs">
                  <div className="flex flex-wrap items-center gap-3">
                    <div>
                      <span className="text-slate-400 block text-[11px]">Order Reference:</span>
                      <span className="font-mono font-bold text-amber-300 text-sm">{order.order_number}</span>
                    </div>
                    <span className="text-slate-700 hidden sm:inline">•</span>
                    <div>
                      <span className="text-slate-400 block text-[11px]">Placed on:</span>
                      <span className="text-slate-200">{formatDate(order.created_at)}</span>
                    </div>
                    <span className="text-slate-700 hidden sm:inline">•</span>
                    <div>
                      <span className="text-slate-400 block text-[11px]">Total Paid:</span>
                      <span className="font-bold text-slate-100 font-serif">{formatPrice(order.total_amount)}</span>
                    </div>
                  </div>

                  <div>
                    <span className={`inline-block px-3 py-1 rounded-full text-xs font-bold border ${badge.bg}`}>
                      {badge.label}
                    </span>
                  </div>
                </div>

                {/* Items List */}
                <div className="space-y-3">
                  {order.items?.map((item) => (
                    <div key={item.id} className="flex items-center justify-between gap-4 text-xs">
                      <div className="flex items-center gap-3.5 min-w-0">
                        {item.image_url && (
                          <img
                            src={item.image_url}
                            alt={item.product_name}
                            className="w-14 h-14 object-cover rounded-xl bg-aura-950 border border-slate-800 shrink-0"
                          />
                        )}
                        <div className="truncate">
                          <div className="font-semibold text-slate-100 truncate">{item.product_name}</div>
                          {item.variant_name && (
                            <div className="text-[11px] text-amber-400/90">{item.variant_name}</div>
                          )}
                          <div className="text-slate-400 mt-0.5">Quantity: {item.quantity}</div>
                        </div>
                      </div>
                      <div className="text-sm font-bold font-serif text-slate-200 shrink-0">
                        {formatPrice(item.price * item.quantity)}
                      </div>
                    </div>
                  ))}
                </div>

                {/* Order Footer & Actions */}
                <div className="pt-4 border-t border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4 text-xs">
                  <div className="text-slate-400 flex items-center gap-2">
                    <Truck className="w-4 h-4 text-amber-400" />
                    <span>Courier: <strong className="text-slate-200">{order.carrier_name || 'Express Logistics'}</strong></span>
                    {order.tracking_number && (
                      <span className="font-mono text-amber-400">({order.tracking_number})</span>
                    )}
                  </div>

                  <div className="flex flex-wrap items-center gap-2">
                    <Link
                      to={`/order-tracking/${order.order_number}`}
                      className="btn-outline-gold text-xs px-4 py-2 flex items-center gap-1.5"
                    >
                      <Truck className="w-3.5 h-3.5" />
                      <span>Track Order</span>
                    </Link>

                    <Link
                      to={`/order-success/${order.order_number}`}
                      state={{ order }}
                      className="btn-ghost text-xs px-4 py-2 border border-slate-700 rounded-lg hover:border-slate-500 flex items-center gap-1.5"
                    >
                      <Printer className="w-3.5 h-3.5" />
                      <span>Invoice</span>
                    </Link>

                    {canCancel && (
                      <button
                        onClick={() => setCancelModalOrder(order)}
                        className="px-3 py-2 text-rose-400 hover:bg-rose-500/10 rounded-lg border border-rose-500/30 transition-colors"
                      >
                        Cancel Order
                      </button>
                    )}

                    {canReturn && (
                      <button
                        onClick={() => setReturnModalOrder(order)}
                        className="px-3 py-2 text-slate-300 hover:text-amber-300 border border-slate-700 rounded-lg hover:border-amber-400 transition-colors flex items-center gap-1.5"
                      >
                        <RotateCcw className="w-3.5 h-3.5" />
                        <span>Request Return</span>
                      </button>
                    )}

                    {order.return_requested === 1 && (
                      <span className="px-3 py-1.5 rounded-lg bg-indigo-500/10 border border-indigo-500/30 text-indigo-300 font-semibold">
                        Return {order.refund_status || 'Under Review'}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* --- CANCEL ORDER MODAL --- */}
      <Modal
        isOpen={!!cancelModalOrder}
        onClose={() => setCancelModalOrder(null)}
        title={`Cancel Order: ${cancelModalOrder?.order_number}`}
      >
        <form onSubmit={handleCancelSubmit} className="space-y-4 text-xs">
          <p className="text-slate-300">
            Are you sure you wish to cancel this order? Vault items will be restored to inventory immediately.
          </p>
          <div>
            <label className="block text-slate-300 font-medium mb-1">Reason for cancellation (Optional)</label>
            <textarea
              rows={3}
              value={cancelReason}
              onChange={(e) => setCancelReason(e.target.value)}
              placeholder="e.g. Changed mind on variant color"
              className="w-full bg-aura-900 border border-slate-700 rounded-lg p-2.5 text-slate-100"
            />
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={() => setCancelModalOrder(null)}
              className="btn-ghost text-xs px-4 py-2"
            >
              Keep Order
            </button>
            <button
              type="submit"
              disabled={isCancelling}
              className="px-5 py-2 rounded-lg bg-rose-600 hover:bg-rose-500 text-white font-bold"
            >
              {isCancelling ? 'Cancelling...' : 'Confirm Cancellation'}
            </button>
          </div>
        </form>
      </Modal>

      {/* --- RETURN & REFUND MODAL --- */}
      <Modal
        isOpen={!!returnModalOrder}
        onClose={() => setReturnModalOrder(null)}
        title={`Request Return for ${returnModalOrder?.order_number}`}
      >
        <form onSubmit={handleReturnSubmit} className="space-y-4 text-xs">
          <p className="text-slate-300">
            Our luxury concierge will arrange insured doorstep pickup within 24-48 hours. Please detail the reason for return:
          </p>
          <div>
            <label className="block text-slate-300 font-medium mb-1">Return Reason *</label>
            <textarea
              rows={3}
              value={returnReason}
              onChange={(e) => setReturnReason(e.target.value)}
              placeholder="e.g. Size fit preference / Desired exchange"
              required
              className="w-full bg-aura-900 border border-slate-700 rounded-lg p-2.5 text-slate-100"
            />
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={() => setReturnModalOrder(null)}
              className="btn-ghost text-xs px-4 py-2"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isReturning}
              className="btn-gold text-xs px-5 py-2 font-bold"
            >
              {isReturning ? 'Submitting...' : 'Submit Return Request'}
            </button>
          </div>
        </form>
      </Modal>

    </div>
  );
};
