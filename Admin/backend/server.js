const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const compression = require('compression');
const rateLimit = require('express-rate-limit');
const mongoSanitize = require('express-mongo-sanitize');
const path = require('path');
require('dotenv').config();

// Import database connection
const { connectDatabase } = require('./config/database');

// Import models to ensure registration
const { Product, Category, Order, User, Cart, Banner, Service, ServiceCategory, Address, Notification, PaymentMethod, VendorProduct, SupportTicket, DeliveryBoy } = require('./models');

// Import routes
const authRoutes = require('./routes/auth');
const productRoutes = require('./routes/products');
const cartRoutes = require('./routes/cart');
const categoriesRoutes = require('./routes/categories');
const bannersRoutes = require('./routes/banners');
const servicesRoutes = require('./routes/services');
const serviceCategoriesRoutes = require('./routes/service-categories');
const wishlistRoutes = require('./routes/wishlist');
const orderRoutes = require('./routes/orders');
const notificationRoutes = require('./routes/notifications');
const reviewRoutes = require('./routes/customerReviews');
const paymentMethodRoutes = require('./routes/paymentMethods');
const adminSettingsRoutes = require('./routes/adminSettings');
const systemSettingsRoutes = require('./routes/systemSettings');
const analyticsRoutes = require('./routes/analytics');
const vendorProductRoutes = require('./routes/vendorProducts');
const vendorRoutes = require('./routes/vendors');
const supportTicketRoutes = require('./routes/supportTickets');
const supportDashboardRoutes = require('./routes/supportDashboard');
const clearanceSaleRoutes = require('./routes/clearanceSale');
const deliveryMenRoutes = require('./routes/deliveryMen');
const deliveryOrderRoutes = require('./routes/deliveryOrders');

const app = express();

// Connect to MongoDB
connectDatabase();

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
      'http://192.168.1.64:3000',  // User frontend IP
      'http://192.168.1.64:3001',  // User frontend IP
      'http://192.168.1.64:3002',  // User backend IP
      'https://apnadecoration.com',   // Production domain
      'https://www.apnadecoration.com',   // Production domain with www
      'https://admin.apnadecoration.com',
      'https://vendor.apnadecoration.com',
      'https://delivery.apnadecoration.com'  // Delivery frontend
    ];
    
    if (allowedOrigins.indexOf(origin) !== -1 || !origin) {
      callback(null, true);
    } else {
      console.log('CORS blocked origin:', origin);
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
  exposedHeaders: ['Content-Length', 'X-Requested-With']
}));

// Remove additional CORS middleware to avoid conflicts

// Security middleware - temporarily disabled to debug CORS issues
// app.use(helmet({
//   contentSecurityPolicy: {
//     directives: {
//       defaultSrc: ["'self'"],
//       imgSrc: ["'self'", "data:", "blob:", "http://localhost:5000", "https://localhost:5000"],
//       connectSrc: ["'self'", "http://localhost:5000", "https://localhost:5000"],
//       fontSrc: ["'self'"],
//       styleSrc: ["'self'", "'unsafe-inline'"],
//       scriptSrc: ["'self'"],
//       objectSrc: ["'none'"],
//       mediaSrc: ["'self'"],
//       frameSrc: ["'none'"],
//     },
//   },
// }));
app.use(mongoSanitize());

// Body parser middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 1000 // limit each IP to 1000 requests per windowMs (increased for development)
});
app.use('/api/', limiter);

// Serve static files (uploads) after CORS middleware
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));
app.use('/api/uploads', express.static(path.join(__dirname, 'uploads')));

// Add CORS headers specifically for static files
app.use('/uploads', (req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET');
  res.header('Access-Control-Allow-Headers', 'Content-Type');
  next();
});

app.use('/api/uploads', (req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET');
  res.header('Access-Control-Allow-Headers', 'Content-Type');
  next();
});

// Request logging middleware (BEFORE routes)
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
  next();
});

const homePageServiceCategoriesRoutes = require('./routes/homePageServiceCategories');

