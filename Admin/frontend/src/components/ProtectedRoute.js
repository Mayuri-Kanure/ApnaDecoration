import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

const ProtectedRoute = ({ children }) => {
  const { isAuthenticated, loading, user } = useAuth();

  console.log('ProtectedRoute: Checking auth', { isAuthenticated, loading, user });

  if (loading) {
    console.log('ProtectedRoute: Still loading auth state');
    return <div>Loading authentication...</div>;
  }

  if (!isAuthenticated) {
    console.log('ProtectedRoute: Not authenticated, redirecting to login');
    return <Navigate to="/login" replace />;
  }

  console.log('ProtectedRoute: Authenticated, rendering protected content');
  return children;
};

export default ProtectedRoute;
