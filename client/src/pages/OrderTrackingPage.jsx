import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Search,
  Package,
  Truck,
  CheckCircle2,
  Clock,
  ShieldCheck,
  MapPin,
  HelpCircle,
  AlertCircle
} from 'lucide-react';
import { api } from '../services/api';
import { formatPrice, formatDate, getOrderStatusBadge } from '../utils/formatters';
import { LoadingSpinner } from '../components/common/LoadingSpinner';

export const OrderTrackingPage = () => {
  const { orderNumber: paramOrderNumber } = useParams();
  const navigate = useNavigate();

  const [inputOrderNumber, setInputOrderNumber] = useState(paramOrderNumber || '');
  const [orderData, setOrderData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const fetchTracking = async (numberToSearch) => {
    if (!numberToSearch || !numberToSearch.trim()) return;
    setLoading(true);
    setError('');

    try {
      const data = await api.trackOrder(numberToSearch.trim());
      if (data.success && data.order) {
        setOrderData(data.order);
      } else {
        setError('No tracking details found for this order number.');
      }
    } catch (err) {
      setError(err.message || 'Unable to locate order. Please verify your order number.');
      setOrderData(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (paramOrderNumber) {
      setInputOrderNumber(paramOrderNumber);
      fetchTracking(paramOrderNumber);
    }
  }, [paramOrderNumber]);

  const handleSearch = (e) => {
    e.preventDefault();
    if (inputOrderNumber.trim()) {
      navigate(`/order-tracking/${inputOrderNumber.trim()}`);
      fetchTracking(inputOrderNumber.trim());
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-10 animate-fade-in">
      
      {/* Header */}
      <div className="text-center space-y-3">
        <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs uppercase tracking-widest font-semibold">
          <Truck className="w-3.5 h-3.5" />
          <span>Real-Time Logistics Telemetry</span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-serif font-bold text-slate-100">
          Track Your Masterpiece
        </h1>
        <p className="text-xs text-slate-400 max-w-md mx-auto">
          Enter your unique AURA Order Reference number to trace fulfillment, vault allocation, and express transit.
        </p>
      </div>

      {/* Search Bar */}
      <form onSubmit={handleSearch} className="max-w-md mx-auto flex gap-2">
        <div className="relative flex-1">
          <input
            type="text"
            value={inputOrderNumber}
            onChange={(e) => setInputOrderNumber(e.target.value.toUpperCase())}
            placeholder="e.g. AURA-2026-89412"
            required
            className="w-full bg-aura-900 border border-slate-700 rounded-xl pl-10 pr-4 py-3 text-xs sm:text-sm text-slate-100 uppercase tracking-wider font-mono focus:outline-none focus:border-amber-400"
          />
          <Search className="absolute left-3.5 top-3.5 w-4 h-4 text-slate-400" />
        </div>
        <button
          type="submit"
          disabled={loading}
          className="btn-gold px-6 text-xs font-bold shrink-0"
        >
          {loading ? 'Searching...' : 'Track'}
        </button>
      </form>

      {error && (
        <div className="p-4 rounded-xl bg-rose-500/10 border border-rose-500/40 text-rose-300 text-xs text-center flex items-center justify-center gap-2 max-w-md mx-auto">
          <AlertCircle className="w-4 h-4 text-rose-400" />
          <span>{error}</span>
        </div>
      )}

      {loading && <LoadingSpinner size="lg" className="py-12" />}

      {/* Tracking Stepper & Live Timeline */}
      {orderData && !loading && (
        <div className="space-y-8 animate-slide-up">
          
          {/* Order Summary Header Card */}
          <div className="glass-panel p-6 rounded-2xl border border-slate-800 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-slate-800 gap-3">
              <div>
                <div className="text-[11px] text-slate-400 uppercase font-semibold">Order Number</div>
                <div className="text-base font-bold font-mono text-amber-300">{orderData.orderNumber}</div>
              </div>
              <div>
                <div className="text-[11px] text-slate-400 uppercase font-semibold">Current State</div>
                <span className="inline-block px-3 py-1 rounded-full text-xs font-bold border mt-0.5 bg-amber-500/10 text-amber-300 border-amber-500/30">
                  {orderData.status}
                </span>
              </div>
              <div className="sm:text-right">
                <div className="text-[11px] text-slate-400 uppercase font-semibold">Estimated Delivery</div>
                <div className="text-xs font-bold text-slate-100">{formatDate(orderData.estimatedDelivery)}</div>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs text-slate-300">
              <div>
                <span className="text-slate-400 block">Courier & Waybill Tracking:</span>
                <strong className="text-slate-100">{orderData.carrierName || 'Express Logistics'}</strong>
                <span className="block font-mono text-amber-400/90">{orderData.trackingNumber || 'AWB Pending'}</span>
              </div>
              <div className="sm:text-right">
                <span className="text-slate-400 block">Delivery Address:</span>
                <div>{orderData.shippingAddress?.fullName}</div>
                <div>{orderData.shippingAddress?.city}, {orderData.shippingAddress?.state} - {orderData.shippingAddress?.pincode}</div>
              </div>
            </div>
          </div>

          {/* 7-Step Progression Stepper */}
          <div className="glass-panel p-6 sm:p-8 rounded-2xl border border-slate-800 space-y-6">
            <h3 className="text-sm font-bold font-serif uppercase tracking-wider text-slate-100 pb-3 border-b border-slate-800">
              Fulfillment Journey
            </h3>

            <div className="relative pl-6 sm:pl-8 space-y-8 before:absolute before:left-3 sm:before:left-4 before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-800">
              {orderData.steps.map((step, idx) => (
                <div key={step.key} className="relative flex items-start gap-4">
                  {/* Step Node */}
                  <div
                    className={`absolute -left-6 sm:-left-8 w-6 sm:w-8 h-6 sm:h-8 rounded-full border-2 flex items-center justify-center transition-all ${
                      step.isCompleted
                        ? 'bg-amber-400 border-amber-300 text-black shadow-glow-gold'
                        : step.isCurrent
                        ? 'bg-slate-900 border-amber-400 text-amber-400 ring-4 ring-amber-500/20'
                        : 'bg-aura-900 border-slate-700 text-slate-600'
                    }`}
                  >
                    {step.isCompleted ? (
                      <CheckCircle2 className="w-4 h-4 sm:w-5 sm:h-5" />
                    ) : (
                      <span className="text-[10px] font-bold">{idx + 1}</span>
                    )}
                  </div>

                  {/* Step Info */}
                  <div className="flex-1 space-y-0.5">
                    <div className="flex items-center justify-between">
                      <h4
                        className={`text-xs sm:text-sm font-bold ${
                          step.isCompleted || step.isCurrent ? 'text-slate-100' : 'text-slate-500'
                        }`}
                      >
                        {step.label}
                      </h4>
                      {step.timestamp && (
                        <span className="text-[10px] text-slate-400 font-mono">
                          {formatDate(step.timestamp)}
                        </span>
                      )}
                    </div>
                    <p
                      className={`text-xs ${
                        step.isCompleted || step.isCurrent ? 'text-slate-300' : 'text-slate-500'
                      }`}
                    >
                      {step.desc}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Package Content Summary */}
          {orderData.items && orderData.items.length > 0 && (
            <div className="glass-panel p-6 rounded-2xl border border-slate-800 space-y-4">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">
                Package Contents
              </h3>
              <div className="space-y-2">
                {orderData.items.map((item, i) => (
                  <div key={i} className="flex items-center justify-between p-3 rounded-xl bg-aura-900 border border-slate-800/80 text-xs">
                    <div className="flex items-center gap-3">
                      {item.image_url && (
                        <img src={item.image_url} alt={item.product_name} className="w-10 h-10 object-cover rounded bg-aura-950" />
                      )}
                      <div>
                        <div className="font-semibold text-slate-100">{item.product_name}</div>
                        {item.variant_name && <div className="text-[11px] text-amber-400">{item.variant_name}</div>}
                      </div>
                    </div>
                    <span className="text-slate-400">Qty: {item.quantity}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

        </div>
      )}

      {/* Demo helper */}
      {!orderData && !loading && (
        <div className="p-4 rounded-xl bg-aura-850/60 border border-slate-800 text-center text-xs text-slate-400 max-w-md mx-auto space-y-1">
          <p>Demo Order Example to test tracking:</p>
          <button
            onClick={() => {
              setInputOrderNumber('AURA-2026-89412');
              fetchTracking('AURA-2026-89412');
            }}
            className="text-amber-400 font-mono font-bold hover:underline"
          >
            AURA-2026-89412
          </button>
        </div>
      )}

    </div>
  );
};
