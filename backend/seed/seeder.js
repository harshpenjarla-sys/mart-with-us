const bcrypt = require('bcryptjs');
const dotenv = require('dotenv');
const path = require('path');
dotenv.config({ path: path.join(__dirname, '..', '.env') });

const { connectDB } = require('../config/db');
const User = require('../models/User');
const Product = require('../models/Product');
const Category = require('../models/Category');
const Store = require('../models/Store');
const DeliveryAgent = require('../models/DeliveryAgent');
const Order = require('../models/Order');
const Review = require('../models/Review');
const { categories, stores, products } = require('./seedData');

async function seedDatabase(force = false) {
  try {
    await connectDB();

    const existingUsers = await User.countDocuments();
    if (existingUsers > 0 && !force) {
      console.log('ℹ️ Database already contains data. Skipping initial seeding.');
      return;
    }

    console.log('🌱 Seeding MART WITH US database with production-style data...');

    // Clean existing
    await User.deleteMany();
    await Product.deleteMany();
    await Category.deleteMany();
    await Store.deleteMany();
    await DeliveryAgent.deleteMany();
    await Order.deleteMany();
    await Review.deleteMany();

    // 1. Seed Demo Users
    const salt = await bcrypt.genSalt(10);
    const customerPassword = await bcrypt.hash('Customer@123', salt);
    const deliveryPassword = await bcrypt.hash('Delivery@123', salt);
    const adminPassword = await bcrypt.hash('Admin@123', salt);

    const customerUser = await User.create({
      name: 'Rohan Sharma',
      email: 'customer@martwithus.com',
      phone: '+91 98765 43210',
      password: customerPassword,
      role: 'customer',
      profileImage: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=400&q=80',
      addresses: [
        {
          _id: 'addr-1',
          fullName: 'Rohan Sharma',
          phone: '+91 98765 43210',
          house: 'Flat 402, Building B',
          street: 'Green Meadows Society',
          area: 'Baner',
          city: 'Pune',
          state: 'Maharashtra',
          pincode: '411045',
          landmark: 'Opposite Westend Hotel',
          isDefault: true
        },
        {
          _id: 'addr-2',
          fullName: 'Rohan Sharma (Office)',
          phone: '+91 98765 43210',
          house: 'Floor 5, IT Tower 3',
          street: 'Hinjawadi Phase 1',
          area: 'Hinjawadi',
          city: 'Pune',
          state: 'Maharashtra',
          pincode: '411057',
          landmark: 'Near Wipro Circle',
          isDefault: false
        }
      ]
    });

    const deliveryUser = await User.create({
      name: 'Rahul K. Verma',
      email: 'delivery@martwithus.com',
      phone: '+91 91234 56789',
      password: deliveryPassword,
      role: 'delivery',
      profileImage: 'https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?auto=format&fit=crop&w=400&q=80'
    });

    const adminUser = await User.create({
      name: 'MART WITH US Admin',
      email: 'admin@martwithus.com',
      phone: '+91 98230 00000',
      password: adminPassword,
      role: 'admin',
      profileImage: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&w=400&q=80'
    });

    // 2. Seed Stores
    for (const store of stores) {
      await Store.create(store);
    }

    // 3. Seed Delivery Agent Profile
    const agentProfile = await DeliveryAgent.create({
      userId: String(deliveryUser._id),
      fullName: 'Rahul K. Verma',
      email: 'delivery@martwithus.com',
      phone: '+91 91234 56789',
      profilePhoto: 'https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?auto=format&fit=crop&w=400&q=80',
      vehicleType: 'Bike',
      vehicleNumber: 'MH-12-AB-1234',
      drivingLicense: 'DL-MH12-202200984',
      governmentId: 'AADHAAR-XXXX-XXXX-9842',
      serviceArea: 'Baner, Aundh, Wakad & Balewadi (Pune)',
      verificationStatus: 'APPROVED',
      availability: {
        isOnline: true,
        isBusy: false,
        activeOrderId: null
      },
      currentLocation: {
        lat: 18.5590,
        lng: 73.7868,
        lastUpdated: new Date()
      },
      earnings: {
        today: 620,
        total: 14850,
        pending: 180
      },
      rating: 4.85,
      totalReviews: 86,
      ordersCompleted: 44
    });

    // Also seed a pending delivery partner for admin approval demo
    const pendingDeliveryUser = await User.create({
      name: 'Vikram Shinde',
      email: 'vikram.delivery@gmail.com',
      phone: '+91 98221 44556',
      password: deliveryPassword,
      role: 'delivery',
      profileImage: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=400&q=80'
    });

    await DeliveryAgent.create({
      userId: String(pendingDeliveryUser._id),
      fullName: 'Vikram Shinde',
      email: 'vikram.delivery@gmail.com',
      phone: '+91 98221 44556',
      vehicleType: 'Scooter',
      vehicleNumber: 'MH-14-CZ-7821',
      drivingLicense: 'DL-MH14-202301984',
      governmentId: 'AADHAAR-XXXX-XXXX-4411',
      serviceArea: 'Kothrud & Karve Nagar',
      verificationStatus: 'PENDING',
      availability: {
        isOnline: false,
        isBusy: false,
        activeOrderId: null
      },
      currentLocation: { lat: 18.5074, lng: 73.8077, lastUpdated: new Date() },
      earnings: { today: 0, total: 0, pending: 0 },
      rating: 5.0,
      totalReviews: 0,
      ordersCompleted: 0
    });

    // 4. Seed Categories
    for (const cat of categories) {
      await Category.create(cat);
    }

    // 5. Seed Products (100+)
    const createdProducts = [];
    for (const prod of products) {
      const p = await Product.create(prod);
      createdProducts.push(p);
    }

    // 6. Seed Sample Orders
    // Order 1: Out for Delivery (Live Tracking Demo)
    const sampleItems1 = [
      {
        productId: String(createdProducts[0]._id),
        name: createdProducts[0].name,
        brand: createdProducts[0].brand,
        price: createdProducts[0].price,
        mrp: createdProducts[0].mrp,
        quantity: 1,
        unit: createdProducts[0].quantity,
        image: createdProducts[0].images[0]
      },
      {
        productId: String(createdProducts[10]._id),
        name: createdProducts[10].name,
        brand: createdProducts[10].brand,
        price: createdProducts[10].price,
        mrp: createdProducts[10].mrp,
        quantity: 2,
        unit: createdProducts[10].quantity,
        image: createdProducts[10].images[0]
      },
      {
        productId: String(createdProducts[20]._id),
        name: createdProducts[20].name,
        brand: createdProducts[20].brand,
        price: createdProducts[20].price,
        mrp: createdProducts[20].mrp,
        quantity: 1,
        unit: createdProducts[20].quantity,
        image: createdProducts[20].images[0]
      }
    ];

    const subtotal1 = sampleItems1.reduce((acc, i) => acc + i.price * i.quantity, 0);
    const order1 = await Order.create({
      orderId: 'MWU-20261002-10482',
      customer: {
        userId: String(customerUser._id),
        name: customerUser.name,
        email: customerUser.email,
        phone: customerUser.phone
      },
      products: sampleItems1,
      address: customerUser.addresses[0],
      subtotal: subtotal1,
      discount: 40,
      deliveryFee: 0, // Free delivery above 500
      tax: 15,
      total: subtotal1 - 40 + 15,
      paymentMethod: 'UPI',
      paymentStatus: 'PAID',
      paymentDetails: {
        transactionId: 'UPI_TXN_98723491283',
        paymentGateway: 'MockPaymentProvider',
        paidAt: new Date(Date.now() - 25 * 60 * 1000)
      },
      orderStatus: 'OUT_FOR_DELIVERY',
      deliveryType: 'STANDARD',
      scheduledSlot: 'Today, 25-35 mins',
      store: stores[0],
      deliveryAgent: {
        agentId: String(agentProfile._id),
        name: agentProfile.fullName,
        phone: agentProfile.phone,
        profilePhoto: agentProfile.profilePhoto,
        vehicleType: agentProfile.vehicleType,
        vehicleNumber: agentProfile.vehicleNumber,
        rating: 4.8
      },
      deliveryDistanceKm: 3.4,
      agentPayout: 55,
      liveLocation: {
        lat: 18.5620,
        lng: 73.7840,
        heading: 45,
        lastUpdated: new Date()
      },
      timeline: [
        {
          status: 'PREPARING',
          title: 'Order Placed & Confirmed',
          time: new Date(Date.now() - 22 * 60 * 1000),
          note: 'Your order was received and payment verified.'
        },
        {
          status: 'PACKED',
          title: 'Order Packed at Baner Hub',
          time: new Date(Date.now() - 15 * 60 * 1000),
          note: 'Store manager has packed all fresh items.'
        },
        {
          status: 'ASSIGNED',
          title: 'Delivery Partner Assigned',
          time: new Date(Date.now() - 10 * 60 * 1000),
          note: 'Rahul K. Verma accepted your delivery.'
        },
        {
          status: 'OUT_FOR_DELIVERY',
          title: 'Out for Delivery',
          time: new Date(Date.now() - 4 * 60 * 1000),
          note: 'Agent has picked up your package and is on the way.'
        }
      ]
    });

    // Update agent's active order to order1
    await DeliveryAgent.findByIdAndUpdate(agentProfile._id, {
      'availability.isBusy': true,
      'availability.activeOrderId': order1.orderId
    });

    // Order 2: Delivered historical order
    const sampleItems2 = [
      {
        productId: String(createdProducts[1]._id),
        name: createdProducts[1].name,
        brand: createdProducts[1].brand,
        price: createdProducts[1].price,
        quantity: 1,
        unit: createdProducts[1].quantity,
        image: createdProducts[1].images[0]
      }
    ];

    await Order.create({
      orderId: 'MWU-20260929-08241',
      customer: {
        userId: String(customerUser._id),
        name: customerUser.name,
        email: customerUser.email,
        phone: customerUser.phone
      },
      products: sampleItems2,
      address: customerUser.addresses[0],
      subtotal: 419,
      discount: 20,
      deliveryFee: 29,
      tax: 10,
      total: 438,
      paymentMethod: 'Credit Card',
      paymentStatus: 'PAID',
      orderStatus: 'DELIVERED',
      store: stores[0],
      deliveryAgent: {
        agentId: String(agentProfile._id),
        name: agentProfile.fullName,
        phone: agentProfile.phone,
        vehicleType: agentProfile.vehicleType,
        vehicleNumber: agentProfile.vehicleNumber,
        rating: 4.8
      },
      rating: {
        stars: 5,
        feedback: 'Super fast delivery and fresh packaging!',
        ratedAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000)
      },
      createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000)
    });

    console.log(`✅ Seed Completed:`);
    console.log(`   - 3 Users (Customer, Delivery, Admin)`);
    console.log(`   - 2 Delivery Agents`);
    console.log(`   - 3 Stores`);
    console.log(`   - 8 Categories`);
    console.log(`   - ${createdProducts.length} Products`);
    console.log(`   - 2 Demo Orders (1 Out for delivery, 1 Delivered)`);
  } catch (error) {
    console.error('❌ Error in seedDatabase:', error);
  }
}

if (require.main === module) {
  seedDatabase(true).then(() => {
    process.exit(0);
  });
}

module.exports = { seedDatabase };
