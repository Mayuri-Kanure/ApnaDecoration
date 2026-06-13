import { useState, useEffect } from 'react';
import axios from 'axios';

/**
 * User Panel custom hook to fetch pending orders count
 * @param {number} interval - Refresh interval in milliseconds (default: 1 minute)
 * @returns {Object} - { pendingOrdersCount, loading, error, refetch }
 */
export const usePendingOrdersCountUser = (interval = 60000) => {
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

      // Fetch from admin public endpoint
      const response = await axios.get(
        `${process.env.REACT_APP_PRODUCT_API_URL || 'https://admin-api.apnadecoration.com/api'}/orders/pending-count`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      setPendingOrdersCount(response.data?.count || 0);
      setError(null);
    } catch (err) {
      console.error('Error fetching pending orders count:', err);
      setError(err.message);
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

export default usePendingOrdersCountUser;
