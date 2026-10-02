import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate, useLocation as useRouterLocation } from 'react-router-dom';
import {
  Search,
  ShoppingCart,
  MapPin,
  ChevronDown,
  User,
  Heart,
  Package,
  LogOut,
  Bike,
  ShieldCheck,
  Sparkles,
  ArrowRight,
  X
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useCart } from '../../context/CartContext';
import { useLocation } from '../../context/LocationContext';
import { productsAPI } from '../../services/api';

export default function Navbar() {
  const navigate = useNavigate();
  const routerLocation = useRouterLocation();
  const { user, isAuthenticated, logout, quickLoginAs } = useAuth();
  const { itemsCount, grandTotal, setIsCartOpen } = useCart();
  const { selectedLocation, setIsLocationModalOpen } = useLocation();

  const [searchTerm, setSearchTerm] = useState('');
  const [suggestions, setSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isDemoMenuOpen, setIsDemoMenuOpen] = useState(false);

  const searchRef = useRef(null);
  const profileRef = useRef(null);

  // Close menus on outside click
  useEffect(() => {
    const handleOutsideClick = (e) => {
      if (searchRef.current && !searchRef.current.contains(e.target)) {
        setShowSuggestions(false);
      }
      if (profileRef.current && !profileRef.current.contains(e.target)) {
        setIsProfileOpen(false);
        setIsDemoMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleOutsideClick);
    return () => document.removeEventListener('mousedown', handleOutsideClick);
  }, []);

  // Fetch search suggestions with debounce
  useEffect(() => {
    if (!searchTerm || searchTerm.trim().length < 2) {
      setSuggestions([]);
      return;
    }

    const timer = setTimeout(async () => {
      try {
        const res = await productsAPI.getSuggestions(searchTerm.trim());
        if (res.success) {
          setSuggestions(res.suggestions || []);
          setShowSuggestions(true);
        }
      } catch (e) {}
    }, 200);

    return () => clearTimeout(timer);
  }, [searchTerm]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (searchTerm.trim()) {
      setShowSuggestions(false);
      navigate(`/products?search=${encodeURIComponent(searchTerm.trim())}`);
    }
  };

  const handleSelectSuggestion = (s) => {
    setShowSuggestions(false);
    setSearchTerm('');
    if (s.type === 'product') {
      navigate(`/products/${s.id}`);
    } else {
      navigate(`/products?brand=${encodeURIComponent(s.text)}`);
    }
  };

  return (
    <header className="sticky top-0 z-40 bg-white border-b border-gray-100 shadow-sm transition-all">
      {/* Top Banner with Quick Switcher & App Tagline */}
      <div className="bg-brand-900 text-emerald-100 text-xs py-1.5 px-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <span className="inline-flex items-center px-1.5 py-0.5 rounded bg-brand-700/80 text-[10px] font-bold text-white uppercase tracking-wider">
              20-30 Min
            </span>
            <span className="hidden sm:inline font-medium">
              🛒 <span className="font-bold text-white">MART WITH US</span> — “Your Everyday Needs, Delivered.” • <span className="text-amber-300 font-black tracking-wider">✨ SWARALI EDITION</span>
            </span>
          </div>

          {/* Quick Demo Role Switcher */}
          <div className="flex items-center space-x-3 text-[11px]">
            <span className="text-emerald-300 hidden md:inline font-medium">Demo Switcher:</span>
            <button
              onClick={() => quickLoginAs('customer').then(() => navigate('/'))}
              className="hover:text-white underline decoration-emerald-500/60 font-medium"
              title="Login as Customer Rohan"
            >
              👤 Customer
            </button>
            <span className="text-brand-700">|</span>
            <button
              onClick={() => quickLoginAs('delivery').then(() => navigate('/delivery/dashboard'))}
              className="hover:text-white underline decoration-emerald-500/60 font-medium text-amber-300"
              title="Login as Delivery Partner Rahul"
            >
              🚴 Delivery Partner
            </button>
            <span className="text-brand-700">|</span>
            <button
              onClick={() => quickLoginAs('admin').then(() => navigate('/admin/dashboard'))}
              className="hover:text-white underline decoration-emerald-500/60 font-medium text-purple-200"
              title="Login as Admin"
            >
              🛡️ Admin
            </button>
          </div>
        </div>
      </div>

      {/* Main Navbar Bar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3">
        <div className="flex items-center justify-between gap-4 lg:gap-8">
          {/* Logo & Brand */}
          <div className="flex items-center space-x-4">
            <Link to="/" className="flex items-center space-x-2.5 group">
              <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-brand-700 to-brand-500 text-white flex items-center justify-center text-xl shadow-md group-hover:scale-105 transition">
                🛒
              </div>
              <div className="flex flex-col">
                <div className="flex items-center space-x-1.5">
                  <span className="font-extrabold text-xl lg:text-2xl tracking-tight text-gray-900 leading-none">
                    MART <span className="text-brand-600">WITH US</span>
                  </span>
                  <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-gradient-to-r from-amber-500 to-rose-500 text-white shadow-xs animate-pulse">
                    ✨ SWARALI
                  </span>
                </div>
                <span className="text-[10px] text-gray-500 font-semibold tracking-wide uppercase mt-0.5">
                  Everyday Kirana • Powered by <strong className="text-brand-700 font-bold">SWARALI</strong>
                </span>
              </div>
            </Link>

            {/* Location Selector Pill */}
            <button
              onClick={() => setIsLocationModalOpen(true)}
              className="hidden md:flex items-center space-x-1.5 px-3 py-1.5 rounded-xl border border-gray-200 hover:border-brand-500 hover:bg-brand-50/40 text-left transition text-xs"
            >
              <MapPin className="w-4 h-4 text-brand-600 flex-shrink-0" />
              <div className="max-w-[140px] truncate">
                <span className="text-[10px] uppercase font-bold text-gray-400 block leading-tight">Deliver to</span>
                <span className="font-bold text-gray-800 truncate block">
                  {selectedLocation.area}, {selectedLocation.city}
                </span>
              </div>
              <ChevronDown className="w-3.5 h-3.5 text-gray-400" />
            </button>
          </div>

          {/* Search Bar with live autocomplete */}
          <div className="flex-1 max-w-2xl relative" ref={searchRef}>
            <form onSubmit={handleSearchSubmit} className="relative">
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                onFocus={() => {
                  if (suggestions.length > 0) setShowSuggestions(true);
                }}
                placeholder="Search for groceries, fruits, milk, atta, snacks, detergent..."
                className="w-full pl-10 pr-10 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:bg-white focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20 transition shadow-inner"
              />
              <Search className="w-4 h-4 text-gray-400 absolute left-3.5 top-3.5 pointer-events-none" />
              {searchTerm && (
                <button
                  type="button"
                  onClick={() => {
                    setSearchTerm('');
                    setSuggestions([]);
                  }}
                  className="absolute right-3 top-3 text-gray-400 hover:text-gray-600"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </form>

            {/* Search Suggestions Dropdown */}
            {showSuggestions && suggestions.length > 0 && (
              <div className="absolute top-full left-0 right-0 mt-1.5 bg-white border border-gray-100 rounded-2xl shadow-xl overflow-hidden z-50 animate-fadeIn">
                <div className="p-2 border-b border-gray-50 bg-gray-50/50 flex justify-between items-center text-xs text-gray-500 px-3">
                  <span>Suggestions for "{searchTerm}"</span>
                  <span className="text-[10px] text-gray-400">Press Enter to search all</span>
                </div>
                <div className="max-h-72 overflow-y-auto divide-y divide-gray-50">
                  {suggestions.map((s, idx) => (
                    <button
                      key={idx}
                      onClick={() => handleSelectSuggestion(s)}
                      className="w-full px-4 py-2.5 text-left text-sm hover:bg-emerald-50 flex items-center justify-between group transition"
                    >
                      <div className="flex items-center space-x-3 truncate">
                        {s.image ? (
                          <img src={s.image} alt={s.text} className="w-8 h-8 rounded-lg object-cover border" />
                        ) : (
                          <div className="w-8 h-8 rounded-lg bg-gray-100 flex items-center justify-center text-gray-500 text-xs font-bold">
                            {s.type === 'brand' ? '🏷️' : '🛒'}
                          </div>
                        )}
                        <div>
                          <p className="font-semibold text-gray-800 text-xs group-hover:text-brand-700 truncate">{s.text}</p>
                          <span className="text-[10px] text-gray-400 capitalize">{s.type}</span>
                        </div>
                      </div>
                      {s.price && (
                        <span className="font-bold text-brand-700 text-xs">₹{s.price}</span>
                      )}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Action Navigation: Partner CTA, Track, Profile, Cart */}
          <div className="flex items-center space-x-2 sm:space-x-3">
            {/* Delivery Partner CTA button */}
            <Link
              to="/delivery/login"
              className="hidden xl:flex items-center space-x-1.5 px-3 py-1.5 text-xs font-bold text-brand-800 bg-brand-50 border border-brand-200 rounded-xl hover:bg-brand-100 transition"
            >
              <Bike className="w-4 h-4 text-brand-600" />
              <span>Partner Portal</span>
            </Link>

            {/* Profile Dropdown */}
            <div className="relative" ref={profileRef}>
              {isAuthenticated ? (
                <button
                  onClick={() => setIsProfileOpen(!isProfileOpen)}
                  className="flex items-center space-x-2 p-1.5 sm:px-3 sm:py-2 rounded-xl hover:bg-gray-100 transition border border-transparent hover:border-gray-200"
                >
                  <div className="w-8 h-8 rounded-full bg-brand-600 text-white flex items-center justify-center font-bold text-xs uppercase shadow-sm">
                    {user.name ? user.name[0] : 'U'}
                  </div>
                  <div className="hidden lg:block text-left">
                    <span className="text-xs font-bold text-gray-900 block truncate max-w-[100px] leading-tight">
                      {user.name.split(' ')[0]}
                    </span>
                    <span className="text-[10px] text-brand-700 font-semibold uppercase">{user.role}</span>
                  </div>
                  <ChevronDown className="w-3.5 h-3.5 text-gray-400 hidden lg:block" />
                </button>
              ) : (
                <Link
                  to="/login"
                  className="flex items-center space-x-1.5 px-3 py-2 text-xs font-bold text-gray-700 hover:text-brand-600 hover:bg-gray-50 rounded-xl transition border border-gray-200"
                >
                  <User className="w-4 h-4" />
                  <span>Login</span>
                </Link>
              )}

              {/* Profile Menu Popup */}
              {isProfileOpen && isAuthenticated && (
                <div className="absolute right-0 mt-2 w-56 bg-white border border-gray-100 rounded-2xl shadow-xl py-2 z-50 animate-fadeIn">
                  <div className="px-4 py-2.5 border-b border-gray-100 bg-gray-50/50">
                    <p className="font-bold text-sm text-gray-900 truncate">{user.name}</p>
                    <p className="text-xs text-gray-500 truncate">{user.email}</p>
                    <span className="inline-block mt-1 px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-brand-100 text-brand-800">
                      {user.role} account
                    </span>
                  </div>

                  <div className="py-1">
                    {user.role === 'customer' && (
                      <>
                        <Link
                          to="/profile"
                          onClick={() => setIsProfileOpen(false)}
                          className="flex items-center space-x-2.5 px-4 py-2 text-xs font-medium text-gray-700 hover:bg-emerald-50 hover:text-brand-700"
                        >
                          <User className="w-4 h-4 text-gray-400" />
                          <span>My Profile & Addresses</span>
                        </Link>
                        <Link
                          to="/orders"
                          onClick={() => setIsProfileOpen(false)}
                          className="flex items-center space-x-2.5 px-4 py-2 text-xs font-medium text-gray-700 hover:bg-emerald-50 hover:text-brand-700"
                        >
                          <Package className="w-4 h-4 text-gray-400" />
                          <span>My Orders & Tracking</span>
                        </Link>
                        <Link
                          to="/wishlist"
                          onClick={() => setIsProfileOpen(false)}
                          className="flex items-center space-x-2.5 px-4 py-2 text-xs font-medium text-gray-700 hover:bg-emerald-50 hover:text-brand-700"
                        >
                          <Heart className="w-4 h-4 text-gray-400" />
                          <span>Saved Wishlist</span>
                        </Link>
                      </>
                    )}

                    {user.role === 'delivery' && (
                      <Link
                        to="/delivery/dashboard"
                        onClick={() => setIsProfileOpen(false)}
                        className="flex items-center space-x-2.5 px-4 py-2 text-xs font-medium text-amber-700 hover:bg-amber-50"
                      >
                        <Bike className="w-4 h-4 text-amber-600" />
                        <span>Delivery Partner Dashboard</span>
                      </Link>
                    )}

                    {user.role === 'admin' && (
                      <Link
                        to="/admin/dashboard"
                        onClick={() => setIsProfileOpen(false)}
                        className="flex items-center space-x-2.5 px-4 py-2 text-xs font-medium text-purple-700 hover:bg-purple-50"
                      >
                        <ShieldCheck className="w-4 h-4 text-purple-600" />
                        <span>Admin Control Center</span>
                      </Link>
                    )}
                  </div>

                  <div className="pt-1 border-t border-gray-100">
                    <button
                      onClick={() => {
                        logout();
                        setIsProfileOpen(false);
                        navigate('/login');
                      }}
                      className="w-full flex items-center space-x-2.5 px-4 py-2 text-xs font-semibold text-rose-600 hover:bg-rose-50 transition"
                    >
                      <LogOut className="w-4 h-4" />
                      <span>Log Out</span>
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Cart Button */}
            <button
              onClick={() => setIsCartOpen(true)}
              className="flex items-center space-x-2.5 px-3 py-2 bg-brand-600 hover:bg-brand-700 text-white rounded-xl shadow-md shadow-brand-600/20 hover:shadow-brand-600/30 transition transform active:scale-95"
            >
              <div className="relative">
                <ShoppingCart className="w-5 h-5" />
                {itemsCount > 0 && (
                  <span className="absolute -top-2 -right-2 w-4 h-4 bg-amber-400 text-gray-900 rounded-full text-[10px] font-extrabold flex items-center justify-center animate-bounce">
                    {itemsCount}
                  </span>
                )}
              </div>
              <div className="hidden sm:block text-left leading-none">
                <span className="text-[10px] font-semibold text-emerald-100 block">
                  {itemsCount} {itemsCount === 1 ? 'item' : 'items'}
                </span>
                <span className="text-xs font-extrabold text-white">
                  ₹{grandTotal}
                </span>
              </div>
            </button>
          </div>
        </div>

        {/* Secondary Category Navigation Strip */}
        <nav className="mt-3 pt-2.5 border-t border-gray-100 flex items-center justify-between text-xs font-medium text-gray-600 overflow-x-auto no-scrollbar gap-5">
          <div className="flex items-center space-x-6 whitespace-nowrap">
            <Link
              to="/"
              className={`hover:text-brand-600 transition flex items-center space-x-1 ${
                routerLocation.pathname === '/' ? 'text-brand-600 font-bold' : ''
              }`}
            >
              <span>Home</span>
            </Link>
            <Link
              to="/products"
              className={`hover:text-brand-600 transition flex items-center space-x-1 ${
                routerLocation.pathname === '/products' ? 'text-brand-600 font-bold' : ''
              }`}
            >
              <span>All Products</span>
            </Link>
            <Link
              to="/products?category=Grocery %26 Staples"
              className="hover:text-brand-600 transition"
            >
              Atta, Dal & Rice
            </Link>
            <Link
              to="/products?category=Fresh Produce"
              className="hover:text-brand-600 transition flex items-center space-x-1"
            >
              <span>🥦 Fresh Produce</span>
            </Link>
            <Link
              to="/products?category=Dairy %26 Eggs"
              className="hover:text-brand-600 transition"
            >
              Dairy & Eggs
            </Link>
            <Link
              to="/products?category=Snacks %26 Beverages"
              className="hover:text-brand-600 transition"
            >
              Snacks & Drinks
            </Link>
            <Link
              to="/offers"
              className="text-rose-600 font-bold hover:text-rose-700 transition flex items-center space-x-1"
            >
              <span>🔥 Flash Deals</span>
            </Link>
            <Link
              to="/orders"
              className="hover:text-brand-600 transition"
            >
              Track Order
            </Link>
          </div>

          <div className="hidden lg:flex items-center space-x-3 text-[11px] text-gray-400">
            <span className="flex items-center text-emerald-700 font-semibold bg-emerald-50 px-2 py-0.5 rounded-full">
              ⚡ Delivery in 20-30 mins
            </span>
          </div>
        </nav>
      </div>
    </header>
  );
}
