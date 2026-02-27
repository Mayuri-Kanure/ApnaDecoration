const smsService = require('../services/smsService');
const { validationResult } = require('express-validator');

// Send OTP
exports.sendOTP = async (req, res) => {
  try {
    console.log('📝 Send OTP request:', req.body);
    
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      console.log('❌ Validation errors:', errors.array());
      return res.status(400).json({ 
        success: false,
        message: 'Validation failed', 
        errors: errors.array() 
      });
    }

    const { phoneNumber, name } = req.body;

    // Generate 6-digit OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    
    // Validate and format phone number
    const formattedPhoneNumber = smsService.validatePhoneNumber(phoneNumber);

    // Send OTP SMS
    const smsResult = await smsService.sendOTP(formattedPhoneNumber, otp, name);
    
    // In a real application, you would store the OTP in Redis or database with expiry
    // For demo purposes, we'll return it in the response (REMOVE IN PRODUCTION)
    const response = {
      success: true,
      message: 'OTP sent successfully',
      phoneNumber: formattedPhoneNumber,
      // REMOVE IN PRODUCTION - Only for development testing
      ...(process.env.NODE_ENV === 'development' && { otp: otp }),
      smsDetails: smsResult
    };

    console.log('✅ OTP sent successfully:', response);
    res.status(200).json(response);
  } catch (error) {
    console.error('❌ Error sending OTP:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to send OTP'
    });
  }
};

// Verify OTP
exports.verifyOTP = async (req, res) => {
  try {
    console.log('📝 Verify OTP request:', req.body);
    
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      console.log('❌ Validation errors:', errors.array());
      return res.status(400).json({ 
        success: false,
        message: 'Validation failed', 
        errors: errors.array() 
      });
    }

    const { phoneNumber, otp } = req.body;

    // In a real application, you would verify the OTP against stored value
    // For demo purposes, we'll accept any 6-digit OTP (REMOVE IN PRODUCTION)
    const isValidOTP = otp && otp.length === 6 && /^\d+$/.test(otp);
    
    if (!isValidOTP) {
      return res.status(400).json({
        success: false,
        message: 'Invalid OTP format'
      });
    }

    // Mock verification - In production, check against stored OTP
    const isVerified = process.env.NODE_ENV === 'development' ? true : false;

    const response = {
      success: isVerified,
      message: isVerified ? 'OTP verified successfully' : 'Invalid OTP',
      phoneNumber: smsService.validatePhoneNumber(phoneNumber)
    };

    console.log('✅ OTP verification result:', response);
    res.status(200).json(response);
  } catch (error) {
    console.error('❌ Error verifying OTP:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to verify OTP'
    });
  }
};

// Send order update SMS
exports.sendOrderUpdate = async (req, res) => {
  try {
    console.log('📝 Send order update request:', req.body);
    
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      console.log('❌ Validation errors:', errors.array());
      return res.status(400).json({ 
        success: false,
        message: 'Validation failed', 
        errors: errors.array() 
      });
    }

    const { phoneNumber, orderData, status, customerName } = req.body;

    // Validate and format phone number
    const formattedPhoneNumber = smsService.validatePhoneNumber(phoneNumber);

    // Send order update SMS
    const smsResult = await smsService.sendOrderUpdate(
      formattedPhoneNumber, 
      orderData, 
      status, 
      customerName
    );
    
    const response = {
      success: true,
      message: 'Order update sent successfully',
      phoneNumber: formattedPhoneNumber,
      orderId: orderData._id || orderData.orderId,
      status: status,
      smsDetails: smsResult
    };

    console.log('✅ Order update SMS sent successfully:', response);
    res.status(200).json(response);
  } catch (error) {
    console.error('❌ Error sending order update:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to send order update'
    });
  }
};

