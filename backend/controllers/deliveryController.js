const bcrypt = require('bcryptjs');
const User = require('../models/User');
const DeliveryAgent = require('../models/DeliveryAgent');
const Order = require('../models/Order');
const { emitOrderUpdate, emitNewDeliveryRequest } = require('../socket/socketHandler');

// @route   POST /api/delivery/register
// @desc    Register a new delivery partner (starts in PENDING verification)
const registerPartner = async (req, res, next) => {
  try {
    const {
      fullName,
      email,
      phone,
      password,
      vehicleType,
      vehicleNumber,
      drivingLicense,
      governmentId,
      serviceArea,
      profilePhoto
    } = req.body;

    if (!fullName || !email || !phone || !password || !vehicleNumber || !drivingLicense) {
      return res.status(400).json({
        success: false,
        message: 'Please provide all required fields including vehicle and license details.'
      });
    }

    const existingUser = await User.findOne({ email: email.toLowerCase() });
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: 'An account with this email already exists.'
      });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const user = await User.create({
      name: fullName,
      email: email.toLowerCase(),
      phone,
      password: hashedPassword,
      role: 'delivery',
      profileImage: profilePhoto || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80'
    });

    const agent = await DeliveryAgent.create({
      userId: String(user._id),
      fullName,
      email: email.toLowerCase(),
      phone,
      profilePhoto: user.profileImage,
      vehicleType: vehicleType || 'Bike',
      vehicleNumber: vehicleNumber.toUpperCase(),
      drivingLicense: drivingLicense.toUpperCase(),
      governmentId: governmentId || 'PENDING_UPLOAD',
      serviceArea: serviceArea || 'Pune City',
      verificationStatus: 'PENDING',
      availability: {
        isOnline: false,
        isBusy: false,
        activeOrderId: null
      },
      currentLocation: {
        lat: 18.5590,
        lng: 73.7868,
        lastUpdated: new Date()
      },
      earnings: {
        today: 0,
        total: 0,
        pending: 0
      },
      rating: 5.0,
      totalReviews: 0,
      ordersCompleted: 0
    });

    res.status(201).json({
      success: true,
      message: 'Application submitted successfully! Your account is currently Pending Verification by MART WITH US Admin.',
      agent: {
        id: String(agent._id),
        fullName: agent.fullName,
        verificationStatus: agent.verificationStatus,
        vehicleType: agent.vehicleType,
        serviceArea: agent.serviceArea
      }
    });
  } catch (error) {
    next(error);
  }
};

// @route   GET /api/delivery/profile
// @desc    Get agent profile and current stats
const getAgentProfile = async (req, res, next) => {
  try {
    let agent = await DeliveryAgent.findOne({ userId: req.user.id });
    if (!agent) {
      agent = await DeliveryAgent.findById(req.user.id);
    }

    if (!agent) {
      return res.status(404).json({
        success: false,
        message: 'Delivery agent profile not found.'
      });
    }

    res.json({
      success: true,
      agent
    });
  } catch (error) {
    next(error);
  }
};

// @route   PUT /api/delivery/availability
// @desc    Toggle agent online/offline status
const toggleAvailability = async (req, res, next) => {
  try {
    const { isOnline } = req.body;
    let agent = await DeliveryAgent.findOne({ userId: req.user.id });
    if (!agent) agent = await DeliveryAgent.findById(req.user.id);

    if (!agent) return res.status(404).json({ success: false, message: 'Agent not found' });

    if (agent.verificationStatus !== 'APPROVED') {
      return res.status(403).json({
        success: false,
        message: `Cannot go online. Account verification status is ${agent.verificationStatus}.`
      });
    }

    const updated = await DeliveryAgent.findByIdAndUpdate(
      agent._id,
      {
        'availability.isOnline': Boolean(isOnline)
      },
      { new: true }
    );

    res.json({
      success: true,
      message: isOnline ? 'You are now ONLINE and ready to receive delivery requests!' : 'You are now OFFLINE.',
      availability: updated.availability
    });
  } catch (error) {
    next(error);
  }
};

