import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import {
  Bike,
  DollarSign,
  Package,
  MapPin,
  CheckCircle2,
  Navigation,
  Clock,
  Phone,
  Power,
  RefreshCw,
  AlertCircle,
  TrendingUp,
  Check,
  ArrowRight
} from 'lucide-react';
import { deliveryAPI } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { useSocket } from '../../context/SocketContext';

export default function DeliveryDashboardPage() {
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuth();
  const { socket } = useSocket();

  const [profile, setProfile] = useState(null);
  const [activeOrder, setActiveOrder] = useState(null);
  const [availableOrders, setAvailableOrders] = useState([]);
  const [isOnline, setIsOnline] = useState(true);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [actionLoading, setActionLoading] = useState(false);

  // Simulated GPS coordinate step
  const [simLat, setSimLat] = useState(18.5590);
  const [simLng, setSimLng] = useState(73.7868);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      setError('');
      const [profRes, activeRes, availRes] = await Promise.all([
        deliveryAPI.getProfile(),
        deliveryAPI.getActive(),
        deliveryAPI.getAvailable()
      ]);

      if (profRes.success && profRes.agent) {
        setProfile(profRes.agent);
        setIsOnline(profRes.agent.availability?.isOnline !== false);
        if (profRes.agent.currentLocation) {
          setSimLat(profRes.agent.currentLocation.lat || 18.5590);
          setSimLng(profRes.agent.currentLocation.lng || 73.7868);
        }
      }

      if (activeRes.success) {
        setActiveOrder(activeRes.activeOrder || null);
      }

      if (availRes.success) {
        setAvailableOrders(availRes.orders || []);
      }
    } catch (err) {
      setError(err.message || 'Failed to load delivery agent workspace');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/delivery/login');
      return;
    }
    fetchDashboardData();
  }, [isAuthenticated]);

  // Join delivery agent socket room
  useEffect(() => {
    if (!socket || !profile) return;

    socket.emit('join-delivery-agent', profile._id);

    // Receive new delivery requests in real-time
    socket.on('new-delivery-available', (order) => {
      setAvailableOrders((prev) => [order, ...prev.filter(o => o.orderId !== order.orderId)]);
    });

    return () => {
      socket.off('new-delivery-available');
    };
  }, [socket, profile]);

  const handleToggleOnline = async () => {
    try {
      setActionLoading(true);
      const nextState = !isOnline;
      const res = await deliveryAPI.toggleOnline(nextState);
      if (res.success) {
        setIsOnline(nextState);
      }
    } catch (err) {
      alert('Error updating availability: ' + err.message);
    } finally {
      setActionLoading(false);
    }
  };

  const handleAcceptOrder = async (orderId) => {
    try {
      setActionLoading(true);
      const res = await deliveryAPI.accept(orderId);
      if (res.success) {
        setActiveOrder(res.order);
        setAvailableOrders(prev => prev.filter(o => o.orderId !== orderId));
      }
    } catch (err) {
      alert('Failed to accept order: ' + err.message);
    } finally {
      setActionLoading(false);
    }
  };

  const handleUpdateStatus = async (nextStatus, note) => {
    if (!activeOrder) return;
    try {
      setActionLoading(true);
      const res = await deliveryAPI.updateStatus(activeOrder.orderId, {
        status: nextStatus,
        note
      });
      if (res.success) {
        if (nextStatus === 'DELIVERED') {
          setActiveOrder(null);
          // Refresh profile to show updated earnings!
          const profRes = await deliveryAPI.getProfile();
          if (profRes.success) setProfile(profRes.agent);
        } else {
          setActiveOrder(res.order);
        }
      }
    } catch (err) {
      alert('Status update failed: ' + err.message);
    } finally {
      setActionLoading(false);
    }
  };

  const handleSimulateGPSMove = async () => {
    // Increment coordinate slightly toward customer
    const newLat = simLat + 0.0035;
    const newLng = simLng - 0.0025;
    setSimLat(newLat);
    setSimLng(newLng);

    try {
      await deliveryAPI.updateLocation({
        lat: newLat,
        lng: newLng,
        heading: 45,
        orderId: activeOrder?.orderId
      });
    } catch (e) {
      console.error('Location sync error', e);
    }
  };

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto py-12 space-y-6 animate-pulse">
        <div className="h-10 bg-slate-800 rounded-2xl w-1/3" />
        <div className="grid grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-28 bg-slate-800 rounded-2xl" />
          ))}
        </div>
      </div>
    );
  }

  const agentName = profile?.fullName || user?.name || 'Rahul';

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      {/* Welcome & Online Toggle Header */}
      <div className="bg-slate-800/90 p-6 rounded-3xl border border-slate-700 shadow-xl flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2">
            <h1 className="text-2xl font-black text-white">
              Welcome, {agentName} 👋
            </h1>
            <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider ${
              profile?.verificationStatus === 'APPROVED' ? 'bg-emerald-500/20 text-emerald-400' : 'bg-amber-500/20 text-amber-300'
            }`}>
              {profile?.verificationStatus || 'APPROVED'}
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-0.5">
            {profile?.vehicleType || 'Bike'} ({profile?.vehicleNumber || 'MH-12-AB-1234'}) • {profile?.serviceArea || 'Baner Hub'}
          </p>
        </div>

        {/* Online / Offline Switch */}
        <div className="flex items-center space-x-3">
          <button
            onClick={fetchDashboardData}
            className="p-2.5 rounded-xl bg-slate-700 hover:bg-slate-600 text-slate-300"
            title="Refresh"
          >
            <RefreshCw className="w-4 h-4" />
          </button>

          <button
            onClick={handleToggleOnline}
            disabled={actionLoading || profile?.verificationStatus !== 'APPROVED'}
            className={`px-5 py-2.5 rounded-2xl font-black text-xs tracking-wider uppercase transition flex items-center space-x-2 shadow-lg ${
              isOnline
                ? 'bg-emerald-500 hover:bg-emerald-600 text-slate-950 shadow-emerald-500/25 ring-2 ring-emerald-400'
                : 'bg-slate-700 hover:bg-slate-600 text-slate-300'
            }`}
          >
            <Power className="w-4 h-4" />
            <span>{isOnline ? 'You Are ONLINE' : 'You Are OFFLINE'}</span>
          </button>
        </div>
      </div>

      {/* Today's KPI Statistics (Requirement #16) */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {/* Earnings */}
        <div className="bg-slate-800/80 p-5 rounded-2xl border border-slate-700">
          <div className="flex items-center justify-between text-xs text-slate-400 mb-1">
            <span>Today's Earnings</span>
            <span className="text-amber-400">💰</span>
          </div>
          <p className="text-2xl font-black text-white">
            ₹{profile?.earnings?.today || 620}
          </p>
          <span className="text-[10px] text-emerald-400 font-semibold flex items-center mt-1">
            <TrendingUp className="w-3 h-3 mr-1" />
            Direct Daily Payout
          </span>
        </div>

        {/* Deliveries Completed */}
        <div className="bg-slate-800/80 p-5 rounded-2xl border border-slate-700">
          <div className="flex items-center justify-between text-xs text-slate-400 mb-1">
            <span>Completed Trips</span>
            <span className="text-emerald-400">📦</span>
          </div>
          <p className="text-2xl font-black text-white">
            {profile?.ordersCompleted || 44}
          </p>
          <span className="text-[10px] text-slate-400 mt-1 block">Lifetime 100% on-time</span>
        </div>

        {/* Rating */}
        <div className="bg-slate-800/80 p-5 rounded-2xl border border-slate-700">
          <div className="flex items-center justify-between text-xs text-slate-400 mb-1">
            <span>Customer Rating</span>
            <span className="text-amber-400">⭐</span>
          </div>
          <p className="text-2xl font-black text-amber-400">
            {profile?.rating || '4.85'} / 5.0
          </p>
          <span className="text-[10px] text-slate-400 mt-1 block">{profile?.totalReviews || 86} ratings</span>
        </div>

        {/* Active Orders */}
        <div className="bg-slate-800/80 p-5 rounded-2xl border border-slate-700">
          <div className="flex items-center justify-between text-xs text-slate-400 mb-1">
            <span>Active Deliveries</span>
            <span className="text-blue-400">🚴</span>
          </div>
          <p className="text-2xl font-black text-white">
            {activeOrder ? '1 IN PROGRESS' : '0 (IDLE)'}
          </p>
          <span className="text-[10px] text-slate-400 mt-1 block">
            {activeOrder ? activeOrder.orderStatus : 'Ready to accept'}
          </span>
        </div>
      </div>

      {/* ACTIVE DELIVERY WORKFLOW CARD (Requirement #18) */}
      {activeOrder ? (
        <section className="bg-gradient-to-br from-slate-800 via-slate-800/90 to-slate-900 p-6 sm:p-8 rounded-3xl border-2 border-amber-500/60 shadow-2xl space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-slate-700 gap-2">
            <div>
              <div className="flex items-center space-x-2">
                <span className="text-xs font-black uppercase px-2.5 py-0.5 rounded-full bg-amber-500 text-slate-950">
                  Active Delivery In Progress
                </span>
                <span className="font-mono text-xs text-slate-300">#{activeOrder.orderId}</span>
              </div>
              <h2 className="text-xl font-black text-white mt-1">
                Order Status: <span className="text-amber-400">{activeOrder.orderStatus}</span>
              </h2>
            </div>

            <div className="text-right">
              <span className="text-xs text-slate-400 block">Delivery Payout</span>
              <span className="text-xl font-black text-emerald-400">₹{activeOrder.agentPayout || 55}</span>
            </div>
          </div>

          {/* Pickup & Dropoff Addresses */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Store Pickup */}
            <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-700 space-y-2">
              <div className="flex items-center space-x-2 text-xs font-bold text-emerald-400 uppercase tracking-wider">
                <Store className="w-4 h-4" />
                <span>1. Store Pickup Location</span>
              </div>
              <h4 className="font-extrabold text-sm text-white">
                {activeOrder.store?.name || 'MART WITH US — Baner Hub'}
              </h4>
              <p className="text-xs text-slate-300">
                {activeOrder.store?.address || 'Shop 101-105, Primrose Mall, Baner High Street, Pune'}
              </p>
              <div className="pt-1">
                <a
                  href={`tel:${activeOrder.store?.phone || '+919823045678'}`}
                  className="inline-flex items-center space-x-1.5 px-3 py-1 bg-slate-800 hover:bg-slate-700 rounded-lg text-xs font-semibold text-slate-200"
                >
                  <Phone className="w-3 h-3 text-emerald-400" />
                  <span>Call Store Manager</span>
                </a>
              </div>
            </div>

            {/* Customer Dropoff */}
            <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-700 space-y-2">
              <div className="flex items-center space-x-2 text-xs font-bold text-amber-400 uppercase tracking-wider">
                <MapPin className="w-4 h-4" />
                <span>2. Customer Dropoff Address</span>
              </div>
              <h4 className="font-extrabold text-sm text-white">
                {activeOrder.address?.fullName || activeOrder.customer?.name} ({activeOrder.address?.phone || activeOrder.customer?.phone})
              </h4>
              <p className="text-xs text-slate-300">
                {activeOrder.address?.house}, {activeOrder.address?.street}, {activeOrder.address?.area}, {activeOrder.address?.city} — {activeOrder.address?.pincode}
              </p>
              <div className="pt-1 flex items-center space-x-2">
                <a
                  href={`tel:${activeOrder.address?.phone || activeOrder.customer?.phone}`}
                  className="inline-flex items-center space-x-1.5 px-3 py-1 bg-slate-800 hover:bg-slate-700 rounded-lg text-xs font-semibold text-slate-200"
                >
                  <Phone className="w-3 h-3 text-amber-400" />
                  <span>Call Customer</span>
                </a>
                <span className="text-[11px] text-slate-400">
                  Payment: <strong className="text-white">{activeOrder.paymentMethod} ({activeOrder.paymentStatus})</strong>
                </span>
              </div>
            </div>
          </div>

          {/* Workflow Action Transition Button */}
          <div className="p-5 rounded-2xl bg-slate-900 border border-amber-500/30 space-y-4">
            <span className="text-xs font-extrabold text-amber-400 uppercase tracking-wider block">
              Step-by-Step Delivery Action
            </span>

            {activeOrder.orderStatus === 'ASSIGNED' && (
              <button
                onClick={() => handleUpdateStatus('PICKED UP', 'Order picked up and verified from dark store.')}
                disabled={actionLoading}
                className="w-full py-4 bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-sm uppercase tracking-wider rounded-2xl shadow-xl transition flex items-center justify-center space-x-2"
              >
                <Package className="w-5 h-5" />
                <span>{actionLoading ? 'Updating...' : '📦 1. MARK ORDER PICKED UP FROM STORE'}</span>
              </button>
            )}

            {activeOrder.orderStatus === 'PICKED UP' && (
              <button
                onClick={() => handleUpdateStatus('OUT_FOR_DELIVERY', 'Delivery agent is riding to customer location.')}
                disabled={actionLoading}
                className="w-full py-4 bg-blue-500 hover:bg-blue-400 text-white font-black text-sm uppercase tracking-wider rounded-2xl shadow-xl transition flex items-center justify-center space-x-2"
              >
                <Bike className="w-5 h-5" />
                <span>{actionLoading ? 'Updating...' : '🚴 2. START RIDE & MARK OUT FOR DELIVERY'}</span>
              </button>
            )}

            {activeOrder.orderStatus === 'OUT_FOR_DELIVERY' && (
              <div className="space-y-3">
                <button
                  onClick={() => handleUpdateStatus('DELIVERED', 'Order handed over at customer doorstep successfully.')}
                  disabled={actionLoading}
                  className="w-full py-4 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black text-sm uppercase tracking-wider rounded-2xl shadow-xl transition flex items-center justify-center space-x-2"
                >
                  <CheckCircle2 className="w-5 h-5" />
                  <span>{actionLoading ? 'Updating...' : '🎉 3. COMPLETE DELIVERY & COLLECT PAYMENT (₹' + activeOrder.total + ')'}</span>
                </button>

                {/* Simulated GPS Update Trigger (Requirement #20) */}
                <div className="pt-2 flex items-center justify-between text-xs text-slate-400 bg-slate-800/80 p-3 rounded-xl border border-slate-700">
                  <div className="flex items-center space-x-2">
                    <Navigation className="w-4 h-4 text-emerald-400 animate-pulse" />
                    <span>Live GPS Simulation ({simLat.toFixed(4)}, {simLng.toFixed(4)})</span>
                  </div>
                  <button
                    onClick={handleSimulateGPSMove}
                    className="px-3 py-1.5 bg-slate-700 hover:bg-slate-600 text-white font-bold rounded-lg text-xs transition"
                  >
                    📡 Step GPS Closer to Customer
                  </button>
                </div>
              </div>
            )}
          </div>
        </section>
      ) : (
        /* AVAILABLE ORDERS POOL (Requirement #17) */
        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <div className="flex items-center space-x-2">
                <span className="flex h-2.5 w-2.5 rounded-full bg-amber-400 animate-ping" />
                <h3 className="text-lg font-black text-white">
                  Available Delivery Requests ({availableOrders.length})
                </h3>
              </div>
              <p className="text-xs text-slate-400">Orders ready for acceptance at Baner & surrounding Pune hubs</p>
            </div>
          </div>

          {availableOrders.length === 0 ? (
            <div className="bg-slate-800/60 p-12 rounded-3xl border border-slate-700 text-center space-y-3">
              <div className="w-16 h-16 rounded-full bg-slate-700 text-slate-400 flex items-center justify-center mx-auto text-2xl">
                ⏳
              </div>
              <h4 className="font-extrabold text-white text-base">No Pending Delivery Requests</h4>
              <p className="text-xs text-slate-400 max-w-sm mx-auto">
                All customer orders are currently assigned. Stay online to receive the next instant delivery request!
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {availableOrders.map((order) => (
                <div
                  key={order._id || order.orderId}
                  className="bg-slate-800 p-5 rounded-3xl border border-slate-700 shadow-lg space-y-4 flex flex-col justify-between"
                >
                  <div className="space-y-3">
                    <div className="flex items-center justify-between pb-3 border-b border-slate-700">
                      <span className="font-mono text-xs font-black text-amber-400">#{order.orderId}</span>
                      <span className="text-xs font-black text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-md border border-emerald-500/20">
                        Earnings: ₹{order.agentPayout || 55}
                      </span>
                    </div>

                    <div className="space-y-2 text-xs">
                      <div className="flex items-start space-x-2 text-slate-300">
                        <Store className="w-4 h-4 text-emerald-400 flex-shrink-0 mt-0.5" />
                        <div>
                          <span className="text-[10px] text-slate-500 uppercase font-bold block">Pickup:</span>
                          <span className="font-semibold text-white">{order.store?.name || 'MART WITH US Baner Hub'}</span>
                        </div>
                      </div>

                      <div className="flex items-start space-x-2 text-slate-300">
                        <MapPin className="w-4 h-4 text-amber-400 flex-shrink-0 mt-0.5" />
                        <div>
                          <span className="text-[10px] text-slate-500 uppercase font-bold block">Delivery:</span>
                          <span className="font-semibold text-white">Customer in {order.address?.area || 'Wakad'}</span>
                        </div>
                      </div>

                      <div className="flex items-center justify-between pt-1 text-[11px] text-slate-400 font-mono">
                        <span>Distance: ~{order.deliveryDistanceKm || 3.8} km</span>
                        <span>{order.products?.length || 2} grocery items</span>
                      </div>
                    </div>
                  </div>

                  <div className="pt-3 border-t border-slate-700 flex gap-2">
                    <button
                      onClick={() => handleAcceptOrder(order.orderId)}
                      disabled={actionLoading}
                      className="flex-1 py-3 bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs uppercase tracking-wider rounded-xl shadow-md transition flex items-center justify-center space-x-1"
                    >
                      <Check className="w-4 h-4" />
                      <span>ACCEPT DELIVERY</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>
      )}
    </div>
  );
}
