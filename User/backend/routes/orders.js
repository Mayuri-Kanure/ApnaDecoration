const express = require('express');
const orderController = require('../controllers/orderController');
const { authMiddleware } = require('../middleware/auth');
const upload = require('../middlewares/upload'); // Import upload directly

const router = express.Router();

// All order routes require authentication
router.use(authMiddleware);

// Get user's orders
router.get('/', orderController.getOrders);

// Get single order
router.get('/:id', orderController.getOrderById);

// Create new order (temporarily disabled upload middleware for testing)
router.post('/', orderController.createOrder);

// Create service booking (with inline multer)
router.post('/booking', upload.single('referenceImage'), orderController.createServiceBooking);

// Cancel order
router.put('/:id/cancel', orderController.cancelOrder);

// Update order status
router.put('/:id/status', orderController.updateOrderStatus);

// Track order (public)
router.get('/track/:orderNumber', orderController.trackOrder);

module.exports = router;