import React, { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import axios from 'axios'
import {
  TextField,
  Button,
  Typography,
  Grid,
  Paper,
  IconButton,
  InputAdornment,
  Avatar
} from '@mui/material'
import {
  Visibility,
  VisibilityOff,
  Business,
  Mail,
  Lock
} from '@mui/icons-material'
import { API_BASE_URL } from '../config/api'
import './auth.css'

console.log('🌐 API_BASE_URL loaded:', API_BASE_URL)

const Login = () => {
  const [formData, setFormData] = useState({
    email: 'admin@apnadecoration.com',
    password: 'admin123'
  })
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const navigate = useNavigate()

  const handleChange = (field) => (e) =>
    setFormData({ ...formData, [field]: e.target.value })

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    console.log('🔍 Frontend sending:', formData)
    console.log('🌐 API URL:', `${API_BASE_URL}/auth/login`)

    try {
      const res = await axios.post(`${API_BASE_URL}/auth/login`, formData)
      console.log('✅ Frontend response:', res.data)
      localStorage.setItem('token', res.data.token)
      localStorage.setItem('user', JSON.stringify(res.data.user))
      navigate('/')
    } catch (err) {
      console.log('❌ Frontend error:', err)
      console.log('📄 Error response:', err.response?.data)
      console.log('🔢 Status:', err.response?.status)
      setError(err.response?.data?.message || 'Login failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Grid className="auth-page">
      <Paper className="auth-card">
        <Avatar className="auth-avatar">
          <Business fontSize="large" />
        </Avatar>

        <Typography className="auth-title">APNA DECORATION</Typography>
        <Typography className="auth-subtitle">
          Sign in to your account
        </Typography>

        <form onSubmit={handleSubmit}>
          <Grid container spacing={2}>
            <Grid item xs={12}>
              <TextField
                fullWidth
                variant="outlined"
                name="email"
                placeholder="Email Address"
                value={formData.email}
                onChange={handleChange('email')}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <Mail />
                    </InputAdornment>
                  )
                }}
              />
            </Grid>

            <Grid item xs={12}>
              <TextField
                fullWidth
                variant="outlined"
                name="password"
                type={showPassword ? 'text' : 'password'}
                placeholder="Password"
                value={formData.password}
                onChange={handleChange('password')}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <Lock />
                    </InputAdornment>
                  ),
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton 
                        edge="end"
                        aria-label="toggle password visibility"
                        onClick={() => setShowPassword(!showPassword)}
                        onMouseDown={(e) => e.preventDefault()}
                      >
                        {showPassword ? <VisibilityOff /> : <Visibility />}
                      </IconButton>
                    </InputAdornment>
                  )
                }}
              />
            </Grid>
          </Grid>

          {error && <Typography className="error-text">{error}</Typography>}

          <Button
            type="submit"
            fullWidth
            className="auth-btn"
            disabled={loading}
          >
            {loading ? 'Signing In...' : 'Sign In'}
          </Button>
        </form>

        <Typography className="auth-link-text">
          Don&apos;t have an account?
          <Link to="/register"> Sign Up</Link>
        </Typography>
      </Paper>
    </Grid>
  )
}

export default Login
