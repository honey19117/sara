const BASE_URL = import.meta.env.VITE_API_URL || '/api';

/**
 * Generic Fetch client wrapper with authentication header injection
 */
export async function apiRequest(endpoint, options = {}) {
  const token = localStorage.getItem('aura_auth_token');

  const headers = {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...(options.headers || {})
  };

  const url = `${BASE_URL}${endpoint.startsWith('/') ? endpoint : `/${endpoint}`}`;

  try {
    const response = await fetch(url, {
      ...options,
      headers
    });

    const data = await response.json().catch(() => ({}));

    if (!response.ok) {
      const error = new Error(data.message || `Request failed with status ${response.status}`);
      error.status = response.status;
      error.data = data;
      throw error;
    }

    return data;
  } catch (error) {
    console.error(`API Error on [${options.method || 'GET'} ${endpoint}]:`, error.message);
    throw error;
  }
}

export const api = {
  // Auth
  login: (credentials) => apiRequest('/auth/login', { method: 'POST', body: JSON.stringify(credentials) }),
  register: (userData) => apiRequest('/auth/register', { method: 'POST', body: JSON.stringify(userData) }),
  getMe: () => apiRequest('/auth/me'),
  updateProfile: (data) => apiRequest('/auth/profile', { method: 'PUT', body: JSON.stringify(data) }),
  changePassword: (data) => apiRequest('/auth/change-password', { method: 'PUT', body: JSON.stringify(data) }),
  
  // Addresses
  getAddresses: () => apiRequest('/auth/addresses'),
  addAddress: (address) => apiRequest('/auth/addresses', { method: 'POST', body: JSON.stringify(address) }),
  updateAddress: (id, address) => apiRequest(`/auth/addresses/${id}`, { method: 'PUT', body: JSON.stringify(address) }),
  deleteAddress: (id) => apiRequest(`/auth/addresses/${id}`, { method: 'DELETE' }),

  // Products & Categories
  getProducts: (params = {}) => {
    const queryString = new URLSearchParams(params).toString();
    return apiRequest(`/products${queryString ? `?${queryString}` : ''}`);
  },
  getProductBySlug: (slug) => apiRequest(`/products/${slug}`),
  getFeaturedProducts: () => apiRequest('/products/featured'),
  getTrendingProducts: () => apiRequest('/products/trending'),
  getCategories: () => apiRequest('/categories'),
  getCategoryBySlug: (slug) => apiRequest(`/categories/${slug}`),

  // Cart & Coupons
  validateCart: (items) => apiRequest('/cart/validate', { method: 'POST', body: JSON.stringify({ items }) }),
  validateCoupon: (code, cartSubtotal) => apiRequest('/coupons/validate', { method: 'POST', body: JSON.stringify({ code, cartSubtotal }) }),
  getAvailableCoupons: () => apiRequest('/coupons'),

  // Shipping
  calculateShipping: (data) => apiRequest('/shipping/calculate', { method: 'POST', body: JSON.stringify(data) }),
  validatePincode: (pincode) => apiRequest(`/shipping/pincode/${pincode}`),

  // Razorpay Payments
  getRazorpayKey: () => apiRequest('/payment/key'),
  createRazorpayOrder: (payload) => apiRequest('/payment/create-order', { method: 'POST', body: JSON.stringify(payload) }),
  verifyPayment: (payload) => apiRequest('/payment/verify', { method: 'POST', body: JSON.stringify(payload) }),
  recordPaymentFailure: (payload) => apiRequest('/payment/failure', { method: 'POST', body: JSON.stringify(payload) }),

  // Orders
  getMyOrders: () => apiRequest('/orders/my-orders'),
  getOrderDetails: (orderNumber) => apiRequest(`/orders/${orderNumber}`),
  trackOrder: (orderNumber) => apiRequest(`/orders/track/${orderNumber}`),
  cancelOrder: (orderNumber, reason) => apiRequest(`/orders/${orderNumber}/cancel`, { method: 'POST', body: JSON.stringify({ reason }) }),
  requestReturn: (orderNumber, reason) => apiRequest(`/orders/${orderNumber}/return`, { method: 'POST', body: JSON.stringify({ reason }) }),

  // Reviews
  addReview: (reviewData) => apiRequest('/reviews', { method: 'POST', body: JSON.stringify(reviewData) }),
  getProductReviews: (productId) => apiRequest(`/reviews/product/${productId}`),

  // Admin
  adminGetStats: () => apiRequest('/admin/stats'),
  adminGetProducts: () => apiRequest('/admin/products'),
  adminCreateProduct: (data) => apiRequest('/admin/products', { method: 'POST', body: JSON.stringify(data) }),
  adminUpdateProduct: (id, data) => apiRequest(`/admin/products/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  adminDeleteProduct: (id) => apiRequest(`/admin/products/${id}`, { method: 'DELETE' }),
  adminGetOrders: (status) => apiRequest(`/admin/orders${status ? `?status=${status}` : ''}`),
  adminUpdateOrderStatus: (id, data) => apiRequest(`/admin/orders/${id}/status`, { method: 'PUT', body: JSON.stringify(data) }),
  adminGetCoupons: () => apiRequest('/admin/coupons'),
  adminCreateCoupon: (data) => apiRequest('/admin/coupons', { method: 'POST', body: JSON.stringify(data) }),
  adminToggleCoupon: (id) => apiRequest(`/admin/coupons/${id}/toggle`, { method: 'PATCH' }),
  adminDeleteCoupon: (id) => apiRequest(`/admin/coupons/${id}`, { method: 'DELETE' }),
  adminGetReviews: () => apiRequest('/admin/reviews'),
  adminToggleReview: (id) => apiRequest(`/admin/reviews/${id}/toggle`, { method: 'PATCH' }),
  adminDeleteReview: (id) => apiRequest(`/admin/reviews/${id}`, { method: 'DELETE' }),
  adminGetSettings: () => apiRequest('/admin/settings'),
  adminUpdateSettings: (data) => apiRequest('/admin/settings', { method: 'PUT', body: JSON.stringify(data) })
};
