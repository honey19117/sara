import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import {
  ShieldCheck,
  Lock,
  Truck,
  CreditCard,
  ArrowRight,
  AlertCircle,
  CheckCircle2,
  MapPin,
  ChevronRight,
  Sparkles
} from 'lucide-react';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { api } from '../services/api';
import { openRazorpayCheckout } from '../services/razorpay';
import { formatPrice } from '../utils/formatters';
import { LoadingSpinner } from '../components/common/LoadingSpinner';

export const CheckoutPage = () => {
  const navigate = useNavigate();
  const { items, cartSubtotal, discountAmount, coupon, clearCart } = useCart();
  const { user, isAuthenticated } = useAuth();
  const { showSuccess, showError, showInfo } = useToast();

  const [customerDetails, setCustomerDetails] = useState({
    fullName: user?.name || '',
    email: user?.email || '',
    phone: user?.phone || ''
  });

  const [shippingAddress, setShippingAddress] = useState({
    addressLine1: '',
    addressLine2: '',
    city: '',
    state: '',
    pincode: ''
  });

  const [savedAddresses, setSavedAddresses] = useState([]);
  const [selectedAddressId, setSelectedAddressId] = useState(null);
  const [isNewAddress, setIsNewAddress] = useState(!isAuthenticated);

  const [shippingMethod, setShippingMethod] = useState('standard');
  const [shippingOptions, setShippingOptions] = useState([]);
  const [shippingCharge, setShippingCharge] = useState(0);
  const [taxAmount, setTaxAmount] = useState(0);

  const [isCalculatingShipping, setIsCalculatingShipping] = useState(false);
  const [isProcessingPayment, setIsProcessingPayment] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  // Pre-fill user data
  useEffect(() => {
    if (user) {
      setCustomerDetails((prev) => ({
        fullName: prev.fullName || user.name || '',
        email: prev.email || user.email || '',
        phone: prev.phone || user.phone || ''
      }));

      // Load saved addresses
      api.getAddresses().then((res) => {
        if (res.success && res.addresses.length > 0) {
          setSavedAddresses(res.addresses);
          const defaultAddr = res.addresses.find((a) => a.is_default) || res.addresses[0];
          if (defaultAddr) {
            setSelectedAddressId(defaultAddr.id);
            setShippingAddress({
              addressLine1: defaultAddr.address_line1,
              addressLine2: defaultAddr.address_line2 || '',
              city: defaultAddr.city,
              state: defaultAddr.state,
              pincode: defaultAddr.pincode
            });
            setIsNewAddress(false);
          }
        }
      }).catch(() => {});
    }
  }, [user]);

  // Recalculate shipping when pincode, subtotal, or shippingMethod changes
  useEffect(() => {
    const calc = async () => {
      const pin = shippingAddress.pincode;
      if (pin && /^\d{6}$/.test(pin.trim())) {
        setIsCalculatingShipping(true);
        try {
          const res = await api.calculateShipping({
            pincode: pin.trim(),
            subtotal: Math.max(0, cartSubtotal - discountAmount),
            shippingMethod
          });

          if (res.success) {
            setShippingOptions(res.options);
            setShippingCharge(res.shippingCharge);
          }
        } catch (err) {
          console.error(err);
        } finally {
          setIsCalculatingShipping(false);
        }
      } else {
        // Default standard rates
        const freeThreshold = 2499;
        const sub = Math.max(0, cartSubtotal - discountAmount);
        const fee = shippingMethod === 'express' ? 199 : (sub >= freeThreshold ? 0 : 99);
        setShippingCharge(fee);
      }
    };

    calc();
  }, [shippingAddress.pincode, cartSubtotal, discountAmount, shippingMethod]);

  // Compute 18% GST tax
  useEffect(() => {
    const taxable = Math.max(0, cartSubtotal - discountAmount);
    const tax = Math.round(((taxable * 18) / 100) * 100) / 100;
    setTaxAmount(tax);
  }, [cartSubtotal, discountAmount]);

  const payableTotal = Math.max(0, cartSubtotal - discountAmount + shippingCharge + taxAmount);

  // Address switch handler
  const handleSelectSavedAddress = (addr) => {
    setSelectedAddressId(addr.id);
    setShippingAddress({
      addressLine1: addr.address_line1,
      addressLine2: addr.address_line2 || '',
      city: addr.city,
      state: addr.state,
      pincode: addr.pincode
    });
    setIsNewAddress(false);
  };

  // Indian PIN code auto city/state helper
  const handlePincodeChange = async (e) => {
    const pin = e.target.value;
    setShippingAddress((prev) => ({ ...prev, pincode: pin }));

    if (pin.length === 6 && /^\d{6}$/.test(pin)) {
      // Auto-detect common metro areas
      const pinPrefix = pin.substring(0, 2);
      let guessedCity = '';
      let guessedState = '';

      if (pinPrefix === '11') { guessedCity = 'New Delhi'; guessedState = 'Delhi'; }
      else if (['12', '13'].includes(pinPrefix)) { guessedCity = 'Gurugram'; guessedState = 'Haryana'; }
      else if (['20', '21', '22', '24'].includes(pinPrefix)) { guessedCity = 'Noida'; guessedState = 'Uttar Pradesh'; }
      else if (['40', '41', '42'].includes(pinPrefix)) { guessedCity = 'Mumbai'; guessedState = 'Maharashtra'; }
      else if (['56', '57', '58'].includes(pinPrefix)) { guessedCity = 'Bengaluru'; guessedState = 'Karnataka'; }
      else if (['60', '61', '62'].includes(pinPrefix)) { guessedCity = 'Chennai'; guessedState = 'Tamil Nadu'; }
      else if (['50', '51', '52'].includes(pinPrefix)) { guessedCity = 'Hyderabad'; guessedState = 'Telangana'; }
      else if (['70', '71', '72'].includes(pinPrefix)) { guessedCity = 'Kolkata'; guessedState = 'West Bengal'; }

      if (guessedCity && !shippingAddress.city) {
        setShippingAddress((prev) => ({
          ...prev,
          city: prev.city || guessedCity,
          state: prev.state || guessedState
        }));
      }
    }
  };

  // Submit and open Razorpay Checkout modal
  const handleProceedToPayment = async (e) => {
    e.preventDefault();
    setErrorMessage('');

    if (items.length === 0) {
      showError('Your shopping bag is empty.');
      navigate('/shop');
      return;
    }

    if (!customerDetails.fullName || !customerDetails.email || !customerDetails.phone) {
      setErrorMessage('Please fill in your complete contact details.');
      showError('Please provide name, email, and phone number.');
      return;
    }

    if (!shippingAddress.addressLine1 || !shippingAddress.city || !shippingAddress.state || !shippingAddress.pincode) {
      setErrorMessage('Please complete all required shipping address fields.');
      showError('Please provide a complete shipping address.');
      return;
    }

    if (!/^\d{6}$/.test(shippingAddress.pincode.trim())) {
      setErrorMessage('Please enter a valid 6-digit Indian PIN code.');
      showError('Invalid PIN code.');
      return;
    }

    setIsProcessingPayment(true);

    try {
      // 1. Create order on backend
      const orderPayload = {
        items: items.map((i) => ({
          productId: i.productId,
          variantId: i.variantId,
          quantity: i.quantity,
          price: i.price,
          name: i.name,
          imageUrl: i.imageUrl
        })),
        couponCode: coupon?.code,
        shippingMethod,
        pincode: shippingAddress.pincode.trim()
      };

      const orderRes = await api.createRazorpayOrder(orderPayload);
      if (!orderRes.success) {
        throw new Error(orderRes.message || 'Could not initialize order.');
      }

      // 2. Open Real Razorpay Checkout modal
      await openRazorpayCheckout({
        orderData: orderRes.order,
        keyId: orderRes.keyId,
        customerDetails,
        items: orderPayload.items,
        shippingAddress: {
          fullName: customerDetails.fullName,
          phone: customerDetails.phone,
          ...shippingAddress
        },
        shippingMethod,
        couponCode: coupon?.code,
        onSuccess: (verifiedData) => {
          showSuccess('Payment verified successfully! Your order is confirmed.');
          clearCart();
          const orderNumber = verifiedData.order?.order_number;
          navigate(`/order-success/${orderNumber}`, { state: { order: verifiedData.order } });
        },
        onFailure: (err) => {
          setErrorMessage(err.message || 'Payment transaction was declined or failed.');
          showError(err.message || 'Payment failed. You may retry.');
        },
        onDismiss: () => {
          showInfo('Payment window closed. Your items remain in your bag.');
        }
      });
    } catch (error) {
      setErrorMessage(error.message || 'An error occurred while preparing your transaction.');
      showError(error.message || 'Checkout error.');
    } finally {
      setIsProcessingPayment(false);
    }
  };

  if (items.length === 0) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-24 text-center space-y-4">
        <h2 className="text-2xl font-serif text-slate-100">Your Shopping Bag is Empty</h2>
        <Link to="/shop" className="btn-gold text-xs px-6 py-3 inline-block">Return to Catalog</Link>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8 animate-fade-in">
      
      {/* Checkout Breadcrumb */}
      <div className="flex items-center gap-2 text-xs text-slate-400">
        <Link to="/cart" className="hover:text-amber-300">Bag</Link>
        <ChevronRight className="w-3.5 h-3.5" />
        <span className="text-amber-400 font-semibold">Secure Checkout</span>
      </div>

      <div className="pb-4 border-b border-slate-800">
        <div className="text-xs font-semibold uppercase tracking-[0.2em] text-amber-400 mb-1">
          Final Acquisition
        </div>
        <h1 className="text-3xl font-serif font-bold text-slate-100">
          White-Glove Delivery & Payment
        </h1>
      </div>

      {errorMessage && (
        <div className="p-4 rounded-xl bg-rose-500/10 border border-rose-500/40 text-rose-300 text-xs flex items-center gap-3">
          <AlertCircle className="w-5 h-5 shrink-0 text-rose-400" />
          <span>{errorMessage}</span>
        </div>
      )}

      {/* Main Checkout Form */}
      <form onSubmit={handleProceedToPayment} className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
        
        {/* Left 2 Columns: Customer Info, Shipping Address, Shipping Method */}
        <div className="lg:col-span-2 space-y-8">
          
          {/* 1. Client Identity */}
          <div className="glass-panel p-6 rounded-2xl border border-slate-800 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <h3 className="text-sm font-bold font-serif uppercase tracking-wider text-slate-100 flex items-center gap-2">
                <span className="w-5 h-5 rounded-full bg-amber-400 text-black text-[11px] font-bold flex items-center justify-center">1</span>
                <span>Client Identification</span>
              </h3>
              {!isAuthenticated && (
                <Link to="/login" className="text-xs text-amber-400 hover:text-amber-300 font-medium">
                  Have an account? Sign In
                </Link>
              )}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div>
                <label className="block text-slate-300 font-medium mb-1.5">Full Name *</label>
                <input
                  type="text"
                  value={customerDetails.fullName}
                  onChange={(e) => setCustomerDetails({ ...customerDetails, fullName: e.target.value })}
                  placeholder="e.g. Vikramaditya Singhania"
                  required
                  className="w-full bg-aura-900 border border-slate-700 rounded-lg p-2.5 text-slate-100 focus:outline-none focus:border-amber-400"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-medium mb-1.5">Phone Number (SMS/Courier Alerts) *</label>
                <input
                  type="tel"
                  value={customerDetails.phone}
                  onChange={(e) => setCustomerDetails({ ...customerDetails, phone: e.target.value })}
                  placeholder="e.g. +91 98765 43210"
                  required
                  className="w-full bg-aura-900 border border-slate-700 rounded-lg p-2.5 text-slate-100 focus:outline-none focus:border-amber-400"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="block text-slate-300 font-medium mb-1.5">Email Address (Order Invoice & Tracking) *</label>
                <input
                  type="email"
                  value={customerDetails.email}
                  onChange={(e) => setCustomerDetails({ ...customerDetails, email: e.target.value })}
                  placeholder="e.g. client@domain.com"
                  required
                  className="w-full bg-aura-900 border border-slate-700 rounded-lg p-2.5 text-slate-100 focus:outline-none focus:border-amber-400"
                />
              </div>
            </div>
          </div>

          {/* 2. Delivery Address */}
          <div className="glass-panel p-6 rounded-2xl border border-slate-800 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <h3 className="text-sm font-bold font-serif uppercase tracking-wider text-slate-100 flex items-center gap-2">
                <span className="w-5 h-5 rounded-full bg-amber-400 text-black text-[11px] font-bold flex items-center justify-center">2</span>
                <span>Delivery Address</span>
              </h3>
            </div>

            {/* Saved Addresses if logged in */}
            {savedAddresses.length > 0 && (
              <div className="space-y-3 pb-2">
                <label className="block text-xs font-semibold uppercase text-slate-400">
                  Select From Saved Address Book:
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {savedAddresses.map((addr) => (
                    <div
                      key={addr.id}
                      onClick={() => handleSelectSavedAddress(addr)}
                      className={`p-3.5 rounded-xl border text-xs cursor-pointer transition-all ${
                        selectedAddressId === addr.id && !isNewAddress
                          ? 'border-amber-400 bg-amber-500/10 shadow-glow-gold'
                          : 'border-slate-800 bg-aura-900 hover:border-slate-700'
                      }`}
                    >
                      <div className="font-bold text-slate-100 flex items-center justify-between">
                        <span>{addr.full_name}</span>
                        {addr.is_default === 1 && (
                          <span className="badge-tag bg-amber-500/20 text-amber-300">Default</span>
                        )}
                      </div>
                      <div className="text-slate-300 mt-1 truncate">{addr.address_line1}</div>
                      <div className="text-slate-400 mt-0.5">
                        {addr.city}, {addr.state} - {addr.pincode}
                      </div>
                    </div>
                  ))}
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setIsNewAddress(true);
                    setSelectedAddressId(null);
                    setShippingAddress({ addressLine1: '', addressLine2: '', city: '', state: '', pincode: '' });
                  }}
                  className="text-xs text-amber-400 hover:text-amber-300 font-medium"
                >
                  + Add & Ship to a New Address
                </button>
              </div>
            )}

            {/* Address Fields */}
            {(isNewAddress || savedAddresses.length === 0) && (
              <div className="space-y-3 text-xs pt-2">
                <div>
                  <label className="block text-slate-300 font-medium mb-1.5">Street Address / Suite / Residence *</label>
                  <input
                    type="text"
                    value={shippingAddress.addressLine1}
                    onChange={(e) => setShippingAddress({ ...shippingAddress, addressLine1: e.target.value })}
                    placeholder="e.g. Penthouse 402, Signature Towers, Golf Course Rd"
                    required
                    className="w-full bg-aura-900 border border-slate-700 rounded-lg p-2.5 text-slate-100 focus:outline-none focus:border-amber-400"
                  />
                </div>

                <div>
                  <label className="block text-slate-300 font-medium mb-1.5">Apartment, Landmark, Floor (Optional)</label>
                  <input
                    type="text"
                    value={shippingAddress.addressLine2}
                    onChange={(e) => setShippingAddress({ ...shippingAddress, addressLine2: e.target.value })}
                    placeholder="e.g. DLF Phase 5"
                    className="w-full bg-aura-900 border border-slate-700 rounded-lg p-2.5 text-slate-100 focus:outline-none focus:border-amber-400"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="block text-slate-300 font-medium mb-1.5">PIN Code (6 digits) *</label>
                    <input
                      type="text"
                      maxLength={6}
                      value={shippingAddress.pincode}
                      onChange={handlePincodeChange}
                      placeholder="e.g. 122002"
                      required
                      className="w-full bg-aura-900 border border-slate-700 rounded-lg p-2.5 text-slate-100 font-mono focus:outline-none focus:border-amber-400"
                    />
                  </div>

                  <div>
                    <label className="block text-slate-300 font-medium mb-1.5">City *</label>
                    <input
                      type="text"
                      value={shippingAddress.city}
                      onChange={(e) => setShippingAddress({ ...shippingAddress, city: e.target.value })}
                      placeholder="e.g. Gurugram"
                      required
                      className="w-full bg-aura-900 border border-slate-700 rounded-lg p-2.5 text-slate-100 focus:outline-none focus:border-amber-400"
                    />
                  </div>

                  <div>
                    <label className="block text-slate-300 font-medium mb-1.5">State *</label>
                    <input
                      type="text"
                      value={shippingAddress.state}
                      onChange={(e) => setShippingAddress({ ...shippingAddress, state: e.target.value })}
                      placeholder="e.g. Haryana"
                      required
                      className="w-full bg-aura-900 border border-slate-700 rounded-lg p-2.5 text-slate-100 focus:outline-none focus:border-amber-400"
                    />
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* 3. Shipping Method */}
          <div className="glass-panel p-6 rounded-2xl border border-slate-800 space-y-4">
            <h3 className="text-sm font-bold font-serif uppercase tracking-wider text-slate-100 flex items-center gap-2 pb-3 border-b border-slate-800">
              <span className="w-5 h-5 rounded-full bg-amber-400 text-black text-[11px] font-bold flex items-center justify-center">3</span>
              <span>Shipping Tier</span>
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <label
                onClick={() => setShippingMethod('standard')}
                className={`p-4 rounded-xl border flex flex-col justify-between cursor-pointer transition-all ${
                  shippingMethod === 'standard'
                    ? 'border-amber-400 bg-amber-500/10 shadow-glow-gold'
                    : 'border-slate-800 bg-aura-900 hover:border-slate-700'
                }`}
              >
                <div>
                  <div className="flex justify-between items-center mb-1">
                    <span className="text-xs font-bold text-slate-100">Standard Ground Insured</span>
                    <span className="text-xs font-serif font-bold text-amber-300">
                      {cartSubtotal >= 2499 ? 'COMPLIMENTARY' : '₹99'}
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-400">Delivered within 3 to 5 business days via Blue Dart</p>
                </div>
              </label>

              <label
                onClick={() => setShippingMethod('express')}
                className={`p-4 rounded-xl border flex flex-col justify-between cursor-pointer transition-all ${
                  shippingMethod === 'express'
                    ? 'border-amber-400 bg-amber-500/10 shadow-glow-gold'
                    : 'border-slate-800 bg-aura-900 hover:border-slate-700'
                }`}
              >
                <div>
                  <div className="flex justify-between items-center mb-1">
                    <span className="text-xs font-bold text-slate-100">Priority Air Express (48-Hr)</span>
                    <span className="text-xs font-serif font-bold text-amber-300">₹199</span>
                  </div>
                  <p className="text-[11px] text-slate-400">Dispatched in dedicated security vault containers</p>
                </div>
              </label>
            </div>
          </div>

        </div>

        {/* Right Column: Order Summary & Razorpay Trigger */}
        <div className="glass-panel p-6 rounded-2xl border border-slate-800 space-y-6 sticky top-28">
          <h3 className="text-base font-bold font-serif text-slate-100 pb-3 border-b border-slate-800">
            Order Review ({items.length} Items)
          </h3>

          {/* Items mini list */}
          <div className="max-h-52 overflow-y-auto space-y-3 pr-1">
            {items.map((item) => (
              <div key={`${item.productId}-${item.variantId || 'base'}`} className="flex items-center gap-3 text-xs">
                <img src={item.imageUrl} alt={item.name} className="w-12 h-12 rounded-lg object-cover bg-aura-950 border border-slate-800 shrink-0" />
                <div className="flex-1 min-w-0">
                  <div className="font-medium text-slate-200 truncate">{item.name}</div>
                  <div className="text-[11px] text-slate-400">Qty: {item.quantity} {item.variantName ? `• ${item.variantName}` : ''}</div>
                </div>
                <div className="font-serif font-semibold text-slate-100">{formatPrice(item.price * item.quantity)}</div>
              </div>
            ))}
          </div>

          {/* Pricing breakdown */}
          <div className="space-y-2 pt-4 border-t border-slate-800 text-xs">
            <div className="flex justify-between text-slate-400">
              <span>Subtotal</span>
              <span className="text-slate-200 font-serif font-medium">{formatPrice(cartSubtotal)}</span>
            </div>

            {discountAmount > 0 && (
              <div className="flex justify-between text-emerald-400 font-medium">
                <span>Coupon ({coupon?.code})</span>
                <span>-{formatPrice(discountAmount)}</span>
              </div>
            )}

            <div className="flex justify-between text-slate-400">
              <span>Shipping Fee</span>
              <span className="text-slate-200 font-serif">
                {shippingCharge === 0 ? <span className="text-emerald-400 font-semibold">FREE</span> : formatPrice(shippingCharge)}
              </span>
            </div>

            <div className="flex justify-between text-slate-400">
              <span>GST Tax (18% inclusive/added)</span>
              <span className="text-slate-200 font-serif">{formatPrice(taxAmount)}</span>
            </div>

            <div className="flex justify-between text-base font-bold text-slate-100 pt-3 border-t border-slate-800">
              <span>Payable Total</span>
              <span className="text-amber-300 font-serif text-xl">
                {formatPrice(payableTotal)}
              </span>
            </div>
          </div>

          {/* Razorpay Action Button */}
          <button
            type="submit"
            disabled={isProcessingPayment}
            className="w-full btn-gold py-4 flex items-center justify-center gap-2.5 text-xs font-bold uppercase shadow-glow-gold group disabled:opacity-50"
          >
            {isProcessingPayment ? (
              <>
                <LoadingSpinner size="sm" />
                <span>Authorizing Razorpay Gateway...</span>
              </>
            ) : (
              <>
                <Lock className="w-4 h-4" />
                <span>Pay {formatPrice(payableTotal)} via Razorpay</span>
              </>
            )}
          </button>

          <div className="text-[11px] text-slate-400 space-y-1.5 text-center pt-2">
            <div className="flex items-center justify-center gap-2 text-emerald-400 font-semibold">
              <ShieldCheck className="w-4 h-4" />
              <span>Official 256-Bit SSL Encryption</span>
            </div>
            <p className="text-[10px]">Supports UPI (GPay, PhonePe, Paytm), Visa, Mastercard, AMEX & NetBanking</p>
          </div>
        </div>

      </form>
    </div>
  );
};
