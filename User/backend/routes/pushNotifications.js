const express = require('express');
const router = express.Router();
const pushNotificationController = require('../controllers/pushNotificationController');
const { auth } = require('../middleware/auth');
const { body } = require('express-validator');

// Send push notification to single device
router.post('/send-to-device', [
  auth,
  body('deviceToken')
    .notEmpty()
    .withMessage('Device token is required')
    .isString()
    .withMessage('Device token must be a string')
    .isLength({ min: 100 })
    .withMessage('Device token must be at least 100 characters'),
  body('notification.title')
    .notEmpty()
    .withMessage('Notification title is required')
    .isString()
    .withMessage('Notification title must be a string')
    .isLength({ max: 100 })
    .withMessage('Notification title must be less than 100 characters'),
  body('notification.body')
    .notEmpty()
    .withMessage('Notification body is required')
    .isString()
    .withMessage('Notification body must be a string')
    .isLength({ max: 500 })
    .withMessage('Notification body must be less than 500 characters'),
  body('data')
    .optional()
    .isObject()
    .withMessage('Data must be an object')
], pushNotificationController.sendToDevice);

// Send push notification to multiple devices
router.post('/send-to-multiple-devices', [
  auth,
  body('deviceTokens')
    .isArray()
    .withMessage('Device tokens must be an array')
    .custom((value) => {
      if (!Array.isArray(value) || value.length === 0) {
        throw new Error('At least one device token is required');
      }
      if (value.length > 1000) {
        throw new Error('Cannot send to more than 1000 devices at once');
      }
      return true;
    }),
  body('notification.title')
    .notEmpty()
    .withMessage('Notification title is required')
    .isString()
    .withMessage('Notification title must be a string')
    .isLength({ max: 100 })
    .withMessage('Notification title must be less than 100 characters'),
  body('notification.body')
    .notEmpty()
    .withMessage('Notification body is required')
    .isString()
    .withMessage('Notification body must be a string')
    .isLength({ max: 500 })
    .withMessage('Notification body must be less than 500 characters'),
  body('data')
    .optional()
    .isObject()
    .withMessage('Data must be an object')
], pushNotificationController.sendToMultipleDevices);

// Send order update notification
router.post('/order-update', [
  auth,
  body('deviceToken')
    .notEmpty()
    .withMessage('Device token is required')
    .isString()
    .withMessage('Device token must be a string')
    .isLength({ min: 100 })
    .withMessage('Device token must be at least 100 characters'),
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
], pushNotificationController.sendOrderUpdate);

// Send payment confirmation notification
router.post('/payment-confirmation', [
  auth,
  body('deviceToken')
    .notEmpty()
    .withMessage('Device token is required')
    .isString()
    .withMessage('Device token must be a string')
    .isLength({ min: 100 })
    .withMessage('Device token must be at least 100 characters'),
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
], pushNotificationController.sendPaymentConfirmation);

// Send delivery update notification
router.post('/delivery-update', [
  auth,
  body('deviceToken')
    .notEmpty()
    .withMessage('Device token is required')
    .isString()
    .withMessage('Device token must be a string')
    .isLength({ min: 100 })
    .withMessage('Device token must be at least 100 characters'),
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
], pushNotificationController.sendDeliveryUpdate);

// Send promotional notification
router.post('/promotional', [
  auth,
  body('deviceTokens')
    .isArray()
    .withMessage('Device tokens must be an array')
    .custom((value) => {
      if (!Array.isArray(value) || value.length === 0) {
        throw new Error('At least one device token is required');
      }
      if (value.length > 1000) {
        throw new Error('Cannot send to more than 1000 devices at once');
      }
      return true;
    }),
  body('title')
    .notEmpty()
    .withMessage('Title is required')
    .isString()
    .withMessage('Title must be a string')
    .isLength({ max: 100 })
    .withMessage('Title must be less than 100 characters'),
  body('message')
    .notEmpty()
    .withMessage('Message is required')
    .isString()
    .withMessage('Message must be a string')
    .isLength({ max: 500 })
    .withMessage('Message must be less than 500 characters'),
  body('data')
    .optional()
    .isObject()
    .withMessage('Data must be an object')
], pushNotificationController.sendPromotionalNotification);

// Subscribe device to topic
router.post('/subscribe-to-topic', [
  auth,
  body('deviceToken')
    .notEmpty()
    .withMessage('Device token is required')
    .isString()
    .withMessage('Device token must be a string')
    .isLength({ min: 100 })
    .withMessage('Device token must be at least 100 characters'),
  body('topic')
    .notEmpty()
    .withMessage('Topic is required')
    .isString()
    .withMessage('Topic must be a string')
    .matches(/^[a-zA-Z0-9_-]+$/)
    .withMessage('Topic can only contain letters, numbers, hyphens and underscores')
], pushNotificationController.subscribeToTopic);

// Send notification to topic
router.post('/send-to-topic', [
  auth,
  body('topic')
    .notEmpty()
    .withMessage('Topic is required')
    .isString()
    .withMessage('Topic must be a string')
    .matches(/^[a-zA-Z0-9_-]+$/)
    .withMessage('Topic can only contain letters, numbers, hyphens and underscores'),
  body('notification.title')
    .notEmpty()
    .withMessage('Notification title is required')
    .isString()
    .withMessage('Notification title must be a string')
    .isLength({ max: 100 })
    .withMessage('Notification title must be less than 100 characters'),
  body('notification.body')
    .notEmpty()
    .withMessage('Notification body is required')
    .isString()
    .withMessage('Notification body must be a string')
    .isLength({ max: 500 })
    .withMessage('Notification body must be less than 500 characters'),
  body('data')
    .optional()
    .isObject()
    .withMessage('Data must be an object')
], pushNotificationController.sendToTopic);

module.exports = router;
