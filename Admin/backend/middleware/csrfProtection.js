const crypto = require('crypto');

// Generate CSRF token
const generateCSRFToken = () => {
  return crypto.randomBytes(32).toString('hex');
};

// CSRF protection middleware
const csrfProtection = (req, res, next) => {
  // Skip CSRF for GET, HEAD, OPTIONS requests
  if (['GET', 'HEAD', 'OPTIONS'].includes(req.method)) {
    return next();
  }

  const token = req.headers['x-csrf-token'];
  const sessionToken = req.session?.csrfToken;

  if (!token || !sessionToken || token !== sessionToken) {
    return res.status(403).json({ 
      message: 'CSRF token validation failed',
      error: 'Invalid or missing CSRF token'
    });
  }

  next();
};

// Set CSRF token in session
const setCSRFToken = (req, res, next) => {
  if (!req.session.csrfToken) {
    req.session.csrfToken = generateCSRFToken();
  }
  
  // Send CSRF token to client
  res.setHeader('X-CSRF-Token', req.session.csrfToken);
  next();
};

module.exports = {
  generateCSRFToken,
  csrfProtection,
  setCSRFToken
};
