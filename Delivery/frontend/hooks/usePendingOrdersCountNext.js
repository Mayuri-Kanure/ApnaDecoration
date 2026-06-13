import { useState, useEffect } from 'react';
import axios from 'axios';
import { useRouter } from 'next/router';

/**
 * Next.js compatible hook to fetch pending orders count
 * @param {number} interval - Refresh interval in milliseconds (default: 1 minute)
 * @returns {Object} - { pendingOrdersCount, loading, error, refetch }
 */
export const usePendingOrdersCountNext = (interval = 60000) => {
  const router = useRouter();
  const [pendingOrdersCount, setPendingOrdersCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchPendingOrders = async () => {
    try {
      setLoading(true);
      const token = typeof window !== 'undefined' ? localStorage.getItem('deliveryBoyToken') : null;
      
      if (!token) {
        // Don't fetch if not authenticated
        setLoading(false);
        return;
      }

      // Use axios directly with proper configuration
      const response = await axios.get(
        'https://admin-api.apnadecoration.com/api/delivery-orders/available?limit=1',
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
          timeout: 10000,
        }
      );

      const count = response.data?.pagination?.total || 0;
      setPendingOrdersCount(count);
      setError(null);
    } catch (err) {
      console.error('Error fetching pending orders count:', err);
      // Silently fail - don't update error state
      setPendingOrdersCount(0);
    } finally {
      setLoading(false);
    }
  };

  // Setup polling only
  useEffect(() => {
    // Fetch immediately on mount
    fetchPendingOrders();

    // Setup polling interval
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

export default usePendingOrdersCountNext;
