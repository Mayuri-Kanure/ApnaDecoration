import React, { useState, useEffect, useRef } from 'react';
import {
  Box,
  Paper,
  TextField,
  Button,
  Typography,
  Avatar,
  List,
  ListItem,
  Divider,
  Chip,
  IconButton,
  InputAdornment,
} from '@mui/material';
import {
  Send as SendIcon,
  AttachFile as AttachFileIcon,
  Close as CloseIcon,
} from '@mui/icons-material';
import useLiveChat from '../hooks/useLiveChat';

/**
 * Live Chat Component for Admin
 */
function LiveChatWindow({ conversationId, recipientId, recipientName, onClose }) {
  const { messages, typingUsers, sendMessage, sendTypingIndicator } = useLiveChat(conversationId);
  const [inputMessage, setInputMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef(null);
  const typingTimeoutRef = useRef(null);

  // Auto-scroll to latest message
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Handle input change with typing indicator
  const handleInputChange = (e) => {
    setInputMessage(e.target.value);

    if (!isTyping) {
      setIsTyping(true);
      sendTypingIndicator(recipientId, true);
    }

    // Clear typing indicator timeout
    clearTimeout(typingTimeoutRef.current);

    // Set new timeout
    typingTimeoutRef.current = setTimeout(() => {
      setIsTyping(false);
      sendTypingIndicator(recipientId, false);
    }, 3000);
  };

  // Send message
  const handleSendMessage = () => {
    if (inputMessage.trim()) {
      sendMessage(inputMessage, recipientId, 'text');
      setInputMessage('');
      setIsTyping(false);
      sendTypingIndicator(recipientId, false);
    }
  };

  // Handle Enter key
  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  return (
    <Paper
      sx={{
        position: 'fixed',
        bottom: 20,
        right: 20,
        width: 400,
        maxWidth: '100%',
        height: 600,
        display: 'flex',
        flexDirection: 'column',
        boxShadow: 3,
        zIndex: 1000,
      }}
    >
      {/* Header */}
      <Box
        sx={{
          backgroundColor: '#1976d2',
          color: 'white',
          padding: 2,
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
        }}
      >
        <Typography variant="subtitle1" sx={{ fontWeight: 'bold' }}>
          {recipientName}
        </Typography>
        <IconButton size="small" onClick={onClose} sx={{ color: 'white' }}>
          <CloseIcon />
        </IconButton>
      </Box>

      {/* Messages */}
      <Box
        sx={{
          flex: 1,
          overflowY: 'auto',
          padding: 2,
          backgroundColor: '#f5f5f5',
        }}
      >
        <List sx={{ padding: 0 }}>
          {messages.map((msg, idx) => (
            <Box key={idx} sx={{ marginBottom: 2 }}>
              <ListItem
                sx={{
                  padding: 0,
                  justifyContent:
                    msg.senderId === localStorage.getItem('userId')
                      ? 'flex-end'
                      : 'flex-start',
                }}
              >
                <Paper
                  sx={{
                    padding: 1.5,
                    maxWidth: '70%',
                    backgroundColor:
                      msg.senderId === localStorage.getItem('userId')
                        ? '#1976d2'
                        : '#e0e0e0',
                    color:
                      msg.senderId === localStorage.getItem('userId')
                        ? 'white'
                        : 'black',
                  }}
                >
                  <Typography variant="body2">{msg.message}</Typography>
                  <Typography
                    variant="caption"
                    sx={{
                      display: 'block',
                      marginTop: 0.5,
                      opacity: 0.7,
                    }}
                  >
                    {new Date(msg.timestamp).toLocaleTimeString()}
                  </Typography>
                </Paper>
              </ListItem>
            </Box>
          ))}

          {/* Typing indicator */}
          {typingUsers.size > 0 && (
            <Box sx={{ marginBottom: 2 }}>
              <Chip
                label={`${Array.from(typingUsers).join(', ')} is typing...`}
                size="small"
                sx={{ backgroundColor: '#e0e0e0' }}
              />
            </Box>
          )}

          <div ref={messagesEndRef} />
        </List>
      </Box>

      {/* Input */}
      <Divider />
      <Box sx={{ padding: 2, display: 'flex', gap: 1 }}>
        <TextField
          fullWidth
          multiline
          maxRows={3}
          placeholder="Type your message..."
          value={inputMessage}
          onChange={handleInputChange}
          onKeyPress={handleKeyPress}
          size="small"
          InputProps={{
            endAdornment: (
              <InputAdornment position="end">
                <IconButton size="small">
                  <AttachFileIcon />
                </IconButton>
              </InputAdornment>
            ),
          }}
        />
        <Button
          variant="contained"
          onClick={handleSendMessage}
          disabled={!inputMessage.trim()}
          sx={{ minWidth: 50 }}
        >
          <SendIcon />
        </Button>
      </Box>
    </Paper>
  );
}

export default LiveChatWindow;
