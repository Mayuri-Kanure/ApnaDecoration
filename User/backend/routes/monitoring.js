const express = require('express');
const router = express.Router();
const { 
  logger, 
  performanceMonitor, 
  healthCheck, 
  getMetrics 
} = require('../middleware/monitoring');
const { auth } = require('../middleware/auth');

// Health check endpoint
router.get('/health', healthCheck);

// Metrics endpoint
router.get('/metrics', [
  auth
], getMetrics);

// Logs endpoint (admin only)
router.get('/logs', [
  auth
], (req, res) => {
  try {
    const fs = require('fs');
    const path = require('path');
    const logsDir = path.join(__dirname, '../logs');
    
    // Get available log files
    const logFiles = fs.readdirSync(logsDir)
      .filter(file => file.endsWith('.log'))
      .map(file => ({
        name: file,
        path: path.join(logsDir, file),
        size: fs.statSync(path.join(logsDir, file)).size,
        modified: fs.statSync(path.join(logsDir, file)).mtime
      }))
      .sort((a, b) => b.modified - a.modified);

    res.json({
      success: true,
      data: logFiles
    });
  } catch (error) {
    logger.error('Error reading log files:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to read log files'
    });
  }
});

// Get specific log file content
router.get('/logs/:filename', [
  auth
], (req, res) => {
  try {
    const fs = require('fs');
    const path = require('path');
    const { filename } = req.params;
    const { lines = 100, level = 'info' } = req.query;
    
    const logPath = path.join(__dirname, '../logs', filename);
    
    // Security check - only allow .log files
    if (!filename.endsWith('.log')) {
      return res.status(400).json({
        success: false,
        message: 'Invalid file type'
      });
    }
    
    if (!fs.existsSync(logPath)) {
      return res.status(404).json({
        success: false,
        message: 'Log file not found'
      });
    }
    
    // Read file content
    const content = fs.readFileSync(logPath, 'utf8');
    const logLines = content.split('\n').filter(line => line.trim());
    
    // Filter by level if specified
    let filteredLines = logLines;
    if (level && level !== 'all') {
      filteredLines = logLines.filter(line => {
        try {
          const logEntry = JSON.parse(line);
          return logEntry.level === level;
        } catch {
          return false;
        }
      });
    }
    
    // Get last N lines
    const lastLines = filteredLines.slice(-lines);
    
    res.json({
      success: true,
      data: {
        filename,
        totalLines: logLines.length,
        filteredLines: filteredLines.length,
        lines: lastLines
      }
    });
  } catch (error) {
    logger.error('Error reading log file:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to read log file'
    });
  }
});

// System information
router.get('/system', [
  auth
], (req, res) => {
  try {
    const os = require('os');
    const process = require('process');
    
    const systemInfo = {
      hostname: os.hostname(),
      platform: os.platform(),
      arch: os.arch(),
      nodeVersion: process.version,
      uptime: os.uptime(),
      loadAverage: os.loadavg(),
      totalMemory: os.totalmem(),
      freeMemory: os.freemem(),
      usedMemory: os.totalmem() - os.freemem(),
      cpus: os.cpus(),
      networkInterfaces: os.networkInterfaces(),
      timestamp: new Date().toISOString()
    };
    
    res.json({
      success: true,
      data: systemInfo
    });
  } catch (error) {
    logger.error('Error getting system information:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get system information'
    });
  }
});

// Database status
router.get('/database', [
  auth
], async (req, res) => {
  try {
    const mongoose = require('mongoose');
    
    const dbStatus = {
      connected: mongoose.connection.readyState === 1,
      host: mongoose.connection.host,
      port: mongoose.connection.port,
      name: mongoose.connection.name,
      readyState: mongoose.connection.readyState,
      collections: [],
      timestamp: new Date().toISOString()
    };
    
    // Get collection information if connected
    if (dbStatus.connected) {
      const collections = await mongoose.connection.db.listCollections().toArray();
      dbStatus.collections = collections.map(col => ({
        name: col.name,
        type: col.type,
        count: 0 // Would need to implement actual count
      }));
    }
    
    res.json({
      success: true,
      data: dbStatus
    });
  } catch (error) {
    logger.error('Error getting database status:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get database status'
    });
  }
});

