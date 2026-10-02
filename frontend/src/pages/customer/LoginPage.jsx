import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { LogIn, AlertCircle, ShoppingBag, Bike, ShieldCheck, ArrowRight } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

export default function LoginPage() {
  const navigate = useNavigate();
  const { login, quickLoginAs } = useAuth();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      setError('');
      const res = await login(email, password, 'customer');
      if (res.user.role === 'customer') {
        navigate('/');
      } else if (res.user.role === 'delivery') {
        navigate('/delivery/dashboard');
      } else if (res.user.role === 'admin') {
        navigate('/admin/dashboard');
      } else {
        navigate('/');
      }
    } catch (err) {
      setError(err.message || 'Login failed. Please check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  const handleDemoLogin = async (role) => {
    try {
      setLoading(true);
      setError('');
      await quickLoginAs(role);
      if (role === 'delivery') {
        navigate('/delivery/dashboard');
      } else if (role === 'admin') {
        navigate('/admin/dashboard');
      } else {
        navigate('/');
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto py-8 sm:py-12 space-y-6">
      {/* Brand logo & title */}
      <div className="text-center space-y-2">
        <div className="w-14 h-14 rounded-2xl bg-brand-600 text-white flex items-center justify-center text-2xl mx-auto shadow-md shadow-brand-600/20">
          🛒
        </div>
        <h1 className="text-2xl font-black text-gray-900 tracking-tight">
          Welcome to MART WITH US
        </h1>
        <p className="text-xs text-gray-500">
          Sign in to access your saved addresses, cart and active orders
        </p>
      </div>

      {/* Demo Credentials Helper Box */}
      <div className="p-4 rounded-2xl bg-gradient-to-r from-emerald-50 via-teal-50 to-emerald-100 border border-emerald-200/80 space-y-2">
        <span className="text-[10px] font-extrabold uppercase tracking-wider text-emerald-900 block">
          ⚡ One-Click Demo Accounts (Requirement #43)
        </span>
        <div className="grid grid-cols-3 gap-2 text-xs">
          <button
            type="button"
            onClick={() => handleDemoLogin('customer')}
            className="p-2 bg-white rounded-xl font-bold text-gray-800 border border-emerald-200 hover:bg-emerald-50 text-left shadow-xs transition"
          >
            <span className="block text-[10px] text-gray-400 font-normal">Customer</span>
            <span className="truncate block">Rohan S.</span>
          </button>

          <button
            type="button"
            onClick={() => handleDemoLogin('delivery')}
            className="p-2 bg-white rounded-xl font-bold text-amber-800 border border-amber-200 hover:bg-amber-50 text-left shadow-xs transition"
          >
            <span className="block text-[10px] text-amber-600 font-normal">Delivery</span>
            <span className="truncate block">Rahul V.</span>
          </button>

          <button
            type="button"
            onClick={() => handleDemoLogin('admin')}
            className="p-2 bg-white rounded-xl font-bold text-purple-800 border border-purple-200 hover:bg-purple-50 text-left shadow-xs transition"
          >
            <span className="block text-[10px] text-purple-600 font-normal">Admin</span>
            <span className="truncate block">Control</span>
          </button>
        </div>
      </div>

      {/* Main Login Form */}
      <div className="bg-white p-6 sm:p-8 rounded-3xl border border-gray-100 shadow-soft space-y-4">
        {error && (
          <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-semibold flex items-center space-x-2">
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="text-xs font-bold text-gray-700 block mb-1">Email Address</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              placeholder="customer@martwithus.com"
              className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl text-xs focus:bg-white focus:outline-none focus:border-brand-500"
            />
          </div>

          <div>
            <label className="text-xs font-bold text-gray-700 block mb-1">Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              placeholder="••••••••"
              className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl text-xs focus:bg-white focus:outline-none focus:border-brand-500"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3.5 bg-brand-600 hover:bg-brand-700 text-white rounded-xl font-bold text-xs uppercase tracking-wider shadow-md shadow-brand-600/25 transition flex items-center justify-center space-x-2"
          >
            <LogIn className="w-4 h-4" />
            <span>{loading ? 'Signing in...' : 'Sign In'}</span>
          </button>
        </form>

        <div className="pt-2 text-center text-xs text-gray-500">
          Don't have an account?{' '}
          <Link to="/register" className="font-bold text-brand-700 hover:underline">
            Register Here
          </Link>
        </div>
      </div>
    </div>
  );
}
