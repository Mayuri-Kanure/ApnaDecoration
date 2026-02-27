import React from 'react';
import { AlertTriangle, RefreshCw, Home, Bug, Send } from 'lucide-react';

// Error reporting service
class ErrorReportingService {
  static async reportError(error, errorInfo, context = {}) {
    try {
      const errorReport = {
        message: error.message,
        stack: error.stack,
        componentStack: errorInfo.componentStack,
        timestamp: new Date().toISOString(),
        userAgent: navigator.userAgent,
        url: window.location.href,
        userId: context.userId || 'anonymous',
        sessionId: context.sessionId || 'unknown',
        buildVersion: process.env.REACT_APP_VERSION || 'unknown',
        environment: process.env.NODE_ENV || 'development',
        additionalContext: context
      };

      // In production, send to error reporting service
      if (process.env.NODE_ENV === 'production') {
        await this.sendToService(errorReport);
      } else {
        // In development, log to console
        console.error('Error Report:', errorReport);
      }

      return errorReport;
    } catch (reportingError) {
      console.error('Failed to report error:', reportingError);
      return null;
    }
  }

  static async sendToService(errorReport) {
    // This would integrate with services like Sentry, LogRocket, or custom API
    const response = await fetch('/api/errors/report', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(errorReport)
    });

    if (!response.ok) {
      throw new Error('Failed to send error report');
    }

