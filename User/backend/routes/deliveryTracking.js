const express = require('express');
const router = express.Router();
const deliveryTrackingController = require('../controllers/deliveryTrackingController');
const { auth } = require('../middleware/auth');
const { body } = require('express-validator');

// Create delivery tracking
router.post('/', [
  auth,
  body('orderId')
    .notEmpty()
    .withMessage('Order ID is required')
    .isMongoId()
    .withMessage('Invalid Order ID format'),
  body('customerId')
    .notEmpty()
    .withMessage('Customer ID is required')
    .isMongoId()
    .withMessage('Invalid Customer ID format'),
  body('deliveryAddress.street')
    .notEmpty()
    .withMessage('Street address is required'),
  body('deliveryAddress.city')
    .notEmpty()
    .withMessage('City is required'),
  body('deliveryAddress.state')
    .notEmpty()
    .withMessage('State is required'),
  body('deliveryAddress.pincode')
    .notEmpty()
    .withMessage('Pincode is required')
    .matches(/^\d{6}$/)
    .withMessage('Invalid pincode format'),
  body('contactPhone')
    .notEmpty()
    .withMessage('Contact phone is required')
    .isMobilePhone('any')
    .withMessage('Invalid phone number format'),
  body('contactEmail')
    .optional()
    .isEmail()
    .withMessage('Invalid email format'),
  body('priority')
    .optional()
    .isIn(['standard', 'express', 'urgent'])
    .withMessage('Invalid priority option'),
  body('deliveryFee')
    .optional()
    .isNumeric()
    .withMessage('Delivery fee must be a number'),
  body('deliveryInstructions')
    .optional()
    .isString()
    .withMessage('Delivery instructions must be a string')
    .isLength({ max: 500 })
    .withMessage('Delivery instructions must be less than 500 characters')
], deliveryTrackingController.createDeliveryTracking);

// Get tracking by tracking number
router.get('/number/:trackingNumber', deliveryTrackingController.getTrackingByNumber);

// Get tracking by order ID
router.get('/order/:orderId', deliveryTrackingController.getTrackingByOrderId);

// Get customer tracking
router.get('/customer', [
  auth
], deliveryTrackingController.getCustomerTracking);

// Update tracking status
router.put('/:id/status', [
  auth,
  body('status')
    .notEmpty()
    .withMessage('Status is required')
    .isIn(['pending', 'confirmed', 'picked_up', 'in_transit', 'out_for_delivery', 'delivered', 'failed', 'returned'])
    .withMessage('Invalid status option'),
  body('location')
    .optional()
    .isString()
    .withMessage('Location must be a string'),
  body('description')
    .optional()
    .isString()
    .withMessage('Description must be a string'),
  body('updatedBy')
    .optional()
    .isString()
    .withMessage('Updated by must be a string'),
  body('coordinates')
    .optional()
    .isObject()
    .withMessage('Coordinates must be an object')
], deliveryTrackingController.updateTrackingStatus);

// Assign delivery boy
router.put('/:id/assign-delivery-boy', [
  auth,
  body('deliveryBoyId')
    .notEmpty()
    .withMessage('Delivery boy ID is required')
    .isMongoId()
    .withMessage('Invalid Delivery boy ID format')
], deliveryTrackingController.assignDeliveryBoy);

// Get tracking statistics
router.get('/statistics', [
  auth
], deliveryTrackingController.getTrackingStatistics);

// Get tracking location
router.get('/:id/location', deliveryTrackingController.getTrackingLocation);

// Get active deliveries for delivery boy
router.get('/delivery-boy/:deliveryBoyId/active', deliveryTrackingController.getActiveDeliveries);

// Search tracking
router.get('/search', deliveryTrackingController.searchTracking);

module.exports = router;