// @route   GET /api/delivery/orders/available
// @desc    Get list of available delivery requests ready for acceptance
const getAvailableOrders = async (req, res, next) => {
  try {
    const all = await Order.find();
    // Orders that are PREPARING or PACKED and do not have an assigned agent yet
    const available = all.filter(o => 
      (o.orderStatus === 'PREPARING' || o.orderStatus === 'PACKED') &&
      (!o.deliveryAgent || !o.deliveryAgent.agentId)
    );

    res.json({
      success: true,
      orders: available
    });
  } catch (error) {
    next(error);
  }
};

// @route   GET /api/delivery/orders/active
// @desc    Get current active order for this delivery agent
const getActiveOrder = async (req, res, next) => {
  try {
    let agent = await DeliveryAgent.findOne({ userId: req.user.id });
    if (!agent) agent = await DeliveryAgent.findById(req.user.id);

    if (!agent) return res.status(404).json({ success: false, message: 'Agent not found' });

    if (!agent.availability?.activeOrderId) {
      return res.json({ success: true, activeOrder: null });
    }

    let order = await Order.findOne({ orderId: agent.availability.activeOrderId });
    if (!order) {
      order = await Order.findById(agent.availability.activeOrderId);
    }

    res.json({
      success: true,
      activeOrder: order
    });
  } catch (error) {
    next(error);
  }
};

// @route   POST /api/delivery/orders/:id/accept
// @desc    Agent accepts an available order
const acceptOrder = async (req, res, next) => {
  try {
    const orderIdParam = req.params.id;
    let agent = await DeliveryAgent.findOne({ userId: req.user.id });
    if (!agent) agent = await DeliveryAgent.findById(req.user.id);

    if (!agent) return res.status(404).json({ success: false, message: 'Delivery agent not found.' });

    if (agent.verificationStatus !== 'APPROVED') {
      return res.status(403).json({
        success: false,
        message: 'Your account is not approved yet. Please wait for Admin approval.'
      });
    }

    if (agent.availability?.isBusy && agent.availability?.activeOrderId) {
      return res.status(400).json({
        success: false,
        message: 'You already have an ongoing delivery in progress.'
      });
    }

    let order = await Order.findOne({ orderId: orderIdParam });
    if (!order) order = await Order.findById(orderIdParam);

    if (!order) return res.status(404).json({ success: false, message: 'Order not found.' });

    if (order.deliveryAgent && order.deliveryAgent.agentId) {
      return res.status(400).json({
        success: false,
        message: 'This order was already accepted by another partner.'
      });
    }

    const updatedTimeline = order.timeline || [];
    updatedTimeline.push({
      status: 'ASSIGNED',
      title: 'Delivery Partner Assigned 🚴',
      time: new Date(),
      note: `${agent.fullName} (${agent.vehicleType} ${agent.vehicleNumber}) has accepted your delivery order.`
    });

    const updatedOrder = await Order.findByIdAndUpdate(
      order._id,
      {
        orderStatus: 'ASSIGNED',
        deliveryAgent: {
          agentId: String(agent._id),
          name: agent.fullName,
          phone: agent.phone,
          profilePhoto: agent.profilePhoto,
          vehicleType: agent.vehicleType,
          vehicleNumber: agent.vehicleNumber,
          rating: agent.rating || 4.8
        },
        timeline: updatedTimeline,
        liveLocation: {
          lat: agent.currentLocation?.lat || 18.5590,
          lng: agent.currentLocation?.lng || 73.7868,
          heading: 0,
          lastUpdated: new Date()
        }
      },
      { new: true }
    );

    // Update agent busy status
    await DeliveryAgent.findByIdAndUpdate(agent._id, {
      'availability.isBusy': true,
      'availability.activeOrderId': updatedOrder.orderId
    });

    // Real-time notification to customer
    emitOrderUpdate(updatedOrder.orderId, 'order-status-update', {
      status: 'ASSIGNED',
      order: updatedOrder
    });

    res.json({
      success: true,
      message: 'Order accepted! Please proceed to the store for pickup.',
      order: updatedOrder
    });
  } catch (error) {
    next(error);
  }
};

