const Order = require('../models/Order');
const Store = require('../models/Store');
const DeliveryAgent = require('../models/DeliveryAgent');
const PaymentService = require('../services/paymentService');
const deliveryAssignmentService = require('../services/deliveryAssignmentService');
const { generateOrderId } = require('../utils/idGenerator');
const { emitNewDeliveryRequest, emitOrderUpdate } = require('../socket/socketHandler');

// @route   POST /api/orders
// @desc    Place a new grocery delivery order
const createOrder = async (req, res, next) => {
  try {
    const {
      products,
      address,
      paymentMethod,
      deliveryType,
      scheduledSlot,
      subtotal,
      discount = 0,
      deliveryFee = 0,
      tax = 0,
      storeId
    } = req.body;

    if (!products || !products.length) {
      return res.status(400).json({
        success: false,
        message: 'Your cart is empty. Please add items to place an order.'
      });
    }

    if (!address || !address.house || !address.street || !address.area) {
      return res.status(400).json({
        success: false,
        message: 'Please provide a valid delivery address with house, street and area.'
      });
    }

    // Pick store
    const store = (await Store.findOne({ storeId })) || (await Store.findOne()) || {
      storeId: 'store-baner-1',
      name: 'MART WITH US — Baner Hub',
      address: 'Shop 101-105, Primrose Mall, Baner High Street, Pune',
      contactPhone: '+91 98230 45678'
    };

    const orderId = generateOrderId();
    const calculatedTotal = Math.max(0, subtotal - discount + deliveryFee + tax);

    // Process payment through payment abstraction layer
    const paymentResult = await PaymentService.initiateCheckout({
      orderId,
      amount: calculatedTotal,
      method: paymentMethod || 'UPI',
      customer: {
        userId: req.user.id,
        name: req.user.name,
        email: req.user.email,
        phone: req.user.phone
      }
    });

    if (!paymentResult.success) {
      return res.status(400).json({
        success: false,
        message: paymentResult.message || 'Payment processing failed. Please try another method.'
      });
    }

    const distanceKm = 2.5 + Math.floor(Math.random() * 30) / 10; // 2.5 - 5.5 km
    const agentPayout = deliveryAssignmentService.calculateAgentPayout(distanceKm);

    const initialTimeline = [
      {
        status: 'PREPARING',
        title: 'Order Confirmed 🎉',
        time: new Date(),
        note: `Order received by ${store.name}. Store staff is preparing and packing fresh items.`
      }
    ];

    const newOrder = await Order.create({
      orderId,
      customer: {
        userId: req.user.id,
        name: req.user.name,
        email: req.user.email,
        phone: req.user.phone
      },
      products,
      address,
      subtotal,
      discount,
      deliveryFee,
      tax,
      total: calculatedTotal,
      paymentMethod: paymentMethod || 'UPI',
      paymentStatus: paymentResult.status || 'PAID',
      paymentDetails: {
        transactionId: paymentResult.transactionId,
        paymentGateway: paymentResult.gateway,
        paidAt: paymentResult.paidAt || (paymentMethod === 'Cash on Delivery' ? null : new Date())
      },
      orderStatus: 'PREPARING',
      deliveryType: deliveryType || 'STANDARD',
      scheduledSlot: scheduledSlot || 'Today, 25-35 mins',
      store,
      deliveryDistanceKm: distanceKm,
      agentPayout,
      timeline: initialTimeline,
      liveLocation: {
        lat: 18.5590,
        lng: 73.7868,
        heading: 0,
        lastUpdated: new Date()
      }
    });

    // Notify delivery agents of new order ready for acceptance
    emitNewDeliveryRequest(newOrder);

    res.status(201).json({
      success: true,
      message: 'Order placed successfully! 🎉',
      order: newOrder
    });
  } catch (error) {
    next(error);
  }
};

// @route   GET /api/orders
// @desc    Get customer's orders
const getMyOrders = async (req, res, next) => {
  try {
    const all = await Order.find();
    const customerOrders = all
      .filter(o => o.customer && String(o.customer.userId) === String(req.user.id))
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

    res.json({
      success: true,
      orders: customerOrders
    });
  } catch (error) {
    next(error);
  }
};

// @route   GET /api/orders/:id
// @desc    Get order details by orderId (e.g. MWU-...) or Mongo _id
const getOrderById = async (req, res, next) => {
  try {
    const idOrCode = req.params.id;
    let order = await Order.findOne({ orderId: idOrCode });
    if (!order) {
      order = await Order.findById(idOrCode);
    }

    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found.'
      });
    }

    // Role-based view check (customer can only view their own; admin & delivery can view)
    if (
      req.user.role === 'customer' &&
      order.customer &&
      String(order.customer.userId) !== String(req.user.id)
    ) {
      return res.status(403).json({
        success: false,
        message: 'You are not authorized to view this order.'
      });
    }

    res.json({
      success: true,
      order
    });
  } catch (error) {
    next(error);
  }
};

// @route   POST /api/orders/:id/rate
// @desc    Customer rates completed order & delivery partner
const rateOrder = async (req, res, next) => {
  try {
    const { stars, feedback } = req.body;
    const idOrCode = req.params.id;

    let order = await Order.findOne({ orderId: idOrCode });
    if (!order) order = await Order.findById(idOrCode);

    if (!order) {
      return res.status(404).json({ success: false, message: 'Order not found.' });
    }

    const updated = await Order.findByIdAndUpdate(
      order._id,
      {
        rating: {
          stars: Number(stars),
          feedback: feedback || '',
          ratedAt: new Date()
        }
      },
      { new: true }
    );

    // Update agent's rating if assigned
    if (order.deliveryAgent && order.deliveryAgent.agentId) {
      const agent = await DeliveryAgent.findById(order.deliveryAgent.agentId);
      if (agent) {
        const totalRev = (agent.totalReviews || 0) + 1;
        const currentRating = agent.rating || 4.8;
        const newRating = Number(((currentRating * (totalRev - 1) + Number(stars)) / totalRev).toFixed(2));
        await DeliveryAgent.findByIdAndUpdate(agent._id, {
          rating: newRating,
          totalReviews: totalRev
        });
      }
    }

    res.json({
      success: true,
      message: 'Thank you for your rating and feedback!',
      order: updated
    });
  } catch (error) {
    next(error);
  }
};

// @route   PUT /api/orders/:id/cancel
// @desc    Cancel order if still preparing
const cancelOrder = async (req, res, next) => {
  try {
    const idOrCode = req.params.id;
    let order = await Order.findOne({ orderId: idOrCode });
    if (!order) order = await Order.findById(idOrCode);

    if (!order) return res.status(404).json({ success: false, message: 'Order not found.' });

    if (order.orderStatus === 'OUT_FOR_DELIVERY' || order.orderStatus === 'DELIVERED') {
      return res.status(400).json({
        success: false,
        message: 'Cannot cancel an order that is already out for delivery or delivered.'
      });
    }

    const updated = await Order.findByIdAndUpdate(
      order._id,
      {
        orderStatus: 'CANCELLED',
        $push: {
          timeline: {
            status: 'CANCELLED',
            title: 'Order Cancelled',
            time: new Date(),
            note: 'Order was cancelled by customer.'
          }
        }
      },
      { new: true }
    );

    emitOrderUpdate(order.orderId, 'order-status-update', {
      status: 'CANCELLED',
      title: 'Order Cancelled',
      order: updated
    });

    res.json({
      success: true,
      message: 'Order cancelled successfully.',
      order: updated
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createOrder,
  getMyOrders,
  getOrderById,
  rateOrder,
  cancelOrder
};
