import React, { useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box, Typography, Card, CardContent, TextField,
  Button, Avatar, IconButton, Tabs, Tab, Divider
} from '@mui/material';
import {
  CameraAlt as CameraIcon,
  Visibility as VisibilityIcon,
  VisibilityOff as VisibilityOffIcon,
  Dashboard as DashboardIcon
} from '@mui/icons-material';
import { useProfile } from '../contexts/ProfileContext';

function Profile() {
  const navigate = useNavigate();
  const [tabIndex, setTabIndex] = useState(0);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const { profileData, updateProfile } = useProfile();

  const [formData, setFormData] = useState({
    fullName: profileData.fullName,
    phoneNumber: profileData.phoneNumber,
    email: profileData.email,
    newPassword: '',
    confirmPassword: ''
  });

  React.useEffect(() => {
    setFormData(prev => ({
      ...prev,
      fullName: profileData.fullName,
      phoneNumber: profileData.phoneNumber,
      email: profileData.email
    }));
  }, [profileData]);

  const handleInputChange = (field) => (event) =>
    setFormData({ ...formData, [field]: event.target.value });

  const handlePhotoUpload = (event) => {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        updateProfile({ profilePhoto: reader.result });
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSaveBasicInfo = () => {
    updateProfile({
      fullName: formData.fullName,
      phoneNumber: formData.phoneNumber,
      email: formData.email
    });
    alert('Profile information saved successfully!');
  };

  const handleSavePassword = () => {
    if (formData.newPassword !== formData.confirmPassword) {
      alert('Passwords do not match!');
      return;
    }
    console.log('Saving password');
    alert('Password updated successfully!');
  };

  return (
    <Box sx={{ p: 2 }}>
      
      {/* Header */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
        <Typography variant="h4" sx={{ fontWeight: 700 }}>
          Profile Settings
        </Typography>
        <Button variant="contained" startIcon={<DashboardIcon />} onClick={() => navigate('/dashboard')}>
         back
        </Button>
      </Box>

      <Card sx={{ display: 'flex', borderRadius: 3, boxShadow: 3 }}>
        
        {/* Sidebar Tabs */}
        <Box
          sx={{
            width: 250,
            borderRight: '1px solid #eee',
            background: '#fafbfd',
            borderRadius: '12px 0 0 12px'
          }}
        >
          <Tabs
            orientation="vertical"
            value={tabIndex}
            onChange={(e, v) => setTabIndex(v)}
            sx={{
              '& .MuiTab-root': { alignItems: 'flex-start', textTransform: 'none', fontSize: '16px' },
              mt: 4
            }}
          >
            <Tab label="Basic Information" />
            <Tab label="Change Password" />
          </Tabs>
        </Box>

        {/* Right Content */}
        <Box sx={{ flex: 1 }}>
          <CardContent sx={{ p: 4 }}>
            
            {/* --- BASIC INFORMATION TAB --- */}
            {tabIndex === 0 && (
              <>
                <Box sx={{ textAlign: 'center', pb: 6 }}>
                  <Box
                    sx={{
                      height: 140,
                      background: 'linear-gradient(135deg, #123456 0%, #1a4e7a 100%)',
                      borderRadius: 3,
                      mb: -8,
                      position: 'relative'
                    }}
                  />

                  <Box sx={{ position: 'relative', display: 'inline-block' }}>
                    <input
                      type="file"
                      accept="image/*"
                      style={{ display: 'none' }}
                      id="photo-upload"
                      onChange={handlePhotoUpload}
                    />
                    <Avatar
                      sx={{
                        width: 130,
                        height: 130,
                        border: '5px solid white'
                      }}
                      src={profileData.profilePhoto}
                    >
                      {!profileData.profilePhoto && <Typography variant="h3">{profileData.fullName?.charAt(0) || 'PM'}</Typography>}
                    </Avatar>

                    <IconButton
                      sx={{
                        position: 'absolute',
                        bottom: 8,
                        right: 8,
                        bgcolor: '#123456',
                        color: 'white',
                        '&:hover': { bgcolor: '#1a4e7a' }
                      }}
                      onClick={() => document.getElementById('photo-upload').click()}
                    >
                      <CameraIcon fontSize="small" />
                    </IconButton>
                  </Box>
                </Box>

                <Box sx={{ maxWidth: 600, mx: 'auto' }}>
                  <TextField
                    fullWidth
                    label="Full Name"
                    size="small"
                    sx={{ mb: 3 }}
                    value={formData.fullName}
                    onChange={handleInputChange('fullName')}
                  />

                  <TextField
                    fullWidth
                    label="Phone Number"
                    size="small"
                    sx={{ mb: 3 }}
                    placeholder="+91 9876543210"
                    value={formData.phoneNumber}
                    onChange={handleInputChange('phoneNumber')}
                  />

                  <TextField
                    fullWidth
                    label="Email"
                    value={formData.email}
                    size="small"
                    sx={{ mb: 4 }}
                    disabled
                    helperText="Email cannot be changed."
                  />

                  <Button
                    variant="contained"
                    onClick={handleSaveBasicInfo}
                    sx={{
                      px: 4,
                      py: 1.3,
                      fontSize: '16px',
                      borderRadius: 20,
                      bgcolor: '#123456',
                      '&:hover': { bgcolor: '#1a4e7a' }
                    }}
                  >
                    Save Changes
                  </Button>
                </Box>
              </>
            )}

            {/* --- PASSWORD TAB --- */}
            {tabIndex === 1 && (
              <>
                <Typography variant="h6" sx={{ fontWeight: 600, mb: 3 }}>
                  Update Password
                </Typography>

                <Box sx={{ maxWidth: 500, mx: 'auto' }}>
                  <TextField
                    fullWidth
                    label="New Password"
                    type={showPassword ? 'text' : 'password'}
                    size="small"
                    sx={{ mb: 3 }}
                    value={formData.newPassword}
                    onChange={handleInputChange('newPassword')}
                    InputProps={{
                      endAdornment: (
                        <IconButton onClick={() => setShowPassword(!showPassword)}>
                          {showPassword ? <VisibilityOffIcon /> : <VisibilityIcon />}
                        </IconButton>
                      )
                    }}
                  />

                  <TextField
                    fullWidth
                    label="Confirm Password"
                    type={showConfirmPassword ? 'text' : 'password'}
                    size="small"
                    error={formData.confirmPassword && formData.confirmPassword !== formData.newPassword}
                    helperText={
                      formData.confirmPassword &&
                      formData.confirmPassword !== formData.newPassword
                        ? 'Passwords do not match'
                        : ''
                    }
                    sx={{ mb: 4 }}
                    value={formData.confirmPassword}
                    onChange={handleInputChange('confirmPassword')}
                    InputProps={{
                      endAdornment: (
                        <IconButton onClick={() => setShowConfirmPassword(!showConfirmPassword)}>
                          {showConfirmPassword ? <VisibilityOffIcon /> : <VisibilityIcon />}
                        </IconButton>
                      )
                    }}
                  />

                  <Button
                    variant="contained"
                    onClick={handleSavePassword}
                    sx={{
                      px: 4,
                      py: 1.3,
                      fontSize: '16px',
                      borderRadius: 20,
                      bgcolor: '#123456',
                      '&:hover': { bgcolor: '#1a4e7a' }
                    }}
                  >
                    Save Password
                  </Button>
                </Box>
              </>
            )}

          </CardContent>
        </Box>
      </Card>
    </Box>
  );
}

export default Profile;
