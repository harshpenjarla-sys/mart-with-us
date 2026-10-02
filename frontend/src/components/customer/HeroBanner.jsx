import React from 'react';
import { Link } from 'react-router-dom';
import { ShoppingBag, ArrowRight, Zap, ShieldCheck, Sparkles, Clock } from 'lucide-react';

export default function HeroBanner() {
  return (
    <section className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-emerald-900 via-brand-900 to-emerald-950 text-white shadow-xl my-4 sm:my-6">
      {/* Decorative gradient glow circles */}
      <div className="absolute -top-24 -right-24 w-96 h-96 bg-brand-500/20 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-24 -left-24 w-96 h-96 bg-amber-500/15 rounded-full blur-3xl pointer-events-none" />

      <div className="relative max-w-7xl mx-auto px-6 sm:px-10 py-12 lg:py-16 grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
        {/* Left Content */}
        <div className="lg:col-span-7 space-y-6">
          {/* Tagline / Speed Badge & SWARALI Tag */}
          <div className="flex flex-wrap items-center gap-2">
            <div className="inline-flex items-center space-x-2 px-3 py-1.5 rounded-full bg-white/10 backdrop-blur-md border border-white/15 text-xs">
              <span className="flex h-2 w-2 rounded-full bg-emerald-400 animate-ping" />
              <span className="font-bold text-amber-300">⚡ EXPRESS 20-30 MIN DELIVERY</span>
              <span className="text-white/60">|</span>
              <span className="text-emerald-100">Across Pune Hubs</span>
            </div>

            <span className="inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-full bg-gradient-to-r from-amber-400 via-rose-400 to-amber-300 text-slate-950 font-black text-xs uppercase tracking-wider shadow-md">
              <span>👑</span>
              <span>SWARALI SIGNATURE</span>
            </span>
          </div>

          {/* Headline */}
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight leading-tight">
            Everything You Need. <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-300 via-brand-200 to-amber-200">
              Delivered To Your Door.
            </span>
          </h1>

          {/* Subheading */}
          <p className="text-base sm:text-lg text-emerald-100/90 max-w-xl font-normal leading-relaxed">
            Groceries, household essentials and everyday products — all in one place. Farm-fresh veggies, pure dairy, atta, dals, personal care, and snacks delivered in minutes.
          </p>

          {/* CTAs */}
          <div className="flex flex-wrap gap-4 pt-2">
            <Link
              to="/products"
              className="px-6 py-3.5 bg-gradient-to-r from-brand-500 to-brand-600 hover:from-brand-600 hover:to-brand-700 text-white font-extrabold rounded-2xl shadow-lg shadow-brand-500/30 hover:shadow-brand-500/50 transition transform hover:-translate-y-0.5 flex items-center space-x-2 text-sm tracking-wide"
            >
              <ShoppingBag className="w-4 h-4" />
              <span>SHOP NOW</span>
              <ArrowRight className="w-4 h-4" />
            </Link>

            <Link
              to="/products?tab=categories"
              className="px-6 py-3.5 bg-white/10 hover:bg-white/20 text-white font-bold rounded-2xl border border-white/20 backdrop-blur-md transition flex items-center space-x-2 text-sm"
            >
              <span>EXPLORE CATEGORIES</span>
            </Link>
          </div>

          {/* Value mini-stats */}
          <div className="grid grid-cols-3 gap-4 pt-4 border-t border-white/10 text-xs">
            <div>
              <p className="text-xl font-black text-amber-300">100+</p>
              <p className="text-emerald-200/80">Daily Essentials</p>
            </div>
            <div>
              <p className="text-xl font-black text-emerald-300">20-30m</p>
              <p className="text-emerald-200/80">Doorstep Arrival</p>
            </div>
            <div>
              <p className="text-xl font-black text-white">₹0 Fee</p>
              <p className="text-emerald-200/80">Orders over ₹499</p>
            </div>
          </div>
        </div>

        {/* Right Grocery Visual Card */}
        <div className="lg:col-span-5 relative">
          <div className="relative mx-auto max-w-sm rounded-3xl overflow-hidden border border-white/20 shadow-2xl bg-white/10 backdrop-blur-md p-4">
            <img
              src="https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&w=800&q=80"
              alt="Fresh Indian Grocery Mart"
              className="w-full h-64 object-cover rounded-2xl shadow-inner"
            />

            {/* Floating Live Delivery Notification card */}
            <div className="mt-3 bg-white text-gray-900 rounded-2xl p-3 shadow-lg flex items-center space-x-3 border border-gray-100">
              <div className="w-10 h-10 rounded-xl bg-brand-100 flex items-center justify-center text-xl text-brand-700 flex-shrink-0">
                🚴
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-extrabold text-brand-700 uppercase">Live Delivery</span>
                  <span className="text-[10px] text-gray-400">Order #MWU-10482</span>
                </div>
                <p className="text-xs font-bold truncate">Partner Rahul is 4 mins away</p>
                <div className="w-full bg-gray-100 rounded-full h-1 mt-1">
                  <div className="bg-brand-600 h-1 rounded-full w-4/5 animate-pulse" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
