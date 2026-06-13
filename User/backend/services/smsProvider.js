/**
 * SMS Service Configuration & Provider Integration
 * Supports: Twilio, Nexmo/Vonage, MSG91, FastSMS, AWS SNS
 */

const axios = require('axios');

class SMSProvider {
  /**
   * Twilio SMS Provider
   */
  static async sendViaTwilio(phoneNumber, message) {
    try {
      const accountSid = process.env.TWILIO_ACCOUNT_SID;
      const authToken = process.env.TWILIO_AUTH_TOKEN;
      const fromNumber = process.env.TWILIO_PHONE_NUMBER || '+1234567890';

      if (!accountSid || !authToken) {
        throw new Error('Twilio credentials not configured');
      }

      const response = await axios.post(
        `https://api.twilio.com/2010-04-01/Accounts/${accountSid}/Messages.json`,
        {
          From: fromNumber,
          To: phoneNumber,
          Body: message,
        },
        {
          auth: {
            username: accountSid,
            password: authToken,
          }
        }
      );

      return {
        success: true,
        messageId: response.data.sid,
        provider: 'twilio',
        status: response.data.status
      };
    } catch (error) {
      console.error('❌ Twilio error:', error.message);
      throw error;
    }
  }

  /**
   * Nexmo (Vonage) SMS Provider
   */
  static async sendViaNexmo(phoneNumber, message) {
    try {
      const apiKey = process.env.NEXMO_API_KEY;
      const apiSecret = process.env.NEXMO_API_SECRET;
      const fromNumber = process.env.NEXMO_FROM_NUMBER || 'APNADEC';

      if (!apiKey || !apiSecret) {
        throw new Error('Nexmo credentials not configured');
      }

      const response = await axios.post(
        'https://rest.nexmo.com/sms/json',
        {
          api_key: apiKey,
          api_secret: apiSecret,
          to: phoneNumber,
          from: fromNumber,
          text: message,
        }
      );

      if (response.data.messages[0]['message-status'] !== '0') {
        throw new Error(response.data.messages[0]['error-text']);
      }

      return {
        success: true,
        messageId: response.data.messages[0]['message-id'],
        provider: 'nexmo',
        status: 'submitted'
      };
    } catch (error) {
      console.error('❌ Nexmo error:', error.message);
      throw error;
    }
  }

  /**
   * MSG91 SMS Provider (Indian SMS Service)
   */
  static async sendViaMSG91(phoneNumber, message) {
    try {
      const authKey = process.env.MSG91_AUTH_KEY;
      const templateId = process.env.MSG91_OTP_TEMPLATE_ID;

      if (!authKey) {
        throw new Error('MSG91 credentials not configured');
      }

      const response = await axios.post(
        'https://control.msg91.com/api/sendhttp.php',
        null,
        {
          params: {
            authkey: authKey,
            mobiles: phoneNumber,
            message: message,
            sender: 'APNADEC',
            route: 4,
            ...(templateId && { template_id: templateId })
          }
        }
      );

      return {
        success: true,
        messageId: response.data,
        provider: 'msg91',
        status: 'sent'
      };
    } catch (error) {
      console.error('❌ MSG91 error:', error.message);
      throw error;
    }
  }

  /**
   * FastSMS Provider
   */
  static async sendViaFastSMS(phoneNumber, message) {
    try {
      const apiKey = process.env.FAST2SMS_API_KEY;

      if (!apiKey) {
        throw new Error('FastSMS credentials not configured');
      }

      const response = await axios.post(
        'https://www.fast2sms.com/dev/bulkSms',
        {
          message: message,
          language: 'english',
          route: 'q',
          numbers: phoneNumber
        },
        {
          headers: {
            authorization: apiKey,
            'Content-Type': 'application/x-www-form-urlencoded'
          }
        }
      );

      return {
        success: true,
        messageId: response.data.request_id,
        provider: 'fastsms',
        status: 'submitted'
      };
    } catch (error) {
      console.error('❌ FastSMS error:', error.message);
      throw error;
    }
  }

  /**
   * AWS SNS SMS Provider
   */
  static async sendViaAWSSNS(phoneNumber, message) {
    try {
      const AWS = require('aws-sdk');
      
      const accessKeyId = process.env.AWS_ACCESS_KEY_ID;
      const secretAccessKey = process.env.AWS_SECRET_ACCESS_KEY;
      const region = process.env.AWS_REGION || 'us-east-1';

      if (!accessKeyId || !secretAccessKey) {
        throw new Error('AWS credentials not configured');
      }

      const sns = new AWS.SNS({
        accessKeyId,
        secretAccessKey,
        region
      });

      const response = await sns.publish({
        Message: message,
        PhoneNumber: phoneNumber,
      }).promise();

      return {
        success: true,
        messageId: response.MessageId,
        provider: 'aws-sns',
        status: 'submitted'
      };
    } catch (error) {
      console.error('❌ AWS SNS error:', error.message);
      throw error;
    }
  }

  /**
   * Mock Provider (for development/testing)
   */
  static async sendViaMock(phoneNumber, message) {
    try {
      console.log('\n' + '='.repeat(60));
      console.log('📱 MOCK SMS (Development Mode)');
      console.log('='.repeat(60));
      console.log('To:', phoneNumber);
      console.log('Message:', message);
      console.log('Timestamp:', new Date().toISOString());
      console.log('='.repeat(60) + '\n');

      return {
        success: true,
        messageId: `MOCK_${Date.now()}`,
        provider: 'mock',
        status: 'delivered'
      };
    } catch (error) {
      console.error('❌ Mock SMS error:', error.message);
      throw error;
    }
  }
}

module.exports = SMSProvider;
