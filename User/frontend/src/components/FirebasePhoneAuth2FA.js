/**
 * Firebase Phone Authentication 2FA Component
 * Handles OTP sending and verification using Firebase
 */

import React, { useState, useRef, useEffect } from 'react';
import { auth } from '../config/firebase';
import { RecaptchaVerifier, signInWithPhoneNumber } from 'firebase/auth';

const FirebasePhoneAuth2FA = ({ phoneNumber, email, onVerificationSuccess, onVerificationFailed }) => {
  const [otp, setOtp] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [confirmationResult, setConfirmationResult] = useState(null);
  const [showOtpInput, setShowOtpInput] = useState(false);
  const [timeLeft, setTimeLeft] = useState(300); // 5 minutes
  const [recaptchaReady, setRecaptchaReady] = useState(false);
  const recaptchaVerifierRef = useRef(null);
  const initializeAttempts = useRef(0);

  // Initialize reCAPTCHA - with better error handling
  useEffect(() => {
    if (recaptchaReady) return;

    const initRecaptcha = () => {
      try {
        // Ensure auth is initialized
        if (!auth || !auth.app) {
          console.warn('⚠️ Firebase auth not yet initialized, retrying...');
          if (initializeAttempts.current < 5) {
            initializeAttempts.current += 1;
            setTimeout(initRecaptcha, 500);
          }
          return;
        }

        if (recaptchaVerifierRef.current) {
          try {
            recaptchaVerifierRef.current.clear();
          } catch (e) {
            console.warn('Could not clear previous reCAPTCHA:', e.message);
          }
        }

        // Check if reCAPTCHA container exists
        const container = document.getElementById('recaptcha-container');
        if (!container) {
          console.warn('⚠️ reCAPTCHA container not found, will retry');
          if (initializeAttempts.current < 5) {
            initializeAttempts.current += 1;
            setTimeout(initRecaptcha, 500);
          }
          return;
        }

        console.log('🔧 Initializing reCAPTCHA...');

        // Initialize reCAPTCHA Verifier
        recaptchaVerifierRef.current = new RecaptchaVerifier(
          auth,
          'recaptcha-container',
          {
            size: 'invisible',
            callback: (response) => {
              console.log('✅ reCAPTCHA verified');
            },
            'expired-callback': () => {
              console.log('⚠️ reCAPTCHA expired');
            },
            'error-callback': () => {
              console.warn('⚠️ reCAPTCHA error');
            }
          }
        );
        console.log('✅ reCAPTCHA initialized successfully');
        setRecaptchaReady(true);
        initializeAttempts.current = 0; // Reset on success
      } catch (err) {
        console.error('❌ reCAPTCHA initialization error:', err.message);
        
        if (initializeAttempts.current < 5) {
          initializeAttempts.current += 1;
          console.log(`Retry attempt ${initializeAttempts.current}/5 in 1 second...`);
          setTimeout(initRecaptcha, 1000);
        } else {
          console.warn('⚠️ Max retries reached, proceeding without reCAPTCHA');
          setRecaptchaReady(true); // Proceed anyway to prevent blocking
        }
      }
    };

    // Wait for Firebase to be ready
    setTimeout(initRecaptcha, 300);

    return () => {
      if (recaptchaVerifierRef.current) {
        try {
          recaptchaVerifierRef.current.clear();
        } catch (err) {
          console.warn('Error clearing reCAPTCHA:', err.message);
        }
      }
    };
  }, [recaptchaReady]);

  // Countdown timer for OTP expiry
  useEffect(() => {
    if (!showOtpInput || timeLeft <= 0) return;

    const timer = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          clearInterval(timer);
          setError('OTP expired. Please request a new one.');
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [showOtpInput, timeLeft]);

  // Send OTP via Firebase
  const handleSendOTP = async () => {
    try {
      setIsLoading(true);
      setError('');

      // Debug: Log the phone number being used
      console.log('📱 DEBUG: phoneNumber prop received:', phoneNumber);
      console.log('📱 DEBUG: phoneNumber type:', typeof phoneNumber);
      console.log('📱 DEBUG: phoneNumber length:', phoneNumber?.length);

      // Validate Firebase auth is initialized
      if (!auth || !auth.app) {
        setError('Firebase is not initialized. Please refresh the page and try again.');
        setIsLoading(false);
        return;
      }

      // Ensure phone number is provided
      if (!phoneNumber || phoneNumber.length < 10) {
        setError('Please enter a valid phone number');
        setIsLoading(false);
        return;
      }

      // Format phone number with country code (India: +91)
      let formattedPhone = phoneNumber;
      if (!formattedPhone.startsWith('+')) {
        if (formattedPhone.length === 10) {
          formattedPhone = '+91' + formattedPhone;
        } else if (formattedPhone.length === 12 && formattedPhone.startsWith('91')) {
          formattedPhone = '+' + formattedPhone;
        }
      }

      console.log('📱 Phone number formatted to:', formattedPhone);

      // Wait for reCAPTCHA to be ready
      let waitCount = 0;
      while (!recaptchaReady && waitCount < 10) {
        await new Promise(resolve => setTimeout(resolve, 200));
        waitCount++;
      }

      if (!recaptchaReady) {
        console.warn('⚠️ reCAPTCHA not ready after wait');
      }

      // Reinitialize reCAPTCHA verifier if needed
      if (!recaptchaVerifierRef.current) {
        console.log('🔧 Reinitializing reCAPTCHA verifier...');
        try {
          recaptchaVerifierRef.current = new RecaptchaVerifier(
            auth,
            'recaptcha-container',
            { size: 'invisible' }
          );
        } catch (err) {
          console.warn('⚠️ reCAPTCHA reinitialization error:', err.message);
        }
      }

      console.log('📱 Sending OTP to:', formattedPhone);
      console.log('✓ reCAPTCHA verifier ready:', !!recaptchaVerifierRef.current);

      // Send OTP using Firebase
      const result = await signInWithPhoneNumber(
        auth,
        formattedPhone,
        recaptchaVerifierRef.current
      );

      setConfirmationResult(result);
      setShowOtpInput(true);
      setTimeLeft(300); // Reset timer to 5 minutes

      console.log('✅ OTP sent successfully to', formattedPhone);
    } catch (err) {
      console.error('❌ Error sending OTP:', err);
      
      // User-friendly error messages
      if (err.code === 'auth/invalid-phone-number') {
        setError('❌ Invalid phone number format. Use 10-digit or +91xxxxxxxxxx format.');
      } else if (err.code === 'auth/too-many-requests') {
        setError('❌ Too many OTP requests. Please wait a few minutes and try again.');
      } else if (err.code === 'auth/operation-not-allowed') {
        setError('❌ Phone authentication is not enabled in Firebase Console. Contact support.');
      } else if (err.code === 'auth/missing-android-pkg-name') {
        setError('❌ Firebase configuration error. Please refresh and try again.');
      } else if (err.code === 'auth/missing-app-credential') {
        setError('❌ reCAPTCHA configuration error. Please ensure reCAPTCHA is properly configured.');
      } else if (err.code === 'auth/argument-error') {
        setError('❌ Configuration error: ' + (err.message || 'Invalid arguments. Please refresh and try again.'));
      } else if (err.message?.includes('400') || err.message?.includes('recaptcha')) {
        setError('❌ reCAPTCHA verification failed. Please try again.');
      } else {
        setError(`❌ Error: ${err.message || 'Failed to send OTP. Please try again.'}`);
      }
      
      onVerificationFailed && onVerificationFailed(err);
    } finally {
      setIsLoading(false);
    }
  };

  // Verify OTP and complete Firebase login
  const handleVerifyOTP = async () => {
    try {
      setIsLoading(true);
      setError('');

      if (!otp || otp.length !== 6) {
        setError('Please enter a valid 6-digit OTP');
        return;
      }

      if (!confirmationResult) {
        setError('OTP session expired. Please request a new OTP.');
        return;
      }

      console.log('Verifying OTP:', otp);

      // Verify OTP with Firebase
      const userCredential = await confirmationResult.confirm(otp);
      console.log('✅ OTP verified by Firebase');

      // Get Firebase ID token
      const idToken = await userCredential.user.getIdToken();
      const firebaseUser = userCredential.user;

      console.log('Firebase User:', {
        uid: firebaseUser.uid,
        phoneNumber: firebaseUser.phoneNumber,
        email: firebaseUser.email
      });

      // Send Firebase token to your backend
      await handleFirebaseTokenToBackend(idToken, firebaseUser);

    } catch (err) {
      console.error('Error verifying OTP:', err);

      if (err.code === 'auth/invalid-verification-code') {
        setError('Invalid OTP. Please check and try again.');
      } else if (err.code === 'auth/code-expired') {
        setError('OTP expired. Please request a new one.');
      } else {
        setError(err.message || 'OTP verification failed. Please try again.');
      }

      onVerificationFailed && onVerificationFailed(err);
    } finally {
      setIsLoading(false);
    }
  };

  // Send Firebase token to backend for verification
  const handleFirebaseTokenToBackend = async (idToken, firebaseUser) => {
    try {
      console.log('📤 Sending Firebase token to backend...');
      
      const API_BASE_URL = 'https://user-api.apnadecoration.com';
      
      console.log('🔗 Backend URL:', API_BASE_URL);
      console.log('🔗 Endpoint: /api/auth/verify-firebase-2fa');

      const response = await fetch(`${API_BASE_URL}/api/auth/verify-firebase-2fa`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify({
          idToken,
          phoneNumber: firebaseUser.phoneNumber,
          firebaseUid: firebaseUser.uid,
          email: email || firebaseUser.email
        })
      });

      console.log('📥 Backend response status:', response.status);
      console.log('📥 Content-Type:', response.headers.get('content-type'));

      // Check response status first
      if (!response.ok) {
        const contentType = response.headers.get('content-type') || '';
        
        if (contentType.includes('application/json')) {
          const errorData = await response.json();
          console.error('❌ Backend JSON error:', errorData);
          throw new Error(errorData.message || `Backend error (${response.status})`);
        } else {
          // HTML or other non-JSON response
          const text = await response.text();
          console.error('❌ Backend returned non-JSON response (status: ' + response.status + ')');
          console.error('Response preview:', text.substring(0, 300));
          throw new Error(`Backend error (${response.status}): The server returned an error. Check that your backend is running correctly.`);
        }
      }

      // Check if response is JSON before parsing
      const contentType = response.headers.get('content-type') || '';
      if (!contentType.includes('application/json')) {
        const text = await response.text();
        console.error('❌ Non-JSON response received:', contentType);
        console.error('Response preview:', text.substring(0, 300));
        throw new Error('Backend error: Expected JSON response but received ' + (contentType || 'HTML'));
      }

      const data = await response.json();
      console.log('✅ Backend response received');

      if (!data.data || !data.data.token || !data.data.user) {
        console.error('❌ Invalid backend response format:', data);
        throw new Error('Backend returned invalid response format');
      }

      console.log('✅ Backend verification successful');

      // Save session token to localStorage
      localStorage.setItem('token', data.data.token);
      localStorage.setItem('user', JSON.stringify(data.data.user));

      // Callback to parent component
      onVerificationSuccess && onVerificationSuccess(data.data);

    } catch (err) {
      console.error('❌ Error sending token to backend:', err);
      const errorMessage = err.message || 'Session creation failed';
      
      if (err.message?.includes('Failed to fetch') || err.message?.includes('NetworkError')) {
        setError('❌ Network error: Backend is unreachable. Check your connection and ensure the backend is running.');
      } else if (err.message?.includes('Backend error')) {
        setError('❌ ' + errorMessage);
      } else if (err.message?.includes('JSON')) {
        setError('❌ Backend error: Server returned an invalid response. Please contact support.');
      } else {
        setError(`❌ ${errorMessage}`);
      }
      
      onVerificationFailed && onVerificationFailed(err);
    }
  };

  // Format time display
  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="firebase-2fa-container">
      {/* reCAPTCHA container */}
      <div id="recaptcha-container"></div>

      {!showOtpInput ? (
        // Step 1: Send OTP
        <div className="otp-send-section">
          <h3>Two-Factor Authentication</h3>
          <p>An OTP will be sent to {phoneNumber}</p>

          {error && (
            <div className="error-message" style={{ color: 'red', marginBottom: '10px' }}>
              {error}
            </div>
          )}

          <button
            onClick={handleSendOTP}
            disabled={isLoading}
            style={{
              padding: '10px 20px',
              backgroundColor: '#007bff',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: isLoading ? 'not-allowed' : 'pointer'
            }}
          >
            {isLoading ? 'Sending OTP...' : 'Send OTP via SMS'}
          </button>
        </div>
      ) : (
        // Step 2: Verify OTP
        <div className="otp-verify-section">
          <h3>Enter OTP</h3>
          <p>Enter the 6-digit code sent to {phoneNumber}</p>

          {error && (
            <div className="error-message" style={{ color: 'red', marginBottom: '10px' }}>
              {error}
            </div>
          )}

          <input
            type="text"
            value={otp}
            onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
            placeholder="Enter 6-digit OTP"
            maxLength="6"
            style={{
              width: '100%',
              padding: '10px',
              fontSize: '18px',
              letterSpacing: '5px',
              textAlign: 'center',
              marginBottom: '10px',
              border: '1px solid #ddd',
              borderRadius: '4px'
            }}
            disabled={isLoading || timeLeft === 0}
          />

          <div style={{ marginBottom: '10px', fontSize: '12px', color: '#666' }}>
            Expires in: <strong>{formatTime(timeLeft)}</strong>
          </div>

          <div style={{ display: 'flex', gap: '10px' }}>
            <button
              onClick={handleVerifyOTP}
              disabled={isLoading || otp.length !== 6 || timeLeft === 0}
              style={{
                flex: 1,
                padding: '10px',
                backgroundColor: '#28a745',
                color: 'white',
                border: 'none',
                borderRadius: '4px',
                cursor: isLoading ? 'not-allowed' : 'pointer'
              }}
            >
              {isLoading ? 'Verifying...' : 'Verify OTP'}
            </button>

            <button
              onClick={() => {
                setShowOtpInput(false);
                setOtp('');
                setError('');
              }}
              disabled={isLoading}
              style={{
                padding: '10px 20px',
                backgroundColor: '#6c757d',
                color: 'white',
                border: 'none',
                borderRadius: '4px',
                cursor: isLoading ? 'not-allowed' : 'pointer'
              }}
            >
              Back
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default FirebasePhoneAuth2FA;
