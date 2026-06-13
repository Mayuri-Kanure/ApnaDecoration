import React, { createContext, useContext, useState, useEffect } from 'react';
import api from '../utils/axiosClient';

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
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const initializeAuth = async () => {
      try {
        const token = localStorage.getItem('token');
        const userData = localStorage.getItem('user');

        if (!token || !userData) {
          setUser(null);
          return;
        }

        const parsedUser = JSON.parse(userData);
        setUser(parsedUser);

        // Validate token against live API (fixes stale/invalid tokens)
        try {
          const { data } = await api.get('/auth/profile');
          if (data?.email) {
            setUser(data);
            localStorage.setItem('user', JSON.stringify(data));
          }
        } catch (verifyError) {
          console.warn('AuthContext: token invalid on server', verifyError.response?.data);
          localStorage.removeItem('token');
          localStorage.removeItem('user');
          setUser(null);
        }
      } catch (error) {
        console.error('AuthContext: Error initializing auth:', error);
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        setUser(null);
      } finally {
        setLoading(false);
      }
    };

    initializeAuth();
  }, []);

  const login = (userData) => {
    console.log('AuthContext: Login called with', userData);
    setUser(userData);
  };

  const logout = () => {
    console.log('AuthContext: Logout called');
    setUser(null);
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  };

  // Add debugging for localStorage changes
  useEffect(() => {
    const handleStorageChange = (e) => {
      console.log('AuthContext: Storage changed', e.key, e.newValue);
      if (e.key === 'token' || e.key === 'user') {
        if (!e.newValue) {
          console.log('AuthContext: Auth data was cleared');
          setUser(null);
        }
      }
    };

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  const value = {
    user,
    login,
    logout,
    isAuthenticated: !!user,
    loading
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export default AuthContext;
