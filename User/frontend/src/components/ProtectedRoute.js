import React from 'react';
import { Navigate, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import LoadingSpinner from './LoadingSpinner';
import { AlertCircle, Lock } from 'lucide-react';

const ProtectedRoute = ({ children, requiredRole = 'user' }) => {
  const { isAuthenticated, isLoading, user, error } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  // Check if token is expired
  const checkTokenExpiry = () => {
    const token = localStorage.getItem('token');
    if (!token) return true;
    
    try {
      // Check if it's a mock token (for development)
      if (token === 'mock-jwt-token-for-testing') {
        return false; // Mock tokens don't expire
      }
      
      // Check if it has proper JWT structure (3 parts separated by dots)
      const parts = token.split('.');
      if (parts.length !== 3) {
        console.warn('Invalid token structure');
        return true; // Invalid format
      }
      
      const payload = JSON.parse(atob(parts[1]));
      const currentTime = Date.now() / 1000;
      return payload.exp < currentTime;
    } catch (error) {
      console.error('Error parsing token:', error);
      return true; // Assume expired if can't parse
    }
  };

  const isTokenExpired = checkTokenExpiry();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <LoadingSpinner />
          <p className="mt-4 text-gray-600">Verifying your authentication...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated || isTokenExpired) {
    // Clear expired token
    if (isTokenExpired) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
    }

    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-8 text-center">
          <div className="flex justify-center mb-4">
            <div className="p-3 bg-red-100 rounded-full">
              <Lock className="w-6 h-6 text-red-600" />
            </div>
          </div>
          
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            Authentication Required
          </h2>
          
          <p className="text-gray-600 mb-6">
            {isTokenExpired 
              ? 'Your session has expired. Please log in again to continue.'
              : 'Please log in to access this page.'}
          </p>

          {isTokenExpired && (
            <div className="mb-6 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
              <div className="flex items-center gap-2 text-yellow-800">
                <AlertCircle className="w-4 h-4" />
                <span className="text-sm">Session expired for security</span>
              </div>
            </div>
          )}

          <div className="space-y-3">
            <button
              onClick={() => {
                // Clear any existing auth state
                localStorage.removeItem('token');
                localStorage.removeItem('user');
                // Use navigate to redirect to login page
                navigate('/login');
              }}
              className="w-full px-4 py-3 bg-indigo-600 text-white rounded-lg font-medium hover:bg-indigo-700 transition-colors"
            >
              Sign In
            </button>
            
            <button
              onClick={() => {
                // Clear any existing auth state
                localStorage.removeItem('token');
                localStorage.removeItem('user');
                // Use navigate to redirect to home page
                navigate('/');
              }}
              className="w-full px-4 py-3 border border-gray-300 text-gray-700 rounded-lg font-medium hover:bg-gray-50 transition-colors"
            >
              Back to Home
            </button>
          </div>

          <div className="mt-6 text-sm text-gray-500">
            <p>You'll be redirected back to this page after login</p>
          </div>
        </div>
      </div>
    );
  }

  // Role-based access control (for future admin features)
  if (requiredRole === 'admin' && user?.role !== 'admin') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-8 text-center">
          <div className="flex justify-center mb-4">
            <div className="p-3 bg-red-100 rounded-full">
              <AlertCircle className="w-6 h-6 text-red-600" />
            </div>
          </div>
          
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            Access Denied
          </h2>
          
          <p className="text-gray-600 mb-6">
            You don't have permission to access this page.
          </p>

          <button
            onClick={() => {
              // Use navigate to redirect to home page
              navigate('/');
            }}
            className="w-full px-4 py-3 bg-indigo-600 text-white rounded-lg font-medium hover:bg-indigo-700 transition-colors"
          >
            Back to Home
          </button>
        </div>
      </div>
    );
  }

  return children;
};

export default ProtectedRoute;
