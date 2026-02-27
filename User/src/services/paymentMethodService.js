import apiService from './api';

const paymentMethodService = {
  // Get all user payment methods
  getPaymentMethods: async () => {
    try {
      const response = await apiService.getPaymentMethods();
      return response;
    } catch (error) {
      console.error('Error fetching payment methods:', error);
      throw error;
    }
  },

  // Get payment method by ID
  getPaymentMethod: async (id) => {
    try {
      const response = await apiService.getPaymentMethod(id);
      return response;
    } catch (error) {
      console.error('Error fetching payment method:', error);
      throw error;
    }
  },

  // Create new payment method
  createPaymentMethod: async (paymentData) => {
    try {
      const response = await apiService.createPaymentMethod(paymentData);
      return response;
    } catch (error) {
      console.error('Error creating payment method:', error);
      throw error;
    }
  },

  // Update payment method
  updatePaymentMethod: async (id, paymentData) => {
    try {
      const response = await apiService.updatePaymentMethod(id, paymentData);
      return response;
    } catch (error) {
      console.error('Error updating payment method:', error);
      throw error;
    }
  },

  // Delete payment method
  deletePaymentMethod: async (id) => {
    try {
      const response = await apiService.deletePaymentMethod(id);
      return response;
    } catch (error) {
      console.error('Error deleting payment method:', error);
      throw error;
    }
  },

  // Set default payment method
  setDefaultPaymentMethod: async (id) => {
    try {
      const response = await apiService.setDefaultPaymentMethod(id);
      return response;
    } catch (error) {
      console.error('Error setting default payment method:', error);
      throw error;
    }
  },

  // Get default payment method
  getDefaultPaymentMethod: async () => {
    try {
      const response = await apiService.get('/payment-methods/default');
      return response;
    } catch (error) {
      console.error('Error fetching default payment method:', error);
      throw error;
    }
  },

  // Validate payment method
  validatePaymentMethod: async (paymentData) => {
    try {
      const response = await apiService.post('/payment-methods/validate', paymentData);
      return response;
    } catch (error) {
      console.error('Error validating payment method:', error);
      throw error;
    }
  },

  // Process payment
  processPayment: async (paymentData) => {
    try {
      const response = await apiService.post('/payment-methods/process', paymentData);
      return response;
    } catch (error) {
      console.error('Error processing payment:', error);
      throw error;
    }
  },

  // Get payment method types
  getPaymentMethodTypes: async () => {
    try {
      const response = await apiService.get('/payment-methods/types');
      return response;
    } catch (error) {
      console.error('Error fetching payment method types:', error);
      throw error;
    }
  },

  // Add credit card
  addCreditCard: async (cardData) => {
    try {
      const response = await apiService.post('/payment-methods/credit-card', cardData);
      return response;
    } catch (error) {
      console.error('Error adding credit card:', error);
      throw error;
    }
  },

  // Add bank account
  addBankAccount: async (bankData) => {
    try {
      const response = await apiService.post('/payment-methods/bank-account', bankData);
      return response;
    } catch (error) {
      console.error('Error adding bank account:', error);
      throw error;
    }
  },

  // Add UPI payment method
  addUPI: async (upiData) => {
    try {
      const response = await apiService.post('/payment-methods/upi', upiData);
      return response;
    } catch (error) {
      console.error('Error adding UPI method:', error);
      throw error;
    }
  },

  // Add digital wallet
  addDigitalWallet: async (walletData) => {
    try {
      const response = await apiService.post('/payment-methods/digital-wallet', walletData);
      return response;
    } catch (error) {
      console.error('Error adding digital wallet:', error);
      throw error;
    }
  },

  // Get payment history
  getPaymentHistory: async (params = {}) => {
    try {
      const response = await apiService.get('/payment-methods/history', { params });
      return response;
    } catch (error) {
      console.error('Error fetching payment history:', error);
      throw error;
    }
  },

  // Refund payment
  refundPayment: async (paymentId, refundData) => {
    try {
      const response = await apiService.post(`/payment-methods/${paymentId}/refund`, refundData);
      return response;
    } catch (error) {
      console.error('Error processing refund:', error);
      throw error;
    }
  },

  // Get refund status
  getRefundStatus: async (refundId) => {
    try {
      const response = await apiService.get(`/payment-methods/refunds/${refundId}`);
      return response;
    } catch (error) {
      console.error('Error fetching refund status:', error);
      throw error;
    }
  },
};

export default paymentMethodService;
