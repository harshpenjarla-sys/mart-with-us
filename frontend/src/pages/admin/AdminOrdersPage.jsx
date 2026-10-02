import React, { useState, useEffect } from 'react';
import {
  Package,
  Search,
  Filter,
  RefreshCw,
  Bike,
  RotateCcw,
  CheckCircle2,
  AlertCircle,
  Eye,
  X
} from 'lucide-react';
import { adminAPI } from '../../services/api';

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState([]);
  const [agents, setAgents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [search, setSearch] = useState('');

  // Selected Order Modal
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [selectedAgentId, setSelectedAgentId] = useState('');

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const [ordRes, agtRes] = await Promise.all([
        adminAPI.getOrders({ status: statusFilter, search }),
        adminAPI.getAgents()
      ]);
      if (ordRes.success) setOrders(ordRes.orders || []);
      if (agtRes.success) setAgents(agtRes.agents || []);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, [statusFilter]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    fetchOrders();
  };

  const handleUpdateStatus = async (orderId, newStatus) => {
    try {
      await adminAPI.updateOrderStatus(orderId, { status: newStatus });
      fetchOrders();
      if (selectedOrder) setSelectedOrder(null);
    } catch (e) {
      alert('Error updating status: ' + e.message);
    }
  };

  const handleAssignAgent = async (orderId) => {
    if (!selectedAgentId) return;
    try {
      await adminAPI.updateOrderStatus(orderId, { deliveryAgentId: selectedAgentId });
      alert('Partner assigned successfully');
      fetchOrders();
      if (selectedOrder) setSelectedOrder(null);
    } catch (e) {
      alert('Error assigning partner: ' + e.message);
    }
  };

  const handleRefund = async (orderId) => {
    if (window.confirm('Process refund for this order?')) {
      try {
        await adminAPI.refundOrder(orderId, { reason: 'Admin approved customer refund' });
        alert('Refund processed successfully');
        fetchOrders();
        if (selectedOrder) setSelectedOrder(null);
      } catch (e) {
        alert('Refund error: ' + e.message);
      }
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-3xl border border-slate-200/80 shadow-xs">
        <div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">Order Management</h1>
          <p className="text-xs text-slate-500">Live order fulfillment, manual partner assignments & refund processing</p>
        </div>

        <button
          onClick={fetchOrders}
          className="p-2.5 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-50 text-xs font-bold flex items-center space-x-1.5 self-start sm:self-auto"
        >
          <RefreshCw className="w-4 h-4" />
          <span>Refresh</span>
        </button>
      </div>

      {/* Filter & Search Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs flex flex-col sm:flex-row gap-3">
        <form onSubmit={handleSearchSubmit} className="relative flex-1">
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by Order ID (MWU-...) or customer name..."
            className="w-full pl-9 pr-4 py-2 bg-slate-50 border rounded-xl text-xs focus:bg-white"
          />
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
        </form>

        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="p-2 bg-slate-50 border rounded-xl text-xs font-semibold"
        >
          <option value="ALL">All Statuses</option>
          <option value="PREPARING">Preparing Items</option>
          <option value="PACKED">Packed</option>
          <option value="ASSIGNED">Assigned</option>
          <option value="OUT_FOR_DELIVERY">Out for Delivery</option>
          <option value="DELIVERED">Delivered</option>
          <option value="CANCELLED">Cancelled</option>
        </select>
      </div>

      {/* Orders Table */}
      <div className="bg-white rounded-3xl border border-slate-200/80 shadow-soft overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-500 font-bold uppercase tracking-wider border-b border-slate-100">
              <tr>
                <th className="p-4">Order ID & Date</th>
                <th className="p-4">Customer</th>
                <th className="p-4">Items / Total</th>
                <th className="p-4">Payment</th>
                <th className="p-4">Delivery Agent</th>
                <th className="p-4">Status</th>
                <th className="p-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-medium text-slate-800">
              {orders.map((o) => (
                <tr key={o._id || o.orderId} className="hover:bg-slate-50/60 transition">
                  <td className="p-4">
                    <span className="font-mono font-bold text-slate-900 block">#{o.orderId}</span>
                    <span className="text-[10px] text-slate-400">
                      {new Date(o.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </td>
                  <td className="p-4">
                    <p className="font-bold text-slate-900">{o.customer?.name}</p>
                    <span className="text-[10px] text-slate-400 font-mono">{o.customer?.phone}</span>
                  </td>
                  <td className="p-4">
                    <span className="font-bold text-slate-900 block">₹{o.total}</span>
                    <span className="text-[10px] text-slate-500">{o.products?.length || 1} items</span>
                  </td>
                  <td className="p-4">
                    <span className="font-semibold block">{o.paymentMethod}</span>
                    <span className={`text-[10px] font-bold ${o.paymentStatus === 'PAID' ? 'text-emerald-600' : 'text-amber-600'}`}>
                      {o.paymentStatus}
                    </span>
                  </td>
                  <td className="p-4">
                    {o.deliveryAgent?.name ? (
                      <div>
                        <span className="font-bold text-slate-900 block">{o.deliveryAgent.name}</span>
                        <span className="text-[10px] text-slate-400 font-mono">{o.deliveryAgent.vehicleNumber}</span>
                      </div>
                    ) : (
                      <span className="text-amber-600 font-bold text-[10px] bg-amber-50 px-2 py-0.5 rounded-full border border-amber-200">
                        Unassigned Pool
                      </span>
                    )}
                  </td>
                  <td className="p-4">
                    <span className={`px-2.5 py-1 rounded-full font-bold text-[10px] uppercase ${
                      o.orderStatus === 'DELIVERED'
                        ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                        : o.orderStatus === 'OUT_FOR_DELIVERY'
                        ? 'bg-amber-50 text-amber-700 border border-amber-200 animate-pulse'
                        : 'bg-slate-100 text-slate-700'
                    }`}>
                      {o.orderStatus}
                    </span>
                  </td>
                  <td className="p-4 text-right space-x-2">
                    <button
                      onClick={() => setSelectedOrder(o)}
                      className="px-3 py-1.5 bg-purple-50 text-purple-700 hover:bg-purple-100 rounded-xl font-bold text-xs"
                    >
                      Manage
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Manage Order Modal */}
      {selectedOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="bg-white rounded-3xl max-w-lg w-full max-h-[90vh] overflow-y-auto p-6 space-y-5 shadow-2xl">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div>
                <span className="text-xs text-slate-400 font-mono">#{selectedOrder.orderId}</span>
                <h3 className="font-black text-slate-900 text-base">Order Control & Agent Assignment</h3>
              </div>
              <button onClick={() => setSelectedOrder(null)} className="text-slate-400 hover:text-slate-700">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4 text-xs">
              {/* Quick Status Buttons */}
              <div>
                <label className="font-bold text-slate-700 block mb-1.5 uppercase tracking-wider text-[10px]">
                  Advance Order Status
                </label>
                <div className="flex flex-wrap gap-2">
                  {['PREPARING', 'PACKED', 'OUT_FOR_DELIVERY', 'DELIVERED', 'CANCELLED'].map((st) => (
                    <button
                      key={st}
                      onClick={() => handleUpdateStatus(selectedOrder.orderId, st)}
                      className={`px-3 py-1.5 rounded-xl font-bold text-[11px] transition ${
                        selectedOrder.orderStatus === st
                          ? 'bg-purple-600 text-white shadow-sm'
                          : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                      }`}
                    >
                      {st}
                    </button>
                  ))}
                </div>
              </div>

              {/* Manual Delivery Agent Assignment */}
              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-2">
                <label className="font-bold text-slate-700 block">
                  Assign Delivery Partner
                </label>
                <div className="flex gap-2">
                  <select
                    value={selectedAgentId}
                    onChange={(e) => setSelectedAgentId(e.target.value)}
                    className="flex-1 p-2 bg-white border rounded-xl text-xs font-semibold"
                  >
                    <option value="">Select fleet partner...</option>
                    {agents.map((a) => (
                      <option key={a._id} value={a._id}>
                        {a.fullName} ({a.vehicleType} - {a.vehicleNumber}) [{a.availability?.isOnline ? 'Online' : 'Offline'}]
                      </option>
                    ))}
                  </select>
                  <button
                    onClick={() => handleAssignAgent(selectedOrder.orderId)}
                    className="px-4 py-2 bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold rounded-xl shadow-xs"
                  >
                    Assign
                  </button>
                </div>
              </div>

              {/* Refund Action */}
              <div className="pt-2 border-t flex justify-between items-center">
                <span className="text-slate-500 font-semibold">Total: ₹{selectedOrder.total}</span>
                <button
                  onClick={() => handleRefund(selectedOrder.orderId)}
                  className="px-4 py-2 border border-rose-200 text-rose-600 hover:bg-rose-50 font-bold rounded-xl"
                >
                  Refund Order
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
