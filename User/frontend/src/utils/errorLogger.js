// Error logging utility for frontend applications

class ErrorLogger {
  constructor() {
    this.errors = [];
    this.maxErrors = 100; // Keep only last 100 errors
    this.isDevelopment = process.env.NODE_ENV === 'development';
  }

  log(error, level = 'error', context = {}) {
    const errorEntry = {
      id: this.generateErrorId(),
      timestamp: new Date().toISOString(),
      level,
      message: error.message || error.toString(),
      stack: error.stack,
      url: window.location.href,
      userAgent: navigator.userAgent,
      userId: this.getUserId(),
      sessionId: this.getSessionId(),
      buildVersion: process.env.REACT_APP_VERSION,
      environment: process.env.NODE_ENV,
      context,
      metadata: {
        line: error.line,
        column: error.column,
        fileName: error.fileName,
        source: error.source
      }
    };

    this.errors.push(errorEntry);

    // Keep only the last maxErrors errors
    if (this.errors.length > this.maxErrors) {
      this.errors.shift();
    }

    // Log to console in development
    if (this.isDevelopment) {
      this.logToConsole(errorEntry);
    }

    // Send to error reporting service in production
    if (!this.isDevelopment) {
      this.sendToService(errorEntry);
    }

    return errorEntry;
  }

  logToConsole(errorEntry) {
    const logMethod = errorEntry.level === 'error' ? 'error' : 'warn';
    console[logMethod]('Frontend Error:', errorEntry);
  }

  async sendToService(errorEntry) {
    try {
      const response = await fetch('/api/errors/log', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(errorEntry)
      });

      if (!response.ok) {
        throw new Error('Failed to send error to service');
      }

      return response.json();
    } catch (error) {
      console.error('Failed to send error to service:', error);
      return null;
    }
  }

  generateErrorId() {
    return `fe_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  getUserId() {
    try {
      // Try to get user ID from localStorage
      const user = JSON.parse(localStorage.getItem('user') || '{}');
      if (user.id) return user.id;

      // Try to get user ID from token
      const token = localStorage.getItem('token');
      if (token) {
        const payload = JSON.parse(atob(token.split('.')[1]));
        return payload.userId || payload.id;
      }

      return 'anonymous';
    } catch (e) {
      return 'anonymous';
    }
  }

  getSessionId() {
    try {
      let sessionId = sessionStorage.getItem('sessionId');
      if (!sessionId) {
        sessionId = this.generateErrorId();
        sessionStorage.setItem('sessionId', sessionId);
      }
      return sessionId;
    } catch (e) {
      return 'unknown';
    }
  }

  getErrors() {
    return this.errors;
  }

  getErrorsByLevel(level) {
    return this.errors.filter(error => error.level === level);
  }

  getRecentErrors(limit = 10) {
    return this.errors.slice(-limit);
  }

  clearErrors() {
    this.errors = [];
  }

  getErrorStats() {
    const stats = {
      total: this.errors.length,
      byLevel: {},
      byHour: {},
      recent: this.getRecentErrors(24).length
    };

    // Count by level
    this.errors.forEach(error => {
      stats.byLevel[error.level] = (stats.byLevel[error.level] || 0) + 1;
    });

    // Count by hour
    this.errors.forEach(error => {
      const hour = new Date(error.timestamp).getHours();
      stats.byHour[hour] = (stats.byHour[hour] || 0) + 1;
    });

    return stats;
  }

  exportErrors() {
    const dataStr = JSON.stringify(this.errors, null, 2);
    const blob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    
    const link = document.createElement('a');
    link.href = url;
    link.download = `frontend-errors-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }
}

// Create singleton instance
const errorLogger = new ErrorLogger();

// Global error handlers
window.addEventListener('error', (event) => {
  errorLogger.log(event.error, 'error', {
    type: 'uncaught',
    filename: event.filename,
    lineno: event.lineno,
    colno: event.colno
  });
});

window.addEventListener('unhandledrejection', (event) => {
  errorLogger.log(event.reason, 'error', {
    type: 'unhandledrejection',
    promise: event.promise
  });
});

export default errorLogger;
