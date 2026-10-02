import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Users,
  Package,
  TrendingUp,
  Bike,
  AlertTriangle,
  Store,
  DollarSign,
  ArrowRight,
  RefreshCw,
  Plus
} from 'lucide-react';
import { adminAPI, productsAPI } from '../../services/api';

export default function AdminDashboardPage() {
  const [stats, setStats] = useState(null);
  const [lowStockProducts, setLowStockProducts] = useState([]);
  const [recentOrders, setRecentOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchStats = async () => {
    try {
      setLoading(true);
      const res = await adminAPI.getStats();
      if (res.success) {
        setStats(res.stats);
        setLowStockProducts(res.lowStockProducts || []);
        setRecentOrders(res.recentOrders || []);
      }
    } catch (e) {
      console.error('Failed to load admin stats', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, []);

  const handleRestock = async (product) => {
    const qty = prompt(`Add stock for ${product.name} (Current: ${product.stock}):`, '50');
    if (qty && !isNaN(qty)) {
      try {
        await productsAPI.update(product._id, { stock: (product.stock || 0) + Number(qty) });
        fetchStats();
      } catch (err) {
        alert(err.message);
      }
    }
  };

  if (loading) {
    return (
      <div className="space-y-6 animate-pulse">
        <div className="h-8 bg-slate-200 rounded w-1/4" />
        <div className="grid grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-28 bg-slate-200 rounded-3xl" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-6 rounded-3xl border border-slate-200/80 shadow-xs">
        <div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">Admin Operations Center</h1>
          <p className="text-xs text-slate-500">Live platform metrics, Pune dark store fulfillment and partner fleet</p>
        </div>

        <button
          onClick={fetchStats}
          className="p-2.5 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-50 text-xs font-bold flex items-center space-x-1.5 self-start sm:self-auto"
        >
          <RefreshCw className="w-4 h-4" />
          <span>Refresh Data</span>
        </button>
      </div>

      {/* KPI Cards Grid (Requirement #21) */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6">
        {/* Total Customers */}
        <div className="bg-white p-5 rounded-3xl border border-slate-200/80 shadow-soft">
          <div className="flex items-center justify-between text-xs text-slate-400 mb-1">
            <span className="font-bold uppercase tracking-wider text-[10px]">Total Customers</span>
            <div className="p-2 rounded-xl bg-blue-50 text-blue-600">
              <Users className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl font-black text-slate-900">{stats?.totalCustomers || 1}</p>
          <span className="text-[10px] text-slate-500 font-medium">Registered Pune Households</span>
        </div>

        {/* Total Orders */}
        <div className="bg-white p-5 rounded-3xl border border-slate-200/80 shadow-soft">
          <div className="flex items-center justify-between text-xs text-slate-400 mb-1">
            <span className="font-bold uppercase tracking-wider text-[10px]">Total Orders</span>
            <div className="p-2 rounded-xl bg-purple-50 text-purple-600">
              <Package className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl font-black text-slate-900">{stats?.totalOrders || 0}</p>
          <span className="text-[10px] text-purple-700 font-bold">Today: {stats?.todayOrders || 0} orders</span>
        </div>

        {/* Total Revenue */}
        <div className="bg-white p-5 rounded-3xl border border-slate-200/80 shadow-soft">
          <div className="flex items-center justify-between text-xs text-slate-400 mb-1">
            <span className="font-bold uppercase tracking-wider text-[10px]">Gross Revenue</span>
            <div className="p-2 rounded-xl bg-emerald-50 text-emerald-600">
              <DollarSign className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl font-black text-slate-900">₹{stats?.totalRevenue?.toLocaleString('en-IN') || 0}</p>
          <span className="text-[10px] text-emerald-700 font-bold">Today: ₹{stats?.todayRevenue || 0}</span>
        </div>

        {/* Active Delivery Partners */}
        <div className="bg-white p-5 rounded-3xl border border-slate-200/80 shadow-soft">
          <div className="flex items-center justify-between text-xs text-slate-400 mb-1">
            <span className="font-bold uppercase tracking-wider text-[10px]">Active Fleet Agents</span>
            <div className="p-2 rounded-xl bg-amber-50 text-amber-600">
              <Bike className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl font-black text-slate-900">{stats?.activeDeliveryAgents || 0}</p>
          <span className="text-[10px] text-amber-700 font-bold">
            {stats?.pendingAgentApprovals || 0} applications pending
          </span>
        </div>
      </div>

      {/* Two Column Layout: Low Stock Alert & Recent Orders */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left: Low Stock Alert Table */}
        <div className="lg:col-span-6 bg-white p-6 rounded-3xl border border-slate-200/80 shadow-soft space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div className="flex items-center space-x-2">
              <AlertTriangle className="w-4 h-4 text-rose-500" />
              <h3 className="font-extrabold text-sm text-slate-900">Low Stock Inventory Alerts</h3>
            </div>
            <Link to="/admin/products" className="text-xs text-purple-700 font-bold hover:underline">
              Manage Inventory
            </Link>
          </div>

          {lowStockProducts.length === 0 ? (
            <p className="text-xs text-slate-400 py-6 text-center">All product stocks are currently healthy (15+ units).</p>
          ) : (
            <div className="divide-y divide-slate-100 text-xs">
              {lowStockProducts.map((p) => (
                <div key={p._id} className="py-3 flex items-center justify-between">
                  <div className="truncate max-w-[200px]">
                    <p className="font-bold text-slate-900 truncate">{p.name}</p>
                    <span className="text-[11px] text-slate-400">{p.brand} • {p.category}</span>
                  </div>

                  <div className="flex items-center space-x-3">
                    <span className="px-2 py-0.5 rounded-full bg-rose-50 text-rose-700 font-bold text-[11px] border border-rose-200">
                      {p.stock} left
                    </span>
                    <button
                      onClick={() => handleRestock(p)}
                      className="p-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold"
                      title="Quick Restock"
                    >
                      <Plus className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Right: Recent Orders Feed */}
        <div className="lg:col-span-6 bg-white p-6 rounded-3xl border border-slate-200/80 shadow-soft space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <h3 className="font-extrabold text-sm text-slate-900">Recent Grocery Orders</h3>
            <Link to="/admin/orders" className="text-xs text-purple-700 font-bold hover:underline">
              View All Orders
            </Link>
          </div>

          <div className="divide-y divide-slate-100 text-xs">
            {recentOrders.map((o) => (
              <div key={o._id || o.orderId} className="py-3 flex items-center justify-between">
                <div>
                  <Link to={`/admin/orders`} className="font-mono font-bold text-slate-900 hover:text-purple-700">
                    #{o.orderId}
                  </Link>
                  <p className="text-[11px] text-slate-400">{o.customer?.name} • {o.address?.area}</p>
                </div>

                <div className="text-right">
                  <span className="font-black text-slate-900 block">₹{o.total}</span>
                  <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded uppercase ${
                    o.orderStatus === 'DELIVERED' ? 'bg-emerald-50 text-emerald-700' : 'bg-amber-50 text-amber-700'
                  }`}>
                    {o.orderStatus}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
