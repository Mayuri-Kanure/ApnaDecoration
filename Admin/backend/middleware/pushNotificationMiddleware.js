const rateLimit = require('express-rate-limit');

/**
 * Rate Limiting Middleware for Push Notifications
 * 
 * Prevents abuse of broadcast notification endpoints by limiting:
 * - Number of requests per admin per minute
 * - Number of devices that can receive broadcasts
 * - Protects from DOS attacks and accidental bulk sends
 */

/**
 * Broadcast notification rate limiter
 * Limits: 10 broadcasts per admin per minute
 * 
 * Prevents admin from accidentally or maliciously sending too many broadcasts
 */
const broadcastLimiter = rateLimit({
  windowMs: 1 * 60 * 1000, // 1 minute window
  max: 10, // Limit each IP to 10 requests per windowMs
  message: {
    success: false,
    message: 'Too many broadcast requests. Maximum 10 broadcasts per minute. Please try again later.'
  },
  standardHeaders: true, // Return rate limit info in `RateLimit-*` headers
  legacyHeaders: false, // Disable `X-RateLimit-*` headers
  skip: (req) => {
    // Optional: Skip rate limiting for specific conditions
    // Example: Allow system admins unlimited broadcasts
    if (req.user && req.user.role === 'super-admin') {
      console.log('👑 Super admin bypass - rate limiting skipped');
      return true;
    }
    return false;
  },
  handler: (req, res) => {
    console.warn(`⚠️ Rate limit exceeded for admin: ${req.user?._id || req.ip}`);
    res.status(429).json({
      success: false,
      message: 'Too many broadcast requests. Maximum 10 per minute.',
      retryAfter: req.rateLimit.resetTime
    });
  }
});

/**
 * Sensitive broadcast limiter
 * More restrictive: 3 broadcasts per admin per 5 minutes
 * 
 * Use this for operations that are more expensive or sensitive:
 * - Global broadcasts to ALL users
 * - Bulk promotions
 * - Critical system notifications
 */
const sensitiveBroadcastLimiter = rateLimit({
  windowMs: 5 * 60 * 1000, // 5 minute window
  max: 3, // Limit to 3 requests per 5 minutes
  message: {
    success: false,
    message: 'Too many sensitive broadcasts. Maximum 3 per 5 minutes.'
  },
  standardHeaders: true,
  legacyHeaders: false,
  handler: (req, res) => {
    console.warn(`⚠️ Sensitive rate limit exceeded for admin: ${req.user?._id || req.ip}`);
    res.status(429).json({
      success: false,
      message: 'Sensitive broadcast limit exceeded. Maximum 3 per 5 minutes.',
      retryAfter: req.rateLimit.resetTime
    });
  }
});

/**
 * Device payload validator - Prevents oversized broadcasts
 * 
 * Middleware to validate that broadcasts don't exceed safe limits:
 * - Max 10,000 devices per broadcast
 * - Max 4KB payload size
 * - Max 100 characters for notification title
 * - Max 240 characters for notification body
 */
const validateBroadcastPayload = (req, res, next) => {
  try {
    const { deviceTokens, notification, data } = req.body;

    // Validate device tokens array
    if (!Array.isArray(deviceTokens)) {
      return res.status(400).json({
        success: false,
        message: 'deviceTokens must be an array'
      });
    }

    if (deviceTokens.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'At least one device token required'
      });
    }

    // Limit broadcast size (prevent sending to too many devices at once)
    if (deviceTokens.length > 10000) {
      console.warn(`⚠️ Broadcast rejected: ${deviceTokens.length} devices exceeds limit of 10,000`);
      return res.status(400).json({
        success: false,
        message: 'Broadcast exceeds device limit (max 10,000 devices per request)',
        devicesRequested: deviceTokens.length
      });
    }

    // Validate notification object
    if (!notification || typeof notification !== 'object') {
      return res.status(400).json({
        success: false,
        message: 'notification object required'
      });
    }

    // Validate notification title
    if (!notification.title || typeof notification.title !== 'string') {
      return res.status(400).json({
        success: false,
        message: 'Notification title required (string)'
      });
    }

    if (notification.title.length > 100) {
      return res.status(400).json({
        success: false,
        message: `Notification title too long (max 100 characters, got ${notification.title.length})`
      });
    }

    // Validate notification body
    if (!notification.body || typeof notification.body !== 'string') {
      return res.status(400).json({
        success: false,
        message: 'Notification body required (string)'
      });
    }

    if (notification.body.length > 240) {
      return res.status(400).json({
        success: false,
        message: `Notification body too long (max 240 characters, got ${notification.body.length})`
      });
    }

    // Validate total payload size (FCM has strict limits)
    const payloadSize = JSON.stringify(req.body).length;
    if (payloadSize > 4096) {
      console.warn(`⚠️ Broadcast payload too large: ${payloadSize} bytes`);
      return res.status(400).json({
        success: false,
        message: `Broadcast payload too large (max 4KB, got ${(payloadSize / 1024).toFixed(2)}KB)`
      });
    }

    console.log(`✅ Broadcast payload validated: ${deviceTokens.length} devices, ${payloadSize} bytes`);
    next();

  } catch (error) {
    console.error('❌ Error validating broadcast payload:', error.message);
    res.status(500).json({
      success: false,
      message: 'Payload validation error'
    });
  }
};

/**
 * Broadcast audit logger
 * Logs all broadcast operations for compliance and debugging
 */
const auditBroadcast = (req, res, next) => {
  const originalJson = res.json;

  res.json = function(data) {
    if (data.success) {
      console.log(`📢 [BROADCAST AUDIT] Admin: ${req.user?._id || 'unknown'}`);
      console.log(`   Devices: ${req.body.deviceTokens?.length || 0}`);
      console.log(`   Title: "${req.body.notification?.title}"`);
      console.log(`   Success: ${data.totalSuccess || 'pending'}`);
      console.log(`   Failed: ${data.totalFailed || 0}`);
      console.log(`   Timestamp: ${new Date().toISOString()}`);
    } else {
      console.warn(`❌ [BROADCAST FAILED] Admin: ${req.user?._id || 'unknown'}`);
      console.warn(`   Error: ${data.message}`);
      console.warn(`   Timestamp: ${new Date().toISOString()}`);
    }

    return originalJson.call(this, data);
  };

  next();
};

module.exports = {
  broadcastLimiter,
  sensitiveBroadcastLimiter,
  validateBroadcastPayload,
  auditBroadcast
};
