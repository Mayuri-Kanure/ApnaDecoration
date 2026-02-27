import React, { useState, useEffect, useRef } from 'react';
import { 
  Box, 
  Tabs, 
  Tab, 
  Button, 
  Paper, 
  Typography, 
  Alert,
  Snackbar,
  CircularProgress,
  Switch,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination,
  TextField,
  InputLabel,
  Select,
  MenuItem,
  FormControl,
  FormControlLabel,
  Checkbox,
  Grid,
  Card,
  CardContent,
  IconButton,
  Tooltip,
  Box as MuiBox
} from '@mui/material';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';
import axios from 'axios';
import { 
  Info as InfoIcon,
  CloudUpload as CloudUploadIcon,
  Delete as DeleteIcon
} from '@mui/icons-material';

const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || 'https://admin-api.apnadecoration.com/api';

const policyPages = [
  { id: 'terms', label: 'Terms & Conditions' },
  { id: 'privacy', label: 'Privacy Policy' },
  { id: 'refund', label: 'Refund Policy' },
  { id: 'return', label: 'Return Policy' },
  { id: 'cancellation', label: 'Cancellation Policy' },
  { id: 'shipping', label: 'Shipping Policy' },
  { id: 'about', label: 'About Us' },
  { id: 'faq', label: 'FAQ' },
  { id: 'reliability', label: 'Company Reliability' }
];

