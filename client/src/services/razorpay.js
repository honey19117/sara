import { api } from './api';

export const loadRazorpayScript = () => {
  return new Promise((resolve) => {
    if (window.Razorpay) {
      return resolve(true);
    }
    const script = document.createElement('script');
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });
};

/**
 * Execute full Razorpay Checkout flow with real backend signature verification
 */
export const openRazorpayCheckout = async ({
  orderData,
  keyId,
  customerDetails,
  items,
  shippingAddress,
  shippingMethod,
  couponCode,
  onSuccess,
  onFailure,
  onDismiss
}) => {
  const isLoaded = await loadRazorpayScript();
  if (!isLoaded) {
    throw new Error('Razorpay SDK failed to load. Please check your internet connection.');
  }

  return new Promise((resolve, reject) => {
    const options = {
      key: keyId,
      amount: orderData.amount, // in paise
      currency: orderData.currency || 'INR',
      name: 'AURA Luxe',
      description: 'Haute Living & Precision Tech Order',
      image: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=200&q=80',
      order_id: orderData.id,
      prefill: {
        name: customerDetails.fullName,
        email: customerDetails.email,
        contact: customerDetails.phone
      },
      notes: {
        shipping_city: shippingAddress.city,
        shipping_pincode: shippingAddress.pincode
      },
      theme: {
        color: '#D4AF37', // AURA Gold
        backdrop_color: 'rgba(11, 15, 23, 0.85)'
      },
      modal: {
        ondismiss: function () {
          if (onDismiss) onDismiss();
          resolve({ status: 'dismissed' });
        }
      },
      handler: async function (response) {
        try {
          // Backend verification
          const verificationResult = await api.verifyPayment({
            razorpay_order_id: response.razorpay_order_id || orderData.id,
            razorpay_payment_id: response.razorpay_payment_id,
            razorpay_signature: response.razorpay_signature,
            items,
            customerDetails,
            shippingAddress,
            shippingMethod,
            couponCode
          });

          if (onSuccess) onSuccess(verificationResult);
          resolve(verificationResult);
        } catch (verifErr) {
          if (onFailure) onFailure(verifErr);
          reject(verifErr);
        }
      }
    };

    try {
      const rzpInstance = new window.Razorpay(options);
      
      rzpInstance.on('payment.failed', function (resp) {
        api.recordPaymentFailure({
          razorpay_order_id: orderData.id,
          error_code: resp.error.code,
          error_description: resp.error.description
        }).catch(() => {});
        
        if (onFailure) onFailure(new Error(resp.error.description || 'Payment was declined.'));
      });

      rzpInstance.open();
    } catch (err) {
      reject(err);
    }
  });
};
