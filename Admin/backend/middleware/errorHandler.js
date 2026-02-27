const fs = require('fs');
const path = require('path');

// Create logs directory if it doesn't exist
const logsDir = path.join(__dirname, '../logs');
if (!fs.existsSync(logsDir)) {
  fs.mkdirSync(logsDir);
}

// Write error to log file
const writeErrorLog = (error, req) => {
  const timestamp = new Date().toISOString();
  const logEntry = {
    timestamp,
    method: req.method,
    url: req.originalUrl,
    ip: req.ip || req.connection.remoteAddress,
    userAgent: req.get('User-Agent'),
    error: {
      message: error.message,
      stack: error.stack,
      status: error.status || 500
    },
    body: req.body,
    query: req.query,
    params: req.params
  };

  const logFileName = `error-${new Date().toISOString().split('T')[0]}.log`;
  const logFilePath = path.join(logsDir, logFileName);
  
  fs.appendFileSync(logFilePath, JSON.stringify(logEntry) + '\n');
};

// Centralized error handling middleware
const errorHandler = (err, req, res, next) => {
  // Log the error
  writeErrorLog(err, req);

  // Don't send error stack in production
  const isDevelopment = process.env.NODE_ENV === 'development';
  
  let error = { ...err };
  error.message = err.message;

  // Mongoose validation error
  if (err.name === 'ValidationError') {
    const message = Object.values(err.errors).map(val => val.message).join(', ');
    error = {
      message: 'Validation Error',
      details: message,
      status: 400
    };
  }

  // Mongoose duplicate key error
  if (err.code === 11000) {
    const field = Object.keys(err.keyValue)[0];
    error = {
      message: 'Duplicate field error',
      details: `${field} already exists`,
      status: 400
    };
  }

  // Mongoose cast error
  if (err.name === 'CastError') {
    error = {
      message: 'Invalid ID format',
      details: 'Resource not found',
      status: 404
    };
  }

  // JWT error
  if (err.name === 'JsonWebTokenError') {
    error = {
      message: 'Invalid token',
      details: 'Please log in again',
      status: 401
    };
  }

  // JWT expired error
  if (err.name === 'TokenExpiredError') {
    error = {
      message: 'Token expired',
      details: 'Please log in again',
      status: 401
    };
  }

  // Multer file upload error
  if (err.code === 'LIMIT_FILE_SIZE') {
    error = {
      message: 'File too large',
      details: 'File size exceeds the maximum allowed limit',
      status: 400
    };
  }

  // Send error response
  res.status(error.status || 500).json({
    success: false,
    error: {
      message: error.message || 'Internal Server Error',
      ...(isDevelopment && { stack: err.stack }),
      ...(error.details && { details: error.details })
    }
  });
};

// Async error wrapper
const asyncHandler = (fn) => {
  return (req, res, next) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
};

// 404 handler
const notFound = (req, res, next) => {
  const error = new Error(`Not Found - ${req.originalUrl}`);
  error.status = 404;
  next(error);
};

module.exports = {
  errorHandler,
  asyncHandler,
  notFound,
  writeErrorLog
};
