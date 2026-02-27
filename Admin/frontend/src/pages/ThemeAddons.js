import React, { useState } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Button,
  Tabs,
  Tab,
  Paper,
  IconButton,
  Link,
  Alert,
  Snackbar,
  CircularProgress,
} from '@mui/material';
import {
  CloudUpload as CloudUploadIcon,
  Delete as DeleteIcon,
  CheckCircle as CheckCircleIcon,
  RadioButtonUnchecked as RadioButtonUncheckedIcon,
} from '@mui/icons-material';

export default function ThemeAddons() {
  // Tab state
  const [activeTab, setActiveTab] = useState(0);

  // Addon upload state
  const [addonFile, setAddonFile] = useState(null);
  const [uploadingAddon, setUploadingAddon] = useState(false);
  const [dragOverAddon, setDragOverAddon] = useState(false);

  // Theme upload state
  const [uploadFile, setUploadFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [dragOver, setDragOver] = useState(false);

  // Theme management state
  const [themes, setThemes] = useState([
    {
      id: 1,
      name: 'Default Theme',
      preview: '/api/placeholder/400/250',
      isActive: true,
      isInstalled: true,
    },
    {
      id: 2,
      name: 'Theme Aster',
      preview: '/api/placeholder/400/250',
      isActive: false,
      isInstalled: true,
    },
  ]);

  // Feedback state
  const [snackbar, setSnackbar] = useState({ open: false, severity: "info", msg: "" });

  // Handle tab change
  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue);
  };

  // Handle file selection
  const handleFileSelect = (file) => {
    if (file) {
      // Check file size (50MB limit)
      if (file.size > 50 * 1024 * 1024) {
        setSnackbar({ 
          open: true, 
          severity: "error", 
          msg: "File size exceeds 50MB limit" 
        });
        return;
      }

      // Check file type (must be zip)
      if (!file.name.toLowerCase().endsWith('.zip')) {
        setSnackbar({ 
          open: true, 
          severity: "error", 
          msg: "Must upload a ZIP file" 
        });
        return;
      }

      setUploadFile(file);
    }
  };

  // Handle addon file selection
  const handleAddonFileSelect = (file) => {
    if (file) {
      // Check file size (20MB limit based on PHP settings)
      if (file.size > 20 * 1024 * 1024) {
        setSnackbar({ 
          open: true, 
          severity: "error", 
          msg: "Addon file size exceeds 20MB limit" 
        });
        return;
      }

      setAddonFile(file);
    }
  };

  // Handle drag and drop
  const handleDragOver = (e) => {
    e.preventDefault();
    setDragOver(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    setDragOver(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer.files[0];
    handleFileSelect(file);
  };

  // Handle addon drag and drop
  const handleAddonDragOver = (e) => {
    e.preventDefault();
    setDragOverAddon(true);
  };

  const handleAddonDragLeave = (e) => {
    e.preventDefault();
    setDragOverAddon(false);
  };

  const handleAddonDrop = (e) => {
    e.preventDefault();
    setDragOverAddon(false);
    const file = e.dataTransfer.files[0];
    handleAddonFileSelect(file);
  };

  // Handle file input change
  const handleFileInputChange = (e) => {
    const file = e.target.files[0];
    handleFileSelect(file);
  };

  // Handle addon file input change
  const handleAddonFileInputChange = (e) => {
    const file = e.target.files[0];
    handleAddonFileSelect(file);
  };

  // Handle theme upload
  const handleUpload = async () => {
    if (!uploadFile) {
      setSnackbar({ 
        open: true, 
        severity: "error", 
        msg: "Please select a file to upload" 
      });
      return;
    }

    try {
      setUploading(true);
      // Simulate upload process
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Add new theme to the list
      const newTheme = {
        id: themes.length + 1,
        name: uploadFile.name.replace('.zip', ''),
        preview: '/api/placeholder/400/250',
        isActive: false,
        isInstalled: true,
      };
      
      setThemes([...themes, newTheme]);
      setUploadFile(null);
      setSnackbar({ 
        open: true, 
        severity: "success", 
        msg: "Theme uploaded successfully!" 
      });
    } catch (error) {
      setSnackbar({ 
        open: true, 
        severity: "error", 
        msg: "Failed to upload theme" 
      });
    } finally {
      setUploading(false);
    }
  };

  // Handle addon upload
  const handleAddonUpload = async () => {
    if (!addonFile) {
      setSnackbar({ 
        open: true, 
        severity: "error", 
        msg: "Please select an addon file to upload" 
      });
      return;
    }

    try {
      setUploadingAddon(true);
      // Simulate upload process
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      setAddonFile(null);
      setSnackbar({ 
        open: true, 
        severity: "success", 
        msg: "Addon uploaded and installed successfully!" 
      });
    } catch (error) {
      setSnackbar({ 
        open: true, 
        severity: "error", 
        msg: "Failed to upload addon" 
      });
    } finally {
      setUploadingAddon(false);
    }
  };

  // Handle theme activation
  const handleActivateTheme = (themeId) => {
    setThemes(themes.map(theme => ({
      ...theme,
      isActive: theme.id === themeId
    })));
    setSnackbar({ 
      open: true, 
      severity: "success", 
      msg: "Theme activated successfully!" 
    });
  };

  // Handle theme deletion
  const handleDeleteTheme = (themeId) => {
    const theme = themes.find(t => t.id === themeId);
    if (theme.isActive) {
      setSnackbar({ 
        open: true, 
        severity: "error", 
        msg: "Cannot delete active theme" 
      });
      return;
    }

    setThemes(themes.filter(theme => theme.id !== themeId));
    setSnackbar({ 
      open: true, 
      severity: "success", 
      msg: "Theme deleted successfully!" 
    });
  };

  return (
    <Box sx={{ p: 3 }}>
      {/* Header */}
      <Typography variant="h4" sx={{ fontWeight: 600, mb: 4 }}>
        System Setup
      </Typography>

      {/* Navigation Tabs */}
      <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}>
        <Tabs value={activeTab} onChange={handleTabChange}>
          <Tab label="Theme Setup" />
          <Tab label="System Addons" />
        </Tabs>
      </Box>

      {/* Tab Content */}
      {activeTab === 0 && (
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
          {/* Theme Upload Section */}
          <Card sx={{ borderRadius: 2, boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }}>
            <CardContent sx={{ p: 4 }}>
              <Typography variant="h6" sx={{ fontWeight: 600, mb: 3 }}>
                Theme Upload
              </Typography>
              
              <Box
                sx={{
                  border: `2px dashed ${dragOver ? '#1976d2' : '#ccc'}`,
                  borderRadius: 2,
                  p: 4,
                  textAlign: 'center',
                  backgroundColor: dragOver ? 'rgba(25, 118, 210, 0.04)' : 'transparent',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease',
                }}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                onClick={() => document.getElementById('file-input').click()}
              >
                <CloudUploadIcon sx={{ fontSize: 48, color: '#ccc', mb: 2 }} />
                <Typography variant="body1" sx={{ mb: 1 }}>
                  Drag & drop file or browse file
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                  Maximum file size 50 MB
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Must have to upload zip file
                </Typography>
                {uploadFile && (
                  <Box sx={{ mt: 2, p: 1, backgroundColor: 'grey.100', borderRadius: 1 }}>
                    <Typography variant="body2">
                      Selected: {uploadFile.name}
                    </Typography>
                  </Box>
                )}
              </Box>
              
              <input
                id="file-input"
                type="file"
                accept=".zip"
                onChange={handleFileInputChange}
                style={{ display: 'none' }}
              />
              
              <Button
                variant="contained"
                onClick={handleUpload}
                disabled={!uploadFile || uploading}
                startIcon={uploading ? <CircularProgress size={20} /> : <CloudUploadIcon />}
                sx={{ mt: 3, borderRadius: 2 }}
              >
                {uploading ? "Uploading..." : "Upload"}
              </Button>
            </CardContent>
          </Card>

          {/* Theme Management Section */}
          <Card sx={{ borderRadius: 2, boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }}>
            <CardContent sx={{ p: 4 }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                <Typography variant="h6" sx={{ fontWeight: 600 }}>
                  Theme Management
                </Typography>
                <Link href="#" underline="hover" sx={{ fontSize: 14 }}>
                  Read Before Change Theme
                </Link>
              </Box>
              
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
                {themes.map((theme) => (
                  <Card key={theme.id} sx={{ border: '1px solid #e0e0e0', borderRadius: 2 }}>
                    <CardContent sx={{ p: 3 }}>
                      <Box sx={{ display: 'flex', gap: 3 }}>
                        {/* Theme Preview */}
                        <Box
                          component="img"
                          src={theme.preview}
                          alt={theme.name}
                          sx={{
                            width: 200,
                            height: 125,
                            borderRadius: 1,
                            objectFit: 'cover',
                            border: '1px solid #e0e0e0'
                          }}
                        />
                        
                        {/* Theme Info */}
                        <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                          <Box>
                            <Typography variant="h6" sx={{ fontWeight: 600, mb: 1 }}>
                              {theme.name}
                            </Typography>
                            
                            {/* Status Indicators */}
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                              {theme.isActive ? (
                                <>
                                  <CheckCircleIcon sx={{ color: '#1976d2', fontSize: 20 }} />
                                  <Typography variant="body2" color="primary">
                                    Active Theme
                                  </Typography>
                                </>
                              ) : (
                                <>
                                  <RadioButtonUncheckedIcon sx={{ color: '#ccc', fontSize: 20 }} />
                                  <Typography variant="body2" color="text.secondary">
                                    Installed Theme
                                  </Typography>
                                </>
                              )}
                            </Box>
                          </Box>
                          
                          {/* Actions */}
                          <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
                            {!theme.isActive && (
                              <Button
                                variant="contained"
                                size="small"
                                onClick={() => handleActivateTheme(theme.id)}
                                sx={{ borderRadius: 2 }}
                              >
                                Activate
                              </Button>
                            )}
                            
                            {!theme.isActive && (
                              <IconButton
                                size="small"
                                onClick={() => handleDeleteTheme(theme.id)}
                                sx={{ color: 'error.main' }}
                              >
                                <DeleteIcon />
                              </IconButton>
                            )}
                          </Box>
                        </Box>
                      </Box>
                    </CardContent>
                  </Card>
                ))}
              </Box>
            </CardContent>
          </Card>
        </Box>
      )}

      {activeTab === 1 && (
        <Card sx={{ borderRadius: 2, boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }}>
          <CardContent sx={{ p: 4 }}>
            <Typography variant="h6" sx={{ fontWeight: 600, mb: 3 }}>
              Upload Addons
            </Typography>
            
            <Box
              sx={{
                border: `2px dashed ${dragOverAddon ? '#1976d2' : '#ccc'}`,
                borderRadius: 2,
                p: 4,
                textAlign: 'center',
                backgroundColor: dragOverAddon ? 'rgba(25, 118, 210, 0.04)' : 'transparent',
                cursor: 'pointer',
                transition: 'all 0.2s ease',
                mb: 3,
              }}
              onDragOver={handleAddonDragOver}
              onDragLeave={handleAddonDragLeave}
              onDrop={handleAddonDrop}
              onClick={() => document.getElementById('addon-file-input').click()}
            >
              <CloudUploadIcon sx={{ fontSize: 48, color: '#ccc', mb: 2 }} />
              <Typography variant="body1" sx={{ mb: 1 }}>
                Drag & drop file or browse file
              </Typography>
              {addonFile && (
                <Box sx={{ mt: 2, p: 1, backgroundColor: 'grey.100', borderRadius: 1 }}>
                  <Typography variant="body2">
                    Selected: {addonFile.name}
                  </Typography>
                </Box>
              )}
            </Box>
            
            <input
              id="addon-file-input"
              type="file"
              onChange={handleAddonFileInputChange}
              style={{ display: 'none' }}
            />
            
            {/* PHP Configuration Instructions */}
            <Box sx={{ backgroundColor: '#f5f5f5', p: 3, borderRadius: 2, mb: 3 }}>
              <Typography variant="h6" sx={{ fontWeight: 600, mb: 2, fontSize: 16 }}>
                PHP Configuration
              </Typography>
              
              <Box sx={{ mb: 2 }}>
                <Typography variant="body2" sx={{ mb: 1 }}>
                  Please make sure your server php.upload_max_filesize value is greater or equal to 20MB.
                </Typography>
                <Typography variant="body2" color="primary">
                  Current value is 200MB.
                </Typography>
              </Box>
              
              <Box>
                <Typography variant="body2" sx={{ mb: 1 }}>
                  Please make sure your server php.post_max_size value is greater or equal to 20MB.
                </Typography>
                <Typography variant="body2" color="primary">
                  Current value is 200MB.
                </Typography>
              </Box>
            </Box>
            
            <Button
              variant="contained"
              onClick={handleAddonUpload}
              disabled={!addonFile || uploadingAddon}
              startIcon={uploadingAddon ? <CircularProgress size={20} /> : <CloudUploadIcon />}
              sx={{ borderRadius: 2 }}
            >
              {uploadingAddon ? "Uploading..." : "Upload"}
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Snackbar */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={() => setSnackbar(prev => ({ ...prev, open: false }))}
        anchorOrigin={{ vertical: "top", horizontal: "right" }}
      >
        <Alert
          onClose={() => setSnackbar(prev => ({ ...prev, open: false }))}
          severity={snackbar.severity}
          sx={{ width: "100%" }}
        >
          {snackbar.msg}
        </Alert>
      </Snackbar>
    </Box>
  );
}
