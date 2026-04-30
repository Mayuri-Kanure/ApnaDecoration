import React, { createContext, useContext, useEffect } from 'react';
import SecurityService from '../services/securityService';

const SecurityContext = createContext();

export const useSecurity = () => {
  const context = useContext(SecurityContext);
  if (!context) {
    throw new Error('useSecurity must be used within a SecurityProvider');
  }
  return context;
};

export const SecurityProvider = ({ children }) => {
  useEffect(() => {
    // Load CSRF token on mount
    SecurityService.loadCSRFToken();

    // Set up security headers for API calls
    const originalFetch = window.fetch;
    
    window.fetch = function(url, options = {}) {
      // Add CSRF token to POST/PUT/DELETE requests
      if (['POST', 'PUT', 'DELETE', 'PATCH'].includes(options.method?.toUpperCase())) {
        const csrfToken = SecurityService.getCSRFToken();
        if (csrfToken) {
          options.headers = {
            ...options.headers,
            'X-CSRF-Token': csrfToken
          };
        }
      }

      // Add security headers
      options.headers = {
        ...options.headers,
        'X-Requested-With': 'XMLHttpRequest'
      };

      return originalFetch(url, options).then(response => {
        // Extract CSRF token from response headers
        const csrfToken = response.headers.get('X-CSRF-Token');
        if (csrfToken) {
          SecurityService.setCSRFToken(csrfToken);
        }
        
        return response;
      });
    };

    // Cleanup on unmount
    return () => {
      window.fetch = originalFetch;
    };
  }, []);

  const validateInput = (input) => {
    if (SecurityService.detectSuspiciousActivity(input)) {
      throw new Error('Suspicious content detected');
    }
    return SecurityService.sanitizeInput(input);
  };

  const validateForm = (formData) => {
    const errors = {};

    // Email validation
    if (formData.email && !SecurityService.validateEmail(formData.email)) {
      errors.email = 'Invalid email address';
    }

    // Phone validation
    if (formData.phone && !SecurityService.validatePhone(formData.phone)) {
      errors.phone = 'Invalid phone number';
    }

    // Password strength validation
    if (formData.password) {
      const passwordCheck = SecurityService.checkPasswordStrength(formData.password);
      if (!passwordCheck.isStrong) {
        errors.password = passwordCheck.feedback.join(', ');
      }
    }

    // Suspicious content check
    Object.keys(formData).forEach(key => {
      if (typeof formData[key] === 'string' && SecurityService.detectSuspiciousActivity(formData[key])) {
        errors[key] = 'Contains suspicious content';
      }
    });

    return {
      isValid: Object.keys(errors).length === 0,
      errors
    };
  };

  const secureStorage = SecurityService.secureStorage;

  const value = {
    validateInput,
    validateForm,
    secureStorage,
    SecurityService
  };

  return (
    <SecurityContext.Provider value={value}>
      {children}
    </SecurityContext.Provider>
  );
};

export default SecurityProvider;
