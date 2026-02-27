const express = require('express');
const router = express.Router();
const smsController = require('../controllers/smsController');
const { auth } = require('../middleware/auth');
const { body } = require('express-validator');

// Send OTP
router.post('/send-otp', [
  body('phoneNumber')
    .notEmpty()
    .withMessage('Phone number is required')
    .isMobilePhone('any')
    .withMessage('Invalid phone number format'),
  body('name')
    .optional()
    .isString()
    .withMessage('Name must be a string')
    .isLength({ max: 50 })
    .withMessage('Name must be less than 50 characters')
], smsController.sendOTP);

// Verify OTP
router.post('/verify-otp', [
  body('phoneNumber')
    .notEmpty()
    .withMessage('Phone number is required')
    .isMobilePhone('any')
    .withMessage('Invalid phone number format'),
  body('otp')
    .notEmpty()
    .withMessage('OTP is required')
    .isLength({ min: 6, max: 6 })
    .withMessage('OTP must be 6 digits')
    .isNumeric()
    .withMessage('OTP must contain only numbers')
], smsController.verifyOTP);

// Send order update SMS (protected)
router.post('/order-update', [
  auth,
  body('phoneNumber')
    .notEmpty()
    .withMessage('Phone number is required')
    .isMobilePhone('any')
    .withMessage('Invalid phone number format'),
  body('orderData')
    .notEmpty()
    .withMessage('Order data is required')
    .isObject()
    .withMessage('Order data must be an object'),
  body('status')
    .notEmpty()
    .withMessage('Order status is required')
    .isIn(['confirmed', 'processing', 'shipped', 'delivered', 'cancelled', 'returned'])
    .withMessage('Invalid order status'),
  body('customerName')
    .optional()
    .isString()
    .withMessage('Customer name must be a string')
    .isLength({ max: 50 })
    .withMessage('Customer name must be less than 50 characters')
], smsController.sendOrderUpdate);

// Send payment confirmation SMS (protected)
router.post('/payment-confirmation', [
  auth,
  body('phoneNumber')
    .notEmpty()
    .withMessage('Phone number is required')
    .isMobilePhone('any')
    .withMessage('Invalid phone number format'),
  body('paymentData')
    .notEmpty()
    .withMessage('Payment data is required')
    .isObject()
    .withMessage('Payment data must be an object'),
  body('customerName')
    .optional()
    .isString()
    .withMessage('Customer name must be a string')
    .isLength({ max: 50 })
    .withMessage('Customer name must be less than 50 characters')
], smsController.sendPaymentConfirmation);

// Send delivery update SMS (protected)
router.post('/delivery-update', [
  auth,
  body('phoneNumber')
    .notEmpty()
    .withMessage('Phone number is required')
    .isMobilePhone('any')
    .withMessage('Invalid phone number format'),
  body('orderData')
    .notEmpty()
    .withMessage('Order data is required')
    .isObject()
    .withMessage('Order data must be an object'),
  body('deliveryStatus')
    .notEmpty()
    .withMessage('Delivery status is required')
    .isIn(['picked_up', 'in_transit', 'out_for_delivery', 'delivered', 'failed', 'rescheduled'])
    .withMessage('Invalid delivery status'),
  body('customerName')
    .optional()
    .isString()
    .withMessage('Customer name must be a string')
    .isLength({ max: 50 })
    .withMessage('Customer name must be less than 50 characters')
], smsController.sendDeliveryUpdate);

// Send promotional SMS (protected - admin only)
router.post('/promotional', [
  auth,
  body('phoneNumbers')
    .isArray()
    .withMessage('Phone numbers must be an array')
    .custom((value) => {
      if (!Array.isArray(value) || value.length === 0) {
        throw new Error('At least one phone number is required');
      }
      if (value.length > 100) {
        throw new Error('Cannot send more than 100 SMS at once');
      }
      return true;
    }),
  body('message')
    .notEmpty()
    .withMessage('Message is required')
    .isString()
    .withMessage('Message must be a string')
    .isLength({ min: 1, max: 160 })
    .withMessage('Message must be between 1 and 160 characters'),
  body('campaignName')
    .optional()
    .isString()
    .withMessage('Campaign name must be a string')
    .isLength({ max: 100 })
    .withMessage('Campaign name must be less than 100 characters')
], smsController.sendPromotionalSMS);

// Get SMS delivery status (protected)
router.get('/delivery-status/:messageId', [
  auth,
], smsController.getDeliveryStatus);

module.exports = router;
