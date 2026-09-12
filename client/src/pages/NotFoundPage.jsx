import React from 'react';
import { Link } from 'react-router-dom';
import { Compass, ArrowRight, Home } from 'lucide-react';

export const NotFoundPage = () => {
  return (
    <div className="min-h-[70vh] flex items-center justify-center px-4 py-20 animate-fade-in text-center">
      <div className="max-w-md space-y-6">
        <div className="font-cinzel text-7xl sm:text-8xl font-bold gold-gradient-text">
          404
        </div>
        <div className="space-y-2">
          <h1 className="text-2xl sm:text-3xl font-serif font-bold text-slate-100">
            Dimension Not Located
          </h1>
          <p className="text-xs text-slate-400">
            The curated artifact or page you requested could not be located in our atelier registers.
          </p>
        </div>
        <div className="flex items-center justify-center gap-4 pt-2">
          <Link to="/" className="btn-gold text-xs px-6 py-3 flex items-center gap-2">
            <Home className="w-3.5 h-3.5" />
            <span>Return Home</span>
          </Link>
          <Link to="/shop" className="btn-outline-gold text-xs px-6 py-3 flex items-center gap-2">
            <Compass className="w-3.5 h-3.5" />
            <span>Explore Collection</span>
          </Link>
        </div>
      </div>
    </div>
  );
};
