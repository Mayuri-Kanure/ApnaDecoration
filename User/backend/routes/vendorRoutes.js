const express = require('express');
const { authMiddleware, rbacMiddleware } = require('../middleware/auth');
const vendorController = require('../controllers/vendorController');

const router = express.Router();

// Get vendor's assigned orders
router.get('/orders', 
  authMiddleware, 
  rbacMiddleware.vendorOnly, 
  vendorController.getVendorOrders
);

// Get order item details
router.get('/order-items/:orderItemId', 
  authMiddleware, 
  rbacMiddleware.vendorOnly, 
  vendorController.getOrderItemDetails
);

// Update order item status
router.put('/order-items/:orderItemId/status', 
  authMiddleware, 
  rbacMiddleware.vendorOnly, 
  vendorController.updateOrderItemStatus
);

// Get vendor availability
router.get('/availability', 
  authMiddleware, 
  rbacMiddleware.vendorOnly, 
  vendorController.getVendorAvailability
);

// Update vendor availability
router.put('/availability', 
  authMiddleware, 
  rbacMiddleware.vendorOnly, 
  vendorController.updateVendorAvailability
);

// Get setup schedules
router.get('/setup-schedules', 
  authMiddleware, 
  rbacMiddleware.vendorOnly, 
  vendorController.getSetupSchedules
);

// Update setup schedule
router.put('/setup-schedules/:scheduleId', 
  authMiddleware, 
  rbacMiddleware.vendorOnly, 
  vendorController.updateSetupSchedule
);

// Get vendor profile
router.get('/profile', 
  authMiddleware, 
  rbacMiddleware.vendorOnly, 
  vendorController.getVendorProfile
);

module.exports = router;
