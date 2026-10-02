import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Bike, ShieldCheck, AlertCircle, CheckCircle2, ArrowRight } from 'lucide-react';
import { deliveryAPI } from '../../services/api';

export default function DeliveryRegisterPage() {
  const navigate = useNavigate();

  const [form, setForm] = useState({
    fullName: '',
    email: '',
    phone: '',
    password: '',
    vehicleType: 'Bike',
    vehicleNumber: '',
    drivingLicense: '',
    governmentId: '',
    serviceArea: 'Baner & Surrounding',
    profilePhoto: ''
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      setError('');
      const res = await deliveryAPI.register(form);
      if (res.success) {
        setSuccessMsg(res.message);
      }
    } catch (err) {
      setError(err.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  if (successMsg) {
    return (
      <div className="max-w-md mx-auto py-12 text-center space-y-4 bg-slate-800 p-8 rounded-3xl border border-slate-700">
        <div className="w-16 h-16 bg-amber-500/20 text-amber-400 rounded-full flex items-center justify-center mx-auto text-3xl">
          ⏳
        </div>
        <h2 className="text-xl font-black text-white">Application Submitted!</h2>
        <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/30 text-xs text-amber-300">
          Status: <strong>PENDING VERIFICATION</strong>
        </div>
        <p className="text-xs text-slate-300 leading-relaxed">
          {successMsg} <br />
          Our fleet manager is verifying your vehicle ({form.vehicleType} - {form.vehicleNumber}) and driving license. You will receive access once approved by Admin.
        </p>
        <Link
          to="/delivery/login"
          className="inline-block px-6 py-2.5 bg-amber-500 text-slate-950 font-bold text-xs uppercase tracking-wider rounded-xl shadow-md"
        >
          Go to Partner Login
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-xl mx-auto py-6 space-y-6">
      <div className="text-center space-y-1">
        <div className="w-12 h-12 rounded-2xl bg-amber-500 text-slate-950 flex items-center justify-center text-2xl mx-auto font-bold">
          🚴
        </div>
        <h1 className="text-2xl font-black text-white">Become a Delivery Partner</h1>
        <p className="text-xs text-slate-400">Join Pune's premier grocery delivery fleet and earn daily</p>
      </div>

      <div className="bg-slate-800/80 p-6 sm:p-8 rounded-3xl border border-slate-700 shadow-xl space-y-4">
        {error && (
          <div className="p-3 rounded-xl bg-rose-500/20 border border-rose-500/40 text-rose-300 text-xs font-semibold flex items-center space-x-2">
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="font-bold text-slate-300 block mb-1">Full Legal Name *</label>
              <input
                type="text"
                required
                value={form.fullName}
                onChange={(e) => setForm({ ...form, fullName: e.target.value })}
                placeholder="e.g. Rahul Sharma"
                className="w-full p-2.5 bg-slate-900 border border-slate-700 rounded-xl text-white focus:border-amber-500"
              />
            </div>

            <div>
              <label className="font-bold text-slate-300 block mb-1">Mobile Phone (WhatsApp) *</label>
              <input
                type="tel"
                required
                value={form.phone}
                onChange={(e) => setForm({ ...form, phone: e.target.value })}
                placeholder="10-digit mobile"
                className="w-full p-2.5 bg-slate-900 border border-slate-700 rounded-xl text-white focus:border-amber-500"
              />
            </div>

            <div>
              <label className="font-bold text-slate-300 block mb-1">Email Address *</label>
              <input
                type="email"
                required
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                placeholder="partner@example.com"
                className="w-full p-2.5 bg-slate-900 border border-slate-700 rounded-xl text-white focus:border-amber-500"
              />
            </div>

            <div>
              <label className="font-bold text-slate-300 block mb-1">Password *</label>
              <input
                type="password"
                required
                value={form.password}
                onChange={(e) => setForm({ ...form, password: e.target.value })}
                placeholder="••••••••"
                className="w-full p-2.5 bg-slate-900 border border-slate-700 rounded-xl text-white focus:border-amber-500"
              />
            </div>

            <div>
              <label className="font-bold text-slate-300 block mb-1">Vehicle Type *</label>
              <select
                value={form.vehicleType}
                onChange={(e) => setForm({ ...form, vehicleType: e.target.value })}
                className="w-full p-2.5 bg-slate-900 border border-slate-700 rounded-xl text-white font-bold"
              >
                <option value="Bike">Motorcycle / Bike (Fastest)</option>
                <option value="Scooter">Scooter (Activa, Jupiter)</option>
                <option value="Bicycle">Bicycle (Eco Friendly)</option>
                <option value="Car">Car / Van (Bulk Deliveries)</option>
              </select>
            </div>

            <div>
              <label className="font-bold text-slate-300 block mb-1">Vehicle Number Plate *</label>
              <input
                type="text"
                required
                value={form.vehicleNumber}
                onChange={(e) => setForm({ ...form, vehicleNumber: e.target.value })}
                placeholder="e.g. MH-12-AB-1234"
                className="w-full p-2.5 bg-slate-900 border border-slate-700 rounded-xl text-white uppercase font-mono focus:border-amber-500"
              />
            </div>

            <div>
              <label className="font-bold text-slate-300 block mb-1">Driving License Number *</label>
              <input
                type="text"
                required
                value={form.drivingLicense}
                onChange={(e) => setForm({ ...form, drivingLicense: e.target.value })}
                placeholder="DL-MH12-202200..."
                className="w-full p-2.5 bg-slate-900 border border-slate-700 rounded-xl text-white uppercase font-mono focus:border-amber-500"
              />
            </div>

            <div>
              <label className="font-bold text-slate-300 block mb-1">Government ID (Aadhaar / PAN) *</label>
              <input
                type="text"
                required
                value={form.governmentId}
                onChange={(e) => setForm({ ...form, governmentId: e.target.value })}
                placeholder="AADHAAR-XXXX-XXXX-XXXX"
                className="w-full p-2.5 bg-slate-900 border border-slate-700 rounded-xl text-white uppercase font-mono focus:border-amber-500"
              />
            </div>

            <div className="sm:col-span-2">
              <label className="font-bold text-slate-300 block mb-1">Preferred Service Hub / Area *</label>
              <select
                value={form.serviceArea}
                onChange={(e) => setForm({ ...form, serviceArea: e.target.value })}
                className="w-full p-2.5 bg-slate-900 border border-slate-700 rounded-xl text-white font-bold"
              >
                <option value="Baner & Surrounding">Baner, Aundh, Balewadi</option>
                <option value="Wakad & Hinjawadi">Wakad, Hinjawadi Phase 1</option>
                <option value="Kothrud & Karve Nagar">Kothrud, Karve Nagar, Paud Road</option>
                <option value="Pune Citywide Fleet">All Pune Hubs</option>
              </select>
            </div>
          </div>

          <div className="pt-2">
            <button
              type="submit"
              disabled={loading}
              className="w-full py-3.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs uppercase tracking-wider rounded-xl shadow-lg transition flex items-center justify-center space-x-2"
            >
              <span>{loading ? 'Submitting Application...' : 'SUBMIT PARTNER APPLICATION'}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </form>

        <div className="pt-2 text-center text-xs text-slate-400">
          Already registered?{' '}
          <Link to="/delivery/login" className="font-bold text-amber-400 hover:underline">
            Partner Sign In
          </Link>
        </div>
      </div>
    </div>
  );
}
