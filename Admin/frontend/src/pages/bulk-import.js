import React, { useState } from 'react';
import {
  Box,
  Paper,
  Typography,
  Button,
  Grid,
  TextField,
  IconButton,
  Stack,
  Divider,
} from '@mui/material';
import {
  CloudUpload,
  ArrowDownward,
  Refresh,
} from '@mui/icons-material';
import axios from 'axios';

export default function BulkImport() {
  const [selectedFile, setSelectedFile] = useState(null);
  const [dragActive, setDragActive] = useState(false);
  const [loading, setLoading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);

  // Handle file selection
  const handleFileSelect = (file) => {
    if (file && (file.type === 'application/vnd.ms-excel' || 
                file.type === 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' ||
                file.type === 'text/csv')) {
      setSelectedFile(file);
    } else {
      alert('Please upload a valid Excel or CSV file');
    }
  };

  // Handle drag events
  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileSelect(e.dataTransfer.files[0]);
    }
  };

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      handleFileSelect(e.target.files[0]);
    }
  };

  // Download template
  const downloadTemplate = async () => {
    try {
      const response = await axios.get('/api/bulk-import/template', {
        responseType: 'blob'
      });
      
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', 'bulk_import_template.xlsx');
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (error) {
      console.error('Error downloading template:', error);
      alert('Failed to download template');
    }
  };

  // Reset form
  const handleReset = () => {
    setSelectedFile(null);
    setUploadProgress(0);
  };

  // Submit file
  const handleSubmit = async () => {
    if (!selectedFile) {
      alert('Please select a file to upload');
      return;
    }

    setLoading(true);
    const formData = new FormData();
    formData.append('file', selectedFile);

    try {
      const response = await axios.post('/api/bulk-import/upload', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
        onUploadProgress: (progressEvent) => {
          const progress = Math.round(
            (progressEvent.loaded * 100) / progressEvent.total
          );
          setUploadProgress(progress);
        },
      });

      alert('Products imported successfully!');
      handleReset();
    } catch (error) {
      console.error('Error uploading file:', error);
      alert(error.response?.data?.message || 'Failed to import products');
    } finally {
      setLoading(false);
      setUploadProgress(0);
    }
  };

  return (
    <Box sx={{ p: 3, backgroundColor: '#f8fafc', minHeight: '100vh' }}>
      <Paper 
        elevation={0}
        sx={{ 
          p: 4, 
          borderRadius: 3,
          background: 'white',
          border: '1px solid #e2e8f0',
          boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)'
        }}
      >
        {/* Page Header */}
        <Typography variant="h4" sx={{ fontWeight: 700, color: '#1e293b', mb: 4 }}>
          Bulk Import
        </Typography>

        {/* Instructions Panel */}
        <Box sx={{ mb: 4 }}>
          <Typography variant="h6" sx={{ fontWeight: 600, color: '#374151', mb: 3 }}>
            Instructions
          </Typography>
          
          <Box component="ol" sx={{ pl: 3, mb: 3 }}>
            <Box component="li" sx={{ mb: 2, color: '#4b5563', lineHeight: 1.6 }}>
              <Typography variant="body2">
                Download the bulk import template and fill in your product data
              </Typography>
            </Box>
            <Box component="li" sx={{ mb: 2, color: '#4b5563', lineHeight: 1.6 }}>
              <Typography variant="body2">
                Make sure to use correct Brand ID and Category ID (refer to existing data)
              </Typography>
            </Box>
            <Box component="li" sx={{ mb: 2, color: '#4b5563', lineHeight: 1.6 }}>
              <Typography variant="body2">
                Fill all required fields marked with asterisk (*)
              </Typography>
            </Box>
            <Box component="li" sx={{ mb: 2, color: '#4b5563', lineHeight: 1.6 }}>
              <Typography variant="body2">
                For product images, use relative paths or image names that exist in your system
              </Typography>
            </Box>
            <Box component="li" sx={{ mb: 2, color: '#4b5563', lineHeight: 1.6 }}>
              <Typography variant="body2">
                Save the file as Excel (.xlsx) or CSV format
              </Typography>
            </Box>
            <Box component="li" sx={{ mb: 2, color: '#4b5563', lineHeight: 1.6 }}>
              <Typography variant="body2">
                Upload the file using the form below and click Submit
              </Typography>
            </Box>
          </Box>

          {/* Template Download Link */}
          <Box sx={{ mb: 4 }}>
            <Typography variant="body2" sx={{ color: '#6b7280', mb: 1 }}>
              Don't have the template?
            </Typography>
            <Button
              variant="text"
              startIcon={<ArrowDownward />}
              onClick={downloadTemplate}
              sx={{
                color: '#2563eb',
                textTransform: 'none',
                fontWeight: 600,
                '&:hover': {
                  backgroundColor: '#eff6ff',
                }
              }}
            >
              Download Template
            </Button>
          </Box>
        </Box>

        <Divider sx={{ mb: 4 }} />

        {/* File Upload Section */}
        <Box>
          <Typography variant="h6" sx={{ fontWeight: 600, color: '#374151', mb: 3 }}>
            Upload File
          </Typography>

          {/* Drag & Drop Area */}
          <Box
            sx={{
              border: dragActive ? '2px dashed #2563eb' : '2px dashed #cbd5e1',
              borderRadius: 2,
              p: 6,
              textAlign: 'center',
              backgroundColor: dragActive ? '#f0f9ff' : '#f8fafc',
              cursor: 'pointer',
              transition: 'all 0.2s ease',
              '&:hover': {
                backgroundColor: '#f1f5f9',
                borderColor: '#94a3b8',
              }
            }}
            onDragEnter={handleDrag}
            onDragLeave={handleDrag}
            onDragOver={handleDrag}
            onDrop={handleDrop}
            onClick={() => document.getElementById('file-input').click()}
          >
            <CloudUpload sx={{ fontSize: 48, color: '#9ca3af', mb: 2 }} />
            
            <Typography variant="body1" sx={{ color: '#374151', mb: 1 }}>
              Drag & drop file or browse file
            </Typography>
            
            <Typography variant="caption" sx={{ color: '#9ca3af' }}>
              Supported formats: Excel (.xlsx, .xls) and CSV
            </Typography>
            
            <input
              id="file-input"
              type="file"
              accept=".xlsx,.xls,.csv"
              onChange={handleFileChange}
              style={{ display: 'none' }}
            />
          </Box>

          {/* Selected File Display */}
          {selectedFile && (
            <Box sx={{ mt: 3, p: 2, backgroundColor: '#f0f9ff', borderRadius: 2, border: '1px solid #bfdbfe' }}>
              <Typography variant="body2" sx={{ color: '#1e40af' }}>
                Selected file: {selectedFile.name} ({(selectedFile.size / 1024).toFixed(2)} KB)
              </Typography>
            </Box>
          )}

          {/* Upload Progress */}
          {loading && uploadProgress > 0 && (
            <Box sx={{ mt: 3 }}>
              <Typography variant="body2" sx={{ color: '#6b7280', mb: 1 }}>
                Uploading... {uploadProgress}%
              </Typography>
              <Box
                sx={{
                  width: '100%',
                  height: 8,
                  backgroundColor: '#e5e7eb',
                  borderRadius: 4,
                  overflow: 'hidden'
                }}
              >
                <Box
                  sx={{
                    width: `${uploadProgress}%`,
                    height: '100%',
                    backgroundColor: '#2563eb',
                    transition: 'width 0.3s ease'
                  }}
                />
              </Box>
            </Box>
          )}
        </Box>

        {/* Form Actions */}
        <Box sx={{ mt: 6, display: 'flex', justifyContent: 'flex-end', gap: 2 }}>
          <Button
            variant="outlined"
            onClick={handleReset}
            disabled={loading}
            sx={{
              borderRadius: 2,
              px: 4,
              py: 1.5,
              textTransform: 'none',
              fontWeight: 600,
              borderColor: '#cbd5e1',
              color: '#64748b',
              '&:hover': {
                backgroundColor: '#f1f5f9',
                borderColor: '#94a3b8',
              }
            }}
          >
            Reset
          </Button>
          
          <Button
            variant="contained"
            onClick={handleSubmit}
            disabled={loading || !selectedFile}
            sx={{
              background: 'linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%)',
              boxShadow: '0 4px 14px rgba(37, 99, 235, 0.3)',
              borderRadius: 2,
              px: 4,
              py: 1.5,
              textTransform: 'none',
              fontWeight: 600,
              color: 'white !important',
              '&:hover': {
                background: 'linear-gradient(135deg, #1d4ed8 0%, #1e40af 100%)',
                boxShadow: '0 6px 20px rgba(37, 99, 235, 0.4)',
                transform: 'translateY(-1px)',
              },
              transition: 'all 0.2s ease',
            }}
          >
            {loading ? 'Processing...' : 'Submit'}
          </Button>
        </Box>
      </Paper>
    </Box>
  );
}
