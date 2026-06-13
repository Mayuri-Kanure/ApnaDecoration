import { useState, useEffect } from 'react';
import api from '../utils/axiosClient';

/**
 * Custom hook to fetch and auto-refresh pending orders count
 * @param {number} interval - Refresh interval in milliseconds (default: 1 minute)
 * @returns {Object} - { pendingOrdersCount, loading, error, refetch }
 */
export const usePendingOrdersCount = (interval = 60000) => {
  const [pendingOrdersCount, setPendingOrdersCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchPendingOrders = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      if (!token) {
        return;
      }

      // Fetch pending orders count
      const response = await api.get('/orders/pending-count', {
        headers: { Authorization: `Bearer ${token}` },
      });

      setPendingOrdersCount(response.data?.count || 0);
      setError(null);
    } catch (err) {
      console.error('Error fetching pending orders count:', err);
      setError(err.message);
      // Keep existing count on error
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // Fetch immediately on mount
    fetchPendingOrders();

    // Setup polling
    const intervalId = setInterval(fetchPendingOrders, interval);

    return () => clearInterval(intervalId);
  }, [interval]);

  return {
    pendingOrdersCount,
    loading,
    error,
    refetch: fetchPendingOrders,
  };
};

export default usePendingOrdersCount;
