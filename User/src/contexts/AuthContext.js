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
        console.log('🔐 User AuthContext init - Token exists:', !!localStorage.getItem('token'));
        console.log('🔐 User AuthContext - User data from localStorage:', !!localStorage.getItem('user'));
        
        const token = localStorage.getItem('token');
        const userData = localStorage.getItem('user');
        
        if (token && userData) {
          const parsedUser = JSON.parse(userData);
          
          // Check if user is a vendor - vendors should use Vendor app
          if (parsedUser.role === 'vendor') {
            console.warn('⚠️ Vendor detected in User app - clearing session');
            localStorage.removeItem('token');
            localStorage.removeItem('user');
            setUser(null);
            alert('Vendors should use the Vendor application. Please log in to the Vendor portal.');
            return;
          }
          
          setUser(parsedUser);
        } else {
          setUser(null);
        }
      } catch (error) {
        // Clear corrupted data
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        setUser(null);
      } finally {
        setLoading(false);
      }
    };

    initializeAuth();
  }, []);

  const login = async (credentials) => {
    try {
      const response = await fetch(`${process.env.REACT_APP_API_BASE_URL}/api/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(credentials),
      });

      const data = await response.json();
      
      if (data.success) {
        // Store token and user data
        localStorage.setItem('token', data.data.token);
        localStorage.setItem('user', JSON.stringify(data.data.user));
        setUser(data.data.user);
        return { success: true, user: data.data.user };
      } else {
        return { success: false, error: data.message || 'Login failed' };
      }
    } catch (error) {
      return { success: false, error: 'An error occurred during login' };
    }
  };

  const register = async (userData) => {
    try {
      const response = await fetch(`${process.env.REACT_APP_API_BASE_URL}/api/auth/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(userData),
      });

      const data = await response.json();
      
      if (data.success) {
        // Store token and user data
        localStorage.setItem('token', data.data.token);
        localStorage.setItem('user', JSON.stringify(data.data.user));
        setUser(data.data.user);
        return { success: true, user: data.data.user };
      } else {
        return { success: false, error: data.message || 'Registration failed' };
      }
    } catch (error) {
      return { success: false, error: 'An error occurred during registration' };
    }
  };

  const updateProfile = async (profileData) => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        return { success: false, error: 'No authentication token found' };
      }

      const response = await fetch(`${process.env.REACT_APP_API_BASE_URL}/api/auth/profile`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(profileData)
      });

      const data = await response.json();
      
      if (data.success) {
        // Update local user state
        const updatedUser = { ...user, ...profileData };
        setUser(updatedUser);
        localStorage.setItem('user', JSON.stringify(updatedUser));
        
        return { success: true, user: updatedUser };
      } else {
        return { success: false, error: data.message || 'Profile update failed' };
      }
    } catch (error) {
      return { success: false, error: 'An error occurred during profile update' };
    }
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  };

  // Handle localStorage changes for multi-tab sync
  useEffect(() => {
    const handleStorageChange = (e) => {
      if (e.key === 'token' || e.key === 'user') {
        const token = localStorage.getItem('token');
        const userStr = localStorage.getItem('user');
        
        if (!token) {
          setUser(null);
        } else if (userStr) {
          try {
            const userData = JSON.parse(userStr);
            setUser(userData);
          } catch (error) {
            console.error('Failed to parse user data from localStorage');
            setUser(null);
          }
        }
      }
    };

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  const value = {
    user,
    login,
    register,
    logout,
    updateProfile: (profileData) => updateProfile(profileData, user, setUser),
    isAuthenticated: !!user,
    loading,
    isAdmin: user?.role === 'admin',
    isVendor: user?.role === 'vendor',
    isCustomer: !user?.role || user?.role === 'customer'
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export default AuthContext;
