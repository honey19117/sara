import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import {
  Search,
  ShoppingBag,
  Heart,
  User,
  Menu,
  X,
  ShieldCheck,
  ChevronDown,
  LogOut,
  Package,
  SlidersHorizontal,
  Compass,
  Sparkles
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useCart } from '../../context/CartContext';
import { useWishlist } from '../../context/WishlistContext';
import { api } from '../../services/api';
import { formatPrice } from '../../utils/formatters';

export const Navbar = () => {
  const { user, isAuthenticated, isAdmin, logout } = useAuth();
  const { cartCount, openDrawer } = useCart();
  const { wishlistCount } = useWishlist();

  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const [showSearchDropdown, setShowSearchDropdown] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);

  const searchRef = useRef(null);
  const userMenuRef = useRef(null);
  const navigate = useNavigate();
  const location = useLocation();

  // Close menus on route change
  useEffect(() => {
    setIsMobileMenuOpen(false);
    setIsUserMenuOpen(false);
    setShowSearchDropdown(false);
  }, [location.pathname]);

  // Click outside listener for search & profile menu
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (searchRef.current && !searchRef.current.contains(e.target)) {
        setShowSearchDropdown(false);
      }
      if (userMenuRef.current && !userMenuRef.current.contains(e.target)) {
        setIsUserMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Debounced search
  useEffect(() => {
    if (!searchQuery.trim()) {
      setSearchResults([]);
      setIsSearching(false);
      return;
    }

    const timer = setTimeout(async () => {
      setIsSearching(true);
      try {
        const data = await api.getProducts({ q: searchQuery.trim(), limit: 5 });
        if (data.success) {
          setSearchResults(data.products);
          setShowSearchDropdown(true);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setIsSearching(false);
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [searchQuery]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      setShowSearchDropdown(false);
      navigate(`/shop?q=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  const navCategories = [
    { name: 'Shop All', path: '/shop' },
    { name: 'Audio', path: '/shop?category=audio-acoustics' },
    { name: 'Timepieces', path: '/shop?category=precision-timepieces' },
    { name: 'Apparel', path: '/shop?category=designer-apparel' },
    { name: 'Leather Goods', path: '/shop?category=leather-goods' },
    { name: 'Parfumerie', path: '/shop?category=haute-parfumerie' },
    { name: 'Eyewear', path: '/shop?category=modern-eyewear' }
  ];

  return (
    <header className="sticky top-0 z-40 w-full">
      {/* Top Banner Announcement */}
      <div className="bg-aura-950 border-b border-slate-800/80 text-[11px] font-medium tracking-widest uppercase text-slate-400 py-1.5 px-4 text-center">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <span className="hidden md:inline-flex items-center gap-1.5 text-amber-400/90">
            <Sparkles className="w-3.5 h-3.5" /> Handcrafted Luxury Curations
          </span>
          <p className="mx-auto md:mx-0">
            Complimentary Insured Express Delivery across India on orders above ₹2,499
          </p>
          <div className="hidden md:flex items-center gap-4 text-slate-400">
            <Link to="/order-tracking" className="hover:text-amber-300 transition-colors">
              Track Order
            </Link>
            <span>•</span>
            <Link to="/contact" className="hover:text-amber-300 transition-colors">
              Concierge
            </Link>
          </div>
        </div>
      </div>

      {/* Main Navigation Bar */}
      <nav className="bg-aura-900/90 backdrop-blur-md border-b border-slate-800/80 transition-all">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-20 gap-4">
            
            {/* Mobile Hamburger Button */}
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="lg:hidden p-2 text-slate-300 hover:text-white rounded-lg hover:bg-white/5"
              aria-label="Toggle navigation menu"
            >
              {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>

            {/* Brand Logo */}
            <Link to="/" className="flex flex-col items-start select-none group shrink-0 whitespace-nowrap pr-2">
              <span className="font-cinzel text-xl sm:text-2xl lg:text-3xl font-bold tracking-[0.2em] text-slate-100 group-hover:text-amber-300 transition-colors whitespace-nowrap">
                AURA
              </span>
              <span className="text-[8px] sm:text-[9px] uppercase tracking-[0.35em] text-amber-400 font-semibold -mt-0.5 whitespace-nowrap">
                Luxe Editions
              </span>
            </Link>

            {/* Desktop Navigation Links */}
            <div className="hidden lg:flex items-center gap-3.5 xl:gap-6 shrink-0">
              {navCategories.map((item) => (
                <Link
                  key={item.name}
                  to={item.path}
                  className="text-[11px] xl:text-xs uppercase tracking-wider xl:tracking-widest font-medium text-slate-300 hover:text-amber-300 transition-colors py-2 relative group whitespace-nowrap"
                >
                  {item.name}
                  <span className="absolute bottom-0 left-0 w-0 h-[1.5px] bg-gradient-to-r from-amber-400 to-yellow-300 transition-all duration-300 group-hover:w-full" />
                </Link>
              ))}
            </div>

            {/* Right Action Icons: Search, Wishlist, Account, Cart */}
            <div className="flex items-center gap-2 sm:gap-3 lg:gap-4 shrink-0">
              
              {/* Live Search Bar */}
              <div ref={searchRef} className="relative hidden md:block w-44 lg:w-52 xl:w-64">
                <form onSubmit={handleSearchSubmit} className="relative">
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    onFocus={() => searchQuery.trim() && setShowSearchDropdown(true)}
                    placeholder="Search timepieces, audio..."
                    className="w-full bg-aura-850/80 border border-slate-700/80 rounded-full pl-9 pr-4 py-2 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-amber-400/80 focus:ring-1 focus:ring-amber-400/40 transition-all"
                  />
                  <Search className="absolute left-3 top-2.5 w-4 h-4 text-slate-400" />
                </form>

                {/* Live Search Dropdown */}
                {showSearchDropdown && searchResults.length > 0 && (
                  <div className="absolute top-full mt-2 left-0 right-0 glass-panel rounded-xl border border-slate-700 shadow-2xl p-2 z-50 animate-slide-up">
                    <div className="text-[10px] uppercase font-bold tracking-wider text-slate-400 px-3 py-1.5">
                      Suggested Results
                    </div>
                    {searchResults.map((item) => (
                      <Link
                        key={item.id}
                        to={`/product/${item.slug}`}
                        onClick={() => setShowSearchDropdown(false)}
                        className="flex items-center gap-3 p-2 rounded-lg hover:bg-white/5 transition-colors group"
                      >
                        <img
                          src={item.primary_image}
                          alt={item.name}
                          className="w-10 h-10 object-cover rounded bg-aura-950 shrink-0"
                        />
                        <div className="flex-1 min-w-0">
                          <div className="text-xs font-medium text-slate-200 group-hover:text-amber-300 truncate">
                            {item.name}
                          </div>
                          <div className="text-xs font-semibold text-amber-400 font-serif">
                            {formatPrice(item.price)}
                          </div>
                        </div>
                      </Link>
                    ))}
                    <div className="p-2 border-t border-slate-800 text-center">
                      <button
                        onClick={handleSearchSubmit}
                        className="text-xs text-amber-400 hover:text-amber-300 font-medium"
                      >
                        View all results for "{searchQuery}"
                      </button>
                    </div>
                  </div>
                )}
              </div>

              {/* Wishlist Icon */}
              <Link
                to="/wishlist"
                className="relative p-2.5 text-slate-300 hover:text-amber-300 rounded-full hover:bg-white/5 transition-colors"
                aria-label="Wishlist"
              >
                <Heart className="w-5 h-5" />
                {wishlistCount > 0 && (
                  <span className="absolute top-1 right-1 w-4 h-4 bg-rose-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center animate-pulse-subtle">
                    {wishlistCount}
                  </span>
                )}
              </Link>

              {/* User Account Dropdown */}
              <div ref={userMenuRef} className="relative">
                {isAuthenticated ? (
                  <button
                    onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                    className="flex items-center gap-2 p-2 rounded-full hover:bg-white/5 text-slate-300 hover:text-white transition-colors"
                    aria-label="User profile"
                  >
                    <div className="w-7 h-7 rounded-full bg-amber-500/20 border border-amber-500/40 text-amber-300 flex items-center justify-center text-xs font-bold">
                      {user.name.charAt(0).toUpperCase()}
                    </div>
                    <ChevronDown className="w-3.5 h-3.5 text-slate-400 hidden sm:block" />
                  </button>
                ) : (
                  <Link
                    to="/login"
                    className="p-2.5 text-slate-300 hover:text-amber-300 rounded-full hover:bg-white/5 transition-colors"
                    aria-label="Sign In"
                  >
                    <User className="w-5 h-5" />
                  </Link>
                )}

                {/* User Dropdown Menu */}
                {isUserMenuOpen && isAuthenticated && (
                  <div className="absolute right-0 top-full mt-2 w-56 glass-panel rounded-xl border border-slate-700 shadow-2xl p-2 z-50 animate-slide-up">
                    <div className="px-3 py-2 border-b border-slate-800">
                      <p className="text-xs font-semibold text-slate-200 truncate">{user.name}</p>
                      <p className="text-[11px] text-slate-400 truncate">{user.email}</p>
                    </div>

                    <div className="py-1">
                      <Link
                        to="/account"
                        className="flex items-center gap-2.5 px-3 py-2 text-xs text-slate-300 hover:text-white hover:bg-white/5 rounded-lg transition-colors"
                      >
                        <User className="w-4 h-4 text-amber-400" />
                        <span>My Account</span>
                      </Link>
                      <Link
                        to="/orders"
                        className="flex items-center gap-2.5 px-3 py-2 text-xs text-slate-300 hover:text-white hover:bg-white/5 rounded-lg transition-colors"
                      >
                        <Package className="w-4 h-4 text-amber-400" />
                        <span>My Orders</span>
                      </Link>
                      {isAdmin && (
                        <Link
                          to="/admin"
                          className="flex items-center gap-2.5 px-3 py-2 text-xs text-amber-300 font-semibold bg-amber-500/10 hover:bg-amber-500/20 rounded-lg transition-colors my-1 border border-amber-500/20"
                        >
                          <SlidersHorizontal className="w-4 h-4 text-amber-400" />
                          <span>Admin Dashboard</span>
                        </Link>
                      )}
                    </div>

                    <div className="pt-1 border-t border-slate-800">
                      <button
                        onClick={logout}
                        className="w-full flex items-center gap-2.5 px-3 py-2 text-xs text-rose-400 hover:bg-rose-500/10 rounded-lg transition-colors"
                      >
                        <LogOut className="w-4 h-4" />
                        <span>Sign Out</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>

              {/* Shopping Bag Trigger */}
              <button
                onClick={openDrawer}
                className="relative p-2.5 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-300 hover:bg-amber-400 hover:text-black hover:border-amber-400 transition-all active:scale-95"
                aria-label="Open Cart Drawer"
              >
                <ShoppingBag className="w-5 h-5" />
                {cartCount > 0 && (
                  <span className="absolute -top-1 -right-1 w-5 h-5 bg-gradient-to-r from-amber-400 to-yellow-500 text-black text-xs font-bold rounded-full flex items-center justify-center shadow-lg">
                    {cartCount}
                  </span>
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Navigation Drawer */}
        {isMobileMenuOpen && (
          <div className="lg:hidden border-t border-slate-800 bg-aura-950/95 backdrop-blur-xl px-4 pt-4 pb-6 space-y-4 animate-slide-up">
            {/* Mobile Search */}
            <form onSubmit={handleSearchSubmit} className="relative">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search collection..."
                className="w-full bg-aura-850 border border-slate-700 rounded-lg pl-10 pr-4 py-2.5 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-amber-400"
              />
              <Search className="absolute left-3.5 top-3 w-4 h-4 text-slate-400" />
            </form>

            {/* Nav Links */}
            <div className="space-y-1">
              {navCategories.map((item) => (
                <Link
                  key={item.name}
                  to={item.path}
                  className="block px-3 py-2.5 text-sm font-medium text-slate-300 hover:text-amber-300 hover:bg-white/5 rounded-lg transition-colors"
                >
                  {item.name}
                </Link>
              ))}
              <div className="pt-3 border-t border-slate-800/80 space-y-1">
                <Link
                  to="/order-tracking"
                  className="block px-3 py-2.5 text-sm font-medium text-slate-300 hover:text-amber-300 hover:bg-white/5 rounded-lg"
                >
                  Track Order
                </Link>
                <Link
                  to="/about"
                  className="block px-3 py-2.5 text-sm font-medium text-slate-300 hover:text-amber-300 hover:bg-white/5 rounded-lg"
                >
                  About AURA
                </Link>
                <Link
                  to="/contact"
                  className="block px-3 py-2.5 text-sm font-medium text-slate-300 hover:text-amber-300 hover:bg-white/5 rounded-lg"
                >
                  Concierge Support
                </Link>
              </div>
            </div>
          </div>
        )}
      </nav>
    </header>
  );
};
