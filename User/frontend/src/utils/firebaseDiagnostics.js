/**
 * Firebase Authentication Diagnostic Script
 * Run this to identify which configuration is failing
 */

import { auth } from '../config/firebase';

export const runFirebaseDiagnostics = async () => {
  console.log('🔍 Starting Firebase Diagnostics...\n');
  
  const results = {
    timestamp: new Date().toISOString(),
    checks: {}
  };

  // ============================================================
  // CHECK 1: Firebase Auth Instance
  // ============================================================
  console.log('📋 CHECK 1: Firebase Auth Instance');
  try {
    if (!auth) {
      console.error('❌ Auth instance is NOT initialized');
      results.checks.authInstance = { status: 'FAILED', message: 'Auth is null/undefined' };
    } else if (!auth.app) {
      console.error('❌ Auth app is NOT initialized');
      results.checks.authInstance = { status: 'FAILED', message: 'Auth.app is null/undefined' };
    } else {
      console.log('✅ Auth instance initialized');
      console.log('   Project ID:', auth.app.options.projectId);
      console.log('   Auth domain:', auth.app.options.authDomain);
      results.checks.authInstance = { 
        status: 'PASSED', 
        projectId: auth.app.options.projectId,
        authDomain: auth.app.options.authDomain
      };
    }
  } catch (err) {
    console.error('❌ Error checking auth instance:', err.message);
    results.checks.authInstance = { status: 'FAILED', error: err.message };
  }

  // ============================================================
  // CHECK 2: API Key Configuration
  // ============================================================
  console.log('\n📋 CHECK 2: API Key Configuration');
  try {
    const apiKey = auth?.app?.options?.apiKey;
    if (!apiKey) {
      console.error('❌ API Key is missing');
      results.checks.apiKey = { status: 'FAILED', message: 'API Key not found in config' };
    } else {
      console.log('✅ API Key found');
      console.log('   Key (masked):', apiKey.substring(0, 15) + '...' + apiKey.substring(apiKey.length - 5));
      console.log('   Expected Key: AIzaSyDYqHW5RPIvhpvsLKYLH5IJhj_5-j8xtUQ');
      const isCorrect = apiKey === 'AIzaSyDYqHW5RPIvhpvsLKYLH5IJhj_5-j8xtUQ';
      console.log('   Match:', isCorrect ? '✅ YES' : '❌ NO');
      results.checks.apiKey = { 
        status: isCorrect ? 'PASSED' : 'MISMATCH',
        provided: apiKey,
        expected: 'AIzaSyDYqHW5RPIvhpvsLKYLH5IJhj_5-j8xtUQ'
      };
    }
  } catch (err) {
    console.error('❌ Error checking API key:', err.message);
    results.checks.apiKey = { status: 'FAILED', error: err.message };
  }

  // ============================================================
  // CHECK 3: reCAPTCHA Container in DOM
  // ============================================================
  console.log('\n📋 CHECK 3: reCAPTCHA Container');
  try {
    const container = document.getElementById('recaptcha-container');
    if (!container) {
      console.warn('⚠️  reCAPTCHA container NOT in DOM');
      console.log('   This is expected if component hasn\'t mounted yet');
      results.checks.recaptchaContainer = { status: 'NOT_FOUND', message: 'Container not in DOM (may not be mounted yet)' };
    } else {
      console.log('✅ reCAPTCHA container found in DOM');
      console.log('   Display:', window.getComputedStyle(container).display);
      console.log('   Visibility:', window.getComputedStyle(container).visibility);
      console.log('   Width:', container.offsetWidth, 'Height:', container.offsetHeight);
      results.checks.recaptchaContainer = { 
        status: 'FOUND',
        display: window.getComputedStyle(container).display,
        visibility: window.getComputedStyle(container).visibility,
        dimensions: { width: container.offsetWidth, height: container.offsetHeight }
      };
    }
  } catch (err) {
    console.error('❌ Error checking reCAPTCHA container:', err.message);
    results.checks.recaptchaContainer = { status: 'FAILED', error: err.message };
  }

  // ============================================================
  // CHECK 4: Test Identity Toolkit API Access
  // ============================================================
  console.log('\n📋 CHECK 4: Identity Toolkit API Endpoint');
  try {
    const apiKey = auth?.app?.options?.apiKey;
    const projectId = auth?.app?.options?.projectId;
    
    if (!apiKey) {
      console.error('❌ Cannot test - API Key missing');
      results.checks.identityToolkitApi = { status: 'SKIPPED', message: 'API Key not available' };
    } else {
      console.log('Testing endpoint: GET /identitytoolkit/v3/relyingparty/getProjectConfig');
      const response = await fetch(
        `https://www.googleapis.com/identitytoolkit/v3/relyingparty/getProjectConfig?key=${apiKey}`,
        { method: 'GET', headers: { 'Content-Type': 'application/json' } }
      );
      
      console.log('   Response Status:', response.status);
      console.log('   Status Text:', response.statusText);
      
      if (response.status === 200) {
        const data = await response.json();
        console.log('✅ API endpoint accessible');
        console.log('   Project Config Received:', !!data.signInWithIdp);
        results.checks.identityToolkitApi = { 
          status: 'PASSED',
          statusCode: 200,
          hasProjectConfig: !!data
        };
      } else if (response.status === 400) {
        console.error('❌ API returned 400 Bad Request');
        console.log('   LIKELY CAUSES:');
        console.log('   1. API Key doesn\'t have "Identity Toolkit API" enabled');
        console.log('   2. Phone authentication not enabled in Firebase Console');
        console.log('   3. reCAPTCHA not configured for this project');
        console.log('   4. App Check enforcement enabled without debug token');
        const errorData = await response.json();
        console.log('   Error:', errorData);
        results.checks.identityToolkitApi = { 
          status: 'FAILED',
          statusCode: 400,
          errorDetails: errorData
        };
      } else {
        console.error(`❌ API returned ${response.status}`);
        results.checks.identityToolkitApi = { 
          status: 'FAILED',
          statusCode: response.status,
          statusText: response.statusText
        };
      }
    }
  } catch (err) {
    if (err.message.includes('Failed to fetch')) {
      console.error('❌ Network Error: Cannot reach googleapis.com');
      console.log('   Check: CORS policy, firewall, or VPN');
      results.checks.identityToolkitApi = { status: 'NETWORK_ERROR', error: err.message };
    } else {
      console.error('❌ Error testing API:', err.message);
      results.checks.identityToolkitApi = { status: 'FAILED', error: err.message };
    }
  }

  // ============================================================
  // CHECK 5: Browser & Environment Info
  // ============================================================
  console.log('\n📋 CHECK 5: Environment Information');
  try {
    const userAgent = navigator.userAgent;
    const isAndroid = /Android/.test(userAgent);
    const isMobile = /Mobile|Android|iPhone/.test(userAgent);
    
    console.log('   User Agent:', userAgent.substring(0, 80) + '...');
    console.log('   Is Mobile:', isMobile ? 'YES' : 'NO');
    console.log('   Is Android:', isAndroid ? 'YES' : 'NO');
    console.log('   Cookies Enabled:', navigator.cookieEnabled ? 'YES' : 'NO');
    console.log('   Origin:', window.location.origin);
    console.log('   Hostname:', window.location.hostname);
    
    results.checks.environment = {
      userAgent: userAgent,
      isMobile,
      isAndroid,
      cookiesEnabled: navigator.cookieEnabled,
      origin: window.location.origin,
      hostname: window.location.hostname
    };
  } catch (err) {
    console.error('❌ Error checking environment:', err.message);
    results.checks.environment = { status: 'FAILED', error: err.message };
  }

  // ============================================================
  // SUMMARY
  // ============================================================
  console.log('\n' + '='.repeat(60));
  console.log('📊 DIAGNOSTIC SUMMARY');
  console.log('='.repeat(60));
  
  let passCount = 0;
  let failCount = 0;
  
  Object.entries(results.checks).forEach(([check, result]) => {
    if (result.status === 'PASSED' || result.status === 'FOUND') {
      console.log(`✅ ${check}: ${result.status}`);
      passCount++;
    } else if (result.status === 'NOT_FOUND' || result.status === 'SKIPPED') {
      console.log(`⚠️  ${check}: ${result.status}`);
    } else {
      console.log(`❌ ${check}: ${result.status}`);
      failCount++;
    }
  });
  
  console.log('\n' + '-'.repeat(60));
  console.log(`Passed: ${passCount} | Failed: ${failCount}`);
  console.log('-'.repeat(60));
  
  if (failCount === 0) {
    console.log('✅ All critical checks passed! Issues may be with:');
    console.log('   - reCAPTCHA initialization (check Console for reCAPTCHA errors)');
    console.log('   - Phone number format');
    console.log('   - Backend endpoint configuration');
  } else {
    console.log('❌ Critical issues found. See failures above.');
  }
  
  console.log('\n🔧 NEXT STEPS:');
  console.log('1. Copy-paste the results above');
  console.log('2. Check each FAILED item');
  console.log('3. Verify Firebase Console settings');
  console.log('4. Run again after making changes\n');
  
  return results;
};

// Export a function to attach to window for easy access
if (typeof window !== 'undefined') {
  window.firebaseDiagnostics = runFirebaseDiagnostics;
}
