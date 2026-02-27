import React, { createContext, useContext, useState, useEffect } from 'react';

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
    const initializeAuth = () => {
      try {
        const token = localStorage.getItem('token');
        const userData = localStorage.getItem('user');
        
        console.log('AuthContext: Checking localStorage', { token: !!token, userData: !!userData });
        console.log('AuthContext: Raw localStorage data', { token, userData });
        
        if (token && userData) {
          const parsedUser = JSON.parse(userData);
          console.log('AuthContext: User found', parsedUser);
          setUser(parsedUser);
        } else {
          console.log('AuthContext: No auth data found');
          setUser(null);
        }
      } catch (error) {
        console.error('AuthContext: Error initializing auth:', error);
        // Clear corrupted data
        console.log('AuthContext: Clearing corrupted data');
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
