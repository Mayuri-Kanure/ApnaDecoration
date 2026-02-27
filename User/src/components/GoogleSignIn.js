import React, { useEffect, useRef } from 'react';
import { useAuth } from '../contexts/AuthContext';

const GoogleSignIn = ({ 
  onSignInSuccess, 
  onSignInError, 
  buttonText = 'Continue with Google',
  theme = 'outline',
  size = 'large',
  width = 300,
  className = '',
  disabled = false
}) => {
  const { initializeGoogleAuth, renderGoogleButton } = useAuth();
  const buttonRef = useRef(null);
  const [isInitialized, setIsInitialized] = React.useState(false);
  const [error, setError] = React.useState(null);

  useEffect(() => {
    const initialize = async () => {
      try {
        const success = await initializeGoogleAuth();
        if (success) {
          setIsInitialized(true);
          if (buttonRef.current) {
            renderGoogleButton(buttonRef.current.id, {
              theme,
              size,
              width,
              text: buttonText.includes('Sign') ? 'signin_with' : 'signup_with'
            });
          }
        }
      } catch (err) {
        setError('Failed to initialize Google Sign-In');
        console.error('Google Sign-In initialization error:', err);
      }
    };

    initialize();
  }, [initializeGoogleAuth, renderGoogleButton, theme, size, width, buttonText]);

  if (error) {
    return (
      <div className={`google-sign-in-error ${className}`}>
        <p className="text-red-500 text-sm">Google Sign-In temporarily unavailable</p>
        <button
          className="mt-2 px-4 py-2 bg-gray-200 text-gray-700 rounded hover:bg-gray-300 transition-colors"
          onClick={() => window.location.reload()}
        >
          Retry
        </button>
      </div>
    );
  }

  if (!isInitialized) {
    return (
      <div className={`google-sign-in-loading ${className}`}>
        <div className="w-full h-12 bg-gray-100 rounded-lg animate-pulse flex items-center justify-center">
          <div className="w-6 h-6 border-2 border-gray-300 border-t-blue-600 rounded-full animate-spin"></div>
        </div>
      </div>
    );
  }

  return (
    <div className={`google-sign-in-container ${className}`}>
      <div
        ref={buttonRef}
        id={`google-signin-button-${Date.now()}`}
        className={disabled ? 'opacity-50 pointer-events-none' : ''}
      />
    </div>
  );
};

export default GoogleSignIn;
