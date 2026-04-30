import apiService from './api';

const serviceService = {
  // Get all services
  getServices: async (params = {}) => {
    try {
      const response = await apiService.getServices(params);
      return response;
    } catch (error) {
      console.error('Error fetching services:', error);
      throw error;
    }
  },

  // Get service by ID
  getService: async (id) => {
    try {
      const response = await apiService.getService(id);
      return response;
    } catch (error) {
      console.error('Error fetching service:', error);
      throw error;
    }
  },

  // Get featured services
  getFeaturedServices: async () => {
    try {
      const response = await apiService.getFeaturedServices();
      return response;
    } catch (error) {
      console.error('Error fetching featured services:', error);
      throw error;
    }
  },

  // Search services
  searchServices: async (query, filters = {}) => {
    try {
      const response = await apiService.get('/services/search', {
        params: { q: query, ...filters }
      });
      return response;
    } catch (error) {
      console.error('Error searching services:', error);
      throw error;
    }
  },

  // Get services by category
  getServicesByCategory: async (categoryId, params = {}) => {
    try {
      const response = await apiService.get(`/services/category/${categoryId}`, { params });
      return response;
    } catch (error) {
      console.error('Error fetching services by category:', error);
      throw error;
    }
  },

  // Get related services
  getRelatedServices: async (serviceId) => {
    try {
      const response = await apiService.get(`/services/${serviceId}/related`);
      return response;
    } catch (error) {
      console.error('Error fetching related services:', error);
      throw error;
    }
  },

  // Create new service (admin only)
  createService: async (serviceData) => {
    try {
      const response = await apiService.post('/services', serviceData);
      return response;
    } catch (error) {
      console.error('Error creating service:', error);
      throw error;
    }
  },

  // Update service (admin only)
  updateService: async (id, serviceData) => {
    try {
      const response = await apiService.put(`/services/${id}`, serviceData);
      return response;
    } catch (error) {
      console.error('Error updating service:', error);
      throw error;
    }
  },

  // Delete service (admin only)
  deleteService: async (id) => {
    try {
      const response = await apiService.delete(`/services/${id}`);
      return response;
    } catch (error) {
      console.error('Error deleting service:', error);
      throw error;
    }
  },

  // Book a service
  bookService: async (serviceId, bookingData) => {
    try {
      const response = await apiService.post(`/services/${serviceId}/book`, bookingData);
      return response;
    } catch (error) {
      console.error('Error booking service:', error);
      throw error;
    }
  },

  // Get service availability
  getServiceAvailability: async (serviceId, date) => {
    try {
      const response = await apiService.get(`/services/${serviceId}/availability`, {
        params: { date }
      });
      return response;
    } catch (error) {
      console.error('Error checking service availability:', error);
      throw error;
    }
  },

  // Get service pricing
  getServicePricing: async (serviceId) => {
    try {
      const response = await apiService.get(`/services/${serviceId}/pricing`);
      return response;
    } catch (error) {
      console.error('Error fetching service pricing:', error);
      throw error;
    }
  },

  // Get service reviews
  getServiceReviews: async (serviceId) => {
    try {
      const response = await apiService.get(`/services/${serviceId}/reviews`);
      return response;
    } catch (error) {
      console.error('Error fetching service reviews:', error);
      throw error;
    }
  },

  // Add service review
  addServiceReview: async (serviceId, reviewData) => {
    try {
      const response = await apiService.post(`/services/${serviceId}/reviews`, reviewData);
      return response;
    } catch (error) {
      console.error('Error adding service review:', error);
      throw error;
    }
  },
};

export default serviceService;