// API Routes - Start with essential routes only
app.use('/api/auth', authRoutes);
app.use('/api/products', productRoutes);
app.use('/api/cart', cartRoutes);
app.use('/api/categories', categoriesRoutes);
app.use('/api/banners', bannersRoutes);
app.use('/api/services', servicesRoutes);
app.use('/api/bookings', require('./routes/bookings'));
app.use('/api/coupons', require('./routes/coupons'));
app.use('/api/pos', require('./routes/pos'));
app.use('/api/service-categories', serviceCategoriesRoutes);
app.use('/api/home-page-service-categories', homePageServiceCategoriesRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/contact', require('./routes/contact'));

// Enable only essential routes that are causing 404 errors
app.use('/api/analytics', analyticsRoutes);
app.use('/api/attributes', require('./routes/attributes'));

// Vendor management routes
app.use('/api/vendor/auth', require('./routes/vendorAuth'));
app.use('/api/vendor-products', vendorProductRoutes);
app.use('/api/vendors', vendorRoutes);
app.use('/api/vendor-orders', require('./routes/vendorOrders'));

// Delivery management routes
app.use('/api/deliverymen', require('./routes/deliveryMen'));
app.use('/api/delivery-boy', require('./routes/deliveryBoy'));
app.use('/api/delivery-emergency-contact', require('./routes/deliveryEmergencyContact'));
app.use('/api/delivery-withdraw', require('./routes/deliveryWithdraw'));

// Delivery Boy routes
app.use('/api/delivery-men', deliveryMenRoutes);
app.use('/api/delivery-orders', deliveryOrderRoutes);

// Clearance Sale routes
app.use('/api/clearance-sale', require('./routes/clearanceSale'));

// Support ticket routes
app.use('/api/support-tickets', supportTicketRoutes);
app.use('/api/support-dashboard', supportDashboardRoutes);

// Reports routes
app.use('/api/reports/earning-reports', require('./routes/transactionReport'));
app.use('/api/reports', require('./routes/vendorReports'));
app.use('/api/inhouse-sales', require('./routes/inhouseSales'));
app.use('/api/reports/inhouse-sales', require('./routes/inhouseSales'));
app.use('/api/reports/vendor-sales', require('./routes/vendorSales'));
app.use('/api/product-report', require('./routes/productReport'));

// Admin Earnings routes
app.use('/api/admin-earnings', require('./routes/adminEarnings'));

// Customer management routes
app.use('/api/customers', require('./routes/customers'));
app.use('/api/customer-reviews', require('./routes/customerReviews'));
app.use('/api/reviews', require('./routes/reviews'));

// Notification routes
app.use('/api/notifications', notificationRoutes);

// Admin settings routes
app.use('/api/admin-settings', adminSettingsRoutes);

// Payment methods routes
app.use('/api/payment-methods', paymentMethodRoutes);

// System settings routes
app.use('/api/system-settings', systemSettingsRoutes);

// Currency routes
app.use('/api/currencies', require('./routes/currencies'));

// Wallet and loyalty routes
app.use('/api/wallet', require('./routes/wallet'));
app.use('/api/wallet-bonus', require('./routes/walletBonus'));
app.use('/api/loyalty-points', require('./routes/loyaltyPoints'));

// Withdraw routes
app.use('/api/withdraws', require('./routes/withdraw'));
app.use('/api/withdraw-methods', require('./routes/withdrawMethods'));

// Other routes
app.use('/api/inhouse-sales/categories', require('./routes/inhouseSales')); // Use inhouseSales route for categories
app.use('/api/transaction-report', require('./routes/transactionReport'));

// Missing routes that frontend is requesting
app.use('/api/policy-content', require('./routes/policyContent'));
app.use('/api/social-media', require('./routes/socialMedia'));
app.use('/api/file-manager', require('./routes/fileManager'));
app.use('/api/vendor-registration', require('./routes/vendorRegistration'));

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
    message: 'Admin API is running',
    status: 'OK',
    timestamp: new Date().toISOString(),
    endpoints: {
      health: '/health',
      auth: '/api/auth',
      vendors: '/api/vendors',
      'vendor-products': '/api/vendor-products',
      analytics: '/api/analytics',
      delivery: '/api/delivery-boy'
    }
  });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Server error:', err);
  res.status(500).json({
    success: false,
    message: 'Internal server error',
    error: err.message
  });
});

// Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, '0.0.0.0', () => {
  console.log(`Admin Server running on port ${PORT}`);
  console.log('Environment:', process.env.NODE_ENV || 'development');
});

module.exports = app;
