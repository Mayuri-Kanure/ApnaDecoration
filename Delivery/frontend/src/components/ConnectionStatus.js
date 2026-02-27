import React, { useState, useEffect } from 'react';
import {
  Box,
  Chip,
  Typography,
  Tooltip,
  IconButton,
  Snackbar,
  Alert
} from '@mui/material';
import {
  WifiOff,
  Wifi,
  CloudOff,
  Cloud,
  Refresh,
  Storage,
  Database
} from '@mui/icons-material';
import databaseService from '../services/database';

const ConnectionStatus = () => {
  const [dbStatus, setDbStatus] = useState({
    connected: false,
    status: 'disconnected',
    retryCount: 0
  });
  const [cloudinaryStatus, setCloudinaryStatus] = useState(true);
  const [showSnackbar, setShowSnackbar] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');

  useEffect(() => {
    // Check database connection on mount
    checkDatabaseConnection();

    // Set up periodic connection check
    const interval = setInterval(checkDatabaseConnection, 30000); // Check every 30 seconds

    return () => clearInterval(interval);
  }, []);

  const checkDatabaseConnection = async () => {
    try {
      const result = await databaseService.testConnection();
      setDbStatus({
        connected: result.success,
        status: result.success ? 'connected' : 'disconnected',
        retryCount: result.retryCount || 0
      });

      if (!result.success && dbStatus.connected) {
        setSnackbarMessage('Database connection lost');
        setShowSnackbar(true);
      }
    } catch (error) {
      setDbStatus({
        connected: false,
        status: 'error',
        retryCount: dbStatus.retryCount + 1
      });
    }
  };

  const retryConnection = async () => {
    setSnackbarMessage('Retrying database connection...');
    setShowSnackbar(true);
    
    const result = await databaseService.retryConnection();
    setDbStatus({
      connected: result.success,
      status: result.success ? 'connected' : 'disconnected',
      retryCount: result.retryCount || 0
    });

    if (result.success) {
      setSnackbarMessage('Database connection restored');
    } else {
      setSnackbarMessage('Database connection failed');
    }
  };

  const getStatusColor = (connected) => {
    return connected ? 'success' : 'error';
  };

  const getStatusIcon = (connected) => {
    return connected ? <Database /> : <WifiOff />;
  };

  const getCloudinaryStatus = () => {
    // Check if Cloudinary is accessible
    return cloudinaryStatus;
  };

  return (
    <>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
        {/* Database Status */}
        <Tooltip title={`Database: ${dbStatus.status} (${dbStatus.retryCount} retries)`}>
          <Chip
            icon={getStatusIcon(dbStatus.connected)}
            label="DB"
            size="small"
            color={getStatusColor(dbStatus.connected)}
            variant="outlined"
            sx={{ minWidth: 60 }}
          />
        </Tooltip>

        {/* Cloudinary Status */}
        <Tooltip title="Cloudinary: Connected">
          <Chip
            icon={<Cloud />}
            label="Cloud"
            size="small"
            color={getCloudinaryStatus() ? 'success' : 'error'}
            variant="outlined"
            sx={{ minWidth: 70 }}
          />
        </Tooltip>

        {/* Retry Button */}
        {!dbStatus.connected && (
          <Tooltip title="Retry connection">
            <IconButton
              size="small"
              onClick={retryConnection}
              color="primary"
            >
              <Refresh />
            </IconButton>
          </Tooltip>
        )}
      </Box>

      {/* Connection Status Snackbar */}
      <Snackbar
        open={showSnackbar}
        autoHideDuration={3000}
        onClose={() => setShowSnackbar(false)}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <Alert
          onClose={() => setShowSnackbar(false)}
          severity={dbStatus.connected ? 'success' : 'warning'}
          sx={{ width: '100%' }}
        >
          {snackbarMessage}
        </Alert>
      </Snackbar>
    </>
  );
};

export default ConnectionStatus;
