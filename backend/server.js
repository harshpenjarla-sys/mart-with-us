const http = require('http');
const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const dotenv = require('dotenv');
const { Server } = require('socket.io');

dotenv.config();

const { connectDB } = require('./config/db');
const { initSocket } = require('./socket/socketHandler');
const { notFound, errorHandler } = require('./middleware/errorMiddleware');
const { seedDatabase } = require('./seed/seeder');

// Routes
const authRoutes = require('./routes/authRoutes');
const productRoutes = require('./routes/productRoutes');
const orderRoutes = require('./routes/orderRoutes');
const deliveryRoutes = require('./routes/deliveryRoutes');
const adminRoutes = require('./routes/adminRoutes');

const app = express();
const server = http.createServer(app);

// Initialize Socket.io
const io = new Server(server, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST', 'PUT', 'DELETE']
  }
});
initSocket(io);

// Core Middlewares
app.use(cors({ origin: '*' }));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));
if (process.env.NODE_ENV !== 'test') {
  app.use(morgan('dev'));
}

// Health Check API
app.get('/api/health', (req, res) => {
  res.json({
    status: 'healthy',
    platform: 'MART WITH US API',
    tagline: 'Your Everyday Needs, Delivered.',
    timestamp: new Date().toISOString(),
    demoAccounts: {
      customer: { email: 'customer@martwithus.com', role: 'customer' },
      delivery: { email: 'delivery@martwithus.com', role: 'delivery' },
      admin: { email: 'admin@martwithus.com', role: 'admin' }
    }
  });
});

// Mount API Routes
app.use('/api/auth', authRoutes);
app.use('/api/products', productRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/delivery', deliveryRoutes);
app.use('/api/admin', adminRoutes);

// Serve Frontend Static Build
const fs = require('fs');
const path = require('path');
const frontendDist = path.join(__dirname, '..', 'frontend', 'dist');
if (fs.existsSync(frontendDist)) {
  app.use(express.static(frontendDist));
  app.get('*', (req, res, next) => {
    if (req.path.startsWith('/api') || req.path.startsWith('/socket.io')) {
      return next();
    }
    res.sendFile(path.join(frontendDist, 'index.html'));
  });
}

// Error Handling Middlewares
app.use(notFound);
app.use(errorHandler);

const PORT = process.env.PORT || 5000;

// Connect DB & Launch Server
const startServer = async () => {
  await connectDB();
  // Ensure database has initial data
  await seedDatabase(false);

  server.listen(PORT, () => {
    console.log(`🛒 MART WITH US Server running at http://localhost:${PORT}`);
    console.log(`   - Environment: ${process.env.NODE_ENV || 'development'}`);
    console.log(`   - Customer Portal: http://localhost:5173`);
    console.log(`   - Delivery Portal: http://localhost:5173/delivery/dashboard`);
    console.log(`   - Admin Portal:    http://localhost:5173/admin/dashboard`);
  });
};

startServer();
