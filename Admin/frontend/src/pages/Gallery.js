import React, { useState, useEffect, useRef } from 'react';
import {
  Box,
  Typography,
  Paper,
  Button,
  Modal,
  TextField,
  Grid,
  Card,
  CardContent,
  IconButton,
  Snackbar,
  Alert,
  CircularProgress,
  Tabs,
  Tab,
  InputAdornment,
  LinearProgress
} from '@mui/material';
import {
  Folder as FolderIcon,
  Add as AddIcon,
  Close as CloseIcon,
  CloudUpload as CloudUploadIcon,
  Image as ImageIcon,
  Archive as ArchiveIcon
} from '@mui/icons-material';
import axios from 'axios';

const Gallery = () => {
  const [folders, setFolders] = useState([]);
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [selectedFolder, setSelectedFolder] = useState(null);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });
  const [activeTab, setActiveTab] = useState(0);

  // File input refs
  const imageInputRef = useRef(null);
  const zipInputRef = useRef(null);

  // Modal states
  const [uploadModalOpen, setUploadModalOpen] = useState(false);
  const [newFolderModalOpen, setNewFolderModalOpen] = useState(false);
  const [newFolderName, setNewFolderName] = useState('');

  // File upload states
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [selectedZip, setSelectedZip] = useState(null);
  const [targetFolder, setTargetFolder] = useState('general');

  useEffect(() => {
    loadFolders();
  }, []);

  const loadFolders = async () => {
    setLoading(true);
    try {
      const response = await axios.get('/api/file-manager/folders');
      setFolders(response.data);
    } catch (error) {
      console.error('Error loading folders:', error);
      // Fallback to default folders if API fails
      setFolders(defaultFolders.map(folder => ({ ...folder, count: 0 })));
      setSnackbar({
        open: true,
        message: 'Using default folders - backend connection failed',
        severity: 'warning'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue);
  };

  const handleUploadModalOpen = () => {
    setUploadModalOpen(true);
    setSelectedFiles([]);
    setSelectedZip(null);
    setTargetFolder('general');
  };

  const handleUploadModalClose = () => {
    setUploadModalOpen(false);
    setSelectedFiles([]);
    setSelectedZip(null);
    setUploadProgress(0);
  };

  const handleNewFolderModalOpen = () => {
    setNewFolderModalOpen(true);
    setNewFolderName('');
  };

  const handleNewFolderModalClose = () => {
    setNewFolderModalOpen(false);
    setNewFolderName('');
  };

  const handleFileSelect = (event) => {
    const files = Array.from(event.target.files);
    setSelectedFiles(files);
  };

  const handleZipSelect = (event) => {
    const file = event.target.files[0];
    setSelectedZip(file);
  };

  const validateFiles = () => {
    if (selectedFiles.length === 0 && !selectedZip) {
      setSnackbar({
        open: true,
        message: 'Please select at least one file to upload',
        severity: 'error'
      });
      return false;
    }

    // Validate file types
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp', 'application/zip'];
    
    for (const file of selectedFiles) {
      if (!allowedTypes.includes(file.type)) {
        setSnackbar({
          open: true,
          message: `Invalid file type: ${file.name}. Only JPEG, PNG, GIF, WebP, and ZIP files are allowed.`,
          severity: 'error'
        });
        return false;
      }
    }

    if (selectedZip && selectedZip.type !== 'application/zip') {
      setSnackbar({
        open: true,
        message: 'Invalid ZIP file type',
        severity: 'error'
      });
      return false;
    }

    return true;
  };

  const handleUpload = async () => {
    if (!validateFiles()) return;

    setUploading(true);
    setUploadProgress(0);

    try {
      const formData = new FormData();
      formData.append('folder', targetFolder);

      // Add image files
      selectedFiles.forEach(file => {
        formData.append('files', file);
      });

      // Add ZIP file if selected
      if (selectedZip) {
        formData.append('files', selectedZip);
      }

      const response = await axios.post('/api/file-manager/upload', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        },
        onUploadProgress: (progressEvent) => {
          const progress = Math.round((progressEvent.loaded * 100) / progressEvent.total);
          setUploadProgress(progress);
        }
      });

      setSnackbar({
        open: true,
        message: response.data.message,
        severity: 'success'
      });

      handleUploadModalClose();
      await loadFolders();
    } catch (error) {
      console.error('Upload error:', error);
      setSnackbar({
        open: true,
        message: error.response?.data?.message || 'Error uploading files',
        severity: 'error'
      });
    } finally {
      setUploading(false);
      setUploadProgress(0);
    }
  };

  const handleCreateFolder = async () => {
    if (!newFolderName.trim()) {
      setSnackbar({
        open: true,
        message: 'Please enter a folder name',
        severity: 'error'
      });
      return;
    }

    try {
      const response = await axios.post('/api/file-manager/folders', {
        folderName: newFolderName.trim()
      });

      setSnackbar({
        open: true,
        message: response.data.message,
        severity: 'success'
      });

      handleNewFolderModalClose();
      await loadFolders();
    } catch (error) {
      console.error('Create folder error:', error);
      setSnackbar({
        open: true,
        message: error.response?.data?.message || 'Error creating folder',
        severity: 'error'
      });
    }
  };

  const handleFolderClick = (folder) => {
    setSelectedFolder(folder);
    // In a real implementation, this would open the folder to show files
    console.log('Opening folder:', folder.name);
  };

  const handleCloseSnackbar = () => {
    setSnackbar(prev => ({ ...prev, open: false }));
  };

  const getTotalFileCount = () => {
    return folders.reduce((total, folder) => total + folder.count, 0);
  };

  const defaultFolders = [
    { name: 'product', count: 0, icon: <ImageIcon /> },
    { name: 'banner', count: 0, icon: <ImageIcon /> },
    { name: 'brand', count: 0, icon: <ImageIcon /> },
    { name: 'admin', count: 0, icon: <ImageIcon /> },
    { name: 'category', count: 0, icon: <ImageIcon /> },
    { name: 'company', count: 0, icon: <ImageIcon /> },
    { name: 'deal', count: 0, icon: <ImageIcon /> },
    { name: 'notification', count: 0, icon: <ImageIcon /> },
    { name: 'profile', count: 0, icon: <ImageIcon /> },
    { name: 'refund', count: 0, icon: <ImageIcon /> },
    { name: 'review', count: 0, icon: <ImageIcon /> },
    { name: 'general', count: 0, icon: <FolderIcon /> }
  ];

  // Merge default folders with existing folders
  const allFolders = defaultFolders.map(defaultFolder => {
    const existingFolder = folders.find(f => f.name === defaultFolder.name);
    return existingFolder || defaultFolder;
  });

  return (
    <Box sx={{ p: 4, backgroundColor: '#f5f5f5', minHeight: '100vh' }}>
      {/* Header */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
        <div>
          <Typography variant="h4" sx={{ 
            fontWeight: 300, 
            color: '#1e3a5f',
            mb: 1
          }}>
            File Manager
          </Typography>
          <Typography variant="subtitle1" sx={{ color: '#666' }}>
            Local Storage
          </Typography>
        </div>
        
        <Box sx={{ display: 'flex', gap: 2 }}>
          <Button
            variant="outlined"
            startIcon={<FolderIcon />}
            onClick={handleNewFolderModalOpen}
            sx={{
              borderColor: '#1e3a5f',
              color: '#1e3a5f',
              textTransform: 'none',
              '&:hover': {
                borderColor: '#2d5a8c',
                backgroundColor: '#f8f9fa'
              }
            }}
          >
            New Folder
          </Button>
          
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={handleUploadModalOpen}
            sx={{
              backgroundColor: '#1e3a5f',
              color: 'white',
              textTransform: 'none',
              '&:hover': {
                backgroundColor: '#2d5a8c'
              }
            }}
          >
            + Add New
          </Button>
        </Box>
      </Box>

      {/* Storage Tabs */}
      <Paper sx={{ mb: 4, backgroundColor: 'white', borderRadius: 2, boxShadow: '0 2px 12px rgba(0,0,0,0.08)' }}>
        <Tabs
          value={activeTab}
          onChange={handleTabChange}
          sx={{
            '& .MuiTabs-indicator': {
              backgroundColor: '#1e3a5f',
            },
            '& .MuiTab-root.Mui-selected': {
              color: '#1e3a5f',
            }
          }}
        >
          <Tab label="Local Storage" />
          <Tab label="Cloud Storage" disabled />
        </Tabs>
      </Paper>

      {/* Public Folder Section */}
      <Paper sx={{ 
        p: 4, 
        backgroundColor: 'white',
        borderRadius: 2,
        boxShadow: '0 2px 12px rgba(0,0,0,0.08)'
      }}>
        <Typography variant="h6" sx={{ 
          mb: 3, 
          fontWeight: 500,
          color: '#333'
        }}>
          Public ({getTotalFileCount()})
        </Typography>

        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', p: 6 }}>
            <CircularProgress />
          </Box>
        ) : (
          <Grid container spacing={3}>
            {allFolders.map((folder) => (
              <Grid item xs={12} sm={6} md={4} lg={3} key={folder.name}>
                <Card
                  sx={{
                    cursor: 'pointer',
                    transition: 'all 0.2s',
                    '&:hover': {
                      boxShadow: '0 4px 20px rgba(0,0,0,0.12)',
                      transform: 'translateY(-2px)'
                    },
                    border: '1px solid #e0e0e0',
                    borderRadius: 2
                  }}
                  onClick={() => handleFolderClick(folder)}
                >
                  <CardContent sx={{ textAlign: 'center', p: 3 }}>
                    <Box sx={{ 
                      display: 'flex', 
                      justifyContent: 'center',
                      mb: 2,
                      color: '#ff9800'
                    }}>
                      <FolderIcon sx={{ fontSize: 48 }} />
                    </Box>
                    <Typography variant="body1" sx={{ fontWeight: 500, textTransform: 'capitalize' }}>
                      {folder.name}
                    </Typography>
                    <Typography variant="caption" sx={{ color: '#666' }}>
                      {folder.count} items
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        )}
      </Paper>

      {/* Upload Modal */}
      <Modal open={uploadModalOpen} onClose={handleUploadModalClose}>
        <Box
          sx={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            width: 500,
            bgcolor: 'white',
            borderRadius: 2,
            boxShadow: 24,
            p: 4
          }}
        >
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
            <Typography variant="h6">Upload File</Typography>
            <IconButton onClick={handleUploadModalClose}>
              <CloseIcon />
            </IconButton>
          </Box>

          {uploading && (
            <Box sx={{ mb: 3 }}>
              <LinearProgress variant="determinate" value={uploadProgress} />
              <Typography variant="caption" sx={{ mt: 1, display: 'block' }}>
                Uploading... {uploadProgress}%
              </Typography>
            </Box>
          )}

          <Box sx={{ mb: 3 }}>
            {/* Choose Images Input */}
            <Box sx={{ mb: 3 }}>
              <Typography variant="body2" sx={{ mb: 1, fontWeight: 500 }}>
                Choose Images
              </Typography>
              <Box
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  border: '1px solid #ccc',
                  borderRadius: 1,
                  overflow: 'hidden'
                }}
              >
                <input
                  ref={imageInputRef}
                  type="file"
                  multiple
                  accept="image/*"
                  onChange={handleFileSelect}
                  style={{ 
                    display: 'none'
                  }}
                />
                <TextField
                  fullWidth
                  variant="outlined"
                  value={selectedFiles.length > 0 ? `${selectedFiles.length} file(s) selected` : ''}
                  placeholder="Click browse to select images"
                  onClick={() => imageInputRef.current?.click()}
                  InputProps={{
                    readOnly: true,
                    style: { cursor: 'pointer' }
                  }}
                  sx={{
                    '& .MuiOutlinedInput-notchedOutline': {
                      border: 'none'
                    }
                  }}
                />
                <Button
                  variant="outlined"
                  onClick={() => imageInputRef.current?.click()}
                  sx={{
                    borderLeft: '1px solid #ccc',
                    borderRadius: 0,
                    borderTopRightRadius: 4,
                    borderBottomRightRadius: 4,
                    textTransform: 'none',
                    minWidth: 80
                  }}
                >
                  Browse
                </Button>
              </Box>
            </Box>

            {/* Upload ZIP File Input */}
            <Box sx={{ mb: 3 }}>
              <Typography variant="body2" sx={{ mb: 1, fontWeight: 500 }}>
                Upload Zip File
              </Typography>
              <Box
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  border: '1px solid #ccc',
                  borderRadius: 1,
                  overflow: 'hidden'
                }}
              >
                <input
                  ref={zipInputRef}
                  type="file"
                  accept=".zip"
                  onChange={handleZipSelect}
                  style={{ 
                    display: 'none'
                  }}
                />
                <TextField
                  fullWidth
                  variant="outlined"
                  value={selectedZip ? selectedZip.name : ''}
                  placeholder="Click browse to select ZIP file"
                  onClick={() => zipInputRef.current?.click()}
                  InputProps={{
                    readOnly: true,
                    style: { cursor: 'pointer' }
                  }}
                  sx={{
                    '& .MuiOutlinedInput-notchedOutline': {
                      border: 'none'
                    }
                  }}
                />
                <Button
                  variant="outlined"
                  onClick={() => zipInputRef.current?.click()}
                  sx={{
                    borderLeft: '1px solid #ccc',
                    borderRadius: 0,
                    borderTopRightRadius: 4,
                    borderBottomRightRadius: 4,
                    textTransform: 'none',
                    minWidth: 80
                  }}
                >
                  Browse
                </Button>
              </Box>
            </Box>

            {/* Target Folder Selection */}
            <TextField
              select
              label="Target Folder"
              value={targetFolder}
              onChange={(e) => setTargetFolder(e.target.value)}
              fullWidth
              sx={{ mb: 3 }}
            >
              {allFolders.map((folder) => (
                <option key={folder.name} value={folder.name}>
                  {folder.name.charAt(0).toUpperCase() + folder.name.slice(1)}
                </option>
              ))}
            </TextField>
          </Box>

          <Button
            variant="contained"
            onClick={handleUpload}
            disabled={uploading}
            sx={{
              backgroundColor: '#1e3a5f',
              color: 'white',
              textTransform: 'none',
              '&:hover': {
                backgroundColor: '#2d5a8c'
              }
            }}
          >
            {uploading ? 'Uploading...' : 'Upload'}
          </Button>
        </Box>
      </Modal>

      {/* New Folder Modal */}
      <Modal open={newFolderModalOpen} onClose={handleNewFolderModalClose}>
        <Box
          sx={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            width: 400,
            bgcolor: 'white',
            borderRadius: 2,
            boxShadow: 24,
            p: 4
          }}
        >
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
            <Typography variant="h6">Create New Folder</Typography>
            <IconButton onClick={handleNewFolderModalClose}>
              <CloseIcon />
            </IconButton>
          </Box>

          <TextField
            label="Folder Name"
            value={newFolderName}
            onChange={(e) => setNewFolderName(e.target.value)}
            fullWidth
            sx={{ mb: 3 }}
          />

          <Button
            variant="contained"
            onClick={handleCreateFolder}
            fullWidth
            sx={{
              backgroundColor: '#1e3a5f',
              color: 'white',
              textTransform: 'none',
              '&:hover': {
                backgroundColor: '#2d5a8c'
              }
            }}
          >
            Create Folder
          </Button>
        </Box>
      </Modal>

      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
      >
        <Alert onClose={handleCloseSnackbar} severity={snackbar.severity}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default Gallery;
