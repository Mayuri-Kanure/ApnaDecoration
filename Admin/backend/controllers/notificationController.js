const Notification = require('../models/Notification');

// GET all notifications for a user
exports.getUserNotifications = async (req, res) => {
  try {
    const { page = 1, limit = 20, unread = false } = req.query;
    const userId = req.user.id;

    const query = { userId: userId };
    if (unread === 'true') {
      query.isRead = false;
    }

    const notifications = await Notification.find(query)
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .populate('userId', 'username email firstName lastName');

    const total = await Notification.countDocuments(query);
    const unreadCount = await Notification.getUnreadCount(userId);

    res.json({
      notifications,
      pagination: {
        currentPage: page,
        totalPages: Math.ceil(total / limit),
        totalItems: total,
        itemsPerPage: limit
      },
      unreadCount
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// GET unread notifications count
exports.getUnreadCount = async (req, res) => {
  try {
    const userId = req.user.id;
    const count = await Notification.countDocuments({ userId: userId, isRead: false });

    res.json({ unreadCount: count });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// MARK notification as read
exports.markAsRead = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    const result = await Notification.updateOne(
      { _id: id, userId: userId },
      { isRead: true }
    );

    if (result.modifiedCount === 0) {
      return res.status(404).json({ message: 'Notification not found or already read' });
    }

    res.json({ message: 'Notification marked as read' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// MARK all notifications as read for user
exports.markAllAsRead = async (req, res) => {
  try {
    const userId = req.user.id;
    const result = await Notification.updateMany(
      { userId: userId, isRead: false },
      { isRead: true }
    );

    res.json({ 
      message: 'All notifications marked as read',
      count: result.modifiedCount
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// CREATE notification (admin only)
exports.createNotification = async (req, res) => {
  try {
    const { userId, title, message, type, actionUrl } = req.body;

    const notification = new Notification({
      userId,
      title,
      message,
      type,
      actionUrl
    });

    await notification.save();

    res.status(201).json({
      message: 'Notification created successfully',
      notification
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// DELETE notification
exports.deleteNotification = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    const notification = await Notification.findOneAndDelete({
      _id: id,
      userId: userId
    });

    if (!notification) {
      return res.status(404).json({ message: 'Notification not found' });
    }

    res.json({ message: 'Notification deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// BROADCAST notification to all users (admin only)
exports.broadcastNotification = async (req, res) => {
  try {
    const { title, message, type = 'promotion', imageUrl } = req.body;

    // Get all users
    const User = require('../models/User');
    const users = await User.find({});

    // Create notification for each user
    const notifications = users.map(user => ({
      userId: user._id,
      title,
      message,
      type,
      imageUrl: imageUrl || null,
      isRead: false,
      actionUrl: null,
      createdAt: new Date(),
      updatedAt: new Date()
    }));

    // Insert all notifications
    const result = await Notification.insertMany(notifications);

    res.status(201).json({
      message: 'Broadcast notification sent successfully',
      sentTo: users.length,
      notificationsCreated: result.length
    });
  } catch (error) {
    console.error('Broadcast notification error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Helper function to send vendor notifications
exports.sendVendorNotification = async (vendorId, type, data) => {
  try {
    let title, message;

    switch (type) {
      case 'product_approved':
        title = 'Product Approved';
        message = `Your product "${data.product.name}" has been approved and is now live.`;
        break;
      case 'product_denied':
        title = 'Product Denied';
        message = `Your product "${data.product.name}" has been denied. Reason: ${data.reason}`;
        break;
      case 'product_needs_changes':
        title = 'Product Needs Changes';
        message = `Your product "${data.product.name}" requires some changes. Please review the admin notes.`;
        break;
      default:
        title = 'Notification';
        message = 'You have a new notification';
    }

    await Notification.createNotification({
      recipient: vendorId,
      type,
      title,
      message,
      relatedEntity: {
        entityType: 'VendorProduct',
        entityId: data.product._id
      },
      data,
      priority: type === 'product_denied' ? 'high' : 'medium',
      actionUrl: `/vendor-products/${data.product._id}`,
      actionText: 'View Product'
    });

    return true;
  } catch (error) {
    console.error('Failed to send vendor notification:', error);
    return false;
  }
};
