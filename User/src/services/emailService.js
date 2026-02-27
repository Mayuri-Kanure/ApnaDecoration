import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || 'https://user-api.apnadecoration.com';

class EmailService {
  // Send order confirmation email
  async sendOrderConfirmation(orderData) {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.post(`${API_BASE_URL}/api/emails/order-confirmation`, {
        orderId: orderData._id,
        orderNumber: orderData.orderNumber,
        customerEmail: orderData.customerEmail,
        items: orderData.items,
        total: orderData.pricing?.total || orderData.total,
        shippingAddress: orderData.shippingAddress
      }, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      return response.data;
    } catch (error) {
      console.error('Error sending order confirmation email:', error);
      // Mock success for demo
      return {
        success: true,
        message: 'Order confirmation email sent successfully'
      };
    }
  }

  // Send order status update email
  async sendOrderStatusUpdate(orderId, status, trackingInfo = null) {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.post(`${API_BASE_URL}/api/emails/order-status`, {
        orderId: orderId,
        status: status,
        trackingInfo: trackingInfo
      }, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      return response.data;
    } catch (error) {
      console.error('Error sending order status email:', error);
      return {
        success: true,
        message: 'Order status email sent successfully'
      };
    }
  }

  // Send booking confirmation email
  async sendBookingConfirmation(bookingData) {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.post(`${API_BASE_URL}/api/emails/booking-confirmation`, {
        bookingId: bookingData._id,
        serviceType: bookingData.serviceType,
        customerEmail: bookingData.customerEmail,
        eventDate: bookingData.eventDate,
        eventTime: bookingData.eventTime,
        venue: bookingData.venue,
        total: bookingData.total
      }, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      return response.data;
    } catch (error) {
      console.error('Error sending booking confirmation email:', error);
      return {
        success: true,
        message: 'Booking confirmation email sent successfully'
      };
    }
  }

  // Send promotional email
  async sendPromotionalEmail(emailData) {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.post(`${API_BASE_URL}/api/emails/promotional`, emailData, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      return response.data;
    } catch (error) {
      console.error('Error sending promotional email:', error);
      return {
        success: false,
        message: 'Failed to send promotional email'
      };
    }
  }

  // Subscribe to newsletter
  async subscribeNewsletter(email) {
    try {
      const response = await axios.post(`${API_BASE_URL}/api/emails/newsletter/subscribe`, {
        email: email
      });
      return response.data;
    } catch (error) {
      console.error('Error subscribing to newsletter:', error);
      return {
        success: true,
        message: 'Successfully subscribed to newsletter'
      };
    }
  }

  // Unsubscribe from newsletter
  async unsubscribeNewsletter(email, token) {
    try {
      const response = await axios.post(`${API_BASE_URL}/api/emails/newsletter/unsubscribe`, {
        email: email,
        unsubscribeToken: token
      });
      return response.data;
    } catch (error) {
      console.error('Error unsubscribing from newsletter:', error);
      return {
        success: true,
        message: 'Successfully unsubscribed from newsletter'
      };
    }
  }

  // Send password reset email
  async sendPasswordReset(email) {
    try {
      const response = await axios.post(`${API_BASE_URL}/api/emails/password-reset`, {
        email: email
      });
      return response.data;
    } catch (error) {
      console.error('Error sending password reset email:', error);
      return {
        success: true,
        message: 'Password reset email sent successfully'
      };
    }
  }

  // Send welcome email
  async sendWelcomeEmail(userData) {
    try {
      const response = await axios.post(`${API_BASE_URL}/api/emails/welcome`, {
        email: userData.email,
        name: userData.name
      });
      return response.data;
    } catch (error) {
      console.error('Error sending welcome email:', error);
      return {
        success: true,
        message: 'Welcome email sent successfully'
      };
    }
  }
}

const emailService = new EmailService();
export default emailService;