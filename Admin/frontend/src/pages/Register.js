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
  Avatar,
  Alert
} from '@mui/material'
import {
  Visibility,
  VisibilityOff,
  Business,
  Mail,
  Lock,
  Person
} from '@mui/icons-material'
import { API_BASE_URL } from '../config/api'
import { validateAdminRegister } from '../utils/formValidation'
import './auth.css'

const Register = () => {
  const [formData, setFormData] = useState({
    username: '',
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    password: ''
  })
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [fieldErrors, setFieldErrors] = useState({})
  const navigate = useNavigate()

  const handleChange = (field) => (e) => {
    setFormData({ ...formData, [field]: e.target.value })
    if (fieldErrors[field]) {
      setFieldErrors((prev) => ({ ...prev, [field]: '' }))
    }
    if (error) setError('')
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    const validation = validateAdminRegister(formData)
    if (!validation.valid) {
      setFieldErrors(validation.errors)
      setError(validation.message)
      return
    }
    setFieldErrors({})
    setLoading(true)
    setError('')

    try {
      const res = await axios.post(`${API_BASE_URL}/auth/register`, formData)
      localStorage.setItem('token', res.data.token)
      localStorage.setItem('user', JSON.stringify(res.data.user))
      navigate('/')
    } catch (err) {
      setError(err.response?.data?.message || 'Registration failed')
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
          Create your business account
        </Typography>

        {error && (
          <Alert severity="error" sx={{ mb: 2, width: '100%' }}>
            {error}
          </Alert>
        )}

        <form onSubmit={handleSubmit}>
          <Grid container spacing={2}>
            <Grid item xs={12}>
              <TextField
                fullWidth
                placeholder="Username"
                value={formData.username}
                onChange={handleChange('username')}
                error={!!fieldErrors.username}
                helperText={fieldErrors.username || ' '}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <Person />
                    </InputAdornment>
                  )
                }}
              />
            </Grid>

            <Grid item xs={6}>
              <TextField
                fullWidth
                placeholder="First Name"
                value={formData.firstName}
                onChange={handleChange('firstName')}
                error={!!fieldErrors.firstName}
                helperText={fieldErrors.firstName || ' '}
              />
            </Grid>

            <Grid item xs={6}>
              <TextField
                fullWidth
                placeholder="Last Name"
                value={formData.lastName}
                onChange={handleChange('lastName')}
                error={!!fieldErrors.lastName}
                helperText={fieldErrors.lastName || ' '}
              />
            </Grid>

            <Grid item xs={12}>
              <TextField
                fullWidth
                placeholder="Email Address"
                value={formData.email}
                onChange={handleChange('email')}
                error={!!fieldErrors.email}
                helperText={fieldErrors.email || ' '}
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
                placeholder="Phone Number"
                value={formData.phone}
                onChange={handleChange('phone')}
              />
            </Grid>

            <Grid item xs={12}>
              <TextField
                fullWidth
                type={showPassword ? 'text' : 'password'}
                placeholder="Password"
                value={formData.password}
                onChange={handleChange('password')}
                error={!!fieldErrors.password}
                helperText={fieldErrors.password || ' '}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <Lock />
                    </InputAdornment>
                  ),
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton onClick={() => setShowPassword(!showPassword)}>
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
            {loading ? 'Creating Account...' : 'Create Account'}
          </Button>
        </form>

        <Typography className="auth-link-text">
          Already have an account?
          <a href="/login"> Sign In</a>
        </Typography>
      </Paper>
    </Grid>
  )
}

export default Register
