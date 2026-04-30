import apiService from "./api";
import { cachedApiCall } from "../utils/apiCache";

const orderService = {
  // Get all user orders (with caching)
  getOrders: async (params = {}) => {
    return cachedApiCall("orders", async () => {
      try {
        const response = await apiService.getOrders(params);
        return response;
      } catch (error) {
        console.error("Error fetching orders:", error);
        throw error;
      }
    });
  },

  // Get order by ID
  getOrder: async (id) => {
    try {
      const response = await apiService.getOrder(id);
      return response;
    } catch (error) {
      console.error("Error fetching order:", error);
      throw error;
    }
  },

  // Create new order
  createOrder: async (orderData) => {
    try {
      const response = await apiService.createOrder(orderData);
      return response;
    } catch (error) {
      console.error("Error creating order:", error);
      throw error;
    }
  },

  // Create service booking
  createServiceBooking: async (bookingData) => {
    try {
      const response = await apiService.post("/orders/booking", bookingData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });
      return response;
    } catch (error) {
      console.error("Error creating service booking:", error);
      throw error;
    }
  },

  // Cancel order
  cancelOrder: async (orderId, reason) => {
    try {
      const response = await apiService.put(`/orders/${orderId}/cancel`, {
        reason,
      });
      return response;
    } catch (error) {
      console.error("Error cancelling order:", error);
      throw error;
    }
  },

  // Track order
  trackOrder: async (orderNumber) => {
    try {
      const response = await apiService.get(`/orders/track/${orderNumber}`);
      return response;
    } catch (error) {
      console.error("Error tracking order:", error);
      throw error;
    }
  },

  // Update order status
  updateOrderStatus: async (orderId, status) => {
    try {
      const response = await apiService.updateOrderStatus(orderId, status);
      return response;
    } catch (error) {
      console.error("Error updating order status:", error);
      throw error;
    }
  },

  // Get order history
  getOrderHistory: async (params = {}) => {
    try {
      const response = await apiService.get("/orders/history", { params });
      return response;
    } catch (error) {
      console.error("Error fetching order history:", error);
      throw error;
    }
  },

  // Get order statistics
  getOrderStatistics: async () => {
    try {
      const response = await apiService.get("/orders/statistics");
      return response;
    } catch (error) {
      console.error("Error fetching order statistics:", error);
      throw error;
    }
  },

  // Reorder items from previous order
  reorderItems: async (orderId) => {
    try {
      const response = await apiService.post(`/orders/${orderId}/reorder`);
      return response;
    } catch (error) {
      console.error("Error reordering items:", error);
      throw error;
    }
  },

  // Get order invoice
  getOrderInvoice: async (orderId) => {
    try {
      const response = await apiService.get(`/orders/${orderId}/invoice`);
      return response;
    } catch (error) {
      console.error("Error fetching order invoice:", error);
      throw error;
    }
  },

  // Request order return
  requestReturn: async (orderId, returnData) => {
    try {
      const response = await apiService.post(
        `/orders/${orderId}/return`,
        returnData,
      );
      return response;
    } catch (error) {
      console.error("Error requesting return:", error);
      throw error;
    }
  },

  // Get return status
  getReturnStatus: async (orderId) => {
    try {
      const response = await apiService.get(`/orders/${orderId}/return-status`);
      return response;
    } catch (error) {
      console.error("Error fetching return status:", error);
      throw error;
    }
  },

  // Apply discount code to order
  applyDiscountCode: async (orderId, discountCode) => {
    try {
      const response = await apiService.post(
        `/orders/${orderId}/apply-discount`,
        {
          discountCode,
        },
      );
      return response;
    } catch (error) {
      console.error("Error applying discount code:", error);
      throw error;
    }
  },

  // Remove discount code from order
  removeDiscountCode: async (orderId) => {
    try {
      const response = await apiService.delete(`/orders/${orderId}/discount`);
      return response;
    } catch (error) {
      console.error("Error removing discount code:", error);
      throw error;
    }
  },

  // Update shipping address
  updateShippingAddress: async (orderId, addressData) => {
    try {
      const response = await apiService.put(
        `/orders/${orderId}/shipping-address`,
        addressData,
      );
      return response;
    } catch (error) {
      console.error("Error updating shipping address:", error);
      throw error;
    }
  },

  // Schedule delivery
  scheduleDelivery: async (orderId, deliveryData) => {
    try {
      const response = await apiService.post(
        `/orders/${orderId}/schedule-delivery`,
        deliveryData,
      );
      return response;
    } catch (error) {
      console.error("Error scheduling delivery:", error);
      throw error;
    }
  },
};

export default orderService;
