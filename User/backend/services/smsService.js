const axios = require('axios');

class SMSService {
  constructor() {
    // SMS provider configuration (using a mock service for demo)
    this.provider = process.env.SMS_PROVIDER || 'twilio';
    this.apiKey = process.env.SMS_API_KEY || 'demo_key';
    this.apiSecret = process.env.SMS_API_SECRET || 'demo_secret';
    this.fromNumber = process.env.SMS_FROM_NUMBER || 'APNADEC';
    this.baseURL = process.env.SMS_BASE_URL || 'https://api.twilio.com/2010-04-01';
  }

  // Send OTP verification SMS
  async sendOTP(phoneNumber, otp, name = '') {
    try {
      console.log('🔧 Sending OTP SMS:', { phoneNumber, otp, name });

      // In production, this would integrate with real SMS providers like:
      // - Twilio
      // - AWS SNS
      // - Firebase Cloud Messaging
      // - MSG91
      // - Fast2SMS

      const message = this.generateOTPMessage(otp, name);
      
      // Mock SMS sending for development
      if (process.env.NODE_ENV === 'development') {
        console.log('📱 MOCK SMS - OTP:', {
          to: phoneNumber,
          from: this.fromNumber,
          message: message,
          otp: otp,
          timestamp: new Date().toISOString()
        });
        
        return {
          success: true,
          messageId: `MOCK_${Date.now()}`,
          provider: 'mock',
          message: 'OTP sent successfully (development mode)'
        };
      }

      // Real SMS integration would go here
      const response = await this.sendSMS(phoneNumber, message);
      
      console.log('✅ OTP SMS sent successfully:', response);
      return response;
    } catch (error) {
      console.error('❌ Error sending OTP SMS:', error);
      throw new Error(error.message || 'Failed to send OTP');
    }
  }

  // Send order status update SMS
  async sendOrderUpdate(phoneNumber, orderData, status, customerName = '') {
    try {
      console.log('🔧 Sending order update SMS:', { phoneNumber, orderId: orderData._id, status });

      const message = this.generateOrderUpdateMessage(orderData, status, customerName);
      
      // Mock SMS sending for development
      if (process.env.NODE_ENV === 'development') {
        console.log('📱 MOCK SMS - Order Update:', {
          to: phoneNumber,
          from: this.fromNumber,
          message: message,
          orderId: orderData._id,
          status: status,
          timestamp: new Date().toISOString()
        });
        
        return {
          success: true,
          messageId: `MOCK_${Date.now()}`,
          provider: 'mock',
          message: 'Order update sent successfully (development mode)'
        };
      }

      const response = await this.sendSMS(phoneNumber, message);
      
      console.log('✅ Order update SMS sent successfully:', response);
      return response;
    } catch (error) {
      console.error('❌ Error sending order update SMS:', error);
      throw new Error(error.message || 'Failed to send order update');
    }
  }

  // Send payment confirmation SMS
  async sendPaymentConfirmation(phoneNumber, paymentData, customerName = '') {
    try {
      console.log('🔧 Sending payment confirmation SMS:', { phoneNumber, paymentId: paymentData._id });

      const message = this.generatePaymentConfirmationMessage(paymentData, customerName);
      
      // Mock SMS sending for development
      if (process.env.NODE_ENV === 'development') {
        console.log('📱 MOCK SMS - Payment Confirmation:', {
          to: phoneNumber,
          from: this.fromNumber,
          message: message,
          paymentId: paymentData._id,
          amount: paymentData.amount,
          timestamp: new Date().toISOString()
        });
        
        return {
          success: true,
          messageId: `MOCK_${Date.now()}`,
          provider: 'mock',
          message: 'Payment confirmation sent successfully (development mode)'
        };
      }

      const response = await this.sendSMS(phoneNumber, message);
      
      console.log('✅ Payment confirmation SMS sent successfully:', response);
      return response;
    } catch (error) {
      console.error('❌ Error sending payment confirmation SMS:', error);
      throw new Error(error.message || 'Failed to send payment confirmation');
    }
  }

