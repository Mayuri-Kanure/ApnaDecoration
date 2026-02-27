// Database Connection Service for MongoDB Atlas
class DatabaseService {
  // API Configuration
  static API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'https://admin-api.apnadecoration.com/api';

  constructor() {
    this.isConnected = false;
    this.connectionStatus = 'disconnected';
    this.retryCount = 0;
    this.maxRetries = 3;
    this.baseURL = DatabaseService.API_BASE_URL;
  }

  // Test database connection
  async testConnection() {
    try {
      const response = await fetch(`${this.baseURL}/health/database`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      const data = await response.json();

      if (response.ok && data.connected) {
        this.isConnected = true;
        this.connectionStatus = 'connected';
        this.retryCount = 0;
        return {
          success: true,
          message: 'Database connected successfully',
          database: data.database,
          host: data.host
        };
      } else {
        throw new Error(data.message || 'Database connection failed');
      }
    } catch (error) {
      this.isConnected = false;
      this.connectionStatus = 'disconnected';
      this.retryCount++;
      
      return {
        success: false,
        message: error.message || 'Database connection failed',
        retryCount: this.retryCount
      };
    }
  }

  // Get connection status
  getConnectionStatus() {
    return {
      isConnected: this.isConnected,
      status: this.connectionStatus,
      retryCount: this.retryCount
    };
  }

  // Retry connection
  async retryConnection() {
    if (this.retryCount < this.maxRetries) {
      return await this.testConnection();
    } else {
      return {
        success: false,
        message: 'Max retry attempts reached'
      };
    }
  }

  // Reset connection status
  resetConnection() {
    this.isConnected = false;
    this.connectionStatus = 'disconnected';
    this.retryCount = 0;
  }

  // Monitor connection health
  async monitorConnection(interval = 30000) {
    setInterval(async () => {
      if (!this.isConnected) {
        await this.retryConnection();
      }
    }, interval);
  }

  // Get database stats
  async getDatabaseStats() {
    try {
      const response = await fetch(`${this.baseURL}/health/database/stats`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      const data = await response.json();

      if (response.ok) {
        return {
          success: true,
          stats: data.stats
        };
      } else {
        throw new Error(data.message || 'Failed to get database stats');
      }
    } catch (error) {
      return {
        success: false,
        message: error.message
      };
    }
  }

  // Check collection exists
  async checkCollectionExists(collectionName) {
    try {
      const response = await fetch(`${this.baseURL}/health/database/collections/${collectionName}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      const data = await response.json();

      if (response.ok) {
        return {
          success: true,
          exists: data.exists,
          count: data.count
        };
      } else {
        throw new Error(data.message || 'Failed to check collection');
      }
    } catch (error) {
      return {
        success: false,
        message: error.message
      };
    }
  }

  // Get collection data
  async getCollectionData(collectionName, options = {}) {
    try {
      const { limit = 10, skip = 0, sort = {} } = options;
      
      const response = await fetch(`${this.baseURL}/database/${collectionName}?limit=${limit}&skip=${skip}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      const data = await response.json();

      if (response.ok) {
        return {
          success: true,
          data: data.data,
          total: data.total
        };
      } else {
        throw new Error(data.message || 'Failed to get collection data');
      }
    } catch (error) {
      return {
        success: false,
        message: error.message
      };
    }
  }

  // Create health check endpoint result
  getHealthCheck() {
    return {
      database: {
        status: this.connectionStatus,
        connected: this.isConnected,
        retryCount: this.retryCount,
        lastChecked: new Date().toISOString()
      }
    };
  }
}

// Create singleton instance
const databaseService = new DatabaseService();

export default databaseService;
