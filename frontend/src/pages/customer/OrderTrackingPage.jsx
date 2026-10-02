import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import {
  CheckCircle2,
  Clock,
  Phone,
  MessageSquare,
  Bike,
  Store,
  MapPin,
  Star,
  ShieldCheck,
  AlertCircle,
  RefreshCw,
  Send
} from 'lucide-react';
import { ordersAPI } from '../../services/api';
import { useSocket } from '../../context/SocketContext';
import ImageWithFallback from '../../components/common/ImageWithFallback';

const stages = [
  { key: 'PREPARING', label: 'Order Confirmed', icon: '📝', desc: 'Store is receiving & preparing items' },
  { key: 'PACKED', label: 'Order Packed', icon: '📦', desc: 'Packed fresh at local dark store' },
  { key: 'ASSIGNED', label: 'Partner Assigned', icon: '🚴', desc: 'Delivery partner assigned & on the way to store' },
  { key: 'OUT_FOR_DELIVERY', label: 'Out for Delivery', icon: '⚡', desc: 'Partner has package and is en route to you' },
  { key: 'DELIVERED', label: 'Delivered', icon: '🎉', desc: 'Handed over at doorstep. Enjoy!' }
];

export default function OrderTrackingPage() {
  const { id } = useParams();
  const { socket } = useSocket();

  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [agentLocation, setAgentLocation] = useState(null);
  const [lastLocationTime, setLastLocationTime] = useState('Updating...');

  // Rating modal state
  const [showRateModal, setShowRateModal] = useState(false);
  const [ratingStars, setRatingStars] = useState(5);
  const [ratingFeedback, setRatingFeedback] = useState('');
  const [isSubmittingRating, setIsSubmittingRating] = useState(false);

  // Simulated Chat Modal
  const [showChatModal, setShowChatModal] = useState(false);
  const [chatMessages, setChatMessages] = useState([
    { sender: 'agent', text: 'Hello! I have picked up your groceries and will arrive shortly at your building.', time: 'Just now' }
  ]);
  const [newChatMsg, setNewChatMsg] = useState('');

  const fetchOrder = async () => {
    try {
      setLoading(true);
      setError('');
      const res = await ordersAPI.getById(id);
      if (res.success && res.order) {
        setOrder(res.order);
        if (res.order.liveLocation) {
          setAgentLocation(res.order.liveLocation);
          setLastLocationTime(new Date(res.order.liveLocation.lastUpdated || Date.now()).toLocaleTimeString());
        }
      }
    } catch (err) {
      setError(err.message || 'Failed to fetch order details');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrder();
  }, [id]);

  // Connect socket room for live updates
  useEffect(() => {
    if (!socket || !order) return;

    socket.emit('join-order', order.orderId);

    // Listen for status changes
    socket.on('order-status-update', (data) => {
      if (data.order) {
        setOrder(data.order);
      }
    });

    // Listen for live location coordinates from agent
    socket.on('location-updated', (loc) => {
      setAgentLocation(loc);
      setLastLocationTime(new Date(loc.lastUpdated).toLocaleTimeString());
    });

    return () => {
      socket.off('order-status-update');
      socket.off('location-updated');
    };
  }, [socket, order?.orderId]);

  const handleSendChat = (e) => {
    e.preventDefault();
    if (!newChatMsg.trim()) return;
    const msg = { sender: 'customer', text: newChatMsg.trim(), time: 'Just now' };
    setChatMessages(prev => [...prev, msg]);
    setNewChatMsg('');

    // Simulate agent auto-reply
    setTimeout(() => {
      setChatMessages(prev => [
        ...prev,
        { sender: 'agent', text: 'Thank you! Got your message. On my way.', time: 'Just now' }
      ]);
    }, 1500);
  };

  const handleRateSubmit = async (e) => {
    e.preventDefault();
    try {
      setIsSubmittingRating(true);
      const res = await ordersAPI.rate(order.orderId, {
        stars: ratingStars,
        feedback: ratingFeedback
      });
      if (res.success) {
        setOrder(res.order);
        setShowRateModal(false);
      }
    } catch (e) {
      alert('Failed to submit rating: ' + e.message);
    } finally {
      setIsSubmittingRating(false);
    }
  };

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto py-12 space-y-6 animate-pulse">
        <div className="h-8 bg-gray-200 rounded w-1/3" />
        <div className="h-64 bg-gray-200 rounded-3xl" />
        <div className="h-40 bg-gray-200 rounded-3xl" />
      </div>
    );
  }

  if (error || !order) {
    return (
      <div className="max-w-md mx-auto py-16 text-center space-y-4">
        <div className="text-4xl">📦</div>
        <h3 className="text-xl font-bold text-gray-900">Order Not Found</h3>
        <p className="text-xs text-gray-500">{error || 'Could not retrieve tracking details for this order ID.'}</p>
        <Link to="/orders" className="inline-block px-5 py-2.5 bg-brand-600 text-white rounded-xl text-xs font-bold">
          View My Orders
        </Link>
      </div>
    );
  }

  // Determine stage index
  const stageOrder = ['PREPARING', 'PACKED', 'ASSIGNED', 'OUT_FOR_DELIVERY', 'DELIVERED'];
  const currentStageIndex = stageOrder.indexOf(order.orderStatus);

  return (
    <div className="max-w-4xl mx-auto space-y-8 py-2">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-5 rounded-3xl border border-gray-100 shadow-xs">
        <div>
          <div className="flex items-center space-x-2">
            <span className="text-xs font-extrabold text-brand-700 bg-brand-50 px-2 py-0.5 rounded-md uppercase">
              Live Order Tracking
            </span>
            <span className="text-xs text-gray-400 font-mono">#{order.orderId}</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-black text-gray-900 mt-1">
            {order.orderStatus === 'DELIVERED' ? 'Order Delivered 🎉' : 'Your Groceries Are Arriving'}
          </h1>
          <p className="text-xs text-gray-500">
            Placed on {new Date(order.createdAt).toLocaleDateString('en-IN', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
          </p>
        </div>

        <div className="flex items-center space-x-2">
          <button
            onClick={fetchOrder}
            className="p-2 rounded-xl border border-gray-200 text-gray-600 hover:bg-gray-50 text-xs font-bold flex items-center space-x-1"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Refresh</span>
          </button>
        </div>
      </div>

      {/* Visual Live Route Map Representation */}
      <div className="relative rounded-3xl overflow-hidden bg-slate-900 text-white border border-gray-800 shadow-xl p-6 sm:p-8">
        {/* Map Grid Pattern background */}
        <div className="absolute inset-0 opacity-15 pointer-events-none bg-[radial-gradient(#10b981_1px,transparent_1px)] [background-size:16px_16px]" />

        <div className="relative z-10 space-y-6">
          <div className="flex items-center justify-between text-xs">
            <div className="flex items-center space-x-2">
              <span className="flex h-2.5 w-2.5 rounded-full bg-emerald-400 animate-ping" />
              <span className="font-extrabold text-emerald-400 uppercase tracking-wider">
                Live GPS Sync Active
              </span>
            </div>
            <span className="text-gray-400 text-[11px]">
              Last updated: {lastLocationTime}
            </span>
          </div>

          {/* Interactive Route SVG Representation */}
          <div className="py-4">
            <div className="relative flex items-center justify-between max-w-xl mx-auto px-4">
              {/* Line */}
              <div className="absolute left-10 right-10 top-1/2 -translate-y-1/2 h-1 bg-gray-700">
                <div
                  className="h-1 bg-brand-500 transition-all duration-700"
                  style={{
                    width: currentStageIndex <= 1 ? '10%' : currentStageIndex === 2 ? '40%' : currentStageIndex === 3 ? '75%' : '100%'
                  }}
                />
              </div>

              {/* Node 1: Store */}
              <div className="relative z-10 flex flex-col items-center">
                <div className="w-12 h-12 rounded-2xl bg-gray-800 border-2 border-brand-500 text-brand-400 flex items-center justify-center text-xl shadow-lg">
                  🏪
                </div>
                <span className="text-[11px] font-bold mt-2 text-gray-200">Dark Store</span>
                <span className="text-[9px] text-gray-400">{order.store?.area || 'Baner'}</span>
              </div>

              {/* Node 2: Delivery Agent (moving indicator) */}
              <div className="relative z-10 flex flex-col items-center">
                <div className={`w-14 h-14 rounded-2xl flex items-center justify-center text-2xl shadow-xl transition-all duration-500 ${
                  currentStageIndex >= 3 ? 'bg-brand-600 border-2 border-white ring-4 ring-brand-500/30' : 'bg-gray-800 border border-gray-600 text-gray-400'
                }`}>
                  🚴
                </div>
                <span className="text-[11px] font-extrabold mt-2 text-amber-300">
                  {order.deliveryAgent?.name ? order.deliveryAgent.name.split(' ')[0] : 'Partner'}
                </span>
                <span className="text-[9px] text-gray-400">
                  {order.orderStatus === 'OUT_FOR_DELIVERY' ? 'En Route (4 mins away)' : order.orderStatus}
                </span>
              </div>

              {/* Node 3: Customer Home */}
              <div className="relative z-10 flex flex-col items-center">
                <div className={`w-12 h-12 rounded-2xl flex items-center justify-center text-xl shadow-lg ${
                  order.orderStatus === 'DELIVERED' ? 'bg-emerald-600 text-white border-2 border-white' : 'bg-gray-800 border border-gray-700 text-gray-300'
                }`}>
                  🏠
                </div>
                <span className="text-[11px] font-bold mt-2 text-gray-200">Your Address</span>
                <span className="text-[9px] text-gray-400 truncate max-w-[80px]">{order.address?.area}</span>
              </div>
            </div>
          </div>

          {/* Delivery Coordinates Banner */}
          <div className="bg-white/10 backdrop-blur-md rounded-2xl p-4 flex flex-col sm:flex-row items-center justify-between text-xs gap-3">
            <div className="flex items-center space-x-3">
              <div className="p-2 rounded-xl bg-brand-500/20 text-brand-300">
                <MapPin className="w-4 h-4" />
              </div>
              <div>
                <p className="font-bold text-white">Estimated Distance: {order.deliveryDistanceKm || 3.4} km</p>
                <p className="text-[11px] text-gray-300 font-mono">
                  Partner Coords: {agentLocation?.lat ? `${agentLocation.lat.toFixed(4)}, ${agentLocation.lng.toFixed(4)}` : '18.5590° N, 73.7868° E'}
                </p>
              </div>
            </div>

            <div className="text-right">
              <span className="font-mono text-emerald-400 font-extrabold text-sm block">
                {order.orderStatus === 'DELIVERED' ? 'Completed' : 'ETA: 12-18 mins'}
              </span>
              <span className="text-[10px] text-gray-400">Pune Express Corridor</span>
            </div>
          </div>
        </div>
      </div>

      {/* Delivery Partner Details Card */}
      {order.deliveryAgent && order.deliveryAgent.name && (
        <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-soft flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center space-x-4">
            <div className="relative">
              <img
                src={order.deliveryAgent.profilePhoto || 'https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?auto=format&fit=crop&w=400&q=80'}
                alt={order.deliveryAgent.name}
                className="w-14 h-14 rounded-2xl object-cover border-2 border-brand-500 shadow-sm"
              />
              <span className="absolute -bottom-1 -right-1 bg-brand-600 text-white rounded-full p-0.5 text-[10px]">
                ✓
              </span>
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Your Delivery Partner</span>
                <div className="flex items-center bg-amber-50 px-1.5 py-0.5 rounded text-[10px] font-bold text-amber-900">
                  <Star className="w-3 h-3 fill-current text-amber-500 mr-0.5" />
                  <span>{order.deliveryAgent.rating || '4.8'}</span>
                </div>
              </div>
              <h3 className="font-extrabold text-base text-gray-900">{order.deliveryAgent.name}</h3>
              <p className="text-xs text-gray-600 font-mono mt-0.5">
                {order.deliveryAgent.vehicleType === 'Bike' ? '🏍️' : '🛵'} {order.deliveryAgent.vehicleNumber}
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-3 w-full sm:w-auto">
            <a
              href={`tel:${order.deliveryAgent.phone || '+919123456789'}`}
              className="flex-1 sm:flex-initial px-4 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-800 rounded-xl font-bold text-xs flex items-center justify-center space-x-1.5 transition"
            >
              <Phone className="w-4 h-4 text-brand-700" />
              <span>CALL</span>
            </a>

            <button
              onClick={() => setShowChatModal(true)}
              className="flex-1 sm:flex-initial px-4 py-2.5 bg-brand-600 hover:bg-brand-700 text-white rounded-xl font-bold text-xs flex items-center justify-center space-x-1.5 shadow-md transition"
            >
              <MessageSquare className="w-4 h-4" />
              <span>CHAT</span>
            </button>
          </div>
        </div>
      )}

      {/* Timeline Steps Accordion */}
      <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-soft space-y-6">
        <h3 className="font-extrabold text-base text-gray-900 pb-2 border-b border-gray-100">
          Order Status History
        </h3>

        <div className="relative pl-6 space-y-6 before:absolute before:left-2.5 before:top-2 before:bottom-2 before:w-0.5 before:bg-gray-200">
          {(order.timeline || []).map((step, idx) => (
            <div key={idx} className="relative">
              <div className="absolute -left-6 top-1 w-5 h-5 rounded-full bg-brand-600 text-white flex items-center justify-center text-[10px] font-bold shadow-xs">
                ✓
              </div>
              <div>
                <div className="flex items-baseline space-x-2">
                  <h4 className="font-extrabold text-xs sm:text-sm text-gray-900">{step.title || step.status}</h4>
                  <span className="text-[10px] text-gray-400">
                    {new Date(step.time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>
                {step.note && <p className="text-xs text-gray-500 mt-0.5">{step.note}</p>}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Rate Order Button if Delivered */}
      {order.orderStatus === 'DELIVERED' && (
        <div className="bg-gradient-to-r from-amber-50 to-emerald-50 p-6 rounded-3xl border border-amber-200/80 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div>
            <h4 className="font-black text-gray-900 text-base">How was your delivery?</h4>
            <p className="text-xs text-gray-600">
              {order.rating?.stars ? `You rated this order ${order.rating.stars}★: "${order.rating.feedback || 'Great!'}"` : 'Help us maintain 5-star kirana delivery standards by rating your items and delivery partner.'}
            </p>
          </div>
          <button
            onClick={() => setShowRateModal(true)}
            className="px-6 py-3 bg-amber-500 hover:bg-amber-600 text-white font-extrabold text-xs uppercase tracking-wider rounded-xl shadow-md transition flex items-center space-x-1.5"
          >
            <Star className="w-4 h-4 fill-current" />
            <span>{order.rating?.stars ? 'Update Rating' : 'Rate Order'}</span>
          </button>
        </div>
      )}

      {/* Items Summary in this Order */}
      <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-soft space-y-4">
        <h3 className="font-extrabold text-sm text-gray-900 pb-2 border-b border-gray-100">
          Items in this delivery ({order.products?.length || 0})
        </h3>
        <div className="divide-y divide-gray-50">
          {(order.products || []).map((item, i) => (
            <div key={i} className="py-2.5 flex items-center justify-between text-xs">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 rounded-lg overflow-hidden bg-gray-50 border flex-shrink-0">
                  <ImageWithFallback src={item.image} alt={item.name} className="w-full h-full object-cover" />
                </div>
                <div>
                  <p className="font-bold text-gray-900">{item.name}</p>
                  <p className="text-[11px] text-gray-400">Qty: {item.quantity} × ₹{item.price}</p>
                </div>
              </div>
              <span className="font-bold text-gray-900">₹{item.quantity * item.price}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Rating Modal */}
      {showRateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 space-y-4 shadow-2xl">
            <h3 className="text-lg font-black text-gray-900 text-center">Rate Your Experience</h3>
            <p className="text-xs text-gray-500 text-center">
              How was the delivery by {order.deliveryAgent?.name || 'Rahul'}?
            </p>

            <div className="flex justify-center space-x-2 py-2">
              {[1, 2, 3, 4, 5].map((num) => (
                <button
                  key={num}
                  type="button"
                  onClick={() => setRatingStars(num)}
                  className="p-1 hover:scale-110 transition"
                >
                  <Star className={`w-8 h-8 ${num <= ratingStars ? 'text-amber-500 fill-amber-500' : 'text-gray-300'}`} />
                </button>
              ))}
            </div>

            <textarea
              rows="3"
              value={ratingFeedback}
              onChange={(e) => setRatingFeedback(e.target.value)}
              placeholder="Tell us what you liked (fast delivery, fresh packaging, friendly partner)..."
              className="w-full p-3 bg-gray-50 border rounded-2xl text-xs focus:bg-white focus:outline-none"
            />

            <div className="flex gap-3 pt-2">
              <button
                type="button"
                onClick={() => setShowRateModal(false)}
                className="flex-1 py-2.5 border rounded-xl text-xs font-bold text-gray-600"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleRateSubmit}
                disabled={isSubmittingRating}
                className="flex-1 py-2.5 bg-brand-600 text-white rounded-xl text-xs font-bold shadow-md"
              >
                {isSubmittingRating ? 'Saving...' : 'Submit Rating'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delivery Partner Live Chat Modal */}
      {showChatModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="bg-white rounded-3xl max-w-md w-full h-[450px] shadow-2xl flex flex-col overflow-hidden border">
            <div className="px-5 py-3.5 bg-brand-600 text-white flex items-center justify-between">
              <div className="flex items-center space-x-2.5">
                <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center text-sm font-bold">
                  🚴
                </div>
                <div>
                  <h4 className="font-bold text-sm leading-tight">{order.deliveryAgent?.name || 'Partner'}</h4>
                  <p className="text-[10px] text-emerald-100">Live Delivery Chat</p>
                </div>
              </div>
              <button onClick={() => setShowChatModal(false)} className="text-white/80 hover:text-white font-bold">
                ✕
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-gray-50 text-xs">
              {chatMessages.map((msg, i) => (
                <div key={i} className={`flex ${msg.sender === 'customer' ? 'justify-end' : 'justify-start'}`}>
                  <div className={`max-w-[75%] p-3 rounded-2xl ${
                    msg.sender === 'customer' ? 'bg-brand-600 text-white' : 'bg-white border text-gray-800 shadow-xs'
                  }`}>
                    <p>{msg.text}</p>
                    <span className={`text-[9px] block mt-1 text-right ${msg.sender === 'customer' ? 'text-emerald-100' : 'text-gray-400'}`}>
                      {msg.time}
                    </span>
                  </div>
                </div>
              ))}
            </div>

            <form onSubmit={handleSendChat} className="p-3 border-t bg-white flex gap-2">
              <input
                type="text"
                value={newChatMsg}
                onChange={(e) => setNewChatMsg(e.target.value)}
                placeholder="Type a message for delivery partner..."
                className="flex-1 p-2.5 bg-gray-50 border rounded-xl text-xs focus:bg-white"
              />
              <button type="submit" className="p-2.5 bg-brand-600 text-white rounded-xl">
                <Send className="w-4 h-4" />
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
