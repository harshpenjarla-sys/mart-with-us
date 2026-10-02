import React, { useState } from 'react';
import { ShoppingBag } from 'lucide-react';

export default function ImageWithFallback({ src, alt, className = '', fallbackText = 'MART WITH US PRODUCT' }) {
  const [hasError, setHasError] = useState(false);

  if (hasError || !src) {
    return (
      <div className={`bg-gradient-to-br from-brand-50 to-emerald-100 flex flex-col items-center justify-center text-center p-3 border border-emerald-200/60 rounded-xl ${className}`}>
        <div className="w-10 h-10 rounded-full bg-white shadow-sm flex items-center justify-center text-brand-700 mb-1.5">
          <ShoppingBag className="w-5 h-5 text-brand-600" />
        </div>
        <span className="text-[11px] font-bold text-brand-800 uppercase tracking-wider">{fallbackText}</span>
        <span className="text-[10px] text-gray-500 font-medium truncate max-w-[90%] mt-0.5">{alt}</span>
      </div>
    );
  }

  return (
    <img
      src={src}
      alt={alt}
      className={className}
      loading="lazy"
      onError={() => setHasError(true)}
    />
  );
}
