import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { UserPlus, AlertCircle, ShoppingBag } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

export default function RegisterPage() {
  const navigate = useNavigate();
  const { register } = useAuth();

  const [form, setForm] = useState({
    name: '',
    email: '',
    phone: '',
    password: ''
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      setError('');
      await register({ ...form, role: 'customer' });
      navigate('/');
    } catch (err) {
      setError(err.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto py-8 sm:py-12 space-y-6">
      <div className="text-center space-y-2">
        <div className="w-14 h-14 rounded-2xl bg-brand-600 text-white flex items-center justify-center text-2xl mx-auto shadow-md">
          🛒
        </div>
        <h1 className="text-2xl font-black text-gray-900 tracking-tight">Create Customer Account</h1>
        <p className="text-xs text-gray-500">Sign up for 20-30 min express grocery deliveries</p>
      </div>

      <div className="bg-white p-6 sm:p-8 rounded-3xl border border-gray-100 shadow-soft space-y-4">
        {error && (
          <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-semibold flex items-center space-x-2">
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="text-xs font-bold text-gray-700 block mb-1">Full Name *</label>
            <input
              type="text"
              required
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              placeholder="e.g. Priya Patil"
              className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl text-xs focus:bg-white"
            />
          </div>

          <div>
            <label className="text-xs font-bold text-gray-700 block mb-1">Email Address *</label>
            <input
              type="email"
              required
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              placeholder="priya@example.com"
              className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl text-xs focus:bg-white"
            />
          </div>

          <div>
            <label className="text-xs font-bold text-gray-700 block mb-1">Mobile Phone *</label>
            <input
              type="tel"
              required
              value={form.phone}
              onChange={(e) => setForm({ ...form, phone: e.target.value })}
              placeholder="10-digit mobile"
              className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl text-xs focus:bg-white"
            />
          </div>

          <div>
            <label className="text-xs font-bold text-gray-700 block mb-1">Password *</label>
            <input
              type="password"
              required
              minLength="6"
              value={form.password}
              onChange={(e) => setForm({ ...form, password: e.target.value })}
              placeholder="Create strong password"
              className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl text-xs focus:bg-white"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3.5 bg-brand-600 hover:bg-brand-700 text-white rounded-xl font-bold text-xs uppercase tracking-wider shadow-md transition flex items-center justify-center space-x-2"
          >
            <UserPlus className="w-4 h-4" />
            <span>{loading ? 'Creating Account...' : 'Sign Up Free'}</span>
          </button>
        </form>

        <div className="pt-2 text-center text-xs text-gray-500">
          Already registered?{' '}
          <Link to="/login" className="font-bold text-brand-700 hover:underline">
            Login Here
          </Link>
        </div>
      </div>
    </div>
  );
}
