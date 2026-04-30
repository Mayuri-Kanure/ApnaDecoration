import axios from "axios";
import {
  API_BASE_URL,
  PRODUCT_API_URL,
  SERVICE_CATEGORY_API_URL,
} from "../config/constants";

// Debug: Log actual base URLs being used (non-sensitive)
if (process.env.NODE_ENV === "development") {
  console.log("🔗 API Configuration - Development Mode");
}


// Create axios instance for general API
const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: {
    "Content-Type": "application/json",
    Accept: "application/json",
  },
});

// Create axios instance for products (User API gateway)
const productApi = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: {
    "Content-Type": "application/json",
    Accept: "application/json",
  },
});

// Add auth interceptor to productApi
productApi.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    // Debug: Only log non-sensitive information
    if (process.env.NODE_ENV === "development") {
      console.log(`🌐 API: ${config.method?.toUpperCase()} ${config.url}`);
    }

    return config;
  },
  (error) => {
    return Promise.reject(error);
  },
);

// Add response interceptor to productApi to match api instance
productApi.interceptors.response.use(
  (response) => {
    // Extract data from different response formats
    if (response.data && typeof response.data === "object") {
      // Handle Admin backend format: {success: true, data: [...]}
      if (response.data.success && response.data.data) {
        return response.data.data;
      }
      // Handle direct data field
      else if (response.data.data) {
        return response.data.data;
      }
      // Handle categories field
      else if (response.data.categories) {
        return response.data.categories;
      }
      // Handle products field
      else if (response.data.products) {
        return response.data.products;
      }
      // Handle direct array
      else if (Array.isArray(response.data)) {
        return response.data;
      }
      // Return full response if none of the above
      else {
        return response.data;
      }
    }
    return response.data;
  },
  (error) => {
    console.log(
      "🔍 Product API Error:",
      error.response?.status,
      error.config?.url,
    );

    if (error.response?.status === 401) {
      // Token expired or invalid
      console.log("🔐 Product API: Session expired, clearing auth data");
      localStorage.removeItem("token");
      localStorage.removeItem("user");

      // Only redirect if not already on login page
      if (!window.location.pathname.includes("/login")) {
        console.log("🔐 Product API: Redirecting to login due to 401 error");
        window.location.href = "/login";
      }
    }

    return Promise.reject(error.response?.data || error);
  },
);

// Create axios instance for service categories (Admin backend - has Cloudinary URLs)
const serviceCategoryApi = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: {
    "Content-Type": "application/json",
  },
});

// Request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    // 🔍 DEBUG: Track all API calls
    const urlPath = config.url;
    const timestamp = new Date().toISOString();
    console.log(`🔍 API CALL [${timestamp}]: ${urlPath}`);

    const token = localStorage.getItem("token");
    const user = localStorage.getItem("user");

    console.log(
      "🔍 Auth Token Check:",
      token ? "✅ Token Found" : "❌ No Token",
    );
    console.log(
      "🔍 Token Value:",
      token ? `${token.substring(0, 20)}...` : "null",
    );
    console.log("🔍 User Data Check:", user ? "✅ User Found" : "❌ No User");
    console.log("🔍 All localStorage keys:", Object.keys(localStorage));

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
      console.log(
        "🔍 Authorization Header Added:",
        `Bearer ${token.substring(0, 20)}...`,
      );
    } else {
      console.log("🔍 No Authorization Header Added");
      console.log("🔍 localStorage contents:", {
        token: localStorage.getItem("token"),
        user: localStorage.getItem("user"),
        tokenLength: localStorage.getItem("token")?.length || 0,
      });
    }

    // If data is FormData, remove Content-Type to let browser set it with boundary
    if (config.data instanceof FormData) {
      delete config.headers["Content-Type"];
    }

    return config;
  },
  (error) => {
    return Promise.reject(error);
  },
);

