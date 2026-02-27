const express = require('express');
const adminController = require('../controllers/adminController');
const { authMiddleware, rbacMiddleware } = require('../middleware/auth');

const router = express.Router();

// Apply admin middleware to all routes
router.use(authMiddleware, rbacMiddleware.adminOnly);

// Dashboard statistics
router.get('/dashboard/stats', adminController.getDashboardStats);

// Orders management
router.get('/orders', adminController.getAllOrders);
router.put('/orders/:orderId/status', adminController.updateOrderStatus);

// Users management
router.get('/users', adminController.getAllUsers);

// Vendors management
router.get('/vendors', adminController.getAllVendors);
router.put('/vendors/:vendorId/status', adminController.updateVendorStatus);

// Analytics
router.get('/analytics/revenue', adminController.getRevenueAnalytics);

module.exports = router;