    return response.json();
  }

  static generateErrorId() {
    return `err_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }
}

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { 
      hasError: false, 
      error: null, 
      errorInfo: null,
      retryCount: 0,
      errorId: null,
      errorReported: false
    };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    const errorId = ErrorReportingService.generateErrorId();
    
    this.setState({
      error,
      errorInfo,
      errorId
    });

    // Get user context if available
    const userContext = this.getUserContext();
    
    // Report error asynchronously
    ErrorReportingService.reportError(error, errorInfo, {
      errorId,
      ...userContext,
      componentName: this.props.componentName || 'Unknown'
    }).then(() => {
      this.setState({ errorReported: true });
    }).catch(reportingError => {
      console.error('Failed to report error:', reportingError);
    });

    // Log error to console in development
    console.error('Error Boundary caught an error:', error, errorInfo);
  }

  getUserContext() {
    // Try to get user context from various sources
    try {
      // Check if user is in localStorage
      const user = JSON.parse(localStorage.getItem('user') || '{}');
      if (user.id) {
        return { userId: user.id, userEmail: user.email };
      }

      // Check for token
      const token = localStorage.getItem('token');
      if (token) {
        try {
          const payload = JSON.parse(atob(token.split('.')[1]));
          return { userId: payload.userId || payload.id };
        } catch (e) {
          // Invalid token
        }
      }

      return {};
    } catch (e) {
      return {};
    }
  }

  handleRetry = () => {
    this.setState(prevState => ({
      hasError: false,
      error: null,
      errorInfo: null,
      retryCount: prevState.retryCount + 1
    }));
  };

  handleGoHome = () => {
    window.location.href = '/';
  };

  handleSendFeedback = () => {
    const { errorId, error } = this.state;
    const subject = `Error Report - ${errorId}`;
    const body = `
Error ID: ${errorId}
Error Message: ${error?.message}
URL: ${window.location.href}
User Agent: ${navigator.userAgent}
Timestamp: ${new Date().toISOString()}

Please describe what you were doing when this error occurred:
`;

    window.location.href = `mailto:support@apnadecoration.com?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
  };

  handleCopyErrorDetails = () => {
    const { error, errorInfo, errorId } = this.state;
    const errorDetails = `
Error ID: ${errorId}
Timestamp: ${new Date().toISOString()}
URL: ${window.location.href}
User Agent: ${navigator.userAgent}

Error Message: ${error?.message}
Error Stack: ${error?.stack}

Component Stack: ${errorInfo?.componentStack}
    `.trim();

    navigator.clipboard.writeText(errorDetails).then(() => {
      this.setState({ copiedToClipboard: true });
      setTimeout(() => {
        this.setState({ copiedToClipboard: false });
      }, 2000);
    });
  };

  render() {
    if (this.state.hasError) {
      const isDevelopment = process.env.NODE_ENV === 'development';
      const maxRetries = this.props.maxRetries || 3;
      const canRetry = this.state.retryCount < maxRetries;

      return (
        <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
          <div className="max-w-lg w-full bg-white rounded-lg shadow-lg p-8 text-center">
            {/* Error Icon */}
            <div className="flex justify-center mb-6">
              <div className="p-4 bg-red-100 rounded-full">
                <AlertTriangle className="w-8 h-8 text-red-600" />
              </div>
            </div>

            {/* Error Message */}
            <h1 className="text-2xl font-bold text-gray-900 mb-4">
              Something went wrong
            </h1>
            
            <p className="text-gray-600 mb-8">
              We're sorry, but something unexpected happened. Our team has been notified.
            </p>

            {/* Error ID */}
            {this.state.errorId && (
              <div className="mb-6 p-3 bg-gray-100 rounded-lg">
                <p className="text-sm text-gray-600">
                  Error ID: <span className="font-mono font-semibold">{this.state.errorId}</span>
                </p>
                {this.state.errorReported && (
                  <p className="text-xs text-green-600 mt-1">
                    ✓ Error reported successfully
                  </p>
                )}
              </div>
            )}

            {/* Action Buttons */}
            <div className="space-y-3">
              {canRetry && (
                <button
                  onClick={this.handleRetry}
                  className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-indigo-600 text-white rounded-lg font-medium hover:bg-indigo-700 transition-colors"
                >
                  <RefreshCw className="w-4 h-4" />
                  Try Again ({maxRetries - this.state.retryCount} attempts left)
                </button>
              )}
              
              <div className="grid grid-cols-2 gap-3">
                <button
                  onClick={this.handleGoHome}
                  className="flex items-center justify-center gap-2 px-4 py-3 border border-gray-300 text-gray-700 rounded-lg font-medium hover:bg-gray-50 transition-colors"
                >
                  <Home className="w-4 h-4" />
                  Home
                </button>
                
                <button
                  onClick={this.handleSendFeedback}
                  className="flex items-center justify-center gap-2 px-4 py-3 border border-gray-300 text-gray-700 rounded-lg font-medium hover:bg-gray-50 transition-colors"
                >
                  <Send className="w-4 h-4" />
                  Report
                </button>
              </div>
            </div>

            {/* Development Error Details */}
            {isDevelopment && this.state.error && (
              <details className="mt-8 text-left">
                <summary className="cursor-pointer text-sm font-medium text-gray-700 mb-2">
                  Error Details (Development Only)
                </summary>
                <div className="mt-2 p-4 bg-gray-100 rounded-lg text-xs">
                  <div className="mb-2">
                    <strong>Error:</strong>
                    <pre className="mt-1 whitespace-pre-wrap text-red-600">
                      {this.state.error.toString()}
                    </pre>
                  </div>
                  
                  {this.state.errorInfo && (
                    <div>
                      <strong>Component Stack:</strong>
                      <pre className="mt-1 whitespace-pre-wrap text-gray-700">
                        {this.state.errorInfo.componentStack}
                      </pre>
                    </div>
                  )}

                  <div className="mt-3 flex gap-2">
                    <button
                      onClick={this.handleCopyErrorDetails}
                      className="px-3 py-1 bg-blue-500 text-white text-xs rounded hover:bg-blue-600 transition-colors"
                    >
                      {this.state.copiedToClipboard ? 'Copied!' : 'Copy Details'}
                    </button>
                  </div>
                </div>
              </details>
            )}

            {/* Retry Count Warning */}
            {this.state.retryCount >= maxRetries && (
              <div className="mt-6 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                <p className="text-sm text-yellow-800">
                  Maximum retry attempts reached. Please refresh the page or contact support if the problem persists.
                </p>
              </div>
            )}

            {/* Support Info */}
            <div className="mt-6 text-sm text-gray-500">
              <p>If this problem continues, please contact our support team.</p>
              <p className="mt-1">
                <a href="mailto:support@apnadecoration.com" className="text-indigo-600 hover:text-indigo-800">
                  support@apnadecoration.com
                </a>
              </p>
              {this.state.errorId && (
                <p className="mt-1">
                  Reference ID: <span className="font-mono">{this.state.errorId}</span>
                </p>
              )}
            </div>

            {/* Additional Actions */}
            <div className="mt-6 pt-6 border-t border-gray-200">
              <div className="flex justify-center space-x-4">
                <button
                  onClick={() => window.location.reload()}
                  className="text-sm text-gray-600 hover:text-gray-800 transition-colors"
                >
                  Refresh Page
                </button>
                <span className="text-gray-400">•</span>
                <button
                  onClick={() => window.history.back()}
                  className="text-sm text-gray-600 hover:text-gray-800 transition-colors"
                >
                  Go Back
                </button>
              </div>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

// HOC for wrapping components with error boundary
export const withErrorBoundary = (WrappedComponent, componentName) => {
  const WithErrorBoundaryComponent = (props) => (
    <ErrorBoundary componentName={componentName}>
      <WrappedComponent {...props} />
    </ErrorBoundary>
  );

  WithErrorBoundaryComponent.displayName = `withErrorBoundary(${componentName || 'Component'})`;
  
  return WithErrorBoundaryComponent;
};

// Hook for error reporting
export const useErrorReporting = () => {
  const reportError = React.useCallback(async (error, context = {}) => {
    try {
      const errorInfo = {
        componentStack: error.stack || '',
        // Additional context can be added here
      };

      const errorReport = await ErrorReportingService.reportError(error, errorInfo, context);
      return errorReport;
    } catch (reportingError) {
      console.error('Failed to report error:', reportingError);
      return null;
    }
  }, []);

  return { reportError };
};

export default ErrorBoundary;