// Send payment confirmation SMS
exports.sendPaymentConfirmation = async (req, res) => {
  try {
    console.log('📝 Send payment confirmation request:', req.body);
    
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      console.log('❌ Validation errors:', errors.array());
      return res.status(400).json({ 
        success: false,
        message: 'Validation failed', 
        errors: errors.array() 
      });
    }

    const { phoneNumber, paymentData, customerName } = req.body;

    // Validate and format phone number
    const formattedPhoneNumber = smsService.validatePhoneNumber(phoneNumber);

    // Send payment confirmation SMS
    const smsResult = await smsService.sendPaymentConfirmation(
      formattedPhoneNumber, 
      paymentData, 
      customerName
    );
    
    const response = {
      success: true,
      message: 'Payment confirmation sent successfully',
      phoneNumber: formattedPhoneNumber,
      paymentId: paymentData._id || paymentData.transactionId,
      amount: paymentData.amount,
      smsDetails: smsResult
    };

    console.log('✅ Payment confirmation SMS sent successfully:', response);
    res.status(200).json(response);
  } catch (error) {
    console.error('❌ Error sending payment confirmation:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to send payment confirmation'
    });
  }
};

// Send delivery update SMS
exports.sendDeliveryUpdate = async (req, res) => {
  try {
    console.log('📝 Send delivery update request:', req.body);
    
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      console.log('❌ Validation errors:', errors.array());
      return res.status(400).json({ 
        success: false,
        message: 'Validation failed', 
        errors: errors.array() 
      });
    }

    const { phoneNumber, orderData, deliveryStatus, customerName } = req.body;

    // Validate and format phone number
    const formattedPhoneNumber = smsService.validatePhoneNumber(phoneNumber);

    // Send delivery update SMS
    const smsResult = await smsService.sendDeliveryUpdate(
      formattedPhoneNumber, 
      orderData, 
      deliveryStatus, 
      customerName
    );
    
    const response = {
      success: true,
      message: 'Delivery update sent successfully',
      phoneNumber: formattedPhoneNumber,
      orderId: orderData._id || orderData.orderId,
      deliveryStatus: deliveryStatus,
      smsDetails: smsResult
    };

    console.log('✅ Delivery update SMS sent successfully:', response);
    res.status(200).json(response);
  } catch (error) {
    console.error('❌ Error sending delivery update:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to send delivery update'
    });
  }
};

// Send promotional SMS
exports.sendPromotionalSMS = async (req, res) => {
  try {
    console.log('📝 Send promotional SMS request:', req.body);
    
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      console.log('❌ Validation errors:', errors.array());
      return res.status(400).json({ 
        success: false,
        message: 'Validation failed', 
        errors: errors.array() 
      });
    }

    const { phoneNumbers, message, campaignName } = req.body;

    // Validate and format phone numbers
    const formattedPhoneNumbers = phoneNumbers.map(phone => 
      smsService.validatePhoneNumber(phone)
    );

    // Send promotional SMS
    const smsResult = await smsService.sendPromotionalSMS(
      formattedPhoneNumbers, 
      message, 
      campaignName
    );
    
    const response = {
      success: true,
      message: 'Promotional SMS campaign completed',
      campaignName: campaignName || 'Untitled Campaign',
      totalRecipients: phoneNumbers.length,
      totalSent: smsResult.totalSent,
      totalFailed: smsResult.totalFailed,
      results: smsResult.results
    };

    console.log('✅ Promotional SMS campaign completed:', response);
    res.status(200).json(response);
  } catch (error) {
    console.error('❌ Error sending promotional SMS:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to send promotional SMS'
    });
  }
};

// Get SMS delivery status
exports.getDeliveryStatus = async (req, res) => {
  try {
    console.log('📝 Get SMS delivery status request:', req.params);
    
    const { messageId } = req.params;

    if (!messageId) {
      return res.status(400).json({
        success: false,
        message: 'Message ID is required'
      });
    }

    // Get delivery status
    const statusResult = await smsService.getDeliveryStatus(messageId);
    
    const response = {
      success: true,
      message: 'Delivery status retrieved successfully',
      messageId: messageId,
      status: statusResult
    };

    console.log('✅ SMS delivery status retrieved:', response);
    res.status(200).json(response);
  } catch (error) {
    console.error('❌ Error getting SMS delivery status:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to get delivery status'
    });
  }
};
