import React, { useEffect } from 'react';
import {
  Box,
  Button,
  Dialog,
  IconButton,
  Typography,
  CircularProgress,
  Alert,
} from '@mui/material';
import {
  Close as CloseIcon,
  CameraAlt as CameraIcon,
  Download as DownloadIcon,
} from '@mui/icons-material';
import useARPreview from '../hooks/useARPreview';

/**
 * AR Product Preview Component
 * Allows users to visualize products in their environment
 */
function ARProductPreview({ open, onClose, product }) {
  const {
    isARSupported,
    isCameraActive,
    error,
    canvasRef,
    videoRef,
    startARCamera,
    stopARCamera,
    captureARScreenshot,
  } = useARPreview();

  // Start camera when dialog opens
  useEffect(() => {
    if (open && isARSupported) {
      startARCamera();
    }

    return () => {
      if (isCameraActive) {
        stopARCamera();
      }
    };
  }, [open, isARSupported, isCameraActive, startARCamera, stopARCamera]);

  // Handle close
  const handleClose = () => {
    stopARCamera();
    onClose();
  };

  // Handle screenshot
  const handleScreenshot = () => {
    const screenshot = captureARScreenshot();
    if (screenshot) {
      const link = document.createElement('a');
      link.href = screenshot;
      link.download = `ar_preview_${product?.id || 'product'}.png`;
      link.click();
    }
  };

  if (!isARSupported) {
    return (
      <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
        <Box sx={{ padding: 3, textAlign: 'center' }}>
          <Typography variant="h6" sx={{ marginBottom: 2 }}>
            AR Not Supported
          </Typography>
          <Typography color="textSecondary">
            Your device does not support AR features. Please update your browser or
            use a device with WebXR support.
          </Typography>
        </Box>
      </Dialog>
    );
  }

  return (
    <Dialog
      open={open}
      onClose={handleClose}
      fullScreen
      sx={{ zIndex: 1000 }}
    >
      {/* Header */}
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          padding: 2,
          backgroundColor: '#1976d2',
          color: 'white',
        }}
      >
        <Typography variant="h6">
          AR Preview: {product?.name || 'Product'}
        </Typography>
        <IconButton onClick={handleClose} sx={{ color: 'white' }}>
          <CloseIcon />
        </IconButton>
      </Box>

      {/* AR View */}
      <Box
        sx={{
          flex: 1,
          position: 'relative',
          backgroundColor: '#000',
          overflow: 'hidden',
        }}
      >
        {/* Video Stream */}
        <video
          ref={videoRef}
          autoPlay
          playsInline
          sx={{
            width: '100%',
            height: '100%',
            objectFit: 'cover',
          }}
          style={{
            width: '100%',
            height: '100%',
            objectFit: 'cover',
          }}
        />

        {/* Canvas for WebGL rendering */}
        <canvas
          ref={canvasRef}
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
          }}
        />

        {/* Loading Indicator */}
        {!isCameraActive && (
          <Box
            sx={{
              position: 'absolute',
              top: '50%',
              left: '50%',
              transform: 'translate(-50%, -50%)',
              textAlign: 'center',
              color: 'white',
            }}
          >
            <CircularProgress sx={{ color: 'white', marginBottom: 2 }} />
            <Typography>Initializing AR...</Typography>
          </Box>
        )}

        {/* Error Message */}
        {error && (
          <Alert
            severity="error"
            sx={{
              position: 'absolute',
              bottom: 20,
              left: 20,
              right: 20,
            }}
          >
            {error}
          </Alert>
        )}
      </Box>

      {/* Bottom Controls */}
      <Box
        sx={{
          padding: 2,
          display: 'flex',
          gap: 2,
          justifyContent: 'center',
          backgroundColor: '#f5f5f5',
          borderTop: '1px solid #e0e0e0',
        }}
      >
        <Button
          variant="contained"
          startIcon={<CameraIcon />}
          onClick={handleScreenshot}
          disabled={!isCameraActive}
        >
          Capture
        </Button>
        <Button
          variant="outlined"
          onClick={handleClose}
        >
          Close
        </Button>
      </Box>

      {/* Product Info Overlay */}
      <Box
        sx={{
          position: 'absolute',
          bottom: 100,
          left: 20,
          right: 20,
          backgroundColor: 'rgba(0, 0, 0, 0.7)',
          color: 'white',
          padding: 2,
          borderRadius: 1,
        }}
      >
        <Typography variant="subtitle2">{product?.name}</Typography>
        <Typography variant="body2" sx={{ marginTop: 1 }}>
          Price: ₹{product?.price}
        </Typography>
        {product?.description && (
          <Typography variant="caption" sx={{ marginTop: 1, display: 'block' }}>
            {product.description}
          </Typography>
        )}
      </Box>
    </Dialog>
  );
}

export default ARProductPreview;
