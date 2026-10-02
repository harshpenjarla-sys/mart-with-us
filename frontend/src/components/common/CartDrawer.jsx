import React from 'react';
import { useNavigate } from 'react-router-dom';
import { X, Trash2, Plus, Minus, ShoppingBag, ArrowRight, ShieldCheck, Sparkles } from 'lucide-react';
import { useCart } from '../../context/CartContext';
import ImageWithFallback from './ImageWithFallback';

export default function CartDrawer() {
  const navigate = useNavigate();
  const {
    cartItems,
    isCartOpen,
    setIsCartOpen,
    updateQuantity,
    removeFromCart,
    subtotal,
    mrpTotal,
    totalSavings,
    deliveryFee,
    tax,
    grandTotal,
    itemsCount
  } = useCart();

  if (!isCartOpen) return null;

  const handleCheckout = () => {
    setIsCartOpen(false);
    navigate('/checkout');
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      {/* Backdrop */}
      <div
        onClick={() => setIsCartOpen(false)}
        className="absolute inset-0 bg-black/50 backdrop-blur-xs transition-opacity duration-300"
      />

      <div className="fixed inset-y-0 right-0 max-w-full flex pl-10">
        <div className="w-screen max-w-md bg-white shadow-2xl flex flex-col">
          {/* Header */}
          <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between bg-gradient-to-r from-brand-50 to-white">
            <div className="flex items-center space-x-2">
              <div className="w-9 h-9 rounded-xl bg-brand-600 text-white flex items-center justify-center shadow-sm">
                <ShoppingBag className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-bold text-gray-900 text-base">My Cart ({itemsCount} items)</h3>
                <p className="text-[11px] text-gray-500">Express Delivery in 20-30 mins</p>
              </div>
            </div>
            <button
              onClick={() => setIsCartOpen(false)}
              className="p-1.5 rounded-lg text-gray-400 hover:text-gray-700 hover:bg-gray-100 transition"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Savings banner if discount applies */}
          {totalSavings > 0 && (
            <div className="bg-amber-50 px-6 py-2 border-b border-amber-100 flex items-center justify-between text-xs text-amber-900">
              <span className="flex items-center font-bold">
                <Sparkles className="w-3.5 h-3.5 mr-1 text-amber-600" />
                You are saving ₹{totalSavings} on this order!
              </span>
              <span className="text-[10px] bg-amber-200/80 px-2 py-0.5 rounded-full font-bold">
                GREAT DEALS
              </span>
            </div>
          )}

          {/* Cart Items List */}
          <div className="flex-1 overflow-y-auto p-6 space-y-4">
            {cartItems.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-center p-6 space-y-3">
                <div className="w-20 h-20 rounded-full bg-brand-50 flex items-center justify-center text-brand-500 text-3xl">
                  🛒
                </div>
                <h4 className="font-bold text-gray-800 text-lg">Your basket is empty</h4>
                <p className="text-xs text-gray-500 max-w-xs">
                  Explore fresh vegetables, dairy, atta, snacks, and daily essentials with lightning-fast delivery!
                </p>
                <button
                  onClick={() => {
                    setIsCartOpen(false);
                    navigate('/products');
                  }}
                  className="mt-3 px-5 py-2.5 bg-brand-600 hover:bg-brand-700 text-white rounded-xl text-xs font-bold shadow-md transition"
                >
                  Start Shopping Now
                </button>
              </div>
            ) : (
              cartItems.map((item) => {
                const p = item.product;
                const pid = p._id || p.id;
                return (
                  <div
                    key={pid}
                    className="flex items-center space-x-3.5 p-3 rounded-2xl border border-gray-100 bg-white hover:border-gray-200 transition shadow-xs"
                  >
                    {/* Thumbnail */}
                    <div className="w-16 h-16 rounded-xl overflow-hidden bg-gray-50 flex-shrink-0 border">
                      <ImageWithFallback
                        src={p.images && p.images[0]}
                        alt={p.name}
                        className="w-full h-full object-cover"
                      />
                    </div>

                    {/* Details */}
                    <div className="flex-1 min-w-0">
                      <h4 className="text-xs font-bold text-gray-900 truncate">{p.name}</h4>
                      <p className="text-[11px] text-gray-500">{p.quantity || p.unit || '1 unit'}</p>
                      <div className="flex items-baseline space-x-2 mt-1">
                        <span className="text-sm font-extrabold text-brand-700">₹{p.price}</span>
                        {p.mrp > p.price && (
                          <span className="text-xs text-gray-400 line-through">₹{p.mrp}</span>
                        )}
                      </div>
                    </div>

                    {/* Quantity controls */}
                    <div className="flex items-center border border-gray-200 rounded-xl bg-gray-50 p-0.5">
                      <button
                        onClick={() => updateQuantity(pid, item.quantity - 1)}
                        className="p-1 hover:bg-white rounded-lg text-gray-600 transition"
                      >
                        <Minus className="w-3.5 h-3.5" />
                      </button>
                      <span className="w-6 text-center text-xs font-bold text-gray-800">
                        {item.quantity}
                      </span>
                      <button
                        onClick={() => updateQuantity(pid, item.quantity + 1)}
                        className="p-1 hover:bg-white rounded-lg text-gray-600 transition"
                      >
                        <Plus className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    {/* Delete button */}
                    <button
                      onClick={() => removeFromCart(pid)}
                      className="p-1.5 text-gray-300 hover:text-rose-500 transition"
                      title="Remove item"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                );
              })
            )}
          </div>

          {/* Bill Summary & Checkout Footer */}
          {cartItems.length > 0 && (
            <div className="p-6 border-t border-gray-100 bg-gray-50/70 space-y-3">
              {/* Free delivery progress meter */}
              {subtotal < 499 ? (
                <div className="p-2.5 rounded-xl bg-emerald-50/80 border border-emerald-200 text-xs text-emerald-900">
                  <div className="flex justify-between items-center mb-1 font-semibold">
                    <span>Add ₹{499 - subtotal} more for FREE Delivery!</span>
                    <span className="font-mono text-[10px]">₹{subtotal}/₹499</span>
                  </div>
                  <div className="w-full bg-emerald-200/60 rounded-full h-1.5">
                    <div
                      className="bg-brand-600 h-1.5 rounded-full transition-all"
                      style={{ width: `${Math.min(100, (subtotal / 499) * 100)}%` }}
                    />
                  </div>
                </div>
              ) : (
                <div className="p-2 rounded-xl bg-emerald-100/70 text-emerald-900 text-xs font-bold flex items-center justify-center space-x-1.5">
                  <ShieldCheck className="w-4 h-4 text-emerald-700" />
                  <span>Yay! You unlocked FREE Delivery on this order.</span>
                </div>
              )}

              {/* Bill Details */}
              <div className="space-y-1.5 text-xs text-gray-600 pt-1">
                <div className="flex justify-between">
                  <span>Items Subtotal</span>
                  <span className="font-semibold text-gray-900">₹{subtotal}</span>
                </div>
                {totalSavings > 0 && (
                  <div className="flex justify-between text-emerald-700 font-medium">
                    <span>Product Discounts</span>
                    <span>-₹{totalSavings}</span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span>Delivery Partner Fee</span>
                  <span>{deliveryFee === 0 ? <strong className="text-brand-600">FREE</strong> : `₹${deliveryFee}`}</span>
                </div>
                <div className="flex justify-between">
                  <span>Handling & Govt Taxes</span>
                  <span>₹{tax}</span>
                </div>
                <div className="flex justify-between text-sm font-extrabold text-gray-900 pt-2 border-t border-gray-200">
                  <span>Grand Total</span>
                  <span className="text-base text-brand-700">₹{grandTotal}</span>
                </div>
              </div>

              {/* Checkout CTA */}
              <button
                onClick={handleCheckout}
                className="w-full py-3.5 px-4 bg-brand-600 hover:bg-brand-700 text-white rounded-xl font-bold text-sm shadow-lg shadow-brand-600/25 flex items-center justify-between transition group"
              >
                <div className="text-left">
                  <span className="text-[11px] block font-normal text-emerald-100 leading-tight">Payable Amount</span>
                  <span className="text-base font-extrabold">₹{grandTotal}</span>
                </div>
                <div className="flex items-center space-x-1 text-xs uppercase tracking-wider font-extrabold group-hover:translate-x-1 transition">
                  <span>Proceed to Checkout</span>
                  <ArrowRight className="w-4 h-4" />
                </div>
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
