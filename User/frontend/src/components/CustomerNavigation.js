import React from 'react';
import { Link } from 'react-router-dom';

const CustomerNavigation = () => {
  return (
    <nav className="customer-navigation">
      <div className="nav-header">
        <h3>APNA Decoration</h3>
      </div>
      <div className="nav-menu">
        <Link to="/">Home</Link>
        <Link to="/products">Products</Link>
        <Link to="/categories">Categories</Link>
        <Link to="/services">Services</Link>
        <Link to="/cart">Cart</Link>
        <Link to="/orders">My Orders</Link>
        <Link to="/profile">Profile</Link>
        <Link to="/support">Support</Link>
      </div>
    </nav>
  );
};

export default CustomerNavigation;
