const Chat = require('../models/Chat');
const Conversation = require('../models/Conversation');

exports.sendMessage = async (req, res) => {
  try {
    const {
      conversationId,
      recipientId,
      message,
      messageType = 'text',
      fileUrl,
      fileName,
      fileSize,
      metadata,
    } = req.body;

    const senderId = req.user.id;
    const senderType = req.user.role;

    // Create chat message
    const newMessage = new Chat({
      conversationId,
      sender: {
        userId: senderId,
        name: req.user.name,
        type: senderType,
        avatar: req.user.avatar,
      },
      recipient: {
        userId: recipientId,
        type: req.body.recipientType,
      },
      message,
      messageType,
      fileUrl,
      fileName,
      fileSize,
      metadata,
      status: 'sent',
    });

    await newMessage.save();

    // Update conversation
    await Conversation.findOneAndUpdate(
      { conversationId },
      {
        lastMessage: {
          text: message,
          sender: senderId,
          sentAt: new Date(),
        },
        updatedAt: new Date(),
      },
      { upsert: true }
    );

    res.status(201).json({
      success: true,
      message: 'Message sent successfully',
      data: newMessage,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error sending message',
      error: error.message,
    });
  }
};

exports.getConversation = async (req, res) => {
  try {
    const { conversationId } = req.params;
    const userId = req.user.id;

    const messages = await Chat.find({ conversationId })
      .sort({ createdAt: -1 })
      .limit(50);

    // Mark messages as read
    await Chat.updateMany(
      {
        conversationId,
        'recipient.userId': userId,
        read: false,
      },
      {
        read: true,
        readAt: new Date(),
        status: 'read',
      }
    );

    res.status(200).json({
      success: true,
      data: messages.reverse(),
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching conversation',
      error: error.message,
    });
  }
};

exports.getConversations = async (req, res) => {
  try {
    const userId = req.user.id;

    const conversations = await Conversation.find({
      'participants.userId': userId,
      isActive: true,
    }).sort({ updatedAt: -1 });

    // Get unread count for each conversation
    const conversationsWithUnread = await Promise.all(
      conversations.map(async (conv) => {
        const unreadCount = await Chat.countDocuments({
          conversationId: conv.conversationId,
          'recipient.userId': userId,
          read: false,
        });

        return {
          ...conv.toObject(),
          unreadCount,
        };
      })
    );

    res.status(200).json({
      success: true,
      data: conversationsWithUnread,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching conversations',
      error: error.message,
    });
  }
};

exports.createConversation = async (req, res) => {
  try {
    const {
      recipientId,
      recipientType,
      conversationType = 'direct',
      metadata,
    } = req.body;

    const userId = req.user.id;
    const userType = req.user.role;

    // Generate conversation ID
    const conversationId = `${[userId, recipientId].sort().join('_')}_${Date.now()}`;

    const newConversation = new Conversation({
      conversationId,
      participants: [
        {
          userId,
          userType,
          name: req.user.name,
          avatar: req.user.avatar,
        },
        {
          userId: recipientId,
          userType: recipientType,
        },
      ],
      conversationType,
      metadata,
    });

    await newConversation.save();

    res.status(201).json({
      success: true,
      message: 'Conversation created',
      data: newConversation,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error creating conversation',
      error: error.message,
    });
  }
};

exports.markAsRead = async (req, res) => {
  try {
    const { conversationId } = req.params;
    const userId = req.user.id;

    await Chat.updateMany(
      {
        conversationId,
        'recipient.userId': userId,
        read: false,
      },
      {
        read: true,
        readAt: new Date(),
        status: 'read',
      }
    );

    res.status(200).json({
      success: true,
      message: 'Messages marked as read',
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error marking messages as read',
      error: error.message,
    });
  }
};

exports.getUnreadCount = async (req, res) => {
  try {
    const userId = req.user.id;

    const unreadCount = await Chat.countDocuments({
      'recipient.userId': userId,
      read: false,
    });

    const unreadByConversation = await Chat.aggregate([
      {
        $match: {
          'recipient.userId': userId,
          read: false,
        },
      },
      {
        $group: {
          _id: '$conversationId',
          count: { $sum: 1 },
        },
      },
    ]);

    res.status(200).json({
      success: true,
      data: {
        totalUnread: unreadCount,
        byConversation: unreadByConversation,
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching unread count',
      error: error.message,
    });
  }
};

exports.deleteMessage = async (req, res) => {
  try {
    const { messageId } = req.params;
    const userId = req.user.id;

    const message = await Chat.findById(messageId);

    if (!message) {
      return res.status(404).json({
        success: false,
        message: 'Message not found',
      });
    }

    if (message.sender.userId !== userId) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to delete this message',
      });
    }

    await Chat.findByIdAndDelete(messageId);

    res.status(200).json({
      success: true,
      message: 'Message deleted',
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error deleting message',
      error: error.message,
    });
  }
};

exports.searchMessages = async (req, res) => {
  try {
    const { conversationId, query } = req.query;
    const userId = req.user.id;

    const searchFilter = {
      conversationId,
      $or: [
        { message: { $regex: query, $options: 'i' } },
        { fileName: { $regex: query, $options: 'i' } },
      ],
    };

    const messages = await Chat.find(searchFilter)
      .sort({ createdAt: -1 })
      .limit(20);

    res.status(200).json({
      success: true,
      data: messages,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error searching messages',
      error: error.message,
    });
  }
};
