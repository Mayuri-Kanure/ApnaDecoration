const express = require('express');
const adminController = require('../controllers/adminController');
const { authMiddleware, rbacMiddleware } = require('../middleware/auth');
const lowStockService = require('../services/lowStockService');
const inventoryMonitor = require('../services/inventoryMonitor');

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

// 📦 INVENTORY MONITORING ROUTES
// Get inventory status (dashboard)
router.get('/inventory/status', async (req, res) => {
  try {
    const status = await lowStockService.getInventoryStatus();
    res.json({
      success: true,
      data: status,
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      error: err.message,
    });
  }
});

// Get low stock items
router.get('/inventory/low-stock', async (req, res) => {
  try {
    const status = await lowStockService.getInventoryStatus();
    res.json({
      success: true,
      data: {
        lowStock: status.items.lowStock,
        criticalStock: status.items.criticalStock,
        count: status.lowStock + status.criticalStock,
      },
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      error: err.message,
    });
  }
});

// Manually trigger low stock scan
router.post('/inventory/scan-now', async (req, res) => {
  try {
    const results = await inventoryMonitor.runNow();
    res.json({
      success: true,
      message: `Scan completed. Found ${results.length} low stock items.`,
      data: results,
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      error: err.message,
    });
  }
});

module.exports = router;
