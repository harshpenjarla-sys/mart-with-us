import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  ShoppingBag,
  Trash2,
  Plus,
  Minus,
  ArrowRight,
  ShieldCheck,
  Sparkles,
  ArrowLeft
} from 'lucide-react';
import { useCart } from '../../context/CartContext';
import ImageWithFallback from '../../components/common/ImageWithFallback';

export default function CartPage() {
  const navigate = useNavigate();
  const {
    cartItems,
    updateQuantity,
    removeFromCart,
    clearCart,
    subtotal,
    mrpTotal,
    totalSavings,
    deliveryFee,
    tax,
    grandTotal,
    itemsCount
  } = useCart();

  if (cartItems.length === 0) {
    return (
      <div className="max-w-md mx-auto py-16 text-center space-y-4">
        <div className="w-24 h-24 rounded-full bg-brand-50 text-brand-600 flex items-center justify-center mx-auto text-4xl shadow-inner">
          🛒
        </div>
        <h2 className="text-2xl font-black text-gray-900">Your Cart is Empty</h2>
        <p className="text-xs text-gray-500">
          Looks like you haven't added anything to your cart yet. Browse our wide range of groceries and essentials!
        </p>
        <Link
          to="/products"
          className="inline-flex items-center space-x-2 px-6 py-3 bg-brand-600 hover:bg-brand-700 text-white rounded-xl text-xs font-bold shadow-md transition"
        >
          <ShoppingBag className="w-4 h-4" />
          <span>Start Shopping</span>
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto space-y-8 py-2">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-black text-gray-900 tracking-tight">Shopping Cart</h1>
          <p className="text-xs text-gray-500">Review your selected essentials ({itemsCount} items)</p>
        </div>
        <button
          onClick={clearCart}
          className="text-xs font-bold text-rose-600 hover:underline"
        >
          Clear Cart
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Cart Items List */}
        <div className="lg:col-span-8 space-y-4">
          {cartItems.map((item) => {
            const p = item.product;
            const pid = p._id || p.id;
            return (
              <div
                key={pid}
                className="bg-white p-4 rounded-2xl border border-gray-100 shadow-xs flex items-center space-x-4"
              >
                <div className="w-20 h-20 rounded-xl overflow-hidden bg-gray-50 flex-shrink-0 border">
                  <ImageWithFallback
                    src={p.images && p.images[0]}
                    alt={p.name}
                    className="w-full h-full object-cover"
                  />
                </div>

                <div className="flex-1 min-w-0">
                  <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">{p.brand}</span>
                  <Link to={`/products/${pid}`} className="font-bold text-sm text-gray-900 hover:text-brand-600 truncate block">
                    {p.name}
                  </Link>
                  <p className="text-xs text-gray-500">{p.quantity}</p>
                  <div className="flex items-baseline space-x-2 mt-1">
                    <span className="text-sm font-black text-gray-900">₹{p.price}</span>
                    {p.mrp > p.price && (
                      <span className="text-xs text-gray-400 line-through">₹{p.mrp}</span>
                    )}
                  </div>
                </div>

                <div className="flex items-center space-x-2">
                  <div className="flex items-center border border-gray-200 rounded-xl bg-gray-50 p-1">
                    <button
                      onClick={() => updateQuantity(pid, item.quantity - 1)}
                      className="p-1 hover:bg-white rounded-lg text-gray-600"
                    >
                      <Minus className="w-3.5 h-3.5" />
                    </button>
                    <span className="w-8 text-center text-xs font-bold">{item.quantity}</span>
                    <button
                      onClick={() => updateQuantity(pid, item.quantity + 1)}
                      className="p-1 hover:bg-white rounded-lg text-gray-600"
                    >
                      <Plus className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  <button
                    onClick={() => removeFromCart(pid)}
                    className="p-2 text-gray-300 hover:text-rose-500 transition"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>

        {/* Order Summary Box */}
        <div className="lg:col-span-4 space-y-4">
          <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-soft space-y-4">
            <h3 className="font-black text-base text-gray-900 pb-3 border-b border-gray-100">
              Bill Details
            </h3>

            {totalSavings > 0 && (
              <div className="p-2.5 rounded-xl bg-amber-50 text-amber-900 text-xs font-bold flex items-center justify-between">
                <span className="flex items-center">
                  <Sparkles className="w-3.5 h-3.5 mr-1 text-amber-600" />
                  Total Savings:
                </span>
                <span>₹{totalSavings}</span>
              </div>
            )}

            <div className="space-y-2 text-xs text-gray-600">
              <div className="flex justify-between">
                <span>Items Subtotal</span>
                <span className="font-bold text-gray-900">₹{subtotal}</span>
              </div>
              <div className="flex justify-between">
                <span>Delivery Charge</span>
                <span>{deliveryFee === 0 ? <strong className="text-brand-600">FREE</strong> : `₹${deliveryFee}`}</span>
              </div>
              <div className="flex justify-between">
                <span>Taxes & Packaging Fee</span>
                <span>₹{tax}</span>
              </div>
              <div className="flex justify-between text-base font-black text-gray-900 pt-3 border-t border-gray-100">
                <span>To Pay</span>
                <span className="text-brand-700">₹{grandTotal}</span>
              </div>
            </div>

            <button
              onClick={() => navigate('/checkout')}
              className="w-full py-3.5 bg-brand-600 hover:bg-brand-700 text-white rounded-xl font-bold text-xs uppercase tracking-wider shadow-lg shadow-brand-600/25 flex items-center justify-center space-x-2 transition"
            >
              <span>PROCEED TO CHECKOUT</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>

          <div className="p-4 rounded-2xl bg-brand-50/70 border border-brand-200/60 text-xs text-brand-900 flex items-center space-x-2.5">
            <ShieldCheck className="w-5 h-5 text-brand-700 flex-shrink-0" />
            <span>Safe & contactless delivery with tamper-proof packaging.</span>
          </div>
        </div>
      </div>
    </div>
  );
}
