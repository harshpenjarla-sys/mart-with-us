const express = require('express');
const router = express.Router();
const {
  getDashboardStats,
  getAllOrders,
  updateOrderStatus,
  refundOrder,
  getAllDeliveryAgents,
  updateAgentStatus,
  getAllUsers,
  getAllStores
} = require('../controllers/adminController');
const { protect, authorize } = require('../middleware/authMiddleware');

router.use(protect);
router.use(authorize('admin'));

router.get('/dashboard', getDashboardStats);
router.get('/orders', getAllOrders);
router.put('/orders/:id/status', updateOrderStatus);
router.post('/orders/:id/refund', refundOrder);
router.get('/delivery-agents', getAllDeliveryAgents);
router.put('/delivery-agents/:id/status', updateAgentStatus);
router.get('/users', getAllUsers);
router.get('/stores', getAllStores);

module.exports = router;
