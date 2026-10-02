import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Bike, LogIn, AlertCircle, ArrowRight, ShieldCheck } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

export default function DeliveryLoginPage() {
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
      await login(email, password, 'delivery');
      navigate('/delivery/dashboard');
    } catch (err) {
      setError(err.message || 'Delivery login failed.');
    } finally {
      setLoading(false);
    }
  };

  const handleDemoPartner = async () => {
    try {
      setLoading(true);
      setError('');
      await quickLoginAs('delivery');
      navigate('/delivery/dashboard');
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto py-8 space-y-6">
      <div className="text-center space-y-2">
        <div className="w-16 h-16 rounded-3xl bg-amber-500 text-slate-950 flex items-center justify-center text-3xl mx-auto shadow-lg shadow-amber-500/20">
          🚴
        </div>
        <h1 className="text-2xl font-black text-white">Delivery Partner Login</h1>
        <p className="text-xs text-slate-400">Access your active routes, delivery orders and daily earnings</p>
      </div>

      {/* Demo Credentials Box */}
      <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-amber-200 text-xs space-y-2">
        <div className="flex items-center justify-between">
          <span className="font-extrabold uppercase tracking-wider text-[11px] text-amber-400">
            Demo Delivery Account
          </span>
          <span className="text-[10px] bg-amber-500/20 px-2 py-0.5 rounded text-amber-300">
            Ready to test
          </span>
        </div>
        <p className="text-[11px] text-slate-300">
          Email: <strong className="text-white">delivery@martwithus.com</strong> | Pass: <strong className="text-white">Delivery@123</strong>
        </p>
        <button
          type="button"
          onClick={handleDemoPartner}
          className="w-full py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 rounded-xl font-black text-xs transition shadow-sm"
        >
          🚀 1-Click Login as Partner Rahul
        </button>
      </div>

      {/* Login Form */}
      <div className="bg-slate-800/80 p-6 sm:p-8 rounded-3xl border border-slate-700 shadow-xl space-y-4">
        {error && (
          <div className="p-3 rounded-xl bg-rose-500/20 border border-rose-500/40 text-rose-300 text-xs font-semibold flex items-center space-x-2">
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          <div>
            <label className="font-bold text-slate-300 block mb-1">Partner Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              placeholder="delivery@martwithus.com"
              className="w-full p-3 bg-slate-900 border border-slate-700 rounded-xl text-white focus:border-amber-500 focus:outline-none"
            />
          </div>

          <div>
            <label className="font-bold text-slate-300 block mb-1">Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              placeholder="••••••••"
              className="w-full p-3 bg-slate-900 border border-slate-700 rounded-xl text-white focus:border-amber-500 focus:outline-none"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs uppercase tracking-wider rounded-xl shadow-lg transition flex items-center justify-center space-x-2"
          >
            <LogIn className="w-4 h-4" />
            <span>{loading ? 'Authenticating...' : 'Sign In to Partner Portal'}</span>
          </button>
        </form>

        <div className="pt-2 text-center text-xs text-slate-400">
          Want to become a partner?{' '}
          <Link to="/delivery/register" className="font-bold text-amber-400 hover:underline">
            Register Here
          </Link>
        </div>
      </div>
    </div>
  );
}