const BusinessPages = () => {
  const quillRef = useRef(null);
  const [activeTab, setActiveTab] = useState(0);
  const [content, setContent] = useState('');
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });
  const [allContent, setAllContent] = useState({});
  const [refundPolicyActive, setRefundPolicyActive] = useState(true);
  const [returnPolicyActive, setReturnPolicyActive] = useState(true);
  const [cancellationPolicyActive, setCancellationPolicyActive] = useState(true);
  const [shippingPolicyActive, setShippingPolicyActive] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [dialogAction, setDialogAction] = useState(null);
  const [currentPolicyType, setCurrentPolicyType] = useState(null);

  // FAQ State
  const [faqs, setFaqs] = useState([]);
  const [faqLoading, setFaqLoading] = useState(false);
  const [faqModalOpen, setFaqModalOpen] = useState(false);
  const [editingFaq, setEditingFaq] = useState(null);
  const [faqForm, setFaqForm] = useState({
    question: '',
    answer: '',
    ranking: 0,
    active: true
  });
  const [faqPagination, setFaqPagination] = useState({
    page: 0,
    rowsPerPage: 10,
    total: 0
  });
  const [faqSearch, setFaqSearch] = useState('');
  const [faqSort, setFaqSort] = useState({ field: 'ranking', order: 'asc' });

  // Store Highlights State
  const [storeHighlights, setStoreHighlights] = useState([]);
  const [storeHighlightsLoading, setStoreHighlightsLoading] = useState(false);
  const [storeHighlightsForm, setStoreHighlightsForm] = useState({});

  // Quill editor modules configuration
  const modules = {
    toolbar: [
      [{ 'header': [1, 2, 3, false] }],
      ['bold', 'italic', 'underline'],
      [{ 'color': [] }, { 'background': [] }],
      [{ 'list': 'ordered'}, { 'list': 'bullet' }],
      [{ 'align': [] }],
      ['clean']
    ],
  };

  // Quill editor formats
  const formats = [
    'header',
    'bold', 'italic', 'underline',
    'color', 'background',
    'list', 'bullet',
    'align'
  ];

  useEffect(() => {
    loadContent();
    // Load FAQs when FAQ tab is active
    if (policyPages[activeTab].id === 'faq') {
      loadFAQs();
    }
    // Load Store Highlights when reliability tab is active
    if (policyPages[activeTab].id === 'reliability') {
      loadStoreHighlights();
    }
  }, [activeTab]);

  useEffect(() => {
    // Reload FAQs when search, pagination, or sort changes
    if (policyPages[activeTab].id === 'faq') {
      loadFAQs();
    }
  }, [faqSearch, faqPagination.page, faqPagination.rowsPerPage, faqSort]);

  const loadContent = async () => {
    setLoading(true);
    try {
      const currentPage = policyPages[activeTab];
      const response = await axios.get(`/api/policy-content/${currentPage.id}`);
      
      if (response.data && response.data.content) {
        setContent(response.data.content);
        setAllContent(prev => ({
          ...prev,
          [currentPage.id]: response.data.content
        }));
      } else {
        setContent('');
        setAllContent(prev => ({
          ...prev,
          [currentPage.id]: ''
        }));
      }
    } catch (error) {
      console.error('Error loading content:', error);
      setContent('');
    } finally {
      setLoading(false);
    }
  };

  const handleTabChange = (event, newValue) => {
    // Save current content before switching tabs
    const currentPage = policyPages[activeTab];
    setAllContent(prev => ({
      ...prev,
      [currentPage.id]: content
    }));
    setActiveTab(newValue);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!content.trim()) {
      setSnackbar({
        open: true,
        message: 'Content cannot be empty',
        severity: 'error'
      });
      return;
    }

    setSaving(true);
    try {
      const currentPage = policyPages[activeTab];
      const response = await axios.post(`/api/policy-content/${currentPage.id}`, {
        content: content,
        pageType: currentPage.id,
        title: currentPage.label
      });

      setAllContent(prev => ({
        ...prev,
        [currentPage.id]: content
      }));

      setSnackbar({
        open: true,
        message: `${currentPage.label} saved successfully!`,
        severity: 'success'
      });
    } catch (error) {
      console.error('Error saving content:', error);
      setSnackbar({
        open: true,
        message: 'Error saving content. Please try again.',
        severity: 'error'
      });
    } finally {
      setSaving(false);
    }
  };

  const handleCloseSnackbar = () => {
    setSnackbar(prev => ({ ...prev, open: false }));
  };

  const handleRefundPolicyToggle = () => {
    const newAction = refundPolicyActive ? 'turnOff' : 'turnOn';
    setDialogAction(newAction);
    setCurrentPolicyType('refund');
    setDialogOpen(true);
  };

  const handleReturnPolicyToggle = () => {
    const newAction = returnPolicyActive ? 'turnOff' : 'turnOn';
    setDialogAction(newAction);
    setCurrentPolicyType('return');
    setDialogOpen(true);
  };

  const handleCancellationPolicyToggle = () => {
    const newAction = cancellationPolicyActive ? 'turnOff' : 'turnOn';
    setDialogAction(newAction);
    setCurrentPolicyType('cancellation');
    setDialogOpen(true);
  };

  const handleShippingPolicyToggle = () => {
    const newAction = shippingPolicyActive ? 'turnOff' : 'turnOn';
    setDialogAction(newAction);
    setCurrentPolicyType('shipping');
    setDialogOpen(true);
  };

  const handleDialogConfirm = async () => {
    try {
      let endpoint, activeStatus, policyName;
      
      switch(currentPolicyType) {
        case 'refund':
          endpoint = '/api/policy-content/refund-status';
          activeStatus = !refundPolicyActive;
          policyName = 'Refund policy';
          break;
        case 'return':
          endpoint = '/api/policy-content/return-status';
          activeStatus = !returnPolicyActive;
          policyName = 'Return policy';
          break;
        case 'cancellation':
          endpoint = '/api/policy-content/cancellation-status';
          activeStatus = !cancellationPolicyActive;
          policyName = 'Cancellation policy';
          break;
        case 'shipping':
          endpoint = '/api/policy-content/shipping-status';
          activeStatus = !shippingPolicyActive;
          policyName = 'Shipping policy';
          break;
        default:
          return;
      }
      
      const response = await axios.post(endpoint, {
        active: activeStatus
      });
      
      // Update the appropriate state
      switch(currentPolicyType) {
        case 'refund':
          setRefundPolicyActive(activeStatus);
          break;
        case 'return':
          setReturnPolicyActive(activeStatus);
          break;
        case 'cancellation':
          setCancellationPolicyActive(activeStatus);
          break;
        case 'shipping':
          setShippingPolicyActive(activeStatus);
          break;
      }
      
      setSnackbar({
        open: true,
        message: `${policyName} ${activeStatus ? 'enabled' : 'disabled'} successfully!`,
        severity: 'success'
      });
    } catch (error) {
      console.error('Error updating policy status:', error);
      console.error('Error response:', error.response);
      console.error('Error message:', error.message);
      
      setSnackbar({
        open: true,
        message: `Error: ${error.response?.data?.message || error.message || 'Unknown error'}`,
        severity: 'error'
      });
    }
    setDialogOpen(false);
  };

  const handleDialogCancel = () => {
    setDialogOpen(false);
    setDialogAction(null);
    setCurrentPolicyType(null);
  };

  // FAQ Functions
  const loadFAQs = async () => {
    setFaqLoading(true);
    try {
      const params = {
        page: faqPagination.page + 1,
        limit: faqPagination.rowsPerPage,
        search: faqSearch,
        sortBy: faqSort.field,
        sortOrder: faqSort.order
      };
      
      const response = await axios.get('/api/faq', { params });
      setFaqs(response.data.faqs);
      setFaqPagination(prev => ({
        ...prev,
        total: response.data.pagination.total
      }));
    } catch (error) {
      console.error('Error loading FAQs:', error);
      setSnackbar({
        open: true,
        message: 'Error loading FAQs',
        severity: 'error'
      });
    } finally {
      setFaqLoading(false);
    }
  };

  const handleAddFAQ = () => {
    setEditingFaq(null);
    setFaqForm({
      question: '',
      answer: '',
      ranking: 0,
      active: true
    });
    setFaqModalOpen(true);
  };

  const handleEditFAQ = (faq) => {
    setEditingFaq(faq);
    setFaqForm({
      question: faq.question,
      answer: faq.answer,
      ranking: faq.ranking,
      active: faq.active
    });
    setFaqModalOpen(true);
  };

  const handleSaveFAQ = async () => {
    try {
      if (!faqForm.question.trim() || !faqForm.answer.trim()) {
        setSnackbar({
          open: true,
          message: 'Question and answer are required',
          severity: 'error'
        });
        return;
      }

      if (editingFaq) {
        await axios.put(`/api/faq/${editingFaq._id}`, faqForm);
        setSnackbar({
          open: true,
          message: 'FAQ updated successfully',
          severity: 'success'
        });
      } else {
        await axios.post('/api/faq', faqForm);
        setSnackbar({
          open: true,
          message: 'FAQ created successfully',
          severity: 'success'
        });
      }

      setFaqModalOpen(false);
      loadFAQs();
    } catch (error) {
      console.error('Error saving FAQ:', error);
      setSnackbar({
        open: true,
        message: 'Error saving FAQ',
        severity: 'error'
      });
    }
  };

  const handleDeleteFAQ = async (id) => {
    try {
      await axios.delete(`/api/faq/${id}`);
      setSnackbar({
        open: true,
        message: 'FAQ deleted successfully',
        severity: 'success'
      });
      loadFAQs();
    } catch (error) {
      console.error('Error deleting FAQ:', error);
      setSnackbar({
        open: true,
        message: 'Error deleting FAQ',
        severity: 'error'
      });
    }
  };

  const handleToggleFAQStatus = async (id, active) => {
    try {
      await axios.patch(`/api/faq/${id}/status`, { active });
      setSnackbar({
        open: true,
        message: `FAQ ${active ? 'activated' : 'deactivated'} successfully`,
        severity: 'success'
      });
      loadFAQs();
    } catch (error) {
      console.error('Error updating FAQ status:', error);
      setSnackbar({
        open: true,
        message: 'Error updating FAQ status',
        severity: 'error'
      });
    }
  };

  const handleFaqSort = (field) => {
    setFaqSort(prev => ({
      field,
      order: prev.field === field && prev.order === 'asc' ? 'desc' : 'asc'
    }));
  };

  // Store Highlights Functions
  const loadStoreHighlights = async () => {
    setStoreHighlightsLoading(true);
    try {
      const response = await axios.get('/api/store-highlights');
      setStoreHighlights(response.data);
      
      // Initialize form state
      const formState = {};
      response.data.forEach(highlight => {
        formState[highlight._id] = {
          title: highlight.title,
          active: highlight.active,
          icon: highlight.icon
        };
      });
      setStoreHighlightsForm(formState);
    } catch (error) {
      console.error('Error loading store highlights:', error);
      setSnackbar({
        open: true,
        message: 'Error loading store highlights',
        severity: 'error'
      });
    } finally {
      setStoreHighlightsLoading(false);
    }
  };

  const handleStoreHighlightToggle = (id) => {
    setStoreHighlightsForm(prev => ({
      ...prev,
      [id]: {
        ...prev[id],
        active: !prev[id].active
      }
    }));
  };

  const handleStoreHighlightTitleChange = (id, title) => {
    setStoreHighlightsForm(prev => ({
      ...prev,
      [id]: {
        ...prev[id],
        title
      }
    }));
  };

  const handleStoreHighlightSave = async (id) => {
    try {
      const formData = storeHighlightsForm[id];
      await axios.put(`/api/store-highlights/${id}`, {
        title: formData.title,
        active: formData.active
      });
      
      setSnackbar({
        open: true,
        message: 'Store highlight saved successfully',
        severity: 'success'
      });
    } catch (error) {
      console.error('Error saving store highlight:', error);
      setSnackbar({
        open: true,
        message: 'Error saving store highlight',
        severity: 'error'
      });
    }
  };

  const handleIconUpload = async (id, file) => {
    try {
      const formData = new FormData();
      formData.append('icon', file);
      
      const response = await axios.put(`/api/store-highlights/${id}/icon`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });
      
      setStoreHighlightsForm(prev => ({
        ...prev,
        [id]: {
          ...prev[id],
          icon: response.data.icon
        }
      }));
      
      setSnackbar({
        open: true,
        message: 'Icon uploaded successfully',
        severity: 'success'
      });
    } catch (error) {
      console.error('Error uploading icon:', error);
      setSnackbar({
        open: true,
        message: 'Error uploading icon',
        severity: 'error'
      });
    }
  };

  const handleIconDelete = async (id) => {
    try {
      await axios.delete(`/api/store-highlights/${id}/icon`);
      
      setStoreHighlightsForm(prev => ({
        ...prev,
        [id]: {
          ...prev[id],
          icon: ''
        }
      }));
      
      setSnackbar({
        open: true,
        message: 'Icon deleted successfully',
        severity: 'success'
      });
    } catch (error) {
      console.error('Error deleting icon:', error);
      setSnackbar({
        open: true,
        message: 'Error deleting icon',
        severity: 'error'
      });
    }
  };

  const getFeatureName = (featureType) => {
    const names = {
      delivery: 'Delivery Info',
      payment: 'Safe Payment',
      return: 'Return Policy',
      authentic: 'Authentic Product'
    };
    return names[featureType] || featureType;
  };

  const getFeatureDescription = (featureType) => {
    const descriptions = {
      delivery: 'Enable/disable delivery information display on customer pages',
      payment: 'Show/hide secure payment badges and information',
      return: 'Display return policy details to customers',
      authentic: 'Show authenticity guarantees to customers'
    };
    return descriptions[featureType] || '';
  };

  return (
    <Box sx={{ 
      p: 4, 
      backgroundColor: '#f5f5f5',
      minHeight: '100vh'
    }}>
      <Typography variant="h4" sx={{ 
        mb: 4, 
        fontWeight: 300, 
        color: '#1e3a5f',
        textAlign: 'left'
      }}>
        Pages
      </Typography>

      <Paper sx={{ 
        mb: 3, 
        backgroundColor: 'white',
        borderRadius: 2,
        boxShadow: '0 2px 12px rgba(0,0,0,0.08)'
      }}>
        <Tabs
          value={activeTab}
          onChange={handleTabChange}
          variant="scrollable"
          scrollButtons="auto"
          sx={{
            borderBottom: '1px solid #e0e0e0',
            '& .MuiTab-root': {
              textTransform: 'none',
              fontSize: '14px',
              fontWeight: 500,
              minHeight: '56px',
              px: 3
            },
            '& .Mui-selected': {
              color: '#1e3a5f',
              fontWeight: 600
            },
            '& .MuiTabs-indicator': {
              backgroundColor: '#1e3a5f',
              height: '3px'
            }
          }}
        >
          {policyPages.map((page, index) => (
            <Tab key={page.id} label={page.label} />
          ))}
        </Tabs>
      </Paper>

      <Paper sx={{ 
        p: 4, 
        backgroundColor: 'white',
        borderRadius: 2,
        boxShadow: '0 2px 12px rgba(0,0,0,0.08)'
      }}>
        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', p: 6 }}>
            <CircularProgress />
          </Box>
        ) : policyPages[activeTab].id === 'reliability' ? (
          // Company Reliability Interface
          <Box>
            {/* Header */}
            <Typography variant="h4" sx={{ 
              color: '#333',
              fontWeight: 600,
              mb: 4
            }}>
              Company Reliability
            </Typography>

            {/* Reliability Section */}
            <Paper sx={{ 
              mb: 4,
              p: 3,
              backgroundColor: 'white',
              borderRadius: 2,
              boxShadow: '0 2px 12px rgba(0,0,0,0.08)'
            }}>
              <Typography variant="h6" sx={{ 
                color: '#333',
                fontWeight: 600,
                mb: 3
              }}>
                Reliability
              </Typography>
              
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
                {/* Reliability Toggle Items */}
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', py: 2, borderBottom: '1px solid #f0f0f0' }}>
                  <Box>
                    <Typography variant="body1" sx={{ fontWeight: 500 }}>
                      SSL Certificate
                    </Typography>
                    <Typography variant="body2" sx={{ color: '#666' }}>
                      Secure connection for your website
                    </Typography>
                  </Box>
                  <Switch
                    checked={true}
                    onChange={() => {}}
                    sx={{
                      '& .MuiSwitch-switchBase.Mui-checked': {
                        color: '#1e3a5f',
                      },
                      '& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track': {
                        backgroundColor: '#1e3a5f',
                      },
                    }}
                  />
                </Box>

                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', py: 2, borderBottom: '1px solid #f0f0f0' }}>
                  <Box>
                    <Typography variant="body1" sx={{ fontWeight: 500 }}>
                      Data Protection
                    </Typography>
                    <Typography variant="body2" sx={{ color: '#666' }}>
                      GDPR compliance and data security
                    </Typography>
                  </Box>
                  <Switch
                    checked={true}
                    onChange={() => {}}
                    sx={{
                      '& .MuiSwitch-switchBase.Mui-checked': {
                        color: '#1e3a5f',
                      },
                      '& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track': {
                        backgroundColor: '#1e3a5f',
                      },
                    }}
                  />
                </Box>

                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', py: 2 }}>
                  <Box>
                    <Typography variant="body1" sx={{ fontWeight: 500 }}>
                      Business Verification
                    </Typography>
                    <Typography variant="body2" sx={{ color: '#666' }}>
                      Verified business credentials
                    </Typography>
                  </Box>
                  <Switch
                    checked={false}
                    onChange={() => {}}
                    sx={{
                      '& .MuiSwitch-switchBase': {
                        color: '#ccc',
                      },
                      '& .MuiSwitch-switchBase + .MuiSwitch-track': {
                        backgroundColor: '#ccc',
                      },
                    }}
                  />
                </Box>
              </Box>
            </Paper>

            {/* Store Highlights Section */}
            <Paper sx={{ 
              p: 3,
              backgroundColor: 'white',
              borderRadius: 2,
              boxShadow: '0 2px 12px rgba(0,0,0,0.08)'
            }}>
              <Typography variant="h6" sx={{ 
                color: '#333',
                fontWeight: 600,
                mb: 3
              }}>
                Store Highlights
              </Typography>

              {storeHighlightsLoading ? (
                <Box sx={{ display: 'flex', justifyContent: 'center', p: 6 }}>
                  <CircularProgress />
                </Box>
              ) : (
                <>
                  <Grid container spacing={3}>
                    {storeHighlights.map((highlight) => (
                      <Grid item xs={12} sm={6} md={3} key={highlight._id}>
                      <Card sx={{ 
                        height: '100%',
                        borderRadius: 2,
                        boxShadow: '0 2px 12px rgba(0,0,0,0.08)',
                        '&:hover': {
                          boxShadow: '0 4px 20px rgba(0,0,0,0.12)'
                        }
                      }}>
                        <CardContent sx={{ p: 3 }}>
                          {/* Header */}
                          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                              <Typography variant="h6" sx={{ fontSize: '16px', fontWeight: 600 }}>
                                {getFeatureName(highlight.featureType)}
                              </Typography>
                              <Tooltip title={getFeatureDescription(highlight.featureType)} arrow>
                                <InfoIcon sx={{ fontSize: 16, color: '#666', cursor: 'help' }} />
                              </Tooltip>
                            </Box>
                            <Switch
                              checked={storeHighlightsForm[highlight._id]?.active || false}
                              onChange={() => handleStoreHighlightToggle(highlight._id)}
                              size="small"
                              sx={{
                                '& .MuiSwitch-switchBase.Mui-checked': {
                                  color: '#1e3a5f',
                                },
                                '& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track': {
                                  backgroundColor: '#1e3a5f',
                                },
                                '& .MuiSwitch-switchBase': {
                                  color: '#ccc',
                                },
                                '& .MuiSwitch-switchBase + .MuiSwitch-track': {
                                  backgroundColor: '#ccc',
                                },
                              }}
                            />
                          </Box>

                          {/* Content */}
                          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
                            {/* Title Input */}
                            <TextField
                              label="Title"
                              fullWidth
                              size="small"
                              value={storeHighlightsForm[highlight._id]?.title || ''}
                              onChange={(e) => handleStoreHighlightTitleChange(highlight._id, e.target.value)}
                              multiline
                              rows={2}
                            />

                            {/* Icon Upload */}
                            <Box>
                              <Typography variant="body2" sx={{ mb: 1, color: '#666' }}>
                                Icon
                              </Typography>
                              <Box
                                sx={{
                                  border: '2px dashed #ccc',
                                  borderRadius: 2,
                                  p: 3,
                                  textAlign: 'center',
                                  cursor: 'pointer',
                                  transition: 'all 0.2s',
                                  '&:hover': {
                                    borderColor: '#1e3a5f',
                                    backgroundColor: '#f8f9fa'
                                  },
                                  minHeight: '120px',
                                  display: 'flex',
                                  flexDirection: 'column',
                                  alignItems: 'center',
                                  justifyContent: 'center'
                                }}
                                onClick={() => {
                                  const input = document.createElement('input');
                                  input.type = 'file';
                                  input.accept = 'image/*';
                                  input.onchange = (e) => {
                                    const file = e.target.files[0];
                                    if (file) {
                                      handleIconUpload(highlight._id, file);
                                    }
                                  };
                                  input.click();
                                }}
                              >
                                {storeHighlightsForm[highlight._id]?.icon ? (
                                  <Box sx={{ position: 'relative' }}>
                                    <img
                                      src={storeHighlightsForm[highlight._id].icon.startsWith('http') 
                                        ? storeHighlightsForm[highlight._id].icon 
                                        : `${API_BASE_URL}/${storeHighlightsForm[highlight._id].icon}`}
                                      alt="Icon preview"
                                      style={{ maxWidth: '60px', maxHeight: '60px', objectFit: 'contain' }}
                                    />
                                    <IconButton
                                      size="small"
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        handleIconDelete(highlight._id);
                                      }}
                                      sx={{
                                        position: 'absolute',
                                        top: -8,
                                        right: -8,
                                        backgroundColor: 'white',
                                        boxShadow: 1,
                                        '&:hover': {
                                          backgroundColor: '#f5f5f5'
                                        }
                                      }}
                                    >
                                      <DeleteIcon sx={{ fontSize: 16 }} />
                                    </IconButton>
                                  </Box>
                                ) : (
                                  <React.Fragment>
                                    <CloudUploadIcon sx={{ fontSize: 40, color: '#ccc', mb: 1 }} />
                                    <Typography variant="body2" sx={{ color: '#666' }}>
                                      Upload Icon
                                    </Typography>
                                    <Typography variant="caption" sx={{ color: '#999' }}>
                                      PNG, JPG, SVG up to 2MB
                                    </Typography>
                                  </React.Fragment>
                                )}
                              </Box>
                            </Box>

                            {/* Save Button */}
                            <Button
                              variant="contained"
                              onClick={() => handleStoreHighlightSave(highlight._id)}
                              sx={{
                                backgroundColor: '#1e3a5f',
                                color: 'white',
                                textTransform: 'none',
                                '&:hover': {
                                  backgroundColor: '#2d5a8c'
                                },
                                alignSelf: 'flex-end'
                              }}
                            >
                              SAVE
                            </Button>
                          </Box>
                        </CardContent>
                      </Card>
                    </Grid>
                  ))}
                </Grid>
                </>
              )}
            </Paper>
          </Box>
        ) : policyPages[activeTab].id === 'faq' ? (
          // FAQ Management Interface
          <Box>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
              <Typography variant="h5" sx={{ 
                color: '#333',
                fontWeight: 500
              }}>
                Help Topic Table
              </Typography>
              <Button
                variant="contained"
                onClick={handleAddFAQ}
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

            {/* Search and Entries Controls */}
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
              <FormControl size="small" sx={{ minWidth: 120 }}>
                <InputLabel>Show entries</InputLabel>
                <Select
                  value={faqPagination.rowsPerPage}
                  onChange={(e) => setFaqPagination(prev => ({ ...prev, rowsPerPage: parseInt(e.target.value), page: 0 }))}
                  label="Show entries"
                >
                  <MenuItem value={10}>10</MenuItem>
                  <MenuItem value={25}>25</MenuItem>
                  <MenuItem value={50}>50</MenuItem>
                  <MenuItem value={100}>100</MenuItem>
                </Select>
              </FormControl>
              
              <TextField
                size="small"
                placeholder="Enter Keywords"
                value={faqSearch}
                onChange={(e) => setFaqSearch(e.target.value)}
                sx={{ width: 250 }}
              />
            </Box>

            {/* FAQ Table */}
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>SL</TableCell>
                    <TableCell 
                      onClick={() => handleFaqSort('question')}
                      sx={{ cursor: 'pointer', '&:hover': { backgroundColor: '#f5f5f5' } }}
                    >
                      Question {faqSort.field === 'question' && (faqSort.order === 'asc' ? '↑' : '↓')}
                    </TableCell>
                    <TableCell 
                      onClick={() => handleFaqSort('answer')}
                      sx={{ cursor: 'pointer', '&:hover': { backgroundColor: '#f5f5f5' } }}
                    >
                      Answer {faqSort.field === 'answer' && (faqSort.order === 'asc' ? '↑' : '↓')}
                    </TableCell>
                    <TableCell 
                      onClick={() => handleFaqSort('ranking')}
                      sx={{ cursor: 'pointer', '&:hover': { backgroundColor: '#f5f5f5' } }}
                    >
                      Ranking {faqSort.field === 'ranking' && (faqSort.order === 'asc' ? '↑' : '↓')}
                    </TableCell>
                    <TableCell>Status</TableCell>
                    <TableCell>Action</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {faqLoading ? (
                    <TableRow>
                      <TableCell colSpan={6} sx={{ textAlign: 'center', py: 4 }}>
                        <CircularProgress />
                      </TableCell>
                    </TableRow>
                  ) : faqs.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={6} sx={{ textAlign: 'center', py: 4 }}>
                        No data available in table
                      </TableCell>
                    </TableRow>
                  ) : (
                    faqs.map((faq, index) => (
                      <TableRow key={faq._id}>
                        <TableCell>{faqPagination.page * faqPagination.rowsPerPage + index + 1}</TableCell>
                        <TableCell>{faq.question}</TableCell>
                        <TableCell>{faq.answer.substring(0, 100)}{faq.answer.length > 100 ? '...' : ''}</TableCell>
                        <TableCell>{faq.ranking}</TableCell>
                        <TableCell>
                          <Switch
                            checked={faq.active}
                            onChange={(e) => handleToggleFAQStatus(faq._id, e.target.checked)}
                            size="small"
                          />
                        </TableCell>
                        <TableCell>
                          <Button size="small" onClick={() => handleEditFAQ(faq)}>Edit</Button>
                          <Button size="small" color="error" onClick={() => handleDeleteFAQ(faq._id)}>Delete</Button>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </TableContainer>

            {/* Pagination */}
            <TablePagination
              rowsPerPageOptions={[10, 25, 50, 100]}
              component="div"
              count={faqPagination.total}
              rowsPerPage={faqPagination.rowsPerPage}
              page={faqPagination.page}
              onPageChange={(e, newPage) => setFaqPagination(prev => ({ ...prev, page: newPage }))}
              onRowsPerPageChange={(e) => setFaqPagination(prev => ({ ...prev, rowsPerPage: parseInt(e.target.value), page: 0 }))}
            />
          </Box>
        ) : (
          // Regular Policy Content Editor
          <form onSubmit={handleSubmit}>
            <Box sx={{ mb: 4 }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                <Typography variant="h5" sx={{ 
                  color: '#333',
                  fontWeight: 500
                }}>
                  {policyPages[activeTab].label}
                </Typography>
                
                {policyPages[activeTab].id === 'refund' && (
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                    <Typography variant="body2" sx={{ color: '#666' }}>
                      {refundPolicyActive ? 'ON' : 'OFF'}
                    </Typography>
                    <Switch
                      checked={refundPolicyActive}
                      onChange={handleRefundPolicyToggle}
                      sx={{
                        '& .MuiSwitch-switchBase.Mui-checked': {
                          color: '#1e3a5f',
                        },
                        '& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track': {
                          backgroundColor: '#1e3a5f',
                        },
                        '& .MuiSwitch-switchBase': {
                          color: '#ccc',
                        },
                        '& .MuiSwitch-switchBase + .MuiSwitch-track': {
                          backgroundColor: '#ccc',
                        },
                      }}
                    />
                  </Box>
                )}
                {policyPages[activeTab].id === 'return' && (
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                    <Typography variant="body2" sx={{ color: '#666' }}>
                      {returnPolicyActive ? 'ON' : 'OFF'}
                    </Typography>
                    <Switch
                      checked={returnPolicyActive}
                      onChange={handleReturnPolicyToggle}
                      sx={{
                        '& .MuiSwitch-switchBase.Mui-checked': {
                          color: '#1e3a5f',
                        },
                        '& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track': {
                          backgroundColor: '#1e3a5f',
                        },
                        '& .MuiSwitch-switchBase': {
                          color: '#ccc',
                        },
                        '& .MuiSwitch-switchBase + .MuiSwitch-track': {
                          backgroundColor: '#ccc',
                        },
                      }}
                    />
                  </Box>
                )}
                {policyPages[activeTab].id === 'cancellation' && (
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                    <Typography variant="body2" sx={{ color: '#666' }}>
                      {cancellationPolicyActive ? 'ON' : 'OFF'}
                    </Typography>
                    <Switch
                      checked={cancellationPolicyActive}
                      onChange={handleCancellationPolicyToggle}
                      sx={{
                        '& .MuiSwitch-switchBase.Mui-checked': {
                          color: '#1e3a5f',
                        },
                        '& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track': {
                          backgroundColor: '#1e3a5f',
                        },
                        '& .MuiSwitch-switchBase': {
                          color: '#ccc',
                        },
                        '& .MuiSwitch-switchBase + .MuiSwitch-track': {
                          backgroundColor: '#ccc',
                        },
                      }}
                    />
                  </Box>
                )}
                {policyPages[activeTab].id === 'shipping' && (
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                    <Typography variant="body2" sx={{ color: '#666' }}>
                      {shippingPolicyActive ? 'ON' : 'OFF'}
                    </Typography>
                    <Switch
                      checked={shippingPolicyActive}
                      onChange={handleShippingPolicyToggle}
                      sx={{
                        '& .MuiSwitch-switchBase.Mui-checked': {
                          color: '#1e3a5f',
                        },
                        '& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track': {
                          backgroundColor: '#1e3a5f',
                        },
                        '& .MuiSwitch-switchBase': {
                          color: '#ccc',
                        },
                        '& .MuiSwitch-switchBase + .MuiSwitch-track': {
                          backgroundColor: '#ccc',
                        },
                      }}
                    />
                  </Box>
                )}
              </Box>
              
              <Box sx={{
                '& .ql-editor': {
                  minHeight: '400px',
                  fontSize: '15px',
                  lineHeight: 1.6,
                  padding: '20px'
                },
                '& .ql-toolbar': {
                  backgroundColor: '#fafafa',
                  border: '1px solid #ddd',
                  borderRadius: '8px 8px 0 0',
                  borderBottom: 'none'
                },
                '& .ql-container': {
                  border: '1px solid #ddd',
                  borderRadius: '0 0 8px 8px',
                  fontSize: '15px'
                }
              }}>
                <ReactQuill
                  ref={quillRef}
                  theme="snow"
                  value={content}
                  onChange={setContent}
                  modules={modules}
                  formats={formats}
                  placeholder={`Enter ${policyPages[activeTab].label} content here...`}
                  style={{
                    height: '400px'
                  }}
                />
              </Box>
            </Box>

            <Box sx={{ mt: 6 }}>
              <Button
                type="submit"
                variant="contained"
                fullWidth
                disabled={saving}
                sx={{
                  backgroundColor: '#1e3a5f',
                  color: 'white',
                  py: 2,
                  fontSize: '16px',
                  fontWeight: 600,
                  textTransform: 'none',
                  borderRadius: 2,
                  boxShadow: '0 4px 12px rgba(30, 58, 95, 0.3)',
                  '&:hover': {
                    backgroundColor: '#2d5a8c',
                    boxShadow: '0 6px 16px rgba(30, 58, 95, 0.4)'
                  },
                  '&:disabled': {
                    backgroundColor: '#ccc',
                    boxShadow: 'none'
                  }
                }}
              >
                {saving ? 'Saving...' : 'Submit'}
              </Button>
            </Box>
          </form>
        )}
      </Paper>

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

      <Dialog
        open={dialogOpen}
        onClose={handleDialogCancel}
        aria-labelledby="alert-dialog-title"
        aria-describedby="alert-dialog-description"
      >
        <DialogTitle id="alert-dialog-title">
          {dialogAction === 'turnOff' 
            ? `Want to Turn OFF ${currentPolicyType === 'refund' ? 'Refund' : currentPolicyType === 'return' ? 'Return' : currentPolicyType === 'cancellation' ? 'Cancellation' : 'Shipping'} policy Status`
            : `Want to Turn ON ${currentPolicyType === 'refund' ? 'Refund' : currentPolicyType === 'return' ? 'Return' : currentPolicyType === 'cancellation' ? 'Cancellation' : 'Shipping'} policy Status`
          }
        </DialogTitle>
        <DialogContent>
          <DialogContentText id="alert-dialog-description">
            {dialogAction === 'turnOff' 
              ? `If you disable this option ${currentPolicyType === 'refund' ? 'refund' : currentPolicyType === 'return' ? 'return' : currentPolicyType === 'cancellation' ? 'cancellation' : 'shipping'} policy page will not be shown in the user app and website`
              : `If you enable this option ${currentPolicyType === 'refund' ? 'refund' : currentPolicyType === 'return' ? 'return' : currentPolicyType === 'cancellation' ? 'cancellation' : 'shipping'} policy page will be shown in the user app and website`
            }
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleDialogCancel}>Cancel</Button>
          <Button onClick={handleDialogConfirm} autoFocus>
            Ok
          </Button>
        </DialogActions>
      </Dialog>

      {/* FAQ Modal */}
      <Dialog
        open={faqModalOpen}
        onClose={() => setFaqModalOpen(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>
          {editingFaq ? 'Edit Help Topic' : 'Add Help Topic'}
        </DialogTitle>
        <DialogContent>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3, pt: 2 }}>
            <TextField
              label="Question"
              fullWidth
              multiline
              rows={2}
              value={faqForm.question}
              onChange={(e) => setFaqForm(prev => ({ ...prev, question: e.target.value }))}
              required
            />
            <TextField
              label="Answer"
              fullWidth
              multiline
              rows={4}
              value={faqForm.answer}
              onChange={(e) => setFaqForm(prev => ({ ...prev, answer: e.target.value }))}
              required
            />
            <TextField
              label="Ranking"
              type="number"
              fullWidth
              value={faqForm.ranking}
              onChange={(e) => setFaqForm(prev => ({ ...prev, ranking: parseInt(e.target.value) || 0 }))}
              inputProps={{ min: 0 }}
            />
            <FormControlLabel
              control={
                <Checkbox
                  checked={faqForm.active}
                  onChange={(e) => setFaqForm(prev => ({ ...prev, active: e.target.checked }))}
                />
              }
              label="Active"
            />
          </Box>
        </DialogContent>
        <DialogActions sx={{ p: 3 }}>
          <Button onClick={() => setFaqModalOpen(false)}>
            Close
          </Button>
          <Button
            onClick={handleSaveFAQ}
            variant="contained"
            sx={{
              backgroundColor: '#1e3a5f',
              color: 'white',
              '&:hover': {
                backgroundColor: '#2d5a8c'
              }
            }}
          >
            {editingFaq ? 'Update' : 'Save'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default BusinessPages;
