import React, { useState, useEffect } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Chip,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  MenuItem,
  Select,
  FormControl,
  InputLabel
} from '@mui/material';
import {
  Visibility as ViewIcon,
  Delete as DeleteIcon,
  Reply as ReplyIcon,
  Refresh as RefreshIcon
} from '@mui/icons-material';
import axios from 'axios';

const ContactMessages = () => {
  const [contacts, setContacts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedContact, setSelectedContact] = useState(null);
  const [openDialog, setOpenDialog] = useState(false);
  const [reply, setReply] = useState('');
  const [filterStatus, setFilterStatus] = useState('');

  const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5002/api';

  console.log('🔍 ContactMessages API_URL:', API_URL);
  console.log('🔍 Environment variable:', process.env.REACT_APP_API_URL);

  const fetchContacts = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const params = filterStatus ? { status: filterStatus } : {};
      
      const response = await axios.get(`${API_URL}/contact`, {
        headers: { Authorization: `Bearer ${token}` },
        params
      });
      
      setContacts(response.data.data || []);
    } catch (error) {
      console.error('Error fetching contacts:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchContacts();
  }, [filterStatus]);

  const handleViewContact = (contact) => {
    setSelectedContact(contact);
    setOpenDialog(true);
    
    // Mark as read
    if (contact.status === 'new') {
      updateContactStatus(contact._id, 'read');
    }
  };

  const updateContactStatus = async (id, status, replyText = '') => {
    try {
      const token = localStorage.getItem('token');
      await axios.put(
        `${API_URL}/contact/${id}`,
        { status, reply: replyText },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      fetchContacts();
    } catch (error) {
      console.error('Error updating contact:', error);
    }
  };

  const handleReply = async () => {
    if (selectedContact && reply.trim()) {
      await updateContactStatus(selectedContact._id, 'replied', reply);
      setReply('');
      setOpenDialog(false);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this message?')) {
      try {
        const token = localStorage.getItem('token');
        await axios.delete(`${API_URL}/contact/${id}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        fetchContacts();
      } catch (error) {
        console.error('Error deleting contact:', error);
      }
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'new': return 'error';
      case 'read': return 'warning';
      case 'replied': return 'success';
      case 'closed': return 'default';
      default: return 'default';
    }
  };

  return (
    <Box sx={{ p: 3 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4" sx={{ fontWeight: 600 }}>
          Contact Messages
        </Typography>
        <Box sx={{ display: 'flex', gap: 2 }}>
          <FormControl size="small" sx={{ minWidth: 150 }}>
            <InputLabel>Filter Status</InputLabel>
            <Select
              value={filterStatus}
              label="Filter Status"
              onChange={(e) => setFilterStatus(e.target.value)}
            >
              <MenuItem value="">All</MenuItem>
              <MenuItem value="new">New</MenuItem>
              <MenuItem value="read">Read</MenuItem>
              <MenuItem value="replied">Replied</MenuItem>
              <MenuItem value="closed">Closed</MenuItem>
            </Select>
          </FormControl>
          <IconButton onClick={fetchContacts} color="primary">
            <RefreshIcon />
          </IconButton>
        </Box>
      </Box>

      <Card>
        <CardContent>
          <TableContainer component={Paper}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Date</TableCell>
                  <TableCell>Name</TableCell>
                  <TableCell>Email</TableCell>
                  <TableCell>Subject</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell align="right">Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {loading ? (
                  <TableRow>
                    <TableCell colSpan={6} align="center">Loading...</TableCell>
                  </TableRow>
                ) : contacts.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} align="center">No messages found</TableCell>
                  </TableRow>
                ) : (
                  contacts.map((contact) => (
                    <TableRow key={contact._id}>
                      <TableCell>
                        {new Date(contact.createdAt).toLocaleDateString()}
                      </TableCell>
                      <TableCell>{contact.name}</TableCell>
                      <TableCell>{contact.email}</TableCell>
                      <TableCell>{contact.subject}</TableCell>
                      <TableCell>
                        <Chip
                          label={contact.status}
                          color={getStatusColor(contact.status)}
                          size="small"
                        />
                      </TableCell>
                      <TableCell align="right">
                        <IconButton
                          size="small"
                          onClick={() => handleViewContact(contact)}
                          color="primary"
                        >
                          <ViewIcon />
                        </IconButton>
                        <IconButton
                          size="small"
                          onClick={() => handleDelete(contact._id)}
                          color="error"
                        >
                          <DeleteIcon />
                        </IconButton>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </TableContainer>
        </CardContent>
      </Card>

      {/* View/Reply Dialog */}
      <Dialog open={openDialog} onClose={() => setOpenDialog(false)} maxWidth="md" fullWidth>
        <DialogTitle>Contact Message</DialogTitle>
        <DialogContent>
          {selectedContact && (
            <Box sx={{ mt: 2 }}>
              <Typography variant="subtitle2" color="text.secondary">From:</Typography>
              <Typography variant="body1" sx={{ mb: 2 }}>
                {selectedContact.name} ({selectedContact.email})
                {selectedContact.phone && ` - ${selectedContact.phone}`}
              </Typography>

              <Typography variant="subtitle2" color="text.secondary">Subject:</Typography>
              <Typography variant="body1" sx={{ mb: 2 }}>{selectedContact.subject}</Typography>

              <Typography variant="subtitle2" color="text.secondary">Message:</Typography>
              <Typography variant="body1" sx={{ mb: 2, whiteSpace: 'pre-wrap' }}>
                {selectedContact.message}
              </Typography>

              {selectedContact.reply && (
                <>
                  <Typography variant="subtitle2" color="text.secondary">Reply:</Typography>
                  <Typography variant="body1" sx={{ mb: 2, whiteSpace: 'pre-wrap' }}>
                    {selectedContact.reply}
                  </Typography>
                </>
              )}

              <TextField
                fullWidth
                multiline
                rows={4}
                label="Reply"
                value={reply}
                onChange={(e) => setReply(e.target.value)}
                sx={{ mt: 2 }}
              />
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenDialog(false)}>Close</Button>
          <Button onClick={handleReply} variant="contained" startIcon={<ReplyIcon />}>
            Send Reply
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default ContactMessages;
