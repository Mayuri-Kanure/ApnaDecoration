import React, { useState } from 'react';
import {
  Box,
  Typography,
  Card,
  CardContent,
  TextField,
  Button,
  Grid,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Switch,
  FormControlLabel,
  Divider,
  Alert,
  Snackbar
} from '@mui/material';
import { Save as SaveIcon, Send as SendIcon } from '@mui/icons-material';

const DeliveryManMailTemplate = () => {
  const [template, setTemplate] = useState('');
  const [subject, setSubject] = useState('');
  const [body, setBody] = useState('');
  const [variables, setVariables] = useState('');
  const [isActive, setIsActive] = useState(true);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });

  const handleSave = () => {
    // Save template logic here
    console.log('Saving delivery man mail template:', { template, subject, body, variables, isActive });
    setSnackbar({ open: true, message: 'Delivery man mail template saved successfully', severity: 'success' });
  };

  const handleSendTest = () => {
    // Send test email logic here
    console.log('Sending test email with template:', { template, subject, body });
    setSnackbar({ open: true, message: 'Test email sent successfully', severity: 'success' });
  };

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" sx={{ mb: 3, fontWeight: 600 }}>
        Delivery Man Mail Template
      </Typography>
      
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Template Name"
                value={template}
                onChange={(e) => setTemplate(e.target.value)}
                sx={{ mb: 2 }}
              />
            </Grid>
            
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Email Subject"
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                sx={{ mb: 2 }}
              />
            </Grid>
            
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Email Body"
                value={body}
                onChange={(e) => setBody(e.target.value)}
                multiline
                rows={6}
                sx={{ mb: 2 }}
              />
            </Grid>
            
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Template Variables"
                value={variables}
                onChange={(e) => setVariables(e.target.value)}
                helperText="Available variables: {{delivery_man_name}}, {{order_id}}, {{delivery_address}}"
                sx={{ mb: 2 }}
              />
            </Grid>
            
            <Grid item xs={12}>
              <FormControlLabel
                control={
                  <Switch
                    checked={isActive}
                    onChange={(e) => setIsActive(e.target.checked)}
                  />
                }
                label="Active Template"
              />
            </Grid>
            
            <Grid item xs={12}>
              <Box sx={{ display: 'flex', gap: 2 }}>
                <Button
                  variant="contained"
                  startIcon={<SaveIcon />}
                  onClick={handleSave}
                >
                  Save Template
                </Button>
                
                <Button
                  variant="outlined"
                  startIcon={<SendIcon />}
                  onClick={handleSendTest}
                >
                  Send Test Email
                </Button>
              </Box>
            </Grid>
          </Grid>
        </CardContent>
      </Card>
      
      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
      >
        <Alert severity={snackbar.severity} sx={{ width: '100%' }}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default DeliveryManMailTemplate;
