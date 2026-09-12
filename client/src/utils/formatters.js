/**
 * Format currency as Indian Rupee (₹)
 */
export const formatPrice = (amount) => {
  if (amount === undefined || amount === null || isNaN(amount)) return '₹0';
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0
  }).format(amount);
};

/**
 * Format Date strings nicely
 */
export const formatDate = (dateString) => {
  if (!dateString) return 'N/A';
  const date = new Date(dateString);
  return new Intl.DateTimeFormat('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  }).format(date);
};

/**
 * Map order statuses to badge colors and luxury labels
 */
export const getOrderStatusBadge = (status) => {
  switch (status) {
    case 'PENDING':
      return { label: 'Pending Verification', bg: 'bg-amber-500/10 text-amber-400 border-amber-500/30' };
    case 'CONFIRMED':
      return { label: 'Confirmed & Verified', bg: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30' };
    case 'PROCESSING':
      return { label: 'Vault Processing', bg: 'bg-indigo-500/10 text-indigo-400 border-indigo-500/30' };
    case 'PACKED':
      return { label: 'Custom Packed', bg: 'bg-cyan-500/10 text-cyan-400 border-cyan-500/30' };
    case 'SHIPPED':
      return { label: 'Shipped in Transit', bg: 'bg-blue-500/10 text-blue-400 border-blue-500/30' };
    case 'OUT FOR DELIVERY':
      return { label: 'Out For Delivery', bg: 'bg-purple-500/10 text-purple-400 border-purple-500/30' };
    case 'DELIVERED':
      return { label: 'Delivered', bg: 'bg-emerald-500/20 text-emerald-300 border-emerald-400/40' };
    case 'CANCELLED':
      return { label: 'Cancelled', bg: 'bg-rose-500/10 text-rose-400 border-rose-500/30' };
    case 'RETURNED':
      return { label: 'Returned & Refunded', bg: 'bg-slate-500/10 text-slate-400 border-slate-500/30' };
    default:
      return { label: status, bg: 'bg-slate-800 text-slate-300 border-slate-700' };
  }
};
