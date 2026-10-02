const express = require('express');
const router = express.Router();
const {
  registerPartner,
  getAgentProfile,
  toggleAvailability,
  getAvailableOrders,
  getActiveOrder,
  acceptOrder,
  updateDeliveryStatus,
  updateLocation
} = require('../controllers/deliveryController');
const { protect, authorize } = require('../middleware/authMiddleware');

// Public partner registration
router.post('/register', registerPartner);

// Delivery Agent routes
router.get('/profile', protect, authorize('delivery', 'admin'), getAgentProfile);
router.put('/availability', protect, authorize('delivery', 'admin'), toggleAvailability);
router.get('/orders/available', protect, authorize('delivery', 'admin'), getAvailableOrders);
router.get('/orders/active', protect, authorize('delivery', 'admin'), getActiveOrder);
router.post('/orders/:id/accept', protect, authorize('delivery', 'admin'), acceptOrder);
router.put('/orders/:id/status', protect, authorize('delivery', 'admin'), updateDeliveryStatus);
router.put('/location', protect, authorize('delivery', 'admin'), updateLocation);

module.exports = router;
