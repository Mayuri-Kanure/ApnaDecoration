import React, { useState, useEffect } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  TextField,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Chip,
  IconButton,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Alert
} from '@mui/material';
import {
  Search as SearchIcon,
  Visibility as ViewIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  FilterList as FilterIcon
} from '@mui/icons-material';

import { supportTicketService } from '../services/adminSupportTicketService';

const SupportTicket = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [priorityFilter, setPriorityFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchTickets = async () => {
    try {
      setLoading(true);
      const response = await supportTicketService.getAllTickets();
      setTickets(Array.isArray(response?.data) ? response.data : []);
      console.log('Admin tickets fetched:', response?.data);
    } catch (error) {
      console.error('Error fetching tickets:', error);
      setTickets([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTickets();
  }, []);

  const handleViewTicket = (ticketId) => {
    console.log('View ticket:', ticketId);
  };

  const handleEditTicket = (ticketId) => {
    console.log('Edit ticket:', ticketId);
  };

  const handleDeleteTicket = (ticketId) => {
    console.log('Delete ticket:', ticketId);
  };

  const filteredTickets = tickets.filter((ticket) => {
    const subject = (ticket.subject || '').toLowerCase();
    const customerName = (ticket.customerName || '').toLowerCase();
    const ticketId = (ticket.ticketId || '').toLowerCase();
    const query = (searchQuery || '').toLowerCase();
    const matchesSearch = subject.includes(query) || customerName.includes(query) || ticketId.includes(query);
    const matchesPriority = priorityFilter === 'all' || ticket.priority === priorityFilter;
    const matchesStatus = statusFilter === 'all' || ticket.status === statusFilter;
    return matchesSearch && matchesPriority && matchesStatus;
  });

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'urgent':
        return 'error';
      case 'high':
        return 'warning';
      case 'medium':
        return 'info';
      case 'low':
        return 'success';
      default:
        return 'default';
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'open':
        return 'error';
      case 'in-progress':
        return 'warning';
      case 'resolved':
        return 'success';
      case 'closed':
        return 'default';
      default:
        return 'default';
    }
  };

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" sx={{ mb: 3, fontWeight: 600 }}>
        Support Ticket
      </Typography>

      <Card sx={{ mb: 3 }}>
        <CardContent sx={{ p: 2 }}>
          <Box sx={{ display: 'flex', gap: 2, alignItems: 'center', flexWrap: 'wrap' }}>
            <TextField
              placeholder="Search by Subject..."
              value={searchQuery}
              onChange={(event) => setSearchQuery(event.target.value)}
              InputProps={{
                startAdornment: (
                  <Box sx={{ display: 'flex', alignItems: 'center', pr: 1 }}>
                    <SearchIcon color="action" />
                  </Box>
                ),
              }}
              sx={{ minWidth: 300, flexGrow: 1 }}
            />

            <FormControl size="small" sx={{ minWidth: 150 }}>
              <InputLabel>Priority</InputLabel>
              <Select
                value={priorityFilter}
                onChange={(event) => setPriorityFilter(event.target.value)}
                label="Priority"
                startAdornment={<FilterIcon sx={{ mr: 1, fontSize: 20 }} />}
              >
                <MenuItem value="all">All Priority</MenuItem>
                <MenuItem value="urgent">Urgent</MenuItem>
                <MenuItem value="high">High</MenuItem>
                <MenuItem value="medium">Medium</MenuItem>
                <MenuItem value="low">Low</MenuItem>
              </Select>
            </FormControl>

            <FormControl size="small" sx={{ minWidth: 140 }}>
              <InputLabel>Status</InputLabel>
              <Select
                value={statusFilter}
                onChange={(event) => setStatusFilter(event.target.value)}
                label="Status"
              >
                <MenuItem value="all">All Status</MenuItem>
                <MenuItem value="open">Open</MenuItem>
                <MenuItem value="in-progress">In Progress</MenuItem>
                <MenuItem value="resolved">Resolved</MenuItem>
                <MenuItem value="closed">Closed</MenuItem>
              </Select>
            </FormControl>

            <Button variant="contained" startIcon={<FilterIcon />} sx={{ minWidth: 100 }}>
              Filter
            </Button>
          </Box>
        </CardContent>
      </Card>

      <Card>
        <CardContent sx={{ p: 0 }}>
          {loading ? (
            <Box sx={{ p: 4, textAlign: 'center' }}>
              <Typography variant="body2" color="text.secondary">
                Loading tickets...
              </Typography>
            </Box>
          ) : filteredTickets.length === 0 ? (
            <Box sx={{ p: 4, textAlign: 'center' }}>
              <Alert severity="warning" sx={{ mb: 2 }}>
                No support ticket found
              </Alert>
              <Typography variant="body2" color="text.secondary">
                Try adjusting your search or filter criteria
              </Typography>
            </Box>
          ) : (
            <TableContainer component={Paper} sx={{ maxHeight: 600 }}>
              <Table stickyHeader>
                <TableHead>
                  <TableRow>
                    <TableCell>Ticket Number</TableCell>
                    <TableCell>Subject</TableCell>
                    <TableCell>Customer Name</TableCell>
                    <TableCell>Email</TableCell>
                    <TableCell>Priority</TableCell>
                    <TableCell>Status</TableCell>
                    <TableCell>Created At</TableCell>
                    <TableCell>Last Updated</TableCell>
                    <TableCell align="center">Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {filteredTickets.map((ticket) => (
                    <TableRow key={ticket.id}>
                      <TableCell>
                        <Typography variant="body2" sx={{ fontWeight: 600 }}>
                          {ticket.ticketId}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2">{ticket.subject}</Typography>
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2">{ticket.customerName}</Typography>
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2" color="text.secondary">
                          {ticket.email}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Chip
                          label={ticket.priority}
                          color={getPriorityColor(ticket.priority)}
                          size="small"
                          sx={{ textTransform: 'capitalize' }}
                        />
                      </TableCell>
                      <TableCell>
                        <Chip
                          label={ticket.status}
                          color={getStatusColor(ticket.status)}
                          size="small"
                          sx={{ textTransform: 'capitalize' }}
                        />
                      </TableCell>
                      <TableCell>
                        <Typography variant="caption">
                          {ticket.createdAt ? new Date(ticket.createdAt).toLocaleString() : '-'}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Typography variant="caption">
                          {ticket.lastUpdated ? new Date(ticket.lastUpdated).toLocaleString() : '-'}
                        </Typography>
                      </TableCell>
                      <TableCell align="center">
                        <Box sx={{ display: 'flex', gap: 1, justifyContent: 'center' }}>
                          <IconButton size="small" onClick={() => handleViewTicket(ticket.id)} title="View">
                            <ViewIcon fontSize="small" />
                          </IconButton>
                          <IconButton size="small" onClick={() => handleEditTicket(ticket.id)} title="Edit">
                            <EditIcon fontSize="small" />
                          </IconButton>
                          <IconButton
                            size="small"
                            onClick={() => handleDeleteTicket(ticket.id)}
                            title="Delete"
                            color="error"
                          >
                            <DeleteIcon fontSize="small" />
                          </IconButton>
                        </Box>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          )}
        </CardContent>
      </Card>

      <Box sx={{ display: 'flex', gap: 2, mt: 3, flexWrap: 'wrap' }}>
        <Card sx={{ minWidth: 200, flexGrow: 1 }}>
          <CardContent sx={{ textAlign: 'center', py: 2 }}>
            <Typography variant="h4" color="primary" sx={{ fontWeight: 600 }}>
              {tickets.filter((t) => t.status === 'open').length}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Open Tickets
            </Typography>
          </CardContent>
        </Card>

        <Card sx={{ minWidth: 200, flexGrow: 1 }}>
          <CardContent sx={{ textAlign: 'center', py: 2 }}>
            <Typography variant="h4" color="success.main" sx={{ fontWeight: 600 }}>
              {tickets.filter((t) => t.status === 'closed').length}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Closed Tickets
            </Typography>
          </CardContent>
        </Card>

        <Card sx={{ minWidth: 200, flexGrow: 1 }}>
          <CardContent sx={{ textAlign: 'center', py: 2 }}>
            <Typography variant="h4" color="warning.main" sx={{ fontWeight: 600 }}>
              {tickets.filter((t) => t.priority === 'urgent' || t.priority === 'high').length}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              High Priority
            </Typography>
          </CardContent>
        </Card>

        <Card sx={{ minWidth: 200, flexGrow: 1 }}>
          <CardContent sx={{ textAlign: 'center', py: 2 }}>
            <Typography variant="h4" color="info.main" sx={{ fontWeight: 600 }}>
              {tickets.length}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Total Tickets
            </Typography>
          </CardContent>
        </Card>
      </Box>
    </Box>
  );
};

export default SupportTicket;

