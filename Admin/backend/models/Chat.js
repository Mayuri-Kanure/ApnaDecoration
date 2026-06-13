const mongoose = require('mongoose');

const chatSchema = new mongoose.Schema(
  {
    conversationId: {
      type: String,
      required: true,
      index: true,
    },
    sender: {
      userId: String,
      name: String,
      type: {
        type: String,
        enum: ['user', 'admin', 'vendor', 'delivery_boy'],
      },
      avatar: String,
    },
    recipient: {
      userId: String,
      name: String,
      type: {
        type: String,
        enum: ['user', 'admin', 'vendor', 'delivery_boy'],
      },
      avatar: String,
    },
    message: {
      type: String,
      required: true,
      trim: true,
    },
    messageType: {
      type: String,
      enum: ['text', 'image', 'file', 'system'],
      default: 'text',
    },
    fileUrl: String,
    fileName: String,
    fileSize: Number,
    read: {
      type: Boolean,
      default: false,
    },
    readAt: Date,
    status: {
      type: String,
      enum: ['sent', 'delivered', 'read'],
      default: 'sent',
    },
    metadata: {
      orderId: String,
      ticketId: String,
      relatedTo: {
        type: String,
        enum: ['order', 'support', 'vendor', 'delivery'],
      },
    },
  },
  { timestamps: true }
);

// Index for quick lookups
chatSchema.index({ conversationId: 1, createdAt: -1 });
chatSchema.index({ 'sender.userId': 1 });
chatSchema.index({ 'recipient.userId': 1 });
chatSchema.index({ read: 1 });

const Chat = mongoose.model('Chat', chatSchema);

module.exports = Chat;
