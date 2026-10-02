const { createUnifiedModel } = require('./unifiedModel');

const deliveryAgentSchema = {
  userId: { type: String, required: true },
  fullName: { type: String, required: true },
  email: { type: String, required: true },
  phone: { type: String, required: true },
  profilePhoto: { 
    type: String, 
    default: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80' 
  },
  vehicleType: { 
    type: String, 
    enum: ['Bicycle', 'Bike', 'Scooter', 'Car'], 
    default: 'Bike' 
  },
  vehicleNumber: { type: String, required: true },
  drivingLicense: { type: String, required: true },
  governmentId: { type: String, required: true },
  serviceArea: { type: String, default: 'Baner & Surrounding (Pune)' },
  verificationStatus: { 
    type: String, 
    enum: ['PENDING', 'APPROVED', 'REJECTED', 'SUSPENDED'], 
    default: 'APPROVED' 
  },
  availability: {
    isOnline: { type: Boolean, default: true },
    isBusy: { type: Boolean, default: false },
    activeOrderId: { type: String, default: null }
  },
  currentLocation: {
    lat: { type: Number, default: 18.5590 },
    lng: { type: Number, default: 73.7868 },
    lastUpdated: { type: Date, default: Date.now }
  },
  earnings: {
    today: { type: Number, default: 620 },
    total: { type: Number, default: 14250 },
    pending: { type: Number, default: 180 }
  },
  rating: { type: Number, default: 4.8 },
  totalReviews: { type: Number, default: 84 },
  ordersCompleted: { type: Number, default: 42 },
  createdAt: { type: Date, default: Date.now }
};

const DeliveryAgent = createUnifiedModel('DeliveryAgent', deliveryAgentSchema);
module.exports = DeliveryAgent;