// Add response interceptor to api instance for services
api.interceptors.response.use(
  (response) => {
    // DEBUG: Track successful responses
    const urlPath = response.config?.url;
    console.log(`🔍 API Response [${new Date().toISOString()}]: ${urlPath}`);
    console.log("🔍 API Response data:", response.data);
    console.log("🔍 API Response status:", response.status);

    // Extract data from different response formats
    if (response.data && typeof response.data === "object") {
      // Handle Admin backend format: {success: true, data: [...]}
      if (response.data.success && response.data.data) {
        return response.data.data;
      }
      // Handle banners field
      else if (response.data.banners) {
        return response.data.banners;
      }
      // Handle services field
      else if (response.data.services) {
        return response.data.services;
      }
      // Handle categories field
      else if (response.data.categories) {
        return response.data.categories;
      }
      // Handle products field
      else if (response.data.products) {
        return response.data.products;
      }
      // Handle direct data field
      else if (response.data.data) {
        return response.data.data;
      }
      // Handle direct array
      else if (Array.isArray(response.data)) {
        return response.data;
      }
      // Return full response if none of the above
      else {
        return response.data;
      }
    }
    return response.data;
  },
  (error) => {
    console.log("🔍 API Error:", error.response?.status, error.config?.url);
    return Promise.reject(error.response?.data || error);
  },
);

// Add auth interceptor to productApi as well
productApi.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
  },
  (error) => {
    return Promise.reject(error);
  },
);

// Add response interceptor to serviceCategoryApi
serviceCategoryApi.interceptors.response.use(
  (response) => {
    // DEBUG: Track successful responses
    const urlPath = response.config.url;
    console.log(
      `🔍 ServiceCategoryAPI Response [${new Date().toISOString()}]: ${urlPath}`,
    );
    console.log("🔍 ServiceCategoryAPI Response data:", response.data);
    console.log("🔍 ServiceCategoryAPI Response status:", response.status);

    // Extract data from different response formats
    if (response.data !== undefined && response.data !== null) {
      // Handle direct array (including empty arrays)
      if (Array.isArray(response.data)) {
        return response.data;
      }
      // Handle object with data field
      else if (response.data.data) {
        return response.data.data;
      } else if (response.data.categories) {
        return response.data.categories;
      } else {
        return response.data;
      }
    }
    return response.data;
  },
  (error) => {
    console.log(
      "🔍 ServiceCategory API Error:",
      error.response?.status,
      error.config?.url,
    );

    if (error.response?.status === 401) {
      // Token expired or invalid
      console.log(
        "🔐 ServiceCategory API: Session expired, clearing auth data",
      );
      localStorage.removeItem("token");
      localStorage.removeItem("user");

      // Only redirect if not already on login page
      if (!window.location.pathname.includes("/login")) {
        console.log(
          "🔐 ServiceCategory API: Redirecting to login due to 401 error",
        );
        window.location.href = "/login";
      }
    }

    return Promise.reject(error.response?.data || error);
  },
);

