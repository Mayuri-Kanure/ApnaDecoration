// Razorpay Integration Test Script
// Run this in browser console to test Razorpay functionality

const testRazorpayIntegration = async () => {
  console.log('🔍 Starting Razorpay Integration Test...');
  
  // Test 1: Check if we can reach the backend
  console.log('📡 Testing backend connectivity...');
  try {
    const response = await fetch(`${process.env.REACT_APP_API_URL}/payments/key`);
    console.log('✅ Backend reachable, status:', response.status);
    
    if (response.ok) {
      const data = await response.json();
      console.log('✅ Key endpoint response:', data);
      console.log('🔑 Razorpay Key (first 10 chars):', data.keyId?.substring(0, 10) + '...');
    } else {
      console.error('❌ Backend returned error:', response.status);
      const errorData = await response.json();
      console.error('Error details:', errorData);
    }
  } catch (error) {
    console.error('❌ Backend connectivity failed:', error);
    console.error('Possible causes:');
    console.error('1. Backend server is down');
    console.error('2. CORS issues');
    console.error('3. Network connectivity problems');
  }
  
  // Test 2: Check Razorpay SDK
  console.log('📦 Testing Razorpay SDK...');
  if (typeof window.Razorpay !== 'undefined') {
    console.log('✅ Razorpay SDK loaded');
    
    // Test creating instance (without opening modal)
    try {
      const testOptions = {
        key: 'rzp_live_RsakLTdHRff3gk',
        amount: 50000,
        currency: 'INR',
        name: 'APNA DECORATION',
        description: 'Test Payment'
      };
      
      const rzp = new window.Razorpay(testOptions);
      console.log('✅ Razorpay instance created successfully');
      console.log('🔧 Instance type:', typeof rzp);
      console.log('🔧 Open method available:', typeof rzp.open);
    } catch (error) {
      console.error('❌ Failed to create Razorpay instance:', error);
    }
  } else {
    console.error('❌ Razorpay SDK not loaded');
    console.log('🔄 Loading Razorpay SDK...');
    
    const script = document.createElement('script');
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.onload = () => {
      console.log('✅ Razorpay SDK loaded successfully');
    };
    script.onerror = () => {
      console.error('❌ Failed to load Razorpay SDK');
    };
    document.head.appendChild(script);
  }
  
  // Test 3: Check environment
  console.log('🌍 Checking environment...');
  console.log('Protocol:', window.location.protocol);
  console.log('Host:', window.location.host);
  console.log('HTTPS required for payments:', window.location.protocol !== 'https:');
  
  if (window.location.protocol !== 'https:') {
    console.warn('⚠️ Running on HTTP - payments may not work');
    console.log('💡 Solution: Use HTTPS or test in production');
  }
  
  console.log('🏁 Test completed!');
  console.log('📋 Summary:');
  console.log('- Backend connectivity: Check above');
  console.log('- Razorpay SDK: Check above');
  console.log('- Environment: Check above');
  console.log('\n🔧 Next steps:');
  console.log('1. If backend fails: Check server status');
  console.log('2. If SDK fails: Check internet/ad-blocker');
  console.log('3. If environment fails: Use HTTPS');
};

// Auto-run test
testRazorpayIntegration();

// Make function available globally
window.testRazorpayIntegration = testRazorpayIntegration;
