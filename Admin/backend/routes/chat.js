const express = require('express');
const router = express.Router();
const { auth } = require('../middleware/auth');
const chatController = require('../controllers/chatController');

// Chat Routes

// Send message
router.post('/send', auth, chatController.sendMessage);

// Get conversation (all messages)
router.get('/conversation/:conversationId', auth, chatController.getConversation);

// Get all conversations for user
router.get('/conversations', auth, chatController.getConversations);

// Create new conversation
router.post('/create-conversation', auth, chatController.createConversation);

// Mark conversation as read
router.put('/mark-read/:conversationId', auth, chatController.markAsRead);

// Get unread count
router.get('/unread-count', auth, chatController.getUnreadCount);

// Delete message
router.delete('/:messageId', auth, chatController.deleteMessage);

// Search messages
router.get('/search', auth, chatController.searchMessages);

module.exports = router;