// API methods
const apiService = {
  // Auth endpoints
  login: (credentials) => api.post("/auth/login", credentials),
  register: (userData) => api.post("/auth/register", userData),
  getProfile: () => api.get("/auth/profile"),
  updateProfile: (userData) => api.put("/auth/profile", userData),
  changePassword: (passwordData) =>
    api.put("/auth/change-password", passwordData),

  // Product endpoints (using Admin backend)
  getProducts: (params = {}) => productApi.get("/products", { params }),
  getProduct: (id) => productApi.get(`/products/${id}`),
  getFeaturedProducts: () => productApi.get("/products/featured"),
  searchProducts: (query) =>
    productApi.get("/products/search", { params: { q: query } }),

  // Category endpoints
  getCategories: () => api.get("/categories"),
  getCategory: (id) => api.get(`/categories/${id}`),
  getProductsByCategory: (categoryId) =>
    api.get(`/categories/${categoryId}/products`),

  // Service endpoints (using User backend)
  getServices: () => api.get("/services"),
  getService: (id) => api.get(`/services/${id}`),
  getFeaturedServices: () => api.get("/services/featured"),

  // Service category endpoints (using Admin backend for Cloudinary URLs)
  getServiceCategories: () => serviceCategoryApi.get("/service-categories"),
  getServiceCategory: (id) =>
    serviceCategoryApi.get(`/service-categories/${id}`),
  getServicesByCategory: (categoryId) =>
    serviceCategoryApi.get(`/service-categories/${categoryId}/services`),

  // Banner endpoints
  getBanners: () => api.get("/banners/public"),

  // Cart endpoints
  getCart: () => api.get("/cart"),
  addToCart: (productId, quantity, specifications) =>
    api.post("/cart", { productId, quantity, specifications }),
  updateCartItem: (itemId, quantity) =>
    api.put(`/cart/items/${itemId}`, { quantity }),
  removeFromCart: (itemId) => api.delete(`/cart/items/${itemId}`),
  clearCart: () => api.delete("/cart"),
  mergeGuestCart: (guestCartItems) =>
    api.post("/cart/merge", { guestCartItems }),
  getCartSummary: () => api.get("/cart/summary"),

  // Wishlist endpoints (using User backend for wishlist operations)
  getWishlist: () => api.get("/wishlist"),
  addToWishlist: (productId) => api.post("/wishlist/add", { productId }),
  removeFromWishlist: (productId) => api.delete(`/wishlist/${productId}`),

  // Order endpoints
  getOrders: () => api.get("/orders"),
  getOrder: (id) => api.get(`/orders/${id}`),
  createOrder: (orderData) => api.post("/orders", orderData),
  updateOrderStatus: (orderId, status) =>
    api.put(`/orders/${orderId}/status`, { status }),

  // Address endpoints
  getAddresses: () => api.get("/addresses"),
  getAddress: (id) => api.get(`/addresses/${id}`),
  createAddress: (addressData) => api.post("/addresses", addressData),
  updateAddress: (id, addressData) => api.put(`/addresses/${id}`, addressData),
  deleteAddress: (id) => api.delete(`/addresses/${id}`),
  setDefaultAddress: (id) => api.put(`/addresses/${id}/default`),

  // Payment method endpoints
  getPaymentMethods: () => api.get("/payment-methods"),
  getPaymentMethod: (id) => api.get(`/payment-methods/${id}`),
  createPaymentMethod: (paymentData) =>
    api.post("/payment-methods", paymentData),
  updatePaymentMethod: (id, paymentData) =>
    api.put(`/payment-methods/${id}`, paymentData),
  deletePaymentMethod: (id) => api.delete(`/payment-methods/${id}`),
  setDefaultPaymentMethod: (id) => api.put(`/payment-methods/${id}/default`),

  // Notification endpoints
  getNotifications: () => api.get("/notifications"),
  markNotificationAsRead: (id) => api.put(`/notifications/${id}/read`),
  markAllNotificationsAsRead: () => api.put("/notifications/read-all"),
  deleteNotification: (id) => api.delete(`/notifications/${id}`),

  // Review endpoints
  getReviews: (productId) => api.get(`/reviews/product/${productId}`),
  createReview: (reviewData) => api.post("/reviews", reviewData),
  updateReview: (id, reviewData) => api.put(`/reviews/${id}`, reviewData),
  deleteReview: (id) => api.delete(`/reviews/${id}`),

  // Contact endpoints
  sendContactMessage: (messageData) => api.post("/contact", messageData),
  get: (url, config = {}) => api.get(url, config),
  post: (url, data = {}, config = {}) => api.post(url, data, config),
  put: (url, data = {}, config = {}) => api.put(url, data, config),
  delete: (url, config = {}) => api.delete(url, config),
};

// Export the APIs for services
export { api, productApi, serviceCategoryApi };

export default apiService;
