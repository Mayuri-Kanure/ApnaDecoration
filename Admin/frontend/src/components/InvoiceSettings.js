import React, { useState, useEffect } from 'react';
import {
  Box,
  Grid,
  Card,
  CardContent,
  Typography,
  TextField,
  Button,
  CircularProgress,
  RadioGroup,
  FormControlLabel,
  Radio,
  Avatar,
  IconButton,
} from '@mui/material';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';

// Safe trim utility function to prevent runtime errors
const safeTrim = (value) => (typeof value === 'string' ? value.trim() : '');

const InvoiceSettings = () => {
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [settings, setSettings] = useState({
    termsAndConditions: '',
    businessIdentityType: '',
    businessIdentityValue: '',
    invoiceLogo: null,
    invoiceLogoPreview: '',
  });

  // Load settings from backend
  useEffect(() => {
    const fetchSettings = async () => {
      try {
        setLoading(true);
        const res = await fetch('http://localhost:5000/api/settings/invoice');
        const data = await res.json();
        setSettings({
          termsAndConditions: data.termsAndConditions || '',
          businessIdentityType: data.businessIdentityType || '',
          businessIdentityValue: data.businessIdentityValue || '',
          invoiceLogo: data.invoiceLogo || null,
          invoiceLogoPreview: data.invoiceLogoPreview || '',
        });
      } catch (err) {
        console.error('Error fetching invoice settings:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchSettings();
  }, []);

  const handleChange = (field, value) => {
    if (!field || value === undefined || value === null) {
      console.error('Invalid field or value in handleChange:', { field, value });
      return;
    }
    setSettings((prev) => ({ ...prev, [field]: value }));
  };

  const handleLogoUpload = (event) => {
    if (!event || !event.target || !event.target.files) {
      console.error('Invalid event in handleLogoUpload');
      return;
    }
    
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setSettings(prev => ({
          ...prev,
          invoiceLogo: file,
          invoiceLogoPreview: reader.result
        }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSave = async () => {
    // Validation
    const termsAndConditions = settings?.termsAndConditions;
    const businessIdentityValue = settings?.businessIdentityValue;
    
    if (!safeTrim(termsAndConditions)) {
      alert('Please enter terms and conditions');
      return;
    }
    if (!settings?.businessIdentityType) {
      alert('Please select a business identity type');
      return;
    }
    if (!safeTrim(businessIdentityValue)) {
      alert('Please enter business identity value');
      return;
    }

    try {
      if (!settings) {
        console.error('Settings not initialized');
        return;
      }
      
      setSaving(true);
      const formData = new FormData();
      formData.append('termsAndConditions', safeTrim(settings.termsAndConditions));
      formData.append('businessIdentityType', settings.businessIdentityType || '');
      formData.append('businessIdentityValue', safeTrim(settings.businessIdentityValue));
      
      if (settings && settings.invoiceLogo) {
        formData.append('invoiceLogo', settings.invoiceLogo);
      }

      const res = await fetch('http://localhost:5000/api/settings/invoice', {
        method: 'PUT',
        body: formData,
      });

      const data = await res.json();
      console.log('Saved:', data);
      alert('Invoice Settings Saved Successfully');
    } catch (err) {
      console.error('Error saving settings:', err);
      alert('Failed to save settings');
    } finally {
      setSaving(false);
    }
  };

  if (loading || !settings)
    return (
      <Box display="flex" justifyContent="center" mt={5}>
        <CircularProgress />
      </Box>
    );

  return (
    <Box sx={{ p: 3 }}>
      {/* Invoice Settings Card */}
      <Card sx={{ borderRadius: 2, boxShadow: '0 6px 18px rgba(15,23,42,0.06)' }}>
        <CardContent sx={{ p: 3 }}>
          <Typography variant="h6" sx={{ mb: 3, fontWeight: 600 }}>
            Invoice Settings
          </Typography>

          <Grid container spacing={4}>
            {/* Left Column - Form Fields */}
            <Grid item xs={12} md={7}>
              {/* Terms & Condition Section */}
              <Box sx={{ mb: 4 }}>
                <Typography variant="body2" sx={{ mb: 2, fontWeight: 500 }}>
                  Terms & Condition
                </Typography>
                <TextField
                  fullWidth
                  multiline
                  rows={4}
                  placeholder="Terms & Condition"
                  value={settings.termsAndConditions || ''}
                  onChange={(e) => handleChange('termsAndConditions', e.target.value)}
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      borderRadius: '6px',
                    }
                  }}
                />
              </Box>

              {/* Business Identity Section */}
              <Box sx={{ mb: 4 }}>
                <Typography variant="body2" sx={{ mb: 2, fontWeight: 500 }}>
                  Business Identity
                </Typography>
                <RadioGroup
                  row
                  value={settings.businessIdentityType}
                  onChange={(e) => handleChange('businessIdentityType', e.target.value)}
                  sx={{ mb: 2 }}
                >
                  <FormControlLabel value="taxId" control={<Radio size="small" />} label="Tax ID" />
                  <FormControlLabel value="binNumber" control={<Radio size="small" />} label="BIN Number" />
                  <FormControlLabel value="musak" control={<Radio size="small" />} label="Musak" />
                </RadioGroup>
                <TextField
                  fullWidth
                  label="Enter"
                  value={settings.businessIdentityValue || ''}
                  onChange={(e) => handleChange('businessIdentityValue', e.target.value)}
                  placeholder="Enter business identity number"
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      borderRadius: '6px',
                    }
                  }}
                />
              </Box>

              {/* Invoice Logo Upload Section */}
              <Box sx={{ mb: 4 }}>
                <Typography variant="body2" sx={{ mb: 2, fontWeight: 500 }}>
                  Invoice Logo (1000 × 308 Px)
                </Typography>
                <Button
                  variant="outlined"
                  component="label"
                  startIcon={<CloudUploadIcon />}
                  sx={{ textTransform: 'none', mb: 2 }}
                >
                  Upload Logo
                  <input
                    type="file"
                    hidden
                    accept="image/*"
                    onChange={handleLogoUpload}
                  />
                </Button>
              </Box>
            </Grid>

            {/* Right Column - Logo Preview */}
            <Grid item xs={12} md={5}>
              <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%' }}>
                <Box
                  sx={{
                    width: '100%',
                    maxWidth: 400,
                    height: 124,
                    border: '2px dashed #ccc',
                    borderRadius: '6px',
                    display: 'flex',
                    justifyContent: 'center',
                    alignItems: 'center',
                    backgroundColor: '#f9f9f9',
                    overflow: 'hidden'
                  }}
                >
                  {settings.invoiceLogoPreview ? (
                    <img
                      src={settings.invoiceLogoPreview}
                      alt="Invoice Logo Preview"
                      style={{
                        width: '100%',
                        height: '100%',
                        objectFit: 'contain'
                      }}
                    />
                  ) : (
                    <Typography variant="body2" color="text.secondary" sx={{ textAlign: 'center', p: 2 }}>
                      Logo Preview
                    </Typography>
                  )}
                </Box>
              </Box>
            </Grid>
          </Grid>

          {/* Save Button */}
          <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 4 }}>
            <Button
              variant="contained"
              color="primary"
              onClick={handleSave}
              disabled={saving}
              sx={{
                minWidth: 120,
                boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
                '&:hover': {
                  boxShadow: '0 4px 8px rgba(0,0,0,0.2)',
                }
              }}
            >
              {saving ? <CircularProgress size={22} /> : 'Save'}
            </Button>
          </Box>
        </CardContent>
      </Card>
    </Box>
  );
};

export default InvoiceSettings;
