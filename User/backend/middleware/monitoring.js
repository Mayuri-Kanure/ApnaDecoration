const winston = require('winston');
const path = require('path');

// Create logs directory if it doesn't exist
const logsDir = path.join(__dirname, '../logs');
require('fs').mkdirSync(logsDir, { recursive: true });

// Define log levels
const levels = {
  error: 0,
  warn: 1,
  info: 2,
  http: 3,
  debug: 4
};

// Define colors for console output
const colors = {
  error: '\x1b[31m',
  warn: '\x1b[33m',
  info: '\x1b[36m',
  http: '\x1b[35m',
  debug: '\x1b[37m',
  reset: '\x1b[0m'
};

// Custom format for winston
const format = winston.format.combine(
  winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
  winston.format.errors({ stack: true }),
  winston.format.json()
);

// Create winston logger
const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || 'info',
  format,
  defaultMeta: { service: 'apna-decoration-user-backend' },
  transports: [
    // Error log file
    new winston.transports.File({
      filename: path.join(logsDir, 'error.log'),
      level: 'error',
      maxsize: 5242880, // 5MB
      maxFiles: 5,
      format: winston.format.combine(
        winston.format.timestamp(),
        winston.format.errors({ stack: true }),
        winston.format.json()
      )
    }),
    
    // Combined log file
    new winston.transports.File({
      filename: path.join(logsDir, 'combined.log'),
      maxsize: 5242880, // 5MB
      maxFiles: 5,
      format: winston.format.combine(
        winston.format.timestamp(),
        winston.format.errors({ stack: true }),
        winston.format.json()
      )
    }),
    
    // Console output with colors
    new winston.transports.Console({
      format: winston.format.combine(
        winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
        winston.format.printf(({ timestamp, level, message, stack, ...meta }) => {
          const color = colors[level] || colors.reset;
          let log = `${color}[${timestamp}] ${level.toUpperCase()}${colors.reset} ${message}`;
          
          if (stack) {
            log += `\n${color}${stack}${colors.reset}`;
          }
          
          if (Object.keys(meta).length > 0) {
            log += `\n${color}${JSON.stringify(meta, null, 2)}${colors.reset}`;
          }
          
          return log;
        })
      )
    })
  ]
});

// Create a stream for Morgan HTTP logging
logger.stream = {
  write: (message) => {
    logger.http(message);
  }
};

// Performance monitoring
class PerformanceMonitor {
  constructor() {
    this.requests = new Map();
    this.metrics = {
      totalRequests: 0,
      totalErrors: 0,
      totalResponseTime: 0,
      averageResponseTime: 0,
      requestsPerMinute: 0,
      errorRate: 0
    };
    this.startTime = Date.now();
    this.lastMinuteRequests = [];
  }

  // Track request start
  startRequest(req) {
    const id = req.id || this.generateRequestId();
    const startTime = Date.now();
    
    this.requests.set(id, {
      id,
      method: req.method,
      url: req.url,
      userAgent: req.get('User-Agent'),
      ip: req.ip || req.connection.remoteAddress,
      startTime,
      timestamp: new Date().toISOString()
    });
    
    return id;
  }

  // Track request end
  endRequest(id, statusCode) {
    const request = this.requests.get(id);
    if (!request) return;

    const endTime = Date.now();
    const responseTime = endTime - request.startTime;

    // Update metrics
    this.metrics.totalRequests++;
    this.metrics.totalResponseTime += responseTime;
    this.metrics.averageResponseTime = this.metrics.totalResponseTime / this.metrics.totalRequests;

    if (statusCode >= 400) {
      this.metrics.totalErrors++;
    }

    // Track requests per minute
    this.lastMinuteRequests.push({
      timestamp: endTime,
      statusCode,
      responseTime
    });

    // Keep only last minute of requests
    const oneMinuteAgo = endTime - 60000;
    this.lastMinuteRequests = this.lastMinuteRequests.filter(req => req.timestamp > oneMinuteAgo);
    this.metrics.requestsPerMinute = this.lastMinuteRequests.length;

    // Calculate error rate
    this.metrics.errorRate = (this.metrics.totalErrors / this.metrics.totalRequests) * 100;

    // Log performance data
    logger.info('Request completed', {
      requestId: id,
      method: request.method,
      url: request.url,
      statusCode,
      responseTime: `${responseTime}ms`,
      userAgent: request.userAgent,
      ip: request.ip,
      metrics: this.getMetrics()
    });

    // Clean up
    this.requests.delete(id);
  }

