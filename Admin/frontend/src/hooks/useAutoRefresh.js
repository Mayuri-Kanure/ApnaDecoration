import { useEffect, useRef, useState } from 'react';

/**
 * Custom hook for auto-refreshing data at configurable intervals
 * @param {Function} fetchFunction - The async function to call for refreshing data
 * @param {number} interval - Refresh interval in milliseconds (default: 5 minutes)
 * @param {boolean} enabled - Whether auto-refresh is enabled (default: true)
 * @param {Array} dependencies - Dependencies array for useEffect
 * @returns {Object} - { isRefreshing, manualRefresh, setAutoRefresh, refreshInterval, setRefreshInterval }
 */
export const useAutoRefresh = (
  fetchFunction,
  interval = 5 * 60 * 1000, // 5 minutes default
  enabled = true,
  dependencies = []
) => {
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [refreshInterval, setRefreshInterval] = useState(interval);
  const [autoRefreshEnabled, setAutoRefreshEnabled] = useState(enabled);
  const intervalRef = useRef(null);

  // Manual refresh function
  const manualRefresh = async () => {
    setIsRefreshing(true);
    try {
      await fetchFunction();
    } catch (error) {
      console.error('Manual refresh failed:', error);
    } finally {
      setIsRefreshing(false);
    }
  };

  // Setup auto-refresh interval
  useEffect(() => {
    if (!autoRefreshEnabled || !fetchFunction) {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
      return;
    }

    // Clear existing interval if any
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
    }

    // Set new interval
    intervalRef.current = setInterval(() => {
      fetchFunction();
    }, refreshInterval);

    // Cleanup on unmount
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [autoRefreshEnabled, refreshInterval, fetchFunction]);

  return {
    isRefreshing,
    manualRefresh,
    autoRefreshEnabled,
    setAutoRefreshEnabled,
    refreshInterval,
    setRefreshInterval,
  };
};

export default useAutoRefresh;
