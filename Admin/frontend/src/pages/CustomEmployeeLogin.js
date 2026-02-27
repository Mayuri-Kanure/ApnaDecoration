import React, { useState } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  TextField,
  Button,
  Alert,
  Container,
  Avatar,
  CircularProgress,
  Link,
  Divider,
} from '@mui/material';
import { Work, Visibility, VisibilityOff } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';

const CustomEmployeeLogin = () => {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    showPassword: false,
    loading: false,
    error: '',
    success: false
  });
  
  const navigate = useNavigate();
  
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value,
      error: '',
      success: false
    }));
  };
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.email || !formData.password) {
      setFormData(prev => ({ ...prev, error: 'Please fill in all fields' }));
      return;
    }
    
    try {
      setFormData(prev => ({ ...prev, loading: true, error: '' }));
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // Simulate successful login
      setFormData(prev => ({ ...prev, loading: false, success: true }));
      
      // Navigate to employee dashboard after successful login
      setTimeout(() => {
        navigate('/dashboard');
      }, 1000);
      
    } catch (error) {
      setFormData(prev => ({ ...prev, loading: false, error: 'Login failed. Please try again.' }));
    }
  };
  
  const togglePasswordVisibility = () => {
    setFormData(prev => ({ ...prev, showPassword: !prev.showPassword }));
  };
  
  return (
    <Container maxWidth="sm">
      <Box
        sx={{
          minHeight: '100vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        }}
      >
        <Card
          sx={{
            maxWidth: 400,
            width: '100%',
            p: 4,
            boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)',
            borderRadius: 2,
          }}
        >
          <CardContent>
            <Box sx={{ textAlign: 'center', mb: 3 }}>
              <Avatar
                sx={{
                  bgcolor: 'secondary.main',
                  width: 56,
                  height: 56,
                  mb: 2,
                }}
              >
                <Work />
              </Avatar>
              <Typography variant="h4" component="h1" gutterBottom={2}>
                Employee Login
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Staff Portal
              </Typography>
            </Box>
            
            {formData.success && (
              <Alert severity="success" sx={{ mb: 2 }}>
                Login successful! Redirecting to dashboard...
                <CircularProgress size={20} sx={{ ml: 2 }} />
              </Alert>
            )}
            
            {formData.error && (
              <Alert severity="error" sx={{ mb: 2 }}>
                {formData.error}
              </Alert>
            )}
            
            <Box component="form" onSubmit={handleSubmit}>
              <TextField
                fullWidth
                label="Email Address"
                type="email"
                value={formData.email}
                onChange={handleChange}
                margin="normal"
                variant="outlined"
                disabled={formData.loading || formData.success}
                autoComplete="email"
              />
              
              <TextField
                fullWidth
                label="Password"
                type={formData.showPassword ? 'text' : 'password'}
                value={formData.password}
                onChange={handleChange}
                margin="normal"
                variant="outlined"
                disabled={formData.loading || formData.success}
                autoComplete="current-password"
                InputProps={{
                  endAdornment: (
                    <Button
                      onClick={togglePasswordVisibility}
                      sx={{ minWidth: 'auto' }}
                    >
                      {formData.showPassword ? <VisibilityOff /> : <Visibility />}
                    </Button>
                  ),
                }}
              />
              
              <Button
                type="submit"
                fullWidth
                variant="contained"
                size="large"
                sx={{ mt: 3, mb: 2 }}
                disabled={formData.loading || formData.success}
              >
                {formData.loading ? (
                  <CircularProgress size={24} />
                ) : (
                  'Sign In'
                )}
              </Button>
              
              <Box sx={{ textAlign: 'center' }}>
                <Link
                  href="/dashboard"
                  variant="body2"
                  color="secondary"
                  underline="hover"
                >
                  Back to Dashboard
                </Link>
              </Box>
              
              <Divider sx={{ my: 2 }} />
              
              <Box sx={{ textAlign: 'center' }}>
                <Typography variant="body2" color="text.secondary">
                  Don't have an account?{' '}
                  <Link href="#" color="secondary" underline="hover">
                    Contact HR
                  </Link>
                </Typography>
              </Box>
            </Box>
          </CardContent>
        </Card>
      </Box>
    </Container>
  );
};

export default CustomEmployeeLogin;
