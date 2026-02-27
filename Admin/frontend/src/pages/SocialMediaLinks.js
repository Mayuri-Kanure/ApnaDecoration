import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Paper,
  TextField,
  Button,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Switch,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  IconButton,
  Snackbar,
  Alert,
  CircularProgress
} from '@mui/material';
import {
  Edit as EditIcon,
  Save as SaveIcon
} from '@mui/icons-material';
import axios from 'axios';

const SocialMediaLinks = () => {
  const [socialMediaList, setSocialMediaList] = useState([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });

  // Form state
  const [formData, setFormData] = useState({
    platform: '',
    url: ''
  });

  // Available platforms
  const platforms = [
    { value: 'facebook', label: 'Facebook' },
    { value: 'instagram', label: 'Instagram' },
    { value: 'twitter', label: 'Twitter' },
    { value: 'linkedin', label: 'LinkedIn' },
    { value: 'pinterest', label: 'Pinterest' },
    { value: 'googleplus', label: 'Google Plus' }
  ];

  useEffect(() => {
    loadSocialMedia();
  }, []);

  const loadSocialMedia = async () => {
    setLoading(true);
    try {
      const response = await axios.get('/api/social-media');
      setSocialMediaList(response.data);
    } catch (error) {
      console.error('Error loading social media:', error);
      setSnackbar({
        open: true,
        message: 'Error loading social media links',
        severity: 'error'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const validateForm = () => {
    if (!formData.platform) {
      setSnackbar({
        open: true,
        message: 'Please select a social media platform',
        severity: 'error'
      });
      return false;
    }

    if (!formData.url) {
      setSnackbar({
        open: true,
        message: 'Please enter a social media URL',
        severity: 'error'
      });
      return false;
    }

    // Basic URL validation
    if (!/^https?:\/\/.+/.test(formData.url)) {
      setSnackbar({
        open: true,
        message: 'Please enter a valid URL starting with http:// or https://',
        severity: 'error'
      });
      return false;
    }

    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    setSaving(true);
    try {
      if (editingId) {
        // Update existing social media
        await axios.put(`/api/social-media/${editingId}`, formData);
        setSnackbar({
          open: true,
          message: 'Social media link updated successfully',
          severity: 'success'
        });
      } else {
        // Create new social media
        await axios.post('/api/social-media', formData);
        setSnackbar({
          open: true,
          message: 'Social media link added successfully',
          severity: 'success'
        });
      }

      // Reset form
      setFormData({ platform: '', url: '' });
      setEditingId(null);
      
      // Reload list
      await loadSocialMedia();
    } catch (error) {
      console.error('Error saving social media:', error);
      setSnackbar({
        open: true,
        message: error.response?.data?.message || 'Error saving social media link',
        severity: 'error'
      });
    } finally {
      setSaving(false);
    }
  };

  const handleEdit = (socialMedia) => {
    setFormData({
      platform: socialMedia.platform,
      url: socialMedia.url
    });
    setEditingId(socialMedia._id);
  };

  const handleToggleStatus = async (id, active) => {
    try {
      await axios.patch(`/api/social-media/${id}/status`, { active });
      
      // Update local state
      setSocialMediaList(prev =>
        prev.map(item =>
          item._id === id ? { ...item, active } : item
        )
      );

      setSnackbar({
        open: true,
        message: `Social media link ${active ? 'activated' : 'deactivated'} successfully`,
        severity: 'success'
      });
    } catch (error) {
      console.error('Error updating status:', error);
      setSnackbar({
        open: true,
        message: 'Error updating status',
        severity: 'error'
      });
    }
  };

  const handleCloseSnackbar = () => {
    setSnackbar(prev => ({ ...prev, open: false }));
  };

  const getPlatformName = (platform) => {
    const platformObj = platforms.find(p => p.value === platform);
    return platformObj ? platformObj.label : platform;
  };

  return (
    <Box sx={{ p: 4, backgroundColor: '#f5f5f5', minHeight: '100vh' }}>
      <Typography variant="h4" sx={{ 
        mb: 4, 
        fontWeight: 300, 
        color: '#1e3a5f',
        textAlign: 'left'
      }}>
        Social Media Management
      </Typography>

      {/* Social Media Form */}
      <Paper sx={{ 
        mb: 4, 
        p: 4, 
        backgroundColor: 'white',
        borderRadius: 2,
        boxShadow: '0 2px 12px rgba(0,0,0,0.08)'
      }}>
        <Typography variant="h6" sx={{ 
          mb: 3, 
          fontWeight: 500,
          color: '#333'
        }}>
          {editingId ? 'Edit Social Media' : 'Add Social Media'}
        </Typography>

        <form onSubmit={handleSubmit}>
          <Box sx={{ display: 'flex', gap: 3, alignItems: 'flex-end', flexWrap: 'wrap' }}>
            <FormControl sx={{ minWidth: 200 }}>
              <InputLabel>Select Social Media</InputLabel>
              <Select
                name="platform"
                value={formData.platform}
                onChange={handleInputChange}
                label="Select Social Media"
                disabled={!!editingId} // Disable platform selection when editing
              >
                {platforms.map((platform) => (
                  <MenuItem key={platform.value} value={platform.value}>
                    {platform.label}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            <TextField
              name="url"
              label="Social Media Link"
              value={formData.url}
              onChange={handleInputChange}
              placeholder="https://example.com"
              sx={{ minWidth: 300 }}
              required
            />

            <Button
              type="submit"
              variant="contained"
              disabled={saving}
              startIcon={<SaveIcon />}
              sx={{
                backgroundColor: '#1e3a5f',
                color: 'white',
                textTransform: 'none',
                '&:hover': {
                  backgroundColor: '#2d5a8c'
                }
              }}
            >
              {saving ? 'Saving...' : (editingId ? 'Update' : 'Save')}
            </Button>

            {editingId && (
              <Button
                variant="outlined"
                onClick={() => {
                  setFormData({ platform: '', url: '' });
                  setEditingId(null);
                }}
                sx={{
                  borderColor: '#1e3a5f',
                  color: '#1e3a5f',
                  textTransform: 'none',
                  '&:hover': {
                    borderColor: '#2d5a8c',
                    backgroundColor: '#f8f9fa'
                  }
                }}
              >
                Cancel
              </Button>
            )}
          </Box>
        </form>
      </Paper>

      {/* Social Media Table */}
      <Paper sx={{ 
        p: 4, 
        backgroundColor: 'white',
        borderRadius: 2,
        boxShadow: '0 2px 12px rgba(0,0,0,0.08)'
      }}>
        <Typography variant="h6" sx={{ 
          mb: 3, 
          fontWeight: 500,
          color: '#333'
        }}>
          Social Media Links
        </Typography>

        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
            <CircularProgress />
          </Box>
        ) : (
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell sx={{ fontWeight: 600 }}>SL</TableCell>
                  <TableCell sx={{ fontWeight: 600 }}>Name</TableCell>
                  <TableCell sx={{ fontWeight: 600 }}>Link</TableCell>
                  <TableCell sx={{ fontWeight: 600 }}>Status</TableCell>
                  <TableCell sx={{ fontWeight: 600 }}>Action</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {socialMediaList.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5} sx={{ textAlign: 'center', py: 4 }}>
                      No social media links added yet
                    </TableCell>
                  </TableRow>
                ) : (
                  socialMediaList.map((socialMedia, index) => (
                    <TableRow key={socialMedia._id}>
                      <TableCell>{index + 1}</TableCell>
                      <TableCell sx={{ fontWeight: 500 }}>
                        {getPlatformName(socialMedia.platform)}
                      </TableCell>
                      <TableCell>
                        <Typography
                          component="a"
                          href={socialMedia.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          sx={{
                            color: '#1e3a5f',
                            textDecoration: 'none',
                            '&:hover': {
                              textDecoration: 'underline'
                            }
                          }}
                        >
                          {socialMedia.url}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Switch
                          checked={socialMedia.active}
                          onChange={(e) => handleToggleStatus(socialMedia._id, e.target.checked)}
                          size="small"
                          sx={{
                            '& .MuiSwitch-switchBase.Mui-checked': {
                              color: '#1e3a5f',
                            },
                            '& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track': {
                              backgroundColor: '#1e3a5f',
                            },
                            '& .MuiSwitch-switchBase': {
                              color: '#ccc',
                            },
                            '& .MuiSwitch-switchBase + .MuiSwitch-track': {
                              backgroundColor: '#ccc',
                            },
                          }}
                        />
                      </TableCell>
                      <TableCell>
                        <IconButton
                          onClick={() => handleEdit(socialMedia)}
                          sx={{
                            color: '#1e3a5f',
                            '&:hover': {
                              backgroundColor: '#f0f4f8'
                            }
                          }}
                        >
                          <EditIcon />
                        </IconButton>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </TableContainer>
        )}
      </Paper>

      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
      >
        <Alert onClose={handleCloseSnackbar} severity={snackbar.severity}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default SocialMediaLinks;
