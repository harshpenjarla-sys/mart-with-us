const User = require('../models/User');
const Order = require('../models/Order');
const Product = require('../models/Product');
const DeliveryAgent = require('../models/DeliveryAgent');
const Store = require('../models/Store');
const PaymentService = require('../services/paymentService');
const { emitOrderUpdate } = require('../socket/socketHandler');

// @route   GET /api/admin/dashboard
// @desc    Get aggregate statistics and KPIs for Admin Dashboard
const getDashboardStats = async (req, res, next) => {
  try {
    const allOrders = await Order.find();
    const allUsers = await User.find();
    const allProducts = await Product.find();
    const allAgents = await DeliveryAgent.find();
    const allStores = await Store.find();

    const customersCount = allUsers.filter(u => u.role === 'customer').length;
    const totalOrdersCount = allOrders.length;

    // Today's orders
    const today = new Date().toISOString().slice(0, 10);
    const todayOrders = allOrders.filter(o => {
      const orderDate = new Date(o.createdAt).toISOString().slice(0, 10);
      return orderDate === today;
    });

    // Revenue calculation
    const totalRevenue = allOrders
      .filter(o => o.paymentStatus === 'PAID')
      .reduce((acc, o) => acc + (o.total || 0), 0);

    const todayRevenue = todayOrders
      .filter(o => o.paymentStatus === 'PAID')
      .reduce((acc, o) => acc + (o.total || 0), 0);

    // Delivery Agents
    const activeAgents = allAgents.filter(a => a.availability?.isOnline && a.verificationStatus === 'APPROVED').length;
    const pendingAgentApprovals = allAgents.filter(a => a.verificationStatus === 'PENDING').length;

    // Low stock products (< 15 units)
    const lowStockProducts = allProducts.filter(p => (p.stock || 0) < 15);

    // Recent orders
    const recentOrders = allOrders
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
      .slice(0, 8);

    res.json({
      success: true,
      stats: {
        totalCustomers: customersCount,
        totalOrders: totalOrdersCount,
        todayOrders: todayOrders.length,
        totalRevenue: Math.round(totalRevenue),
        todayRevenue: Math.round(todayRevenue),
        activeDeliveryAgents: activeAgents,
        totalDeliveryAgents: allAgents.length,
        pendingAgentApprovals,
        lowStockCount: lowStockProducts.length,
        totalProducts: allProducts.length,
        totalStores: allStores.length
      },
      lowStockProducts: lowStockProducts.slice(0, 6),
      recentOrders
    });
  } catch (error) {
    next(error);
  }
};

// @route   GET /api/admin/orders
// @desc    Get all orders with filtering and search
const getAllOrders = async (req, res, next) => {
  try {
    const { status, search, storeId, limit = 50, page = 1 } = req.query;
    let all = await Order.find();

    if (status && status !== 'ALL') {
      all = all.filter(o => o.orderStatus === status);
    }

    if (storeId) {
      all = all.filter(o => o.store?.storeId === storeId);
    }

    if (search && search.trim()) {
      const q = search.trim().toLowerCase();
      all = all.filter(o => 
        o.orderId.toLowerCase().includes(q) ||
        (o.customer?.name && o.customer.name.toLowerCase().includes(q)) ||
        (o.customer?.phone && o.customer.phone.includes(q))
      );
    }

    all.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

    res.json({
      success: true,
      total: all.length,
      orders: all
    });
  } catch (error) {
    next(error);
  }
};

