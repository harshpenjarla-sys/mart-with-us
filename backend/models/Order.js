const { createUnifiedModel } = require('./unifiedModel');

const orderSchema = {
  orderId: { type: String, required: true, unique: true }, // MWU-YYYYMMDD-XXXXX
  customer: {
    userId: { type: String, required: true },
    name: { type: String, required: true },
    email: { type: String, required: true },
    phone: { type: String, required: true }
  },
  products: [{
    productId: { type: String, required: true },
    name: { type: String, required: true },
    brand: { type: String },
    price: { type: Number, required: true },
    mrp: { type: Number },
    quantity: { type: Number, required: true },
    unit: { type: String },
    image: { type: String }
  }],
  address: {
    fullName: String,
    phone: String,
    house: String,
    street: String,
    area: String,
    city: String,
    state: String,
    pincode: String,
    landmark: String
  },
  subtotal: { type: Number, required: true },
  discount: { type: Number, default: 0 },
  deliveryFee: { type: Number, default: 0 },
  tax: { type: Number, default: 0 },
  total: { type: Number, required: true },
  paymentMethod: { 
    type: String, 
    enum: ['UPI', 'Credit Card', 'Debit Card', 'Net Banking', 'Cash on Delivery'], 
    default: 'UPI' 
  },
  paymentStatus: { 
    type: String, 
    enum: ['PENDING', 'PAID', 'FAILED', 'REFUNDED'], 
    default: 'PENDING' 
  },
  paymentDetails: {
    transactionId: String,
    paymentGateway: String, // MockPaymentProvider
    paidAt: Date
  },
  orderStatus: {
    type: String,
    enum: ['PREPARING', 'PACKED', 'ASSIGNED', 'OUT_FOR_DELIVERY', 'DELIVERED', 'CANCELLED'],
    default: 'PREPARING'
  },
  deliveryType: {
    type: String,
    enum: ['STANDARD', 'SCHEDULED'],
    default: 'STANDARD'
  },
  scheduledSlot: { type: String, default: 'Today, 25-35 mins' },
  store: {
    storeId: { type: String, default: 'store-baner-1' },
    name: { type: String, default: 'MART WITH US — Baner Superstore' },
    address: { type: String, default: 'Shop 12-14, High Street, Baner, Pune' },
    phone: { type: String, default: '+91 98230 45678' }
  },
  deliveryAgent: {
    agentId: String,
    name: String,
    phone: String,
    profileImage: String,
    vehicleType: String,
    vehicleNumber: String,
    rating: Number
  },
  deliveryDistanceKm: { type: Number, default: 3.5 },
  agentPayout: { type: Number, default: 45 },
  timeline: [{
    status: String,
    title: String,
    time: { type: Date, default: Date.now },
    note: String
  }],
  liveLocation: {
    lat: { type: Number, default: 18.5590 },
    lng: { type: Number, default: 73.7868 },
    heading: { type: Number, default: 0 },
    lastUpdated: { type: Date, default: Date.now }
  },
  rating: {
    stars: Number,
    feedback: String,
    ratedAt: Date
  },
  createdAt: { type: Date, default: Date.now }
};

const Order = createUnifiedModel('Order', orderSchema);
module.exports = Order;
