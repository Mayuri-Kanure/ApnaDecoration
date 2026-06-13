import React, { useState, useEffect } from 'react';
import useAutoRefresh from '../../hooks/useAutoRefresh';
import RefreshSettings from '../../components/RefreshSettings';
import { useAuth } from '../../contexts/AuthContext';

const AdminDashboard = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState({
    totalProducts: 0,
    totalOrders: 0,
    totalCustomers: 0,
    totalRevenue: 0
  });
  const [autoRefreshEnabled, setAutoRefreshEnabled] = useState(true);
  const [refreshInterval, setRefreshInterval] = useState(5 * 60 * 1000); // 5 minutes

  const fetchDashboardStats = async () => {
    try {
      // Connect to public admin backend endpoint (no auth required)
      const response = await fetch(`${process.env.REACT_APP_PRODUCT_API_URL || 'https://admin-api.apnadecoration.com/api'}/analytics/dashboard/public`);
      const data = await response.json();
      setStats(data);
    } catch (error) {
      console.error('Error fetching dashboard stats:', error);
    }
  };

  useEffect(() => {
    // Fetch admin dashboard stats
    fetchDashboardStats();
  }, []);

  // Setup auto-refresh
  const { isRefreshing, manualRefresh, setAutoRefreshEnabled: setAutoRefresh, setRefreshInterval: setInterval } = useAutoRefresh(
    fetchDashboardStats,
    refreshInterval,
    autoRefreshEnabled
  );

  return (
    <div className="admin-dashboard">
      <div className="dashboard-header">
        <div>
          <h1>Admin Dashboard</h1>
          <p>Welcome back, {user?.name}</p>
        </div>
        <div>
          <RefreshSettings
            autoRefreshEnabled={autoRefreshEnabled}
            onAutoRefreshChange={(enabled) => {
              setAutoRefreshEnabled(enabled);
              setAutoRefresh(enabled);
            }}
            refreshInterval={refreshInterval}
            onRefreshIntervalChange={(interval) => {
              setRefreshInterval(interval);
              setInterval(interval);
            }}
            onManualRefresh={manualRefresh}
            isRefreshing={isRefreshing}
          />
        </div>
      </div>
      
      <div className="stats-grid">
        <div className="stat-card">
          <h3>Total Products</h3>
          <p className="stat-number">{stats.totalProducts}</p>
        </div>
        <div className="stat-card">
          <h3>Total Orders</h3>
          <p className="stat-number">{stats.totalOrders}</p>
        </div>
        <div className="stat-card">
          <h3>Total Customers</h3>
          <p className="stat-number">{stats.totalCustomers}</p>
        </div>
        <div className="stat-card">
          <h3>Total Revenue</h3>
          <p className="stat-number">₹{stats.totalRevenue}</p>
        </div>
      </div>

      <div className="dashboard-actions">
        <button>Manage Products</button>
        <button>View Orders</button>
        <button>Manage Customers</button>
        <button>System Settings</button>
      </div>
    </div>
  );
};

export default AdminDashboard;