// @route   PUT /api/admin/orders/:id/status
// @desc    Admin manually updates order status or assigns agent
const updateOrderStatus = async (req, res, next) => {
  try {
    const { status, deliveryAgentId, cancelReason } = req.body;
    let order = await Order.findOne({ orderId: req.params.id });
    if (!order) order = await Order.findById(req.params.id);

    if (!order) return res.status(404).json({ success: false, message: 'Order not found' });

    const timeline = order.timeline || [];
    const updateData = {};

    if (status) {
      updateData.orderStatus = status;
      timeline.push({
        status,
        title: `Status updated to ${status} by Admin`,
        time: new Date(),
        note: cancelReason || 'Administrative update'
      });
      updateData.timeline = timeline;

      if (status === 'DELIVERED') {
        updateData.paymentStatus = 'PAID';
      }
    }

    if (deliveryAgentId) {
      const agent = await DeliveryAgent.findById(deliveryAgentId);
      if (agent) {
        updateData.deliveryAgent = {
          agentId: String(agent._id),
          name: agent.fullName,
          phone: agent.phone,
          profilePhoto: agent.profilePhoto,
          vehicleType: agent.vehicleType,
          vehicleNumber: agent.vehicleNumber,
          rating: agent.rating || 4.8
        };
        updateData.orderStatus = 'ASSIGNED';
        timeline.push({
          status: 'ASSIGNED',
          title: 'Delivery Partner Assigned by Admin',
          time: new Date(),
          note: `${agent.fullName} was assigned to this delivery.`
        });
        updateData.timeline = timeline;

        await DeliveryAgent.findByIdAndUpdate(agent._id, {
          'availability.isBusy': true,
          'availability.activeOrderId': order.orderId
        });
      }
    }

    const updated = await Order.findByIdAndUpdate(order._id, updateData, { new: true });

    emitOrderUpdate(order.orderId, 'order-status-update', {
      status: updated.orderStatus,
      order: updated
    });

    res.json({
      success: true,
      message: 'Order updated successfully',
      order: updated
    });
  } catch (error) {
    next(error);
  }
};

// @route   POST /api/admin/orders/:id/refund
// @desc    Refund an order
const refundOrder = async (req, res, next) => {
  try {
    let order = await Order.findOne({ orderId: req.params.id });
    if (!order) order = await Order.findById(req.params.id);

    if (!order) return res.status(404).json({ success: false, message: 'Order not found' });

    const refundResult = await PaymentService.processRefund({
      transactionId: order.paymentDetails?.transactionId || 'MANUAL_' + Date.now(),
      amount: order.total,
      reason: req.body.reason || 'Admin initiated refund'
    });

    const updated = await Order.findByIdAndUpdate(order._id, {
      paymentStatus: 'REFUNDED',
      orderStatus: 'CANCELLED',
      $push: {
        timeline: {
          status: 'REFUNDED',
          title: 'Order Refunded',
          time: new Date(),
          note: `Refund of ₹${order.total} processed.`
        }
      }
    }, { new: true });

    res.json({
      success: true,
      message: `Refund of ₹${order.total} processed successfully.`,
      refundResult,
      order: updated
    });
  } catch (error) {
    next(error);
  }
};

// @route   GET /api/admin/delivery-agents
// @desc    Get all delivery partners with full details & statuses
const getAllDeliveryAgents = async (req, res, next) => {
  try {
    const agents = await DeliveryAgent.find();
    res.json({
      success: true,
      agents
    });
  } catch (error) {
    next(error);
  }
};

// @route   PUT /api/admin/delivery-agents/:id/status
// @desc    Approve, Reject, or Suspend a delivery partner
const updateAgentStatus = async (req, res, next) => {
  try {
    const { status } = req.body;
    const validStatuses = ['APPROVED', 'REJECTED', 'SUSPENDED', 'PENDING'];

    if (!validStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        message: `Invalid status. Must be one of: ${validStatuses.join(', ')}`
      });
    }

    const updated = await DeliveryAgent.findByIdAndUpdate(
      req.params.id,
      { verificationStatus: status },
      { new: true }
    );

    if (!updated) {
      return res.status(404).json({ success: false, message: 'Delivery partner not found.' });
    }

    res.json({
      success: true,
      message: `Partner status changed to ${status}.`,
      agent: updated
    });
  } catch (error) {
    next(error);
  }
};

// @route   GET /api/admin/users
// @desc    Get all registered customer accounts
const getAllUsers = async (req, res, next) => {
  try {
    const users = await User.find();
    const safeUsers = users.map(u => ({
      id: String(u._id),
      name: u.name,
      email: u.email,
      phone: u.phone,
      role: u.role,
      addressesCount: (u.addresses || []).length,
      createdAt: u.createdAt
    }));

    res.json({
      success: true,
      users: safeUsers
    });
  } catch (error) {
    next(error);
  }
};

// @route   GET /api/admin/stores
// @desc    Get all stores
const getAllStores = async (req, res, next) => {
  try {
    const stores = await Store.find();
    res.json({ success: true, stores });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getDashboardStats,
  getAllOrders,
  updateOrderStatus,
  refundOrder,
  getAllDeliveryAgents,
  updateAgentStatus,
  getAllUsers,
  getAllStores
};
