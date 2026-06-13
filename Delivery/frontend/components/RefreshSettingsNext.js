import { useState } from 'react';
import {
  Box,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  FormControlLabel,
  Switch,
  MenuItem,
  Select,
  FormControl,
  InputLabel,
  Stack,
  Typography,
  IconButton,
  Tooltip,
} from '@mui/material';
import { Settings as SettingsIcon, Refresh as RefreshIcon } from '@mui/icons-material';

/**
 * Next.js compatible Refresh Settings Dialog Component
 */
export const RefreshSettingsNext = ({
  autoRefreshEnabled,
  onAutoRefreshChange,
  refreshInterval,
  onRefreshIntervalChange,
  onManualRefresh,
  isRefreshing,
}) => {
  const [open, setOpen] = useState(false);
  const [tempInterval, setTempInterval] = useState(refreshInterval);

  const handleOpen = () => setOpen(true);
  const handleClose = () => {
    setTempInterval(refreshInterval);
    setOpen(false);
  };

  const handleSave = () => {
    onRefreshIntervalChange(tempInterval);
    setOpen(false);
  };

  const refreshIntervalOptions = [
    { value: 30000, label: '30 seconds' },
    { value: 1 * 60000, label: '1 minute' },
    { value: 2 * 60000, label: '2 minutes' },
    { value: 5 * 60000, label: '5 minutes' },
    { value: 10 * 60000, label: '10 minutes' },
    { value: 15 * 60000, label: '15 minutes' },
    { value: 30 * 60000, label: '30 minutes' },
  ];

  return (
    <>
      {/* Quick Refresh Button */}
      <Tooltip title="Refresh now">
        <IconButton
          onClick={onManualRefresh}
          disabled={isRefreshing}
          size="small"
          sx={{ mr: 1 }}
        >
          <RefreshIcon sx={{ animation: isRefreshing ? 'spin 1s linear infinite' : 'none' }} />
        </IconButton>
      </Tooltip>

      {/* Settings Button */}
      <Tooltip title="Auto-refresh settings">
        <IconButton onClick={handleOpen} size="small">
          <SettingsIcon />
        </IconButton>
      </Tooltip>

      {/* Settings Dialog */}
      <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
        <DialogTitle>Auto-Refresh Settings</DialogTitle>
        <DialogContent sx={{ pt: 3 }}>
          <Stack spacing={3}>
            {/* Enable/Disable Toggle */}
            <FormControlLabel
              control={
                <Switch
                  checked={autoRefreshEnabled}
                  onChange={(e) => onAutoRefreshChange(e.target.checked)}
                />
              }
              label={
                <Box>
                  <Typography variant="subtitle1">Enable Auto-Refresh</Typography>
                  <Typography variant="caption" color="textSecondary">
                    Automatically refresh dashboard data at regular intervals
                  </Typography>
                </Box>
              }
            />

            {/* Interval Selection */}
            {autoRefreshEnabled && (
              <FormControl fullWidth>
                <InputLabel>Refresh Interval</InputLabel>
                <Select
                  value={tempInterval}
                  label="Refresh Interval"
                  onChange={(e) => setTempInterval(e.target.value)}
                >
                  {refreshIntervalOptions.map((option) => (
                    <MenuItem key={option.value} value={option.value}>
                      {option.label}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            )}

            {/* Status Info */}
            <Box sx={{ p: 2, bgcolor: 'action.hover', borderRadius: 1 }}>
              <Typography variant="caption" color="textSecondary">
                Current Status:
              </Typography>
              <Typography variant="body2" sx={{ mt: 0.5 }}>
                {autoRefreshEnabled ? (
                  <>
                    ✅ Auto-refresh enabled - updates every{' '}
                    {tempInterval / 1000 < 60
                      ? `${tempInterval / 1000}s`
                      : `${tempInterval / 60000}min`}
                  </>
                ) : (
                  '⏸️ Auto-refresh disabled - manual refresh only'
                )}
              </Typography>
            </Box>
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose}>Cancel</Button>
          <Button onClick={handleSave} variant="contained">
            Save Settings
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default RefreshSettingsNext;
