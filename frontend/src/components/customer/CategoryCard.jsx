import React from 'react';
import { Link } from 'react-router-dom';
import ImageWithFallback from '../common/ImageWithFallback';

export default function CategoryCard({ category }) {
  return (
    <Link
      to={`/products?category=${encodeURIComponent(category.name)}`}
      className="group flex flex-col items-center text-center p-3 rounded-2xl bg-white border border-gray-100 hover:border-brand-300 hover:shadow-soft transition-all duration-300"
    >
      <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl overflow-hidden bg-brand-50/60 p-2 mb-2 group-hover:scale-105 transition duration-300 border border-brand-100/50 flex items-center justify-center">
        {category.image ? (
          <ImageWithFallback
            src={category.image}
            alt={category.name}
            className="w-full h-full object-cover rounded-xl"
            fallbackText={category.icon || 'MART'}
          />
        ) : (
          <span className="text-3xl">{category.icon || '🛒'}</span>
        )}
      </div>
      <h4 className="text-xs sm:text-sm font-bold text-gray-900 group-hover:text-brand-700 transition line-clamp-1">
        {category.name}
      </h4>
      <span className="text-[10px] text-gray-400 mt-0.5">
        {category.subCategories ? `${category.subCategories.length}+ varieties` : 'Fresh Essentials'}
      </span>
    </Link>
  );
}
