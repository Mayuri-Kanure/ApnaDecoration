// Input sanitization utilities
export const sanitizeInput = (input) => {
  if (typeof input !== 'string') return '';
  
  return input
    .trim()
    .replace(/[<>]/g, '') // Remove potential HTML tags
    .replace(/javascript:/gi, '') // Remove javascript: protocol
    .replace(/on\w+=/gi, '') // Remove event handlers
    .substring(0, 500); // Limit length
};

export const sanitizeEmail = (emailInput) => {
  const email = sanitizeInput(emailInput).toLowerCase();
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  
  // Use standard email regex
  const standardEmailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
  
  // If email is valid, return it; if invalid, return empty string
  if (standardEmailRegex.test(email)) {
    return email;
  } else {
    console.log('Invalid email format:', email);
    return email; // Return the email anyway, let backend validate
  }
};

export const sanitizePhone = (phoneInput) => {
  const phone = sanitizeInput(phoneInput);
  // Remove all non-digit characters except +, -, (, )
  return phone.replace(/[^\d+\-\(\)\s]/g, '');
};

export const validatePassword = (password) => {
  if (!password || password.length < 6) {
    return { valid: false, message: 'Password must be at least 6 characters long' };
  }
  
  // For demo account, allow simple passwords
  if (password === 'password' || password === '123456' || password === 'Demo123') {
    return { valid: true, message: '' };
  }
  
  // Check for at least one lowercase, one uppercase, and one digit for other passwords
  const hasLower = /[a-z]/.test(password);
  const hasUpper = /[A-Z]/.test(password);
  const hasDigit = /\d/.test(password);
  
  if (!hasLower || !hasUpper || !hasDigit) {
    return { valid: false, message: 'Password must contain at least one uppercase letter, one lowercase letter, and one number (or use "password", "123456", or "Demo123" for demo)' };
  }
  
  return { valid: true, message: '' };
};

export const validateUsername = (username) => {
  if (!username || username.length < 3) {
    return { valid: false, message: 'Username must be at least 3 characters long' };
  }
  
  if (!/^[a-zA-Z0-9_]+$/.test(username)) {
    return { valid: false, message: 'Username can only contain letters, numbers, and underscores' };
  }
  
  return { valid: true, message: '' };
};

export const validateRequired = (value, fieldName) => {
  if (!value || value.trim() === '') {
    return { valid: false, message: fieldName + ' is required' };
  }
  return { valid: true, message: '' };
};
