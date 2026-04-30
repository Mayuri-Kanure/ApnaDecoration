import { useCallback, useState, useEffect } from 'react';
import { useErrorReporting } from '../components/ErrorBoundary';

export const useErrorHandler = () => {
  const [errors, setErrors] = useState([]);
  const { reportError } = useErrorReporting();

  const handleError = useCallback(async (error, context = {}) => {
    // Add error to local state
    const errorWithId = {
      id: Date.now(),
      message: error.message || 'Unknown error occurred',
      timestamp: new Date().toISOString(),
      context,
      stack: error.stack
    };

    setErrors(prev => [...prev, errorWithId]);

    // Report to error reporting service
    try {
      await reportError(error, context);
    } catch (reportingError) {
      console.error('Failed to report error:', reportingError);
    }

    return errorWithId;
  }, [reportError]);

  const clearError = useCallback((errorId) => {
    setErrors(prev => prev.filter(error => error.id !== errorId));
  }, []);

  const clearAllErrors = useCallback(() => {
    setErrors([]);
  }, []);

  const getRecentErrors = useCallback((limit = 10) => {
    return errors.slice(-limit);
  }, [errors]);

  const getErrorById = useCallback((errorId) => {
    return errors.find(error => error.id === errorId);
  }, [errors]);

  // Auto-clear old errors (older than 1 hour)
  useEffect(() => {
    const interval = setInterval(() => {
      const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000);
      setErrors(prev => prev.filter(error => new Date(error.timestamp) > oneHourAgo));
    }, 60000); // Check every minute

    return () => clearInterval(interval);
  }, []);

  return {
    errors,
    handleError,
    clearError,
    clearAllErrors,
    getRecentErrors,
    getErrorById
  };
};
