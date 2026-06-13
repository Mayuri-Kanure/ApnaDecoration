import React from 'react';
import { Box, Typography, Button, Snackbar, Alert } from '@mui/material';
import { CloudOff as OfflineIcon, CloudDone as OnlineIcon } from '@mui/icons-material';
import useOfflineMode from '../hooks/useOfflineMode';

/**
 * Offline Status Indicator for Delivery App
 */
function OfflineStatusIndicator() {
  const { isOnline, offlineQueue, isSyncing, manualSync } = useOfflineMode();
  const [showAlert, setShowAlert] = React.useState(!isOnline);

  React.useEffect(() => {
    if (!isOnline) {
      setShowAlert(true);
    }
  }, [isOnline]);

  if (isOnline && offlineQueue.length === 0) {
    return null;
  }

  return (
    <>
      {/* Bottom Bar */}
      <Box
        sx={{
          position: 'fixed',
          bottom: 0,
          left: 0,
          right: 0,
          backgroundColor: isOnline ? '#4caf50' : '#f44336',
          color: 'white',
          padding: 1.5,
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          zIndex: 900,
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          {isOnline ? <OnlineIcon /> : <OfflineIcon />}
          <Typography variant="body2" sx={{ fontWeight: 'bold' }}>
            {isOnline ? 'Online' : 'Offline Mode'}
          </Typography>
          {offlineQueue.length > 0 && (
            <Typography variant="caption" sx={{ marginLeft: 2 }}>
              {offlineQueue.length} pending sync
            </Typography>
          )}
        </Box>

        {!isOnline && offlineQueue.length > 0 && (
          <Button
            size="small"
            onClick={manualSync}
            disabled={isSyncing}
            sx={{
              color: 'white',
              border: '1px solid white',
              '&:hover': { backgroundColor: 'rgba(255,255,255,0.1)' },
            }}
          >
            {isSyncing ? 'Syncing...' : 'Sync Now'}
          </Button>
        )}
      </Box>

      {/* Alert Snackbar */}
      <Snackbar
        open={showAlert && !isOnline}
        autoHideDuration={6000}
        onClose={() => setShowAlert(false)}
        anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
      >
        <Alert severity="warning" onClose={() => setShowAlert(false)}>
          📡 You are offline. Your updates will sync when you reconnect.
        </Alert>
      </Snackbar>
    </>
  );
}

export default OfflineStatusIndicator;
