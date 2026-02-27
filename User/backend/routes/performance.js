const express = require('express');
const router = express.Router();
const performanceOptimizer = require('../middleware/performanceOptimizer');
const { auth } = require('../middleware/auth');

// Get performance statistics
router.get('/stats', [
  auth
], (req, res) => {
  try {
    const stats = performanceOptimizer.getCacheStats();
    
    res.json({
      success: true,
      data: {
        cache: stats,
        timestamp: new Date().toISOString(),
        uptime: process.uptime(),
        memory: process.memoryUsage(),
        cpu: process.cpuUsage()
      }
    });
  } catch (error) {
    console.error('Error getting performance stats:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get performance statistics'
    });
  }
});

// Clear cache
router.post('/cache/clear', [
  auth
], (req, res) => {
  try {
    performanceOptimizer.clearCache();
    
    res.json({
      success: true,
      message: 'Cache cleared successfully'
    });
  } catch (error) {
    console.error('Error clearing cache:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to clear cache'
    });
  }
});

// Preload images
router.post('/preload', [
  auth
], async (req, res) => {
  try {
    const { imagePaths } = req.body;
    
    if (!Array.isArray(imagePaths)) {
      return res.status(400).json({
        success: false,
        message: 'imagePaths must be an array'
      });
    }

    await performanceOptimizer.preloadImages(imagePaths);
    
    res.json({
      success: true,
      message: `Preloaded ${imagePaths.length} images`
    });
  } catch (error) {
    console.error('Error preloading images:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to preload images'
    });
  }
});

// Optimize specific image
router.post('/optimize', [
  auth
], async (req, res) => {
  try {
    const { imagePath } = req.body;
    
    if (!imagePath) {
      return res.status(400).json({
        success: false,
        message: 'imagePath is required'
      });
    }

    const optimizedPath = performanceOptimizer.getOptimizedPath(imagePath);
    await performanceOptimizer.createOptimizedImage(imagePath, req, res);
    
    res.json({
      success: true,
      message: 'Image optimized successfully',
      data: {
        originalPath: imagePath,
        optimizedPath
      }
    });
  } catch (error) {
    console.error('Error optimizing image:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to optimize image'
    });
  }
});

// Get system performance metrics
router.get('/system', [
  auth
], (req, res) => {
  try {
    const os = require('os');
    
    const systemMetrics = {
      memory: {
        total: os.totalmem(),
        free: os.freemem(),
        used: os.totalmem() - os.freemem(),
        usage: ((os.totalmem() - os.freemem()) / os.totalmem()) * 100
      },
      cpu: {
        loadAverage: os.loadavg(),
        count: os.cpus().length,
        model: os.cpus()[0]?.model || 'Unknown'
      },
      uptime: os.uptime(),
      platform: os.platform(),
      arch: os.arch(),
      node: {
        version: process.version,
        pid: process.pid,
        uptime: process.uptime(),
        memoryUsage: process.memoryUsage(),
        cpuUsage: process.cpuUsage()
      },
      timestamp: new Date().toISOString()
    };
    
    res.json({
      success: true,
      data: systemMetrics
    });
  } catch (error) {
    console.error('Error getting system metrics:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get system metrics'
    });
  }
});

module.exports = router;
