import React, { useState } from 'react';
import axios from 'axios';
import {
  Box,
  Card,
  CardContent,
  Typography,
  TextField,
  Button,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Checkbox,
  FormControlLabel,
  Link,
  IconButton,
  Grid,
  Paper,
  Snackbar,
  Alert
} from '@mui/material';
import {
  Add as AddIcon,
  Delete as DeleteIcon,
  ArrowBack as ArrowBackIcon
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';

function AddWithdrawalMethod() {
  const navigate = useNavigate();
  const [methodName, setMethodName] = useState('');
  const [isDefaultMethod, setIsDefaultMethod] = useState(false);
  const [fields, setFields] = useState([
    {
      id: 1,
      inputType: 'text',
      fieldName: '',
      placeholderText: '',
      isRequired: false
    }
  ]);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });

  const inputTypes = [
    { value: 'text', label: 'Text' },
    { value: 'number', label: 'Number' },
    { value: 'textarea', label: 'Textarea' },
    { value: 'date', label: 'Date' },
    { value: 'email', label: 'Email' },
    { value: 'file', label: 'File' },
    { value: 'select', label: 'Select Dropdown' }
  ];

  const handleAddField = () => {
    const newField = {
      id: Date.now(),
      inputType: 'text',
      fieldName: '',
      placeholderText: '',
      isRequired: false
    };
    setFields([...fields, newField]);
  };

  const handleRemoveField = (fieldId) => {
    if (fields.length > 1) {
      setFields(fields.filter(field => field.id !== fieldId));
    } else {
      setSnackbar({ open: true, message: 'At least one field is required', severity: 'error' });
    }
  };

  const handleFieldChange = (fieldId, property, value) => {
    const updatedFields = fields.map(field =>
      field.id === fieldId ? { ...field, [property]: value } : field
    );
    setFields(updatedFields);
  };

  const handleReset = () => {
    setMethodName('');
    setIsDefaultMethod(false);
    setFields([
      {
        id: 1,
        inputType: 'text',
        fieldName: '',
        placeholderText: '',
        isRequired: false
      }
    ]);
  };

  const handleSubmit = async () => {
    // Validation
    if (!methodName.trim()) {
      setSnackbar({ open: true, message: 'Method name is required', severity: 'error' });
      return;
    }

    const invalidFields = fields.filter(field => !field.fieldName.trim());
    if (invalidFields.length > 0) {
      setSnackbar({ open: true, message: 'All field names are required', severity: 'error' });
      return;
    }

    // Success
    const methodData = {
      methodName,
      isDefaultMethod,
      fields: fields.map(field => ({
        inputType: field.inputType,
        fieldName: field.fieldName,
        placeholderText: field.placeholderText,
        isRequired: field.isRequired
      }))
    };

    try {
      const token = localStorage.getItem('token');
      const response = await axios.post('http://localhost:5000/api/withdraw-methods', methodData, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      
      setSnackbar({ open: true, message: 'Withdraw method created successfully', severity: 'success' });
      
      // Navigate back after success
      setTimeout(() => {
        navigate('/withdraw-method');
      }, 1500);
    } catch (error) {
      console.error('Error creating withdraw method:', error);
      setSnackbar({ 
        open: true, 
        message: error.response?.data?.message || 'Error creating withdraw method', 
        severity: 'error' 
      });
    }
  };

  return (
    <Box sx={{ p: 3, backgroundColor: '#F5F5F5', minHeight: '100vh' }}>
      {/* Header */}
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 3 }}>
        <IconButton 
          onClick={() => navigate('/withdraw-method')}
          sx={{ color: '#666' }}
        >
          <ArrowBackIcon />
        </IconButton>
        <Typography variant="h5" sx={{ fontWeight: 600, color: '#2C3E50' }}>
          Withdrawal Methods
        </Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={handleAddField}
          sx={{ 
            backgroundColor: '#0d6efd',
            '&:hover': { backgroundColor: '#0b5ed7' },
            ml: 'auto'
          }}
        >
          + Add Fields
        </Button>
      </Box>

      {/* Method Name Card */}
      <Card sx={{ mb: 3, borderRadius: 2, boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }}>
        <CardContent sx={{ p: 3 }}>
          <TextField
            fullWidth
            label="Method Name *"
            value={methodName}
            onChange={(e) => setMethodName(e.target.value)}
            placeholder="e.g., Bank Transfer, PayPal, Crypto Wallet"
            variant="outlined"
            sx={{
              '& .MuiOutlinedInput-root': {
                borderRadius: 2
              }
            }}
          />
        </CardContent>
      </Card>

      {/* Field Configuration Cards */}
      {fields.map((field, index) => (
        <Card 
          key={field.id} 
          sx={{ 
            mb: 3, 
            borderRadius: 2, 
            boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
            position: 'relative'
          }}
        >
          <CardContent sx={{ p: 3 }}>
            {/* Field Header */}
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
              <Typography variant="h6" sx={{ fontWeight: 600, color: '#424242' }}>
                Field {index + 1}
              </Typography>
              {fields.length > 1 && (
                <IconButton
                  onClick={() => handleRemoveField(field.id)}
                  sx={{ 
                    color: '#F44336',
                    '&:hover': { backgroundColor: '#FFEBEE' }
                  }}
                >
                  <DeleteIcon />
                </IconButton>
              )}
            </Box>

            {/* Field Configuration */}
            <Grid container spacing={3}>
              <Grid item xs={12} md={6}>
                <FormControl fullWidth variant="outlined">
                  <InputLabel>Input Field Type *</InputLabel>
                  <Select
                    value={field.inputType}
                    onChange={(e) => handleFieldChange(field.id, 'inputType', e.target.value)}
                    label="Input Field Type *"
                    sx={{ borderRadius: 2 }}
                  >
                    {inputTypes.map(type => (
                      <MenuItem key={type.value} value={type.value}>
                        {type.label}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>

              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Field Name *"
                  value={field.fieldName}
                  onChange={(e) => handleFieldChange(field.id, 'fieldName', e.target.value)}
                  placeholder="e.g., Account Number, IBAN, Wallet Address"
                  variant="outlined"
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      borderRadius: 2
                    }
                  }}
                />
              </Grid>

              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Placeholder Text"
                  value={field.placeholderText}
                  onChange={(e) => handleFieldChange(field.id, 'placeholderText', e.target.value)}
                  placeholder="e.g., Enter your 20-digit IBAN number"
                  variant="outlined"
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      borderRadius: 2
                    }
                  }}
                />
              </Grid>

              <Grid item xs={12}>
                <FormControlLabel
                  control={
                    <Checkbox
                      checked={field.isRequired}
                      onChange={(e) => handleFieldChange(field.id, 'isRequired', e.target.checked)}
                      color="primary"
                    />
                  }
                  label="This Field Required"
                  sx={{ mb: 1 }}
                />
              </Grid>
            </Grid>
          </CardContent>
        </Card>
      ))}

      {/* Footer Controls */}
      <Card sx={{ borderRadius: 2, boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }}>
        <CardContent sx={{ p: 3 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <FormControlLabel
              control={
                <Checkbox
                  checked={isDefaultMethod}
                  onChange={(e) => setIsDefaultMethod(e.target.checked)}
                  color="primary"
                />
              }
              label="Default Method"
            />
            
            <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
              <Link
                component="button"
                variant="body2"
                onClick={handleReset}
                sx={{ 
                  color: '#666',
                  textDecoration: 'none',
                  '&:hover': { textDecoration: 'underline' }
                }}
              >
                Reset
              </Link>
              <Button
                variant="contained"
                onClick={handleSubmit}
                sx={{ 
                  backgroundColor: '#0d6efd',
                  '&:hover': { backgroundColor: '#0b5ed7' },
                  px: 4
                }}
              >
                Submit
              </Button>
            </Box>
          </Box>
        </CardContent>
      </Card>

      {/* Snackbar */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <Alert severity={snackbar.severity} onClose={() => setSnackbar({ ...snackbar, open: false })}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
}

export default AddWithdrawalMethod;
