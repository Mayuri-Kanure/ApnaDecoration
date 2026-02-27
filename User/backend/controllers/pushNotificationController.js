const pushNotificationService = require('../services/pushNotificationService');
const { validationResult } = require('express-validator');

// Send push notification to single device
exports.sendToDevice = async (req, res) => {
  try {
    console.log('📝 Send push notification to device request:', req.body);
    
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      console.log('❌ Validation errors:', errors.array());
      return res.status(400).json({ 
        success: false,
        message: 'Validation failed', 
        errors: errors.array() 
      });
    }

    const { deviceToken, notification, data } = req.body;

    // Validate device token
    const validatedToken = pushNotificationService.validateDeviceToken(deviceToken);

    // Send push notification
    const result = await pushNotificationService.sendToDevice(validatedToken, notification, data);
    
    const response = {
      success: true,
      message: 'Push notification sent successfully',
      deviceToken: validatedToken,
      notification: notification,
      data: data,
      result: result
    };

    console.log('✅ Push notification sent successfully:', response);
    res.status(200).json(response);
  } catch (error) {
    console.error('❌ Error sending push notification:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to send push notification'
    });
  }
};

// Send push notification to multiple devices
exports.sendToMultipleDevices = async (req, res) => {
  try {
    console.log('📝 Send push notification to multiple devices request:', req.body);
    
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      console.log('❌ Validation errors:', errors.array());
      return res.status(400).json({ 
        success: false,
        message: 'Validation failed', 
        errors: errors.array() 
      });
    }

    const { deviceTokens, notification, data } = req.body;

    // Validate device tokens
    const validatedTokens = deviceTokens.map(token => 
      pushNotificationService.validateDeviceToken(token)
    );

    // Send push notifications
    const result = await pushNotificationService.sendToMultipleDevices(validatedTokens, notification, data);
    
    const response = {
      success: true,
      message: 'Push notifications sent successfully',
      totalDevices: validatedTokens.length,
      totalSuccess: result.totalSuccess,
      totalFailed: result.totalFailed,
      notification: notification,
      data: data,
      result: result
    };

    console.log('✅ Push notifications sent successfully:', response);
    res.status(200).json(response);
  } catch (error) {
    console.error('❌ Error sending push notifications:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to send push notifications'
    });
  }
};

// Send order update notification
exports.sendOrderUpdate = async (req, res) => {
  try {
    console.log('📝 Send order update notification request:', req.body);
    
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      console.log('❌ Validation errors:', errors.array());
      return res.status(400).json({ 
        success: false,
        message: 'Validation failed', 
        errors: errors.array() 
      });
    }

    const { deviceToken, orderData, status, customerName } = req.body;

    // Validate device token
    const validatedToken = pushNotificationService.validateDeviceToken(deviceToken);

    // Send order update notification
    const result = await pushNotificationService.sendOrderUpdate(
      validatedToken, 
      orderData, 
      status, 
      customerName
    );
    
    const response = {
      success: true,
      message: 'Order update notification sent successfully',
      deviceToken: validatedToken,
      orderId: orderData._id || orderData.orderId,
      status: status,
      customerName: customerName,
      result: result
    };

    console.log('✅ Order update notification sent successfully:', response);
    res.status(200).json(response);
  } catch (error) {
    console.error('❌ Error sending order update notification:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to send order update notification'
    });
  }
};

// Send payment confirmation notification
exports.sendPaymentConfirmation = async (req, res) => {
  try {
    console.log('📝 Send payment confirmation notification request:', req.body);
    
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      console.log('❌ Validation errors:', errors.array());
      return res.status(400).json({ 
        success: false,
        message: 'Validation failed', 
        errors: errors.array() 
      });
    }

    const { deviceToken, paymentData, customerName } = req.body;

    // Validate device token
    const validatedToken = pushNotificationService.validateDeviceToken(deviceToken);

    // Send payment confirmation notification
    const result = await pushNotificationService.sendPaymentConfirmation(
      validatedToken, 
      paymentData, 
      customerName
    );
    
    const response = {
      success: true,
      message: 'Payment confirmation notification sent successfully',
      deviceToken: validatedToken,
      paymentId: paymentData._id || paymentData.transactionId,
      amount: paymentData.amount,
      customerName: customerName,
      result: result
    };

    console.log('✅ Payment confirmation notification sent successfully:', response);
    res.status(200).json(response);
  } catch (error) {
    console.error('❌ Error sending payment confirmation notification:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to send payment confirmation notification'
    });
  }
};

