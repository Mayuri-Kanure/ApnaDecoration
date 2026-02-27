const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const compression = require('compression');
const rateLimit = require('express-rate-limit');
const mongoSanitize = require('express-mongo-sanitize');
const path = require('path');
require('dotenv').config();

// Import database connection
const connectDB = require('./config/database');

// Import models to ensure registration
const { Product, Category, Order, User, Cart, Banner, Service, ServiceCategory, Address, Notification, PaymentMethod, VendorProduct, Wishlist } = require('./models');
const CustomerReview = require('./models/CustomerReview');

// Import routes
const authRoutes = require('./routes/auth');
const vendorAuthRoutes = require('./routes/vendorAuth');
const productRoutes = require('./routes/products');
const vendorProductRoutes = require('./routes/vendorProducts');
const cartRoutes = require('./routes/cart');
const categoriesRoutes = require('./routes/categories');
const bannersRoutes = require('./routes/banners');
const servicesRoutes = require('./routes/services');
const serviceCategoryRoutes = require('./routes/serviceCategories');
const homePageServiceCategoriesRoutes = require('./routes/homePageServiceCategories');
const addressRoutes = require('./routes/addresses');
const wishlistRoutes = require('./routes/wishlist');
const orderRoutes = require('./routes/orders');
const notificationRoutes = require('./routes/notifications');
const reviewRoutes = require('./routes/reviews');
const paymentMethodRoutes = require('./routes/payment-methods');
const paymentRoutes = require('./routes/payments');
const transactionRoutes = require('./routes/transactions');
const smsRoutes = require('./routes/sms');
const pushNotificationRoutes = require('./routes/pushNotifications');
const deliveryTrackingRoutes = require('./routes/deliveryTracking');
const deliveryBoysRoutes = require('./routes/deliveryBoys');
const contactRoutes = require('./routes/contact');
const monitoringRoutes = require('./routes/monitoring');
const performanceRoutes = require('./routes/performance');

const app = express();

// Connect to MongoDB
connectDB();

// CORS configuration - Apply FIRST before all other middleware
app.use(cors({
  origin: function (origin, callback) {
    // Allow requests with no origin (like mobile apps or curl requests)
    if (!origin) return callback(null, true);
    
    // List of allowed origins
    const allowedOrigins = [
      'http://localhost:3000', 
      'http://localhost:3001', 
      'http://localhost:3002', 
      'http://localhost:3003',
      'http://localhost',
      'https://localhost',
      'http://10.0.2.2',
      'https://10.0.2.2',
      'http://192.168.1.64:3000',
      'https://192.168.1.64:3000',
      'http://192.168.1.64:3001',
      'https://192.168.1.64:3001',
      'http://192.168.1.64:3002',
      'https://192.168.1.64:3002',
      'capacitor://localhost',
      'ionic://localhost',
      'https://apnadecoration.com',
      'https://www.apnadecoration.com',
      'https://admin.apnadecoration.com',
      'https://vendor.apnadecoration.com',
      'https://delivery.apnadecoration.com'
    ];
    
    if (allowedOrigins.indexOf(origin) !== -1 || !origin) {
      callback(null, true);
    } else {
      console.log('CORS blocked origin:', origin);
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
  optionsSuccessStatus: 200
}));

// Security middleware
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'", "https:"],
      scriptSrc: ["'self'"],
      imgSrc: ["'self'", "data:", "http:", "https:"],
      connectSrc: ["'self'", "http:", "https:", "https://user-api.apnadecoration.com", "https://admin-api.apnadecoration.com"],
      fontSrc: ["'self'", "https:", "data:"],
      objectSrc: ["'none'"],
      mediaSrc: ["'self'"],
      frameSrc: ["'none'"],
    },
  },
  crossOriginResourcePolicy: { policy: "cross-origin" }
}));
app.use(mongoSanitize());

console.log(' Rate limiting DISABLED for development - No 429 errors should occur');

// Compression middleware
app.use(compression());

