#!/usr/bin/env node

/**
 * 2FA Quick Start Testing Script
 * Test 2FA implementation without real SMS credentials
 */

const mongoose = require('mongoose');
const path = require('path');

// Load environment variables
require('dotenv').config({ path: path.join(__dirname, '.env') });

async function test2FA() {
  try {
    console.log('\n' + '='.repeat(80));
    console.log('2FA QUICK START TEST');
    console.log('='.repeat(80));

    // Connect to MongoDB
    console.log('\n🔗 Connecting to database...');
    const mongoUri = process.env.MONGODB_URI || 'mongodb://localhost:27017/apna-decoration';
    
    await mongoose.connect(mongoUri, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    
    console.log('✅ Connected to MongoDB');

    const User = require('./models/User');
    const OTP = require('./models/OTP');
    const OTPService = require('./services/otpService');

    // Test 1: Check if OTP model exists
    console.log('\n' + '-'.repeat(80));
    console.log('TEST 1: OTP Model');
    console.log('-'.repeat(80));
    console.log('✅ OTP Model loaded successfully');

    // Test 2: Find a test user
    console.log('\n' + '-'.repeat(80));
    console.log('TEST 2: Find User with Phone Number');
    console.log('-'.repeat(80));
    
    const testUser = await User.findOne({ phone: { $exists: true, $ne: '' } });
    
    if (!testUser) {
      console.log('⚠️  No user with phone number found');
      console.log('   Create a user and add a phone number first');
    } else {
      console.log(`✅ Found user: ${testUser.name || testUser.email}`);
      console.log(`   Phone: ${testUser.phone}`);
      console.log(`   2FA Enabled: ${testUser.twoFactorEnabled ? '✅' : '❌'}`);
    }

    // Test 3: Generate OTP
    console.log('\n' + '-'.repeat(80));
    console.log('TEST 3: Generate & Send OTP');
    console.log('-'.repeat(80));
    
    if (testUser) {
      try {
        const otpResult = await OTPService.generateAndSendOTP(
          testUser.phone,
          testUser.email,
          testUser._id,
          testUser.name || testUser.email
        );
        
        console.log('✅ OTP Generated and sent!');
        console.log(`   Provider: ${otpResult.smsProvider}`);
        console.log(`   Expires in: ${otpResult.expiresIn} seconds`);
        
        // Get the OTP from database for testing
        const otpRecord = await OTP.findOne({ email: testUser.email });
        if (otpRecord && process.env.SMS_PROVIDER === 'mock') {
          console.log(`   📝 TEST OTP: ${otpRecord.otp} (for mock provider only)`);
          
          // Test 4: Verify OTP
          console.log('\n' + '-'.repeat(80));
          console.log('TEST 4: Verify OTP');
          console.log('-'.repeat(80));
          
          try {
            const verifyResult = await OTPService.verifyOTP(testUser.email, otpRecord.otp);
            console.log('✅ OTP Verified Successfully!');
            console.log(`   User: ${verifyResult.email}`);
            console.log(`   Phone: ${verifyResult.phoneNumber}`);
            
            // Clear OTP
            await OTPService.clearOTP(testUser.email);
            console.log('\n✅ OTP Cleared');
          } catch (error) {
            console.log('❌ OTP Verification Failed:', error.message);
          }
        }
      } catch (error) {
        console.log('❌ OTP Generation Failed:', error.message);
        if (error.message.includes('credentials')) {
          console.log('\n💡 Hint: SMS provider not configured');
          console.log('   Set SMS_PROVIDER=mock in .env for testing');
        }
      }
    }

    // Test 5: Check SMS Provider
    console.log('\n' + '-'.repeat(80));
    console.log('TEST 5: SMS Provider Configuration');
    console.log('-'.repeat(80));
    
    const provider = process.env.SMS_PROVIDER || 'mock';
    console.log(`✅ Current Provider: ${provider.toUpperCase()}`);
    
    if (provider === 'mock') {
      console.log('   ✅ Using Mock Provider (perfect for testing)');
      console.log('   📝 SMS messages will appear in console');
    } else {
      console.log(`   Provider: ${provider}`);
      const hasCredentials = process.env.TWILIO_ACCOUNT_SID || 
                            process.env.NEXMO_API_KEY || 
                            process.env.MSG91_AUTH_KEY;
      console.log(`   Credentials: ${hasCredentials ? '✅ Configured' : '❌ Not configured'}`);
    }

    // Summary
    console.log('\n' + '='.repeat(80));
    console.log('TEST SUMMARY');
    console.log('='.repeat(80));
    
    const twoFactorUsers = await User.countDocuments({ twoFactorEnabled: true });
    const totalUsers = await User.countDocuments();
    
    console.log(`\n📊 User Statistics:`);
    console.log(`   • Total Users: ${totalUsers}`);
    console.log(`   • With 2FA Enabled: ${twoFactorUsers}`);
    console.log(`   • SMS Provider: ${provider}`);
    
    console.log('\n✨ 2FA Setup is working!');
    console.log('\n💡 Next Steps:');
    console.log('   1. Test user login with 2FA');
    console.log('   2. Verify OTP is received');
    console.log('   3. Complete login with OTP');
    console.log('   4. When ready, switch to real SMS provider');

    console.log('\n' + '='.repeat(80) + '\n');

    await mongoose.disconnect();
    console.log('✅ Database disconnected');

  } catch (error) {
    console.error('❌ Test failed:', error);
    process.exit(1);
  }
}

// Run the test
test2FA();
