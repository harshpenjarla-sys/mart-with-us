import React from 'react';
import { Outlet, Link, useNavigate } from 'react-router-dom';
import { Bike, DollarSign, LogOut, ShieldCheck, User } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function DeliveryLayout() {
  const navigate = useNavigate();
  const { user, agentDetails, logout } = useAuth();

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 flex flex-col font-sans">
      {/* Partner Portal Header */}
      <header className="bg-slate-950 border-b border-slate-800 sticky top-0 z-40 px-4 sm:px-6 py-3 shadow-md">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <Link to="/delivery/dashboard" className="flex items-center space-x-2.5">
            <div className="w-10 h-10 rounded-2xl bg-amber-500 text-slate-950 flex items-center justify-center text-xl font-bold shadow-md shadow-amber-500/20">
              🚴
            </div>
            <div>
              <div className="flex items-center space-x-1.5">
                <span className="font-black text-lg text-white tracking-tight">MART WITH US</span>
                <span className="text-[10px] font-extrabold uppercase px-1.5 py-0.5 rounded bg-amber-500 text-slate-950">
                  PARTNER
                </span>
                <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded-full bg-gradient-to-r from-amber-400 to-rose-400 text-slate-950 shadow-xs">
                  ✨ SWARALI
                </span>
              </div>
              <p className="text-[11px] text-slate-400">Delivery Agent Operating System</p>
            </div>
          </Link>

          <div className="flex items-center space-x-3">
            <Link
              to="/"
              className="text-xs text-slate-400 hover:text-white font-medium hidden sm:inline"
            >
              ← Customer Website
            </Link>

            {user && (
              <button
                onClick={() => {
                  logout();
                  navigate('/delivery/login');
                }}
                className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-rose-400 transition"
                title="Log Out"
              >
                <LogOut className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 max-w-6xl w-full mx-auto px-4 sm:px-6 py-6">
        <Outlet />
      </main>

      {/* Footer */}
      <footer className="bg-slate-950 border-t border-slate-800/80 py-4 px-6 text-center text-xs text-slate-500">
        MART WITH US Partner Fleet Network • Pune Hub Operations • 24/7 Helpline: +91 98230 45678
      </footer>
    </div>
  );
}
