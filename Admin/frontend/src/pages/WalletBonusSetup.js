import React, { useState, useEffect } from 'react';
import axios from 'axios';
import {
  Box, Card, CardContent, Typography, Grid, TextField, Button,
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper,
  Select, MenuItem, FormControl, InputLabel, InputAdornment, TablePagination,
  IconButton, Dialog, DialogTitle, DialogContent, DialogActions, Chip
} from '@mui/material';
import {
  AccountBalanceWallet as WalletIcon, Info as InfoIcon, Search as SearchIcon,
  Edit as EditIcon, Delete as DeleteIcon,
  Percent as PercentIcon, AttachMoney as MoneyIcon
} from '@mui/icons-material';

const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || 'https://admin-api.apnadecoration.com/api';

function WalletBonusSetup() {
  const [bonuses, setBonuses] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [page, setPage] = useState(0); // Start from page 0
  const [bonusStats, setBonusStats] = useState({
    totalBonuses: 0,
    activeBonuses: 0,
    inactiveBonuses: 0,
    expiredBonuses: 0,
    totalUsage: 0
  });

  // Fetch wallet bonuses from API
  const fetchWalletBonuses = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        console.warn('No token found, skipping wallet bonuses fetch');
        setBonuses([]);
        return;
      }

      const response = await axios.get(`${process.env.REACT_APP_API_URL || 'https://admin-api.apnadecoration.com/api'}/wallet-bonus`, {
        params: {
          search: searchTerm,
          status: statusFilter,
          page,
          limit: 10
        },
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      
      setBonuses(response.data.bonuses || []);
      setBonusStats(response.data.stats || bonusStats);
    } catch (error) {
      console.error('Error fetching wallet bonuses:', error);
      if (error.response?.status === 401) {
        console.warn('Authentication failed for wallet bonuses');
        setBonuses([]);
      } else {
        setBonuses([]);
      }
    } finally {
      setLoading(false);
    }
  };

  // Load data on mount and when filters change
  useEffect(() => {
    setPage(0); // Reset to first page on mount/filter change
    fetchWalletBonuses();
  }, [searchTerm, statusFilter]);

  // Separate effect for page changes to avoid infinite loops
  useEffect(() => {
    fetchWalletBonuses();
  }, [page]);

  const [formData, setFormData] = useState({
    title: '', description: '', bonusType: 'percentage', bonusAmount: '',
    minAddAmount: '', maxBonus: '', startDate: '', endDate: ''
  });

  const [rowsPerPage, setRowsPerPage] = useState(10);

  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [selectedBonus, setSelectedBonus] = useState(null);

  const bonusTypes = [
    { value: 'percentage', label: 'Percentage (%)' },
    { value: 'fixed', label: 'Fixed Amount (₹)' }
  ];

  const filteredBonuses = bonuses; // Backend handles filtering

  const handleSubmit = async () => {
    // Validate form
    if (!formData.title || !formData.description || !formData.bonusAmount || !formData.minAddAmount || !formData.startDate || !formData.endDate) {
      alert('Please fill all required fields');
      return;
    }

    if (parseFloat(formData.bonusAmount) <= 0 || parseFloat(formData.minAddAmount) <= 0) {
      alert('Bonus amount and minimum add amount must be greater than 0');
      return;
    }

    try {
      const token = localStorage.getItem('token');
      if (!token) {
        alert('Please login to create wallet bonuses');
        return;
      }

      const response = await axios.post(`${process.env.REACT_APP_API_URL || 'https://admin-api.apnadecoration.com/api'}/wallet-bonus`, formData, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      
      // Reset form and refresh data
      setFormData({
        title: '', description: '', bonusType: 'percentage', bonusAmount: '',
        minAddAmount: '', maxBonus: '', startDate: '', endDate: ''
      });
      fetchWalletBonuses();
      
      alert('Wallet bonus created successfully!');
    } catch (error) {
      console.error('Error creating wallet bonus:', error);
      if (error.response?.status === 401) {
        alert('Authentication failed. Please login again.');
      } else if (error.response?.data?.message) {
        alert(`Error: ${error.response.data.message}`);
      } else {
        alert('Error creating wallet bonus. Please try again.');
      }
    }
  };

  const handleSearch = (event) => {
    setSearchTerm(event.target.value);
    setPage(0); // Reset to first page
  };

  const handleStatusFilter = (event) => {
    setStatusFilter(event.target.value);
    setPage(0); // Reset to first page
  };

  const handlePageChange = (event, newPage) => {
    setPage(newPage);
  };

  const handleEdit = (bonus) => {
    setSelectedBonus(bonus);
    setFormData(bonus);
    setEditDialogOpen(true);
  };

  const handleUpdate = async () => {
    try {
      const token = localStorage.getItem('token');
      await axios.put(`${API_BASE_URL}/wallet-bonus/${selectedBonus._id}`, formData, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      
      setEditDialogOpen(false);
      setSelectedBonus(null);
      fetchWalletBonuses();
    } catch (error) {
      console.error('Error updating wallet bonus:', error);
    }
  };

  const handleDelete = async (bonusId) => {
    try {
      const token = localStorage.getItem('token');
      await axios.delete(`${API_BASE_URL}/wallet-bonus/${bonusId}`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      
      fetchWalletBonuses();
    } catch (error) {
      console.error('Error deleting wallet bonus:', error);
    }
  };

  const handleReset = () => {
    setFormData({
      title: '', description: '', bonusType: 'percentage', bonusAmount: '',
      minAddAmount: '', maxBonus: '', startDate: '', endDate: ''
    });
  };

  return (
    <Box sx={{ p: 3, backgroundColor: '#F8F9FB', minHeight: '100vh' }}>
      
      {/* HEADER */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <WalletIcon sx={{ fontSize: 32, color: '#1976D2' }} />
          <Typography variant="h4" sx={{ fontWeight: 600, color: '#2C3E50' }}>
            Wallet Bonus Setup
          </Typography>
        </Box>

        <Button variant="text" size="small" startIcon={<InfoIcon />} sx={{ color: '#666' }}>
          How it works
        </Button>
      </Box>

      {/* FORM */}
      <Card sx={{ mb: 3, borderRadius: 2, boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }}>
        <CardContent sx={{ p: 3 }}>
          <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>
            Bonus Configuration
          </Typography>

          <Grid container spacing={2}>
            
            {/* TITLE */}
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth label="Bonus Title" placeholder="Ex: EID Dhamaka"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              />
            </Grid>

            {/* DESCRIPTION */}
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth label="Short Description" placeholder="Ex: Special bonus offer"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              />
            </Grid>

            {/* BONUS TYPE */}
            <Grid item xs={12} md={3}>
              <FormControl fullWidth>
                <InputLabel>Bonus Type</InputLabel>
                <Select
                  value={formData.bonusType}
                  label="Bonus Type"
                  onChange={(e) => setFormData({ ...formData, bonusType: e.target.value })}
                >
                  {bonusTypes.map(type => (
                    <MenuItem key={type.value} value={type.value}>
                      {type.label}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>

            {/* BONUS AMOUNT */}
            <Grid item xs={12} md={3}>
              <TextField
                fullWidth label="Bonus Amount" type="number"
                placeholder="0"
                value={formData.bonusAmount}
                onChange={(e) => setFormData({ ...formData, bonusAmount: e.target.value })}
                InputProps={{
                  startAdornment:
                    formData.bonusType === 'percentage'
                      ? <InputAdornment position="start"><PercentIcon /></InputAdornment>
                      : <InputAdornment position="start"><MoneyIcon /></InputAdornment>
                }}
              />
            </Grid>

            {/* MIN ADD AMOUNT */}
            <Grid item xs={12} md={3}>
              <TextField
                fullWidth label="Minimum Add Amount (₹)" type="number"
                placeholder="0"
                value={formData.minAddAmount}
                onChange={(e) => setFormData({ ...formData, minAddAmount: e.target.value })}
              />
            </Grid>

            {/* MAX BONUS */}
            <Grid item xs={12} md={3}>
              <TextField
                fullWidth label="Maximum Bonus (₹)" type="number"
                placeholder="0"
                value={formData.maxBonus}
                onChange={(e) => setFormData({ ...formData, maxBonus: e.target.value })}
              />
            </Grid>

            {/* START DATE */}
            <Grid item xs={12} md={3}>
              <TextField
                fullWidth label="Start Date" type="date"
                InputLabelProps={{ shrink: true }}
                value={formData.startDate}
                onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
              />
            </Grid>

            {/* END DATE */}
            <Grid item xs={12} md={3}>
              <TextField
                fullWidth label="End Date" type="date"
                InputLabelProps={{ shrink: true }}
                value={formData.endDate}
                onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
              />
            </Grid>

            {/* BUTTONS */}
            <Grid item xs={12} sx={{ mt: 2, textAlign: 'right' }}>
              <Button variant="outlined" sx={{ mr: 2 }} onClick={handleReset}>Reset</Button>
              <Button variant="contained" onClick={handleSubmit}>Submit</Button>
            </Grid>

          </Grid>
        </CardContent>
      </Card>

      {/* TABLE + SEARCH */}
      <Card sx={{ p: 2, borderRadius: 2, boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }}>
        
        {/* SEARCH BAR */}
        <Box sx={{ display: 'flex', justifyContent: 'flex-end', mb: 2 }}>
          <TextField
            placeholder="Search by bonus title"
            size="small"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon />
                </InputAdornment>
              )
            }}
          />
        </Box>

        {/* TABLE */}
        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow sx={{ backgroundColor: '#F1F3F5' }}>
                <TableCell>SL</TableCell>
                <TableCell>Bonus Title</TableCell>
                <TableCell>Bonus Info</TableCell>
                <TableCell>Bonus Amount</TableCell>
                <TableCell>Start Date</TableCell>
                <TableCell>End Date</TableCell>
                <TableCell>Status</TableCell>
                <TableCell>Usage</TableCell>
                <TableCell>Action</TableCell>
              </TableRow>
            </TableHead>

            <TableBody>
              {filteredBonuses.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={9} align="center" sx={{ py: 5 }}>
                    No data found
                  </TableCell>
                </TableRow>
              ) : (
                filteredBonuses
                  .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                  .map((bonus, index) => (
                    <TableRow key={bonus._id || `bonus-${index}`}>
                      <TableCell>{page * rowsPerPage + index + 1}</TableCell>
                      <TableCell>{bonus.title}</TableCell>
                      <TableCell>
                        {bonus.bonusType === 'percentage'
                          ? `${bonus.bonusAmount}% on min ₹${bonus.minAddAmount}`
                          : `₹${bonus.bonusAmount} on min ₹${bonus.minAddAmount}`
                        }
                        {bonus.maxBonus && ` (max ₹${bonus.maxBonus})`}
                      </TableCell>
                      <TableCell>
                        {bonus.bonusType === 'percentage'
                          ? `${bonus.bonusAmount}%`
                          : `₹${bonus.bonusAmount}`}
                      </TableCell>
                      <TableCell>
                        {new Date(bonus.startDate).toLocaleDateString()}
                      </TableCell>
                      <TableCell>
                        {new Date(bonus.endDate).toLocaleDateString()}
                      </TableCell>
                      <TableCell>
                        <Chip 
                          label={bonus.status} 
                          color={
                            bonus.status === 'active' ? 'success' : 
                            bonus.status === 'expired' ? 'error' : 'warning'
                          } 
                          size="small" 
                        />
                      </TableCell>
                      <TableCell>{bonus.usageCount || 0}</TableCell>
                      <TableCell>
                        <IconButton onClick={() => handleEdit(bonus)}>
                          <EditIcon color="primary" />
                        </IconButton>
                        <IconButton onClick={() => handleDelete(bonus._id)}>
                          <DeleteIcon color="error" />
                        </IconButton>
                      </TableCell>
                    </TableRow>
                  ))
              )}
            </TableBody>

          </Table>
        </TableContainer>

        {/* PAGINATION */}
        <TablePagination
          rowsPerPageOptions={[5, 10, 20]}
          component="div"
          count={bonusStats.totalBonuses || 0}
          rowsPerPage={rowsPerPage}
          page={page}
          onPageChange={(e, newPage) => setPage(newPage)}
          onRowsPerPageChange={(e) => {
            setRowsPerPage(parseInt(e.target.value, 10));
            setPage(0);
          }}
        />

      </Card>

      {/* EDIT BONUS DIALOG */}
      <Dialog open={editDialogOpen} onClose={() => setEditDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Edit Bonus</DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={12}>
              <TextField fullWidth label="Bonus Title" value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })} />
            </Grid>
            <Grid item xs={12}>
              <TextField fullWidth label="Description" value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })} />
            </Grid>
            <Grid item xs={12}>
              <TextField fullWidth label="Bonus Amount" type="number" value={formData.bonusAmount}
                onChange={(e) => setFormData({ ...formData, bonusAmount: e.target.value })} />
            </Grid>
          </Grid>
        </DialogContent>

        <DialogActions>
          <Button onClick={() => setEditDialogOpen(false)}>Cancel</Button>
          <Button variant="contained" onClick={handleUpdate}>Save</Button>
        </DialogActions>
      </Dialog>

    </Box>
  );
}

export default WalletBonusSetup;
