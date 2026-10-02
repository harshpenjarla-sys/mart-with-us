import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Package, Clock, ArrowRight, RotateCcw, CheckCircle2, ChevronRight, ShoppingBag } from 'lucide-react';
import { ordersAPI } from '../../services/api';
import { useCart } from '../../context/CartContext';
import ImageWithFallback from '../../components/common/ImageWithFallback';

export default function OrdersHistoryPage() {
  const { addToCart } = useCart();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        setLoading(true);
        const res = await ordersAPI.getMyOrders();
        if (res.success) {
          setOrders(res.orders || []);
        }
      } catch (e) {
        console.error('Failed to fetch order history', e);
      } finally {
        setLoading(false);
      }
    };
    fetchOrders();
  }, []);

  const handleReorder = (order) => {
    (order.products || []).forEach(p => {
      addToCart({
        _id: p.productId,
        name: p.name,
        price: p.price,
        mrp: p.mrp || p.price,
        quantity: p.unit || '1 unit',
        images: [p.image]
      }, p.quantity || 1);
    });
    alert('Items added to your cart!');
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'DELIVERED':
        return <span className="bg-emerald-50 text-brand-700 border border-emerald-200 text-xs px-2.5 py-1 rounded-full font-bold">Delivered ✓</span>;
      case 'OUT_FOR_DELIVERY':
        return <span className="bg-amber-50 text-amber-700 border border-amber-200 text-xs px-2.5 py-1 rounded-full font-bold animate-pulse">Out for Delivery 🚴</span>;
      case 'ASSIGNED':
        return <span className="bg-blue-50 text-blue-700 border border-blue-200 text-xs px-2.5 py-1 rounded-full font-bold">Partner Assigned</span>;
      case 'PACKED':
        return <span className="bg-purple-50 text-purple-700 border border-purple-200 text-xs px-2.5 py-1 rounded-full font-bold">Packed at Store</span>;
      case 'CANCELLED':
        return <span className="bg-rose-50 text-rose-700 border border-rose-200 text-xs px-2.5 py-1 rounded-full font-bold">Cancelled</span>;
      case 'PREPARING':
      default:
        return <span className="bg-gray-100 text-gray-700 border border-gray-200 text-xs px-2.5 py-1 rounded-full font-bold">Preparing Items</span>;
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6 py-2">
      <div>
        <h1 className="text-2xl font-black text-gray-900 tracking-tight">My Orders</h1>
        <p className="text-xs text-gray-500">Track current deliveries or reorder your regular groceries</p>
      </div>

      {loading ? (
        <div className="space-y-4 animate-pulse">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="h-44 bg-gray-200 rounded-3xl" />
          ))}
        </div>
      ) : orders.length === 0 ? (
        <div className="bg-white p-12 rounded-3xl border border-gray-100 text-center space-y-4">
          <div className="w-16 h-16 rounded-full bg-brand-50 text-brand-600 flex items-center justify-center mx-auto text-2xl">
            📦
          </div>
          <h3 className="font-extrabold text-gray-900 text-lg">No Previous Orders</h3>
          <p className="text-xs text-gray-500 max-w-sm mx-auto">
            You haven't placed any orders with MART WITH US yet. Your placed orders and tracking will show up here.
          </p>
          <Link
            to="/products"
            className="inline-block px-5 py-2.5 bg-brand-600 text-white rounded-xl text-xs font-bold shadow-md"
          >
            Start Shopping
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {orders.map((o) => (
            <div
              key={o._id || o.orderId}
              className="bg-white p-5 sm:p-6 rounded-3xl border border-gray-100 shadow-soft space-y-4 hover:border-gray-200 transition"
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b border-gray-100 gap-2">
                <div>
                  <span className="font-mono text-xs font-black text-brand-700">#{o.orderId}</span>
                  <p className="text-[11px] text-gray-400">
                    Placed on {new Date(o.createdAt).toLocaleDateString('en-IN', { month: 'short', day: 'numeric', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
                  </p>
                </div>
                <div className="flex items-center space-x-3">
                  {getStatusBadge(o.orderStatus)}
                  <span className="font-black text-sm text-gray-900">₹{o.total}</span>
                </div>
              </div>

              {/* Items Preview */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs text-gray-600">
                {(o.products || []).slice(0, 3).map((item, i) => (
                  <div key={i} className="flex items-center space-x-2 truncate">
                    <span className="w-1.5 h-1.5 rounded-full bg-brand-500 flex-shrink-0" />
                    <span className="truncate">
                      <strong>{item.quantity}x</strong> {item.name}
                    </span>
                  </div>
                ))}
                {(o.products || []).length > 3 && (
                  <p className="text-[11px] text-gray-400 font-semibold italic">
                    +{o.products.length - 3} more items
                  </p>
                )}
              </div>

              {/* Actions */}
              <div className="pt-3 border-t border-gray-50 flex flex-wrap items-center justify-between gap-3">
                <span className="text-xs text-gray-500">
                  Delivered to: <strong className="text-gray-800">{o.address?.area}, {o.address?.city}</strong>
                </span>

                <div className="flex items-center space-x-3">
                  <button
                    onClick={() => handleReorder(o)}
                    className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-800 font-bold text-xs rounded-xl transition flex items-center space-x-1"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                    <span>REORDER</span>
                  </button>

                  <Link
                    to={`/orders/${o.orderId}`}
                    className="px-4 py-2 bg-brand-600 hover:bg-brand-700 text-white font-bold text-xs rounded-xl shadow-xs transition flex items-center space-x-1"
                  >
                    <span>VIEW ORDER</span>
                    <ChevronRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
