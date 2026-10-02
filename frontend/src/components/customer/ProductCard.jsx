import React from 'react';
import { Link } from 'react-router-dom';
import { Plus, Minus, Star, Heart, Clock, Check } from 'lucide-react';
import { useCart } from '../../context/CartContext';
import { useAuth } from '../../context/AuthContext';
import ImageWithFallback from '../common/ImageWithFallback';

export default function ProductCard({ product, onWishlistToggle, isWishlisted = false }) {
  const { addToCart, updateQuantity, getItemQuantity } = useCart();
  const { isAuthenticated } = useAuth();

  const pid = String(product._id || product.id);
  const qty = getItemQuantity(pid);
  const isOutOfStock = product.stock <= 0;

  const handleAdd = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (!isOutOfStock) {
      addToCart(product, 1);
    }
  };

  const handleIncrement = (e) => {
    e.preventDefault();
    e.stopPropagation();
    addToCart(product, 1);
  };

  const handleDecrement = (e) => {
    e.preventDefault();
    e.stopPropagation();
    updateQuantity(pid, qty - 1);
  };

  const handleWishlist = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (onWishlistToggle) onWishlistToggle(pid);
  };

  return (
    <div className="group relative bg-white border border-gray-100 rounded-2xl p-3 sm:p-4 hover:shadow-soft hover:border-brand-200 transition-all duration-300 flex flex-col justify-between">
      {/* Top Badges & Wishlist */}
      <div className="flex items-center justify-between mb-2">
        {product.discount > 0 ? (
          <span className="bg-emerald-50 text-brand-700 text-[10px] font-extrabold px-2 py-0.5 rounded-full border border-emerald-200 uppercase tracking-wider">
            {product.discount}% OFF
          </span>
        ) : (
          <span className="text-[10px] text-gray-400 font-medium">Standard</span>
        )}

        <button
          onClick={handleWishlist}
          className={`p-1.5 rounded-full transition ${
            isWishlisted
              ? 'text-rose-500 bg-rose-50'
              : 'text-gray-300 hover:text-rose-500 hover:bg-gray-50'
          }`}
          title="Save to Wishlist"
        >
          <Heart className={`w-4 h-4 ${isWishlisted ? 'fill-current' : ''}`} />
        </button>
      </div>

      {/* Product Image Link */}
      <Link to={`/products/${pid}`} className="block relative aspect-square w-full rounded-xl overflow-hidden bg-gray-50 mb-3 group-hover:scale-[1.02] transition duration-300">
        <ImageWithFallback
          src={product.images && product.images[0]}
          alt={product.name}
          className="w-full h-full object-cover"
        />

        {/* Delivery Estimate Pill */}
        <div className="absolute bottom-2 left-2 bg-white/90 backdrop-blur-xs px-2 py-0.5 rounded-md text-[10px] font-bold text-gray-700 flex items-center space-x-1 shadow-xs border border-gray-100">
          <Clock className="w-3 h-3 text-brand-600" />
          <span>{product.deliveryEstimate || '20-30 min'}</span>
        </div>

        {isOutOfStock && (
          <div className="absolute inset-0 bg-white/80 backdrop-blur-xs flex items-center justify-center">
            <span className="px-2.5 py-1 bg-gray-800 text-white text-[11px] font-bold rounded-lg uppercase tracking-wider">
              Out of Stock
            </span>
          </div>
        )}
      </Link>

      {/* Product Info */}
      <div className="flex-1 flex flex-col">
        {/* Brand */}
        <span className="text-[11px] font-bold text-gray-400 uppercase tracking-wider">
          {product.brand}
        </span>

        {/* Title */}
        <Link to={`/products/${pid}`} className="font-bold text-xs sm:text-sm text-gray-900 group-hover:text-brand-600 transition line-clamp-2 mt-0.5 mb-1 leading-snug">
          {product.name}
        </Link>

        {/* Quantity/weight */}
        <p className="text-xs text-gray-500 font-medium mb-2">
          {product.quantity}
        </p>

        {/* Rating */}
        <div className="flex items-center space-x-1 mb-3">
          <div className="flex items-center bg-emerald-50 px-1.5 py-0.5 rounded-md text-[11px] font-extrabold text-brand-800 border border-emerald-100">
            <span>{product.rating || '4.5'}</span>
            <Star className="w-3 h-3 fill-current text-amber-500 ml-0.5" />
          </div>
          <span className="text-[10px] text-gray-400">({product.reviewsCount || 15})</span>
        </div>
      </div>

      {/* Pricing & Add To Cart Button */}
      <div className="pt-2 border-t border-gray-50 flex items-center justify-between gap-2">
        <div>
          <div className="flex items-baseline space-x-1.5">
            <span className="text-sm sm:text-base font-extrabold text-gray-900">
              ₹{product.price}
            </span>
            {product.mrp > product.price && (
              <span className="text-xs text-gray-400 line-through">
                ₹{product.mrp}
              </span>
            )}
          </div>
        </div>

        {/* Action Button: Stepper or ADD */}
        {qty > 0 ? (
          <div className="flex items-center bg-brand-600 text-white rounded-xl shadow-xs p-0.5">
            <button
              onClick={handleDecrement}
              className="p-1 sm:px-1.5 hover:bg-brand-700 rounded-lg transition"
              title="Decrease"
            >
              <Minus className="w-3.5 h-3.5" />
            </button>
            <span className="px-2 text-xs font-extrabold">{qty}</span>
            <button
              onClick={handleIncrement}
              className="p-1 sm:px-1.5 hover:bg-brand-700 rounded-lg transition"
              title="Increase"
            >
              <Plus className="w-3.5 h-3.5" />
            </button>
          </div>
        ) : (
          <button
            onClick={handleAdd}
            disabled={isOutOfStock}
            className={`px-3 py-1.5 sm:px-4 sm:py-2 rounded-xl text-xs font-bold transition flex items-center space-x-1 ${
              isOutOfStock
                ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                : 'bg-brand-50 text-brand-700 hover:bg-brand-600 hover:text-white border border-brand-200 hover:border-transparent active:scale-95 shadow-xs'
            }`}
          >
            <Plus className="w-3.5 h-3.5 mr-0.5" />
            <span>ADD</span>
          </button>
        )}
      </div>
    </div>
  );
}
