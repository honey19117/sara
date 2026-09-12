import React from 'react';

export const LoadingSpinner = ({ size = 'md', className = '' }) => {
  const sizeClasses = {
    sm: 'w-4 h-4 border-2',
    md: 'w-8 h-8 border-3',
    lg: 'w-12 h-12 border-4'
  };

  return (
    <div className={`flex items-center justify-center ${className}`}>
      <div
        className={`${sizeClasses[size] || sizeClasses.md} rounded-full border-slate-700 border-t-amber-400 animate-spin`}
      />
    </div>
  );
};

export const SkeletonCard = () => {
  return (
    <div className="glass-card overflow-hidden animate-pulse">
      <div className="w-full aspect-square bg-slate-800/60" />
      <div className="p-5 space-y-3">
        <div className="h-3 bg-slate-800 rounded w-1/3" />
        <div className="h-5 bg-slate-800 rounded w-4/5" />
        <div className="h-4 bg-slate-800 rounded w-1/2" />
        <div className="pt-2 flex justify-between items-center">
          <div className="h-6 bg-slate-800 rounded w-1/4" />
          <div className="h-8 bg-slate-800 rounded w-8" />
        </div>
      </div>
    </div>
  );
};
