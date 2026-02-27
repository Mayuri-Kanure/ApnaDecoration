import React from 'react';

class DebugErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    console.error('🔥 ERROR BOUNDARY CAUGHT:', error, errorInfo);
    this.setState({
      error: error,
      errorInfo: errorInfo
    });
  }

  render() {
    if (this.state.hasError) {
      return (
        <div style={{ padding: '20px', backgroundColor: '#ffebee', border: '1px solid #f44336', borderRadius: '8px', margin: '20px' }}>
          <h2 style={{ color: '#d32f2f' }}>🔥 Something went wrong!</h2>
          <details style={{ marginTop: '10px' }}>
            <summary style={{ cursor: 'pointer', fontWeight: 'bold' }}>Click to see error details</summary>
            <div style={{ marginTop: '10px', padding: '10px', backgroundColor: '#fff', border: '1px solid #ddd', borderRadius: '4px' }}>
              <h3>Error:</h3>
              <pre style={{ backgroundColor: '#f5f5f5', padding: '10px', overflow: 'auto' }}>
                {this.state.error && this.state.error.toString()}
              </pre>
              <h3>Component Stack:</h3>
              <pre style={{ backgroundColor: '#f5f5f5', padding: '10px', overflow: 'auto' }}>
                {this.state.errorInfo.componentStack}
              </pre>
            </div>
          </details>
          <button 
            onClick={() => window.location.reload()} 
            style={{
              marginTop: '10px',
              padding: '10px 20px',
              backgroundColor: '#2196f3',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer'
            }}
          >
            Reload App
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}

export default DebugErrorBoundary;
