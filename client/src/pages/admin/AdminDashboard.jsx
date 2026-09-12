import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  SlidersHorizontal,
  TrendingUp,
  Package,
  Users,
  AlertTriangle,
  Plus,
  Trash2,
  Edit2,
  CheckCircle2,
  Eye,
  Tag,
  MessageSquare,
  Settings,
  Truck,
  DollarSign,
  ArrowUpRight,
  ShieldAlert,
  Search,
  Check,
  X
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { api } from '../../services/api';
import { formatPrice, formatDate, getOrderStatusBadge } from '../../utils/formatters';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';
import { Modal } from '../../components/common/Modal';

export const AdminDashboard = () => {
  const { user, isAdmin } = useAuth();
  const navigate = useNavigate();
  const { showSuccess, showError } = useToast();

  const [activeTab, setActiveTab] = useState('overview'); // 'overview' | 'products' | 'orders' | 'coupons' | 'reviews' | 'settings'

  // Data states
  const [stats, setStats] = useState(null);
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [orders, setOrders] = useState([]);
  const [coupons, setCoupons] = useState([]);
  const [reviews, setReviews] = useState([]);
  const [settings, setSettings] = useState({});
  const [loading, setLoading] = useState(true);

  // Modals & form state
  const [isProductModalOpen, setIsProductModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [productForm, setProductForm] = useState({
    name: '',
    slug: '',
    category_id: '',
    description: '',
    short_description: '',
    price: '',
    compare_price: '',
    discount_percent: 0,
    sku: '',
    stock: 20,
    is_featured: false,
    is_trending: false,
    is_new_arrival: false,
    images: [''],
    variants: []
  });

  const [isCouponModalOpen, setIsCouponModalOpen] = useState(false);
  const [couponForm, setCouponForm] = useState({
    code: '',
    description: '',
    discount_type: 'percentage',
    discount_value: '',
    min_order_amount: '',
    max_discount: ''
  });

  const [orderStatusFilter, setOrderStatusFilter] = useState('ALL');

  // Tracking update modal
  const [trackingModalOrder, setTrackingModalOrder] = useState(null);
  const [trackingNumberInput, setTrackingNumberInput] = useState('');
  const [carrierNameInput, setCarrierNameInput] = useState('');

  useEffect(() => {
    if (!isAdmin) {
      navigate('/login');
      return;
    }
    loadAllData();
  }, [isAdmin, orderStatusFilter]);

  const loadAllData = async () => {
    setLoading(true);
    try {
      const [statsRes, prodRes, catRes, ordRes, cpnRes, revRes, setRes] = await Promise.all([
        api.adminGetStats(),
        api.adminGetProducts(),
        api.getCategories(),
        api.adminGetOrders(orderStatusFilter),
        api.adminGetCoupons(),
        api.adminGetReviews(),
        api.adminGetSettings()
      ]);

      if (statsRes.success) setStats(statsRes.stats);
      if (prodRes.success) setProducts(prodRes.products);
      if (catRes.success) setCategories(catRes.categories);
      if (ordRes.success) setOrders(ordRes.orders);
      if (cpnRes.success) setCoupons(cpnRes.coupons);
      if (revRes.success) setReviews(revRes.reviews);
      if (setRes.success) setSettings(setRes.settings);
    } catch (err) {
      console.error(err);
      showError('Failed to load administrative dataset.');
    } finally {
      setLoading(false);
    }
  };

  // --- PRODUCT CRUD ---
  const openNewProductModal = () => {
    setEditingProduct(null);
    setProductForm({
      name: '',
      slug: '',
      category_id: categories[0]?.id || '',
      description: '',
      short_description: '',
      price: '',
      compare_price: '',
      discount_percent: 0,
      sku: `AUR-${Date.now().toString().slice(-4)}`,
      stock: 25,
      is_featured: false,
      is_trending: false,
      is_new_arrival: true,
      images: ['https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=1000&q=80'],
      variants: []
    });
    setIsProductModalOpen(true);
  };

  const openEditProductModal = (prod) => {
    setEditingProduct(prod);
    setProductForm({
      name: prod.name,
      slug: prod.slug,
      category_id: prod.category_id || '',
      description: prod.description || '',
      short_description: prod.short_description || '',
      price: prod.price,
      compare_price: prod.compare_price || '',
      discount_percent: prod.discount_percent || 0,
      sku: prod.sku,
      stock: prod.stock,
      is_featured: prod.is_featured === 1,
      is_trending: prod.is_trending === 1,
      is_new_arrival: prod.is_new_arrival === 1,
      images: [prod.primary_image || ''],
      variants: []
    });
    setIsProductModalOpen(true);
  };

  const handleProductSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingProduct) {
        await api.adminUpdateProduct(editingProduct.id, productForm);
        showSuccess('Product details updated successfully.');
      } else {
        await api.adminCreateProduct(productForm);
        showSuccess('New luxury product added to catalog.');
      }
      setIsProductModalOpen(false);
      loadAllData();
    } catch (err) {
      showError(err.message || 'Product save failed.');
    }
  };

  const handleDeleteProduct = async (id) => {
    if (window.confirm('Permanently delete this product and its variants?')) {
      try {
        await api.adminDeleteProduct(id);
        showSuccess('Product removed from database.');
        loadAllData();
      } catch (err) {
        showError(err.message || 'Could not delete product.');
      }
    }
  };

  // --- ORDER STATUS UPDATES ---
  const handleOrderStatusChange = async (orderId, newStatus) => {
    try {
      await api.adminUpdateOrderStatus(orderId, { status: newStatus });
      showSuccess(`Order status transitioned to ${newStatus}.`);
      loadAllData();
    } catch (err) {
      showError(err.message || 'Failed to update order status.');
    }
  };

  const handleUpdateTracking = async (e) => {
    e.preventDefault();
    if (!trackingModalOrder) return;
    try {
      await api.adminUpdateOrderStatus(trackingModalOrder.id, {
        status: 'SHIPPED',
        trackingNumber: trackingNumberInput,
        carrierName: carrierNameInput
      });
      showSuccess('Tracking logistics and AWB assigned. Order marked as SHIPPED.');
      setTrackingModalOrder(null);
      loadAllData();
    } catch (err) {
      showError(err.message || 'Could not update tracking.');
    }
  };

  // --- COUPON CRUD ---
  const handleCreateCoupon = async (e) => {
    e.preventDefault();
    try {
      await api.adminCreateCoupon(couponForm);
      showSuccess(`Coupon ${couponForm.code} created.`);
      setIsCouponModalOpen(false);
      setCouponForm({ code: '', description: '', discount_type: 'percentage', discount_value: '', min_order_amount: '', max_discount: '' });
      loadAllData();
    } catch (err) {
      showError(err.message || 'Failed to create coupon.');
    }
  };

  const handleToggleCoupon = async (id) => {
    try {
      await api.adminToggleCoupon(id);
      showSuccess('Coupon status toggled.');
      loadAllData();
    } catch (err) {
      showError(err.message);
    }
  };

  const handleDeleteCoupon = async (id) => {
    if (window.confirm('Delete coupon code?')) {
      try {
        await api.adminDeleteCoupon(id);
        showSuccess('Coupon deleted.');
        loadAllData();
      } catch (err) {
        showError(err.message);
      }
    }
  };

  // --- REVIEW MODERATION ---
  const handleToggleReview = async (id) => {
    try {
      await api.adminToggleReview(id);
      showSuccess('Review approval toggled.');
      loadAllData();
    } catch (err) {
      showError(err.message);
    }
  };

  const handleDeleteReview = async (id) => {
    if (window.confirm('Delete customer review?')) {
      try {
        await api.adminDeleteReview(id);
        showSuccess('Review removed.');
        loadAllData();
      } catch (err) {
        showError(err.message);
      }
    }
  };

  // --- SETTINGS UPDATE ---
  const handleSettingsUpdate = async (e) => {
    e.preventDefault();
    try {
      await api.adminUpdateSettings(settings);
      showSuccess('Store settings and shipping rules updated.');
      loadAllData();
    } catch (err) {
      showError(err.message || 'Failed to update settings.');
    }
  };

  if (!isAdmin) return null;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8 animate-fade-in">
      
      {/* Dashboard Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between pb-6 border-b border-slate-800 gap-4">
        <div>
          <div className="text-xs font-semibold uppercase tracking-[0.2em] text-amber-400 mb-1 flex items-center gap-1.5">
            <ShieldAlert className="w-3.5 h-3.5" />
            <span>Executive Governance Desk</span>
          </div>
          <h1 className="text-3xl font-serif font-bold text-slate-100">
            AURA Control Console
          </h1>
        </div>

        <div className="flex items-center gap-3">
          <Link to="/shop" className="btn-ghost text-xs px-4 py-2 border border-slate-700 rounded-lg hover:border-amber-400">
            View Live Storefront
          </Link>
        </div>
      </div>

      {/* Admin Nav Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 border-b border-slate-800 text-xs">
        {[
          { key: 'overview', label: 'Overview & Analytics', icon: TrendingUp },
          { key: 'products', label: `Products (${products.length})`, icon: Package },
          { key: 'orders', label: `Orders (${orders.length})`, icon: Truck },
          { key: 'coupons', label: `Coupons (${coupons.length})`, icon: Tag },
          { key: 'reviews', label: `Reviews (${reviews.length})`, icon: MessageSquare },
          { key: 'settings', label: 'Store & Shipping Settings', icon: Settings }
        ].map((tab) => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`px-4 py-2.5 rounded-xl font-semibold flex items-center gap-2 transition-all shrink-0 ${
                activeTab === tab.key
                  ? 'bg-amber-400 text-black shadow-glow-gold'
                  : 'bg-aura-850 text-slate-400 hover:text-slate-200 hover:bg-white/5 border border-slate-800'
              }`}
            >
              <Icon className="w-4 h-4" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {loading ? (
        <LoadingSpinner size="lg" className="py-24" />
      ) : (
        <>
          {/* ================= TAB 1: OVERVIEW & ANALYTICS ================= */}
          {activeTab === 'overview' && stats && (
            <div className="space-y-8 animate-slide-up">
              
              {/* Stat Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                <div className="glass-card p-6 border border-slate-800 space-y-2">
                  <div className="flex justify-between items-center text-slate-400 text-xs uppercase font-semibold">
                    <span>Total Realized Revenue</span>
                    <DollarSign className="w-4 h-4 text-emerald-400" />
                  </div>
                  <div className="text-2xl sm:text-3xl font-bold font-serif text-amber-300">
                    {formatPrice(stats.totalRevenue)}
                  </div>
                  <div className="text-[11px] text-emerald-400 flex items-center gap-1">
                    <ArrowUpRight className="w-3 h-3" /> From confirmed & paid orders
                  </div>
                </div>

                <div className="glass-card p-6 border border-slate-800 space-y-2">
                  <div className="flex justify-between items-center text-slate-400 text-xs uppercase font-semibold">
                    <span>Total Orders Placed</span>
                    <Package className="w-4 h-4 text-blue-400" />
                  </div>
                  <div className="text-2xl sm:text-3xl font-bold font-serif text-slate-100">
                    {stats.totalOrders}
                  </div>
                  <div className="text-[11px] text-slate-400">All lifecycle statuses</div>
                </div>

                <div className="glass-card p-6 border border-slate-800 space-y-2">
                  <div className="flex justify-between items-center text-slate-400 text-xs uppercase font-semibold">
                    <span>Active Clientele</span>
                    <Users className="w-4 h-4 text-purple-400" />
                  </div>
                  <div className="text-2xl sm:text-3xl font-bold font-serif text-slate-100">
                    {stats.totalCustomers}
                  </div>
                  <div className="text-[11px] text-slate-400">Registered luxury members</div>
                </div>

                <div className="glass-card p-6 border border-slate-800 space-y-2">
                  <div className="flex justify-between items-center text-slate-400 text-xs uppercase font-semibold">
                    <span>Low Stock Vault Alerts</span>
                    <AlertTriangle className="w-4 h-4 text-amber-400" />
                  </div>
                  <div className="text-2xl sm:text-3xl font-bold font-serif text-amber-400">
                    {stats.lowStockCount}
                  </div>
                  <div className="text-[11px] text-amber-400/80">Inventory below 10 units</div>
                </div>
              </div>

              {/* Top Selling Products & Recent Orders Grid */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                
                {/* Top Selling Products */}
                <div className="glass-panel p-6 rounded-2xl border border-slate-800 space-y-4">
                  <h3 className="text-base font-bold font-serif text-slate-100 pb-3 border-b border-slate-800">
                    Top-Selling Curations
                  </h3>
                  <div className="space-y-3">
                    {stats.topProducts?.length > 0 ? (
                      stats.topProducts.map((p) => (
                        <div key={p.id} className="flex items-center justify-between p-3 rounded-xl bg-aura-900 border border-slate-800 text-xs">
                          <div className="flex items-center gap-3">
                            {p.image_url && (
                              <img src={p.image_url} alt={p.name} className="w-10 h-10 rounded-lg object-cover bg-aura-950" />
                            )}
                            <div>
                              <div className="font-semibold text-slate-100">{p.name}</div>
                              <div className="text-[11px] text-amber-400 font-serif">{formatPrice(p.price)}</div>
                            </div>
                          </div>
                          <div className="text-right">
                            <div className="font-bold text-slate-200">{p.total_sold} Sold</div>
                            <div className="text-[11px] text-emerald-400 font-serif">{formatPrice(p.total_revenue)}</div>
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="text-xs text-slate-400 text-center py-6">No sales recorded yet.</div>
                    )}
                  </div>
                </div>

                {/* Recent Orders Overview */}
                <div className="glass-panel p-6 rounded-2xl border border-slate-800 space-y-4">
                  <h3 className="text-base font-bold font-serif text-slate-100 pb-3 border-b border-slate-800">
                    Recent Order Activity
                  </h3>
                  <div className="space-y-3">
                    {stats.recentOrders?.slice(0, 5).map((ord) => {
                      const badge = getOrderStatusBadge(ord.status);
                      return (
                        <div key={ord.id} className="flex items-center justify-between p-3 rounded-xl bg-aura-900 border border-slate-800 text-xs">
                          <div>
                            <span className="font-mono font-bold text-amber-300">{ord.order_number}</span>
                            <div className="text-[11px] text-slate-400 mt-0.5">{ord.customer_name || 'Guest Client'}</div>
                          </div>
                          <div className="text-right space-y-1">
                            <div className="font-serif font-bold text-slate-100">{formatPrice(ord.total_amount)}</div>
                            <span className={`inline-block px-2 py-0.5 rounded text-[10px] font-bold border ${badge.bg}`}>
                              {ord.status}
                            </span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

              </div>

            </div>
          )}

          {/* ================= TAB 2: PRODUCT MANAGEMENT ================= */}
          {activeTab === 'products' && (
            <div className="space-y-6 animate-slide-up">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-slate-800 gap-4">
                <div>
                  <h3 className="text-lg font-bold font-serif text-slate-100">Catalog Registry</h3>
                  <p className="text-xs text-slate-400">Add, adjust pricing, manage inventory stock and upload assets.</p>
                </div>
                <button
                  onClick={openNewProductModal}
                  className="btn-gold text-xs px-5 py-2.5 font-bold flex items-center gap-1.5 self-start sm:self-auto"
                >
                  <Plus className="w-4 h-4" />
                  <span>Create Masterpiece</span>
                </button>
              </div>

              <div className="glass-panel rounded-2xl border border-slate-800 overflow-x-auto">
                <table className="w-full text-left text-xs text-slate-300">
                  <thead className="bg-aura-950 border-b border-slate-800 text-slate-400 uppercase font-bold text-[10px] tracking-wider">
                    <tr>
                      <th className="p-4">Item</th>
                      <th className="p-4">SKU</th>
                      <th className="p-4">Category</th>
                      <th className="p-4">Price</th>
                      <th className="p-4">Stock</th>
                      <th className="p-4">Badges</th>
                      <th className="p-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/80">
                    {products.map((p) => (
                      <tr key={p.id} className="hover:bg-white/5 transition-colors">
                        <td className="p-4 flex items-center gap-3">
                          <img
                            src={p.primary_image}
                            alt={p.name}
                            className="w-12 h-12 rounded-xl object-cover bg-aura-950 border border-slate-800 shrink-0"
                          />
                          <div className="font-semibold text-slate-100 line-clamp-1 max-w-xs">{p.name}</div>
                        </td>
                        <td className="p-4 font-mono text-slate-400">{p.sku}</td>
                        <td className="p-4 text-amber-400/90">{p.category_name}</td>
                        <td className="p-4 font-serif font-bold text-slate-100">{formatPrice(p.price)}</td>
                        <td className="p-4">
                          <span
                            className={`px-2.5 py-1 rounded-full text-[10px] font-bold ${
                              p.stock > 10
                                ? 'bg-emerald-500/10 text-emerald-400'
                                : p.stock > 0
                                ? 'bg-amber-500/10 text-amber-400'
                                : 'bg-rose-500/10 text-rose-400'
                            }`}
                          >
                            {p.stock} Units
                          </span>
                        </td>
                        <td className="p-4 space-x-1">
                          {p.is_featured === 1 && <span className="badge-tag bg-amber-500/20 text-amber-300">Feat</span>}
                          {p.is_trending === 1 && <span className="badge-tag bg-blue-500/20 text-blue-300">Trend</span>}
                        </td>
                        <td className="p-4 text-right space-x-2">
                          <button
                            onClick={() => openEditProductModal(p)}
                            className="p-1.5 text-slate-400 hover:text-amber-300 rounded-lg hover:bg-white/5 transition-colors"
                            title="Edit"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDeleteProduct(p.id)}
                            className="p-1.5 text-slate-400 hover:text-rose-400 rounded-lg hover:bg-white/5 transition-colors"
                            title="Delete"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* ================= TAB 3: ORDER MANAGEMENT ================= */}
          {activeTab === 'orders' && (
            <div className="space-y-6 animate-slide-up">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-slate-800 gap-4">
                <div>
                  <h3 className="text-lg font-bold font-serif text-slate-100">Fulfillment & Logistics</h3>
                  <p className="text-xs text-slate-400">Progress order statuses, assign tracking codes, and process returns.</p>
                </div>

                {/* Status Filter */}
                <select
                  value={orderStatusFilter}
                  onChange={(e) => setOrderStatusFilter(e.target.value)}
                  className="bg-aura-850 border border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-amber-400"
                >
                  <option value="ALL">All Statuses</option>
                  <option value="CONFIRMED">CONFIRMED</option>
                  <option value="PROCESSING">PROCESSING</option>
                  <option value="PACKED">PACKED</option>
                  <option value="SHIPPED">SHIPPED</option>
                  <option value="OUT FOR DELIVERY">OUT FOR DELIVERY</option>
                  <option value="DELIVERED">DELIVERED</option>
                  <option value="CANCELLED">CANCELLED</option>
                </select>
              </div>

              <div className="space-y-4">
                {orders.map((ord) => {
                  const badge = getOrderStatusBadge(ord.status);
                  return (
                    <div
                      key={ord.id}
                      className="glass-card p-6 rounded-2xl border border-slate-800 space-y-4"
                    >
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b border-slate-800 gap-3 text-xs">
                        <div>
                          <span className="font-mono font-bold text-amber-300 text-sm">{ord.order_number}</span>
                          <span className="text-slate-400 ml-2">({formatDate(ord.created_at)})</span>
                          <div className="text-slate-300 font-semibold mt-0.5">
                            Client: {ord.customer_name || ord.guest_name || 'Guest'} ({ord.customer_email || ord.guest_email})
                          </div>
                        </div>

                        <div className="flex items-center gap-3">
                          <span className={`px-3 py-1 rounded-full text-xs font-bold border ${badge.bg}`}>
                            {ord.status}
                          </span>
                          <span className="font-serif font-bold text-base text-slate-100">
                            {formatPrice(ord.total_amount)}
                          </span>
                        </div>
                      </div>

                      {/* Items */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                        <div className="space-y-1.5">
                          {ord.items?.map((it) => (
                            <div key={it.id} className="text-slate-300">
                              • <strong>{it.product_name}</strong> {it.variant_name ? `(${it.variant_name})` : ''} × {it.quantity}
                            </div>
                          ))}
                        </div>

                        <div className="text-slate-400 text-right space-y-1">
                          <div>City: <strong className="text-slate-200">{ord.shippingAddress?.city}, {ord.shippingAddress?.state}</strong></div>
                          <div>Tracking: <span className="font-mono text-amber-400">{ord.tracking_number || 'None'}</span></div>
                        </div>
                      </div>

                      {/* Admin Controls: Status Dropdown & Tracking Button */}
                      <div className="pt-3 border-t border-slate-800 flex flex-wrap items-center justify-between gap-3 text-xs">
                        <div className="flex items-center gap-2">
                          <span className="text-slate-400 font-medium">Update Status:</span>
                          <select
                            value={ord.status}
                            onChange={(e) => handleOrderStatusChange(ord.id, e.target.value)}
                            className="bg-aura-900 border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-amber-400 cursor-pointer"
                          >
                            <option value="PENDING">PENDING</option>
                            <option value="CONFIRMED">CONFIRMED</option>
                            <option value="PROCESSING">PROCESSING</option>
                            <option value="PACKED">PACKED</option>
                            <option value="SHIPPED">SHIPPED</option>
                            <option value="OUT FOR DELIVERY">OUT FOR DELIVERY</option>
                            <option value="DELIVERED">DELIVERED</option>
                            <option value="CANCELLED">CANCELLED</option>
                          </select>
                        </div>

                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => {
                              setTrackingModalOrder(ord);
                              setTrackingNumberInput(ord.tracking_number || `AWB-${Math.floor(10000000 + Math.random() * 90000000)}`);
                              setCarrierNameInput(ord.carrier_name || 'Blue Dart Express');
                            }}
                            className="btn-outline-gold text-xs px-3.5 py-1.5 flex items-center gap-1.5"
                          >
                            <Truck className="w-3.5 h-3.5" />
                            <span>Assign Tracking</span>
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* ================= TAB 4: COUPONS ================= */}
          {activeTab === 'coupons' && (
            <div className="space-y-6 animate-slide-up">
              <div className="flex justify-between items-center pb-4 border-b border-slate-800">
                <div>
                  <h3 className="text-lg font-bold font-serif text-slate-100">Promo Certificates</h3>
                  <p className="text-xs text-slate-400">Issue percentage and fixed promotional discounts.</p>
                </div>
                <button
                  onClick={() => setIsCouponModalOpen(true)}
                  className="btn-gold text-xs px-5 py-2.5 font-bold flex items-center gap-1.5"
                >
                  <Plus className="w-4 h-4" />
                  <span>Create Coupon</span>
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {coupons.map((cpn) => (
                  <div key={cpn.id} className="glass-card p-6 rounded-2xl border border-slate-800 space-y-4">
                    <div className="flex justify-between items-start">
                      <div>
                        <div className="font-mono text-base font-bold text-amber-300">{cpn.code}</div>
                        <p className="text-xs text-slate-400 mt-1">{cpn.description}</p>
                      </div>
                      <span className={`badge-tag ${cpn.is_active === 1 ? 'bg-emerald-500/20 text-emerald-300' : 'bg-slate-700 text-slate-400'}`}>
                        {cpn.is_active === 1 ? 'Active' : 'Disabled'}
                      </span>
                    </div>

                    <div className="text-xs text-slate-300 space-y-1">
                      <div>Discount: <strong>{cpn.discount_type === 'percentage' ? `${cpn.discount_value}%` : formatPrice(cpn.discount_value)}</strong></div>
                      <div>Min Cart Subtotal: {formatPrice(cpn.min_order_amount)}</div>
                      <div>Times Used: <strong className="text-amber-400">{cpn.times_used}</strong></div>
                    </div>

                    <div className="pt-3 border-t border-slate-800 flex justify-between items-center">
                      <button
                        onClick={() => handleToggleCoupon(cpn.id)}
                        className="text-xs text-slate-400 hover:text-amber-300"
                      >
                        {cpn.is_active === 1 ? 'Deactivate' : 'Activate'}
                      </button>
                      <button
                        onClick={() => handleDeleteCoupon(cpn.id)}
                        className="text-slate-400 hover:text-rose-400 p-1"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ================= TAB 5: REVIEWS MODERATION ================= */}
          {activeTab === 'reviews' && (
            <div className="space-y-6 animate-slide-up">
              <div className="pb-4 border-b border-slate-800">
                <h3 className="text-lg font-bold font-serif text-slate-100">Review Moderation Queue</h3>
                <p className="text-xs text-slate-400">Review and moderate client published ratings and comments.</p>
              </div>

              <div className="space-y-4">
                {reviews.map((rev) => (
                  <div key={rev.id} className="glass-card p-6 rounded-2xl border border-slate-800 flex flex-col sm:flex-row justify-between gap-4">
                    <div className="space-y-2 text-xs">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-slate-100">{rev.user_name}</span>
                        <span className="text-amber-400 font-bold">★ {rev.rating}/5</span>
                        <span className="text-slate-500">• Product: {rev.product_name}</span>
                      </div>
                      <h4 className="font-semibold text-slate-200">{rev.title}</h4>
                      <p className="text-slate-300 italic">"{rev.comment}"</p>
                    </div>

                    <div className="flex items-center gap-3 shrink-0 self-end sm:self-center">
                      <button
                        onClick={() => handleToggleReview(rev.id)}
                        className={`px-3 py-1.5 rounded-lg text-xs font-semibold ${
                          rev.is_approved === 1 ? 'bg-emerald-500/10 text-emerald-300 border border-emerald-500/30' : 'bg-amber-500/10 text-amber-300 border border-amber-500/30'
                        }`}
                      >
                        {rev.is_approved === 1 ? 'Approved' : 'Pending'}
                      </button>
                      <button
                        onClick={() => handleDeleteReview(rev.id)}
                        className="p-1.5 text-slate-400 hover:text-rose-400"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ================= TAB 6: SETTINGS ================= */}
          {activeTab === 'settings' && (
            <div className="glass-panel p-8 rounded-2xl border border-slate-800 space-y-6 max-w-2xl animate-slide-up">
              <div className="pb-4 border-b border-slate-800">
                <h3 className="text-base font-bold font-serif text-slate-100">Global Store & Shipping Parameters</h3>
                <p className="text-xs text-slate-400">Configure free shipping thresholds, GST taxes, and Razorpay mode.</p>
              </div>

              <form onSubmit={handleSettingsUpdate} className="space-y-4 text-xs">
                <div>
                  <label className="block text-slate-300 font-medium mb-1">Store Name</label>
                  <input
                    type="text"
                    value={settings.store_name || ''}
                    onChange={(e) => setSettings({ ...settings, store_name: e.target.value })}
                    className="w-full bg-aura-900 border border-slate-700 rounded-lg p-2.5 text-slate-100"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-slate-300 font-medium mb-1">Free Shipping Threshold (₹)</label>
                    <input
                      type="number"
                      value={settings.free_shipping_threshold || ''}
                      onChange={(e) => setSettings({ ...settings, free_shipping_threshold: e.target.value })}
                      className="w-full bg-aura-900 border border-slate-700 rounded-lg p-2.5 text-slate-100"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-300 font-medium mb-1">Standard Shipping Charge (₹)</label>
                    <input
                      type="number"
                      value={settings.standard_shipping_charge || ''}
                      onChange={(e) => setSettings({ ...settings, standard_shipping_charge: e.target.value })}
                      className="w-full bg-aura-900 border border-slate-700 rounded-lg p-2.5 text-slate-100"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-slate-300 font-medium mb-1">Express Shipping Charge (₹)</label>
                    <input
                      type="number"
                      value={settings.express_shipping_charge || ''}
                      onChange={(e) => setSettings({ ...settings, express_shipping_charge: e.target.value })}
                      className="w-full bg-aura-900 border border-slate-700 rounded-lg p-2.5 text-slate-100"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-300 font-medium mb-1">GST Tax Rate (%)</label>
                    <input
                      type="number"
                      value={settings.tax_rate_percentage || '18'}
                      onChange={(e) => setSettings({ ...settings, tax_rate_percentage: e.target.value })}
                      className="w-full bg-aura-900 border border-slate-700 rounded-lg p-2.5 text-slate-100"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-slate-300 font-medium mb-1">Razorpay Environment Mode</label>
                  <select
                    value={settings.razorpay_mode || 'TEST'}
                    onChange={(e) => setSettings({ ...settings, razorpay_mode: e.target.value })}
                    className="w-full bg-aura-900 border border-slate-700 rounded-lg p-2.5 text-slate-100 cursor-pointer"
                  >
                    <option value="TEST">TEST Sandbox Mode (Safe for Testing)</option>
                    <option value="LIVE">LIVE Production Mode (Real Gateway)</option>
                  </select>
                </div>

                <div className="pt-3">
                  <button type="submit" className="btn-gold text-xs px-6 py-2.5 font-bold">
                    Save Global Settings
                  </button>
                </div>
              </form>
            </div>
          )}
        </>
      )}

      {/* --- ADD / EDIT PRODUCT MODAL --- */}
      <Modal
        isOpen={isProductModalOpen}
        onClose={() => setIsProductModalOpen(false)}
        title={editingProduct ? 'Edit Masterpiece' : 'Create New Masterpiece'}
        maxWidth="max-w-2xl"
      >
        <form onSubmit={handleProductSubmit} className="space-y-4 text-xs max-h-[70vh] overflow-y-auto pr-1">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-slate-300 font-medium mb-1">Product Name *</label>
              <input
                type="text"
                value={productForm.name}
                onChange={(e) => setProductForm({ ...productForm, name: e.target.value })}
                required
                className="w-full bg-aura-900 border border-slate-700 rounded-lg p-2.5 text-slate-100"
              />
            </div>
            <div>
              <label className="block text-slate-300 font-medium mb-1">SKU *</label>
              <input
                type="text"
                value={productForm.sku}
                onChange={(e) => setProductForm({ ...productForm, sku: e.target.value })}
                required
                className="w-full bg-aura-900 border border-slate-700 rounded-lg p-2.5 text-slate-100 font-mono"
              />
            </div>
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="block text-slate-300 font-medium mb-1">Category</label>
              <select
                value={productForm.category_id}
                onChange={(e) => setProductForm({ ...productForm, category_id: e.target.value })}
                className="w-full bg-aura-900 border border-slate-700 rounded-lg p-2.5 text-slate-100"
              >
                {categories.map((c) => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-slate-300 font-medium mb-1">Price (₹) *</label>
              <input
                type="number"
                value={productForm.price}
                onChange={(e) => setProductForm({ ...productForm, price: e.target.value })}
                required
                className="w-full bg-aura-900 border border-slate-700 rounded-lg p-2.5 text-slate-100"
              />
            </div>
            <div>
              <label className="block text-slate-300 font-medium mb-1">Inventory Stock *</label>
              <input
                type="number"
                value={productForm.stock}
                onChange={(e) => setProductForm({ ...productForm, stock: e.target.value })}
                required
                className="w-full bg-aura-900 border border-slate-700 rounded-lg p-2.5 text-slate-100"
              />
            </div>
          </div>

          <div>
            <label className="block text-slate-300 font-medium mb-1">Primary Image URL</label>
            <input
              type="url"
              value={productForm.images[0] || ''}
              onChange={(e) => setProductForm({ ...productForm, images: [e.target.value] })}
              placeholder="https://images.unsplash.com/..."
              className="w-full bg-aura-900 border border-slate-700 rounded-lg p-2.5 text-slate-100"
            />
          </div>

          <div>
            <label className="block text-slate-300 font-medium mb-1">Short Description</label>
            <input
              type="text"
              value={productForm.short_description}
              onChange={(e) => setProductForm({ ...productForm, short_description: e.target.value })}
              placeholder="Brief highlighted feature..."
              className="w-full bg-aura-900 border border-slate-700 rounded-lg p-2.5 text-slate-100"
            />
          </div>

          <div>
            <label className="block text-slate-300 font-medium mb-1">Full Description</label>
            <textarea
              rows={4}
              value={productForm.description}
              onChange={(e) => setProductForm({ ...productForm, description: e.target.value })}
              className="w-full bg-aura-900 border border-slate-700 rounded-lg p-2.5 text-slate-100 leading-relaxed"
            />
          </div>

          <div className="flex gap-4 pt-1">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={productForm.is_featured}
                onChange={(e) => setProductForm({ ...productForm, is_featured: e.target.checked })}
                className="w-4 h-4 rounded text-amber-500 bg-aura-900"
              />
              <span className="text-slate-300">Featured</span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={productForm.is_trending}
                onChange={(e) => setProductForm({ ...productForm, is_trending: e.target.checked })}
                className="w-4 h-4 rounded text-amber-500 bg-aura-900"
              />
              <span className="text-slate-300">Trending</span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={productForm.is_new_arrival}
                onChange={(e) => setProductForm({ ...productForm, is_new_arrival: e.target.checked })}
                className="w-4 h-4 rounded text-amber-500 bg-aura-900"
              />
              <span className="text-slate-300">New Arrival</span>
            </label>
          </div>

          <div className="pt-3 flex justify-end gap-2 border-t border-slate-800">
            <button
              type="button"
              onClick={() => setIsProductModalOpen(false)}
              className="btn-ghost text-xs px-4 py-2"
            >
              Cancel
            </button>
            <button type="submit" className="btn-gold text-xs px-6 py-2.5 font-bold">
              Save Masterpiece
            </button>
          </div>
        </form>
      </Modal>

      {/* --- CREATE COUPON MODAL --- */}
      <Modal
        isOpen={isCouponModalOpen}
        onClose={() => setIsCouponModalOpen(false)}
        title="Create Promotional Coupon"
      >
        <form onSubmit={handleCreateCoupon} className="space-y-4 text-xs">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-slate-300 font-medium mb-1">Coupon Code *</label>
              <input
                type="text"
                value={couponForm.code}
                onChange={(e) => setCouponForm({ ...couponForm, code: e.target.value.toUpperCase() })}
                placeholder="e.g. VIP25"
                required
                className="w-full bg-aura-900 border border-slate-700 rounded-lg p-2 text-slate-100 uppercase"
              />
            </div>
            <div>
              <label className="block text-slate-300 font-medium mb-1">Discount Type</label>
              <select
                value={couponForm.discount_type}
                onChange={(e) => setCouponForm({ ...couponForm, discount_type: e.target.value })}
                className="w-full bg-aura-900 border border-slate-700 rounded-lg p-2 text-slate-100"
              >
                <option value="percentage">Percentage (%)</option>
                <option value="fixed">Fixed Amount (₹)</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-slate-300 font-medium mb-1">Discount Value *</label>
              <input
                type="number"
                value={couponForm.discount_value}
                onChange={(e) => setCouponForm({ ...couponForm, discount_value: e.target.value })}
                required
                placeholder="e.g. 20"
                className="w-full bg-aura-900 border border-slate-700 rounded-lg p-2 text-slate-100"
              />
            </div>
            <div>
              <label className="block text-slate-300 font-medium mb-1">Min Cart Subtotal (₹)</label>
              <input
                type="number"
                value={couponForm.min_order_amount}
                onChange={(e) => setCouponForm({ ...couponForm, min_order_amount: e.target.value })}
                placeholder="e.g. 4999"
                className="w-full bg-aura-900 border border-slate-700 rounded-lg p-2 text-slate-100"
              />
            </div>
          </div>

          <div>
            <label className="block text-slate-300 font-medium mb-1">Description</label>
            <input
              type="text"
              value={couponForm.description}
              onChange={(e) => setCouponForm({ ...couponForm, description: e.target.value })}
              placeholder="e.g. 20% off on all timepieces"
              className="w-full bg-aura-900 border border-slate-700 rounded-lg p-2 text-slate-100"
            />
          </div>

          <div className="pt-2 flex justify-end gap-2">
            <button
              type="button"
              onClick={() => setIsCouponModalOpen(false)}
              className="btn-ghost text-xs px-4 py-2"
            >
              Cancel
            </button>
            <button type="submit" className="btn-gold text-xs px-6 py-2 font-bold">
              Issue Coupon
            </button>
          </div>
        </form>
      </Modal>

      {/* --- ASSIGN TRACKING MODAL --- */}
      <Modal
        isOpen={!!trackingModalOrder}
        onClose={() => setTrackingModalOrder(null)}
        title={`Assign Logistics Tracking: ${trackingModalOrder?.order_number}`}
      >
        <form onSubmit={handleUpdateTracking} className="space-y-4 text-xs">
          <div>
            <label className="block text-slate-300 font-medium mb-1">Courier Carrier *</label>
            <input
              type="text"
              value={carrierNameInput}
              onChange={(e) => setCarrierNameInput(e.target.value)}
              required
              className="w-full bg-aura-900 border border-slate-700 rounded-lg p-2 text-slate-100"
            />
          </div>
          <div>
            <label className="block text-slate-300 font-medium mb-1">AWB / Air Waybill Number *</label>
            <input
              type="text"
              value={trackingNumberInput}
              onChange={(e) => setTrackingNumberInput(e.target.value)}
              required
              className="w-full bg-aura-900 border border-slate-700 rounded-lg p-2 text-slate-100 font-mono"
            />
          </div>
          <div className="pt-2 flex justify-end gap-2">
            <button
              type="button"
              onClick={() => setTrackingModalOrder(null)}
              className="btn-ghost text-xs px-4 py-2"
            >
              Cancel
            </button>
            <button type="submit" className="btn-gold text-xs px-6 py-2 font-bold">
              Mark Shipped & Update
            </button>
          </div>
        </form>
      </Modal>

    </div>
  );
};