  // Generate unique request ID
  generateRequestId() {
    return `req_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  // Get current metrics
  getMetrics() {
    const uptime = Date.now() - this.startTime;
    return {
      ...this.metrics,
      uptime: `${Math.floor(uptime / 1000)}s`,
      memoryUsage: process.memoryUsage(),
      cpuUsage: process.cpuUsage()
    };
  }

  // Get slow requests
  getSlowRequests(threshold = 1000) {
    return this.lastMinuteRequests
      .filter(req => req.responseTime > threshold)
      .sort((a, b) => b.responseTime - a.responseTime);
  }

  // Get error requests
  getErrorRequests() {
    return this.lastMinuteRequests
      .filter(req => req.statusCode >= 400)
      .sort((a, b) => b.timestamp - a.timestamp);
  }
}

// Create performance monitor instance
const performanceMonitor = new PerformanceMonitor();

// Request ID middleware
const requestId = (req, res, next) => {
  req.id = performanceMonitor.startRequest(req);
  
  res.on('finish', () => {
    performanceMonitor.endRequest(req.id, res.statusCode);
  });
  
  next();
};

// Request logging middleware
const requestLogger = (req, res, next) => {
  const start = Date.now();
  
  res.on('finish', () => {
    const duration = Date.now() - start;
    
    logger.info('HTTP Request', {
      method: req.method,
      url: req.url,
      statusCode: res.statusCode,
      duration: `${duration}ms`,
      userAgent: req.get('User-Agent'),
      ip: req.ip || req.connection.remoteAddress,
      contentLength: res.get('Content-Length')
    });
  });
  
  next();
};

// Error logging middleware
const errorLogger = (err, req, res, next) => {
  logger.error('Unhandled Error', {
    error: {
      message: err.message,
      stack: err.stack,
      name: err.name
    },
    request: {
      method: req.method,
      url: req.url,
      headers: req.headers,
      body: req.body,
      params: req.params,
      query: req.query,
      user: req.user
    },
    timestamp: new Date().toISOString()
  });
  
  next(err);
};

// Database logging middleware
const databaseLogger = (req, res, next) => {
  const originalSend = res.send;
  
  res.send = function(data) {
    // Log database operations
    if (req.method === 'POST' || req.method === 'PUT' || req.method === 'DELETE') {
      logger.info('Database Operation', {
        method: req.method,
        url: req.url,
        operation: req.method,
        collection: req.path.split('/')[2], // Extract collection from path
        statusCode: res.statusCode,
        dataSize: data ? JSON.stringify(data).length : 0,
        user: req.user?.id || 'anonymous'
      });
    }
    
    return originalSend.call(this, data);
  };
  
  next();
};

// Security logging middleware
const securityLogger = (req, res, next) => {
  // Log suspicious activities
  const suspiciousPatterns = [
    /\.\./,  // Directory traversal
    /<script/i,  // XSS attempts
    /union/i,  // SQL injection attempts
    /drop\s+table/i,  // SQL injection attempts
    /exec\s*\(/i,  // Command injection attempts
  ];

  const isSuspicious = suspiciousPatterns.some(pattern => 
    pattern.test(req.url) || 
    pattern.test(JSON.stringify(req.body)) ||
    pattern.test(req.query?.search || '')
  );

  if (isSuspicious) {
    logger.warn('Suspicious Activity Detected', {
      ip: req.ip || req.connection.remoteAddress,
      userAgent: req.get('User-Agent'),
      method: req.method,
      url: req.url,
      body: req.body,
      query: req.query,
      timestamp: new Date().toISOString()
    });
  }

  // Log authentication attempts
  if (req.path.includes('/auth/') || req.path.includes('/login')) {
    logger.info('Authentication Attempt', {
      ip: req.ip || req.connection.remoteAddress,
      userAgent: req.get('User-Agent'),
      method: req.method,
      path: req.path,
      body: req.body ? { ...req.body, password: '[REDACTED]' } : {},
      timestamp: new Date().toISOString()
    });
  }

  next();
};

// API rate limiting monitoring
const rateLimitLogger = (req, res, next) => {
  const rateLimitInfo = req.rateLimit;
  
  if (rateLimitInfo) {
    logger.warn('Rate Limit Exceeded', {
      ip: req.ip || req.connection.remoteAddress,
      userAgent: req.get('User-Agent'),
      method: req.method,
      url: req.url,
      limit: rateLimitInfo.limit,
      current: rateLimitInfo.current,
      remaining: rateLimitInfo.remaining,
      resetTime: rateLimitInfo.resetTime,
      timestamp: new Date().toISOString()
    });
  }
  
  next();
};

// Health check endpoint
const healthCheck = (req, res) => {
  const health = {
    status: 'OK',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    environment: process.env.NODE_ENV || 'development',
    memory: process.memoryUsage(),
    cpu: process.cpuUsage(),
    metrics: performanceMonitor.getMetrics(),
    database: {
      connected: true // This should be checked against actual DB connection
    }
  };

  res.status(200).json(health);
};

// Metrics endpoint
const getMetrics = (req, res) => {
  const metrics = {
    ...performanceMonitor.getMetrics(),
    slowRequests: performanceMonitor.getSlowRequests(),
    errorRequests: performanceMonitor.getErrorRequests(),
    timestamp: new Date().toISOString()
  };

  res.status(200).json(metrics);
};

// Log rotation (would be handled by winston file rotation)
const logRotation = {
  // Winston handles this automatically with maxFiles and maxsize options
};

module.exports = {
  logger,
  performanceMonitor,
  requestId,
  requestLogger,
  errorLogger,
  databaseLogger,
  securityLogger,
  rateLimitLogger,
  healthCheck,
  getMetrics,
  logRotation
};
