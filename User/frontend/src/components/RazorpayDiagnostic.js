import React, { useState, useEffect } from 'react';
import './RazorpayDiagnostic.css';

const RazorpayDiagnostic = () => {
  const [results, setResults] = useState({});
  const [isLoading, setIsLoading] = useState(false);

  const addResult = (category, status, message, details = null) => {
    setResults(prev => ({
      ...prev,
      [category]: { status, message, details }
    }));
  };

  const testKeyEndpoint = async () => {
    addResult('Key Endpoint', 'info', 'Testing Razorpay key endpoint...');
    
    try {
      const response = await fetch('https://user-api.apnadecoration.com/api/payments/key');
      const data = await response.json();
      
      if (response.ok && data.success) {
        addResult('Key Endpoint', 'success', '✅ Key endpoint working', {
          status: response.status,
          keyId: data.keyId ? data.keyId.substring(0, 10) + '...' : 'Not found',
          success: data.success
        });
      } else {
        addResult('Key Endpoint', 'error', `❌ Key endpoint failed: ${response.status}`, data);
      }
    } catch (error) {
      addResult('Key Endpoint', 'error', `❌ Network error: ${error.message}`, {
        error: error.message,
        stack: error.stack
      });
    }
  };

  const testRazorpaySDK = () => {
    addResult('SDK Loading', 'info', 'Testing Razorpay SDK loading...');
    
    // Load Razorpay script if not already loaded
    if (!window.Razorpay) {
      const script = document.createElement('script');
      script.src = 'https://checkout.razorpay.com/v1/checkout.js';
      script.onload = () => {
        if (typeof window.Razorpay !== 'undefined') {
          addResult('SDK Loading', 'success', '✅ Razorpay SDK loaded successfully', {
            razorpayLoaded: true,
            version: 'v1/checkout.js',
            typeof: typeof window.Razorpay
          });
        } else {
          addResult('SDK Loading', 'error', '❌ Razorpay SDK failed to load');
        }
      };
      script.onerror = () => {
        addResult('SDK Loading', 'error', '❌ Failed to load Razorpay script');
      };
      document.head.appendChild(script);
    } else {
      addResult('SDK Loading', 'success', '✅ Razorpay SDK already loaded', {
        razorpayLoaded: true,
        version: 'v1/checkout.js',
        typeof: typeof window.Razorpay
      });
    }
  };

  const testPaymentFlow = async () => {
    addResult('Payment Flow', 'info', 'Testing complete payment flow...');
    
    try {
      // Step 1: Get Razorpay key
      const keyResponse = await fetch('https://user-api.apnadecoration.com/api/payments/key');
      const keyData = await keyResponse.json();
      
      if (!keyResponse.ok) {
        throw new Error(`Key endpoint failed: ${keyResponse.status}`);
      }
      
      // Step 2: Check if Razorpay is available
      if (typeof window.Razorpay === 'undefined') {
        throw new Error('Razorpay SDK not loaded');
      }
      
      // Step 3: Create test order options (without actually opening)
      const testOptions = {
        key: keyData.keyId,
        amount: 50000, // 500 rupees
        currency: 'INR',
        name: 'APNA DECORATION',
        description: 'Test Payment',
        prefill: {
          name: 'Test User',
          email: 'test@example.com',
          contact: '9999999999'
        }
      };
      
      // Step 4: Try to create Razorpay instance
      const rzp = new window.Razorpay(testOptions);
      
      addResult('Payment Flow', 'success', '✅ Payment flow test successful', {
        keyEndpoint: 'Working',
        sdkLoaded: 'Working',
        instanceCreated: 'Working',
        testOptions: {
          key: testOptions.key ? testOptions.key.substring(0, 10) + '...' : 'Missing',
          amount: testOptions.amount,
          currency: testOptions.currency
        }
      });
      
    } catch (error) {
      addResult('Payment Flow', 'error', `❌ Payment flow failed: ${error.message}`, {
        error: error.message,
        stack: error.stack
      });
    }
  };

  const runAllTests = async () => {
    setIsLoading(true);
    await testKeyEndpoint();
    await new Promise(resolve => setTimeout(resolve, 500));
    testRazorpaySDK();
    await new Promise(resolve => setTimeout(resolve, 500));
    await testPaymentFlow();
    setIsLoading(false);
  };

  useEffect(() => {
    // Check browser compatibility
    const features = {
      fetch: typeof fetch !== 'undefined',
      promises: typeof Promise !== 'undefined',
      es6: typeof Arrow !== 'undefined'
    };
    
    const allSupported = Object.values(features).every(f => f);
    addResult('Browser Compatibility', allSupported ? 'success' : 'warning', 
             allSupported ? '✅ Browser supports required features' : '⚠️ Some features may not be supported', 
             features);
    
    // Check HTTPS
    const isSecure = window.location.protocol === 'https:';
    addResult('Security', isSecure ? 'success' : 'warning', 
             isSecure ? '✅ HTTPS connection' : '⚠️ Non-HTTPS connection (may affect payments)');
    
    // Auto-run tests
    setTimeout(() => {
      runAllTests();
    }, 1000);
  }, []);

  const getStatusClass = (status) => {
    return status === 'success' ? 'success' : 
           status === 'error' ? 'error' : 
           status === 'warning' ? 'warning' : 'info';
  };

  return (
    <div className="razorpay-diagnostic">
      <h1>🔍 Razorpay Integration Diagnostic Report</h1>
      
      <div className="results">
        {Object.entries(results).map(([category, result]) => (
          <div key={category} className={`status ${getStatusClass(result.status)}`}>
            <strong>{category}:</strong> {result.message}
            {result.details && (
              <pre>{JSON.stringify(result.details, null, 2)}</pre>
            )}
          </div>
        ))}
      </div>
      
      <div className="manual-tests">
        <h2>🧪 Manual Tests</h2>
        <button 
          onClick={testKeyEndpoint} 
          disabled={isLoading}
          className="test-button"
        >
          Test Key Endpoint
        </button>
        <button 
          onClick={testRazorpaySDK} 
          disabled={isLoading}
          className="test-button"
        >
          Test Razorpay SDK
        </button>
        <button 
          onClick={testPaymentFlow} 
          disabled={isLoading}
          className="test-button"
        >
          Test Payment Flow
        </button>
        <button 
          onClick={runAllTests} 
          disabled={isLoading}
          className="test-button primary"
        >
          {isLoading ? 'Running Tests...' : 'Run All Tests'}
        </button>
      </div>
    </div>
  );
};

export default RazorpayDiagnostic;
