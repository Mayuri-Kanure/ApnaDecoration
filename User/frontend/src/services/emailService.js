import axios from "axios";
import { API_BASE_URL } from "../config/constants";

const API_BASE_URL_FINAL = API_BASE_URL;

class EmailService {
  // Send order confirmation email
  async sendOrderConfirmation(orderData) {
    const token = localStorage.getItem("token");
    const response = await axios.post(
      `${API_BASE_URL}/api/emails/order-confirmation`,
      {
        orderId: orderData._id,
        orderNumber: orderData.orderNumber,
        customerEmail: orderData.customerEmail,
        items: orderData.items,
        total: orderData.pricing?.total || orderData.total,
        shippingAddress: orderData.shippingAddress,
      },
      {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      },
    );
    return response.data;
  }

  // Send order status update email
  async sendOrderStatusUpdate(orderId, status, trackingInfo = null) {
    const token = localStorage.getItem("token");
    const response = await axios.post(
      `${API_BASE_URL}/api/emails/order-status`,
      {
        orderId: orderId,
        status: status,
        trackingInfo: trackingInfo,
      },
      {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      },
    );
    return response.data;
  }

  // Send booking confirmation email
  async sendBookingConfirmation(bookingData) {
    const token = localStorage.getItem("token");
    const response = await axios.post(
      `${API_BASE_URL}/api/emails/booking-confirmation`,
      {
        bookingId: bookingData._id,
        serviceType: bookingData.serviceType,
        customerEmail: bookingData.customerEmail,
        eventDate: bookingData.eventDate,
        eventTime: bookingData.eventTime,
        venue: bookingData.venue,
        total: bookingData.total,
      },
      {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      },
    );
    return response.data;
  }

  // Send promotional email
  async sendPromotionalEmail(emailData) {
    const token = localStorage.getItem("token");
    const response = await axios.post(
      `${API_BASE_URL}/api/emails/promotional`,
      emailData,
      {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      },
    );
    return response.data;
  }

  // Subscribe to newsletter
  async subscribeNewsletter(email) {
    const response = await axios.post(
      `${API_BASE_URL}/api/emails/newsletter/subscribe`,
      {
        email: email,
      },
    );
    return response.data;
  }

  // Unsubscribe from newsletter
  async unsubscribeNewsletter(email, token) {
    const response = await axios.post(
      `${API_BASE_URL}/api/emails/newsletter/unsubscribe`,
      {
        email: email,
        unsubscribeToken: token,
      },
    );
    return response.data;
  }

  // Send password reset email
  async sendPasswordReset(email) {
    const response = await axios.post(
      `${API_BASE_URL}/api/emails/password-reset`,
      {
        email: email,
      },
    );
    return response.data;
  }

  // Send welcome email
  async sendWelcomeEmail(userData) {
    const response = await axios.post(`${API_BASE_URL}/api/emails/welcome`, {
      email: userData.email,
      name: userData.name,
    });
    return response.data;
  }
}

const emailService = new EmailService();
export default emailService;
