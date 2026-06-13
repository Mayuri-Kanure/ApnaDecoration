import { useEffect, useRef, useState } from 'react';

/**
 * Custom hook for auto-refresh functionality
 * Automatically refetches data at specified intervals
 */
export const useAutoRefresh = (
  fetchFunction,
  interval = 5 * 60 * 1000, // 5 minutes default
  enabled = true
) => {
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [autoRefreshEnabled, setAutoRefreshEnabled] = useState(enabled);
  const [refreshInterval, setRefreshInterval] = useState(interval);
  const intervalRef = useRef(null);

  // Manual refresh
  const manualRefresh = async () => {
    setIsRefreshing(true);
    try {
      await fetchFunction();
    } catch (error) {
      console.error('Manual refresh error:', error);
    } finally {
      setIsRefreshing(false);
    }
  };

  // Setup auto-refresh
  useEffect(() => {
    if (!autoRefreshEnabled || !enabled) {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
      return;
    }

    // Initial fetch
    manualRefresh();

    // Set up interval
    intervalRef.current = setInterval(() => {
      console.log(`🔄 Auto-refreshing (interval: ${refreshInterval / 1000}s)`);
      manualRefresh();
    }, refreshInterval);

    // Cleanup
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [autoRefreshEnabled, refreshInterval, enabled, fetchFunction]);

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
