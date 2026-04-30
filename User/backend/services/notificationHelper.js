const { Notification } = require('../models');

/**
 * Notification Helper Service
 * Centralized utility for creating notifications across the application
 */

class NotificationHelper {
  /**
   * Create a notification
   * @param {string} userId - User ID to receive notification
   * @param {string} type - Notification type (order, payment, shipping, etc.)
   * @param {object} options - Additional notification details
   * @returns {Promise<object>} - Created notification document
   */
  static async createNotification(userId, type, options = {}) {
    try {
      const {
        title = '',
        message = '',
        actionUrl = null,
        actionText = 'View Details',
        data = {}
      } = options;

      // Validate required fields
      if (!userId || !title || !message) {
        console.error('❌ Invalid notification parameters:', {
          userId,
          title,
          message
        });
        throw new Error('userId, title, and message are required');
      }

      // Create notification document
      const notification = new Notification({
        userId: userId.toString(),
        type,
        title,
        message,
        actionUrl: actionUrl || null,
        actionText: actionText || 'View Details',
        isRead: false,
        data: data || {}
      });

      // Save to database
      await notification.save();

      console.log('✅ Notification created:', {
        id: notification._id,
        userId: notification.userId,
        type: notification.type,
        title: notification.title
      });

      return notification;
    } catch (error) {
      console.error('❌ Error creating notification:', error.message);
      throw error;
    }
  }

  /**
   * Order created notification
   */
  static async notifyOrderCreated(userId, order) {
    try {
      const title = '✅ Order Created';
      const message = `Your order #${order.orderNumber} has been created. Total: ₹${order.pricing?.total || 0}`;
      const actionUrl = `/orders/${order._id}`;

      return await this.createNotification(userId, 'order', {
        title,
        message,
        actionUrl,
        actionText: 'View Order',
        data: {
          orderId: order._id,
          orderNumber: order.orderNumber,
          total: order.pricing?.total
        }
      });
    } catch (error) {
      console.error('❌ Error notifying order created:', error);
      throw error;
    }
  }

  /**
   * Payment received notification
   */
  static async notifyPaymentReceived(userId, order) {
    try {
      const title = '💳 Payment Received';
      const message = `Payment of ₹${order.pricing?.total || 0} for order #${order.orderNumber} has been confirmed. Your order will be processed soon.`;
      const actionUrl = `/orders/${order._id}`;

      return await this.createNotification(userId, 'payment', {
        title,
        message,
        actionUrl,
        actionText: 'View Order',
        data: {
          orderId: order._id,
          orderNumber: order.orderNumber,
          amount: order.pricing?.total,
          paymentMethod: order.paymentMethod
        }
      });
    } catch (error) {
      console.error('❌ Error notifying payment received:', error);
      throw error;
    }
  }

  /**
   * Order confirmed notification
   */
  static async notifyOrderConfirmed(userId, order) {
    try {
      const title = '📦 Order Confirmed';
      const message = `Your order #${order.orderNumber} has been confirmed and is being prepared for delivery.`;
      const actionUrl = `/orders/${order._id}`;

      return await this.createNotification(userId, 'order', {
        title,
        message,
        actionUrl,
        actionText: 'Track Order',
        data: {
          orderId: order._id,
          orderNumber: order.orderNumber,
          status: order.status
        }
      });
    } catch (error) {
      console.error('❌ Error notifying order confirmed:', error);
      throw error;
    }
  }

  /**
   * Order shipped notification
   */
  static async notifyOrderShipped(userId, order) {
    try {
      const title = '🚚 Order Shipped';
      const message = `Your order #${order.orderNumber} has been shipped! Track your delivery now.`;
      const actionUrl = `/orders/${order._id}`;

      return await this.createNotification(userId, 'shipping', {
        title,
        message,
        actionUrl,
        actionText: 'Track Delivery',
        data: {
          orderId: order._id,
          orderNumber: order.orderNumber,
          trackingNumber: order.trackingNumber
        }
      });
    } catch (error) {
      console.error('❌ Error notifying order shipped:', error);
      throw error;
    }
  }

