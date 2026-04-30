import React from 'react';
import { Link } from 'react-router-dom';

const VendorNavigation = () => {
  return (
    <nav className="vendor-navigation">
      <div className="nav-header">
        <h3>Vendor Portal</h3>
      </div>
      <div className="nav-menu">
        <Link to="/vendor/dashboard">Dashboard</Link>
        <Link to="/vendor/products">My Products</Link>
        <Link to="/vendor/add-product">Add Product</Link>
        <Link to="/vendor/orders">Orders</Link>
        <Link to="/vendor/analytics">Sales Analytics</Link>
        <Link to="/vendor/profile">Profile</Link>
        <Link to="/vendor/support">Support</Link>
      </div>
    </nav>
  );
};

export default VendorNavigation;