// Body parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Serve static files (uploaded images) with CORS
app.use('/uploads', (req, res, next) => {
  res.header('Access-Control-Allow-Origin', 'https://apnadecoration.com');
  res.header('Access-Control-Allow-Methods', 'GET, HEAD, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  res.header('Cross-Origin-Resource-Policy', 'cross-origin');
  res.header('Cross-Origin-Embedder-Policy', 'unsafe-none');
  res.header('Cross-Origin-Opener-Policy', 'same-origin');
  next();
}, express.static(path.join(__dirname, 'uploads'), {
  maxAge: '1d',
  etag: true,
  lastModified: true,
  setHeaders: (res, filePath) => {
    if (filePath.endsWith('.jpg') || filePath.endsWith('.jpeg')) {
      res.setHeader('Cache-Control', 'public, max-age=86400');
      res.setHeader('Content-Type', 'image/jpeg');
    } else if (filePath.endsWith('.png')) {
      res.setHeader('Cache-Control', 'public, max-age=86400');
      res.setHeader('Content-Type', 'image/png');
    } else if (filePath.endsWith('.webp')) {
      res.setHeader('Cache-Control', 'public, max-age=86400');
      res.setHeader('Content-Type', 'image/webp');
    } else if (filePath.endsWith('.avif')) {
      res.setHeader('Cache-Control', 'public, max-age=86400');
      res.setHeader('Content-Type', 'image/avif');
    }
    // Add cross-origin headers for all images
    res.setHeader('Access-Control-Allow-Origin', 'https://apnadecoration.com');
    res.setHeader('Cross-Origin-Resource-Policy', 'cross-origin');
  }
}));

// Request logging
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
  next();
});

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({
    status: 'OK',
    timestamp: new Date().toISOString(),
    uptime: process.uptime()
  });
});

// Root endpoint
app.get('/', (req, res) => {
  res.json({
    message: 'User API is running',
    status: 'OK',
    timestamp: new Date().toISOString(),
    endpoints: {
      health: '/health',
      auth: '/api/auth',
      banners: '/api/banners',
      categories: '/api/categories',
      services: '/api/services'
    }
  });
});

// API routes
app.use('/api/auth', authRoutes);
app.use('/api/vendor/auth', vendorAuthRoutes);
app.use('/api/products', productRoutes);
app.use('/api/vendor-products', vendorProductRoutes);
app.use('/api/cart', cartRoutes);
app.use('/api/service-categories', serviceCategoryRoutes);
app.use('/api/home-page-service-categories', homePageServiceCategoriesRoutes);
app.use('/api/categories', categoriesRoutes);
app.use('/api/banners', bannersRoutes);
app.use('/api/services', servicesRoutes);
app.use('/api/bookings', require('./routes/bookings'));
app.use('/api/coupons', require('./routes/coupons'));
app.use('/api/addresses', addressRoutes);
app.use('/api/wishlist', wishlistRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/reviews', reviewRoutes);
app.use('/api/payment-methods', paymentMethodRoutes);
app.use('/api/payments', paymentRoutes);
app.use('/api/transactions', transactionRoutes);
app.use('/api/sms', smsRoutes);
app.use('/api/push-notifications', pushNotificationRoutes);
app.use('/api/delivery-tracking', deliveryTrackingRoutes);
app.use('/api/delivery-boys', deliveryBoysRoutes);
app.use('/api/contact', contactRoutes);
app.use('/api/monitoring', monitoringRoutes);
app.use('/api/performance', performanceRoutes);

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({
    success: false,
    error: 'Route not found'
  });
});

// Global error handler
app.use((error, req, res, next) => {
  console.error('Global error handler:', error);

  // Mongoose validation errors
  if (error.name === 'ValidationError') {
    const errors = Object.values(error.errors).map(err => ({
      field: err.path,
      message: err.message
    }));
    
    return res.status(400).json({
      success: false,
      error: 'Validation failed',
      details: errors
    });
  }

  // Mongoose duplicate key errors
  if (error.code === 11000) {
    const field = Object.keys(error.keyValue)[0];
    return res.status(400).json({
      success: false,
      error: `${field} already exists`
    });
  }

  // JWT errors
  if (error.name === 'JsonWebTokenError' || error.name === 'TokenExpiredError') {
    return res.status(401).json({
      success: false,
      error: 'Authentication failed'
    });
  }

  // Default error
  res.status(error.status || 500).json({
    success: false,
    error: error.message || 'Internal server error'
  });
});

// Database connection and server start
const PORT = process.env.PORT || 5002;

const startServer = async () => {
  try {
    // Start server
    app.listen(PORT, '0.0.0.0', () => {
      console.log(`Server running on port ${PORT}`);
      console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
      console.log('MongoDB Connected:', process.env.MONGODB_URI ? 'Connected' : 'Not connected');
      console.log('Server accessible from emulator at: http://10.0.2.2:5002');
    });

  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
};

// Graceful shutdown
process.on('SIGTERM', async () => {
  console.log('SIGTERM received, shutting down gracefully...');
  
  try {
    const mongoose = require('mongoose');
    await mongoose.connection.close();
    console.log('Database connection closed.');
    process.exit(0);
  } catch (error) {
    console.error('Error during shutdown:', error);
    process.exit(1);
  }
});

process.on('SIGINT', async () => {
  console.log('SIGINT received, shutting down gracefully...');
  
  try {
    const mongoose = require('mongoose');
    await mongoose.connection.close();
    console.log('Database connection closed.');
    process.exit(0);
  } catch (error) {
    console.error('Error during shutdown:', error);
    process.exit(1);
  }
});

// Start the server
startServer();

module.exports = app;