  /**
   * Order delivered notification
   */
  static async notifyOrderDelivered(userId, order) {
    try {
      const title = '🎉 Order Delivered';
      const message = `Your order #${order.orderNumber} has been delivered! Thank you for shopping with us.`;
      const actionUrl = `/orders/${order._id}`;

      return await this.createNotification(userId, 'order_delivered', {
        title,
        message,
        actionUrl,
        actionText: 'Rate Product',
        data: {
          orderId: order._id,
          orderNumber: order.orderNumber,
          status: 'delivered'
        }
      });
    } catch (error) {
      console.error('❌ Error notifying order delivered:', error);
      throw error;
    }
  }

  /**
   * Order cancelled notification
   */
  static async notifyOrderCancelled(userId, order, reason = '') {
    try {
      const title = '❌ Order Cancelled';
      const refundAmount = order.pricing?.total || 0;
      const message = `Your order #${order.orderNumber} has been cancelled. Refund of ₹${refundAmount} will be processed.${reason ? ` Reason: ${reason}` : ''}`;
      const actionUrl = `/orders/${order._id}`;

      return await this.createNotification(userId, 'order', {
        title,
        message,
        actionUrl,
        actionText: 'View Order',
        data: {
          orderId: order._id,
          orderNumber: order.orderNumber,
          refundAmount: refundAmount,
          reason: reason
        }
      });
    } catch (error) {
      console.error('❌ Error notifying order cancelled:', error);
      throw error;
    }
  }

  /**
   * Product arrival notification
   */
  static async notifyProductArrival(userId, productName) {
    try {
      const title = '🎁 Product Back in Stock';
      const message = `${productName} is now back in stock! Shop now before it runs out again.`;
      const actionUrl = `/products?search=${encodeURIComponent(productName)}`;

      return await this.createNotification(userId, 'product_arrival', {
        title,
        message,
        actionUrl,
        actionText: 'Shop Now',
        data: {
          productName: productName
        }
      });
    } catch (error) {
      console.error('❌ Error notifying product arrival:', error);
      throw error;
    }
  }

  /**
   * Promotional notification
   */
  static async notifyPromotion(userId, promoTitle, promoMessage, actionUrl = '/') {
    try {
      return await this.createNotification(userId, 'promotion', {
        title: promoTitle,
        message: promoMessage,
        actionUrl,
        actionText: 'View Offer',
        data: {
          promotionTitle: promoTitle
        }
      });
    } catch (error) {
      console.error('❌ Error notifying promotion:', error);
      throw error;
    }
  }

  /**
   * System notification
   */
  static async notifySystemMessage(userId, title, message, actionUrl = null) {
    try {
      return await this.createNotification(userId, 'order', {
        title,
        message,
        actionUrl,
        actionText: 'View',
        data: {}
      });
    } catch (error) {
      console.error('❌ Error notifying system message:', error);
      throw error;
    }
  }

  /**
   * Get unread notifications count
   */
  static async getUnreadCount(userId) {
    try {
      const count = await Notification.countDocuments({
        userId: userId.toString(),
        isRead: false
      });
      return count;
    } catch (error) {
      console.error('❌ Error getting unread count:', error);
      return 0;
    }
  }

  /**
   * Mark notification as read
   */
  static async markAsRead(notificationId, userId) {
    try {
      const notification = await Notification.findOneAndUpdate(
        { _id: notificationId, userId: userId.toString() },
        { isRead: true, updatedAt: new Date() },
        { new: true }
      );
      return notification;
    } catch (error) {
      console.error('❌ Error marking notification as read:', error);
      throw error;
    }
  }

  /**
   * Mark all notifications as read
   */
  static async markAllAsRead(userId) {
    try {
      const result = await Notification.updateMany(
        { userId: userId.toString(), isRead: false },
        { isRead: true, updatedAt: new Date() }
      );
      return result;
    } catch (error) {
      console.error('❌ Error marking all as read:', error);
      throw error;
    }
  }

  /**
   * Delete notification
   */
  static async deleteNotification(notificationId, userId) {
    try {
      const notification = await Notification.findOneAndDelete({
        _id: notificationId,
        userId: userId.toString()
      });
      return notification;
    } catch (error) {
      console.error('❌ Error deleting notification:', error);
      throw error;
    }
  }

  /**
   * Clear all notifications for user
   */
  static async clearAllNotifications(userId) {
    try {
      const result = await Notification.deleteMany({
        userId: userId.toString()
      });
      return result;
    } catch (error) {
      console.error('❌ Error clearing notifications:', error);
      throw error;
    }
  }
}

module.exports = NotificationHelper;
