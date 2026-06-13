import React, { useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Switch,
  FormControlLabel,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Box,
  Typography,
} from '@mui/material';

/**
 * Refresh Settings Dialog for User Panel
 */
function RefreshSettings({
  open,
  onClose,
  autoRefreshEnabled,
  setAutoRefreshEnabled,
  refreshInterval,
  setRefreshInterval,
}) {
  const [tempInterval, setTempInterval] = useState(refreshInterval);
  const [tempEnabled, setTempEnabled] = useState(autoRefreshEnabled);

  const intervalOptions = [
    { value: 30000, label: '30 seconds' },
    { value: 60000, label: '1 minute' },
    { value: 2 * 60000, label: '2 minutes' },
    { value: 5 * 60000, label: '5 minutes' },
    { value: 10 * 60000, label: '10 minutes' },
    { value: 15 * 60000, label: '15 minutes' },
    { value: 30 * 60000, label: '30 minutes' },
  ];

  const handleSave = () => {
    setAutoRefreshEnabled(tempEnabled);
    setRefreshInterval(tempInterval);
    onClose();
  };

  const handleReset = () => {
    setTempEnabled(autoRefreshEnabled);
    setTempInterval(refreshInterval);
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>Auto-Refresh Settings</DialogTitle>
      <DialogContent sx={{ display: 'flex', flexDirection: 'column', gap: 2, pt: 2 }}>
        {/* Enable/Disable */}
        <FormControlLabel
          control={
            <Switch
              checked={tempEnabled}
              onChange={(e) => setTempEnabled(e.target.checked)}
            />
          }
          label="Enable Auto-Refresh"
        />

        {/* Status */}
        <Typography variant="body2" color="textSecondary">
          Status: {tempEnabled ? '🟢 Active' : '🔴 Inactive'}
        </Typography>

        {/* Interval Selection */}
        <FormControl fullWidth disabled={!tempEnabled}>
          <InputLabel>Refresh Interval</InputLabel>
          <Select
            value={tempInterval}
            onChange={(e) => setTempInterval(e.target.value)}
            label="Refresh Interval"
          >
            {intervalOptions.map((option) => (
              <MenuItem key={option.value} value={option.value}>
                {option.label}
              </MenuItem>
            ))}
          </Select>
        </FormControl>

        {/* Info */}
        <Box sx={{ p: 2, backgroundColor: '#f5f5f5', borderRadius: 1 }}>
          <Typography variant="caption">
            💡 Auto-refresh will update your orders, products, and account data at the
            selected interval.
          </Typography>
        </Box>
      </DialogContent>
      <DialogActions>
        <Button onClick={handleReset}>Reset</Button>
        <Button onClick={onClose}>Cancel</Button>
        <Button onClick={handleSave} variant="contained">
          Save
        </Button>
      </DialogActions>
    </Dialog>
  );
}

export default RefreshSettings;
