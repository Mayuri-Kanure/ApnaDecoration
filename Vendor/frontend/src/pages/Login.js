import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import {
  Box,
  Card,
  CardContent,
  TextField,
  Button,
  Typography,
  Alert,
  Divider,
  Checkbox,
  FormControlLabel,
  Link
} from '@mui/material';
import LockOutlinedIcon from '@mui/icons-material/LockOutlined';

const VendorLogin = () => {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [formData, setFormData] = useState({ email: '', password: '', remember: false });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (e) => {
    const { name, value, checked, type } = e.target;
    setFormData({
      ...formData,
      [name]: type === 'checkbox' ? checked : value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      console.log('🔐 Sending vendor login data:', { email: formData.email, password: formData.password });
      
      const result = await login({ email: formData.email, password: formData.password });
      
      if (result.success) {
        console.log('✅ Vendor login successful');
        navigate('/dashboard');
      } else {
        console.log('❌ Vendor login failed:', result.error);
        setError(result.error || 'Login failed');
      }
    } catch (err) {
      console.log('🚨 Vendor login error:', err);
      setError('Login failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box
      sx={{
        minHeight: '100vh',
        background: 'linear-gradient(180deg, #0f172a 0%, #1e293b 50%, #334155 100%)',
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        p: 2
      }}
    >
      <Card sx={{ maxWidth: 420, width: '100%', borderRadius: 3, boxShadow: 6 }}>
        <CardContent sx={{ p: 5 }}>
          {/* Header */}
          <Box sx={{ textAlign: 'center', mb: 4 }}>
            <LockOutlinedIcon sx={{ fontSize: 50, color: '#2F66FF', mb: 1 }} />
            <Typography variant="h5" sx={{ fontWeight: 700, color: '#1e293b' }}>
              Vendor Login
            </Typography>
            <Typography variant="body2" sx={{ color: '#64748b', mt: 1 }}>
              Sign in to access your vendor dashboard
            </Typography>
          </Box>

          {/* Error Alert */}
          {error && <Alert severity="error" sx={{ mb: 3 }}>{error}</Alert>}

          {/* Login Form */}
          <Box component="form" onSubmit={handleSubmit}>
            <TextField
              fullWidth
              label="Email"
              name="email"
              type="email"
              value={formData.email}
              onChange={handleChange}
              margin="normal"
              required
              sx={{ mb: 2 }}
            />
            <TextField
              fullWidth
              label="Password"
              name="password"
              type="password"
              value={formData.password}
              onChange={handleChange}
              margin="normal"
              required
              sx={{ mb: 2 }}
            />

            {/* Remember Me + Forgot Password */}
            <Box
              sx={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                mb: 3
              }}
            >
              <FormControlLabel
                control={
                  <Checkbox
                    checked={formData.remember}
                    onChange={handleChange}
                    name="remember"
                    sx={{ color: '#2F66FF' }}
                  />
                }
                label="Remember me"
              />
              <Link href="#" underline="hover" sx={{ fontSize: 14 }}>
                Forgot password?
              </Link>
            </Box>

            <Button
              type="submit"
              fullWidth
              variant="contained"
              disabled={loading}
              sx={{
                backgroundColor: '#2F66FF',
                '&:hover': { backgroundColor: '#1e40af' },
                py: 1.5,
                fontWeight: 600,
                borderRadius: 2
              }}
            >
              {loading ? 'Signing in...' : 'Sign In'}
            </Button>
          </Box>

          {/* Divider */}
          <Divider sx={{ my: 4 }} />

          {/* Optional Footer */}
          <Box sx={{ textAlign: 'center' }}>
            <Typography variant="body2" sx={{ color: '#94a3b8', mb: 1 }}>
              Don't have an account?{' '}
              <Button
                variant="text"
                onClick={() => navigate('/signup')}
                sx={{ color: '#2F66FF', textTransform: 'none' }}
              >
                Sign Up
              </Button>
            </Typography>
            <Typography variant="body2" sx={{ color: '#94a3b8', mt: 1 }}>
              © 2026 Your Company. All rights reserved.
            </Typography>
          </Box>
        </CardContent>
      </Card>
    </Box>
  );
};

export default VendorLogin;
