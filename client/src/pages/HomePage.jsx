import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  ArrowRight,
  ShieldCheck,
  Sparkles,
  ChevronRight,
  Compass,
  Award,
  Flame,
  Star,
  Zap
} from 'lucide-react';
import { ProductCard } from '../components/common/ProductCard';
import { SkeletonCard } from '../components/common/LoadingSpinner';
import { api } from '../services/api';

export const HomePage = () => {
  const [featuredProducts, setFeaturedProducts] = useState([]);
  const [trendingProducts, setTrendingProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);

  // Countdown timer for luxury flash release
  const [timeLeft, setTimeLeft] = useState({ hours: 14, minutes: 38, seconds: 45 });

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev.seconds > 0) return { ...prev, seconds: prev.seconds - 1 };
        if (prev.minutes > 0) return { ...prev, minutes: 59, seconds: 59 };
        if (prev.hours > 0) return { ...prev, hours: prev.hours - 1, minutes: 59, seconds: 59 };
        return { hours: 24, minutes: 0, seconds: 0 };
      });
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    const loadHomeData = async () => {
      try {
        const [featData, trendData, catData] = await Promise.all([
          api.getFeaturedProducts(),
          api.getTrendingProducts(),
          api.getCategories()
        ]);

        if (featData.success) setFeaturedProducts(featData.products);
        if (trendData.success) setTrendingProducts(trendData.products);
        if (catData.success) setCategories(catData.categories);
      } catch (err) {
        console.error('Failed to load homepage data:', err);
      } finally {
        setLoading(false);
      }
    };

    loadHomeData();
  }, []);

  return (
    <div className="space-y-24 pb-16">
      
      {/* --- HERO SECTION --- */}
      <section className="relative min-h-[85vh] flex items-center justify-center overflow-hidden border-b border-slate-800/80">
        {/* Background Luxury Ambient Image & Gradient */}
        <div className="absolute inset-0 z-0">
          <img
            src="https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=2000&q=85"
            alt="AURA Luxury Hero"
            className="w-full h-full object-cover object-center scale-105 filter brightness-[0.32] contrast-125"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-aura-900 via-aura-900/60 to-transparent" />
          <div className="absolute inset-0 bg-gradient-to-r from-aura-900/90 via-transparent to-aura-900/90" />
        </div>

        {/* Hero Content */}
        <div className="relative z-10 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-8 pt-12 animate-fade-in">
          
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs uppercase tracking-[0.2em] font-semibold backdrop-blur-md">
            <Sparkles className="w-3.5 h-3.5 text-amber-400" />
            <span>Autumn / Winter 2026 Collection</span>
          </div>

          <h1 className="text-4xl sm:text-6xl md:text-7xl font-cinzel font-bold tracking-tight text-slate-100 leading-[1.1]">
            THE ART OF <span className="gold-gradient-text">PERFECTION</span>
          </h1>

          <p className="text-base sm:text-lg md:text-xl text-slate-300 max-w-2xl mx-auto font-light leading-relaxed">
            Curated precision Swiss horology, audiophile acoustics, Florentine leather, and bespoke apparel crafted for the discerning connoisseur.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
            <Link to="/shop" className="btn-gold w-full sm:w-auto px-8 py-4 text-sm font-bold flex items-center justify-center gap-2 group shadow-glow-gold">
              <span>Explore The Collection</span>
              <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
            </Link>
            <Link to="/categories" className="btn-outline-gold w-full sm:w-auto px-8 py-4 text-sm font-semibold flex items-center justify-center gap-2">
              <Compass className="w-4 h-4" />
              <span>Browse Categories</span>
            </Link>
          </div>

          {/* Quick Metrics */}
          <div className="pt-12 grid grid-cols-3 gap-6 max-w-xl mx-auto border-t border-slate-800/80 text-center">
            <div>
              <div className="text-xl sm:text-2xl font-bold font-serif text-slate-100">100%</div>
              <div className="text-[11px] text-slate-400 uppercase tracking-wider mt-0.5">Authentic Artisanal</div>
            </div>
            <div>
              <div className="text-xl sm:text-2xl font-bold font-serif text-amber-400">48-Hr</div>
              <div className="text-[11px] text-slate-400 uppercase tracking-wider mt-0.5">Express Dispatch</div>
            </div>
            <div>
              <div className="text-xl sm:text-2xl font-bold font-serif text-slate-100">4.9 / 5</div>
              <div className="text-[11px] text-slate-400 uppercase tracking-wider mt-0.5">Customer Rating</div>
            </div>
          </div>
        </div>
      </section>

      {/* --- CATEGORIES SHOWCASE --- */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div>
            <div className="text-xs font-bold uppercase tracking-[0.25em] text-amber-400 mb-1">
              Curated Universes
            </div>
            <h2 className="text-2xl sm:text-3xl font-serif font-bold text-slate-100">
              Explore by Category
            </h2>
          </div>
          <Link
            to="/categories"
            className="inline-flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-amber-400 hover:text-amber-300 transition-colors"
          >
            <span>View All Categories</span>
            <ChevronRight className="w-4 h-4" />
          </Link>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          {categories.map((cat) => (
            <Link
              key={cat.id}
              to={`/shop?category=${cat.slug}`}
              className="group relative rounded-2xl overflow-hidden aspect-[4/5] glass-card border-slate-800 hover:border-amber-500/40 transition-all flex flex-col justify-end p-4"
            >
              <img
                src={cat.image_url}
                alt={cat.name}
                className="absolute inset-0 w-full h-full object-cover object-center group-hover:scale-110 transition-transform duration-700 filter brightness-75 group-hover:brightness-90"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-aura-950 via-aura-950/40 to-transparent" />
              <div className="relative z-10">
                <h3 className="text-sm font-semibold text-slate-100 group-hover:text-amber-300 transition-colors line-clamp-1">
                  {cat.name}
                </h3>
                <p className="text-[11px] text-slate-400 mt-0.5">
                  {cat.product_count || 4} Curations
                </p>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* --- FEATURED MASTERPIECES --- */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div>
            <div className="text-xs font-bold uppercase tracking-[0.25em] text-amber-400 mb-1">
              Curator's Choice
            </div>
            <h2 className="text-2xl sm:text-3xl font-serif font-bold text-slate-100">
              Featured Masterpieces
            </h2>
          </div>
          <Link
            to="/shop"
            className="inline-flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-amber-400 hover:text-amber-300 transition-colors"
          >
            <span>Explore Complete Vault</span>
            <ChevronRight className="w-4 h-4" />
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {loading ? (
            Array.from({ length: 4 }).map((_, i) => <SkeletonCard key={i} />)
          ) : (
            featuredProducts.slice(0, 4).map((product) => (
              <ProductCard key={product.id} product={product} />
            ))
          )}
        </div>
      </section>

      {/* --- FLASH DEAL / LIMITED EDITION BANNER --- */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="relative rounded-3xl overflow-hidden glass-panel border border-amber-500/30 p-8 sm:p-12 lg:p-16 flex flex-col lg:flex-row items-center justify-between gap-8">
          <div className="absolute top-0 right-0 w-96 h-96 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />

          <div className="space-y-4 max-w-xl text-center lg:text-left">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/20 text-amber-300 text-xs font-bold uppercase tracking-wider">
              <Zap className="w-3.5 h-3.5 fill-amber-400" /> Exclusive Reserve Release
            </div>
            <h2 className="text-3xl sm:text-4xl font-serif font-bold text-slate-100">
              The Atelier Skeleton Tourbillon
            </h2>
            <p className="text-sm text-slate-300 leading-relaxed">
              Strictly limited to 25 individually numbered pieces worldwide. Hand-beveled 28,800 vph caliber with 22K gold micro-rotor.
            </p>

            {/* Countdown Display */}
            <div className="flex items-center justify-center lg:justify-start gap-4 pt-2">
              <div className="bg-aura-900 border border-slate-700 rounded-xl px-4 py-2 text-center min-w-[70px]">
                <div className="text-2xl font-bold font-serif text-amber-300">
                  {String(timeLeft.hours).padStart(2, '0')}
                </div>
                <div className="text-[10px] uppercase tracking-wider text-slate-400">Hours</div>
              </div>
              <span className="text-2xl font-bold text-slate-600">:</span>
              <div className="bg-aura-900 border border-slate-700 rounded-xl px-4 py-2 text-center min-w-[70px]">
                <div className="text-2xl font-bold font-serif text-amber-300">
                  {String(timeLeft.minutes).padStart(2, '0')}
                </div>
                <div className="text-[10px] uppercase tracking-wider text-slate-400">Mins</div>
              </div>
              <span className="text-2xl font-bold text-slate-600">:</span>
              <div className="bg-aura-900 border border-slate-700 rounded-xl px-4 py-2 text-center min-w-[70px]">
                <div className="text-2xl font-bold font-serif text-amber-300">
                  {String(timeLeft.seconds).padStart(2, '0')}
                </div>
                <div className="text-[10px] uppercase tracking-wider text-slate-400">Secs</div>
              </div>
            </div>
          </div>

          <div className="flex flex-col items-center gap-4 shrink-0">
            <Link to="/product/atelier-skeleton-tourbillon-automatic" className="btn-gold px-8 py-4 text-sm font-bold shadow-glow-gold">
              Acquire Timepiece
            </Link>
            <div className="text-xs text-slate-400 flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              <span>Includes 5-Year Global Haute Horlogerie Warranty</span>
            </div>
          </div>
        </div>
      </section>

      {/* --- TRENDING SELECTIONS --- */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div>
            <div className="text-xs font-bold uppercase tracking-[0.25em] text-amber-400 mb-1">
              Currently Coveted
            </div>
            <h2 className="text-2xl sm:text-3xl font-serif font-bold text-slate-100">
              Trending Collections
            </h2>
          </div>
          <Link
            to="/shop?sort=popular"
            className="inline-flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-amber-400 hover:text-amber-300 transition-colors"
          >
            <span>View All Bestsellers</span>
            <ChevronRight className="w-4 h-4" />
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {loading ? (
            Array.from({ length: 4 }).map((_, i) => <SkeletonCard key={i} />)
          ) : (
            trendingProducts.slice(0, 4).map((product) => (
              <ProductCard key={product.id} product={product} />
            ))
          )}
        </div>
      </section>

      {/* --- THE PHILOSOPHY (BRAND ETHOS) --- */}
      <section className="border-y border-slate-800/80 bg-aura-950 py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div className="space-y-6">
              <div className="text-xs font-bold uppercase tracking-[0.25em] text-amber-400">
                The Atelier Standard
              </div>
              <h2 className="text-3xl sm:text-4xl font-serif font-bold text-slate-100 leading-tight">
                Crafted Without Compromise, Engineered for Eternity.
              </h2>
              <p className="text-sm text-slate-300 leading-relaxed">
                At AURA Luxe, we reject fleeting mass production. Every acoustic monitor, Swiss automatic movement, and full-grain leather piece is rigorously examined by seasoned artisans.
              </p>
              <div className="grid grid-cols-2 gap-6 pt-4">
                <div className="space-y-1">
                  <h4 className="text-base font-serif font-bold text-slate-100">Bespoke Metallurgy</h4>
                  <p className="text-xs text-slate-400">Aerospace beta-titanium and 316L surgical steel casings.</p>
                </div>
                <div className="space-y-1">
                  <h4 className="text-base font-serif font-bold text-slate-100">Planar Acoustics</h4>
                  <p className="text-xs text-slate-400">Beryllium transducers engineered for zero harmonic distortion.</p>
                </div>
              </div>
              <div className="pt-2">
                <Link to="/about" className="btn-outline-gold text-xs px-6 py-3">
                  Read The Atelier Story
                </Link>
              </div>
            </div>

            <div className="relative rounded-2xl overflow-hidden glass-card aspect-video lg:aspect-square">
              <img
                src="https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?auto=format&fit=crop&w=1000&q=80"
                alt="Artisan Watchmaking"
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-aura-950/80 via-transparent to-transparent" />
            </div>
          </div>
        </div>
      </section>

      {/* --- CLIENT TESTIMONIALS --- */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        <div className="text-center space-y-2 max-w-xl mx-auto">
          <div className="text-xs font-bold uppercase tracking-[0.25em] text-amber-400">
            Connoisseur Reviews
          </div>
          <h2 className="text-2xl sm:text-3xl font-serif font-bold text-slate-100">
            Voices of Distinctions
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="glass-card p-6 space-y-4">
            <div className="flex text-amber-400 gap-1">
              {Array.from({ length: 5 }).map((_, i) => (
                <Star key={i} className="w-4 h-4 fill-amber-400" />
              ))}
            </div>
            <p className="text-xs leading-relaxed text-slate-300 italic">
              "The AURA Sphere Master wireless headphones possess an acoustic resolution that puts my studio monitors to shame. The build quality in lambskin and aluminum is unmatched."
            </p>
            <div className="pt-2 border-t border-slate-800">
              <div className="text-xs font-semibold text-slate-100">Dr. Vikramaditya M.</div>
              <div className="text-[10px] text-slate-400">Sound Engineer & Collector • Mumbai</div>
            </div>
          </div>

          <div className="glass-card p-6 space-y-4">
            <div className="flex text-amber-400 gap-1">
              {Array.from({ length: 5 }).map((_, i) => (
                <Star key={i} className="w-4 h-4 fill-amber-400" />
              ))}
            </div>
            <p className="text-xs leading-relaxed text-slate-300 italic">
              "Purchased the Monolith Chronograph. The Swiss movement precision and dome sapphire glass are sensational. Arrived via courier within 36 hours in presentation packaging."
            </p>
            <div className="pt-2 border-t border-slate-800">
              <div className="text-xs font-semibold text-slate-100">Sameer Singhania</div>
              <div className="text-[10px] text-slate-400">Managing Partner • New Delhi</div>
            </div>
          </div>

          <div className="glass-card p-6 space-y-4">
            <div className="flex text-amber-400 gap-1">
              {Array.from({ length: 5 }).map((_, i) => (
                <Star key={i} className="w-4 h-4 fill-amber-400" />
              ))}
            </div>
            <p className="text-xs leading-relaxed text-slate-300 italic">
              "The Tuscan Leather Briefcase is pure poetry. Thick full-grain leather that has aged with magnificent patina over months of international travel. Worth every rupee."
            </p>
            <div className="pt-2 border-t border-slate-800">
              <div className="text-xs font-semibold text-slate-100">Ananya Sen</div>
              <div className="text-[10px] text-slate-400">Creative Director • Bengaluru</div>
            </div>
          </div>
        </div>
      </section>

    </div>
  );
};
