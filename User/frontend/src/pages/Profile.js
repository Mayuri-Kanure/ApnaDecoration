import React, { useState, useEffect, useRef, useCallback } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { toast } from "react-toastify";
import { useCart } from "../contexts/CartContext";
import { clearCache } from "../utils/apiCache";
import axios from "axios";
import { API_BASE_URL } from "../config/constants";
import Navigation from "../components/Navigation";
import Footer from "../components/Footer";
import { useAuth } from "../contexts/AuthContext";
import addressService from "../services/addressService";
import orderService from "../services/orderService";
import notificationService from "../services/notificationService";
import {
  Search,
  ShoppingBag,
  User,
  Heart,
  ChevronRight,
  Edit2,
  Package,
  MapPin,
  Bell,
  Shield,
  LogOut,
  Camera,
  X,
  Check,
  ArrowLeft,
  Trash2,
  Upload,
  Building2,
  Smartphone,
  Lock,
  Key,
  Home,
  Briefcase,
  Phone,
} from "lucide-react";

// Constants
const IMAGE_BASE_URL = "https://apnadecoration.in/uploads";

const Profile = () => {
  const { user, logout, updateProfile, getCurrentUser } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [activeTab, setActiveTab] = useState("personal");
  const [isEditing, setIsEditing] = useState(false);

  // Read tab from URL parameters
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const tab = params.get("tab");

    if (
      tab &&
      ["personal", "addresses", "orders", "notifications", "security"].includes(
        tab,
      )
    ) {
      setActiveTab(tab);
    }
  }, [location.search]);

  const [userData, setUserData] = useState(() => {
    // Split the user's name into firstName and lastName
    const nameParts = (user?.name || "").split(" ");
    console.log("👤 Initial user object:", user);
    console.log("👤 User profileImage:", user?.profileImage);
    return {
      firstName: nameParts[0] || "",
      lastName: nameParts.slice(1).join(" ") || "",
      email: user?.email || "",
      phone: user?.phone || "",
      dateOfBirth: user?.dateOfBirth || "",
      gender: user?.gender || "",
      profileImage: user?.profileImage || "",
    };
  });

  const [addressData, setAddressData] = useState([]);
  const [orders, setOrders] = useState([]);
  const [allOrders, setAllOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [orderTab, setOrderTab] = useState("active"); // 'active' or 'cancelled'
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [showOrderDetails, setShowOrderDetails] = useState(false);
  const fileInputRef = useRef(null);

  // Sync userData with AuthContext user changes
  useEffect(() => {
    if (user) {
      console.log("👤 Syncing userData with AuthContext user:", user);
      console.log("👤 User profileImage from AuthContext:", user.profileImage);
      setUserData({
        firstName: user.firstName || "",
        lastName: user.lastName || "",
        email: user.email || "",
        phone: user.phone || "",
        dateOfBirth: user.dateOfBirth || "",
        gender: user.gender || "",
        profileImage: user.profileImage || "",
      });
    }
  }, [user]);

  // Camera and image upload handlers
  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (file) {
      console.log("📷 Image selected for profile update:", file.name);

      try {
        // Create FormData for file upload
        const formData = new FormData();
        formData.append("profileImage", file);

        const token = localStorage.getItem("token");
        if (!token) {
          alert("Please login to update profile image");
          return;
        }

        // Upload to backend which will handle Cloudinary
        const response = await fetch(
          `${API_BASE_URL}/auth/upload-profile-image`,
          {
            method: "POST",
            headers: {
              Authorization: `Bearer ${token}`,
            },
            body: formData,
          },
        );

        const result = await response.json();

        if (response.ok && result.success) {
          alert("Profile image updated successfully!");
          console.log(
            "✅ Profile image uploaded to Cloudinary:",
            result.data.profileImage,
          );

          // Update local state with Cloudinary URL
          setUserData((prev) => ({
            ...prev,
            profileImage: result.data.profileImage,
          }));

          // Update auth context
          const updatedProfile = {
            profileImage: result.data.profileImage,
          };
          await updateProfile(updatedProfile);
        } else {
          console.error("❌ Profile image upload failed:", result.message);
          alert(result.message || "Failed to update profile image");
        }
      } catch (error) {
        console.error("❌ Profile image upload error:", error);
        alert("Failed to update profile image. Please try again.");
      }
    }
  };

  const handleCameraClick = () => {
    console.log("📷 Camera button clicked");
    // In a real implementation, this would access the device camera
    alert("Camera feature would access your device camera to take a photo");
  };
  const [notifications, setNotifications] = useState([]);
  const [notificationPreferences, setNotificationPreferences] = useState({
    email: true,
    sms: false,
    push: false,
    orderUpdates: true,
    paymentAlerts: true,
    promotions: true,
    deliveryNotifications: true,
  });
  const [notificationSettings, setNotificationSettings] = useState({
    twoFactorEnabled: false,
    loginAlerts: true,
    sessionTimeout: true,
    passwordStrength: "medium",
  });
  const [securitySettings, setSecuritySettings] = useState({
    twoFactorEnabled: false,
    loginAlerts: true,
    sessionTimeout: true,
    passwordStrength: "medium",
  });
  const [passwordData, setPasswordData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  const [showAddAddressForm, setShowAddAddressForm] = useState(false);
  const [showEditAddressForm, setShowEditAddressForm] = useState(false);
  const [editingAddress, setEditingAddress] = useState(null);
  const [newAddress, setNewAddress] = useState({
    type: "home",
    name: "",
    phone: "",
    addressLine1: "",
    addressLine2: "",
    city: "",
    state: "",
    pincode: "",
    country: "India",
    isDefault: false,
  });

  // Load addresses from backend
  useEffect(() => {
    const loadAddresses = async () => {
      try {
        const response = await addressService.getAddresses();
        console.log("🏠 Addresses API response:", response);
        console.log("🏠 Addresses response.data:", response.data);
        console.log("🏠 Addresses response.data.data:", response.data?.data);
        // Response is the addresses array directly, not wrapped in data property
        setAddressData(Array.isArray(response) ? response : []);
      } catch (error) {
        console.error("Failed to load addresses:", error);
      }
    };

    loadAddresses();
  }, []);

  // Handle order cancellation
  const handleCancelOrder = async (orderId) => {
    console.log("Cancel button clicked for order:", orderId);
    console.log("Current orders:", orders);

    // Find the order to check its current status
    const order = orders.find((o) => o._id === orderId);
    console.log("Found order:", order);

    if (!order) {
      console.error("Order not found for ID:", orderId);
      alert("Order not found");
      return;
    }

    // Prevent cancellation if already cancelled
    if (order.status === "cancelled") {
      console.log("Order is already cancelled:", order);
      alert("This order is already cancelled");
      return;
    }

    // Allow cancellation for pending and confirmed orders
    const cancellableStatuses = ["pending", "confirmed"];
    console.log("Order status check:", order.status, "vs", cancellableStatuses);
    if (!cancellableStatuses.includes(order.status)) {
      console.log("Order cannot be cancelled - status:", order.status);
      toast.error("Order cannot be cancelled at this stage");
      return;
    }

    if (
      !window.confirm(
        "Are you sure you want to cancel this order? This action cannot be undone.",
      )
    ) {
      return;
    }

    try {
      console.log("🚫 Cancelling order:", orderId);

      // Get user token for authentication
      const token = localStorage.getItem("token");
      if (!token) {
        throw new Error("Authentication required. Please login again.");
      }

      const cancelUrl = `${API_BASE_URL}/orders/${orderId}/cancel`;

      console.log("🚫 Cancel order URL:", cancelUrl);

      // Optimistically update the UI to prevent double-clicks
      setOrders((prevOrders) =>
        prevOrders.map((o) =>
          o._id === orderId ? { ...o, isCancelling: true } : o,
        ),
      );

      // Call backend cancel order API
      const response = await fetch(cancelUrl, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          reason: "Customer requested cancellation",
        }),
      });

      console.log("🚫 Cancel order response status:", response.status);
      console.log("🚫 Cancel order response headers:", response.headers);

      if (!response.ok) {
        // Revert the optimistic update on error
        setOrders((prevOrders) =>
          prevOrders.map((o) =>
            o._id === orderId ? { ...o, isCancelling: false } : o,
          ),
        );

        const errorText = await response.text();
        console.log("🚫 Cancel order error response:", errorText);

        let errorData;
        try {
          errorData = JSON.parse(errorText);
        } catch (e) {
          errorData = { message: errorText };
        }

        // Handle specific "already cancelled" case
        if (errorData.message === "Order is already cancelled") {
          // Update the order status in UI to reflect the backend state
          setOrders((prevOrders) =>
            prevOrders.map((o) =>
              o._id === orderId ? { ...o, status: "cancelled" } : o,
            ),
          );
          alert("⚠️ This order is already cancelled");
          return;
        }

        throw new Error(
          errorData.message || errorData.error || "Failed to cancel order",
        );
      }

      const result = await response.json();
      console.log("Order cancelled successfully:", result);

      // Instant UI update - no reload needed
      // Update BOTH orders and allOrders to keep counts in sync
      setOrders((prev) =>
        prev.map((o) =>
          o._id === orderId
            ? { ...o, status: "cancelled", isCancelling: false }
            : o,
        ),
      );

      setAllOrders((prev) =>
        prev.map((o) =>
          o._id === orderId
            ? { ...o, status: "cancelled", isCancelling: false }
            : o,
        ),
      );

      console.log(
        "Order status updated instantly in UI:",
        orderId,
        "-> cancelled",
      );
      console.log("Both orders and allOrders states updated for count sync");

      // Show success toast using react-toastify
      toast.success("Order cancelled successfully!", {
        position: "top-right",
        autoClose: 3000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        progress: undefined,
      });
    } catch (error) {
      console.error("❌ Error cancelling order:", error);
      toast.error(`Failed to cancel order: ${error.message}`, {
        position: "top-right",
        autoClose: 5000,
      });
    }
  };

  // Handle reorder
  const handleReorder = async (order) => {
    try {
      console.log("🔄 Reordering:", order);

      // Add all items from the cancelled order back to cart
      const items = getOrderItems(order);
      if (items && items.length > 0) {
        // For now, we'll use a direct import approach until the context is properly set up
        try {
          const { addToCart } = require("../contexts/CartContext");

          for (const item of items) {
            await addToCart({
              productId: item.product._id || item.product,
              quantity: item.quantity,
              price: item.unitPrice,
            });
          }
        } catch (error) {
          console.error("Cart context not available:", error);
          toast.error("Cart functionality not available");
        }
      }

      // Show success message using toast
      toast.success("Items added to cart! Proceeding to checkout...", {
        position: "top-right",
        autoClose: 3000,
      });

      // Redirect to cart page using React Router
      navigate("/cart");
    } catch (error) {
      console.error("Error reordering:", error);
      toast.error(`Failed to reorder: ${error.message}`, {
        position: "top-right",
        autoClose: 5000,
      });
    }
  };

  // Handle clearing cancelled orders
  const handleClearCancelledOrders = async () => {
    console.log("Clear cancelled orders button clicked!");
    console.log("Current orders:", orders);
    console.log("Current orderTab:", orderTab);

    // Since backend already filters cancelled orders for this tab,
    // we can just use the current orders array length
    const cancelledOrdersCount = orders.length;

    console.log("Cancelled orders count:", cancelledOrdersCount);

    if (cancelledOrdersCount === 0) {
      toast.error("No cancelled orders to clear");
      return;
    }

    if (
      window.confirm(
        `Are you sure you want to clear ${cancelledOrdersCount} cancelled order${cancelledOrdersCount > 1 ? "s" : ""}? This action cannot be undone.`,
      )
    ) {
      try {
        // Get user token for authentication
        const token = localStorage.getItem("token");
        if (!token) {
          toast.error("Authentication required. Please login again.");
          return;
        }

        console.log(
          "Clearing cancelled orders with API:",
          `${API_BASE_URL}/orders/clear-cancelled`,
        );

        // Call backend API to clear cancelled orders
        const response = await fetch(`${API_BASE_URL}/orders/clear-cancelled`, {
          method: "DELETE",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        });

        console.log("Clear cancelled orders response status:", response.status);

        if (!response.ok) {
          const errorText = await response.text();
          console.error("API Error Response:", errorText);
          throw new Error(
            `Failed to clear cancelled orders: ${response.status} - ${errorText}`,
          );
        }

        const result = await response.json();
        console.log("Cancelled orders cleared from backend:", result);

        // Clear frontend state after successful backend deletion
        // Update BOTH states to keep counts in sync
        setOrders([]);
        setAllOrders((prev) =>
          prev.filter((o) => normalizeStatus(o.status) !== "cancelled"),
        );

        // Show success message using toast
        toast.success(
          `Successfully cleared ${result.deletedCount || cancelledOrdersCount} cancelled orders!`,
          {
            position: "top-right",
            autoClose: 3000,
          },
        );

        // Optional: Reload orders to ensure frontend sync with backend
        setTimeout(() => {
          window.location.reload(); // Force refresh to ensure data consistency
        }, 1000);
      } catch (error) {
        console.error("Error clearing cancelled orders:", error);

        // Show error message
        toast.error(`Failed to clear cancelled orders: ${error.message}`, {
          position: "top-right",
          autoClose: 4000,
        });
      }
    }
  };

  // Handle showing order details
  const handleViewOrderDetails = (order) => {
    setSelectedOrder(order);
    setShowOrderDetails(true);
  };

  // Handle closing order details
  const handleCloseOrderDetails = () => {
    setSelectedOrder(null);
    setShowOrderDetails(false);
  };

  // PRODUCTION-READY status normalization
  const normalizeStatus = (status) => {
    return status?.toLowerCase() || "pending";
  };

  // Standardize items array - CRITICAL FIX
  const getOrderItems = (order) => {
    return order.items || order.products || [];
  };

  // PRODUCTION-READY image function - simplified structure
  const getOrderItemImage = (item, index = 0) => {
    // Check multiple possible image sources in order of preference
    const possibleSources = [
      item?.thumbnail,
      item?.productSnapshot?.thumbnail,
      item?.images?.[0], // First image from images array
      item?.productSnapshot?.images?.[0], // First image from snapshot images
      item?.product?.thumbnail,
      item?.product?.images?.[0],
    ];

    // Find the first valid image URL
    for (const imageUrl of possibleSources) {
      if (imageUrl) {
        // Check if it's a complete URL (http/https) or needs base URL
        if (imageUrl.startsWith("http://") || imageUrl.startsWith("https://")) {
          console.log("Using full URL:", imageUrl);
          return imageUrl;
        } else if (imageUrl.startsWith("/")) {
          console.log(
            "Using relative path with base URL:",
            IMAGE_BASE_URL + imageUrl,
          );
          return IMAGE_BASE_URL + imageUrl;
        } else {
          console.log(
            "Using relative path with base URL:",
            IMAGE_BASE_URL + "/" + imageUrl,
          );
          return IMAGE_BASE_URL + "/" + imageUrl;
        }
      }
    }

    // Fallback to placeholder
    console.log(
      "No image found, using fallback for item:",
      item?.name || "unknown",
    );
    return `https://picsum.photos/seed/product-${index}/64/64.jpg`;
  };

  // PRODUCTION-READY product name function - simplified structure
  const getOrderItemName = (item) => {
    return (
      item?.name ||
      item?.productSnapshot?.name ||
      (typeof item?.product === "object" && item.product?.name) ||
      item?.product_name_en ||
      item?.productName ||
      "Product"
    );
  };

  // Load orders from backend
  useEffect(() => {
    const loadOrders = async () => {
      try {
        console.log("Profile - Fetching orders...");

        // Fetch ALL orders - no status filtering
        const response = await orderService.getOrders();
        console.log("Profile - Orders response:", response);
        console.log("Profile - Orders data:", response.data);
        console.log("Profile - Orders array:", response.orders);
        console.log(
          "Profile - Raw orders length:",
          response.orders?.length || response.data?.length || 0,
        );

        // Handle different response formats
        let ordersArray = [];
        if (response.orders && Array.isArray(response.orders)) {
          ordersArray = response.orders;
        } else if (response.data && response.data.orders) {
          ordersArray = response.data.orders;
        } else if (Array.isArray(response.data)) {
          ordersArray = response.data;
        } else if (Array.isArray(response)) {
          ordersArray = response;
        }

        // ALWAYS ensure status exists
        ordersArray = ordersArray.map((order) => ({
          ...order,
          status: order.status || "pending",
        }));

        console.log("Profile - Total orders fetched:", ordersArray.length);
        console.log("Profile - All orders array:", ordersArray);

        // DEBUG: Count cancelled orders
        const cancelledCount = ordersArray.filter(
          (o) => normalizeStatus(o.status) === "cancelled",
        ).length;
        console.log("Profile - Cancelled orders found:", cancelledCount);

        if (cancelledCount > 0) {
          console.log("Profile - Cancelled order details:");
          ordersArray
            .filter((o) => normalizeStatus(o.status) === "cancelled")
            .forEach((order, index) => {
              console.log(
                `  ${index + 1}. ${order.orderNumber} - Status: ${order.status}`,
              );
            });
        }

        // Store ALL orders
        setAllOrders(ordersArray);
      } catch (error) {
        console.error(
          "Profile - Orders endpoint not available yet, using mock data:",
          error,
        );
        console.log("Profile - Full error:", error);

        // Mock data for testing UI
        const mockOrders = [
          {
            _id: "mock-order-1",
            status: "delivered",
            totalAmount: 1299,
            createdAt: new Date(
              Date.now() - 7 * 24 * 60 * 60 * 1000,
            ).toISOString(),
            items: [
              {
                productSnapshot: {
                  name: "Premium Birthday Decoration Package",
                  thumbnail: "https://picsum.photos/seed/birthday/64/64.jpg",
                  price: 1299,
                },
                quantity: 1,
                unitPrice: 1299,
              },
            ],
          },
          {
            _id: "mock-order-2",
            status: "pending",
            totalAmount: 899,
            createdAt: new Date(
              Date.now() - 2 * 24 * 60 * 60 * 1000,
            ).toISOString(),
            items: [
              {
                productSnapshot: {
                  name: "Wedding Anniversary Setup",
                  thumbnail: "https://picsum.photos/seed/wedding/64/64.jpg",
                  price: 899,
                },
                quantity: 1,
                unitPrice: 899,
              },
            ],
          },
          {
            _id: "mock-order-3",
            status: "cancelled",
            totalAmount: 599,
            createdAt: new Date(
              Date.now() - 5 * 24 * 60 * 60 * 1000,
            ).toISOString(),
            items: [
              {
                productSnapshot: {
                  name: "Corporate Event Decoration",
                  thumbnail: "https://picsum.photos/seed/corporate/64/64.jpg",
                  price: 599,
                },
                quantity: 1,
                unitPrice: 599,
              },
            ],
          },
          {
            _id: "mock-order-4",
            status: "cancelled",
            totalAmount: 799,
            createdAt: new Date(
              Date.now() - 2 * 24 * 60 * 60 * 1000,
            ).toISOString(),
            items: [
              {
                productSnapshot: {
                  name: "Birthday Party Package",
                  thumbnail: "https://picsum.photos/seed/birthday/64/64.jpg",
                  price: 799,
                },
                quantity: 1,
                unitPrice: 799,
              },
            ],
          },
        ];

        console.log("Profile - Using mock orders for testing:", mockOrders);
        console.log("Profile - Setting allOrders with mock data");
        setAllOrders(mockOrders); // Use mock data for testing
      }
    };

    loadOrders();
  }, []); // Load orders only once

  // Calculate tab counts once for efficiency
  const activeCount = allOrders.filter(
    (o) => normalizeStatus(o.status) !== "cancelled",
  ).length;

  const cancelledCount = allOrders.filter(
    (o) => normalizeStatus(o.status) === "cancelled",
  ).length;

  // Filter orders based on tab
  useEffect(() => {
    console.log("Profile - Filtering orders - orderTab:", orderTab);
    console.log("Profile - Filtering orders - allOrders:", allOrders);
    console.log(
      "Profile - Filtering orders - allOrders.length:",
      allOrders.length,
    );

    const filteredOrders =
      orderTab === "cancelled"
        ? allOrders.filter((o) => normalizeStatus(o.status) === "cancelled")
        : allOrders.filter((o) => normalizeStatus(o.status) !== "cancelled");

    console.log(
      "Profile - Filtered orders for tab:",
      orderTab,
      ":",
      filteredOrders.length,
    );

    // DEBUG: Show filtered order details
    if (orderTab === "cancelled" && filteredOrders.length > 0) {
      console.log("Profile - Cancelled orders to display:");
      filteredOrders.forEach((order, index) => {
        console.log(
          `  ${index + 1}. ${order.orderNumber} - Status: ${order.status}`,
        );
      });
    }

    console.log("Profile - Filtered orders:", filteredOrders);

    setOrders(filteredOrders);
  }, [orderTab, allOrders]); // Re-filter when tab changes or allOrders updates

  // Load notifications from backend (with delay to avoid rate limiting)
  useEffect(() => {
    const loadNotifications = async () => {
      try {
        console.log("🔔 Fetching notifications...");
        const notificationsData = await notificationService.getNotifications();
        console.log("🔔 Raw notifications response:", notificationsData);
        console.log("🔔 Setting notifications state:", notificationsData);
        setNotifications(notificationsData || []); // API interceptor already extracts data
      } catch (error) {
        console.error("🔔 Notifications fetch error:", error);
        console.log(
          "🔔 Notifications endpoint not available yet, using empty array",
        );
        setNotifications([]); // Set empty array instead of failing
      }
    };

    loadNotifications();
  }, []);

  // Load notification settings from backend (with delay to avoid rate limiting)
  useEffect(() => {
    const loadNotificationSettings = async () => {
      try {
        console.log("🔔 Loading notification settings...");
        const response = await notificationService.getNotificationSettings();
        console.log("🔔 Notification settings response:", response);

        // API interceptor extracts data, so response is the settings object
        const settingsData = response || {
          email: true,
          sms: false,
          push: false,
          orderUpdates: true,
          paymentAlerts: true,
          promotions: true,
          deliveryNotifications: true,
        };

        console.log("🔔 Setting notification preferences:", settingsData);
        setNotificationPreferences(settingsData);
      } catch (error) {
        console.error("🔔 Error loading notification settings:", error);
        // Keep default settings on error
        setNotificationPreferences({
          email: true,
          sms: false,
          push: false,
          orderUpdates: true,
          paymentAlerts: true,
          promotions: true,
          deliveryNotifications: true,
        });
      }
    };

    loadNotificationSettings();
  }, []);

  // Set loading to false after initial data loads
  useEffect(() => {
    // Check if all initial data is loaded
    if (
      addressData !== undefined &&
      orders !== undefined &&
      allOrders !== undefined
    ) {
      console.log("Initial data loaded, setting loading to false");
      setLoading(false);
    }
  }, [addressData, orders, allOrders]);

  // Debug notifications state changes
  useEffect(() => {
    console.log("Notification state changed:", notifications);
    console.log("Notifications length:", notifications.length);
  }, [notifications]);

  // Notification settings handlers
  const handleNotificationSettingChange = async (setting, value) => {
    try {
      console.log(` Updating notification setting: ${setting} = ${value}`);
      console.log(`🔔 Updating notification setting: ${setting} = ${value}`);

      // Update local state immediately for responsive UI
      setNotificationPreferences((prev) => ({ ...prev, [setting]: value }));

      // Save to backend
      const updatedSettings = { ...notificationPreferences, [setting]: value };
      const result =
        await notificationService.updateNotificationSettings(updatedSettings);
      console.log("🔔 Notification settings saved:", result);

      // Show success message
      alert("Notification preferences updated successfully!");
    } catch (error) {
      console.error("🔔 Error updating notification settings:", error);
      alert("Failed to update notification preferences");
    }
  };

  const handlePasswordChange = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Validate passwords
      if (passwordData.newPassword !== passwordData.confirmPassword) {
        alert("New passwords do not match!");
        return;
      }

      if (passwordData.newPassword.length < 8) {
        alert("Password must be at least 8 characters long!");
        return;
      }

      // Call backend API to change password
      const response = await fetch(`${API_BASE_URL}/api/auth/change-password`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
        body: JSON.stringify({
          currentPassword: passwordData.currentPassword,
          newPassword: passwordData.newPassword,
        }),
      });

      if (response.ok) {
        alert("Password changed successfully!");
        setPasswordData({
          currentPassword: "",
          newPassword: "",
          confirmPassword: "",
        });
      } else {
        const error = await response.json();
        alert(error.message || "Failed to change password");
      }
    } catch (error) {
      console.error("Password change error:", error);
      alert("Failed to change password. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handlePasswordInputChange = (e) => {
    const { name, value } = e.target;
    setPasswordData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const toggleTwoFactor = async () => {
    try {
      const newStatus = !securitySettings.twoFactorEnabled;
      setSecuritySettings((prev) => ({ ...prev, twoFactorEnabled: newStatus }));

      // Call backend API to toggle 2FA
      const response = await fetch(`${API_BASE_URL}/api/auth/toggle-2fa`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
        body: JSON.stringify({ enabled: newStatus }),
      });

      if (response.ok) {
        alert(
          newStatus
            ? "Two-factor authentication enabled!"
            : "Two-factor authentication disabled!",
        );
      } else {
        // Revert on error
        setSecuritySettings((prev) => ({
          ...prev,
          twoFactorEnabled: !newStatus,
        }));
        alert("Failed to update two-factor authentication");
      }
    } catch (error) {
      console.error("Toggle 2FA error:", error);
      setSecuritySettings((prev) => ({
        ...prev,
        twoFactorEnabled: !securitySettings.twoFactorEnabled,
      }));
      alert("Failed to update two-factor authentication");
    }
  };

  // Address operations
  const handleAddAddress = async () => {
    console.log("=== handleAddAddress START ===");
    console.log("newAddress data:", newAddress);

    // CRITICAL: Check authentication
    const token = localStorage.getItem("token");
    console.log("TOKEN CHECK:", token ? "FOUND" : "NOT FOUND");
    if (!token) {
      alert("Please login to add an address");
      return;
    }

    // Validate required fields
    if (
      !newAddress.name ||
      !newAddress.phone ||
      !newAddress.addressLine1 ||
      !newAddress.city ||
      !newAddress.state ||
      !newAddress.pincode
    ) {
      console.error("Missing required fields");
      alert("Please fill all required fields");
      return;
    }

    // IMMEDIATE RESET: Clear any existing loading state
    setLoading(false);
    setTimeout(() => setLoading(true), 100);
    console.log("Loading reset and set to true");

    // FORCE RESET: Safety timeout to prevent infinite loading
    const safetyTimeout = setTimeout(() => {
      console.log("SAFETY TIMEOUT: Forcing loading to false");
      setLoading(false);
      alert("Request timed out. Please try again.");
    }, 6000); // 6 seconds (slightly longer than API timeout)

    try {
      console.log("=== BEFORE API CALL ===");
      console.log("Calling addressService.createAddress...");
      const startTime = Date.now();

      const result = await addressService.createAddress(newAddress);

      const endTime = Date.now();
      console.log(`API call completed in ${endTime - startTime}ms`);
      console.log("API Response:", result);

      if (result.success || result._id) {
        console.log("Address created successfully, updating addresses list...");

        // CRITICAL: Clear cache to get fresh data
        clearCache("addresses");
        console.log("Cache cleared for addresses");

        const updatedAddresses = await addressService.getAddresses();
        console.log("Fresh addresses fetched:", updatedAddresses);
        setAddressData(Array.isArray(updatedAddresses) ? updatedAddresses : []);
        setShowAddAddressForm(false);
        setNewAddress({
          type: "home",
          name: "",
          phone: "",
          addressLine1: "",
          addressLine2: "",
          city: "",
          state: "",
          pincode: "",
          country: "India",
          isDefault: false,
        });
        alert("Address added successfully!");
      } else {
        console.error("API returned failure:", result);
        alert("Failed to add address. Please try again.");
      }
    } catch (error) {
      console.error("Add address error:", error);
      console.error("Error details:", {
        message: error.message,
        status: error.response?.status,
        statusText: error.response?.statusText,
        data: error.response?.data,
      });
      alert(`Failed to add address: ${error.message || "Please try again."}`);
    } finally {
      console.log("Setting loading to false");
      clearTimeout(safetyTimeout); // Clear safety timeout
      setLoading(false);
      console.log("=== handleAddAddress END ===");
    }
  };

  const handleAddressInputChange = (e) => {
    const { name, value } = e.target;
    setNewAddress((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleEditAddressInputChange = (e) => {
    const { name, value } = e.target;
    setEditingAddress((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const openEditForm = (address) => {
    setEditingAddress(address);
    setShowEditAddressForm(true);
  };

  const handleUpdateAddress = async () => {
    setLoading(true);
    try {
      const result = await addressService.updateAddress(
        editingAddress._id,
        editingAddress,
      );
      if (result.success || result._id) {
        // CRITICAL: Clear cache to get fresh data
        clearCache("addresses");
        console.log("Cache cleared for addresses (update)");

        const updatedAddresses = await addressService.getAddresses();
        console.log("Fresh addresses fetched (update):", updatedAddresses);
        setAddressData(Array.isArray(updatedAddresses) ? updatedAddresses : []);
        setShowEditAddressForm(false);
        setEditingAddress(null);
        alert("Address updated successfully!");
      }
    } catch (error) {
      console.error("Update address error:", error);
      alert("Failed to update address. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteAddress = async (id) => {
    if (window.confirm("Are you sure you want to delete this address?")) {
      setLoading(true);
      try {
        const result = await addressService.deleteAddress(id);
        if (result.success) {
          const updatedAddresses = addressData.filter(
            (addr) => addr._id !== id,
          );
          setAddressData(updatedAddresses);
        }
      } catch (error) {
        console.error("Delete address error:", error);
      } finally {
        setLoading(false);
      }
    }
  };

  const handleSetDefaultAddress = async (id) => {
    setLoading(true);
    try {
      const result = await addressService.setDefaultAddress(id);
      if (result.success || result._id) {
        const updatedAddresses = addressData.map((addr) => ({
          ...addr,
          isDefault: addr._id === id,
        }));
        setAddressData(updatedAddresses);
      }
    } catch (error) {
      console.error("Set default address error:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleProfileUpdate = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Get form data
      const formData = new FormData(e.target);
      const updatedData = {
        firstName: formData.get("firstName"),
        lastName: formData.get("lastName"),
        phone: formData.get("phone"),
        dateOfBirth: formData.get("dateOfBirth"),
        gender: formData.get("gender"),
      };

      // Use AuthContext updateProfile function
      const result = await updateProfile(updatedData);

      if (result.success) {
        // Update local state
        setUserData((prev) => ({ ...prev, ...updatedData }));

        alert("Profile updated successfully!");
      } else {
        alert("Failed to update profile: " + (result.error || "Unknown error"));
      }
    } catch (error) {
      console.error("Profile update error:", error);
      alert("Failed to update profile. Please try again.");
    } finally {
      setLoading(false);
      setIsEditing(false);
    }
  };

  const tabs = [
    {
      id: "personal",
      label: "Personal Info",
      icon: User,
      color: "text-blue-600",
      bgColor: "bg-blue-100",
      hoverColor: "hover:bg-blue-50",
    },
    {
      id: "addresses",
      label: "Addresses",
      icon: MapPin,
      color: "text-green-600",
      bgColor: "bg-green-100",
      hoverColor: "hover:bg-green-50",
    },
    {
      id: "orders",
      label: "Orders",
      icon: Package,
      color: "text-purple-600",
      bgColor: "bg-purple-100",
      hoverColor: "hover:bg-purple-50",
    },
    {
      id: "notifications",
      label: "Notifications",
      icon: Bell,
      color: "text-red-600",
      bgColor: "bg-red-100",
      hoverColor: "hover:bg-red-50",
    },
    {
      id: "security",
      label: "Security",
      icon: Shield,
      color: "text-indigo-600",
      bgColor: "bg-indigo-100",
      hoverColor: "hover:bg-indigo-50",
    },
    {
      id: "logout",
      label: "Logout",
      icon: LogOut,
      color: "text-gray-600",
      bgColor: "bg-gray-100",
      hoverColor: "hover:bg-red-50 hover:text-red-600",
    },
  ];

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  const renderPersonalInfo = () => (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold text-gray-900">
          Personal Information
        </h2>
        <button
          onClick={() => setIsEditing(!isEditing)}
          className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 text-gray-900"
        >
          <Edit2 size={16} />
          {isEditing ? "Cancel" : "Edit"}
        </button>
      </div>

      <div className="flex flex-col sm:flex-row items-center gap-6 mb-8">
        <div className="relative group">
          <div className="w-32 h-32 bg-gradient-to-br from-blue-100 to-purple-100 rounded-full overflow-hidden border-4 border-white shadow-lg">
            {userData.profileImage ? (
              <img
                src={userData.profileImage}
                alt={userData.firstName}
                className="w-full h-full object-cover"
                onError={(e) => {
                  console.error(
                    "❌ Profile image failed:",
                    userData.profileImage,
                  );
                  console.error("❌ Error details:", e);
                  console.error("❌ Image src:", e.target.src);
                  e.target.style.display = "none";
                  e.target.nextElementSibling.style.display = "flex";
                }}
                onLoad={() => {
                  console.log(
                    "✅ Profile image loaded:",
                    userData.profileImage,
                  );
                }}
              />
            ) : null}
            <div
              className={`w-full h-full ${userData.profileImage ? "hidden" : "flex"} items-center justify-center bg-gradient-to-br from-gray-100 to-gray-200`}
            >
              <User size={48} className="text-gray-400" />
            </div>
          </div>

          {/* Upload overlay */}
          <div
            className="absolute inset-0 bg-black bg-opacity-50 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300 cursor-pointer"
            onClick={() => fileInputRef.current?.click()}
          >
            <div className="text-center text-white">
              <Camera size={24} className="mx-auto mb-1" />
              <span className="text-xs font-medium">Change Photo</span>
            </div>
          </div>

          <input
            type="file"
            ref={fileInputRef}
            onChange={handleImageUpload}
            accept="image/*"
            className="hidden"
          />
        </div>

        <div className="flex-1 text-center sm:text-left">
          <h3 className="text-2xl font-bold text-gray-900 mb-1">
            {userData.firstName} {userData.lastName}
          </h3>
          <p className="text-gray-600 mb-2">{userData.email}</p>
          <p className="text-sm text-gray-500 mb-4">
            Member since January 2024
          </p>

          <div className="flex flex-col sm:flex-row gap-2 sm:gap-3 justify-center sm:justify-start">
            <button
              onClick={() => fileInputRef.current?.click()}
              className="flex items-center justify-center gap-2 px-3 sm:px-4 py-2 bg-blue-600 text-white rounded-lg text-sm sm:text-base font-medium whitespace-nowrap hover:bg-blue-700 transition-all duration-200 shadow-sm hover:shadow-md w-full sm:w-auto"
            >
              <Upload size={16} />
              Upload New Photo
            </button>
            <button
              onClick={handleCameraClick}
              className="flex items-center justify-center gap-2 px-3 sm:px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-all duration-200 w-full sm:w-auto"
            >
              <Camera size={16} />
              Take Photo
            </button>
          </div>
        </div>
      </div>

      {isEditing ? (
        <form onSubmit={handleProfileUpdate} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                First Name
              </label>
              <input
                type="text"
                name="firstName"
                value={userData.firstName}
                onChange={(e) =>
                  setUserData({ ...userData, firstName: e.target.value })
                }
                className="w-full border rounded-lg px-3 py-2 text-gray-900"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Last Name
              </label>
              <input
                type="text"
                name="lastName"
                value={userData.lastName}
                onChange={(e) =>
                  setUserData({ ...userData, lastName: e.target.value })
                }
                className="w-full border rounded-lg px-3 py-2 text-gray-900"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Email
              </label>
              <input
                type="email"
                name="email"
                value={userData.email}
                onChange={(e) =>
                  setUserData({ ...userData, email: e.target.value })
                }
                className="w-full border rounded-lg px-3 py-2 text-gray-900"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Phone
              </label>
              <input
                type="tel"
                name="phone"
                value={userData.phone}
                onChange={(e) =>
                  setUserData({ ...userData, phone: e.target.value })
                }
                className="w-full border rounded-lg px-3 py-2 text-gray-900"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Date of Birth
              </label>
              <input
                type="date"
                name="dateOfBirth"
                value={userData.dateOfBirth}
                onChange={(e) =>
                  setUserData({ ...userData, dateOfBirth: e.target.value })
                }
                className="w-full border rounded-lg px-3 py-2 text-gray-900"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Gender
              </label>
              <select
                name="gender"
                value={userData.gender}
                onChange={(e) =>
                  setUserData({ ...userData, gender: e.target.value })
                }
                className="w-full border rounded-lg px-3 py-2 text-gray-900"
              >
                <option value="male">Male</option>
                <option value="female">Female</option>
                <option value="other">Other</option>
              </select>
            </div>
          </div>
          <div className="flex gap-4">
            <button
              type="submit"
              className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm sm:text-base font-medium whitespace-nowrap hover:bg-blue-700 w-full sm:w-auto"
            >
              Save Changes
            </button>
            <button
              type="button"
              onClick={() => setIsEditing(false)}
              className="px-4 py-2 border border-gray-300 rounded-lg text-sm sm:text-base font-medium whitespace-nowrap hover:bg-gray-50 w-full sm:w-auto"
            >
              Cancel
            </button>
          </div>
        </form>
      ) : (
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                First Name
              </label>
              <p className="text-gray-900">{userData.firstName}</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Last Name
              </label>
              <p className="text-gray-900">{userData.lastName}</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Email
              </label>
              <p className="text-gray-900">{userData.email}</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Phone
              </label>
              <p className="text-gray-900">{userData.phone}</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Date of Birth
              </label>
              <p className="text-gray-900">{userData.dateOfBirth}</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Gender
              </label>
              <p className="text-gray-900 capitalize">{userData.gender}</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );

  const renderAddresses = () => (
    <div className="space-y-6">
      <div className="space-y-4 mb-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">My Addresses</h2>
          <p className="text-sm text-gray-600 mt-1">
            Manage your shipping addresses for delivery
          </p>
        </div>
        <div className="flex justify-start sm:justify-end">
          <button
            onClick={() => setShowAddAddressForm(true)}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm sm:text-base font-medium whitespace-nowrap hover:bg-blue-700 transition-colors duration-200 flex items-center gap-2 shadow-sm hover:shadow-md w-full sm:w-auto max-w-xs"
          >
            <MapPin size={20} />
            Add New Address
          </button>
        </div>
      </div>

      {addressData.length === 0 ? (
        <div className="text-center py-12 bg-gray-50 rounded-lg border-2 border-dashed border-gray-300">
          <MapPin size={48} className="mx-auto text-gray-400 mb-4 " />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            No addresses yet
          </h3>
          <p className="text-gray-600 mb-4">
            Add your first shipping address to get started
          </p>
          <button
            onClick={() => setShowAddAddressForm(true)}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm sm:text-base font-medium whitespace-nowrap hover:bg-blue-700 transition-colors duration-200 w-full sm:w-auto"
          >
            Add Your First Address
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {addressData.map((address) => (
            <div
              key={address._id}
              className="bg-white border border-gray-200 rounded-xl p-6 hover:shadow-lg transition-shadow duration-200 relative overflow-hidden group"
            >
              {address.isDefault && (
                <div className="absolute top-0 right-0 bg-green-500 text-white text-xs px-3 py-1 rounded-bl-lg z-10">
                  Default
                </div>
              )}

              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-2">
                  <div
                    className={`p-2 rounded-lg ${
                      address.type === "home"
                        ? "bg-blue-100 text-blue-600"
                        : address.type === "work"
                          ? "bg-purple-100 text-purple-600"
                          : "bg-gray-100 text-gray-600"
                    }`}
                  >
                    {address.type === "home" ? (
                      <MapPin size={16} />
                    ) : address.type === "work" ? (
                      <Package size={16} />
                    ) : (
                      <MapPin size={16} />
                    )}
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900 capitalize text-lg">
                      {address.type === "home"
                        ? "Home Address"
                        : address.type === "work"
                          ? "Work Address"
                          : "Other Address"}
                    </h3>
                    {address.isDefault && (
                      <span className="inline-flex items-center gap-1 text-xs text-green-600 font-medium mt-1">
                        <div className="w-2 h-2 bg-green-600 rounded-full"></div>
                        Primary Address
                      </span>
                    )}
                  </div>
                </div>

                <div className="flex gap-2 opacity-100 transition-opacity duration-200">
                  <button
                    onClick={() => openEditForm(address)}
                    className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors duration-200"
                    title="Edit address"
                  >
                    <Edit2 size={16} />
                  </button>
                  <button
                    onClick={() => handleDeleteAddress(address._id)}
                    className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors duration-200"
                    title="Delete address"
                  >
                    <LogOut size={16} />
                  </button>
                </div>
              </div>

              <div className="space-y-3">
                {/* NAME */}
                {address.name && (
                  <div className="flex items-start gap-3">
                    <User
                      size={16}
                      className="text-gray-400 mt-1 flex-shrink-0"
                    />
                    <div className="text-sm text-gray-700">
                      <p className="font-medium">{address.name}</p>
                    </div>
                  </div>
                )}

                {/* PHONE */}
                {address.phone && (
                  <div className="flex items-start gap-3">
                    <Phone
                      size={16}
                      className="text-gray-400 mt-1 flex-shrink-0"
                    />
                    <div className="text-sm text-gray-700">
                      <p className="font-medium">{address.phone}</p>
                    </div>
                  </div>
                )}

                {/* ADDRESS */}
                <div className="flex items-start gap-3">
                  <MapPin
                    size={16}
                    className="text-gray-400 mt-1 flex-shrink-0"
                  />
                  <div className="text-sm text-gray-700">
                    <p className="font-medium">{address.addressLine1}</p>
                    {address.addressLine2 && (
                      <p className="text-gray-600">{address.addressLine2}</p>
                    )}
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="w-4 h-4 bg-gray-200 rounded-full mt-1 flex-shrink-0"></div>
                  <div className="text-sm text-gray-700">
                    <p>
                      {address.city}, {address.state} {address.pincode}
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="w-4 h-4 bg-gray-200 rounded-full mt-1 flex-shrink-0"></div>
                  <div className="text-sm text-gray-700">
                    <p>{address.country}</p>
                  </div>
                </div>
              </div>

              <div className="mt-4 pt-4 border-t border-gray-100">
                <div className="flex items-center justify-between">
                  <span className="text-xs text-gray-500">
                    Added on {new Date(address.createdAt).toLocaleDateString()}
                  </span>
                  {!address.isDefault && (
                    <button
                      onClick={() => handleSetDefaultAddress(address._id)}
                      className="text-xs text-blue-600 hover:text-blue-700 font-medium transition-colors duration-200"
                    >
                      Set as Default
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );

  // Address Form Modal
  const renderAddressForm = () => (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white w-full max-w-2xl rounded-2xl shadow-2xl overflow-hidden animate-fadeIn">
        {/* HEADER */}
        <div className="flex items-center justify-between px-6 py-4 border-b bg-gray-50">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-50 rounded-lg">
              <MapPin size={20} className="text-blue-600" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-gray-900">
                Add New Address
              </h2>
              <p className="text-sm text-gray-500">
                Enter your delivery address details
              </p>
            </div>
          </div>
          <button
            onClick={() => setShowAddAddressForm(false)}
            className="p-2 rounded-full hover:bg-gray-100 transition-colors"
          >
            <X size={18} className="text-gray-500" />
          </button>
        </div>

        {/* BODY */}
        <form
          onSubmit={(e) => {
            console.log("=== FORM SUBMIT TRIGGERED ===");
            e.preventDefault();
            handleAddAddress();
          }}
          className="p-6 space-y-5 max-h-[70vh] overflow-y-auto"
        >
          {/* ADDRESS TYPE */}
          <div>
            <label className="text-sm font-semibold text-gray-700 block mb-2">
              Address Type
            </label>
            <select
              name="type"
              value={newAddress.type}
              onChange={handleAddressInputChange}
              className="w-full mt-1 px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-all duration-200 text-gray-900"
            >
              <option value="home">🏠 Home</option>
              <option value="work">🏢 Work</option>
              <option value="other">📍 Other</option>
            </select>
          </div>

          {/* NAME + PHONE */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-semibold text-gray-700 block mb-2">
                Full Name
              </label>
              <div className="relative">
                <input
                  name="name"
                  value={newAddress.name}
                  onChange={handleAddressInputChange}
                  placeholder="Enter full name"
                  className="w-full mt-1 px-4 py-3 pl-12 border-2 text-gray-900 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-all duration-200"
                  required
                />
              </div>
            </div>

            <div>
              <label className="text-sm font-semibold text-gray-700 block mb-2">
                Phone Number
              </label>
              <div className="relative">
                <input
                  type="tel"
                  name="phone"
                  value={newAddress.phone}
                  onChange={handleAddressInputChange}
                  placeholder="10 digit number"
                  className="w-full mt-1 px-4 py-3 pl-12 border-2 text-gray-900 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-all duration-200"
                  pattern="[0-9]{10}"
                  maxLength="10"
                  required
                />
              </div>
            </div>
          </div>

          {/* STREET ADDRESS */}
          <div>
            <label className="text-sm font-semibold text-gray-700 block mb-2">
              Street Address
            </label>
            <div className="relative">
              <input
                name="addressLine1"
                value={newAddress.addressLine1}
                onChange={handleAddressInputChange}
                placeholder="House no, building, street name..."
                className="w-full mt-1 px-4 py-3 pl-12 border-2 text-gray-900 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-all duration-200"
                required
              />
            </div>
          </div>

          {/* ADDRESS LINE 2 */}
          <div>
            <label className="text-sm font-semibold text-gray-700 block mb-2">
              Address Line 2{" "}
              <span className="text-gray-400 font-normal">(Optional)</span>
            </label>
            <div className="relative">
              <input
                name="addressLine2"
                value={newAddress.addressLine2}
                onChange={handleAddressInputChange}
                placeholder="Landmark, area, apartment details..."
                className="w-full mt-1 px-4 py-3 pl-12 border-2 text-gray-900 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-all duration-200"
              />
            </div>
          </div>

          {/* CITY + STATE */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-semibold text-gray-700 block mb-2">
                City
              </label>
              <input
                name="city"
                value={newAddress.city}
                onChange={handleAddressInputChange}
                placeholder="Enter city"
                className="w-full px-4 py-3 border-2 text-gray-900 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-all duration-200"
                required
              />
            </div>
            <div>
              <label className="text-sm font-semibold text-gray-700 block mb-2">
                State
              </label>
              <input
                name="state"
                value={newAddress.state}
                onChange={handleAddressInputChange}
                placeholder="Enter state"
                className="w-full px-4 py-3 border-2 text-gray-900 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-all duration-200"
                required
              />
            </div>
          </div>

          {/* PINCODE */}
          <div>
            <label className="text-sm font-semibold text-gray-700 block mb-2">
              Pincode
            </label>
            <div className="relative">
              <input
                name="pincode"
                value={newAddress.pincode}
                onChange={handleAddressInputChange}
                placeholder="6-digit Pincode"
                className="w-full px-4 py-3 pl-12 border-2 text-gray-900 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-all duration-200"
                pattern="[0-9]{6}"
                maxLength="6"
                required
              />
            </div>
            {newAddress.pincode && newAddress.pincode.length !== 6 && (
              <div className="mt-2 p-2 bg-red-50 rounded-lg">
                <p className="text-xs text-red-600 font-medium">
                  ⚠️ Pincode must be exactly 6 digits
                </p>
              </div>
            )}
          </div>

          {/* DEFAULT ADDRESS */}
          <div className="flex items-center gap-3 p-4 bg-blue-50 rounded-xl">
            <input
              type="checkbox"
              name="isDefault"
              checked={newAddress.isDefault}
              onChange={(e) =>
                handleAddressInputChange({
                  target: { name: "isDefault", value: e.target.checked },
                })
              }
              className="w-5 h-5 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
            />
            <div>
              <span className="text-sm font-medium text-gray-700">
                Set as default address
              </span>
              <p className="text-xs text-gray-500 mt-1">
                This will be used as your primary delivery address
              </p>
            </div>
          </div>

          {/* BUTTONS */}
          <div className="flex gap-3 pt-4">
            <button
              type="submit"
              disabled={loading}
              className="flex-1 py-3 bg-blue-600 text-white rounded-xl font-semibold hover:bg-blue-700 transition-all duration-200 shadow-lg hover:shadow-xl disabled:bg-gray-400 disabled:cursor-not-allowed"
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  Saving Address...
                </span>
              ) : (
                <span className="flex items-center justify-center gap-2">
                  <MapPin size={18} />
                  Save Address
                </span>
              )}
            </button>

            <button
              type="button"
              onClick={() => setShowAddAddressForm(false)}
              className="flex-1 py-3 border-2 border-gray-200 text-gray-700 rounded-xl font-semibold hover:bg-gray-50 transition-all duration-200"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );

  // Edit Address Form Modal
  const renderEditAddressForm = () => (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white w-full max-w-2xl rounded-2xl shadow-2xl overflow-hidden animate-fadeIn">
        {/* HEADER */}
        <div className="flex items-center justify-between px-6 py-4 border-b bg-gray-50">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-50 rounded-lg">
              <Edit2 size={20} className="text-blue-600" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-gray-900">
                Edit Address
              </h2>
              <p className="text-sm text-gray-500">
                Update your delivery address details
              </p>
            </div>
          </div>
          <button
            onClick={() => setShowEditAddressForm(false)}
            className="p-2 rounded-full hover:bg-gray-100 transition-colors"
          >
            <X size={18} className="text-gray-500" />
          </button>
        </div>

        {/* BODY */}
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleUpdateAddress();
          }}
          className="p-6 space-y-5 max-h-[70vh] overflow-y-auto"
        >
          {/* ADDRESS TYPE */}
          <div>
            <label className="text-sm font-semibold text-gray-700 block mb-2">
              Address Type
            </label>
            <div className="grid grid-cols-3 gap-3 text-gray-900">
              {["home", "work", "other"].map((type) => (
                <label
                  key={type}
                  className={`flex items-center justify-center p-3 border-2 rounded-xl cursor-pointer transition-all duration-200 ${
                    editingAddress?.type === type
                      ? "border-blue-500 bg-blue-50 text-blue-600"
                      : "border-gray-200 hover:border-gray-300"
                  }`}
                >
                  <input
                    type="radio"
                    name="type"
                    value={type}
                    checked={editingAddress?.type === type}
                    onChange={handleEditAddressInputChange}
                    className="sr-only"
                  />
                  {type === "home" && <Home size={18} className="mr-2" />}
                  {type === "work" && <Briefcase size={18} className="mr-2" />}
                  {type === "other" && <MapPin size={18} className="mr-2" />}
                  <span className="capitalize font-medium">{type}</span>
                </label>
              ))}
            </div>
          </div>

          {/* NAME + PHONE */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-semibold text-gray-700 block mb-2">
                Full Name
              </label>
              <div className="relative">
                <User
                  className="absolute left-3 top-3.5 text-gray-400"
                  size={18}
                />
                <input
                  name="name"
                  value={editingAddress?.name || ""}
                  onChange={handleEditAddressInputChange}
                  placeholder="Enter full name"
                  className="w-full pl-12 pr-4 py-3 border-2 text-gray-900 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-all duration-200"
                  required
                />
              </div>
            </div>
            <div>
              <label className="text-sm font-semibold text-gray-700 block mb-2">
                Phone Number
              </label>
              <div className="relative">
                <Phone
                  className="absolute left-3 top-3.5 text-gray-400"
                  size={18}
                />
                <input
                  name="phone"
                  value={editingAddress?.phone || ""}
                  onChange={handleEditAddressInputChange}
                  placeholder="10-digit mobile number"
                  className="w-full pl-12 pr-4 py-3 border-2 text-gray-900 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-all duration-200"
                  pattern="[0-9]{10}"
                  maxLength="10"
                  required
                />
              </div>
            </div>
          </div>

          {/* ADDRESS LINE 1 */}
          <div>
            <label className="text-sm font-semibold text-gray-700 block mb-2">
              Address Line 1
            </label>
            <div className="relative">
              <MapPin
                className="absolute left-3 top-3.5 text-gray-400"
                size={18}
              />
              <input
                name="addressLine1"
                value={editingAddress?.addressLine1 || ""}
                onChange={handleEditAddressInputChange}
                placeholder="House/Flat number, street name"
                className="w-full pl-12 pr-4 py-3 border-2 text-gray-900 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-all duration-200"
                required
              />
            </div>
          </div>

          {/* ADDRESS LINE 2 */}
          <div>
            <label className="text-sm font-semibold text-gray-700 block mb-2">
              Address Line 2{" "}
              <span className="text-gray-400 font-normal">(Optional)</span>
            </label>
            <div className="relative">
              <input
                name="addressLine2"
                value={editingAddress?.addressLine2 || ""}
                onChange={handleEditAddressInputChange}
                placeholder="Landmark, area, apartment details..."
                className="w-full mt-1 px-4 py-3 pl-12 border-2 text-gray-900 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-all duration-200"
              />
            </div>
          </div>

          {/* CITY + STATE */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-semibold text-gray-700 block mb-2">
                City
              </label>
              <input
                name="city"
                value={editingAddress?.city || ""}
                onChange={handleEditAddressInputChange}
                placeholder="Enter city"
                className="w-full px-4 py-3 border-2 text-gray-900 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-all duration-200"
                required
              />
            </div>
            <div>
              <label className="text-sm font-semibold text-gray-700 block mb-2">
                State
              </label>
              <input
                name="state"
                value={editingAddress?.state || ""}
                onChange={handleEditAddressInputChange}
                placeholder="Enter state"
                className="w-full px-4 py-3 border-2 text-gray-900 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-all duration-200"
                required
              />
            </div>
          </div>

          {/* PINCODE */}
          <div>
            <label className="text-sm font-semibold text-gray-700 block mb-2">
              Pincode
            </label>
            <div className="relative">
              <input
                name="pincode"
                value={editingAddress?.pincode || ""}
                onChange={handleEditAddressInputChange}
                placeholder="6-digit Pincode"
                className="w-full px-4 py-3 pl-12 border-2 text-gray-900 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-all duration-200"
                pattern="[0-9]{6}"
                maxLength="6"
                required
              />
              <MapPin
                className="absolute left-3 top-3.5 text-gray-400"
                size={18}
              />
            </div>
          </div>

          {/* DEFAULT ADDRESS CHECKBOX */}
          <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-xl">
            <input
              type="checkbox"
              name="isDefault"
              checked={editingAddress?.isDefault || false}
              onChange={(e) =>
                handleEditAddressInputChange({
                  target: { name: "isDefault", value: e.target.checked },
                })
              }
              className="w-5 h-5 text-blue-600 border-2 border-gray-300 rounded focus:ring-2 focus:ring-blue-500"
            />
            <label className="text-sm font-medium text-gray-700">
              Set as default address
            </label>
          </div>

          {/* BUTTONS */}
          <div className="flex gap-3 pt-4">
            <button
              type="submit"
              disabled={loading}
              className="flex-1 py-3 bg-blue-600 text-white rounded-xl font-semibold hover:bg-blue-700 transition-all duration-200 shadow-lg hover:shadow-xl disabled:bg-gray-400 disabled:cursor-not-allowed"
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  Updating Address...
                </span>
              ) : (
                <span className="flex items-center justify-center gap-2">
                  <Edit2 size={18} />
                  Update Address
                </span>
              )}
            </button>

            <button
              type="button"
              onClick={() => setShowEditAddressForm(false)}
              className="px-6 py-3 border-2 border-gray-300 text-gray-700 rounded-xl font-semibold hover:bg-gray-50 transition-all duration-200"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );

  // Order Details Modal
  const renderOrderDetailsModal = () => {
    if (!showOrderDetails || !selectedOrder) return null;

    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-lg w-full max-w-4xl max-h-[90vh] overflow-y-auto">
          {/* Header */}
          <div className="sticky top-0 bg-white border-b border-gray-200 p-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-bold text-gray-900">
                  Order Details
                </h2>
                <p className="text-sm text-gray-600 mt-1">
                  Order #
                  {selectedOrder.orderNumber ||
                    selectedOrder._id?.slice(-8) ||
                    `ORD-${selectedOrder._id}`}
                </p>
              </div>
              <button
                onClick={handleCloseOrderDetails}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <svg
                  className="w-6 h-6"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            </div>
          </div>

          {/* Content */}
          <div className="p-6 space-y-6">
            {/* Order Status and Date */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div>
                <span
                  className={`inline-flex px-3 py-1 rounded-full text-sm font-medium ${
                    selectedOrder.status === "delivered"
                      ? "bg-green-100 text-green-700"
                      : selectedOrder.status === "pending"
                        ? "bg-yellow-100 text-yellow-700"
                        : selectedOrder.status === "cancelled"
                          ? "bg-red-100 text-red-700"
                          : "bg-blue-100 text-blue-700"
                  }`}
                >
                  {selectedOrder.status
                    ? selectedOrder.status.charAt(0).toUpperCase() +
                      selectedOrder.status.slice(1)
                    : "Unknown"}
                </span>
              </div>
              <div className="text-sm text-gray-600">
                {selectedOrder.createdAt
                  ? new Date(selectedOrder.createdAt).toLocaleDateString(
                      "en-US",
                      {
                        year: "numeric",
                        month: "long",
                        day: "numeric",
                        hour: "2-digit",
                        minute: "2-digit",
                      },
                    )
                  : "No date available"}
              </div>
            </div>

            {/* Order Items */}
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Order Items
              </h3>
              <div className="space-y-4">
                {(() => {
                  const items = getOrderItems(selectedOrder);
                  return items && items.length > 0 ? (
                    items.map((item, index) => (
                      <div
                        key={index}
                        className="flex items-center gap-4 p-4 bg-gray-50 rounded-lg"
                      >
                        {/* Product Image */}
                        <div className="w-20 h-20 bg-gray-100 rounded-lg overflow-hidden flex-shrink-0">
                          {(() => {
                            const imageUrl = getOrderItemImage(item, index);
                            const productName = getOrderItemName(item);
                            return imageUrl ? (
                              <img
                                src={imageUrl}
                                alt={productName}
                                className="w-full h-full object-cover"
                                onError={(e) => {
                                  console.log(
                                    "Order detail image failed, using fallback:",
                                    imageUrl,
                                  );
                                  e.target.src = `https://picsum.photos/seed/product-${index}/80/80.jpg`;
                                  e.target.onerror = null;
                                }}
                              />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center">
                                <Package size={24} className="text-gray-400" />
                              </div>
                            );
                          })()}
                        </div>

                        {/* Product Details */}
                        <div className="flex-1">
                          <h4 className="font-medium text-gray-900">
                            {getOrderItemName(item)}
                          </h4>
                          <p className="text-sm text-gray-600">
                            Quantity: {item.quantity || 1}
                          </p>
                          {item.product?.category && (
                            <p className="text-xs text-gray-500">
                              Category: {item.product.category}
                            </p>
                          )}
                        </div>

                        {/* Price */}
                        <div className="text-right">
                          <p className="font-semibold text-gray-900">
                            ₹{(item.unitPrice || item.price || 0).toFixed(2)}
                          </p>
                          <p className="text-sm text-gray-600">
                            Total: ₹
                            {(
                              (item.unitPrice || item.price || 0) *
                              (item.quantity || 1)
                            ).toFixed(2)}
                          </p>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="text-center py-8 text-gray-500">
                      No items found in this order
                    </div>
                  );
                })()}
              </div>
            </div>

            {/* Order Summary */}
            <div className="border-t border-gray-200 pt-4">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Order Summary
              </h3>
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Subtotal:</span>
                  <span className="font-medium text-gray-700">
                    ₹
                    {(
                      selectedOrder.pricing?.subtotal ||
                      selectedOrder.subtotal ||
                      0
                    ).toFixed(2)}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Delivery Fee:</span>
                  <span className="font-medium text-gray-700">
                    ₹
                    {(
                      selectedOrder.pricing?.deliveryFee ||
                      selectedOrder.deliveryFee ||
                      0
                    ).toFixed(2)}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Tax:</span>
                  <span className="font-medium text-gray-700">
                    ₹
                    {(
                      selectedOrder.pricing?.tax ||
                      selectedOrder.tax ||
                      0
                    ).toFixed(2)}
                  </span>
                </div>
                <div className="flex justify-between text-lg font-semibold pt-2 border-t border-gray-200 text-gray-700">
                  <span classname="text-gray-700">Total:</span>
                  <span className="text-blue-600">
                    ₹
                    {(
                      selectedOrder.pricing?.total ||
                      selectedOrder.totalAmount ||
                      selectedOrder.total ||
                      selectedOrder.amount ||
                      0
                    ).toFixed(2)}
                  </span>
                </div>
              </div>
            </div>

            {/* Delivery Address */}
            {selectedOrder.deliveryAddress && (
              <div className="border-t border-gray-200 pt-4">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                  Delivery Address
                </h3>
                <div className="bg-gray-50 p-4 rounded-lg">
                  <p className="text-gray-900">
                    {selectedOrder.deliveryAddress.street ||
                      selectedOrder.deliveryAddress.addressLine1}
                  </p>
                  {selectedOrder.deliveryAddress.city &&
                    selectedOrder.deliveryAddress.state && (
                      <p className="text-gray-600">
                        {selectedOrder.deliveryAddress.city},{" "}
                        {selectedOrder.deliveryAddress.state}{" "}
                        {selectedOrder.deliveryAddress.pincode}
                      </p>
                    )}
                  {selectedOrder.deliveryAddress.type && (
                    <p className="text-sm text-gray-500 mt-1">
                      Type:{" "}
                      {selectedOrder.deliveryAddress.type
                        .charAt(0)
                        .toUpperCase() +
                        selectedOrder.deliveryAddress.type.slice(1)}
                    </p>
                  )}
                </div>
              </div>
            )}

            {/* Order Timeline (if available) */}
            {selectedOrder.timeline && selectedOrder.timeline.length > 0 && (
              <div className="border-t border-gray-200 pt-4">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                  Order Timeline
                </h3>
                <div className="space-y-3">
                  {selectedOrder.timeline.map((event, index) => (
                    <div key={index} className="flex items-start gap-3">
                      <div
                        className={`w-3 h-3 rounded-full mt-1 ${
                          event.status === "delivered"
                            ? "bg-green-500"
                            : event.status === "cancelled"
                              ? "bg-red-500"
                              : event.status === "pending"
                                ? "bg-yellow-500"
                                : "bg-blue-500"
                        }`}
                      />
                      <div className="flex-1">
                        <p className="text-sm font-medium text-gray-900">
                          {event.status.charAt(0).toUpperCase() +
                            event.status.slice(1)}
                        </p>
                        <p className="text-xs text-gray-500">
                          {new Date(event.timestamp).toLocaleDateString(
                            "en-US",
                            {
                              year: "numeric",
                              month: "short",
                              day: "numeric",
                              hour: "2-digit",
                              minute: "2-digit",
                            },
                          )}
                        </p>
                        {event.description && (
                          <p className="text-sm text-gray-600 mt-1">
                            {event.description}
                          </p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="sticky bottom-0 bg-white border-t border-gray-200 p-6">
            <div className="flex gap-4">
              {selectedOrder.status === "pending" && (
                <button
                  onClick={() => {
                    handleCancelOrder(selectedOrder._id);
                    handleCloseOrderDetails();
                  }}
                  className="px-6 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                >
                  Cancel Order
                </button>
              )}
              {selectedOrder.status === "cancelled" && (
                <button
                  onClick={() => {
                    handleReorder(selectedOrder);
                    handleCloseOrderDetails();
                  }}
                  className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Reorder
                </button>
              )}
              <button
                onClick={handleCloseOrderDetails}
                className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  };

  const renderOrders = () => (
    <div className="space-y-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">My Orders</h2>
          <p className="text-sm text-gray-600 mt-1">
            Track and manage your orders
          </p>
        </div>
      </div>

      {orders.length === 0 ? (
        <div className="text-center py-12 bg-gray-50 rounded-lg border-2 border-dashed border-gray-300">
          <Package size={48} className="mx-auto text-gray-400 mb-4 " />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            No orders yet
          </h3>
          <p className="text-gray-600 mb-4">
            Your order history will appear here once you make purchases
          </p>
          <button
            onClick={() => navigate("/")}
            className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors duration-200"
          >
            Start Shopping
          </button>
        </div>
      ) : (
        <>
          {/* Order Tabs */}
          <div className="flex border-b border-gray-200 mb-6">
            <button
              className={`py-3 px-6 text-sm font-medium border-b-2 transition-colors ${
                orderTab === "active"
                  ? "border-blue-500 text-blue-600"
                  : "border-transparent text-gray-500 hover:text-gray-700"
              }`}
              onClick={() => setOrderTab("active")}
            >
              Active Orders ({activeCount})
            </button>
            <button
              className={`py-3 px-6 text-sm font-medium border-b-2 transition-colors ${
                orderTab === "cancelled"
                  ? "border-blue-500 text-blue-600"
                  : "border-transparent text-gray-500 hover:text-gray-700"
              }`}
              onClick={() => setOrderTab("cancelled")}
            >
              Cancelled Orders ({cancelledCount})
            </button>
          </div>

          {/* Clear Cancelled Orders Button - Only show when there are cancelled orders */}
          {orderTab === "cancelled" && cancelledCount > 0 && (
            <div className="flex justify-end mb-4">
              <button
                onClick={(e) => {
                  console.log("Button clicked! Event:", e);
                  e.preventDefault();
                  handleClearCancelledOrders();
                }}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors duration-200 text-sm font-medium flex items-center gap-2"
              >
                <svg
                  className="w-4 h-4"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fillRule="evenodd"
                    d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z"
                    clipRule="evenodd"
                  />
                </svg>
                Clear Cancelled Orders (
                {orders.filter((o) => o.status === "cancelled").length})
              </button>
            </div>
          )}

          {/* Active Orders Tab */}
          {orderTab === "active" && (
            <div className="space-y-4">
              {orders.length === 0 ? (
                <div className="text-center py-12 bg-gray-50 rounded-lg border-2 border-dashed border-gray-300">
                  <Package size={48} className="mx-auto text-gray-400 mb-4" />
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">
                    No active orders
                  </h3>
                  <p className="text-gray-600 mb-4">
                    Your active orders will appear here
                  </p>
                  <button
                    onClick={() => navigate("/")}
                    className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors duration-200"
                  >
                    Start Shopping
                  </button>
                </div>
              ) : (
                orders
                  .filter((order) => {
                    // Safety filter - ensure backend filtering worked correctly
                    if (orderTab === "cancelled") {
                      return order.status === "cancelled";
                    } else {
                      return order.status !== "cancelled";
                    }
                  })
                  .map((order, index) => {
                    return (
                      <div
                        key={order._id || index}
                        className="bg-white border border-gray-200 rounded-xl p-4 sm:p-6 hover:shadow-lg transition-shadow duration-200"
                      >
                        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                          {/* Mobile: Images on top, data below */}
                          <div className="sm:hidden">
                            {/* Product Images - Mobile Horizontal Line */}
                            <div className="flex gap-2 mb-3 overflow-x-auto pb-2">
                              {(() => {
                                const items = getOrderItems(order);
                                return items && items.length > 0 ? (
                                  <>
                                    {items
                                      .slice(0, 4)
                                      .map((item, itemIndex) => {
                                        const imageUrl = getOrderItemImage(
                                          item,
                                          itemIndex,
                                        );
                                        const productName =
                                          getOrderItemName(item);

                                        return (
                                          <div
                                            key={itemIndex}
                                            className="w-14 h-14 rounded-lg border-2 border-white overflow-hidden bg-gray-100 flex-shrink-0"
                                          >
                                            {imageUrl ? (
                                              <img
                                                src={imageUrl}
                                                alt={productName}
                                                className="w-full h-full object-cover"
                                                onError={(e) => {
                                                  e.target.src =
                                                    getOrderItemImage(
                                                      item,
                                                      itemIndex,
                                                    );
                                                  e.target.onerror = null;
                                                }}
                                              />
                                            ) : (
                                              <div className="w-full h-full flex items-center justify-center bg-gray-100">
                                                <Package
                                                  size={18}
                                                  className="text-gray-400"
                                                />
                                              </div>
                                            )}
                                          </div>
                                        );
                                      })}
                                    {items.length > 4 && (
                                      <div className="w-14 h-14 rounded-lg border-2 border-white bg-gray-200 flex items-center justify-center flex-shrink-0">
                                        <span className="text-xs font-medium text-gray-600">
                                          +{items.length - 4}
                                        </span>
                                      </div>
                                    )}
                                  </>
                                ) : (
                                  <div className="w-16 h-16 bg-gray-100 rounded-lg flex items-center justify-center">
                                    <Package
                                      size={20}
                                      className="text-gray-400"
                                    />
                                  </div>
                                );
                              })()}
                            </div>
                          </div>

                          {/* Mobile: Order Data Below Images */}
                          <div className="sm:hidden">
                            {/* Order Information */}
                            <div className="flex-1 min-w-0 break-words">
                              <h3 className="font-semibold text-base text-gray-900 break-words">
                                Order #
                                {order.orderNumber ||
                                  order._id?.slice(-8) ||
                                  `ORD-${index + 1}`}
                              </h3>

                              <p className="text-sm text-gray-600 mt-1">
                                {order.createdAt
                                  ? new Date(
                                      order.createdAt,
                                    ).toLocaleDateString()
                                  : "No date"}{" "}
                                {order.type === "service"
                                  ? "Service Order"
                                  : `${getOrderItems(order).length} items`}
                              </p>
                              <p className="text-sm font-medium text-gray-900 mt-1">
                                Total:
                                {(
                                  order.pricing?.total ||
                                  order.totalAmount ||
                                  order.total ||
                                  order.amount ||
                                  0
                                ).toFixed(2)}
                              </p>

                              {/* Product Names */}
                              {(() => {
                                const items = getOrderItems(order);
                                return (
                                  items &&
                                  items.length > 0 && (
                                    <div className="mt-2">
                                      <div className="text-xs text-gray-500 space-y-1">
                                        {items.slice(0, 3).map((item, idx) => {
                                          const productName =
                                            getOrderItemName(item);
                                          return (
                                            <div
                                              key={idx}
                                              className="text-gray-600 truncate"
                                              title={productName}
                                            >
                                              {productName}
                                            </div>
                                          );
                                        })}
                                        {items.length > 3 && (
                                          <div className="text-gray-400">
                                            +{items.length - 3} more items
                                          </div>
                                        )}
                                      </div>
                                    </div>
                                  )
                                );
                              })()}

                              {order.shippingAddress && (
                                <p className="text-xs text-gray-500 mt-1">
                                  {" "}
                                  {order.shippingAddress.city},{" "}
                                  {order.shippingAddress.state}
                                </p>
                              )}
                            </div>
                          </div>

                          {/* Mobile: Status and Actions */}
                          <div className="sm:hidden flex flex-col gap-2 mt-3">
                            <span
                              className={`inline-block px-3 py-1 rounded-full text-xs font-medium ${
                                order.status === "delivered"
                                  ? "bg-green-100 text-green-700"
                                  : order.status === "cancelled"
                                    ? "bg-red-100 text-red-700"
                                    : order.status === "pending"
                                      ? "bg-yellow-100 text-yellow-700"
                                      : "bg-blue-100 text-blue-700"
                              }`}
                            >
                              {order.status === "delivered"
                                ? "Delivered"
                                : order.status === "cancelled"
                                  ? "Cancelled"
                                  : order.status === "pending"
                                    ? "Pending"
                                    : order.status === "confirmed"
                                      ? "Confirmed"
                                      : order.status === "processing"
                                        ? "Processing"
                                        : order.status}
                            </span>
                            <div className="flex gap-2">
                              <button
                                onClick={() => handleViewOrderDetails(order)}
                                className="flex-1 text-xs text-blue-600 hover:text-blue-800 transition-colors py-1 px-2 border border-blue-200 rounded"
                              >
                                View Details
                              </button>
                              {!["pending", "confirmed"].includes(
                                order.status,
                              ) ? (
                                <button
                                  disabled
                                  className="flex-1 text-xs text-gray-400 font-medium cursor-not-allowed py-1 px-2 border border-gray-200 rounded"
                                >
                                  Cannot Cancel
                                </button>
                              ) : order.isCancelling ? (
                                <button
                                  disabled
                                  className="flex-1 text-xs text-gray-400 font-medium cursor-not-allowed py-1 px-2 border border-gray-200 rounded"
                                >
                                  Cancelling...
                                </button>
                              ) : (
                                <button
                                  onClick={() => handleCancelOrder(order._id)}
                                  className="flex-1 text-xs text-red-600 hover:text-red-800 transition-colors font-medium py-1 px-2 border border-red-200 rounded"
                                >
                                  Cancel
                                </button>
                              )}
                              {order.status === "cancelled" && (
                                <button
                                  onClick={() => handleReorder(order)}
                                  className="flex-1 text-xs text-green-600 hover:text-green-800 transition-colors font-medium py-1 px-2 border border-green-200 rounded"
                                >
                                  Reorder
                                </button>
                              )}
                            </div>
                          </div>

                          {/* Desktop: Original layout */}
                          <div className="hidden sm:flex items-start gap-4 flex-1 min-w-0">
                            {/* Product Images */}
                            <div className="flex-shrink-0">
                              {(() => {
                                const items = getOrderItems(order);
                                return items && items.length > 0 ? (
                                  <div className="flex -space-x-1 sm:-space-x-2">
                                    {items
                                      .slice(0, 3)
                                      .map((item, itemIndex) => {
                                        // Use standardized image function
                                        const imageUrl = getOrderItemImage(
                                          item,
                                          itemIndex,
                                        );
                                        const productName =
                                          getOrderItemName(item);

                                        return (
                                          <div
                                            key={itemIndex}
                                            className="w-12 h-12 sm:w-16 sm:h-16 rounded-lg border-2 border-white overflow-hidden bg-gray-100 flex-shrink-0"
                                          >
                                            {imageUrl ? (
                                              <img
                                                src={imageUrl}
                                                alt={productName}
                                                className="w-full h-full object-cover"
                                                onError={(e) => {
                                                  console.log(
                                                    "Order image failed, using fallback:",
                                                    imageUrl,
                                                  );
                                                  // Use standardized fallback
                                                  e.target.src =
                                                    getOrderItemImage(
                                                      item,
                                                      itemIndex,
                                                    );
                                                  e.target.onerror = null;
                                                }}
                                              />
                                            ) : (
                                              <div className="w-full h-full flex items-center justify-center bg-gray-100">
                                                <Package
                                                  size={20}
                                                  className="text-gray-400"
                                                />
                                              </div>
                                            )}
                                          </div>
                                        );
                                      })}
                                    {items.length > 3 && (
                                      <div className="w-12 h-12 sm:w-16 sm:h-16 rounded-lg border-2 border-white bg-gray-200 flex items-center justify-center flex-shrink-0">
                                        <span className="text-xs font-medium text-gray-600">
                                          +{items.length - 3}
                                        </span>
                                      </div>
                                    )}
                                  </div>
                                ) : (
                                  <div className="w-16 h-16 sm:w-20 sm:h-20 bg-gray-100 rounded-lg flex items-center justify-center">
                                    {order.type === "service" ? (
                                      <div className="text-center">
                                        <div className="text-lg sm:text-2xl mb-1">
                                          {" "}
                                          Service
                                        </div>
                                        <Package
                                          size={16}
                                          className="text-gray-400 mx-auto sm:size-20"
                                        />
                                      </div>
                                    ) : (
                                      <Package
                                        size={20}
                                        className="text-gray-400 sm:size-24"
                                      />
                                    )}
                                  </div>
                                );
                              })()}
                            </div>

                            {/* Order Information */}
                            <div className="flex-1 min-w-0 break-words">
                              <h3 className="font-semibold text-base sm:text-lg text-gray-900 break-words">
                                Order #
                                {order.orderNumber ||
                                  order._id?.slice(-8) ||
                                  `ORD-${index + 1}`}
                              </h3>

                              {/* Show cancellation timeline */}
                              {order.status === "cancelled" &&
                                order.timeline &&
                                order.timeline.length > 0 && (
                                  <div className="mt-2 text-xs text-gray-500">
                                    {(() => {
                                      const cancelledEvent =
                                        order.timeline.find(
                                          (t) => t.status === "cancelled",
                                        );
                                      if (cancelledEvent) {
                                        const cancelDate = new Date(
                                          cancelledEvent.timestamp,
                                        );
                                        return `Cancelled on: ${cancelDate.toLocaleDateString(
                                          "en-US",
                                          {
                                            year: "numeric",
                                            month: "short",
                                            day: "numeric",
                                          },
                                        )}`;
                                      }
                                      return "Cancelled recently";
                                    })()}
                                  </div>
                                )}
                              <p className="text-sm text-gray-600">
                                {order.createdAt
                                  ? new Date(
                                      order.createdAt,
                                    ).toLocaleDateString()
                                  : "No date"}{" "}
                                •{" "}
                                {order.type === "service"
                                  ? "Service Order"
                                  : `${getOrderItems(order).length} items`}
                              </p>
                              <p className="text-sm font-medium text-gray-900">
                                Total: ₹
                                {(
                                  order.pricing?.total ||
                                  order.totalAmount ||
                                  order.total ||
                                  order.amount ||
                                  0
                                ).toFixed(2)}
                              </p>

                              {/* Product Names */}
                              {(() => {
                                const items = getOrderItems(order);
                                return (
                                  items &&
                                  items.length > 0 && (
                                    <div className="mt-2">
                                      <div className="text-xs text-gray-500 space-y-1">
                                        {items.slice(0, 2).map((item, idx) => {
                                          const productName =
                                            getOrderItemName(item);
                                          return (
                                            <div
                                              key={idx}
                                              className="text-gray-600 truncate"
                                              title={productName}
                                            >
                                              {productName}
                                            </div>
                                          );
                                        })}
                                        {items.length > 2 && (
                                          <div className="text-gray-400">
                                            +{items.length - 2} more items
                                          </div>
                                        )}
                                      </div>
                                    </div>
                                  )
                                );
                              })()}

                              {order.shippingAddress && (
                                <p className="text-xs text-gray-500 mt-1">
                                  📍 {order.shippingAddress.city},{" "}
                                  {order.shippingAddress.state}
                                </p>
                              )}
                            </div>
                          </div>

                          {/* Status and Actions - Desktop Only */}
                          <div className="hidden sm:flex flex-col sm:flex-row sm:items-center gap-2 mt-2 sm:mt-0 sm:text-right">
                            <span
                              className={`inline-block px-2 py-1 sm:px-3 sm:py-1 rounded-full text-xs font-medium ${
                                order.status === "delivered"
                                  ? "bg-green-100 text-green-700"
                                  : order.status === "cancelled"
                                    ? "bg-red-100 text-red-700"
                                    : order.status === "pending"
                                      ? "bg-yellow-100 text-yellow-700"
                                      : order.status === "confirmed"
                                        ? "bg-blue-100 text-blue-700"
                                        : order.status === "processing"
                                          ? "bg-blue-100 text-blue-700"
                                          : "bg-gray-100 text-gray-700"
                              }`}
                            >
                              {order.status === "delivered"
                                ? "Delivered"
                                : order.status === "cancelled"
                                  ? "Cancelled"
                                  : order.status === "pending"
                                    ? "Pending"
                                    : order.status === "confirmed"
                                      ? "Confirmed"
                                      : order.status === "processing"
                                        ? "Processing"
                                        : order.status}
                            </span>
                            <div className="mt-2 space-y-1">
                              <button
                                onClick={() => handleViewOrderDetails(order)}
                                className="block w-full text-xs text-blue-600 hover:text-blue-800 transition-colors"
                              >
                                View Details
                              </button>
                              {!["pending", "confirmed"].includes(
                                order.status,
                              ) ? (
                                <button
                                  disabled
                                  className="block w-full text-xs text-gray-400 font-medium cursor-not-allowed"
                                >
                                  Cannot Cancel
                                </button>
                              ) : order.isCancelling ? (
                                <button
                                  disabled
                                  className="block w-full text-xs text-gray-400 font-medium cursor-not-allowed"
                                >
                                  Cancelling...
                                </button>
                              ) : (
                                <button
                                  onClick={() => handleCancelOrder(order._id)}
                                  className="block w-full text-xs text-red-600 hover:text-red-800 transition-colors font-medium"
                                >
                                  Cancel Order
                                </button>
                              )}
                              {order.status === "cancelled" && (
                                <button
                                  onClick={() => handleReorder(order)}
                                  className="block w-full text-xs text-green-600 hover:text-green-800 transition-colors font-medium"
                                >
                                  Reorder
                                </button>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })
              )}
            </div>
          )}

          {/* Cancelled Orders Tab */}
          {orderTab === "cancelled" && (
            <div className="space-y-4">
              {/* DEBUG INFO */}
              <div className="bg-yellow-50 border border-yellow-200 p-4 rounded-lg mb-4">
                <h4 className="font-semibold text-yellow-800 mb-2">
                  Debug Info - Cancelled Orders
                </h4>
                <p className="text-sm text-yellow-700">
                  Total orders in state: {orders.length}
                </p>
                <p className="text-sm text-yellow-700">
                  Current tab: {orderTab}
                </p>
                <p className="text-sm text-yellow-700">
                  Cancelled orders after filter:{" "}
                  {orders.filter((o) => o.status === "cancelled").length}
                </p>
                <p className="text-sm text-yellow-700">
                  Orders with no status:{" "}
                  {orders.filter((o) => !o.status).length}
                </p>
                <details className="mt-2">
                  <summary className="text-xs text-yellow-600 cursor-pointer">
                    View order details
                  </summary>
                  <pre className="text-xs text-yellow-600 mt-2 overflow-auto max-h-32">
                    {JSON.stringify(orders.slice(0, 3), null, 2)}
                  </pre>
                </details>
              </div>

              {orders.filter((order) => order.status === "cancelled").length ===
              0 ? (
                <div className="text-center py-12 bg-gray-50 rounded-lg border-2 border-dashed border-gray-300">
                  <Package size={48} className="mx-auto text-gray-400 mb-4" />
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">
                    No cancelled orders
                  </h3>
                  <p className="text-gray-600">
                    Your cancelled orders will appear here
                  </p>
                </div>
              ) : (
                orders
                  .filter((order) => {
                    // Safety filter - ensure backend filtering worked correctly
                    return order.status === "cancelled";
                  })
                  .map((order, index) => (
                    <div
                      key={order._id || `cancelled-${index}`}
                      className="bg-red-50 border border-red-200 rounded-xl p-6 hover:shadow-md transition-shadow duration-200"
                    >
                      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
                        <div className="flex-1">
                          <h4 className="font-semibold text-red-900 text-lg">
                            Order #
                            {order.orderNumber ||
                              order._id?.slice(-8) ||
                              `ORD-${index + 1}`}
                          </h4>
                          <p className="text-sm text-red-700 mb-2">
                            Cancelled on{" "}
                            {order.createdAt
                              ? new Date(order.createdAt).toLocaleDateString()
                              : "Unknown date"}
                          </p>
                          <p className="text-sm text-gray-600">
                            {order.type === "service"
                              ? "Service Order"
                              : `${getOrderItems(order).length} items`}
                          </p>
                          {order.totalAmount && (
                            <p className="text-sm font-medium text-gray-900 mt-1">
                              Total: ₹
                              {order.totalAmount.toLocaleString("en-IN")}
                            </p>
                          )}
                        </div>
                        <div className="flex gap-2">
                          <button
                            onClick={() => handleReorder(order)}
                            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium"
                          >
                            Reorder
                          </button>
                        </div>
                      </div>
                    </div>
                  ))
              )}
            </div>
          )}
        </>
      )}
    </div>
  );

  const renderNotifications = () => (
    <div className="space-y-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Notifications</h2>
          <p className="text-sm text-gray-600 mt-1">
            Manage your notifications and preferences
          </p>
        </div>
        <button
          onClick={async () => {
            try {
              console.log("🔔 Marking all notifications as read...");
              const result = await notificationService.markAllAsRead();
              console.log("🔔 Mark all as read result:", result);
              // Reload notifications after marking all as read
              const notificationData =
                await notificationService.getNotifications();
              console.log(
                "🔔 Reloaded notifications after mark all read:",
                notificationData,
              );
              setNotifications(notificationData || []);
            } catch (error) {
              console.error("🔔 Mark all as read error:", error);
            }
          }}
          className="px-4 py-2 text-blue-600 border border-blue-600 rounded-lg hover:bg-blue-50 transition-colors duration-200"
        >
          Mark All as Read
        </button>
      </div>

      {/* Notification List */}
      <div className="space-y-4 mb-8">
        {notifications.length === 0 ? (
          <div className="text-center py-12 bg-gray-50 rounded-lg border-2 border-dashed border-gray-300">
            <Bell size={48} className="mx-auto text-gray-400 mb-4 " />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              No notifications yet
            </h3>
            <p className="text-gray-600">Your notifications will appear here</p>
          </div>
        ) : (
          <>
            {notifications.map((notification) => (
              <div
                key={notification._id}
                className={`bg-white border rounded-lg p-4 hover:shadow-md transition-shadow duration-200 ${
                  !notification.read
                    ? "border-blue-200 bg-blue-50"
                    : "border-gray-200"
                }`}
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-3 flex-1">
                    <div
                      className={`p-2 rounded-full ${
                        notification.type === "order_update"
                          ? "bg-blue-100 text-blue-600"
                          : notification.type === "product_approved"
                            ? "bg-green-100 text-green-600"
                            : notification.type === "product_denied"
                              ? "bg-red-100 text-red-600"
                              : notification.type === "system"
                                ? "bg-purple-100 text-purple-600"
                                : "bg-gray-100 text-gray-600"
                      }`}
                    >
                      {notification.type === "order_update" ? (
                        <Package size={16} />
                      ) : notification.type === "product_approved" ? (
                        <Check size={16} />
                      ) : notification.type === "product_denied" ? (
                        <X size={16} />
                      ) : notification.type === "system" ? (
                        <Bell size={16} />
                      ) : (
                        <Bell size={16} />
                      )}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-1">
                        <h3 className="font-semibold text-gray-900">
                          {notification.title}
                        </h3>
                        <span className="text-xs text-gray-500">
                          {new Date(
                            notification.createdAt,
                          ).toLocaleDateString()}
                        </span>
                      </div>
                      <p className="text-sm text-gray-600 mb-2">
                        {notification.message}
                      </p>
                      {notification.actionUrl && (
                        <button
                          onClick={async () => {
                            try {
                              // Mark as read first
                              await notificationService.markAsRead(
                                notification._id,
                              );
                              // Then navigate or handle action
                              console.log(
                                "Navigate to:",
                                notification.actionUrl,
                              );
                              // Reload notifications to update read status
                              const notificationData =
                                await notificationService.getNotifications();
                              setNotifications(notificationData || []);
                            } catch (error) {
                              console.error(
                                "Handle notification action error:",
                                error,
                              );
                            }
                          }}
                          className="text-sm text-blue-600 hover:text-blue-700 font-medium"
                        >
                          {notification.actionText || "View Details"}
                        </button>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-2 ml-4">
                    {!notification.read && (
                      <div className="w-2 h-2 bg-blue-600 rounded-full"></div>
                    )}
                    <button
                      onClick={async () => {
                        try {
                          await notificationService.deleteNotification(
                            notification._id,
                          );
                          // Reload notifications after deletion
                          const notificationData =
                            await notificationService.getNotifications();
                          setNotifications(notificationData || []);
                        } catch (error) {
                          console.error("Delete notification error:", error);
                        }
                      }}
                      className="text-gray-400 hover:text-red-600 transition-colors duration-200"
                    >
                      <X size={16} />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </>
        )}
      </div>

      {/* Notification Preferences */}
      <div className="border-t pt-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          Notification Preferences
        </h3>
        <div className="space-y-4">
          {/* Email Notifications */}
          <div className="flex items-center justify-between py-3 border-b">
            <div className="flex-1 min-w-0 pr-4">
              <p className="font-medium text-gray-600 text-sm sm:text-base">
                <span className="inline-block mr-2">Email Notifications</span>
              </p>
              <p className="text-sm text-gray-500">Receive updates via email</p>
            </div>
            <button
              onClick={() =>
                handleNotificationSettingChange(
                  "email",
                  !notificationPreferences.email,
                )
              }
              className={`w-12 h-6 rounded-full relative transition-colors duration-200 ${
                notificationPreferences.email ? "bg-blue-600" : "bg-gray-300"
              }`}
            >
              <div
                className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-transform duration-200 ${
                  notificationPreferences.email
                    ? "translate-x-6"
                    : "translate-x-1"
                }`}
              ></div>
            </button>
          </div>

          {/* SMS Alerts */}
          <div className="flex items-center justify-between py-3 border-b">
            <div className="flex-1 min-w-0 pr-4">
              <p className="font-medium text-gray-600 text-sm sm:text-base">
                SMS Alerts
              </p>
              <p className="text-sm text-gray-500">Get order status via SMS</p>
            </div>
            <button
              onClick={() =>
                handleNotificationSettingChange(
                  "sms",
                  !notificationPreferences.sms,
                )
              }
              className={`w-12 h-6 rounded-full relative transition-colors duration-200 ${
                notificationPreferences.sms ? "bg-blue-600" : "bg-gray-300"
              }`}
            >
              <div
                className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-transform duration-200 ${
                  notificationPreferences.sms
                    ? "translate-x-6"
                    : "translate-x-1"
                }`}
              ></div>
            </button>
          </div>

          {/* Push Notifications */}
          <div className="flex items-center justify-between py-3 border-b">
            <div className="flex-1 min-w-0 pr-4">
              <p className="font-medium text-gray-600 text-sm sm:text-base">
                Push Notifications
              </p>
              <p className="text-sm text-gray-500">
                Browser notifications for offers
              </p>
            </div>
            <button
              onClick={() =>
                handleNotificationSettingChange(
                  "push",
                  !notificationPreferences.push,
                )
              }
              className={`w-12 h-6 rounded-full relative transition-colors duration-200 ${
                notificationPreferences.push ? "bg-blue-600" : "bg-gray-300"
              }`}
            >
              <div
                className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-transform duration-200 ${
                  notificationPreferences.push
                    ? "translate-x-6"
                    : "translate-x-1"
                }`}
              ></div>
            </button>
          </div>

          {/* Section Divider */}
          <div className="pt-2">
            <h4 className="text-sm font-semibold text-gray-900 mb-4">
              Notification Types
            </h4>
          </div>

          {/* Order Updates */}
          <div className="flex items-center justify-between py-3 border-b">
            <div className="flex-1 min-w-0 pr-4">
              <p className="font-medium text-gray-600 text-sm sm:text-base">
                📦 Order Updates
              </p>
              <p className="text-sm text-gray-500">
                Get notified when your orders change status
              </p>
            </div>
            <button
              onClick={() =>
                handleNotificationSettingChange(
                  "orderUpdates",
                  !notificationPreferences.orderUpdates,
                )
              }
              className={`w-12 h-6 rounded-full relative transition-colors duration-200 ${
                notificationPreferences.orderUpdates
                  ? "bg-blue-600"
                  : "bg-gray-300"
              }`}
            >
              <div
                className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-transform duration-200 ${
                  notificationPreferences.orderUpdates
                    ? "translate-x-6"
                    : "translate-x-1"
                }`}
              ></div>
            </button>
          </div>

          {/* Payment Alerts */}
          <div className="flex items-center justify-between py-3 border-b">
            <div className="flex-1 min-w-0 pr-4">
              <p className="font-medium text-gray-600 text-sm sm:text-base">
                💳 Payment Alerts
              </p>
              <p className="text-sm text-gray-500">
                Get notified about payment confirmations and refunds
              </p>
            </div>
            <button
              onClick={() =>
                handleNotificationSettingChange(
                  "paymentAlerts",
                  !notificationPreferences.paymentAlerts,
                )
              }
              className={`w-12 h-6 rounded-full relative transition-colors duration-200 ${
                notificationPreferences.paymentAlerts
                  ? "bg-blue-600"
                  : "bg-gray-300"
              }`}
            >
              <div
                className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-transform duration-200 ${
                  notificationPreferences.paymentAlerts
                    ? "translate-x-6"
                    : "translate-x-1"
                }`}
              ></div>
            </button>
          </div>

          {/* Promotions */}
          <div className="flex items-center justify-between py-3 border-b">
            <div className="flex-1 min-w-0 pr-4">
              <p className="font-medium text-gray-600 text-sm sm:text-base">
                🎁 Promotions & Offers
              </p>
              <p className="text-sm text-gray-500">
                Receive special deals and exclusive offers
              </p>
            </div>
            <button
              onClick={() =>
                handleNotificationSettingChange(
                  "promotions",
                  !notificationPreferences.promotions,
                )
              }
              className={`w-12 h-6 rounded-full relative transition-colors duration-200 ${
                notificationPreferences.promotions
                  ? "bg-blue-600"
                  : "bg-gray-300"
              }`}
            >
              <div
                className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-transform duration-200 ${
                  notificationPreferences.promotions
                    ? "translate-x-6"
                    : "translate-x-1"
                }`}
              ></div>
            </button>
          </div>

          {/* Delivery Notifications */}
          <div className="flex items-center justify-between py-3">
            <div className="flex-1 min-w-0 pr-4">
              <p className="font-medium text-gray-600 text-sm sm:text-base">
                🚚 Delivery Notifications
              </p>
              <p className="text-sm text-gray-500">
                Get updates about delivery status and arrival
              </p>
            </div>
            <button
              onClick={() =>
                handleNotificationSettingChange(
                  "deliveryNotifications",
                  !notificationPreferences.deliveryNotifications,
                )
              }
              className={`w-12 h-6 rounded-full relative transition-colors duration-200 ${
                notificationPreferences.deliveryNotifications
                  ? "bg-blue-600"
                  : "bg-gray-300"
              }`}
            >
              <div
                className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-transform duration-200 ${
                  notificationPreferences.deliveryNotifications
                    ? "translate-x-6"
                    : "translate-x-1"
                }`}
              ></div>
            </button>
          </div>
        </div>
      </div>
    </div>
  );

  // Profile input change handler
  const handleProfileInputChange = (e) => {
    const { name, value } = e.target;
    setUserData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const renderSecurity = () => (
    <div className="space-y-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">
            Security Settings
          </h2>
          <p className="text-sm text-gray-600 mt-1">
            Manage your account security and privacy
          </p>
        </div>
      </div>

      <div className="space-y-6">
        {/* Change Password Section */}
        <div className="bg-white border border-gray-200 rounded-2xl p-4 sm:p-8 shadow-lg">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2 bg-blue-50 rounded-lg">
              <Shield size={20} className="text-blue-600" />
            </div>
            <div>
              <h3 className="text-xl font-bold text-gray-900">
                Change Password
              </h3>
              <p className="text-sm text-gray-500 mt-1">
                Keep your account secure with a strong password
              </p>
            </div>
          </div>

          <form onSubmit={handlePasswordChange} className="space-y-6">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-3">
                Current Password
              </label>
              <div className="relative">
                <input
                  type="password"
                  name="currentPassword"
                  value={passwordData.currentPassword}
                  onChange={handlePasswordInputChange}
                  className="w-full px-4 py-3 pr-12 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all duration-200 text-gray-900 placeholder-gray-400"
                  placeholder="Enter your current password"
                  required
                  autoComplete="current-password"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-3">
                New Password
              </label>
              <div className="relative">
                <input
                  type="password"
                  name="newPassword"
                  value={passwordData.newPassword}
                  onChange={handlePasswordInputChange}
                  className="w-full px-4 py-3 pr-12 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all duration-200 text-gray-900 placeholder-gray-400"
                  placeholder="Enter your new password"
                  minLength={8}
                  autoComplete="new-password"
                />
              </div>
              <div className="mt-3 p-3 bg-blue-50 rounded-lg">
                <p className="text-xs text-blue-700 font-medium">
                  🔒 Password must be at least 8 characters long
                </p>
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-3">
                Confirm New Password
              </label>
              <div className="relative">
                <input
                  type="password"
                  name="confirmPassword"
                  value={passwordData.confirmPassword}
                  onChange={handlePasswordInputChange}
                  className="w-full px-4 py-3 pr-12 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all duration-200 text-gray-900 placeholder-gray-400"
                  placeholder="Confirm your new password"
                  required
                  minLength={8}
                />
              </div>
              {passwordData.confirmPassword &&
                passwordData.newPassword !== passwordData.confirmPassword && (
                  <div className="mt-2 p-2 bg-red-50 rounded-lg">
                    <p className="text-xs text-red-600 font-medium">
                      ⚠️ Passwords do not match
                    </p>
                  </div>
                )}
            </div>

            <div className="flex flex-col sm:flex-row gap-3 pt-4">
              <button
                type="submit"
                disabled={loading}
                className="flex-1 px-4 py-3 sm:px-6 sm:py-4 bg-blue-600 text-white rounded-xl font-semibold hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-all duration-200 shadow-lg hover:shadow-xl"
              >
                {loading ? (
                  <span className="flex items-center justify-center gap-2">
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    Updating Password...
                  </span>
                ) : (
                  <span className="flex items-center justify-center gap-2">
                    <Shield size={18} />
                    Update Password
                  </span>
                )}
              </button>

              <button
                type="button"
                onClick={() =>
                  setPasswordData({
                    currentPassword: "",
                    newPassword: "",
                    confirmPassword: "",
                  })
                }
                className="px-4 py-3 sm:px-6 sm:py-4 border-2 border-gray-200 text-gray-700 rounded-xl font-semibold hover:bg-gray-50 transition-all duration-200"
              >
                Clear
              </button>
            </div>
          </form>
        </div>

        {/* Two-Factor Authentication */}
        <div className="bg-white border border-gray-200 rounded-xl p-4 sm:p-6 shadow-sm">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-4">
            <div className="flex items-center gap-3">
              <div
                className={`p-2 rounded-lg ${
                  securitySettings.twoFactorEnabled
                    ? "bg-green-100 text-green-600"
                    : "bg-gray-100 text-gray-600"
                }`}
              >
                <Shield size={20} />
              </div>
              <div>
                <h3 className="text-base sm:text-lg font-semibold text-gray-900">
                  Two-Factor Authentication
                </h3>
                <p className="text-sm text-gray-600">
                  Add an extra layer of security to your account
                </p>
              </div>
            </div>
            <button
              onClick={toggleTwoFactor}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 whitespace-nowrap ${
                securitySettings.twoFactorEnabled
                  ? "bg-green-600 text-white hover:bg-green-700"
                  : "bg-gray-200 text-gray-700 hover:bg-gray-300"
              }`}
            >
              {securitySettings.twoFactorEnabled ? "Enabled" : "Enable 2FA"}
            </button>
          </div>

          {securitySettings.twoFactorEnabled && (
            <div className="mt-4 p-4 bg-green-50 border border-green-200 rounded-lg">
              <div className="flex items-center gap-2 text-green-700">
                <Check size={16} />
                <span className="text-sm font-medium">
                  Two-factor authentication is currently enabled
                </span>
              </div>
              <p className="text-xs text-green-600 mt-1">
                You'll receive a verification code when signing in from new
                devices
              </p>
            </div>
          )}
        </div>

        {/* Security Preferences */}
        <div className="bg-white border border-gray-200 rounded-xl p-4 sm:p-6 shadow-sm">
          <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-4">
            Security Preferences
          </h3>

          <div className="space-y-4">
            <div className="flex items-center justify-between py-3 border-b">
              <div className="flex-1 min-w-0 pr-4">
                <p className="font-medium text-gray-900 text-sm sm:text-base">
                  Login Alerts
                </p>
                <p className="text-sm text-gray-600">
                  Get notified when someone logs into your account
                </p>
              </div>
              <button
                onClick={() =>
                  handleProfileInputChange({
                    target: {
                      name: "loginAlerts",
                      value: !securitySettings.loginAlerts,
                    },
                  })
                }
                className={`w-12 h-6 rounded-full relative transition-colors duration-200 ${
                  securitySettings.loginAlerts ? "bg-blue-600" : "bg-gray-300"
                }`}
              >
                <div
                  className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-transform duration-200 ${
                    securitySettings.loginAlerts
                      ? "translate-x-6"
                      : "translate-x-1"
                  }`}
                ></div>
              </button>
            </div>

            <div className="flex items-center justify-between py-3 border-b">
              <div className="flex-1 min-w-0 pr-4">
                <p className="font-medium text-gray-900 text-sm sm:text-base">
                  Session Timeout
                </p>
                <p className="text-sm text-gray-600">
                  Automatically log out after inactivity
                </p>
              </div>
              <button
                onClick={() =>
                  handleProfileInputChange({
                    target: {
                      name: "sessionTimeout",
                      value: !securitySettings.sessionTimeout,
                    },
                  })
                }
                className={`w-12 h-6 rounded-full relative transition-colors duration-200 ${
                  securitySettings.sessionTimeout
                    ? "bg-blue-600"
                    : "bg-gray-300"
                }`}
              >
                <div
                  className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-transform duration-200 ${
                    securitySettings.sessionTimeout
                      ? "translate-x-6"
                      : "translate-x-1"
                  }`}
                ></div>
              </button>
            </div>
          </div>
        </div>

        {/* Login Activity */}
        <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Recent Login Activity
          </h3>
          <div className="space-y-3">
            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center">
                  <div className="text-xs font-bold">C</div>
                </div>
                <div>
                  <p className="font-medium text-gray-900">Chrome on Windows</p>
                  <p className="text-sm text-gray-600">Current session</p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-sm font-medium text-gray-900">Today</p>
                <p className="text-xs text-gray-600">10:30 AM</p>
              </div>
            </div>

            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-green-100 text-green-600 rounded-full flex items-center justify-center">
                  <div className="text-xs font-bold">M</div>
                </div>
                <div>
                  <p className="font-medium text-gray-900">Mobile App</p>
                  <p className="text-sm text-gray-600">Mumbai, India</p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-sm font-medium text-gray-900">Yesterday</p>
                <p className="text-xs text-gray-600">8:15 PM</p>
              </div>
            </div>
          </div>

          <button className="w-full mt-4 px-4 py-2 text-blue-600 border border-blue-600 rounded-lg hover:bg-blue-50 transition-colors duration-200">
            View All Login Activity
          </button>
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation />

      {/* Mobile Tabs - Hidden on desktop, visible on mobile */}
      <div className="lg:hidden bg-white shadow-sm mb-6">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between py-4">
            <div className="flex items-center gap-3">
              <h1 className="text-xl font-semibold text-gray-900">
                My Profile
              </h1>
            </div>
            <div className="flex items-center gap-4">
              <div className="hidden sm:block">
                <p className="text-sm text-gray-500">
                  Manage your account settings and preferences
                </p>
              </div>
              <button
                onClick={() => navigate("/")}
                className="flex items-center gap-2 px-4 py-2 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all duration-200 group"
              >
                <ArrowLeft
                  size={20}
                  className="transition-transform duration-200 group-hover:-translate-x-1"
                />
                <span className="font-medium">Back to Home</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile Tab Navigation - Always visible on small screens */}
      <div className="block lg:hidden bg-white shadow-sm border-b">
        <div className="px-4 py-3">
          <h2 className="text-gray-900 font-semibold">My Profile</h2>
        </div>
        <div className="mobile-tab-container flex overflow-x-auto px-4 pb-4 space-x-3 scrollbar-hide">
          {tabs
            .filter((tab) => tab.id !== "logout")
            .map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`mobile-tab flex items-center gap-3 px-4 py-3 rounded-xl whitespace-nowrap transition-all duration-200 text-sm font-medium min-w-fit flex-shrink-0 ${
                    activeTab === tab.id
                      ? `${tab.bgColor} ${tab.color} shadow-md transform scale-105`
                      : `text-gray-600 ${tab.hoverColor} hover:shadow-sm hover:transform hover:scale-105`
                  }`}
                >
                  <div
                    className={`tab-icon-container p-2.5 rounded-lg ${activeTab === tab.id ? "bg-white shadow-sm" : "bg-gray-100"} transition-colors duration-200 flex items-center justify-center min-w-[44px] min-h-[44px]`}
                  >
                    <Icon
                      size={22}
                      className={`tab-icon flex-shrink-0 transition-colors duration-200 ${
                        activeTab === tab.id ? tab.color : "text-gray-600"
                      }`}
                    />
                  </div>
                  <span className="font-medium whitespace-nowrap">
                    {tab.label}
                  </span>
                </button>
              );
            })}
        </div>
        {/* Mobile Logout Button */}
        <div className="px-4 pb-3 border-t">
          <button
            onClick={handleLogout}
            className="flex items-center gap-2 px-3 py-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors text-sm"
          >
            <LogOut size={16} />
            Logout
          </button>
        </div>
      </div>

      <div className="flex flex-col lg:flex-row">
        {/* Sidebar - Hidden on mobile, visible on desktop */}
        <aside className="hidden lg:block w-64 bg-white shadow-lg min-h-screen">
          <div className="p-6">
            <h2 className="text-xl font-semibold mb-6 text-gray-900">
              My Profile
            </h2>

            <nav className="desktop-sidebar space-y-2 overflow-visible">
              {tabs.map((tab) => {
                const Icon = tab.icon;
                return (
                  <button
                    key={tab.id}
                    onClick={() => {
                      if (tab.id === "logout") {
                        handleLogout();
                      } else {
                        setActiveTab(tab.id);
                      }
                    }}
                    className={`desktop-tab w-full flex items-center gap-4 px-4 py-3 rounded-xl transition-all duration-200 overflow-visible ${
                      activeTab === tab.id
                        ? `${tab.bgColor} ${tab.color} shadow-md transform scale-105`
                        : `text-gray-600 ${tab.hoverColor} hover:shadow-sm hover:transform hover:scale-105`
                    }`}
                  >
                    <div
                      className={`tab-icon-container p-3.5 rounded-lg ${activeTab === tab.id ? "bg-white shadow-sm" : "bg-gray-100"} transition-all duration-200 flex items-center justify-center min-w-[52px] min-h-[52px] overflow-visible`}
                    >
                      <Icon
                        size={26}
                        className={`tab-icon flex-shrink-0 transition-colors duration-200 overflow-visible ${
                          activeTab === tab.id ? tab.color : "text-gray-600"
                        }`}
                      />
                    </div>
                    <div className="flex-1 text-left">
                      <span className="font-semibold text-base">
                        {tab.label}
                      </span>
                    </div>
                    {activeTab === tab.id && (
                      <div
                        className={`w-2 h-8 rounded-full ${tab.color} bg-current opacity-20`}
                      ></div>
                    )}
                  </button>
                );
              })}
            </nav>
          </div>
        </aside>

        {/* Main Content - Full width on mobile, flex-1 on desktop */}
        <main className="w-full lg:flex-1 p-4 lg:p-6">
          <div className="bg-white rounded-lg shadow-sm p-4 lg:p-6">
            {activeTab === "personal" && renderPersonalInfo()}
            {activeTab === "addresses" && (
              <>
                {renderAddresses()}
                {showAddAddressForm && renderAddressForm()}
                {showEditAddressForm && renderEditAddressForm()}
              </>
            )}
            {activeTab === "orders" && renderOrders()}
            {activeTab === "notifications" && renderNotifications()}
            {activeTab === "security" && renderSecurity()}
          </div>
        </main>
      </div>
      <Footer />

      {/* Order Details Modal */}
      {renderOrderDetailsModal()}
    </div>
  );
};

export default Profile;
