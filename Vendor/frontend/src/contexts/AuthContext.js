import React, { createContext, useContext, useState, useEffect } from "react";
import axios from "axios";
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
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const initializeAuth = async () => {
      try {
        const token = localStorage.getItem("vendorToken");
        const savedUser = localStorage.getItem("vendorUser");

        console.log("🔐 Vendor AuthContext init - Token exists:", !!token);
        console.log(
          "🔐 Vendor AuthContext - User data from localStorage:",
          !!savedUser,
        );

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
        console.error("AuthContext initialization error:", err);
        setError("Failed to initialize authentication");
        setIsLoading(false);
      }
    };

    initializeAuth();
  }, []);

  const validateToken = async (token) => {
    try {
      console.log("🔐 Validating vendor token...");
      const response = await axios.get(`${API_BASE_URL}/vendor/auth/profile`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (response.data && response.data.id) {
        console.log(
          "✅ Vendor token valid, user authenticated:",
          response.data,
        );
        setUser(response.data);
        setIsAuthenticated(true);
      } else {
        localStorage.removeItem("vendorToken");
        localStorage.removeItem("vendorUser");
        setIsAuthenticated(false);
        setUser(null);
      }
    } catch (err) {
      console.log("🔐 Vendor profile validation failed");
      localStorage.removeItem("vendorToken");
      localStorage.removeItem("vendorUser");
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
      console.log("🔑 Vendor login attempt with:", credentials);
      const response = await axios.post(
        `${API_BASE_URL}/vendor/auth/login`,
        credentials,
      );

      // Check for successful response
      if (response.data?.success) {
        // Token and user are in response.data.data (nested structure)
        const token = response.data.data?.token;
        const user = response.data.data?.user;
        
        if (token && user) {
          console.log("✅ Vendor login successful, user:", user);
          localStorage.setItem("vendorToken", token);
          localStorage.setItem("vendorUser", JSON.stringify(user));
          setUser(user);
          setIsAuthenticated(true);
          return { success: true };
        }
      }
      
      // If we get here, login failed
      console.log("❌ Vendor login failed, response:", response.data);
      console.log("❌ Vendor login failed, response status:", response.status);
      console.log("❌ Vendor login failed, response headers:", response.headers);
      setError(
        response.data?.message || response.data?.error || "Login failed",
      );
      return {
        success: false,
        error:
          response.data?.message || response.data?.error || "Login failed",
      };
    } catch (err) {
      console.error("🔑 Vendor login error:", err);
      const isNetworkError =
        !err.response &&
        (err.message === "Network Error" || err.code === "ERR_NETWORK");
      const errorMessage = isNetworkError
        ? "Cannot reach server. Check mobile internet and try again."
        : err.response?.data?.message || err.message || "Login failed";
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
      const response = await axios.post(
        `${API_BASE_URL}/vendor/auth/register`,
        vendorData,
      );

      if (
        response.data &&
        response.data.success &&
        response.data.data &&
        response.data.data.user &&
        response.data.data.token
      ) {
        const { user, token } = response.data.data;
        localStorage.setItem("vendorToken", token);
        localStorage.setItem("vendorUser", JSON.stringify(user));
        setUser(user);
        setIsAuthenticated(true);
        return { success: true };
      } else {
        setError(response.data.message || "Registration failed");
        return {
          success: false,
          error: response.data.message || "Registration failed",
        };
      }
    } catch (err) {
      const errorMessage =
        err.response?.data?.message || err.message || "Registration failed";
      setError(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    localStorage.removeItem("vendorToken");
    localStorage.removeItem("vendorUser");
    setUser(null);
    setIsAuthenticated(false);
    setError(null);
  };

  const updateProfile = async (vendorData) => {
    setIsLoading(true);
    setError(null);

    try {
      const token = localStorage.getItem("vendorToken");
      const response = await axios.put(
        `${API_BASE_URL}/vendor/auth/profile`,
        vendorData,
        {
          headers: { Authorization: `Bearer ${token}` },
        },
      );

      console.log("🔍 AuthContext - Profile update response:", response.data);

      if (response.data && response.data.success) {
        console.log(
          "✅ AuthContext - Profile update successful, vendor data:",
          response.data.vendor,
        );
        setUser(response.data.vendor);
        localStorage.setItem(
          "vendorUser",
          JSON.stringify(response.data.vendor),
        );
        return { success: true };
      } else {
        console.log("❌ AuthContext - Profile update failed:", response.data);
        setError(response.data.message || "Profile update failed");
        return {
          success: false,
          error: response.data.message || "Profile update failed",
        };
      }
    } catch (err) {
      const errorMessage =
        err.response?.data?.message || err.message || "Profile update failed";
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
    setError,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export default AuthContext;
