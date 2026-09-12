import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Compass } from 'lucide-react';
import { api } from '../services/api';
import { LoadingSpinner } from '../components/common/LoadingSpinner';

export const CategoriesPage = () => {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCats = async () => {
      try {
        const data = await api.getCategories();
        if (data.success) setCategories(data.categories);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchCats();
  }, []);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-12 animate-fade-in">
      {/* Header */}
      <div className="text-center space-y-3 max-w-2xl mx-auto">
        <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs uppercase tracking-widest font-semibold">
          <Compass className="w-3.5 h-3.5" />
          <span>Curated Universes</span>
        </div>
        <h1 className="text-3xl sm:text-5xl font-cinzel font-bold text-slate-100">
          Distinct Disciplines
        </h1>
        <p className="text-sm text-slate-400">
          Explore our handcrafted product categories spanning Swiss precision horology, audiophile sound engineering, and luxury leathercraft.
        </p>
      </div>

      {loading ? (
        <LoadingSpinner size="lg" className="py-20" />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {categories.map((category) => (
            <Link
              key={category.id}
              to={`/shop?category=${category.slug}`}
              className="group relative rounded-2xl overflow-hidden glass-card aspect-[4/3] flex flex-col justify-end p-8 border border-slate-800 hover:border-amber-500/40 transition-all duration-500"
            >
              {/* Image */}
              <img
                src={category.image_url}
                alt={category.name}
                className="absolute inset-0 w-full h-full object-cover object-center filter brightness-[0.45] group-hover:scale-105 group-hover:brightness-[0.6] transition-all duration-700"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-aura-950 via-aura-950/50 to-transparent" />

              {/* Content */}
              <div className="relative z-10 space-y-2">
                <div className="text-xs uppercase tracking-widest text-amber-400 font-semibold">
                  {category.product_count || 4} Curated Masterpieces
                </div>
                <h3 className="text-2xl font-serif font-bold text-slate-100 group-hover:text-amber-300 transition-colors">
                  {category.name}
                </h3>
                <p className="text-xs text-slate-300 line-clamp-2 leading-relaxed opacity-90">
                  {category.description}
                </p>
                <div className="pt-2 inline-flex items-center gap-2 text-xs font-semibold text-amber-300 group-hover:translate-x-1 transition-transform">
                  <span>Explore Universe</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
};
