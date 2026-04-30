import React from 'react';
import { Link } from 'react-router-dom';

const AdminNavigation = () => {
  return (
    <nav className="admin-navigation">
      <div className="nav-header">
        <h3>Admin Panel</h3>
      </div>
      <div className="nav-menu">
        <Link to="/admin/dashboard">Dashboard</Link>
        <Link to="/admin/products">Products</Link>
        <Link to="/admin/orders">Orders</Link>
        <Link to="/admin/customers">Customers</Link>
        <Link to="/admin/vendors">Vendors</Link>
        <Link to="/admin/analytics">Analytics</Link>
        <Link to="/admin/settings">Settings</Link>
      </div>
    </nav>
  );
};

export default AdminNavigation;