// Performance statistics
router.get('/performance', [
  auth
], (req, res) => {
  try {
    const metrics = performanceMonitor.getMetrics();
    const slowRequests = performanceMonitor.getSlowRequests();
    const errorRequests = performanceMonitor.getErrorRequests();
    
    const performanceData = {
      metrics,
      slowRequests: slowRequests.slice(0, 10), // Top 10 slow requests
      errorRequests: errorRequests.slice(0, 10), // Top 10 error requests
      recommendations: generateRecommendations(metrics, slowRequests, errorRequests),
      timestamp: new Date().toISOString()
    };
    
    res.json({
      success: true,
      data: performanceData
    });
  } catch (error) {
    logger.error('Error getting performance data:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get performance data'
    });
  }
});

// Generate performance recommendations
function generateRecommendations(metrics, slowRequests, errorRequests) {
  const recommendations = [];
  
  // Check average response time
  if (metrics.averageResponseTime > 1000) {
    recommendations.push({
      type: 'performance',
      severity: 'warning',
      message: `Average response time is ${metrics.averageResponseTime.toFixed(2)}ms. Consider optimizing slow endpoints.`,
      action: 'Review slow requests and optimize database queries'
    });
  }
  
  // Check error rate
  if (metrics.errorRate > 5) {
    recommendations.push({
      type: 'reliability',
      severity: 'critical',
      message: `Error rate is ${metrics.errorRate.toFixed(2)}%. High error rate detected.`,
      action: 'Review error logs and fix critical issues'
    });
  } else if (metrics.errorRate > 2) {
    recommendations.push({
      type: 'reliability',
      severity: 'warning',
      message: `Error rate is ${metrics.errorRate.toFixed(2)}%. Monitor error trends.`,
      action: 'Investigate common error patterns'
    });
  }
  
  // Check requests per minute
  if (metrics.requestsPerMinute > 1000) {
    recommendations.push({
      type: 'capacity',
      'severity': 'warning',
      message: `High traffic detected: ${metrics.requestsPerMinute} requests/min.`,
      action: 'Consider implementing rate limiting or scaling up'
    });
  }
  
  // Check memory usage
  const memoryUsage = metrics.memoryUsage;
  const memoryUsagePercent = (memoryUsage.heapUsed / memoryUsage.heapTotal) * 100;
  
  if (memoryUsagePercent > 80) {
    recommendations.push({
      type: 'resource',
      severity: 'critical',
      message: `Memory usage is ${memoryUsagePercent.toFixed(2)}%. High memory consumption detected.`,
      action: 'Check for memory leaks and optimize memory usage'
    });
  }
  
  // Check slow requests
  if (slowRequests.length > 0) {
    const slowest = slowRequests[0];
    recommendations.push({
      type: 'performance',
      severity: 'warning',
      message: `Slowest request: ${slowest.method} ${slowest.url} took ${slowest.responseTime}ms`,
      action: 'Optimize database queries and response processing'
    });
  }
  
  // Check error requests
  if (errorRequests.length > 0) {
    const mostCommonError = errorRequests[0];
    recommendations.push({
      type: 'reliability',
      severity: 'warning',
      message: `Most common error: ${mostCommonError.statusCode} ${mostCommonError.url}`,
      action: 'Fix the underlying issue causing this error'
    });
  }
  
  return recommendations;
}

// Clear logs endpoint
router.delete('/logs', [
  auth
], (req, res) => {
  try {
    const fs = require('fs');
    const path = require('path');
    const logsDir = path.join(__dirname, '../logs');
    
    // Get log files
    const logFiles = fs.readdirSync(logsDir)
      .filter(file => file.endsWith('.log'));
    
    // Clear each log file
    logFiles.forEach(file => {
      fs.writeFileSync(path.join(logDir, file), '');
    });
    
    logger.info('Logs cleared by administrator', {
      adminUser: req.user?.id || 'unknown',
      timestamp: new Date().toISOString()
    });
    
    res.json({
      success: true,
      message: `Cleared ${logFiles.length} log files`
    });
  } catch (error) {
    logger.error('Error clearing logs:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to clear logs'
    });
  }
});

// Test endpoint for monitoring
router.post('/test', [
  auth
], (req, res) => {
  try {
    const { type = 'info', message = 'Test log message' } = req.body;
    
    logger.log(type, message, {
      test: true,
      user: req.user?.id || 'unknown',
      timestamp: new Date().toISOString()
    });
    
    res.json({
      success: true,
      message: 'Test log created successfully'
    });
  } catch (error) {
    logger.error('Error creating test log:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create test log'
    });
  }
});

module.exports = router;