  // Send delivery update SMS
  async sendDeliveryUpdate(phoneNumber, orderData, deliveryStatus, customerName = '') {
    try {
      console.log('🔧 Sending delivery update SMS:', { phoneNumber, orderId: orderData._id, deliveryStatus });

      const message = this.generateDeliveryUpdateMessage(orderData, deliveryStatus, customerName);
      
      // Mock SMS sending for development
      if (process.env.NODE_ENV === 'development') {
        console.log('📱 MOCK SMS - Delivery Update:', {
          to: phoneNumber,
          from: this.fromNumber,
          message: message,
          orderId: orderData._id,
          deliveryStatus: deliveryStatus,
          timestamp: new Date().toISOString()
        });
        
        return {
          success: true,
          messageId: `MOCK_${Date.now()}`,
          provider: 'mock',
          message: 'Delivery update sent successfully (development mode)'
        };
      }

      const response = await this.sendSMS(phoneNumber, message);
      
      console.log('✅ Delivery update SMS sent successfully:', response);
      return response;
    } catch (error) {
      console.error('❌ Error sending delivery update SMS:', error);
      throw new Error(error.message || 'Failed to send delivery update');
    }
  }

  // Send promotional SMS
  async sendPromotionalSMS(phoneNumbers, message, campaignName = '') {
    try {
      console.log('🔧 Sending promotional SMS:', { phoneCount: phoneNumbers.length, campaignName });

      const results = [];
      
      for (const phoneNumber of phoneNumbers) {
        try {
          // Mock SMS sending for development
          if (process.env.NODE_ENV === 'development') {
            console.log('📱 MOCK SMS - Promotional:', {
              to: phoneNumber,
              from: this.fromNumber,
              message: message,
              campaignName: campaignName,
              timestamp: new Date().toISOString()
            });
            
            results.push({
              phoneNumber,
              success: true,
              messageId: `MOCK_${Date.now()}_${Math.random()}`
            });
          } else {
            const response = await this.sendSMS(phoneNumber, message);
            results.push({
              phoneNumber,
              success: true,
              messageId: response.messageId
            });
          }
        } catch (error) {
          console.error(`❌ Failed to send promotional SMS to ${phoneNumber}:`, error);
          results.push({
            phoneNumber,
            success: false,
            error: error.message
          });
        }
      }

      const successCount = results.filter(r => r.success).length;
      console.log(`✅ Promotional SMS campaign completed: ${successCount}/${phoneNumbers.length} sent`);
      
      return {
        success: true,
        totalSent: successCount,
        totalFailed: phoneNumbers.length - successCount,
        results: results
      };
    } catch (error) {
      console.error('❌ Error sending promotional SMS:', error);
      throw new Error(error.message || 'Failed to send promotional SMS');
    }
  }

  // Generate OTP message
  generateOTPMessage(otp, name) {
    const greeting = name ? `Hi ${name},` : 'Hi,';
    return `${greeting} Your OTP for APNA DECORATION is ${otp}. Valid for 10 minutes. Please do not share this OTP with anyone. - APNA DECORATION`;
  }

  // Generate order update message
  generateOrderUpdateMessage(orderData, status, customerName) {
    const greeting = customerName ? `Hi ${customerName},` : 'Hi,';
    const orderId = orderData._id?.slice(-8) || orderData.orderId?.slice(-8) || 'N/A';
    
    const statusMessages = {
      'confirmed': `Your order #${orderId} has been confirmed and is being prepared.`,
      'processing': `Your order #${orderId} is now being processed.`,
      'shipped': `Your order #${orderId} has been shipped! Track your package.`,
      'delivered': `Your order #${orderId} has been delivered successfully!`,
      'cancelled': `Your order #${orderId} has been cancelled.`,
      'returned': `Your return for order #${orderId} has been processed.`
    };

    const statusMessage = statusMessages[status] || `Your order #${orderId} status has been updated to ${status}.`;
    
    return `${greeting} ${statusMessage} Thank you for shopping with APNA DECORATION!`;
  }

