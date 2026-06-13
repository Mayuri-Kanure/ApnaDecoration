import React, { createContext, useContext, useState, useEffect } from "react";
import { API_BASE_URL } from "../config/constants";
import { useToast } from "./ToastContext";

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const toast = useToast();

  // Fetch user from /auth/profile endpoint using token
  const fetchUserFromAPI = async (token) => {
    try {
      const response = await fetch(`${API_BASE_URL}/auth/profile`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        console.error("Failed to fetch user from /auth/profile, status:", response.status);
        if (response.status === 401) {
          localStorage.removeItem("token");
        }
        return null;
      }

      // Get response text first to check if it's valid JSON
      const responseText = await response.text();
      
      let data;
      try {
        data = JSON.parse(responseText);
      } catch (e) {
        console.error("🔐 Response is not valid JSON from /auth/profile:", responseText.substring(0, 100));
        return null;
      }

      // Handle different response structures
      let userData = null;
      if (data.success && data.data) {
        userData = data.data;
      } else if (data.user) {
        userData = data.user;
      } else if (data.id || data._id) {
        userData = data;
      } else {
        console.error("🔐 Unexpected response structure from /auth/profile:", data);
        return null;
      }

      // Check if user role is allowed in this app
      if (userData.role === "vendor") {
        console.warn("⚠️ Vendor detected in User app - clearing session");
        localStorage.removeItem("token");
        setUser(null);
        if (toast && typeof toast.show === 'function') {
          toast.show(
            "Vendors should use the Vendor application. Please log in to the Vendor portal.",
            "warning",
          );
        }
        return null;
      }

      if (userData.role === "admin") {
        console.warn("⚠️ Admin detected in User app - clearing session");
        localStorage.removeItem("token");
        setUser(null);
        if (toast && typeof toast.show === 'function') {
          toast.show(
            "Admins should use the Admin application. Please log in to the User portal with a regular user account.",
            "warning",
          );
        }
        return null;
      }

      return userData;
    } catch (error) {
      console.error("🔐 Error fetching user from /auth/profile:", error);
      return null;
    }
  };

  // Initialize auth on app load
  useEffect(() => {
    const initializeAuth = async () => {
      try {
        const token = localStorage.getItem("token");
        console.log("🔐 User AuthContext init - Token exists:", !!token);

        if (token) {
          // Fetch fresh user data from backend using token
          const userData = await fetchUserFromAPI(token);
          if (userData) {
            setUser(userData);
          } else {
            // Token is invalid or user no longer exists
            localStorage.removeItem("token");
            setUser(null);
          }
        } else {
          setUser(null);
        }
      } catch (error) {
        console.error("🔐 Auth initialization error:", error);
        localStorage.removeItem("token");
        setUser(null);
      } finally {
        setLoading(false);
      }
    };

    initializeAuth();
  }, [toast]);

  const login = async (credentials) => {
    try {
      console.log("🔐 Attempting login to:", `${API_BASE_URL}/auth/login`);
      console.log("🔐 Login credentials:", {
        email: credentials.email,
        password: "***",
      });

      const response = await fetch(`${API_BASE_URL}/auth/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(credentials),
      });

      console.log("🔐 Login response status:", response.status);
      console.log("🔐 Login response headers:", response.headers);

      const data = await response.json();
      console.log("🔐 Login response data:", data);

      // Handle 2FA/OTP requirement
      if (data.requiresOTP === true) {
        console.log("🔐 2FA/OTP verification required");
        return {
          success: false,
          requiresOTP: true,
          message: data.message || "2FA verification required",
          data: data.data,
        };
      }

      // Extract token from response
      let token = null;
      if (data.token) {
        token = data.token;
      } else if (data.data && data.data.token) {
        token = data.data.token;
      }

      if (token) {
        // Store ONLY token in localStorage
        localStorage.setItem("token", token);

        // Fetch fresh user data from /auth/profile using the token
        const userData = await fetchUserFromAPI(token);
        if (userData) {
          setUser(userData);
          return { success: true, user: userData };
        } else {
          // Token obtained but couldn't fetch user data
          localStorage.removeItem("token");
          return { success: false, error: "Failed to fetch user data" };
        }
      } else {
        return { success: false, error: data.message || "Login failed" };
      }
    } catch (error) {
      console.error("🔐 Login error:", error);
      return { success: false, error: error.message || "Something went wrong" };
    }
  };

  const register = async (userData) => {
    try {
      console.log("📤 Register API call to:", `${API_BASE_URL}/auth/register`);
      console.log("📤 Register payload:", userData);

      const response = await fetch(`${API_BASE_URL}/auth/register`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(userData),
      });

      console.log("📤 Register response status:", response.status);

      const data = await response.json();
      console.log("📤 Register response data:", data);

      // Handle 2FA/OTP requirement
      if (data.requiresOTP === true) {
        console.log("📤 2FA/OTP verification required after registration");
        return {
          success: false,
          requiresOTP: true,
          message: data.message || "2FA verification required",
          data: data.data,
        };
      }

      // Extract token from response
      let token = null;
      if (data.token) {
        token = data.token;
      } else if (data.data && data.data.token) {
        token = data.data.token;
      }

      if (token) {
        // Store ONLY token in localStorage
        localStorage.setItem("token", token);

        // Fetch fresh user data from /auth/profile using the token
        const userData = await fetchUserFromAPI(token);
        if (userData) {
          setUser(userData);
          return { success: true, user: userData };
        } else {
          localStorage.removeItem("token");
          return { success: false, error: "Failed to fetch user data" };
        }
      } else {
        console.log("❌ Register error details:", {
          message: data.message,
          errors: data.errors,
          fullData: data,
        });
        return { success: false, error: data.message || "Registration failed" };
      }
    } catch (error) {
      console.log("❌ Register catch error:", error);
      return { success: false, error: error.message || "Something went wrong" };
    }
  };

  const getCurrentUser = async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        return { success: false, error: "No authentication token found" };
      }

      console.log(
        "🔐 Fetching current user from:",
        `${API_BASE_URL}/auth/profile`,
      );

      const response = await fetch(`${API_BASE_URL}/auth/profile`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });

      console.log("🔐 getCurrentUser response status:", response.status);
      console.log("🔐 getCurrentUser response ok:", response.ok);

      // Handle rate limiting
      if (response.status === 429) {
        console.log("🔐 Rate limit hit, please wait before retrying");
        return {
          success: false,
          error:
            "Rate limit exceeded. Please wait a moment and refresh the page.",
        };
      }

      const data = await response.json();
      console.log("🔐 getCurrentUser response data:", data);

      // Handle different response structures
      let userData = null;
      if (data.success && data.data) {
        // Backend returns {success: true, data: user}
        userData = data.data;
      } else if (data.user) {
        // Backend returns {user: {...}}
        userData = data.user;
      } else if (data.id || data._id) {
        // Backend returns user directly
        userData = data;
      } else {
        console.error("🔐 Unexpected response structure:", data);
        return { success: false, error: "Unexpected response structure" };
      }

      console.log("🔐 Extracted user data:", userData);
      console.log("🔐 User profileImage from backend:", userData.profileImage);

      // Update React state with fresh data from backend (NOT stored in localStorage)
      setUser(userData);
      console.log("🔐 User data refreshed from backend:", userData);
      return { success: true, user: userData };
    } catch (error) {
      console.error("🔐 getCurrentUser error:", error);

      // Handle JSON parsing errors (likely from rate limiting HTML pages)
      if (error.message.includes("Unexpected token")) {
        return {
          success: false,
          error:
            "Rate limit exceeded. Please wait a moment and refresh the page.",
        };
      }

      return {
        success: false,
        error: "An error occurred while fetching user data",
      };
    }
  };

  const updateProfile = async (profileData) => {
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        return { success: false, error: "No authentication token found" };
      }

      const response = await fetch(`${API_BASE_URL}/auth/profile`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(profileData),
      });

      const data = await response.json();

      if (data.success) {
        // Update React state with fresh data from backend (NOT stored in localStorage)
        const updatedUser = { ...user, ...profileData };
        setUser(updatedUser);

        return { success: true, user: updatedUser };
      } else {
        return {
          success: false,
          error: data.message || "Profile update failed",
        };
      }
    } catch (error) {
      return {
        success: false,
        error: "An error occurred during profile update",
      };
    }
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem("token");
  };

  // Handle token changes for multi-tab sync
  useEffect(() => {
    const handleStorageChange = async (e) => {
      if (e.key === "token") {
        const token = localStorage.getItem("token");

        if (!token) {
          // Token was removed in another tab
          setUser(null);
        } else {
          // Token was added/updated in another tab, fetch fresh user data
          const userData = await fetchUserFromAPI(token);
          if (userData) {
            setUser(userData);
          } else {
            localStorage.removeItem("token");
            setUser(null);
          }
        }
      }
    };

    window.addEventListener("storage", handleStorageChange);
    return () => window.removeEventListener("storage", handleStorageChange);
  }, [toast]);

  const value = {
    user,
    login,
    register,
    logout,
    getCurrentUser,
    updateProfile: (profileData) => updateProfile(profileData, user, setUser),
    isAuthenticated: !!user,
    loading,
    isAdmin: user?.role === "admin",
    isVendor: user?.role === "vendor",
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        login,
        register,
        logout,
        getCurrentUser,
        updateProfile: (profileData) =>
          updateProfile(profileData, user, setUser),
        isAuthenticated: !!user,
        loading,
        isAdmin: user?.role === "admin",
        isVendor: user?.role === "vendor",
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export default AuthContext;
