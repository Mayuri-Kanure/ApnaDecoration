import React from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import CustomerNavigation from '../components/CustomerNavigation';
import AdminNavigation from '../components/AdminNavigation';
import VendorNavigation from '../components/VendorNavigation';

const RoleBasedHome = () => {
  const { user, isAdmin, isVendor, isCustomer } = useAuth();
  const navigate = useNavigate();

  React.useEffect(() => {
    // Redirect to appropriate dashboard based on role
    if (isAdmin) {
      navigate('/admin/dashboard');
    } else if (isVendor) {
      navigate('/vendor/dashboard');
    } else if (isCustomer) {
      navigate('/products');
    }
  }, [user, isAdmin, isVendor, isCustomer, navigate]);

  // Show appropriate navigation while redirecting
  return (
    <div className="role-based-home">
      {isAdmin && <AdminNavigation />}
      {isVendor && <VendorNavigation />}
      {(isCustomer || !user) && <CustomerNavigation />}
      
      <div className="loading-container">
        <h2>Welcome to APNA Decoration</h2>
        <p>Redirecting to your dashboard...</p>
      </div>
    </div>
  );
};

export default RoleBasedHome;
