import apiService from './api';

const bookingService = {
  // Create service booking
  createServiceBooking: async (bookingData) => {
    try {
      const response = await apiService.post('/orders/booking', bookingData);
      return response;
    } catch (error) {
      console.error('Error creating service booking:', error);
      throw error;
    }
  },

  // Get user's bookings
  getUserBookings: async (filters = {}) => {
    try {
      const response = await apiService.get('/orders', { params: filters });
      return response;
    } catch (error) {
      console.error('Error fetching bookings:', error);
      throw error;
    }
  },

  // Get booking by ID
  getBookingById: async (bookingId) => {
    try {
      const response = await apiService.get(`/orders/${bookingId}`);
      return response;
    } catch (error) {
      console.error('Error fetching booking:', error);
      throw error;
    }
  },

  // Cancel booking
  cancelBooking: async (bookingId, reason) => {
    try {
      const response = await apiService.put(`/orders/${bookingId}/cancel`, { reason });
      return response;
    } catch (error) {
      console.error('Error cancelling booking:', error);
      throw error;
    }
  }
};

export default bookingService;
