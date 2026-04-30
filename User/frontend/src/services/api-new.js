import axios from 'axios';
import { API_BASE_URL, PRODUCT_API_URL, SERVICE_CATEGORY_API_URL } from '../config/constants';

// API Service class
class ApiService {
  constructor() {
    this.baseURL = API_BASE_URL;
  }

  // Generic HTTP methods
  get = (url, config = {}) => api.get(url, config),
  post = (url, data = {}, config = {}) => api.post(url, data, config),
  put = (url, data = {}, config = {}) => api.put(url, data, config),
  delete = (url, config = {}) => api.delete(url, config),
};

// Review endpoints
  getReviews = (productId) => api.get(`/reviews/product/${productId}`),
  createReview = (reviewData) => api.post('/reviews', reviewData),
  updateReview = (id, reviewData) => api.put(`/reviews/${id}`, reviewData),
  deleteReview = (id) => api.delete(`/reviews/${id}`),

  // Contact endpoints
  sendContactMessage = (messageData) => api.post('/contact', messageData),

  // Generic HTTP methods
  get = (url, config = {}) => api.get(url, config),
  post = (url, data = {}, config = {}) => api.post(url, data, config),
  put = (url, data = {}, config = {}) => api.put(url, data, config),
  delete = (url, config = {}) => api.delete(url, config),
};

// Export the productApi for product services
export { api, productApi, submitContactForm };

export default apiService;
