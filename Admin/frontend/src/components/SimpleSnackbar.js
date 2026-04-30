import React from 'react';
import { Snackbar, Alert } from '@mui/material';

const SimpleSnackbar = ({ open, message, severity = 'info', autoHideDuration = 4000 }) => {
  return (
    <Snackbar
      open={open}
      autoHideDuration={autoHideDuration}
      onClose={() => {}}
      anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
      sx={{
        // ✅ SIMPLE FIX: Force z-index above AppBar
        zIndex: 2000,
        position: 'fixed',
        // Position below AppBar (64px is default AppBar height)
        top: 64,
        left: '50%',
        transform: 'translateX(-50%)',
        '& .MuiPaper-root': {
          borderRadius: 2,
          boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
          minWidth: '300px',
          maxWidth: '90vw',
        },
      }}
    >
      <Alert 
        onClose={() => {}}
        severity={severity}
        variant="filled"
        sx={{
          width: '100%',
        }}
      >
        {message}
      </Alert>
    </Snackbar>
  );
};

export default SimpleSnackbar;
