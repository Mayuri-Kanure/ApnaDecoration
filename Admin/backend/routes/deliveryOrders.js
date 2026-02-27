const express = require('express');
const deliveryOrderController = require('../controllers/deliveryOrderController');
const { protectDeliveryBoy } = require('../middleware/deliveryAuth');

const router = express.Router();

// All routes are protected
router.use(protectDeliveryBoy);

// Order management routes
router.get('/available', deliveryOrderController.getAvailableOrders);
router.get('/my-orders', deliveryOrderController.getMyOrders);
router.get('/stats', deliveryOrderController.getOrderStats);
router.get('/:orderId', deliveryOrderController.getOrderDetails);

// Order action routes
router.post('/:orderId/accept', deliveryOrderController.acceptOrder);
router.post('/:orderId/reject', deliveryOrderController.rejectOrder);
router.post('/:orderId/start', deliveryOrderController.startDelivery);
router.post('/:orderId/complete', deliveryOrderController.completeDelivery);
router.put('/:orderId/location', deliveryOrderController.updateOrderLocation);

module.exports = router;
