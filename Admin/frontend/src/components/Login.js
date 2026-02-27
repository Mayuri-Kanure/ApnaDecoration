import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Card,
  CardContent,
  TextField,
  Button,
  Typography,
  Alert,
  Paper,
  IconButton,
  InputAdornment
} from '@mui/material';
import {
  Login as LoginIcon,
  Visibility,
  VisibilityOff
} from '@mui/icons-material';
import { API_BASE_URL } from '../config/api';

function Login({ onLogin }) {
  console.log('Login Component: onLogin prop received', typeof onLogin, onLogin);
  
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    email: 'admin@apna.com',
    password: 'admin123',
  });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      console.log('Login: Attempting login with', { email: formData.email, password: '***' });
      const response = await axios.post(`${API_BASE_URL}/auth/login`, formData);
      
      console.log('Login: Response received', response.data);
      
      if (response.data.token) {
        console.log('Login: Token found, storing in localStorage');
        localStorage.setItem('token', response.data.token);
        localStorage.setItem('user', JSON.stringify(response.data.user));
        
        try {
          console.log('Login: Calling onLogin callback');
          onLogin(response.data.user);
          console.log('Login: onLogin successful - LoginWrapper will handle navigation');
        } catch (loginError) {
          console.error('Login: Error in onLogin callback', loginError);
          setError('Login successful but failed to update authentication state');
        }
      } else {
        console.log('Login: No token in response');
        setError('No token received from server');
      }
    } catch (err) {
      console.error('Login: Error occurred', err.response?.data);
      setError(err.response?.data?.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box
      sx={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        bgcolor: 'background.default',
        p: 2
      }}
    >
      <Paper sx={{ maxWidth: 400, width: '100%' }}>
        <Card>
          <CardContent sx={{ p: 4 }}>
            <Typography variant="h4" sx={{ fontWeight: 700, mb: 2, textAlign: 'center' }}>
              Login
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 4, textAlign: 'center' }}>
              Access your dashboard and manage orders
            </Typography>

            {error && (
              <Alert severity="error" sx={{ mb: 3 }}>
                {error}
              </Alert>
            )}

            <form onSubmit={handleSubmit}>
              <TextField
                fullWidth
                label="Email"
                name="email"
                type="email"
                value={formData.email}
                onChange={handleChange}
                margin="normal"
                required
                autoFocus
              />
              <TextField
                fullWidth
                label="Password"
                name="password"
                type={showPassword ? 'text' : 'password'}
                value={formData.password}
                onChange={handleChange}
                margin="normal"
                required
                InputProps={{
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton
                        aria-label="toggle password visibility"
                        onClick={() => setShowPassword(!showPassword)}
                        onMouseDown={(e) => e.preventDefault()}
                        edge="end"
                      >
                        {showPassword ? <VisibilityOff /> : <Visibility />}
                      </IconButton>
                    </InputAdornment>
                  )
                }}
              />
              <Button
                type="submit"
                fullWidth
                variant="contained"
                size="large"
                startIcon={<LoginIcon />}
                sx={{ mt: 3, mb: 2 }}
                disabled={loading}
              >
                {loading ? 'Signing in...' : 'Sign In'}
              </Button>
            </form>

            <Box sx={{ mt: 3, p: 2, bgcolor: 'grey.100', borderRadius: 1 }}>
              <Typography variant="caption" color="text.secondary">
                <strong>Default Credentials:</strong><br/>
                Email: admin@apnadecoration.com<br/>
                Password: admin123
              </Typography>
            </Box>
          </CardContent>
        </Card>
      </Paper>
    </Box>
  );
}

export default Login;
