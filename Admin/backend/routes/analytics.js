const express = require('express');
const router = express.Router();
const analyticsController = require('../controllers/analyticsController');
const { auth, authorize } = require('../middleware/auth');

// Get dashboard statistics (public version for User app)
router.get('/dashboard/public', analyticsController.getPublicDashboardStats);

// Get dashboard statistics (authenticated)
router.get('/dashboard', auth, authorize('admin', 'manager'), analyticsController.getDashboardStats);

// Get revenue chart data
router.get('/revenue', auth, authorize('admin', 'manager'), analyticsController.getRevenueChart);

// Get order status chart data
router.get('/orders', auth, authorize('admin', 'manager'), analyticsController.getOrderStatusChart);

// Get top products
router.get('/top-products', auth, authorize('admin', 'manager'), analyticsController.getTopProducts);

// Get top customers
router.get('/top-customers', auth, authorize('admin', 'manager'), analyticsController.getTopCustomers);

// Additional analytics routes
router.get('/sales-chart', auth, authorize('admin', 'manager'), analyticsController.getSalesChart);
router.get('/revenue-by-category', auth, authorize('admin', 'manager'), analyticsController.getRevenueByCategory);

// Inhouse sales routes (for frontend compatibility)
router.get('/', auth, analyticsController.getInhouseSales);
router.get('/categories', auth, analyticsController.getInhouseCategories);

module.exports = router;
