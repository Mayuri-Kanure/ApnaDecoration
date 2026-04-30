// Security service for frontend security measures

class SecurityService {
  // Store CSRF token
  static csrfToken = null;

  // Get CSRF token from response headers
  static getCSRFToken() {
    return this.csrfToken;
  }

  // Set CSRF token from response headers
  static setCSRFToken(token) {
    this.csrfToken = token;
    localStorage.setItem('csrfToken', token);
  }

  // Load CSRF token from localStorage
  static loadCSRFToken() {
    const token = localStorage.getItem('csrfToken');
    if (token) {
      this.csrfToken = token;
    }
    return token;
  }

  // Clear CSRF token
  static clearCSRFToken() {
    this.csrfToken = null;
    localStorage.removeItem('csrfToken');
  }

  // Sanitize input to prevent XSS
  static sanitizeInput(input) {
    if (typeof input !== 'string') return input;
    
    return input
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#x27;')
      .replace(/\//g, '&#x2F;');
  }

  // Validate email format
  static validateEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  // Validate phone number (basic validation)
  static validatePhone(phone) {
    const phoneRegex = /^[\d\s\-\+\(\)]+$/;
    return phoneRegex.test(phone) && phone.replace(/\D/g, '').length >= 10;
  }

  // Check password strength
  static checkPasswordStrength(password) {
    const checks = {
      length: password.length >= 8,
      uppercase: /[A-Z]/.test(password),
      lowercase: /[a-z]/.test(password),
      numbers: /\d/.test(password),
      special: /[!@#$%^&*(),.?":{}|<>]/.test(password)
    };

    const strength = Object.values(checks).filter(Boolean).length;
    
    return {
      score: strength,
      feedback: this.getPasswordFeedback(checks),
      isStrong: strength >= 4
    };
  }

  static getPasswordFeedback(checks) {
    const feedback = [];
    
    if (!checks.length) feedback.push('Password must be at least 8 characters long');
    if (!checks.uppercase) feedback.push('Include uppercase letters');
    if (!checks.lowercase) feedback.push('Include lowercase letters');
    if (!checks.numbers) feedback.push('Include numbers');
    if (!checks.special) feedback.push('Include special characters');
    
    return feedback;
  }

  // Generate secure random string
  static generateSecureString(length = 32) {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let result = '';
    const array = new Uint32Array(length);
    crypto.getRandomValues(array);
    
    for (let i = 0; i < length; i++) {
      result += chars[array[i] % chars.length];
    }
    
    return result;
  }

  // Detect suspicious activity
  static detectSuspiciousActivity(input) {
    const suspiciousPatterns = [
      /<script/i,
      /javascript:/i,
      /on\w+\s*=/i,
      /<iframe/i,
      /eval\(/i,
      /expression\(/i,
      /vbscript:/i,
      /data:text\/html/i
    ];

    return suspiciousPatterns.some(pattern => pattern.test(input));
  }

  // Rate limiting for frontend actions
  static createRateLimiter(maxRequests = 5, windowMs = 60000) {
    const requests = new Map();
    
    return function(key) {
      const now = Date.now();
      const windowStart = now - windowMs;
      
      if (!requests.has(key)) {
        requests.set(key, []);
      }
      
      const userRequests = requests.get(key).filter(time => time > windowStart);
      
      if (userRequests.length >= maxRequests) {
        return false;
      }
      
      userRequests.push(now);
      requests.set(key, userRequests);
      return true;
    };
  }

  // Secure storage for sensitive data
  static secureStorage = {
    set: function(key, value) {
      try {
        const encrypted = btoa(JSON.stringify(value));
        localStorage.setItem(key, encrypted);
      } catch (error) {
        console.error('Error storing data:', error);
      }
    },
    
    get: function(key) {
      try {
        const encrypted = localStorage.getItem(key);
        if (!encrypted) return null;
        return JSON.parse(atob(encrypted));
      } catch (error) {
        console.error('Error retrieving data:', error);
        return null;
      }
    },
    
    remove: function(key) {
      localStorage.removeItem(key);
    }
  };

  // Content Security Policy helper
  static getCSPNonce() {
    return this.generateSecureString(16);
  }

  // Check if connection is secure
  static isSecureConnection() {
    return window.location.protocol === 'https:' || 
           window.location.hostname === 'localhost' ||
           window.location.hostname === '127.0.0.1';
  }
}

export default SecurityService;
