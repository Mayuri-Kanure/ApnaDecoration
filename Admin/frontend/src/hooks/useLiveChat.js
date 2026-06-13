import { useState, useEffect, useCallback } from 'react';
import socketIOService from '../services/socketIOService';

/**
 * Hook for real-time chat functionality
 */
export const useLiveChat = (conversationId) => {
  const [messages, setMessages] = useState([]);
  const [typingUsers, setTypingUsers] = useState(new Set());
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  // Handle incoming chat message
  const handleNewMessage = useCallback((messageData) => {
    console.log('💬 New message:', messageData);
    if (messageData.conversationId === conversationId) {
      setMessages((prev) => [...prev, messageData]);
    }
  }, [conversationId]);

  // Handle typing indicator
  const handleTypingIndicator = useCallback((data) => {
    if (data.conversationId !== conversationId) return;

    setTypingUsers((prev) => {
      const updated = new Set(prev);
      if (data.isTyping) {
        updated.add(`${data.userId}_${data.senderName}`);
      } else {
        updated.delete(`${data.userId}_${data.senderName}`);
      }
      return updated;
    });
  }, [conversationId]);

  // Setup socket listeners
  useEffect(() => {
    if (!socketIOService.socket) {
      console.warn('Socket not initialized');
      return;
    }

    socketIOService.on('new-chat-message', handleNewMessage);
    socketIOService.on('user-typing', handleTypingIndicator);

    console.log(`✅ Chat listeners registered for ${conversationId}`);

    return () => {
      socketIOService.off('new-chat-message', handleNewMessage);
      socketIOService.off('user-typing', handleTypingIndicator);
    };
  }, [conversationId, handleNewMessage, handleTypingIndicator]);

  // Send message
  const sendMessage = useCallback(
    (message, recipientId, messageType = 'text', fileData = null) => {
      socketIOService.emit('chat-message', {
        conversationId,
        message,
        recipientId,
        messageType,
        fileData,
      });

      // Add message to local state
      const newMessage = {
        conversationId,
        senderId: localStorage.getItem('userId'),
        senderName: localStorage.getItem('userName'),
        senderType: localStorage.getItem('userType'),
        message,
        messageType,
        timestamp: new Date().toISOString(),
      };

      setMessages((prev) => [...prev, newMessage]);
    },
    [conversationId]
  );

  // Send typing indicator
  const sendTypingIndicator = useCallback(
    (recipientId, isTyping) => {
      socketIOService.emit('typing', {
        conversationId,
        recipientId,
        isTyping,
      });
    },
    [conversationId]
  );

  return {
    messages,
    typingUsers,
    isLoading,
    error,
    sendMessage,
    sendTypingIndicator,
  };
};

export default useLiveChat;
