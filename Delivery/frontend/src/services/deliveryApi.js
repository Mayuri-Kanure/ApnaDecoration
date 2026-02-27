// API Configuration
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'https://admin-api.apnadecoration.com/api';

// Delivery Boy API Service
class DeliveryApiService {
  constructor() {
    this.baseURL = API_BASE_URL;
    this.token = null;
  }

  // Set authentication token
  setToken(token) {
    this.token = token;
    if (typeof window !== 'undefined') {
      localStorage.setItem('deliveryBoyToken', token);
    }
  }

  // Get authentication token
  getToken() {
    if (this.token) {
      return this.token;
    }
    if (typeof window !== 'undefined') {
      return localStorage.getItem('deliveryBoyToken');
    }
    return null;
  }

  // Get headers with authentication
  getHeaders() {
    const headers = {
      'Content-Type': 'application/json',
    };

    const token = this.getToken();
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
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
        throw new Error(data.message || `HTTP error! status: ${response.status}`);
      }

      return data;
    } catch (error) {
      console.error('API Request Error:', error);
      throw error;
    }
  }

  // Authentication Methods
  async login(credentials) {
    const response = await this.request('/delivery-boy/login', {
      method: 'POST',
      body: JSON.stringify(credentials),
    });

    if (response.success && response.data?.token) {
      this.setToken(response.data.token);
    }

    return response;
  }

  async register(userData) {
    return this.request('/delivery-boy/register', {
      method: 'POST',
      body: JSON.stringify(userData),
    });
  }

  async logout() {
    try {
      await this.request('/delivery-boy/logout', {
        method: 'POST',
      });
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      this.setToken(null);
      if (typeof window !== 'undefined') {
        localStorage.removeItem('deliveryBoyToken');
        localStorage.removeItem('deliveryBoyUser');
      }
    }
  }

  // Profile Methods
  async getProfile() {
    return this.request('/delivery-boy/profile');
  }

  async updateProfile(profileData) {
    return this.request('/delivery-boy/profile', {
      method: 'PUT',
      body: JSON.stringify(profileData),
    });
  }

  // Dashboard Methods
  async getDashboardStats() {
    return this.request('/delivery-boy/dashboard');
  }

  // Orders Methods
  async getAvailableOrders() {
    return this.request('/delivery-orders/available');
  }

  async getMyOrders() {
    return this.request('/delivery-orders/my-orders');
  }

  async getOrderDetails(orderId) {
    return this.request(`/delivery-orders/${orderId}`);
  }

  async updateOrderStatus(orderId, status) {
    return this.request(`/delivery-orders/${orderId}/status`, {
      method: 'PUT',
      body: JSON.stringify({ status }),
    });
  }

  // Location Methods
  async updateLocation(location) {
    return this.request('/delivery-boy/location', {
      method: 'PUT',
      body: JSON.stringify(location),
    });
  }

  // Availability Methods
  async updateAvailability(availability) {
    return this.request('/delivery-boy/availability', {
      method: 'PUT',
      body: JSON.stringify({ availability }),
    });
  }

  // Earnings Methods
  async getEarnings() {
    return this.request('/delivery-boy/earnings');
  }

  async requestWithdrawal(amount) {
    return this.request('/delivery-boy/withdrawal', {
      method: 'POST',
      body: JSON.stringify({ amount }),
    });
  }

  // Settings Methods
  async getSettings() {
    return this.request('/delivery-boy/settings');
  }

  async updateSettings(settings) {
    return this.request('/delivery-boy/settings', {
      method: 'PUT',
      body: JSON.stringify(settings),
    });
  }
}

// Create singleton instance
const deliveryApi = new DeliveryApiService();

export default deliveryApi;
