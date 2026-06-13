/**
 * OTP Service - Manages OTP generation, storage, and verification
 */

const OTP = require('../models/OTP');
const smsService = require('./smsService');

class OTPService {
  /**
   * Generate and send OTP
   */
  static async generateAndSendOTP(phoneNumber, email, userId, userName = '') {
    try {
      console.log('🔧 Generating OTP for:', { phoneNumber, email });

      // Generate 6-digit OTP
      const otp = Math.floor(100000 + Math.random() * 900000).toString();

      // Delete any existing OTP for this email
      await OTP.deleteMany({ email });

      // Store OTP in database
      const otpRecord = new OTP({
        phoneNumber,
        email,
        otp,
        userId,
        attempts: 0,
        verified: false
      });

      await otpRecord.save();

      // Send OTP via SMS
      const smsResult = await smsService.sendOTP(phoneNumber, otp, userName);

      console.log('✅ OTP generated and sent:', { 
        email, 
        messageId: smsResult.messageId,
        smsProvider: smsResult.provider 
      });

      return {
        success: true,
        message: 'OTP sent successfully',
        smsProvider: smsResult.provider,
        expiresIn: 300, // 5 minutes
        otpLength: 6
      };
    } catch (error) {
      console.error('❌ Error generating OTP:', error);
      throw new Error(error.message || 'Failed to generate OTP');
    }
  }

  /**
   * Verify OTP
   */
  static async verifyOTP(email, otp) {
    try {
      console.log('🔍 Verifying OTP for:', email);

      // Find OTP record
      const otpRecord = await OTP.findOne({ email });

      if (!otpRecord) {
        throw new Error('OTP not found or expired');
      }

      // Check attempts
      if (otpRecord.attempts >= 5) {
        await OTP.deleteOne({ _id: otpRecord._id });
        throw new Error('Too many attempts. Please request a new OTP');
      }

      // Verify OTP
      if (otpRecord.otp !== otp.toString()) {
        otpRecord.attempts += 1;
        await otpRecord.save();
        throw new Error(`Invalid OTP. Attempts remaining: ${5 - otpRecord.attempts}`);
      }

      // Mark as verified
      otpRecord.verified = true;
      await otpRecord.save();

      console.log('✅ OTP verified successfully for:', email);

      return {
        success: true,
        message: 'OTP verified successfully',
        userId: otpRecord.userId,
        email: otpRecord.email,
        phoneNumber: otpRecord.phoneNumber
      };
    } catch (error) {
      console.error('❌ OTP verification failed:', error);
      throw new Error(error.message || 'OTP verification failed');
    }
  }

  /**
   * Clear OTP for user
   */
  static async clearOTP(email) {
    try {
      await OTP.deleteMany({ email });
      console.log('✅ OTP cleared for:', email);
    } catch (error) {
      console.error('❌ Error clearing OTP:', error);
    }
  }

  /**
   * Check if OTP is verified for user
   */
  static async isOTPVerified(email) {
    try {
      const otpRecord = await OTP.findOne({ email, verified: true });
      return !!otpRecord;
    } catch (error) {
      return false;
    }
  }
}

module.exports = OTPService;
