import React, { useEffect } from 'react';
import { useParams, Link, useLocation } from 'react-router-dom';
import confetti from 'canvas-confetti';
import {
  CheckCircle2,
  Package,
  Bike,
  Clock,
  ArrowRight,
  ShoppingBag,
  Sparkles
} from 'lucide-react';

export default function OrderConfirmationPage() {
  const { orderId } = useParams();
  const location = useLocation();
  const order = location.state?.order;

  useEffect(() => {
    // Fire celebratory confetti on mount
    try {
      confetti({
        particleCount: 80,
        spread: 70,
        origin: { y: 0.6 }
      });
    } catch (e) {}
  }, []);

  return (
    <div className="max-w-2xl mx-auto py-8 sm:py-12 space-y-8 text-center">
      {/* Celebration Icon & Header */}
      <div className="space-y-3">
        <div className="w-20 h-20 bg-emerald-100 text-brand-600 rounded-full flex items-center justify-center mx-auto shadow-inner animate-bounce">
          <CheckCircle2 className="w-10 h-10" />
        </div>
        <div className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full bg-amber-50 border border-amber-200 text-amber-800 text-xs font-bold">
          <Sparkles className="w-3.5 h-3.5 text-amber-600" />
          <span>Order Confirmed 🎉</span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-black text-gray-900 tracking-tight">
          Your Order Has Been Placed!
        </h1>
        <p className="text-xs sm:text-sm text-gray-500 max-w-md mx-auto">
          Thank you for shopping with MART WITH US. Our store team is preparing your items with express care.
        </p>
      </div>

      {/* Order Reference Box */}
      <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-soft text-left space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-gray-100 gap-2">
          <div>
            <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block">Order ID</span>
            <span className="font-mono text-base sm:text-lg font-black text-brand-700">
              {orderId || order?.orderId || 'MWU-20261002-10482'}
            </span>
          </div>
          <div className="flex items-center space-x-2 text-xs font-bold text-gray-700 bg-gray-50 px-3 py-1.5 rounded-xl border border-gray-200/80">
            <Clock className="w-4 h-4 text-brand-600" />
            <span>Arrives in 25–35 minutes</span>
          </div>
        </div>

        {/* Live Workflow Progress Tracker */}
        <div className="space-y-3 pt-2">
          <h4 className="text-xs font-extrabold text-gray-900 uppercase tracking-wider">
            Live Delivery Workflow
          </h4>
          <div className="grid grid-cols-5 gap-1 sm:gap-2 text-center text-[10px] sm:text-xs">
            <div className="p-2 rounded-xl bg-brand-50 border border-brand-200 text-brand-800 font-bold">
              <span>1. Confirmed ✓</span>
            </div>
            <div className="p-2 rounded-xl bg-gray-50 text-gray-500 font-medium">
              <span>2. Packed</span>
            </div>
            <div className="p-2 rounded-xl bg-gray-50 text-gray-500 font-medium">
              <span>3. Assigned</span>
            </div>
            <div className="p-2 rounded-xl bg-gray-50 text-gray-500 font-medium">
              <span>4. Out for Delivery</span>
            </div>
            <div className="p-2 rounded-xl bg-gray-50 text-gray-500 font-medium">
              <span>5. Delivered</span>
            </div>
          </div>
        </div>

        {/* Quick order summary */}
        {order && (
          <div className="pt-3 border-t border-gray-100 flex justify-between text-xs text-gray-600">
            <span>Delivering to: <strong className="text-gray-900">{order.address?.house}, {order.address?.area}</strong></span>
            <span>Total Paid: <strong className="text-brand-700 text-sm">₹{order.total}</strong></span>
          </div>
        )}
      </div>

      {/* Action Buttons */}
      <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
        <Link
          to={`/orders/${orderId || order?.orderId}`}
          className="w-full sm:w-auto px-8 py-3.5 bg-brand-600 hover:bg-brand-700 text-white font-extrabold text-xs uppercase tracking-wider rounded-2xl shadow-lg shadow-brand-600/30 transition flex items-center justify-center space-x-2"
        >
          <Bike className="w-4 h-4" />
          <span>TRACK LIVE DELIVERY</span>
          <ArrowRight className="w-4 h-4" />
        </Link>

        <Link
          to="/orders"
          className="w-full sm:w-auto px-6 py-3.5 bg-white hover:bg-gray-50 text-gray-800 font-bold text-xs uppercase tracking-wider rounded-2xl border border-gray-200 transition"
        >
          View All Orders
        </Link>
      </div>
    </div>
  );
}
