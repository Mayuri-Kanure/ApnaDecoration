import React from 'react';
import { useAuth } from '../contexts/AuthContext';
import CustomerNavigation from './CustomerNavigation';
import AdminNavigation from './AdminNavigation';
import VendorNavigation from './VendorNavigation';

const RoleBasedNavigation = () => {
  const { user, isAdmin, isVendor, isCustomer } = useAuth();

  // Show customer navigation by default or for customer role
  if (isCustomer || !user) {
    return <CustomerNavigation />;
  }

  // Show admin navigation for admin role
  if (isAdmin) {
    return <AdminNavigation />;
  }

  // Show vendor navigation for vendor role
  if (isVendor) {
    return <VendorNavigation />;
  }

  // Fallback to customer navigation
  return <CustomerNavigation />;
};

export default RoleBasedNavigation;
