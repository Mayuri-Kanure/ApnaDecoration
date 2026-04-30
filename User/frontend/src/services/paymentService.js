import axios from "axios";
import { API_BASE_URL } from "../config/constants";

// Import the authenticated API instance
import api from "./api";

class PaymentService {
  // Get Razorpay Key
  async getRazorpayKey() {
    try {
      const response = await api.get(`/payments/key`);
      return response; // ✅ FIX: api.js already returns response.data
    } catch (error) {
      console.error("❌ Error getting Razorpay key:", error);
      throw error;
    }
  }

  // Create Razorpay Order
  async createRazorpayOrder(orderId, amount) {
    try {
      // Validate input parameters
      if (!orderId || typeof orderId !== "string") {
        throw new Error("Valid Order ID is required");
      }

      if (!amount || typeof amount !== "number" || amount <= 0) {
        throw new Error("Valid amount is required");
      }

      console.log("🔧 Creating Razorpay order with:", { orderId, amount });

      const response = await api.post(`/payments/create-order`, {
        orderId,
        amount,
      });

      console.log("✅ Razorpay order created successfully:", response);
      return response; // ✅ FIX: api.js already returns response.data
    } catch (error) {
      console.error("❌ Error creating Razorpay order:", error);
      console.error("❌ Error details:", {
        message: error.message,
        status: error.response?.status,
        statusText: error.response?.statusText,
        data: error.response?.data,
      });

      // Provide more specific error message based on response
      let errorMessage = "Failed to create payment order";

      if (error.response?.data?.message) {
        errorMessage = error.response.data.message;
      } else if (error.response?.data?.error?.description) {
        errorMessage = error.response.data.error.description;
      } else if (error.message) {
        errorMessage = error.message;
      }

      // Add status information if available
      if (error.response?.status) {
        errorMessage += ` (Status: ${error.response.status})`;
      }

      throw new Error(errorMessage);
    }
  }

  // Verify Payment
  async verifyPayment(paymentData) {
    try {
      const response = await api.post(`/payments/verify`, paymentData);
      return response.data;
    } catch (error) {
      console.error("❌ Error verifying payment:", error);
      throw error;
    }
  }

  // Process Refund
  async processRefund(orderId, refundAmount, reason) {
    try {
      const response = await api.post(`/payments/refund`, {
        orderId,
        refundAmount,
        reason,
      });
      return response.data;
    } catch (error) {
      console.error("❌ Error processing refund:", error);
      throw error;
    }
  }

  // Get Payment Details
  async getPaymentDetails(paymentId) {
    try {
      const response = await api.get(`/payments/payment/${paymentId}`);
      return response.data;
    } catch (error) {
      console.error("❌ Error getting payment details:", error);
      throw error;
    }
  }

  // Get Order Payment History
  async getOrderPaymentHistory(orderId) {
    try {
      const response = await api.get(`/payments/order/${orderId}/history`);
      return response.data;
    } catch (error) {
      console.error("❌ Error getting payment history:", error);
      throw error;
    }
  }

  // Initialize Razorpay
  async initializeRazorpay(options) {
    console.log(" Initializing Razorpay with options:", options);

    return new Promise((resolve, reject) => {
      // Load Razorpay script if not already loaded
      if (!window.Razorpay) {
        console.log(" Loading Razorpay script...");
        const script = document.createElement("script");
        script.src = "https://checkout.razorpay.com/v1/checkout.js";
        script.async = true;
        script.onload = () => {
          console.log(" Razorpay script loaded");
          console.log(" window.Razorpay:", window.Razorpay);
          console.log(" typeof window.Razorpay:", typeof window.Razorpay);

          if (!window.Razorpay) {
            console.error(" Razorpay SDK failed to load");
            reject(new Error("Razorpay SDK failed to load"));
            return;
          }

          const razorpayInstance = new window.Razorpay(options);
          console.log(" Razorpay instance created:", razorpayInstance);
          console.log(" Razorpay instance type:", typeof razorpayInstance);
          console.log(" Razorpay.open method:", typeof razorpayInstance.open);

          resolve(razorpayInstance);
        };
        script.onerror = (error) => {
          console.error(" Failed to load Razorpay script:", error);
          reject(new Error("Failed to load Razorpay SDK"));
        };
        document.body.appendChild(script);
      } else {
        console.log(" Razorpay already loaded, creating instance...");
        const razorpayInstance = new window.Razorpay(options);
        console.log(" Razorpay instance created (existing):", razorpayInstance);
        console.log(" Razorpay instance type:", typeof razorpayInstance);
        console.log(" Razorpay.open method:", typeof razorpayInstance.open);
        resolve(razorpayInstance);
      }
    });
  }

  // Open Razorpay Checkout
  async openRazorpayCheckout(orderData, orderDetails) {
    try {
      console.log("🔧 Opening Razorpay checkout:", orderData);

      const options = {
        key: orderData.keyId,
        amount: orderData.order.amount,
        currency: orderData.order.currency,
        name: "APNA DECORATION",
        description: `Payment for Order #${orderDetails.orderId}`,
        order_id: orderData.order.id,
        prefill: {
          name: orderDetails.customerName || "Customer",
          email: orderDetails.customerEmail || "",
          contact: orderDetails.customerPhone || "",
        },
        theme: {
          color: "#2F66FF",
        },
        modal: {
          ondismiss: function () {
            console.log("🔍 Razorpay modal dismissed");
            return false;
          },
        },
        handler: async function (response) {
          console.log("✅ Razorpay payment successful:", response);

          try {
            const verificationData = {
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
              orderId: orderDetails.orderId,
            };

            const verification =
              await paymentService.verifyPayment(verificationData);
            console.log("✅ Payment verified:", verification);

            // Trigger success callback
            if (orderDetails.onSuccess) {
              orderDetails.onSuccess(verification);
            }

            return verification;
          } catch (error) {
            console.error("❌ Payment verification failed:", error);

            // Trigger error callback
            if (orderDetails.onError) {
              orderDetails.onError(error);
            }

            throw error;
          }
        },
      };

      const razorpay = await this.initializeRazorpay(options);
      razorpay.open();
    } catch (error) {
      console.error("❌ Error opening Razorpay checkout:", error);
      throw error;
    }
  }
}

const paymentService = new PaymentService();
export default paymentService;
