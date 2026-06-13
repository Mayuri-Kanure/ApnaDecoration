const mongoose = require('mongoose');

const conversationSchema = new mongoose.Schema(
  {
    conversationId: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },
    participants: [
      {
        userId: String,
        userType: {
          type: String,
          enum: ['user', 'admin', 'vendor', 'delivery_boy'],
        },
        name: String,
        avatar: String,
        joinedAt: {
          type: Date,
          default: Date.now,
        },
      },
    ],
    title: String, // Optional: for group chats or specific conversations
    conversationType: {
      type: String,
      enum: ['direct', 'order_support', 'vendor_inquiry', 'delivery_chat'],
      default: 'direct',
    },
    metadata: {
      orderId: String,
      ticketId: String,
      vendorId: String,
      deliveryId: String,
    },
    lastMessage: {
      text: String,
      sender: String,
      sentAt: Date,
    },
    unreadCount: {
      type: Map,
      of: Number,
      default: new Map(),
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    isMuted: {
      type: Map,
      of: Boolean,
      default: new Map(),
    },
    isPinned: {
      type: Map,
      of: Boolean,
      default: new Map(),
    },
  },
  { timestamps: true }
);

// Index for user conversations
conversationSchema.index({ 'participants.userId': 1 });
conversationSchema.index({ isActive: 1, updatedAt: -1 });

const Conversation = mongoose.model('Conversation', conversationSchema);

module.exports = Conversation;
