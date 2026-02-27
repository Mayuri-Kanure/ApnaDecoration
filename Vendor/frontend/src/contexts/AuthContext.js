import React, { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  const API_BASE_URL = process.env.REACT_APP_API_URL || 'https://admin-api.apnadecoration.com/api';

  useEffect(() => {
    const initializeAuth = async () => {
      try {
        const token = localStorage.getItem('vendorToken');
        const savedUser = localStorage.getItem('vendorUser');
        
        console.log('🔐 Vendor AuthContext init - Token exists:', !!token);
        console.log('🔐 Vendor AuthContext - User data from localStorage:', !!savedUser);
        
        if (token && savedUser) {
          const parsedUserData = JSON.parse(savedUser);
          setUser(parsedUserData);
          setIsAuthenticated(true);
        } else {
          setUser(null);
          setIsAuthenticated(false);
        }
        
        setIsLoading(false);
        setError(null);
      } catch (err) {
        console.error('AuthContext initialization error:', err);
        setError('Failed to initialize authentication');
        setIsLoading(false);
      }
    };

    initializeAuth();
  }, []);

  const validateToken = async (token) => {
    try {
      console.log('🔐 Validating vendor token...');
      const response = await axios.get(`${API_BASE_URL}/auth/profile`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      if (response.data && response.data.id) {
        console.log('✅ Vendor token valid, user authenticated:', response.data);
        setUser(response.data);
        setIsAuthenticated(true);
      } else {
        localStorage.removeItem('vendorToken');
        localStorage.removeItem('vendorUser');
        setIsAuthenticated(false);
        setUser(null);
      }
    } catch (err) {
      console.log('🔐 Vendor profile validation failed');
      localStorage.removeItem('vendorToken');
      localStorage.removeItem('vendorUser');
      setIsAuthenticated(false);
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  };

  const login = async (credentials) => {
    setIsLoading(true);
    setError(null);
    
    try {
      console.log('🔑 Vendor login attempt with:', credentials);
      const response = await axios.post(`${API_BASE_URL}/auth/login`, credentials);
      
      if (response.data && response.data.token && response.data.user) {
        const { user, token } = response.data;
        console.log('✅ Vendor login successful, user:', user);
        localStorage.setItem('vendorToken', token);
        localStorage.setItem('vendorUser', JSON.stringify(user));
        setUser(user);
        setIsAuthenticated(true);
        return { success: true };
      } else {
        console.log('❌ Vendor login failed, response:', response.data);
        console.log('❌ Vendor login failed, response status:', response.status);
        console.log('❌ Vendor login failed, response headers:', response.headers);
        setError(response.data?.message || response.data?.error || 'Login failed');
        return { success: false, error: response.data?.message || response.data?.error || 'Login failed' };
      }
    } catch (err) {
      console.error('🔑 Vendor login error:', err);
      const errorMessage = err.response?.data?.message || err.message || 'Login failed';
      setError(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (vendorData) => {
    setIsLoading(true);
    setError(null);
    
    try {
      const response = await axios.post(`${API_BASE_URL}/vendor/auth/register`, vendorData);
      
      if (response.data && response.data.success && response.data.data && response.data.data.user && response.data.data.token) {
        const { user, token } = response.data.data;
        localStorage.setItem('vendorToken', token);
        localStorage.setItem('vendorUser', JSON.stringify(user));
        setUser(user);
        setIsAuthenticated(true);
        return { success: true };
      } else {
        setError(response.data.message || 'Registration failed');
        return { success: false, error: response.data.message || 'Registration failed' };
      }
    } catch (err) {
      const errorMessage = err.response?.data?.message || err.message || 'Registration failed';
      setError(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    localStorage.removeItem('vendorToken');
    localStorage.removeItem('vendorUser');
    setUser(null);
    setIsAuthenticated(false);
    setError(null);
  };

  const updateProfile = async (vendorData) => {
    setIsLoading(true);
    setError(null);
    
    try {
      const token = localStorage.getItem('vendorToken');
      const response = await axios.put(`${API_BASE_URL}/vendor/auth/profile`, vendorData, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      if (response.data && response.data.success) {
        setUser(response.data.vendor);
        localStorage.setItem('vendorUser', JSON.stringify(response.data.vendor));
        return { success: true };
      } else {
        setError(response.data.message || 'Profile update failed');
        return { success: false, error: response.data.message || 'Profile update failed' };
      }
    } catch (err) {
      const errorMessage = err.response?.data?.message || err.message || 'Profile update failed';
      setError(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setIsLoading(false);
    }
  };

  const value = {
    user,
    isAuthenticated,
    isLoading,
    error,
    login,
    register,
    logout,
    updateProfile,
    setError
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export default AuthContext;