// @route   PUT /api/delivery/orders/:id/status
// @desc    Update delivery workflow status: PICKED UP -> OUT_FOR_DELIVERY -> DELIVERED
const updateDeliveryStatus = async (req, res, next) => {
  try {
    const { status, note } = req.body;
    const orderIdParam = req.params.id;

    const validStatuses = ['PICKED UP', 'OUT_FOR_DELIVERY', 'DELIVERED'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        message: `Invalid status. Allowed: ${validStatuses.join(', ')}`
      });
    }

    let order = await Order.findOne({ orderId: orderIdParam });
    if (!order) order = await Order.findById(orderIdParam);

    if (!order) return res.status(404).json({ success: false, message: 'Order not found.' });

    let agent = await DeliveryAgent.findOne({ userId: req.user.id });
    if (!agent) agent = await DeliveryAgent.findById(req.user.id);

    const timeline = order.timeline || [];
    let title = '';
    let defaultNote = '';

    if (status === 'PICKED UP') {
      title = 'Order Picked Up from Store 📦';
      defaultNote = `Package picked up from ${order.store?.name || 'Store'}. Partner is inspecting items.`;
    } else if (status === 'OUT_FOR_DELIVERY') {
      title = 'Out for Delivery 🚴';
      defaultNote = `Your delivery partner ${agent ? agent.fullName : ''} is on the way to your address.`;
    } else if (status === 'DELIVERED') {
      title = 'Order Delivered Successfully 🎉';
      defaultNote = 'Package handed over at delivery address. Enjoy your fresh groceries!';
    }

    timeline.push({
      status,
      title,
      time: new Date(),
      note: note || defaultNote
    });

    const updateFields = {
      orderStatus: status,
      timeline
    };

    if (status === 'DELIVERED') {
      updateFields.paymentStatus = 'PAID';
    }

    const updatedOrder = await Order.findByIdAndUpdate(order._id, updateFields, { new: true });

    // If DELIVERED, credit agent earnings and release busy status
    if (status === 'DELIVERED' && agent) {
      const payout = order.agentPayout || 50;
      const todayEarnings = (agent.earnings?.today || 0) + payout;
      const totalEarnings = (agent.earnings?.total || 0) + payout;
      const ordersCompleted = (agent.ordersCompleted || 0) + 1;

      await DeliveryAgent.findByIdAndUpdate(agent._id, {
        'availability.isBusy': false,
        'availability.activeOrderId': null,
        'earnings.today': todayEarnings,
        'earnings.total': totalEarnings,
        ordersCompleted
      });
    }

    // Real-time broadcast to customer
    emitOrderUpdate(updatedOrder.orderId, 'order-status-update', {
      status,
      title,
      order: updatedOrder
    });

    res.json({
      success: true,
      message: `Status successfully updated to ${status}.`,
      order: updatedOrder
    });
  } catch (error) {
    next(error);
  }
};

// @route   PUT /api/delivery/location
// @desc    Update live coordinates for agent and their active delivery
const updateLocation = async (req, res, next) => {
  try {
    const { lat, lng, heading = 0, orderId } = req.body;

    let agent = await DeliveryAgent.findOne({ userId: req.user.id });
    if (!agent) agent = await DeliveryAgent.findById(req.user.id);

    if (agent) {
      await DeliveryAgent.findByIdAndUpdate(agent._id, {
        currentLocation: {
          lat: Number(lat),
          lng: Number(lng),
          lastUpdated: new Date()
        }
      });
    }

    const targetOrderId = orderId || agent?.availability?.activeOrderId;
    if (targetOrderId) {
      let order = await Order.findOne({ orderId: targetOrderId });
      if (!order) order = await Order.findById(targetOrderId);

      if (order) {
        await Order.findByIdAndUpdate(order._id, {
          liveLocation: {
            lat: Number(lat),
            lng: Number(lng),
            heading: Number(heading),
            lastUpdated: new Date()
          }
        });

        // Broadcast to customer tracking page
        emitOrderUpdate(order.orderId, 'location-updated', {
          lat: Number(lat),
          lng: Number(lng),
          heading: Number(heading),
          lastUpdated: new Date().toISOString()
        });
      }
    }

    res.json({
      success: true,
      message: 'Location updated',
      location: { lat, lng, heading, lastUpdated: new Date() }
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  registerPartner,
  getAgentProfile,
  toggleAvailability,
  getAvailableOrders,
  getActiveOrder,
  acceptOrder,
  updateDeliveryStatus,
  updateLocation
};
