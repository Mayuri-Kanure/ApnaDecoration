const mongoose = require('mongoos');
const fs = require('fs');
const path = require('path');

exports.healthCheck = async (req, res) => {
  try {
    const healthStatus = {
      status: 'healthy',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      environment: process.env.NODE_ENV || 'development',
      version: process.env.npm_package_version || '1.0.0',
      checks: {}
    };

    // Database connection check
    try {
      const dbState = mongoose.connection.readyState;
      const dbStates = {
        0: 'disconnected',
        1: 'connected',
        2: 'connecting',
        3: 'disconnecting'
      };
      
      healthStatus.checks.database = {
        status: dbStates[dbState] === 'connected' ? 'healthy' : 'unhealthy',
        state: dbStates[dbState],
        host: mongoose.connection.host,
        name: mongoose.connection.name
      };

      // Test database with a simple ping
      if (dbStates[dbState] === 'connected') {
        await mongoose.connection.db.admin().ping();
        healthStatus.checks.database.latency = Date.now() - new Date().getTime();
      }
    } catch (dbError) {
      healthStatus.checks.database = {
        status: 'unhealthy',
        error: dbError.message
      };
      healthStatus.status = 'unhealthy';
    }

    // Memory usage check
    const memoryUsage = process.memoryUsage();
    healthStatus.checks.memory = {
      status: 'healthy',
      rss: `${Math.round(memoryUsage.rss / 1024 / 1024)} MB`,
      heapUsed: `${Math.round(memoryUsage.heapUsed / 1024 / 1024)} MB`,
      heapTotal: `${Math.round(memoryUsage.heapTotal / 1024 / 1024)} MB`,
      external: `${Math.round(memoryUsage.external / 1024 / 1024)} MB`
    };

    // CPU usage check
    const cpuUsage = process.cpuUsage();
    healthStatus.checks.cpu = {
      status: 'healthy',
      user: cpuUsage.user,
      system: cpuUsage.system
    };

    // Disk space check (uploads directory)
    try {
      const uploadsDir = path.join(__dirname, '../uploads');
      if (fs.existsSync(uploadsDir)) {
        const stats = fs.statSync(uploadsDir);
        healthStatus.checks.uploads = {
          status: 'healthy',
          accessible: true,
          path: uploadsDir
        };
      } else {
        healthStatus.checks.uploads = {
          status: 'warning',
          accessible: false,
          message: 'Uploads directory does not exist'
        };
      }
    } catch (diskError) {
      healthStatus.checks.uploads = {
        status: 'unhealthy',
        error: diskError.message
      };
    }

    // Logs directory check
    try {
      const logsDir = path.join(__dirname, '../logs');
      if (fs.existsSync(logsDir)) {
        healthStatus.checks.logs = {
          status: 'healthy',
          accessible: true,
          path: logsDir
        };
      } else {
        healthStatus.checks.logs = {
          status: 'warning',
          accessible: false,
          message: 'Logs directory does not exist'
        };
      }
    } catch (logsError) {
      healthStatus.checks.logs = {
        status: 'unhealthy',
        error: logsError.message
      };
    }

    // Environment variables check
    const requiredEnvVars = ['PORT', 'MONGODB_URI', 'JWT_SECRET'];
    const missingEnvVars = requiredEnvVars.filter(envVar => !process.env[envVar]);
    
    healthStatus.checks.environment = {
      status: missingEnvVars.length === 0 ? 'healthy' : 'warning',
      required: requiredEnvVars,
      missing: missingEnvVars
    };

    if (missingEnvVars.length > 0) {
      healthStatus.status = 'warning';
    }

    // Determine HTTP status code
    const statusCode = healthStatus.status === 'healthy' ? 200 : 
                      healthStatus.status === 'warning' ? 200 : 503;

    res.status(statusCode).json(healthStatus);

  } catch (error) {
    res.status(503).json({
      status: 'unhealthy',
      timestamp: new Date().toISOString(),
      error: error.message
    });
  }
};

// Simple ping endpoint for load balancers
exports.ping = (req, res) => {
  res.status(200).json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    uptime: process.uptime()
  });
};

// Detailed system information (admin only)
exports.systemInfo = async (req, res) => {
  try {
    const systemInfo = {
      timestamp: new Date().toISOString(),
      system: {
        platform: process.platform,
        arch: process.arch,
        nodeVersion: process.version,
        uptime: process.uptime()
      },
      memory: process.memoryUsage(),
      cpu: process.cpuUsage(),
      database: {
        readyState: mongoose.connection.readyState,
        host: mongoose.connection.host,
        name: mongoose.connection.name,
        collections: await mongoose.connection.db.listCollections().toArray()
      },
      environment: {
        NODE_ENV: process.env.NODE_ENV,
        PORT: process.env.PORT
      }
    };

    res.json(systemInfo);
  } catch (error) {
    res.status(500).json({
      error: error.message,
      timestamp: new Date().toISOString()
    });
  }
};
