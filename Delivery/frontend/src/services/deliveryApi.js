// API Configuration
const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL || "https://admin-api.apnadecoration.com/api";

// Delivery Boy API Service
class DeliveryApiService {
  constructor() {
    this.baseURL = API_BASE_URL;
    this.token = null;
  }

  // Set authentication token
  setToken(token) {
    this.token = token;
    if (typeof window !== "undefined") {
      localStorage.setItem("deliveryBoyToken", token);
    }
  }

  // Get authentication token
  getToken() {
    if (this.token) {
      return this.token;
    }
    if (typeof window !== "undefined") {
      return localStorage.getItem("deliveryBoyToken");
    }
    return null;
  }

  // Get headers with authentication
  getHeaders() {
    const headers = {
      "Content-Type": "application/json",
    };

    const token = this.getToken();
    if (token) {
      headers["Authorization"] = `Bearer ${token}`;
    }

    return headers;
  }

  // Generic API request method
  async request(endpoint, options = {}) {
    const url = `${this.baseURL}${endpoint}`;
    const config = {
      headers: this.getHeaders(),
      ...options,
    };

    try {
      const response = await fetch(url, config);
      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message || `HTTP error! status: ${response.status}`,
        );
      }

      return data;
    } catch (error) {
      console.error("API Request Error:", error);
      throw error;
    }
  }

  // Authentication Methods
  async login(credentials) {
    const response = await this.request("/delivery-boy/login", {
      method: "POST",
      body: JSON.stringify(credentials),
    });

    if (response.success && response.data?.token) {
      this.setToken(response.data.token);
    }

    return response;
  }

  async register(userData) {
    return this.request("/delivery-boy/register", {
      method: "POST",
      body: JSON.stringify(userData),
    });
  }

  async logout() {
    try {
      await this.request("/delivery-boy/logout", {
        method: "POST",
      });
    } catch (error) {
      console.error("Logout error:", error);
    } finally {
      this.setToken(null);
      if (typeof window !== "undefined") {
        localStorage.removeItem("deliveryBoyToken");
        localStorage.removeItem("deliveryBoyUser");
      }
    }
  }

  // Profile Methods
  async getProfile() {
    return this.request("/delivery-boy/profile");
  }

  async updateProfile(profileData) {
    return this.request("/delivery-boy/profile", {
      method: "PUT",
      body: JSON.stringify(profileData),
    });
  }

  // Dashboard Methods
  async getDashboardStats() {
    return this.request("/delivery-boy/dashboard");
  }

  // Orders Methods
  async getAvailableOrders(params = {}) {
    const queryString = new URLSearchParams(params).toString();
    return this.request(
      `/delivery/assignment/available${queryString ? "?" + queryString : ""}`,
    );
  }

  async getAssignedOrders(params = {}) {
    const queryString = new URLSearchParams(params).toString();
    return this.request(
      `/delivery/orders/assigned${queryString ? "?" + queryString : ""}`,
    );
  }

  async getCompletedOrders(params = {}) {
    const queryString = new URLSearchParams(params).toString();
    return this.request(
      `/delivery/orders/completed${queryString ? "?" + queryString : ""}`,
    );
  }

  async getOrderDetails(orderId) {
    return this.request(`/delivery/orders/${orderId}`);
  }

  async acceptOrder(orderId) {
    return this.request(`/delivery/assignment/${orderId}/accept`, {
      method: "POST",
    });
  }

  async rejectOrder(orderId, reason) {
    return this.request(`/delivery/assignment/${orderId}/reject`, {
      method: "POST",
      body: JSON.stringify({ reason }),
    });
  }

  async startDelivery(orderId) {
    return this.request(`/delivery/assignment/${orderId}/start`, {
      method: "POST",
    });
  }

  async completeDelivery(orderId, data = {}) {
    return this.request(`/delivery/assignment/${orderId}/complete`, {
      method: "POST",
      body: JSON.stringify(data),
    });
  }

  async markDeliveryFailed(orderId, reason, notes = "") {
    return this.request(`/delivery/assignment/${orderId}/failed`, {
      method: "POST",
      body: JSON.stringify({ reason, notes }),
    });
  }

  // Tracking Methods
  async getActiveTracking() {
    return this.request("/delivery/tracking/active");
  }

  async updateLocation(location) {
    return this.request("/delivery/tracking/location", {
      method: "POST",
      body: JSON.stringify(location),
    });
  }

  async startTracking(orderId) {
    return this.request(`/delivery/tracking/start/${orderId}`, {
      method: "POST",
    });
  }

  async updateETA(trackingId, eta) {
    return this.request(`/delivery/tracking/eta/${trackingId}`, {
      method: "POST",
      body: JSON.stringify(eta),
    });
  }

  async completeTracking(trackingId) {
    return this.request(`/delivery/tracking/complete/${trackingId}`, {
      method: "POST",
    });
  }

  async getTrackingHistory(params = {}) {
    const queryString = new URLSearchParams(params).toString();
    return this.request(
      `/delivery/tracking/history${queryString ? "?" + queryString : ""}`,
    );
  }

  // Enhanced Earnings Methods
  async getEarningsSummary(period = "today") {
    return this.request(`/delivery/earnings/summary?period=${period}`);
  }

  async getEarningsHistory(params = {}) {
    const queryString = new URLSearchParams(params).toString();
    return this.request(
      `/delivery/earnings/history${queryString ? "?" + queryString : ""}`,
    );
  }

  async getWithdrawals(params = {}) {
    const queryString = new URLSearchParams(params).toString();
    return this.request(
      `/delivery/earnings/withdrawals${queryString ? "?" + queryString : ""}`,
    );
  }

  async requestWithdrawal(data) {
    return this.request("/delivery/earnings/withdraw", {
      method: "POST",
      body: JSON.stringify(data),
    });
  }

  async getEarningsAnalytics(period = "month") {
    return this.request(`/delivery/earnings/analytics?period=${period}`);
  }

  // Notification Methods
  async getNotifications(params = {}) {
    const queryString = new URLSearchParams(params).toString();
    return this.request(
      `/delivery/notifications${queryString ? "?" + queryString : ""}`,
    );
  }

  async markNotificationAsRead(notificationId) {
    return this.request(`/delivery/notifications/${notificationId}/read`, {
      method: "PATCH",
    });
  }

  async markAllNotificationsAsRead() {
    return this.request("/delivery/notifications/read-all", {
      method: "PATCH",
    });
  }

  async deleteNotification(notificationId) {
    return this.request(`/delivery/notifications/${notificationId}`, {
      method: "DELETE",
    });
  }

  async getUnreadCount() {
    return this.request("/delivery/notifications/unread-count");
  }

  // Rating Methods
  async getRatings(params = {}) {
    const queryString = new URLSearchParams(params).toString();
    return this.request(
      `/delivery/ratings${queryString ? "?" + queryString : ""}`,
    );
  }

  async getRatingSummary() {
    return this.request("/delivery/ratings/summary");
  }

  async respondToRating(ratingId, response) {
    return this.request(`/delivery/ratings/${ratingId}/response`, {
      method: "POST",
      body: JSON.stringify({ response }),
    });
  }

  async getRatingTrends(period = "month") {
    return this.request(`/delivery/ratings/trends?period=${period}`);
  }

  // Location Methods
  async updateLocation(location) {
    return this.request("/delivery-boy/location", {
      method: "PUT",
      body: JSON.stringify(location),
    });
  }

  // Availability Methods
  async updateAvailability(availability) {
    return this.request("/delivery-boy/availability", {
      method: "PUT",
      body: JSON.stringify({ availability }),
    });
  }

  // Earnings Methods
  async getEarnings() {
    return this.request("/delivery-boy/earnings");
  }

  async requestWithdrawal(amount) {
    return this.request("/delivery-boy/withdrawal", {
      method: "POST",
      body: JSON.stringify({ amount }),
    });
  }

  // Settings Methods
  async getSettings() {
    return this.request("/delivery-boy/settings");
  }

  async updateSettings(settings) {
    return this.request("/delivery-boy/settings", {
      method: "PUT",
      body: JSON.stringify(settings),
    });
  }
}

// Create singleton instance
const deliveryApi = new DeliveryApiService();

export default deliveryApi;