  // Generate payment confirmation message
  generatePaymentConfirmationMessage(paymentData, customerName) {
    const greeting = customerName ? `Hi ${customerName},` : 'Hi,';
    const amount = paymentData.amount || 0;
    const transactionId = paymentData.transactionId?.slice(-8) || paymentData._id?.slice(-8) || 'N/A';
    
    return `${greeting} Payment of ₹${amount.toFixed(2)} received successfully! Transaction ID: ${transactionId}. Thank you for your purchase from APNA DECORATION!`;
  }

  // Generate delivery update message
  generateDeliveryUpdateMessage(orderData, deliveryStatus, customerName) {
    const greeting = customerName ? `Hi ${customerName},` : 'Hi,';
    const orderId = orderData._id?.slice(-8) || orderData.orderId?.slice(-8) || 'N/A';
    
    const deliveryMessages = {
      'picked_up': `Your order #${orderId} has been picked up by our delivery partner.`,
      'in_transit': `Your order #${orderId} is in transit and will reach you soon.`,
      'out_for_delivery': `Your order #${orderId} is out for delivery! Expect it today.`,
      'delivered': `Your order #${orderId} has been delivered successfully!`,
      'failed': `Delivery attempt failed for order #${orderId}. We will try again tomorrow.`,
      'rescheduled': `Delivery for order #${orderId} has been rescheduled.`
    };

    const deliveryMessage = deliveryMessages[deliveryStatus] || `Delivery update for order #${orderId}: ${deliveryStatus}`;
    
    return `${greeting} ${deliveryMessage} - APNA DECORATION`;
  }

  // Core SMS sending function
  async sendSMS(phoneNumber, message) {
    try {
      // This would integrate with real SMS providers
      // Example for Twilio:
      /*
      const response = await axios.post(
        `${this.baseURL}/Accounts/${this.apiKey}/Messages.json`,
        {
          To: phoneNumber,
          From: this.fromNumber,
          Body: message
        },
        {
          auth: {
            username: this.apiKey,
            password: this.apiSecret
          }
        }
      );
      */

      // Mock implementation
      return {
        success: true,
        messageId: `SMS_${Date.now()}_${Math.random()}`,
        provider: this.provider,
        to: phoneNumber,
        from: this.fromNumber,
        body: message,
        timestamp: new Date().toISOString()
      };
    } catch (error) {
      console.error('❌ SMS sending error:', error);
      throw error;
    }
  }

  // Validate phone number format
  validatePhoneNumber(phoneNumber) {
    // Remove all non-digit characters
    const cleanNumber = phoneNumber.replace(/\D/g, '');
    
    // Check if it's a valid Indian mobile number (10 digits)
    if (cleanNumber.length === 10) {
      return `+91${cleanNumber}`;
    }
    
    // Check if it already has country code
    if (cleanNumber.length === 12 && cleanNumber.startsWith('91')) {
      return `+${cleanNumber}`;
    }
    
    // Return as-is for international numbers
    return phoneNumber;
  }

  // Get SMS delivery status
  async getDeliveryStatus(messageId) {
    try {
      console.log('🔧 Checking SMS delivery status:', messageId);
      
      // Mock implementation
      if (process.env.NODE_ENV === 'development') {
        return {
          success: true,
          messageId: messageId,
          status: 'delivered',
          deliveredAt: new Date().toISOString(),
          provider: 'mock'
        };
      }

      // Real implementation would query the SMS provider
      return {
        success: true,
        messageId: messageId,
        status: 'delivered',
        deliveredAt: new Date().toISOString(),
        provider: this.provider
      };
    } catch (error) {
      console.error('❌ Error checking SMS delivery status:', error);
      throw new Error(error.message || 'Failed to check delivery status');
    }
  }
}

module.exports = new SMSService();
