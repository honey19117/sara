import React, { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import {
  SlidersHorizontal,
  Grid,
  List,
  Search,
  RotateCcw,
  Star,
  ChevronDown,
  X,
  Filter,
  Check
} from 'lucide-react';
import { ProductCard } from '../components/common/ProductCard';
import { SkeletonCard } from '../components/common/LoadingSpinner';
import { api } from '../services/api';
import { formatPrice } from '../utils/formatters';

export const ShopPage = () => {
  const [searchParams, setSearchParams] = useSearchParams();

  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [pagination, setPagination] = useState({ total: 0, page: 1, limit: 12, totalPages: 1 });
  const [loading, setLoading] = useState(true);
  const [isMobileFilterOpen, setIsMobileFilterOpen] = useState(false);
  const [viewMode, setViewMode] = useState('grid'); // 'grid' | 'list'

  // URL Query State
  const currentCategory = searchParams.get('category') || '';
  const currentSearch = searchParams.get('q') || '';
  const currentSort = searchParams.get('sort') || 'newest';
  const currentMinPrice = searchParams.get('minPrice') || '';
  const currentMaxPrice = searchParams.get('maxPrice') || '';
  const currentRating = searchParams.get('rating') || '';
  const currentInStock = searchParams.get('inStock') === 'true';
  const currentPage = parseInt(searchParams.get('page')) || 1;

  // Local filter draft state for price slider
  const [priceRange, setPriceRange] = useState(currentMaxPrice || 60000);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const data = await api.getCategories();
        if (data.success) setCategories(data.categories);
      } catch (err) {
        console.error(err);
      }
    };
    fetchCategories();
  }, []);

  useEffect(() => {
    const fetchProducts = async () => {
      setLoading(true);
      try {
        const params = {
          page: currentPage,
          limit: 12,
          sort: currentSort
        };
        if (currentCategory) params.category = currentCategory;
        if (currentSearch) params.q = currentSearch;
        if (currentMinPrice) params.minPrice = currentMinPrice;
        if (currentMaxPrice) params.maxPrice = currentMaxPrice;
        if (currentRating) params.rating = currentRating;
        if (currentInStock) params.inStock = 'true';

        const data = await api.getProducts(params);
        if (data.success) {
          setProducts(data.products);
          setPagination(data.pagination);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [
    currentCategory,
    currentSearch,
    currentSort,
    currentMinPrice,
    currentMaxPrice,
    currentRating,
    currentInStock,
    currentPage
  ]);

  const updateFilters = (newParams) => {
    const updated = new URLSearchParams(searchParams);
    Object.entries(newParams).forEach(([key, val]) => {
      if (val === null || val === undefined || val === '') {
        updated.delete(key);
      } else {
        updated.set(key, val);
      }
    });
    // Reset page to 1 on filter changes
    if (!newParams.page) {
      updated.set('page', 1);
    }
    setSearchParams(updated);
  };

  const resetFilters = () => {
    setSearchParams({});
    setPriceRange(60000);
  };

  const activeFilterCount = [
    currentCategory,
    currentSearch,
    currentMinPrice,
    currentMaxPrice,
    currentRating,
    currentInStock
  ].filter(Boolean).length;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8 animate-fade-in">
      
      {/* Header & Breadcrumb */}
      <div className="border-b border-slate-800 pb-6 flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <div className="text-xs font-semibold uppercase tracking-[0.2em] text-amber-400 mb-1">
            Haute Catalog
          </div>
          <h1 className="text-3xl sm:text-4xl font-serif font-bold text-slate-100">
            {currentCategory
              ? categories.find((c) => c.slug === currentCategory)?.name || 'Collection'
              : currentSearch
              ? `Results for "${currentSearch}"`
              : 'Complete Collection'}
          </h1>
        </div>

        <div className="text-xs text-slate-400">
          Displaying <strong className="text-slate-100">{products.length}</strong> of{' '}
          <strong className="text-slate-100">{pagination.total}</strong> Masterpieces
        </div>
      </div>

      {/* Main Content Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8 items-start">
        
        {/* --- DESKTOP FILTERS SIDEBAR --- */}
        <aside className="hidden lg:block glass-panel p-6 rounded-2xl border border-slate-800 space-y-8 sticky top-28">
          <div className="flex items-center justify-between pb-4 border-b border-slate-800">
            <div className="flex items-center gap-2 text-sm font-bold uppercase tracking-wider text-slate-100">
              <SlidersHorizontal className="w-4 h-4 text-amber-400" />
              <span>Refine Catalog</span>
            </div>
            {activeFilterCount > 0 && (
              <button
                onClick={resetFilters}
                className="text-xs text-amber-400 hover:text-amber-300 flex items-center gap-1 font-medium"
              >
                <RotateCcw className="w-3 h-3" /> Reset
              </button>
            )}
          </div>

          {/* Categories Filter */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-300">Category</h4>
            <div className="space-y-1.5">
              <button
                onClick={() => updateFilters({ category: '' })}
                className={`w-full text-left px-3 py-2 rounded-lg text-xs font-medium transition-colors flex justify-between items-center ${
                  !currentCategory
                    ? 'bg-amber-500/10 text-amber-300 font-semibold border border-amber-500/30'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-white/5'
                }`}
              >
                <span>All Masterpieces</span>
                <span>{pagination.total}</span>
              </button>
              {categories.map((cat) => (
                <button
                  key={cat.id}
                  onClick={() => updateFilters({ category: cat.slug })}
                  className={`w-full text-left px-3 py-2 rounded-lg text-xs font-medium transition-colors flex justify-between items-center ${
                    currentCategory === cat.slug
                      ? 'bg-amber-500/10 text-amber-300 font-semibold border border-amber-500/30'
                      : 'text-slate-400 hover:text-slate-200 hover:bg-white/5'
                  }`}
                >
                  <span className="truncate">{cat.name}</span>
                  <span className="text-[11px] opacity-70">{cat.product_count}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Price Range Filter */}
          <div className="space-y-3 pt-4 border-t border-slate-800">
            <div className="flex justify-between items-center">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-300">Max Price</h4>
              <span className="text-xs font-semibold text-amber-300 font-serif">
                {formatPrice(priceRange)}
              </span>
            </div>
            <input
              type="range"
              min="2000"
              max="60000"
              step="1000"
              value={priceRange}
              onChange={(e) => setPriceRange(e.target.value)}
              onMouseUp={() => updateFilters({ maxPrice: priceRange })}
              onTouchEnd={() => updateFilters({ maxPrice: priceRange })}
              className="w-full accent-amber-400 cursor-pointer"
            />
            <div className="flex justify-between text-[10px] text-slate-400">
              <span>₹2,000</span>
              <span>₹60,000+</span>
            </div>
          </div>

          {/* Minimum Rating */}
          <div className="space-y-2 pt-4 border-t border-slate-800">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-300">Minimum Rating</h4>
            <div className="space-y-1">
              {[4.8, 4.5, 4.0].map((star) => (
                <button
                  key={star}
                  onClick={() => updateFilters({ rating: currentRating === String(star) ? '' : star })}
                  className={`w-full text-left px-3 py-2 rounded-lg text-xs font-medium transition-colors flex items-center justify-between ${
                    currentRating === String(star)
                      ? 'bg-amber-500/10 text-amber-300 border border-amber-500/30'
                      : 'text-slate-400 hover:text-slate-200 hover:bg-white/5'
                  }`}
                >
                  <div className="flex items-center gap-1.5">
                    <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                    <span>{star} Stars & Above</span>
                  </div>
                  {currentRating === String(star) && <Check className="w-3.5 h-3.5" />}
                </button>
              ))}
            </div>
          </div>

          {/* In Stock Filter */}
          <div className="pt-4 border-t border-slate-800">
            <label className="flex items-center gap-3 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={currentInStock}
                onChange={(e) => updateFilters({ inStock: e.target.checked ? 'true' : '' })}
                className="w-4 h-4 rounded border-slate-700 bg-aura-900 text-amber-500 focus:ring-amber-400"
              />
              <span className="text-xs font-medium text-slate-300">In-Stock Vault Items Only</span>
            </label>
          </div>
        </aside>

        {/* --- PRODUCTS SECTION --- */}
        <div className="lg:col-span-3 space-y-6">
          
          {/* Top Bar Controls */}
          <div className="glass-panel p-4 rounded-xl border border-slate-800 flex flex-wrap items-center justify-between gap-4">
            
            {/* Mobile Filter Trigger */}
            <button
              onClick={() => setIsMobileFilterOpen(true)}
              className="lg:hidden btn-outline-gold text-xs px-4 py-2 flex items-center gap-2"
            >
              <Filter className="w-3.5 h-3.5" />
              <span>Filters {activeFilterCount > 0 && `(${activeFilterCount})`}</span>
            </button>

            {/* Active Filter Chips */}
            <div className="flex flex-wrap items-center gap-2">
              {currentCategory && (
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs">
                  Category: {categories.find((c) => c.slug === currentCategory)?.name || currentCategory}
                  <button onClick={() => updateFilters({ category: '' })}><X className="w-3 h-3" /></button>
                </span>
              )}
              {currentSearch && (
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/30 text-blue-300 text-xs">
                  Query: "{currentSearch}"
                  <button onClick={() => updateFilters({ q: '' })}><X className="w-3 h-3" /></button>
                </span>
              )}
              {currentMaxPrice && (
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-800 border border-slate-700 text-slate-300 text-xs">
                  Max: {formatPrice(currentMaxPrice)}
                  <button onClick={() => updateFilters({ maxPrice: '' })}><X className="w-3 h-3" /></button>
                </span>
              )}
            </div>

            {/* Sort Dropdown & View Mode Switcher */}
            <div className="flex items-center gap-3 ml-auto">
              <div className="flex items-center gap-2">
                <span className="text-xs text-slate-400 hidden sm:inline">Sort:</span>
                <select
                  value={currentSort}
                  onChange={(e) => updateFilters({ sort: e.target.value })}
                  className="bg-aura-850 border border-slate-700/80 rounded-lg px-3 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-amber-400 cursor-pointer"
                >
                  <option value="newest">Newest Releases</option>
                  <option value="popular">Most Coveted</option>
                  <option value="price_asc">Price: Low to High</option>
                  <option value="price_desc">Price: High to Low</option>
                  <option value="rating">Highest Rated</option>
                </select>
              </div>

              <div className="hidden sm:flex items-center border border-slate-700 rounded-lg overflow-hidden bg-aura-900">
                <button
                  onClick={() => setViewMode('grid')}
                  className={`p-1.5 transition-colors ${viewMode === 'grid' ? 'bg-amber-500/20 text-amber-300' : 'text-slate-400 hover:text-white'}`}
                  aria-label="Grid view"
                >
                  <Grid className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setViewMode('list')}
                  className={`p-1.5 transition-colors ${viewMode === 'list' ? 'bg-amber-500/20 text-amber-300' : 'text-slate-400 hover:text-white'}`}
                  aria-label="List view"
                >
                  <List className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>

          {/* Product Grid / List */}
          {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {Array.from({ length: 6 }).map((_, i) => <SkeletonCard key={i} />)}
            </div>
          ) : products.length === 0 ? (
            <div className="glass-panel rounded-2xl p-12 text-center space-y-4 border border-slate-800">
              <div className="w-16 h-16 rounded-full bg-slate-800/60 flex items-center justify-center mx-auto text-slate-500">
                <Search className="w-8 h-8" />
              </div>
              <h3 className="text-lg font-semibold text-slate-200">No curations match your criteria</h3>
              <p className="text-xs text-slate-400 max-w-sm mx-auto">
                Try loosening your filters, selecting a different category, or adjusting your price parameters.
              </p>
              <button onClick={resetFilters} className="btn-outline-gold text-xs px-6 py-2.5">
                Reset All Filters
              </button>
            </div>
          ) : (
            <div
              className={
                viewMode === 'grid'
                  ? 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6'
                  : 'flex flex-col gap-4'
              }
            >
              {products.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          )}

          {/* Pagination Controls */}
          {pagination.totalPages > 1 && (
            <div className="pt-8 flex items-center justify-center gap-2">
              <button
                onClick={() => updateFilters({ page: Math.max(1, currentPage - 1) })}
                disabled={currentPage === 1}
                className="btn-outline-gold px-4 py-2 text-xs disabled:opacity-30 disabled:pointer-events-none"
              >
                Previous
              </button>
              {Array.from({ length: pagination.totalPages }).map((_, i) => {
                const pageNum = i + 1;
                return (
                  <button
                    key={pageNum}
                    onClick={() => updateFilters({ page: pageNum })}
                    className={`w-9 h-9 rounded-lg text-xs font-semibold transition-all ${
                      currentPage === pageNum
                        ? 'bg-amber-400 text-black shadow-glow-gold'
                        : 'bg-aura-850 border border-slate-800 text-slate-300 hover:bg-white/5'
                    }`}
                  >
                    {pageNum}
                  </button>
                );
              })}
              <button
                onClick={() => updateFilters({ page: Math.min(pagination.totalPages, currentPage + 1) })}
                disabled={currentPage === pagination.totalPages}
                className="btn-outline-gold px-4 py-2 text-xs disabled:opacity-30 disabled:pointer-events-none"
              >
                Next
              </button>
            </div>
          )}
        </div>
      </div>

      {/* --- MOBILE FILTERS DRAWER --- */}
      {isMobileFilterOpen && (
        <div className="fixed inset-0 z-50 flex">
          <div onClick={() => setIsMobileFilterOpen(false)} className="fixed inset-0 bg-black/80 backdrop-blur-sm" />
          <div className="relative ml-auto w-full max-w-xs bg-aura-900 h-full p-6 space-y-6 overflow-y-auto border-l border-slate-800 z-10 animate-slide-up">
            <div className="flex justify-between items-center pb-4 border-b border-slate-800">
              <h3 className="text-base font-bold font-serif text-slate-100">Filters</h3>
              <button onClick={() => setIsMobileFilterOpen(false)} className="p-2 text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Category Select */}
            <div className="space-y-2">
              <h4 className="text-xs font-bold uppercase text-slate-300">Category</h4>
              <div className="space-y-1">
                <button
                  onClick={() => { updateFilters({ category: '' }); setIsMobileFilterOpen(false); }}
                  className="w-full text-left p-2 rounded text-xs text-slate-300 hover:bg-white/5"
                >
                  All Categories
                </button>
                {categories.map((cat) => (
                  <button
                    key={cat.id}
                    onClick={() => { updateFilters({ category: cat.slug }); setIsMobileFilterOpen(false); }}
                    className="w-full text-left p-2 rounded text-xs text-slate-300 hover:bg-white/5 truncate"
                  >
                    {cat.name}
                  </button>
                ))}
              </div>
            </div>

            <button
              onClick={() => { resetFilters(); setIsMobileFilterOpen(false); }}
              className="w-full btn-outline-gold text-xs py-2.5"
            >
              Reset All
            </button>
          </div>
        </div>
      )}

    </div>
  );
};
