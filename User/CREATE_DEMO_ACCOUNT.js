#!/usr/bin/env node

const axios = require('axios');

console.log('🎯 Creating Demo Account for Client Presentation...\n');

const DEMO_ACCOUNT = {
  name: 'Demo User',
  email: 'demo@apna.com',
  password: 'Demo123',
  phone: '9876543210',
  role: 'customer'
};

const API_BASE_URL = 'http://192.168.1.64:5002/api';

async function createDemoAccount() {
  try {
    console.log('📝 Demo Account Details:');
    console.log(`   Email: ${DEMO_ACCOUNT.email}`);
    console.log(`   Password: ${DEMO_ACCOUNT.password}`);
    console.log(`   Name: ${DEMO_ACCOUNT.name}\n`);

    // Check if account already exists
    console.log('🔍 Checking if demo account already exists...');
    try {
      const loginResponse = await axios.post(`${API_BASE_URL}/auth/login`, {
        email: DEMO_ACCOUNT.email,
        password: DEMO_ACCOUNT.password
      });

      if (loginResponse.data.success) {
        console.log('✅ Demo account already exists and is working!');
        console.log('🎯 Ready for client demo login');
        return;
      }
    } catch (error) {
      console.log('📝 Demo account does not exist, creating...');
    }

    // Create new demo account
    console.log('🔨 Creating new demo account...');
    const registerResponse = await axios.post(`${API_BASE_URL}/auth/register`, DEMO_ACCOUNT);

    if (registerResponse.data.success) {
      console.log('✅ Demo account created successfully!');
      console.log('🎯 Ready for client demo login');
      console.log('\n📱 DEMO LOGIN CREDENTIALS:');
      console.log('========================');
      console.log(`Email: ${DEMO_ACCOUNT.email}`);
      console.log(`Password: ${DEMO_ACCOUNT.password}`);
      console.log('========================');
    } else {
      console.log('❌ Failed to create demo account:', registerResponse.data.message);
    }

  } catch (error) {
    console.error('❌ Error creating demo account:', error.response?.data?.message || error.message);
  }
}

// Test login after creation
async function testDemoLogin() {
  try {
    console.log('\n🔐 Testing demo login...');
    const response = await axios.post(`${API_BASE_URL}/auth/login`, {
      email: DEMO_ACCOUNT.email,
      password: DEMO_ACCOUNT.password
    });

    if (response.data.success) {
      console.log('✅ Demo login successful!');
      console.log(`👤 User: ${response.data.data.user.name}`);
      console.log(`🆔 User ID: ${response.data.data.user._id}`);
      console.log('🎯 Demo account is ready for presentation!');
    } else {
      console.log('❌ Demo login failed:', response.data.message);
    }
  } catch (error) {
    console.error('❌ Login test failed:', error.response?.data?.message || error.message);
  }
}

// Execute
async function main() {
  await createDemoAccount();
  await testDemoLogin();
  console.log('\n🎉 Demo account preparation complete!');
}

main();
