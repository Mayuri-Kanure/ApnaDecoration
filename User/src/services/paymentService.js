import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_BASE_URL ? `${process.env.REACT_APP_API_BASE_URL}/payments` : 'https://user-api.apnadecoration.com/payments';

class PaymentService {
  // Get Razorpay Key
  async getRazorpayKey() {
    try {
      const response = await axios.get(`${API_BASE_URL}/key`);
      return response.data;
    } catch (error) {
      console.error('❌ Error getting Razorpay key:', error);
      throw error;
    }
  }

  // Create Razorpay Order
  async createRazorpayOrder(orderId, amount) {
    try {
      const response = await axios.post(`${API_BASE_URL}/payments/create-order`, {
        orderId,
        amount
      });
      return response.data;
    } catch (error) {
      console.error('❌ Error creating Razorpay order:', error);
      throw error;
    }
  }

  // Verify Payment
  async verifyPayment(paymentData) {
    try {
      const response = await axios.post(`${API_BASE_URL}/payments/verify`, paymentData);
      return response.data;
    } catch (error) {
      console.error('❌ Error verifying payment:', error);
      throw error;
    }
  }

  // Process Refund
  async processRefund(orderId, refundAmount, reason) {
    try {
      const response = await axios.post(`${API_BASE_URL}/payments/refund`, {
        orderId,
        refundAmount,
        reason
      });
      return response.data;
    } catch (error) {
      console.error('❌ Error processing refund:', error);
      throw error;
    }
  }

  // Get Payment Details
  async getPaymentDetails(paymentId) {
    try {
      const response = await axios.get(`${API_BASE_URL}/payments/payment/${paymentId}`);
      return response.data;
    } catch (error) {
      console.error('❌ Error getting payment details:', error);
      throw error;
    }
  }

  // Get Order Payment History
  async getOrderPaymentHistory(orderId) {
    try {
      const response = await axios.get(`${API_BASE_URL}/payments/order/${orderId}/history`);
      return response.data;
    } catch (error) {
      console.error('❌ Error getting payment history:', error);
      throw error;
    }
  }

  // Initialize Razorpay
  initializeRazorpay(options) {
    return new Promise((resolve, reject) => {
      // Load Razorpay script if not already loaded
      if (!window.Razorpay) {
        const script = document.createElement('script');
        script.src = 'https://checkout.razorpay.com/v1/razorpay.js';
        script.async = true;
        script.onload = () => {
          resolve(new window.Razorpay(options));
        };
        script.onerror = () => {
          reject(new Error('Failed to load Razorpay SDK'));
        };
        document.body.appendChild(script);
      } else {
        resolve(new window.Razorpay(options));
      }
    });
  }

  // Open Razorpay Checkout
  async openRazorpayCheckout(orderData, orderDetails) {
    try {
      console.log('🔧 Opening Razorpay checkout:', orderData);

      const options = {
        key: orderData.keyId,
        amount: orderData.order.amount,
        currency: orderData.order.currency,
        name: 'APNA DECORATION',
        description: `Payment for Order #${orderDetails.orderId}`,
        order_id: orderData.order.id,
        prefill: {
          name: orderDetails.customerName || 'Customer',
          email: orderDetails.customerEmail || '',
          contact: orderDetails.customerPhone || ''
        },
        theme: {
          color: '#2F66FF'
        },
        modal: {
          ondismiss: function() {
            console.log('🔍 Razorpay modal dismissed');
            return false;
          }
        },
        handler: async function(response) {
          console.log('✅ Razorpay payment successful:', response);
          
          try {
            const verificationData = {
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
              orderId: orderDetails.orderId
            };

            const verification = await paymentService.verifyPayment(verificationData);
            console.log('✅ Payment verified:', verification);
            
            // Trigger success callback
            if (orderDetails.onSuccess) {
              orderDetails.onSuccess(verification);
            }
            
            return verification;
          } catch (error) {
            console.error('❌ Payment verification failed:', error);
            
            // Trigger error callback
            if (orderDetails.onError) {
              orderDetails.onError(error);
            }
            
            throw error;
          }
        }
      };

      const razorpay = await this.initializeRazorpay(options);
      razorpay.open();

    } catch (error) {
      console.error('❌ Error opening Razorpay checkout:', error);
      throw error;
    }
  }
}

const paymentService = new PaymentService();
export default paymentService;
