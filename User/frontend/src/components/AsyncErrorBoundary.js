import React from 'react';
import { AlertTriangle, Loader2 } from 'lucide-react';

class AsyncErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
      retryCount: 0,
      isLoading: false
    };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    this.setState({
      error,
      errorInfo
    });

    console.error('Async Error Boundary caught an error:', error, errorInfo);
  }

  handleRetry = async () => {
    this.setState({ 
      hasError: false, 
      error: null, 
      errorInfo: null,
      isLoading: true,
      retryCount: this.state.retryCount + 1
    });

    try {
      if (this.props.onRetry) {
        await this.props.onRetry();
      }
    } catch (error) {
      console.error('Retry failed:', error);
      this.setState({ hasError: true, error, isLoading: false });
    } finally {
      this.setState({ isLoading: false });
    }
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
          <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-8 text-center">
            {/* Error Icon */}
            <div className="flex justify-center mb-6">
              <div className="p-4 bg-red-100 rounded-full">
                <AlertTriangle className="w-8 h-8 text-red-600" />
              </div>
            </div>

            {/* Error Message */}
            <h2 className="text-xl font-bold text-gray-900 mb-4">
              Async Operation Failed
            </h2>
            
            <p className="text-gray-600 mb-6">
              {this.props.fallbackMessage || 'An asynchronous operation failed. Please try again.'}
            </p>

            {/* Loading State */}
            {this.state.isLoading && (
              <div className="flex items-center justify-center mb-4">
                <Loader2 className="w-6 h-6 text-indigo-600 animate-spin" />
                <span className="ml-2 text-indigo-600">Retrying...</span>
              </div>
            )}

            {/* Action Buttons */}
            <div className="space-y-3">
              <button
                onClick={this.handleRetry}
                disabled={this.state.isLoading}
                className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-indigo-600 text-white rounded-lg font-medium hover:bg-indigo-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Loader2 className={`w-4 h-4 ${this.state.isLoading ? 'animate-spin' : ''}`} />
                {this.state.isLoading ? 'Retrying...' : 'Try Again'}
              </button>
              
              {this.props.onCancel && (
                <button
                  onClick={this.props.onCancel}
                  className="w-full px-4 py-3 border border-gray-300 text-gray-700 rounded-lg font-medium hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
              )}
            </div>

            {/* Development Error Details */}
            {process.env.NODE_ENV === 'development' && this.state.error && (
              <details className="mt-6 text-left">
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
                </div>
              </details>
            )}
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default AsyncErrorBoundary;
