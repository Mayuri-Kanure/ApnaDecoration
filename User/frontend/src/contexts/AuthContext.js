import React, { createContext, useContext, useState, useEffect } from "react";
import { API_BASE_URL } from "../config/constants";

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

  useEffect(() => {
    const initializeAuth = () => {
      try {
        console.log(
          "🔐 User AuthContext init - Token exists:",
          !!localStorage.getItem("token"),
        );
        console.log(
          "🔐 User AuthContext - User data from localStorage:",
          !!localStorage.getItem("user"),
        );

        const token = localStorage.getItem("token");
        const userData = localStorage.getItem("user");

        if (token && userData) {
          const parsedUser = JSON.parse(userData);

          // Check if user is a vendor - vendors should use Vendor app
          if (parsedUser.role === "vendor") {
            console.warn("⚠️ Vendor detected in User app - clearing session");
            localStorage.removeItem("token");
            localStorage.removeItem("user");
            setUser(null);
            alert(
              "Vendors should use the Vendor application. Please log in to the Vendor portal.",
            );
            return;
          }

          // Check if user is admin - admins should use Admin app
          if (parsedUser.role === "admin") {
            console.warn("⚠️ Admin detected in User app - clearing session");
            localStorage.removeItem("token");
            localStorage.removeItem("user");
            setUser(null);
            alert(
              "Admins should use the Admin application. Please log in to the User portal with a regular user account.",
            );
            return;
          }

          setUser(parsedUser);
        } else {
          setUser(null);
        }
      } catch (error) {
        // Clear corrupted data
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        setUser(null);
      } finally {
        setLoading(false);
      }
    };

    initializeAuth();
  }, []);

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

      if (data.token && data.user) {
        // Store token and user data
        localStorage.setItem("token", data.token);
        localStorage.setItem("user", JSON.stringify(data.user));
        setUser(data.user);
        return { success: true, user: data.user };
      } else if (data.success && data.data) {
        // Handle wrapped response format
        localStorage.setItem("token", data.data.token);
        localStorage.setItem("user", JSON.stringify(data.data.user));
        setUser(data.data.user);
        return { success: true, user: data.data.user };
      } else {
        return { success: false, error: data.message || "Login failed" };
      }
    } catch (error) {
      console.error("🔐 Login error:", error);
      return { success: false, error: "An error occurred during login" };
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

      if (data.success) {
        // Store token and user data
        localStorage.setItem("token", data.data.token);
        localStorage.setItem("user", JSON.stringify(data.data.user));
        setUser(data.data.user);
        return { success: true, user: data.data.user };
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
      return { success: false, error: "An error occurred during registration" };
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

      // Update local user state with fresh data from backend
      setUser(userData);
      localStorage.setItem("user", JSON.stringify(userData));
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
        // Update local user state
        const updatedUser = { ...user, ...profileData };
        setUser(updatedUser);
        localStorage.setItem("user", JSON.stringify(updatedUser));

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
    localStorage.removeItem("user");
  };

  // Handle localStorage changes for multi-tab sync
  useEffect(() => {
    const handleStorageChange = (e) => {
      if (e.key === "token" || e.key === "user") {
        const token = localStorage.getItem("token");
        const userStr = localStorage.getItem("user");

        if (!token) {
          setUser(null);
        } else if (userStr) {
          try {
            const userData = JSON.parse(userStr);
            setUser(userData);
          } catch (error) {
            console.error("Failed to parse user data from localStorage");
            setUser(null);
          }
        }
      }
    };

    window.addEventListener("storage", handleStorageChange);
    return () => window.removeEventListener("storage", handleStorageChange);
  }, []);

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
