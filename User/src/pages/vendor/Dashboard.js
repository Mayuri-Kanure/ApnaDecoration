import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import vendorApi from '../services/vendorApi';

const VendorDashboard = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState({
    totalProducts: 0,
    pendingProducts: 0,
    approvedProducts: 0,
    totalOrders: 0,
    totalRevenue: 0
  });

  useEffect(() => {
    // Fetch vendor dashboard stats
    fetchVendorStats();
  }, []);

  const fetchVendorStats = async () => {
    try {
      // Connect to your existing admin backend for vendor data
      const response = await fetch(`${process.env.REACT_APP_PRODUCT_API_URL || 'https://admin-api.apnadecoration.com/api'}/vendor/analytics`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      const data = await response.json();
      setStats(data);
    } catch (error) {
      console.error('Error fetching vendor stats:', error);
    }
  };

  return (
    <div className="vendor-dashboard">
      <div className="dashboard-header">
        <h1>Vendor Dashboard</h1>
        <p>Welcome back, {user?.name}</p>
      </div>
      
      <div className="stats-grid">
        <div className="stat-card">
          <h3>Total Products</h3>
          <p className="stat-number">{stats.totalProducts}</p>
        </div>
        <div className="stat-card">
          <h3>Pending Approval</h3>
          <p className="stat-number">{stats.pendingProducts}</p>
        </div>
        <div className="stat-card">
          <h3>Approved Products</h3>
          <p className="stat-number">{stats.approvedProducts}</p>
        </div>
        <div className="stat-card">
          <h3>Total Orders</h3>
          <p className="stat-number">{stats.totalOrders}</p>
        </div>
        <div className="stat-card">
          <h3>Total Revenue</h3>
          <p className="stat-number">₹{stats.totalRevenue}</p>
        </div>
      </div>

      <div className="dashboard-actions">
        <button>Add New Product</button>
        <button>Manage Products</button>
        <button>View Orders</button>
        <button>Sales Report</button>
      </div>
    </div>
  );
};

export default VendorDashboard;