// Send delivery update notification
exports.sendDeliveryUpdate = async (req, res) => {
  try {
    console.log('📝 Send delivery update notification request:', req.body);
    
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      console.log('❌ Validation errors:', errors.array());
      return res.status(400).json({ 
        success: false,
        message: 'Validation failed', 
        errors: errors.array() 
      });
    }

    const { deviceToken, orderData, deliveryStatus, customerName } = req.body;

    // Validate device token
    const validatedToken = pushNotificationService.validateDeviceToken(deviceToken);

    // Send delivery update notification
    const result = await pushNotificationService.sendDeliveryUpdate(
      validatedToken, 
      orderData, 
      deliveryStatus, 
      customerName
    );
    
    const response = {
      success: true,
      message: 'Delivery update notification sent successfully',
      deviceToken: validatedToken,
      orderId: orderData._id || orderData.orderId,
      deliveryStatus: deliveryStatus,
      customerName: customerName,
      result: result
    };

    console.log('✅ Delivery update notification sent successfully:', response);
    res.status(200).json(response);
  } catch (error) {
    console.error('❌ Error sending delivery update notification:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to send delivery update notification'
    });
  }
};

// Send promotional notification
exports.sendPromotionalNotification = async (req, res) => {
  try {
    console.log('📝 Send promotional notification request:', req.body);
    
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      console.log('❌ Validation errors:', errors.array());
      return res.status(400).json({ 
        success: false,
        message: 'Validation failed', 
        errors: errors.array() 
      });
    }

    const { deviceTokens, title, message, data } = req.body;

    // Validate device tokens
    const validatedTokens = deviceTokens.map(token => 
      pushNotificationService.validateDeviceToken(token)
    );

    // Send promotional notification
    const result = await pushNotificationService.sendPromotionalNotification(
      validatedTokens, 
      title, 
      message, 
      data
    );
    
    const response = {
      success: true,
      message: 'Promotional notification sent successfully',
      totalDevices: validatedTokens.length,
      totalSuccess: result.totalSuccess,
      totalFailed: result.totalFailed,
      title: title,
      message: message,
      data: data,
      result: result
    };

    console.log('✅ Promotional notification sent successfully:', response);
    res.status(200).json(response);
  } catch (error) {
    console.error('❌ Error sending promotional notification:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to send promotional notification'
    });
  }
};

// Subscribe device to topic
exports.subscribeToTopic = async (req, res) => {
  try {
    console.log('📝 Subscribe device to topic request:', req.body);
    
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      console.log('❌ Validation errors:', errors.array());
      return res.status(400).json({ 
        success: false,
        message: 'Validation failed', 
        errors: errors.array() 
      });
    }

    const { deviceToken, topic } = req.body;

    // Validate device token
    const validatedToken = pushNotificationService.validateDeviceToken(deviceToken);

    // Subscribe device to topic
    const result = await pushNotificationService.subscribeToTopic(validatedToken, topic);
    
    const response = {
      success: true,
      message: 'Device subscribed to topic successfully',
      deviceToken: validatedToken,
      topic: topic,
      result: result
    };

    console.log('✅ Device subscribed to topic successfully:', response);
    res.status(200).json(response);
  } catch (error) {
    console.error('❌ Error subscribing device to topic:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to subscribe device to topic'
    });
  }
};

// Send notification to topic
exports.sendToTopic = async (req, res) => {
  try {
    console.log('📝 Send notification to topic request:', req.body);
    
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      console.log('❌ Validation errors:', errors.array());
      return res.status(400).json({ 
        success: false,
        message: 'Validation failed', 
        errors: errors.array() 
      });
    }

    const { topic, notification, data } = req.body;

    // Send notification to topic
    const result = await pushNotificationService.sendToTopic(topic, notification, data);
    
    const response = {
      success: true,
      message: 'Topic notification sent successfully',
      topic: topic,
      notification: notification,
      data: data,
      result: result
    };

    console.log('✅ Topic notification sent successfully:', response);
    res.status(200).json(response);
  } catch (error) {
    console.error('❌ Error sending topic notification:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to send topic notification'
    });
  }
};
