import React, { useState, useEffect, useRef } from 'react';
import {
  Box,
  Typography,
  Paper,
  TextField,
  Button,
  Tabs,
  Tab,
  Snackbar,
  Alert,
  CircularProgress,
  IconButton,
  Card,
  CardContent,
  Grid,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  FormControlLabel,
  Switch
} from '@mui/material';
import {
  CloudUpload as CloudUploadIcon,
  Close as CloseIcon,
  Image as ImageIcon,
  Add as AddIcon,
  Delete as DeleteIcon,
  Edit as EditIcon,
  DragIndicator as DragIndicatorIcon
} from '@mui/icons-material';
import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || 'https://admin-api.apnadecoration.com/api';

const VendorRegistration = () => {
  const [activeTab, setActiveTab] = useState(0);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });

  // Form data
  const [formData, setFormData] = useState({
    headerTitle: '',
    headerSubtitle: '',
    headerImage: '',
    whySellTitle: '',
    whySellSubtitle: '',
    whySellPoints: [],
    businessProcess: {
      mainTitle: '3 Easy Steps To Start Selling',
      mainSubtitle: 'Start selling quickly and easily with our simple onboarding process',
      steps: [
        {
          title: 'Get Registered',
          description: 'Sign up and create your vendor account in minutes',
          image: ''
        },
        {
          title: 'Upload Products',
          description: 'Add your products with images and details',
          image: ''
        },
        {
          title: 'Start Selling',
          description: 'Begin receiving orders and grow your business',
          image: ''
        }
      ]
    },
    downloadApp: {
      title: 'Download Free Vendor App',
      subtitle: 'Manage your business on the go with our mobile app',
      appImage: '',
      playStore: {
        enabled: true,
        url: 'https://play.google.com/store/apps/details?id=com.example.vendorapp'
      },
      appStore: {
        enabled: true,
        url: 'https://apps.apple.com/app/example-vendor-app/id123456789'
      }
    },
    faq: {
      title: 'Frequently Asked Questions',
      items: [
        {
          question: 'How do I start selling?',
          answer: 'Simply register as a seller, list your products, and start receiving orders.',
          priority: 1,
          status: true
        },
        {
          question: 'What are the commission rates?',
          answer: 'Our commission rates are competitive and vary by product category.',
          priority: 2,
          status: true
        }
      ]
    }
  });

  // Why Sell With Us state
  const [editingPoint, setEditingPoint] = useState(null);
  const [newPoint, setNewPoint] = useState({
    title: '',
    description: '',
    priority: 0,
    status: true
  });

  // Image upload
  const [selectedImage, setSelectedImage] = useState(null);
  const [imagePreview, setImagePreview] = useState('');
  const imageInputRef = useRef(null);

  // Business Process image upload state
  const [businessProcessImages, setBusinessProcessImages] = useState({
    step0: { file: null, preview: '' },
    step1: { file: null, preview: '' },
    step2: { file: null, preview: '' }
  });
  const businessProcessImageRefs = {
    step0: useRef(null),
    step1: useRef(null),
    step2: useRef(null)
  };

  // Download App image upload state
  const [downloadAppImage, setDownloadAppImage] = useState({ file: null, preview: '' });
  const downloadAppImageRef = useRef(null);

  // FAQ state
  const [editingFaqItem, setEditingFaqItem] = useState(null);
  const [showFaqForm, setShowFaqForm] = useState(false);
  const [newFaqItem, setNewFaqItem] = useState({
    question: '',
    answer: '',
    priority: 1,
    status: true
  });

  // Available icons for points
  const availableIcons = [
    { value: 'star', label: 'Star' },
    { value: 'trending_up', label: 'Trending Up' },
    { value: 'payments', label: 'Payments' },
    { value: 'campaign', label: 'Campaign' },
    { value: 'support_agent', label: 'Support Agent' },
    { value: 'local_shipping', label: 'Shipping' },
    { value: 'security', label: 'Security' },
    { value: 'analytics', label: 'Analytics' },
    { value: 'inventory', label: 'Inventory' },
    { value: 'storefront', label: 'Storefront' }
  ];

  const tabs = [
    { label: 'Header', id: 'header' },
    { label: 'Why Sell With Us', id: 'why-sell' },
    { label: 'Business Process', id: 'business-process' },
    { label: 'Download App', id: 'download-app' },
    { label: 'FAQ', id: 'faq' }
  ];

  useEffect(() => {
    loadVendorRegistration();
  }, []);

  const loadVendorRegistration = async () => {
    setLoading(true);
    try {
      const response = await axios.get('/api/vendor-registration');
      const data = response.data;
      
      setFormData(prev => ({
        ...prev,
        headerTitle: data.headerTitle || '',
        headerSubtitle: data.headerSubtitle || '',
        headerImage: data.headerImage || '',
        whySellTitle: data.whySellTitle || '',
        whySellSubtitle: data.whySellSubtitle || '',
        whySellPoints: data.whySellPoints || [],
        businessProcess: data.businessProcess || prev.businessProcess,
        downloadApp: data.downloadApp || prev.downloadApp,
        faq: data.faq || prev.faq
      }));
      
      setImagePreview(data.headerImage || '');
    } catch (error) {
      console.error('Error loading vendor registration:', error);
      setSnackbar({
        open: true,
        message: 'Error loading vendor registration data',
        severity: 'error'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue);
  };

  const handleInputChange = (field) => (event) => {
    setFormData(prev => ({
      ...prev,
      [field]: event.target.value
    }));
  };

  const handleImageSelect = (event) => {
    const file = event.target.files[0];
    
    if (file) {
      // Validate file type
      const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
      if (!allowedTypes.includes(file.type)) {
        setSnackbar({
          open: true,
          message: 'Invalid file type. Only JPG, PNG, JPEG, and WEBP files are allowed.',
          severity: 'error'
        });
        return;
      }

      // Validate file size (2MB)
      if (file.size > 2 * 1024 * 1024) {
        setSnackbar({
          open: true,
          message: 'File size must be less than 2MB.',
          severity: 'error'
        });
        return;
      }

      setSelectedImage(file);
      
      // Create preview
      const reader = new FileReader();
      reader.onload = (e) => {
        setImagePreview(e.target.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleRemoveImage = () => {
    setSelectedImage(null);
    setImagePreview('');
    if (imageInputRef.current) {
      imageInputRef.current.value = '';
    }
  };

  // Business Process image handling functions
  const handleBusinessProcessImageSelect = (stepIndex, event) => {
    const file = event.target.files[0];
    if (file) {
      // Validate file size (2MB)
      if (file.size > 2 * 1024 * 1024) {
        setSnackbar({
          open: true,
          message: 'Image size must be less than 2MB',
          severity: 'error'
        });
        return;
      }

      // Validate file type
      const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
      if (!allowedTypes.includes(file.type)) {
        setSnackbar({
          open: true,
          message: 'Only JPG, PNG, and WEBP formats are allowed',
          severity: 'error'
        });
        return;
      }

      const reader = new FileReader();
      reader.onloadend = () => {
        setBusinessProcessImages(prev => ({
          ...prev,
          [`step${stepIndex}`]: {
            file: file,
            preview: reader.result
          }
        }));

        // Update form data
        setFormData(prev => ({
          ...prev,
          businessProcess: {
            ...prev.businessProcess,
            steps: prev.businessProcess.steps.map((step, index) => 
              index === stepIndex ? { ...step, image: reader.result } : step
            )
          }
        }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleRemoveBusinessProcessImage = (stepIndex) => {
    setBusinessProcessImages(prev => ({
      ...prev,
      [`step${stepIndex}`]: { file: null, preview: '' }
    }));

    // Update form data
    setFormData(prev => ({
      ...prev,
      businessProcess: {
        ...prev.businessProcess,
        steps: prev.businessProcess.steps.map((step, index) => 
          index === stepIndex ? { ...step, image: '' } : step
        )
      }
    }));

    if (businessProcessImageRefs[`step${stepIndex}`].current) {
      businessProcessImageRefs[`step${stepIndex}`].current.value = '';
    }
  };

  // Download App image handling functions
  const handleDownloadAppImageSelect = (event) => {
    const file = event.target.files[0];
    if (file) {
      // Validate file size (2MB)
      if (file.size > 2 * 1024 * 1024) {
        setSnackbar({
          open: true,
          message: 'Image size must be less than 2MB',
          severity: 'error'
        });
        return;
      }

      // Validate file type
      const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
      if (!allowedTypes.includes(file.type)) {
        setSnackbar({
          open: true,
          message: 'Only JPG, PNG, and WEBP formats are allowed',
          severity: 'error'
        });
        return;
      }

      const reader = new FileReader();
      reader.onloadend = () => {
        setDownloadAppImage({
          file: file,
          preview: reader.result
        });

        // Update form data
        setFormData(prev => ({
          ...prev,
          downloadApp: {
            ...prev.downloadApp,
            appImage: reader.result
          }
        }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleRemoveDownloadAppImage = () => {
    setDownloadAppImage({ file: null, preview: '' });

    // Update form data
    setFormData(prev => ({
      ...prev,
      downloadApp: {
        ...prev.downloadApp,
        appImage: ''
      }
    }));

    if (downloadAppImageRef.current) {
      downloadAppImageRef.current.value = '';
    }
  };

  // FAQ handling functions
  const handleAddFaqItem = () => {
    if (!newFaqItem.question.trim() || !newFaqItem.answer.trim()) {
      setSnackbar({
        open: true,
        message: 'Please fill in both question and answer fields',
        severity: 'error'
      });
      return;
    }

    if (editingFaqItem !== null) {
      // Update existing FAQ item
      setFormData(prev => ({
        ...prev,
        faq: {
          ...prev.faq,
          items: prev.faq.items.map((item, index) => 
            index === editingFaqItem ? { 
              ...item, 
              question: newFaqItem.question, 
              answer: newFaqItem.answer,
              priority: newFaqItem.priority,
              status: newFaqItem.status
            } : item
          )
        }
      }));
    } else {
      // Add new FAQ item
      setFormData(prev => ({
        ...prev,
        faq: {
          ...prev.faq,
          items: [...prev.faq.items, { 
            question: newFaqItem.question, 
            answer: newFaqItem.answer,
            priority: newFaqItem.priority,
            status: newFaqItem.status
          }]
        }
      }));
    }

    // Reset form
    setNewFaqItem({ question: '', answer: '', priority: 1, status: true });
    setEditingFaqItem(null);
    setShowFaqForm(false);
  };

  const handleEditFaqItem = (index) => {
    const item = formData.faq.items[index];
    setNewFaqItem({ 
      question: item.question, 
      answer: item.answer,
      priority: item.priority || 1,
      status: item.status !== false
    });
    setEditingFaqItem(index);
    setShowFaqForm(true);
  };

  const handleDeleteFaqItem = (index) => {
    setFormData(prev => ({
      ...prev,
      faq: {
        ...prev.faq,
        items: prev.faq.items.filter((_, i) => i !== index)
      }
    }));
  };

  const handleCancelFaqEdit = () => {
    setNewFaqItem({ question: '', answer: '', priority: 1, status: true });
    setEditingFaqItem(null);
    setShowFaqForm(false);
  };

  const handleOpenFaqForm = () => {
    setNewFaqItem({ question: '', answer: '', priority: 1, status: true });
    setEditingFaqItem(null);
    setShowFaqForm(true);
  };

  const validateForm = () => {
    if (!formData.headerTitle.trim()) {
      setSnackbar({
        open: true,
        message: 'Please enter a title',
        severity: 'error'
      });
      return false;
    }

    if (!formData.headerSubtitle.trim()) {
      setSnackbar({
        open: true,
        message: 'Please enter a subtitle',
        severity: 'error'
      });
      return false;
    }

    return true;
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;

    setSaving(true);
    try {
      // Upload image if selected
      let imagePath = formData.headerImage;
      if (selectedImage) {
        const imageFormData = new FormData();
        imageFormData.append('image', selectedImage);
        
        const imageResponse = await axios.post('/api/vendor-registration/upload-header-image', imageFormData, {
          headers: {
            'Content-Type': 'multipart/form-data'
          }
        });
        
        imagePath = imageResponse.data.imagePath;
      }

      // Update form data
      const updateData = {
        ...formData,
        headerImage: imagePath
      };

      await axios.put('/api/vendor-registration', updateData);
      
      setSnackbar({
        open: true,
        message: 'Vendor registration updated successfully',
        severity: 'success'
      });

      // Reload data to get latest
      await loadVendorRegistration();
    } catch (error) {
      console.error('Error saving vendor registration:', error);
      setSnackbar({
        open: true,
        message: error.response?.data?.message || 'Error saving vendor registration',
        severity: 'error'
      });
    } finally {
      setSaving(false);
    }
  };

  const handleReset = () => {
    setFormData(prev => ({
      ...prev,
      headerTitle: '',
      headerSubtitle: '',
      headerImage: '',
      whySellTitle: '',
      whySellSubtitle: '',
      whySellPoints: []
    }));
    setSelectedImage(null);
    setImagePreview('');
    if (imageInputRef.current) {
      imageInputRef.current.value = '';
    }
    setNewPoint({ title: '', description: '', priority: 0, status: true });
    setEditingPoint(null);
  };

const handleCancelEdit = () => {
    setEditingPoint(null);
    setNewPoint({ title: '', description: '', priority: 0, status: true });
  };

  // Why Sell With Us functions
  const handleAddPoint = () => {
    if (!newPoint.title.trim() || !newPoint.description.trim()) {
      setSnackbar({
        open: true,
        message: 'Please fill in both title and description for the reason',
        severity: 'error'
      });
      return;
    }

    if (editingPoint !== null) {
      // Update existing point
      const updatedPoints = [...formData.whySellPoints];
      updatedPoints[editingPoint] = { ...newPoint };
      setFormData(prev => ({ ...prev, whySellPoints: updatedPoints }));
      setEditingPoint(null);
    } else {
      // Add new point
      setFormData(prev => ({
        ...prev,
        whySellPoints: [...prev.whySellPoints, { ...newPoint }]
      }));
    }

    // Reset form
    setNewPoint({ title: '', description: '', priority: 0, status: true });
  };

  const handleEditPoint = (index) => {
    const point = formData.whySellPoints[index];
    setNewPoint({ 
      title: point.title,
      description: point.description,
      priority: point.priority || 0,
      status: point.status !== undefined ? point.status : true
    });
    setEditingPoint(index);
  };

  const handleDeletePoint = (index) => {
    const updatedPoints = formData.whySellPoints.filter((_, i) => i !== index);
    setFormData(prev => ({ ...prev, whySellPoints: updatedPoints }));
    
    if (editingPoint === index) {
      setEditingPoint(null);
      setNewPoint({ title: '', description: '', priority: 0, status: true });
    }
  };

const handleMovePoint = (index, direction) => {
  const points = [...formData.whySellPoints];
  const newIndex = direction === 'up' ? index - 1 : index + 1;
  
  if (newIndex >= 0 && newIndex < points.length) {
    [points[index], points[newIndex]] = [points[newIndex], points[index]];
    setFormData(prev => ({ ...prev, whySellPoints: points }));
  }
};

const handleCloseSnackbar = () => {
  setSnackbar(prev => ({ ...prev, open: false }));
};

const renderHeaderTab = () => (
  <Card sx={{ backgroundColor: 'white', borderRadius: 2, boxShadow: '0 2px 12px rgba(0,0,0,0.08)' }}>
    <CardContent sx={{ p: 4 }}>
      <Typography variant="h6" sx={{ mb: 4, fontWeight: 500, color: '#333' }}>
        Header Section
      </Typography>

      {/* Title and Subtitle Fields */}
      <Box sx={{ display: 'flex', gap: 3, mb: 4 }}>
        <TextField
          label="Title"
          value={formData.headerTitle}
          onChange={handleInputChange('headerTitle')}
          fullWidth
          sx={{
            '& .MuiOutlinedInput-root': {
              borderRadius: 2
            }
          }}
        />
        <TextField
          label="Sub Title"
          value={formData.headerSubtitle}
          onChange={handleInputChange('headerSubtitle')}
          fullWidth
          sx={{
            '& .MuiOutlinedInput-root': {
              borderRadius: 2
            }
          }}
        />
      </Box>

      {/* Image Upload */}
      <Box sx={{ mb: 4 }}>
        <Typography variant="body2" sx={{ mb: 2, fontWeight: 500 }}>
          Image
        </Typography>
        
        <Box
          sx={{
            border: '2px dashed #ccc',
            borderRadius: 2,
            p: 4,
            textAlign: 'center',
            backgroundColor: '#fafafa',
            position: 'relative',
            minHeight: 200,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center'
          }}
        >
          {imagePreview ? (
            <Box sx={{ position: 'relative', width: '100%' }}>
              <img
                src={imagePreview.startsWith('data:') ? imagePreview : imagePreview.startsWith('http') ? imagePreview : `${API_BASE_URL}${imagePreview}`}
                alt="Header preview"
                style={{
                  maxWidth: '100%',
                  maxHeight: 200,
                  objectFit: 'contain'
                }}
              />
              <IconButton
                onClick={handleRemoveImage}
                sx={{
                  position: 'absolute',
                  top: -10,
                  right: -10,
                  backgroundColor: 'white',
                  boxShadow: 2,
                  '&:hover': {
                    backgroundColor: '#f5f5f5'
                  }
                }}
              >
                <CloseIcon />
              </IconButton>
            </Box>
          ) : (
            <>
              <input
                ref={imageInputRef}
                type="file"
                accept="image/*"
                onChange={handleImageSelect}
                style={{ display: 'none' }}
              />
              <CloudUploadIcon sx={{ fontSize: 48, color: '#ccc', mb: 2 }} />
              <Typography variant="body2" sx={{ color: '#666', mb: 1 }}>
                Click to upload image
              </Typography>
              <Typography variant="caption" sx={{ color: '#999' }}>
                Size: 310px × 240px
              </Typography>
            </>
          )}
        </Box>

        {!imagePreview && (
          <Button
            variant="outlined"
            onClick={() => imageInputRef.current?.click()}
            sx={{ mt: 2 }}
          >
            Choose Image
          </Button>
        )}

        <Typography variant="caption" sx={{ display: 'block', mt: 2, color: '#666' }}>
          Allowed formats: jpg, png, jpeg, webp | Max size: 2 MB
        </Typography>
      </Box>

      {/* Action Buttons */}
      <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 2 }}>
        <Button
          variant="outlined"
          onClick={handleReset}
          sx={{
            borderColor: '#ccc',
            color: '#666',
            textTransform: 'none',
            '&:hover': {
              borderColor: '#999',
              backgroundColor: '#f5f5f5'
            }
          }}
        >
          Reset
        </Button>
        <Button
          variant="contained"
          onClick={handleSubmit}
          disabled={saving}
          sx={{
            backgroundColor: '#1e3a5f',
            color: 'white',
            textTransform: 'none',
            '&:hover': {
              backgroundColor: '#2d5a8c'
            }
          }}
        >
          {saving ? 'Saving...' : 'Submit'}
        </Button>
      </Box>
    </CardContent>
  </Card>
);

const renderWhySellWithUsTab = () => (
  <Card sx={{ backgroundColor: 'white', borderRadius: 2, boxShadow: '0 2px 12px rgba(0,0,0,0.08)' }}>
    <CardContent sx={{ p: 4 }}>
      <Typography variant="h6" sx={{ mb: 4, fontWeight: 500, color: '#333' }}>
        Why Sell With Us
      </Typography>

      {/* Title and Subtitle Fields - Side by Side */}
      <Box sx={{ display: 'flex', gap: 3, mb: 4 }}>
        <TextField
          label="Main Title"
          value={formData.whySellTitle}
          onChange={handleInputChange('whySellTitle')}
          fullWidth
          sx={{
            '& .MuiOutlinedInput-root': {
              borderRadius: 2
            }
          }}
        />
        <TextField
          label="Subtitle"
          value={formData.whySellSubtitle || ''}
          onChange={handleInputChange('whySellSubtitle')}
          fullWidth
          multiline
          rows={2}
          sx={{
            '& .MuiOutlinedInput-root': {
              borderRadius: 2
            }
          }}
        />
      </Box>

      {/* Image Upload Area */}
      <Box sx={{ mb: 4 }}>
        <Typography variant="body2" sx={{ mb: 2, fontWeight: 500 }}>
          Header Banner
        </Typography>
        
        <Box
          sx={{
            border: '2px dashed #ccc',
            borderRadius: 2,
            p: 4,
            textAlign: 'center',
            backgroundColor: '#fafafa',
            position: 'relative',
            minHeight: 240,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
            '&:hover': {
              borderColor: '#1e3a5f',
              backgroundColor: '#f8f9fa'
            }
          }}
          onClick={() => imageInputRef.current?.click()}
        >
          {imagePreview ? (
            <Box sx={{ position: 'relative', width: '100%' }}>
              <img
                src={imagePreview.startsWith('data:') ? imagePreview : imagePreview.startsWith('http') ? imagePreview : `${API_BASE_URL}${imagePreview}`}
                alt="Header preview"
                style={{
                  maxWidth: '100%',
                  maxHeight: 220,
                  objectFit: 'contain'
                }}
              />
              <IconButton
                onClick={(e) => {
                  e.stopPropagation();
                  handleRemoveImage();
                }}
                sx={{
                  position: 'absolute',
                  top: -10,
                  right: -10,
                  backgroundColor: 'white',
                  boxShadow: 2,
                  '&:hover': {
                    backgroundColor: '#f5f5f5'
                  }
                }}
              >
                <CloseIcon />
              </IconButton>
            </Box>
          ) : (
            <>
              <CloudUploadIcon sx={{ fontSize: 48, color: '#ccc', mb: 2 }} />
              <Typography variant="body2" sx={{ color: '#666', mb: 1 }}>
                Drag and drop image here or click to browse
              </Typography>
              <Typography variant="caption" sx={{ color: '#999' }}>
                Size: 310px × 240px
              </Typography>
              <Typography variant="caption" sx={{ display: 'block', mt: 1, color: '#666' }}>
                Allowed formats: JPG, PNG, JPEG, WEBP | Max size: 2 MB
              </Typography>
            </>
          )}
        </Box>

        <input
          ref={imageInputRef}
          type="file"
          accept="image/*"
          onChange={handleImageSelect}
          style={{ display: 'none' }}
        />
      </Box>

      {/* Reasons Section */}
      <Box sx={{ mb: 4 }}>
        <Typography variant="body2" sx={{ mb: 3, fontWeight: 500 }}>
          Reasons
        </Typography>

        {/* Table Header */}
        <Card sx={{ mb: 1, backgroundColor: '#f5f5f5', border: '1px solid #e0e0e0', borderRadius: 1 }}>
          <CardContent sx={{ p: 2 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <Typography variant="body2" sx={{ flex: 1, fontWeight: 600, color: '#333' }}>
                Title
              </Typography>
              <Typography variant="body2" sx={{ flex: 2, fontWeight: 600, color: '#333' }}>
                Description
              </Typography>
              <Typography variant="body2" sx={{ width: 80, textAlign: 'center', fontWeight: 600, color: '#333' }}>
                Priority
              </Typography>
              <Typography variant="body2" sx={{ width: 80, textAlign: 'center', fontWeight: 600, color: '#333' }}>
                Status
              </Typography>
              <Typography variant="body2" sx={{ width: 80, textAlign: 'center', fontWeight: 600, color: '#333' }}>
                Actions
              </Typography>
            </Box>
          </CardContent>
        </Card>

        {formData.whySellPoints.map((point, index) => (
          <Card key={index} sx={{ mb: 1, backgroundColor: 'white', border: '1px solid #e0e0e0', borderRadius: 1 }}>
            <CardContent sx={{ p: 2 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <Typography variant="body2" sx={{ flex: 1, color: '#333' }}>
                  {point.title}
                </Typography>
                <Typography variant="body2" sx={{ flex: 2, color: '#666' }}>
                  {point.description}
                </Typography>
                <Typography variant="body2" sx={{ width: 80, textAlign: 'center', color: '#333' }}>
                  {point.priority || 0}
                </Typography>
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: 80 }}>
                  <Switch
                    checked={point.status !== false}
                    onChange={(e) => {
                      const updatedPoints = [...formData.whySellPoints];
                      updatedPoints[index] = { ...updatedPoints[index], status: e.target.checked };
                      setFormData(prev => ({ ...prev, whySellPoints: updatedPoints }));
                    }}
                    size="small"
                    color="primary"
                  />
                </Box>
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 1, width: 80 }}>
                  <IconButton
                    onClick={() => handleEditPoint(index)}
                    size="small"
                    sx={{ color: '#1e3a5f', padding: 0.5 }}
                  >
                    <EditIcon fontSize="small" />
                  </IconButton>
                  <IconButton
                    onClick={() => handleDeletePoint(index)}
                    size="small"
                    sx={{ color: '#d32f2f', padding: 0.5 }}
                  >
                    <DeleteIcon fontSize="small" />
                  </IconButton>
                </Box>
              </Box>
            </CardContent>
          </Card>
        ))}

        {formData.whySellPoints.length === 0 && (
          <Box sx={{ textAlign: 'center', py: 4, color: '#666' }}>
            <Typography variant="body2">
              No reasons added yet. Add your first reason below.
            </Typography>
          </Box>
        )}

        {/* Add/Edit Reason Form */}
        <Card sx={{ mt: 3, backgroundColor: '#f0f8ff', border: '1px solid #b3d9ff' }}>
          <CardContent sx={{ p: 3 }}>
            <Typography variant="subtitle2" sx={{ mb: 2, fontWeight: 500 }}>
              {editingPoint !== null ? 'Edit Reason' : 'Add New Reason'}
            </Typography>

            <Grid container spacing={2} sx={{ mb: 2 }}>
              <Grid item xs={12}>
                <TextField
                  label="Title"
                  value={newPoint.title}
                  onChange={(e) => setNewPoint(prev => ({ ...prev, title: e.target.value }))}
                  fullWidth
                  placeholder="Enter reason title"
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  label="Description"
                  value={newPoint.description}
                  onChange={(e) => setNewPoint(prev => ({ ...prev, description: e.target.value }))}
                  fullWidth
                  multiline
                  rows={3}
                  placeholder="Enter reason description"
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  label="Priority"
                  type="number"
                  value={newPoint.priority}
                  onChange={(e) => setNewPoint(prev => ({ ...prev, priority: parseInt(e.target.value) || 0 }))}
                  fullWidth
                  inputProps={{ min: 0 }}
                  helperText="Higher number = higher priority"
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <Box sx={{ display: 'flex', alignItems: 'center', height: '100%' }}>
                  <FormControlLabel
                    control={
                      <Switch
                        checked={newPoint.status}
                        onChange={(e) => setNewPoint(prev => ({ ...prev, status: e.target.checked }))}
                        color="primary"
                      />
                    }
                    label="Active"
                    sx={{ mb: 0 }}
                  />
                </Box>
              </Grid>
            </Grid>

            <Box sx={{ display: 'flex', gap: 2 }}>
              <Button
                variant="contained"
                onClick={handleAddPoint}
                sx={{
                  backgroundColor: '#1e3a5f',
                  color: 'white',
                  textTransform: 'none',
                  '&:hover': {
                    backgroundColor: '#2d5a8c'
                  }
                }}
              >
                {editingPoint !== null ? 'Update' : 'Add'}
              </Button>
              {editingPoint !== null && (
                <Button
                  variant="outlined"
                  onClick={handleCancelEdit}
                  sx={{
                    borderColor: '#ccc',
                    color: '#666',
                    textTransform: 'none'
                  }}
                >
                  Cancel
                </Button>
              )}
            </Box>
          </CardContent>
        </Card>
      </Box>

      {/* Action Buttons - Bottom Right */}
      <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 2 }}>
        <Button
          variant="outlined"
          onClick={handleReset}
          sx={{
            borderColor: '#ccc',
            color: '#666',
            textTransform: 'none',
            '&:hover': {
              borderColor: '#999',
              backgroundColor: '#f5f5f5'
            }
          }}
        >
          Reset
        </Button>
        <Button
          variant="contained"
          onClick={handleSubmit}
          disabled={saving}
          sx={{
            backgroundColor: '#1e3a5f',
            color: 'white',
            textTransform: 'none',
            '&:hover': {
              backgroundColor: '#2d5a8c'
            }
          }}
        >
          {saving ? 'Saving...' : 'Submit'}
        </Button>
      </Box>
    </CardContent>
  </Card>
);

const renderBusinessProcessTab = (formData, setFormData) => (
  <Card sx={{ backgroundColor: 'white', borderRadius: 2, boxShadow: '0 2px 12px rgba(0,0,0,0.08)' }}>
    <CardContent sx={{ p: 4 }}>
      <Typography variant="h6" sx={{ mb: 4, fontWeight: 500, color: '#333' }}>
        Business Process
      </Typography>

      {/* Main Title and Subtitle */}
      <Box sx={{ mb: 4 }}>
        <Typography variant="body2" sx={{ mb: 2, fontWeight: 500 }}>
          Main Title & Subtitle
        </Typography>
        <Grid container spacing={3}>
          <Grid item xs={12}>
            <TextField
              label="Main Title"
              value={formData.businessProcess.mainTitle}
              onChange={(e) => setFormData(prev => ({
                ...prev,
                businessProcess: {
                  ...prev.businessProcess,
                  mainTitle: e.target.value
                }
              }))}
              fullWidth
              placeholder="3 Easy Steps To Start Selling"
              sx={{
                '& .MuiOutlinedInput-root': {
                  borderRadius: 2
                }
              }}
            />
          </Grid>
          <Grid item xs={12}>
            <TextField
              label="Main Subtitle"
              value={formData.businessProcess.mainSubtitle}
              onChange={(e) => setFormData(prev => ({
                ...prev,
                businessProcess: {
                  ...prev.businessProcess,
                  mainSubtitle: e.target.value
                }
              }))}
              fullWidth
              multiline
              rows={2}
              placeholder="Start selling quickly and easily with our simple onboarding process"
              sx={{
                '& .MuiOutlinedInput-root': {
                  borderRadius: 2
                }
              }}
            />
          </Grid>
        </Grid>
      </Box>

      {/* Three Process Steps */}
      <Box sx={{ mb: 4 }}>
        <Typography variant="body2" sx={{ mb: 3, fontWeight: 500 }}>
          Process Steps
        </Typography>

        {formData.businessProcess.steps.map((step, index) => (
          <Card key={index} sx={{ mb: 3, backgroundColor: '#fafafa', border: '1px solid #e0e0e0', borderRadius: 2 }}>
            <CardContent sx={{ p: 3 }}>
              <Typography variant="subtitle2" sx={{ mb: 3, fontWeight: 600, color: '#1e3a5f' }}>
                Section {index + 1} – {step.title}
              </Typography>

              <Grid container spacing={3}>
                {/* Left side - Text fields */}
                <Grid item xs={12} md={7}>
                  <Box sx={{ mb: 3 }}>
                    <TextField
                      label="Title"
                      value={step.title}
                      onChange={(e) => setFormData(prev => ({
                        ...prev,
                        businessProcess: {
                          ...prev.businessProcess,
                          steps: prev.businessProcess.steps.map((s, i) => 
                            i === index ? { ...s, title: e.target.value } : s
                          )
                        }
                      }))}
                      fullWidth
                      placeholder="Enter step title"
                      sx={{
                        '& .MuiOutlinedInput-root': {
                          borderRadius: 2
                        }
                      }}
                    />
                  </Box>
                  <Box>
                    <TextField
                      label="Short Description"
                      value={step.description}
                      onChange={(e) => setFormData(prev => ({
                        ...prev,
                        businessProcess: {
                          ...prev.businessProcess,
                          steps: prev.businessProcess.steps.map((s, i) => 
                            i === index ? { ...s, description: e.target.value } : s
                          )
                        }
                      }))}
                      fullWidth
                      multiline
                      rows={3}
                      placeholder="Enter step description"
                      sx={{
                        '& .MuiOutlinedInput-root': {
                          borderRadius: 2
                        }
                      }}
                    />
                  </Box>
                </Grid>

                {/* Right side - Image upload */}
                <Grid item xs={12} md={5}>
                  <Box>
                    <Typography variant="body2" sx={{ mb: 2, fontWeight: 500 }}>
                      Image
                    </Typography>
                    
                    <Box
                      sx={{
                        border: '2px dashed #ccc',
                        borderRadius: 2,
                        p: 3,
                        textAlign: 'center',
                        backgroundColor: '#fafafa',
                        position: 'relative',
                        minHeight: 200,
                        width: 200,
                        height: 200,
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        justifyContent: 'center',
                        cursor: 'pointer',
                        '&:hover': {
                          borderColor: '#1e3a5f',
                          backgroundColor: '#f8f9fa'
                        }
                      }}
                      onClick={() => businessProcessImageRefs[`step${index}`].current?.click()}
                    >
                      {businessProcessImages[`step${index}`].preview || step.image ? (
                        <Box sx={{ position: 'relative', width: '100%', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                          <img
                            src={businessProcessImages[`step${index}`].preview || step.image}
                            alt={`Step ${index + 1} preview`}
                            style={{
                              maxWidth: '100%',
                              maxHeight: '100%',
                              objectFit: 'contain'
                            }}
                          />
                          <IconButton
                            onClick={(e) => {
                              e.stopPropagation();
                              handleRemoveBusinessProcessImage(index);
                            }}
                            sx={{
                              position: 'absolute',
                              top: -10,
                              right: -10,
                              backgroundColor: 'white',
                              boxShadow: 2,
                              '&:hover': {
                                backgroundColor: '#f5f5f5'
                              }
                            }}
                          >
                            <CloseIcon />
                          </IconButton>
                        </Box>
                      ) : (
                        <>
                          <CloudUploadIcon sx={{ fontSize: 48, color: '#ccc', mb: 2 }} />
                          <Typography variant="body2" sx={{ color: '#666', mb: 1 }}>
                            Click to upload image
                          </Typography>
                          <Typography variant="caption" sx={{ color: '#999' }}>
                            1:1 ratio
                          </Typography>
                        </>
                      )}
                    </Box>

                    <input
                      ref={businessProcessImageRefs[`step${index}`]}
                      type="file"
                      accept="image/*"
                      onChange={(e) => handleBusinessProcessImageSelect(index, e)}
                      style={{ display: 'none' }}
                    />

                    <Typography variant="caption" sx={{ display: 'block', mt: 2, color: '#666' }}>
                      Image format: jpg, png, jpeg, webp. Max 2MB.
                    </Typography>
                  </Box>
                </Grid>
              </Grid>
            </CardContent>
          </Card>
        ))}
      </Box>

      {/* Action Buttons - Bottom Right */}
      <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 2 }}>
        <Button
          variant="outlined"
          onClick={handleReset}
          sx={{
            borderColor: '#ccc',
            color: '#666',
            textTransform: 'none',
            '&:hover': {
              borderColor: '#999',
              backgroundColor: '#f5f5f5'
            }
          }}
        >
          Reset
        </Button>
        <Button
          variant="contained"
          onClick={handleSubmit}
          disabled={saving}
          sx={{
            backgroundColor: '#1e3a5f',
            color: 'white',
            textTransform: 'none',
            '&:hover': {
              backgroundColor: '#2d5a8c'
            }
          }}
        >
          {saving ? 'Saving...' : 'Submit'}
        </Button>
      </Box>
    </CardContent>
  </Card>
);

const renderDownloadAppTab = () => (
  <Card sx={{ backgroundColor: 'white', borderRadius: 2, boxShadow: '0 2px 12px rgba(0,0,0,0.08)' }}>
    <CardContent sx={{ p: 4 }}>
      <Typography variant="h6" sx={{ mb: 4, fontWeight: 500, color: '#333' }}>
        Download App Section
      </Typography>

      {/* Title and Subtitle */}
      <Box sx={{ mb: 4 }}>
        <Typography variant="body2" sx={{ mb: 2, fontWeight: 500 }}>
          Main Title & Subtitle
        </Typography>
        <Grid container spacing={3}>
          <Grid item xs={12}>
            <TextField
              label="Title"
              value={formData.downloadApp.title}
              onChange={(e) => setFormData(prev => ({
                ...prev,
                downloadApp: {
                  ...prev.downloadApp,
                  title: e.target.value
                }
              }))}
              fullWidth
              placeholder="Download Free Vendor App"
              sx={{
                '& .MuiOutlinedInput-root': {
                  borderRadius: 2
                }
              }}
            />
          </Grid>
          <Grid item xs={12}>
            <TextField
              label="Subtitle"
              value={formData.downloadApp.subtitle}
              onChange={(e) => setFormData(prev => ({
                ...prev,
                downloadApp: {
                  ...prev.downloadApp,
                  subtitle: e.target.value
                }
              }))}
              fullWidth
              multiline
              rows={2}
              placeholder="Manage your business on the go with our mobile app"
              sx={{
                '& .MuiOutlinedInput-root': {
                  borderRadius: 2
                }
              }}
            />
          </Grid>
        </Grid>
      </Box>

      {/* App Image Upload */}
      <Box sx={{ mb: 4 }}>
        <Typography variant="body2" sx={{ mb: 2, fontWeight: 500 }}>
          App Image
        </Typography>
        
        <Box
          sx={{
            border: '2px dashed #ccc',
            borderRadius: 2,
            p: 4,
            textAlign: 'center',
            backgroundColor: '#fafafa',
            position: 'relative',
            minHeight: 200,
            width: 200,
            height: 200,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
            '&:hover': {
              borderColor: '#1e3a5f',
              backgroundColor: '#f8f9fa'
            }
          }}
          onClick={() => downloadAppImageRef.current?.click()}
        >
          {downloadAppImage.preview || formData.downloadApp.appImage ? (
            <Box sx={{ position: 'relative', width: '100%', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
              <img
                src={downloadAppImage.preview || formData.downloadApp.appImage}
                alt="App preview"
                style={{
                  maxWidth: '100%',
                  maxHeight: '100%',
                  objectFit: 'contain'
                }}
              />
              <IconButton
                onClick={(e) => {
                  e.stopPropagation();
                  handleRemoveDownloadAppImage();
                }}
                sx={{
                  position: 'absolute',
                  top: -10,
                  right: -10,
                  backgroundColor: 'white',
                  boxShadow: 2,
                  '&:hover': {
                    backgroundColor: '#f5f5f5'
                  }
                }}
              >
                <CloseIcon />
              </IconButton>
            </Box>
          ) : (
            <>
              <CloudUploadIcon sx={{ fontSize: 48, color: '#ccc', mb: 2 }} />
              <Typography variant="body2" sx={{ color: '#666', mb: 1 }}>
                Drag and drop image here or click to browse
              </Typography>
              <Typography variant="caption" sx={{ color: '#999' }}>
                1:1 ratio
              </Typography>
            </>
          )}
        </Box>

        <input
          ref={downloadAppImageRef}
          type="file"
          accept="image/*"
          onChange={handleDownloadAppImageSelect}
          style={{ display: 'none' }}
        />

        <Typography variant="caption" sx={{ display: 'block', mt: 2, color: '#666' }}>
          Image format: jpg, png, jpeg, webp. Max 2MB.
        </Typography>
      </Box>

      {/* Store Buttons Settings */}
      <Box sx={{ mb: 4 }}>
        <Typography variant="body2" sx={{ mb: 3, fontWeight: 500 }}>
          Store Download Buttons
        </Typography>

        <Grid container spacing={4}>
          {/* Google Play Store */}
          <Grid item xs={12} md={6}>
            <Card sx={{ backgroundColor: '#f8f9fa', border: '1px solid #e0e0e0', borderRadius: 2 }}>
              <CardContent sx={{ p: 3 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', mr: 2 }}>
                    <Typography variant="body2" sx={{ fontWeight: 600, color: '#333' }}>
                      Google Play Store
                    </Typography>
                  </Box>
                  <FormControlLabel
                    control={
                      <Switch
                        checked={formData.downloadApp.playStore.enabled}
                        onChange={(e) => setFormData(prev => ({
                          ...prev,
                          downloadApp: {
                            ...prev.downloadApp,
                            playStore: {
                              ...prev.downloadApp.playStore,
                              enabled: e.target.checked
                            }
                          }
                        }))}
                        color="primary"
                      />
                    }
                    label="Enable"
                    sx={{ mb: 0 }}
                  />
                </Box>

                <TextField
                  label="Play Store URL"
                  value={formData.downloadApp.playStore.url}
                  onChange={(e) => setFormData(prev => ({
                    ...prev,
                    downloadApp: {
                      ...prev.downloadApp,
                      playStore: {
                        ...prev.downloadApp.playStore,
                        url: e.target.value
                      }
                    }
                  }))}
                  fullWidth
                  placeholder="https://play.google.com/store/apps/details?id=com.example.vendorapp"
                  disabled={!formData.downloadApp.playStore.enabled}
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      borderRadius: 2
                    }
                  }}
                  helperText="Enter the Google Play Store URL for your app"
                />
              </CardContent>
            </Card>
          </Grid>

          {/* Apple App Store */}
          <Grid item xs={12} md={6}>
            <Card sx={{ backgroundColor: '#f8f9fa', border: '1px solid #e0e0e0', borderRadius: 2 }}>
              <CardContent sx={{ p: 3 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', mr: 2 }}>
                    <Typography variant="body2" sx={{ fontWeight: 600, color: '#333' }}>
                      Apple App Store
                    </Typography>
                  </Box>
                  <FormControlLabel
                    control={
                      <Switch
                        checked={formData.downloadApp.appStore.enabled}
                        onChange={(e) => setFormData(prev => ({
                          ...prev,
                          downloadApp: {
                            ...prev.downloadApp,
                            appStore: {
                              ...prev.downloadApp.appStore,
                              enabled: e.target.checked
                            }
                          }
                        }))}
                        color="primary"
                      />
                    }
                    label="Enable"
                    sx={{ mb: 0 }}
                  />
                </Box>

                <TextField
                  label="App Store URL"
                  value={formData.downloadApp.appStore.url}
                  onChange={(e) => setFormData(prev => ({
                    ...prev,
                    downloadApp: {
                      ...prev.downloadApp,
                      appStore: {
                        ...prev.downloadApp.appStore,
                        url: e.target.value
                      }
                    }
                  }))}
                  fullWidth
                  placeholder="https://apps.apple.com/app/example-vendor-app/id123456789"
                  disabled={!formData.downloadApp.appStore.enabled}
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      borderRadius: 2
                    }
                  }}
                  helperText="Enter the Apple App Store URL for your app"
                />
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </Box>

      {/* Action Buttons - Bottom Right */}
      <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 2 }}>
        <Button
          variant="outlined"
          onClick={handleReset}
          sx={{
            borderColor: '#ccc',
            color: '#666',
            textTransform: 'none',
            '&:hover': {
              borderColor: '#999',
              backgroundColor: '#f5f5f5'
            }
          }}
        >
          Reset
        </Button>
        <Button
          variant="contained"
          onClick={handleSubmit}
          disabled={saving}
          sx={{
            backgroundColor: '#1e3a5f',
            color: 'white',
            textTransform: 'none',
            '&:hover': {
              backgroundColor: '#2d5a8c'
            }
          }}
        >
          {saving ? 'Saving...' : 'Submit'}
        </Button>
      </Box>
    </CardContent>
  </Card>
);

const renderFaqTab = () => (
  <Card sx={{ backgroundColor: 'white', borderRadius: 2, boxShadow: '0 2px 12px rgba(0,0,0,0.08)' }}>
    <CardContent sx={{ p: 4 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <Typography variant="h6" sx={{ fontWeight: 500, color: '#333' }}>
            FAQ List
          </Typography>
          <Box sx={{
            backgroundColor: '#1e3a5f',
            color: 'white',
            borderRadius: '50%',
            minWidth: '28px',
            height: '28px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '14px',
            fontWeight: 600
          }}>
            {formData.faq.items.length}
          </Box>
        </Box>
        <Button
          variant="contained"
          onClick={handleOpenFaqForm}
          sx={{
            backgroundColor: '#1e3a5f',
            color: 'white',
            textTransform: 'none',
            '&:hover': {
              backgroundColor: '#2d5a8c'
            }
          }}
        >
          + Add FAQ
        </Button>
      </Box>

      {/* FAQ Table */}
      <Box sx={{ mb: 4 }}>
        <Typography variant="body2" sx={{ mb: 3, fontWeight: 500 }}>
          FAQ Items
        </Typography>

        {formData.faq.items.length > 0 ? (
          <Box sx={{ border: '1px solid #e0e0e0', borderRadius: 2, overflow: 'hidden' }}>
            {/* Table Header */}
            <Box sx={{ 
              display: 'grid', 
              gridTemplateColumns: '80px 2fr 2fr 100px 100px 80px',
              backgroundColor: '#f5f5f5',
              borderBottom: '1px solid #e0e0e0',
              p: 2
            }}>
              <Typography variant="subtitle2" sx={{ fontWeight: 600, color: '#333' }}>
                SL
              </Typography>
              <Typography variant="subtitle2" sx={{ fontWeight: 600, color: '#333' }}>
                Question
              </Typography>
              <Typography variant="subtitle2" sx={{ fontWeight: 600, color: '#333' }}>
                Answer
              </Typography>
              <Typography variant="subtitle2" sx={{ fontWeight: 600, color: '#333' }}>
                Priority
              </Typography>
              <Typography variant="subtitle2" sx={{ fontWeight: 600, color: '#333' }}>
                Status
              </Typography>
              <Typography variant="subtitle2" sx={{ fontWeight: 600, color: '#333', textAlign: 'center' }}>
                Action
              </Typography>
            </Box>

            {/* Table Rows */}
            {formData.faq.items.map((item, index) => (
              <Box key={index} sx={{ 
                display: 'grid', 
                gridTemplateColumns: '80px 2fr 2fr 100px 100px 80px',
                borderBottom: index < formData.faq.items.length - 1 ? '1px solid #e0e0e0' : 'none',
                p: 2,
                '&:hover': {
                  backgroundColor: '#f9f9f9'
                }
              }}>
                <Typography variant="body2" sx={{ color: '#333', fontWeight: 500 }}>
                  {index + 1}
                </Typography>
                <Typography variant="body2" sx={{ color: '#333' }}>
                  {item.question}
                </Typography>
                <Typography variant="body2" sx={{ 
                  color: '#666', 
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  whiteSpace: 'nowrap'
                }}>
                  {item.answer}
                </Typography>
                <Typography variant="body2" sx={{ color: '#333', fontWeight: 500 }}>
                  {item.priority || 1}
                </Typography>
                <Typography variant="body2" sx={{ 
                  color: item.status !== false ? '#4caf50' : '#f44336',
                  fontWeight: 600
                }}>
                  {item.status !== false ? 'Active' : 'Inactive'}
                </Typography>
                <Box sx={{ display: 'flex', justifyContent: 'center', gap: 1 }}>
                  <IconButton
                    onClick={() => handleEditFaqItem(index)}
                    size="small"
                    sx={{ color: '#1e3a5f' }}
                  >
                    <EditIcon />
                  </IconButton>
                  <IconButton
                    onClick={() => handleDeleteFaqItem(index)}
                    size="small"
                    sx={{ color: '#d32f2f' }}
                  >
                    <DeleteIcon />
                  </IconButton>
                </Box>
              </Box>
            ))}
          </Box>
        ) : (
          <Box sx={{ 
            textAlign: 'center', 
            py: 8, 
            color: '#666',
            border: '1px solid #e0e0e0',
            borderRadius: 2,
            backgroundColor: '#fafafa'
          }}>
            <Typography variant="body2" sx={{ mb: 2 }}>
              No FAQ items added yet.
            </Typography>
            <Button
              variant="outlined"
              onClick={handleOpenFaqForm}
              sx={{
                borderColor: '#1e3a5f',
                color: '#1e3a5f',
                textTransform: 'none',
                '&:hover': {
                  borderColor: '#2d5a8c',
                  backgroundColor: '#f0f8ff'
                }
              }}
            >
              Add Your First FAQ
            </Button>
          </Box>
        )}
      </Box>

      {/* FAQ Form Modal/Popup */}
      {showFaqForm && (
        <Box sx={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0,0,0,0.5)',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          zIndex: 1000
        }}>
          <Card sx={{ 
            backgroundColor: 'white', 
            borderRadius: 2, 
            boxShadow: '0 8px 32px rgba(0,0,0,0.2)',
            maxWidth: 600,
            width: '90%',
            maxHeight: '80vh',
            overflow: 'auto'
          }}>
            <CardContent sx={{ p: 4 }}>
              <Typography variant="h6" sx={{ mb: 3, fontWeight: 500, color: '#333' }}>
                {editingFaqItem !== null ? 'Edit FAQ Item' : 'Add New FAQ Item'}
              </Typography>

              <Grid container spacing={2} sx={{ mb: 3 }}>
                <Grid item xs={12}>
                  <TextField
                    label="Question"
                    value={newFaqItem.question}
                    onChange={(e) => setNewFaqItem(prev => ({ ...prev, question: e.target.value }))}
                    fullWidth
                    multiline
                    rows={2}
                    placeholder="Enter your question"
                    sx={{
                      '& .MuiOutlinedInput-root': {
                        borderRadius: 2
                      }
                    }}
                  />
                </Grid>
                <Grid item xs={12}>
                  <TextField
                    label="Answer"
                    value={newFaqItem.answer}
                    onChange={(e) => setNewFaqItem(prev => ({ ...prev, answer: e.target.value }))}
                    fullWidth
                    multiline
                    rows={3}
                    placeholder="Enter your answer"
                    sx={{
                      '& .MuiOutlinedInput-root': {
                        borderRadius: 2
                      }
                    }}
                  />
                </Grid>
                <Grid item xs={12} md={6}>
                  <TextField
                    label="Priority"
                    type="number"
                    value={newFaqItem.priority}
                    onChange={(e) => setNewFaqItem(prev => ({ ...prev, priority: parseInt(e.target.value) || 1 }))}
                    fullWidth
                    placeholder="1"
                    inputProps={{ min: 1 }}
                    sx={{
                      '& .MuiOutlinedInput-root': {
                        borderRadius: 2
                      }
                    }}
                    helperText="Lower numbers show first"
                  />
                </Grid>
                <Grid item xs={12} md={6}>
                  <Box sx={{ display: 'flex', alignItems: 'center', mt: 2 }}>
                    <FormControlLabel
                      control={
                        <Switch
                          checked={newFaqItem.status}
                          onChange={(e) => setNewFaqItem(prev => ({ ...prev, status: e.target.checked }))}
                          color="primary"
                        />
                      }
                      label="Status"
                      sx={{ mb: 0 }}
                    />
                    <Typography variant="body2" sx={{ color: '#666', ml: 2 }}>
                      {newFaqItem.status ? 'Active' : 'Inactive'}
                    </Typography>
                  </Box>
                  <Typography variant="caption" sx={{ color: '#666', mt: 1, display: 'block' }}>
                    Turning status off will not show this FAQ in the list
                  </Typography>
                </Grid>
              </Grid>

              <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 2 }}>
                <Button
                  variant="outlined"
                  onClick={handleCancelFaqEdit}
                  sx={{
                    borderColor: '#ccc',
                    color: '#666',
                    textTransform: 'none',
                    '&:hover': {
                      borderColor: '#999',
                      backgroundColor: '#f5f5f5'
                    }
                  }}
                >
                  Cancel
                </Button>
                <Button
                  variant="contained"
                  onClick={handleAddFaqItem}
                  sx={{
                    backgroundColor: '#1e3a5f',
                    color: 'white',
                    textTransform: 'none',
                    '&:hover': {
                      backgroundColor: '#2d5a8c'
                    }
                  }}
                >
                  {editingFaqItem !== null ? 'Update' : 'Add'}
                </Button>
              </Box>
            </CardContent>
          </Card>
        </Box>
      )}

      {/* Action Buttons - Bottom Right */}
      <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 2 }}>
        <Button
          variant="outlined"
          onClick={handleReset}
          sx={{
            borderColor: '#ccc',
            color: '#666',
            textTransform: 'none',
            '&:hover': {
              borderColor: '#999',
              backgroundColor: '#f5f5f5'
            }
          }}
        >
          Reset
        </Button>
        <Button
          variant="contained"
          onClick={handleSubmit}
          disabled={saving}
          sx={{
            backgroundColor: '#1e3a5f',
            color: 'white',
            textTransform: 'none',
            '&:hover': {
              backgroundColor: '#2d5a8c'
            }
          }}
        >
          {saving ? 'Saving...' : 'Submit'}
        </Button>
      </Box>
    </CardContent>
  </Card>
);

const renderOtherTabContent = (tabId) => {
  const content = {
    'business-process': 'Business Process content will be implemented here.',
    'download-app': 'Download App content will be implemented here.',
    'faq': 'FAQ content will be implemented here.'
  };

  return (
    <Card sx={{ backgroundColor: 'white', borderRadius: 2, boxShadow: '0 2px 12px rgba(0,0,0,0.08)' }}>
      <CardContent sx={{ p: 4, textAlign: 'center' }}>
        <Typography variant="h6" sx={{ mb: 2, fontWeight: 500, color: '#333' }}>
          {tabs[activeTab].label}
        </Typography>
        <Typography variant="body2" sx={{ color: '#666' }}>
          {content[tabId]}
        </Typography>
      </CardContent>
    </Card>
  );
};

if (loading) {
  return (
    <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh' }}>
      <CircularProgress />
    </Box>
  );
}

return (
  <Box sx={{ p: 4, backgroundColor: '#f5f5f5', minHeight: '100vh' }}>
    {/* Header */}
    <Typography variant="h4" sx={{ 
      mb: 4, 
      fontWeight: 300, 
      color: '#1e3a5f',
      textAlign: 'left'
    }}>
      Vendor Registration
    </Typography>

    {/* Tab Navigation */}
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
        {tabs.map((tab) => (
          <Tab key={tab.id} label={tab.label} />
        ))}
      </Tabs>
    </Paper>

    {/* Tab Content */}
    {activeTab === 0 && renderHeaderTab()}
    {activeTab === 1 && renderWhySellWithUsTab()}
    {activeTab === 2 && renderBusinessProcessTab(formData, setFormData)}
    {activeTab === 3 && renderDownloadAppTab()}
    {activeTab === 4 && renderFaqTab()}
    {activeTab >= 5 && renderOtherTabContent(tabs[activeTab].id)}

    {/* Snackbar */}
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

export default VendorRegistration;
