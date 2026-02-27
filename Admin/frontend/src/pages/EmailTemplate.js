import React, { useState } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Button,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Switch,
  FormControlLabel,
  TextField,
  Divider,
  IconButton,
  Tooltip,
  Paper,
  Checkbox,
  Link,
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import {
  Save as SaveIcon,
  RestartAlt as RestartAltIcon,
  Info as InfoIcon,
  Image as ImageIcon,
  FormatBold as FormatBoldIcon,
  FormatItalic as FormatItalicIcon,
  FormatAlignLeft as FormatAlignLeftIcon,
  FormatAlignCenter as FormatAlignCenterIcon,
  FormatAlignRight as FormatAlignRightIcon,
  Link as LinkIcon,
  Code as CodeIcon,
  Upload as UploadIcon,
} from '@mui/icons-material';

export default function EmailTemplate() {
  const navigate = useNavigate();
  
  // Template selection state
  const [selectedTemplate, setSelectedTemplate] = useState('admin-mail-template');
  const [activeTab, setActiveTab] = useState('admin-mail-template');

  // Template activation state
  const [emailEnabled, setEmailEnabled] = useState(true);

  // Template content state
  const [templateData, setTemplateData] = useState({
    logo: null,
    title: 'New Order Received',
    mailBody: '<p>Hi [adminName],</p><p>We have sent you this email to notify you that a new order has been received.</p><p>Please review the order details below.</p>',
    includeOrderInfo: true,
    sectionText: 'Please contact us for any queries regarding this order.',
    privacyPolicy: true,
    refundPolicy: true,
    cancellationPolicy: true,
    contactUs: true,
    twitter: true,
    linkedin: false,
    googlePlus: false,
    pinterest: false,
    instagram: true,
    facebook: true,
    copyright: '© 2024 Your Company. All rights reserved.',
  });

  // Handle template selection
  const handleTemplateChange = (event) => {
    const templateValue = event.target.value;
    setSelectedTemplate(templateValue);
    setActiveTab(templateValue);
    
    // Navigate to different template pages
    if (templateValue === 'vendor-mail-template') {
      navigate('/vendor-mail-template');
    } else if (templateValue === 'customer-mail-template') {
      navigate('/customer-mail-template');
    } else if (templateValue === 'delivery-man-mail-template') {
      navigate('/delivery-man-mail-template');
    }
    // For admin-mail-template, stay on current page
  };

  // Handle content changes
  const handleContentChange = (field) => (event) => {
    setTemplateData(prev => ({
      ...prev,
      [field]: event.target.type === 'checkbox' ? event.target.checked : event.target.value
    }));
  };

  // Handle logo upload
  const handleLogoUpload = (event) => {
    const file = event.target.files[0];
    if (file) {
      setTemplateData(prev => ({
        ...prev,
        logo: file
      }));
    }
  };

  // Handle save
  const handleSave = () => {
    console.log('Saving template:', templateData);
    alert('Email template saved successfully!');
  };

  // Handle reset
  const handleReset = () => {
    setTemplateData({
      logo: null,
      title: 'New Order Received',
      mailBody: '<p>Hi [adminName],</p><p>We have sent you this email to notify you that a new order has been received.</p><p>Please review the order details below.</p>',
      includeOrderInfo: true,
      sectionText: 'Please contact us for any queries regarding this order.',
      privacyPolicy: true,
      refundPolicy: true,
      cancellationPolicy: true,
      contactUs: true,
      twitter: true,
      linkedin: false,
      googlePlus: false,
      pinterest: false,
      instagram: true,
      facebook: true,
      copyright: '© 2024 Your Company. All rights reserved.',
    });
  };

  // WYSIWYG Toolbar Component
  const WysiwygToolbar = () => (
    <Box sx={{ 
      border: '1px solid #ddd', 
      borderBottom: 'none', 
      p: 1, 
      backgroundColor: '#f8f8f8',
      borderTopLeftRadius: 4,
      borderTopRightRadius: 4
    }}>
      <Box sx={{ display: 'flex', gap: 1 }}>
        <IconButton size="small">
          <FormatBoldIcon />
        </IconButton>
        <IconButton size="small">
          <FormatItalicIcon />
        </IconButton>
        <Divider orientation="vertical" flexItem />
        <IconButton size="small">
          <FormatAlignLeftIcon />
        </IconButton>
        <IconButton size="small">
          <FormatAlignCenterIcon />
        </IconButton>
        <IconButton size="small">
          <FormatAlignRightIcon />
        </IconButton>
        <Divider orientation="vertical" flexItem />
        <IconButton size="small">
          <LinkIcon />
        </IconButton>
        <IconButton size="small">
          <CodeIcon />
        </IconButton>
      </Box>
    </Box>
  );

  // Email Preview Component
  const EmailPreview = () => (
    <Paper sx={{ p: 3, backgroundColor: '#fff', border: '1px solid #e0e0e0', height: '100%' }}>
      {/* Email Header */}
      <Box sx={{ textAlign: 'center', mb: 3 }}>
        {templateData.logo ? (
          <Box sx={{ width: 120, height: 60, backgroundColor: '#f0f0f0', mx: 'auto', mb: 2, borderRadius: 1 }}>
            <Typography variant="body2" sx={{ p: 2, textAlign: 'center' }}>Logo</Typography>
          </Box>
        ) : (
          <Box sx={{ width: 120, height: 60, backgroundColor: '#f0f0f0', mx: 'auto', mb: 2, borderRadius: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <ImageIcon sx={{ color: '#ccc' }} />
          </Box>
        )}
        <Typography variant="h6" sx={{ fontWeight: 600, mb: 1 }}>
          {templateData.title}
        </Typography>
      </Box>

      {/* Email Body */}
      <Box sx={{ mb: 3 }}>
        <div dangerouslySetInnerHTML={{ __html: templateData.mailBody }} />
      </Box>

      {/* Order Information */}
      {templateData.includeOrderInfo && (
        <Box sx={{ 
          backgroundColor: '#f8f9fa', 
          p: 3, 
          borderRadius: 2, 
          mb: 3,
          border: '1px solid #e9ecef'
        }}>
          <Typography variant="h6" sx={{ fontWeight: 600, mb: 2 }}>
            Order Information
          </Typography>
          <Typography variant="body2" sx={{ mb: 1 }}>
            <strong>Order #:</strong> 432121
          </Typography>
          <Typography variant="body2" sx={{ mb: 1 }}>
            <strong>Date:</strong> {new Date().toLocaleDateString()}
          </Typography>
          <Typography variant="body2" sx={{ mb: 2 }}>
            <strong>Status:</strong> <span sx={{ color: 'success.main' }}>Pending</span>
          </Typography>
          
          {/* Product List */}
          <Box sx={{ mb: 2 }}>
            <Typography variant="body2" sx={{ fontWeight: 600, mb: 1 }}>
              Products:
            </Typography>
            <Box sx={{ backgroundColor: '#fff', p: 2, borderRadius: 1 }}>
              <Typography variant="body2" sx={{ mb: 1 }}>
                Product A - $29.99 x 2
              </Typography>
              <Typography variant="body2" sx={{ mb: 1 }}>
                Product B - $49.99 x 1
              </Typography>
              <Divider sx={{ my: 1 }} />
              <Typography variant="body2" sx={{ fontWeight: 600 }}>
                Total: $109.97
              </Typography>
            </Box>
          </Box>
        </Box>
      )}

      {/* Footer */}
      <Box sx={{ textAlign: 'center', pt: 2, borderTop: '1px solid #e0e0e0' }}>
        <Typography variant="body2" sx={{ mb: 2 }}>
          {templateData.sectionText}
        </Typography>
        
        {/* Page Links */}
        <Box sx={{ display: 'flex', justifyContent: 'center', gap: 2, mb: 2, flexWrap: 'wrap' }}>
          {templateData.privacyPolicy && (
            <Link href="#" underline="hover" sx={{ fontSize: 12 }}>
              Privacy Policy
            </Link>
          )}
          {templateData.refundPolicy && (
            <Link href="#" underline="hover" sx={{ fontSize: 12 }}>
              Refund Policy
            </Link>
          )}
          {templateData.cancellationPolicy && (
            <Link href="#" underline="hover" sx={{ fontSize: 12 }}>
              Cancellation Policy
            </Link>
          )}
          {templateData.contactUs && (
            <Link href="#" underline="hover" sx={{ fontSize: 12 }}>
              Contact Us
            </Link>
          )}
        </Box>
        
        {/* Social Media Links */}
        <Box sx={{ display: 'flex', justifyContent: 'center', gap: 1, mb: 2 }}>
          {templateData.twitter && <Box sx={{ width: 24, height: 24, backgroundColor: '#1DA1F2', borderRadius: '50%' }} />}
          {templateData.linkedin && <Box sx={{ width: 24, height: 24, backgroundColor: '#0077B5', borderRadius: '50%' }} />}
          {templateData.googlePlus && <Box sx={{ width: 24, height: 24, backgroundColor: '#DB4437', borderRadius: '50%' }} />}
          {templateData.pinterest && <Box sx={{ width: 24, height: 24, backgroundColor: '#BD081C', borderRadius: '50%' }} />}
          {templateData.instagram && <Box sx={{ width: 24, height: 24, backgroundColor: '#E4405F', borderRadius: '50%' }} />}
          {templateData.facebook && <Box sx={{ width: 24, height: 24, backgroundColor: '#4267B2', borderRadius: '50%' }} />}
        </Box>
        
        {/* Copyright */}
        <Typography variant="body2" color="text.secondary" sx={{ fontSize: 11 }}>
          {templateData.copyright}
        </Typography>
      </Box>
    </Paper>
  );

  return (
    <Box sx={{ p: 3 }}>
      {/* Header */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4" sx={{ fontWeight: 600 }}>
          Email Template
        </Typography>
        
        {/* Template Selector */}
        <FormControl size="small" sx={{ minWidth: 200 }}>
          <InputLabel>Admin mail template</InputLabel>
          <Select
            value={selectedTemplate}
            onChange={handleTemplateChange}
            label="Admin mail template"
          >
            <MenuItem value="admin-mail-template">Admin mail template</MenuItem>
            <MenuItem value="vendor-mail-template">Vendor mail template</MenuItem>
            <MenuItem value="customer-mail-template">Customer mail template</MenuItem>
            <MenuItem value="delivery-man-mail-template">Delivery man mail template</MenuItem>
          </Select>
        </FormControl>
      </Box>

      {/* Template Type Tabs */}
      <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}>
        <Box sx={{ display: 'flex' }}>
          {['Order Received'].map((tab) => (
            <Button
              key={tab}
              onClick={() => setActiveTab(tab)}
              variant={activeTab === tab ? "contained" : "text"}
              sx={{ 
                borderRadius: 0,
                textTransform: 'none',
                color: activeTab === tab ? 'primary' : 'inherit',
                px: 3,
                py: 1,
                mr: 1
              }}
            >
              {tab.split('-').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')}
            </Button>
          ))}
        </Box>
      </Box>
           {/* Email Activation Section */}
       <Card sx={{ backgroundColor: '#f8f9fa', border: '0.5px solid #e9ecef', mb: 3 }}>
                <CardContent sx={{ p: 3 }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Box>
                      <Typography variant="body1" sx={{ fontWeight: 500 }}>
                        Get Email On Registration?
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        Enable this to send email notifications when new users register
                      </Typography>
                    </Box>
                    <FormControlLabel
                      control={
                        <Switch
                          checked={emailEnabled}
                          onChange={handleContentChange('emailEnabled')}
                        />
                      }
                      label=""
                    />
                  </Box>
                </CardContent>
              </Card>

      {/* Main Content */}
      <Box sx={{ display: 'flex', gap: 3 }}>
        {/* Left Panel - Email Preview */}
        <Box sx={{ flex: 1 }}>
          <Typography variant="h6" sx={{ fontWeight: 600, mb: 2 }}>
            Email Preview
          </Typography>
          <EmailPreview />
        </Box>

        {/* Right Panel - Content Editor */}
        <Box sx={{ flex: 1 }}>
          <Card sx={{ borderRadius: 2, boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }}>
            <CardContent sx={{ p: 3 }}>
              {/* Instructions Link */}
              <Box sx={{ mt: 2, textAlign: 'right' }}>
                <Link href="#" underline="hover" sx={{ fontSize: 14 }}>
                  Read instructions
                </Link>
              </Box>

              {/* Template Settings */}
              <Typography variant="h6" sx={{ fontWeight: 600, mb: 3 }}>
                Template Content Editor
              </Typography>

              {/* Email Title/Header */}
              <Typography variant="h6" sx={{ fontWeight: 600, mb: 2 }}>
                Email Header
              </Typography>

              {/* Logo Upload */}
              <Box sx={{ mb: 3 }}>
                <Typography variant="body2" sx={{ fontWeight: 500, mb: 1 }}>
                  Logo Upload
                </Typography>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                  <Box sx={{ 
                    width: 80, 
                    height: 40, 
                    border: '1px dashed #ccc', 
                    borderRadius: 1, 
                    display: 'flex', 
                    alignItems: 'center', 
                    justifyContent: 'center',
                    cursor: 'pointer'
                  }}>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleLogoUpload}
                      style={{ display: 'none' }}
                      id="logo-upload"
                    />
                    <label htmlFor="logo-upload" style={{ cursor: 'pointer' }}>
                      <UploadIcon sx={{ color: '#ccc', fontSize: 20 }} />
                    </label>
                  </Box>
                  <Typography variant="body2" color="text.secondary">
                    {templateData.logo ? templateData.logo.name : 'No logo uploaded'}
                  </Typography>
                </Box>
              </Box>

              {/* Title */}
              <TextField
                fullWidth
                label="Title (EN)"
                value={templateData.title}
                onChange={handleContentChange('title')}
                sx={{ mb: 3 }}
              />

              <Divider sx={{ my: 3 }} />

              {/* Mail Body */}
              <Typography variant="h6" sx={{ fontWeight: 600, mb: 2 }}>
                Mail Body
              </Typography>
              
              <WysiwygToolbar />
              <TextField
                fullWidth
                multiline
                rows={8}
                value={templateData.mailBody.replace(/<[^>]*>/g, '')}
                onChange={(e) => setTemplateData(prev => ({ ...prev, mailBody: e.target.value }))}
                sx={{ 
                  '& .MuiOutlinedInput-root': { 
                    borderTopLeftRadius: 0,
                    borderTopRightRadius: 0
                  }
                }}
              />

              <Divider sx={{ my: 3 }} />

              {/* Footer Content */}
              <Typography variant="h6" sx={{ fontWeight: 600, mb: 2 }}>
                Footer Content
              </Typography>

              {/* Order Information Toggle */}
              <FormControlLabel
                control={
                  <Switch
                    checked={templateData.includeOrderInfo}
                    onChange={handleContentChange('includeOrderInfo')}
                  />
                }
                label="Order information will be automatically bind from database..."
                sx={{ mb: 3 }}
              />

              {/* Section Text */}
              <TextField
                fullWidth
                label="Section Text (EN)"
                value={templateData.sectionText}
                onChange={handleContentChange('sectionText')}
                sx={{ mb: 3 }}
              />

              {/* Page Links */}
              <Typography variant="body2" sx={{ fontWeight: 500, mb: 2 }}>
                Page Links
              </Typography>
              <Box sx={{ display: 'flex', flexDirection: 'row', gap: 1, mb: 3 }}>
                <FormControlLabel
                  control={<Checkbox checked={templateData.privacyPolicy} onChange={handleContentChange('privacyPolicy')} />}
                  label="Privacy Policy"
                />
                <FormControlLabel
                  control={<Checkbox checked={templateData.refundPolicy} onChange={handleContentChange('refundPolicy')} />}
                  label="Refund Policy"
                />
                <FormControlLabel
                  control={<Checkbox checked={templateData.cancellationPolicy} onChange={handleContentChange('cancellationPolicy')} />}
                  label="Cancellation Policy"
                />
                <FormControlLabel
                  control={<Checkbox checked={templateData.contactUs} onChange={handleContentChange('contactUs')} />}
                  label="Contact Us"
                />
              </Box>

              {/* Social Media Links */}
              <Typography variant="body2" sx={{ fontWeight: 500, mb: 2 }}>
                Social Media Links
              </Typography>
              <Box sx={{ display: 'flex', flexDirection: 'row', gap: 1, mb: 3 }}>
                <FormControlLabel
                  control={<Checkbox checked={templateData.twitter} onChange={handleContentChange('twitter')} />}
                  label="Twitter"
                />
                <FormControlLabel
                  control={<Checkbox checked={templateData.linkedin} onChange={handleContentChange('linkedin')} />}
                  label="LinkedIn"
                />
                <FormControlLabel
                  control={<Checkbox checked={templateData.googlePlus} onChange={handleContentChange('googlePlus')} />}
                  label="Google-Plus"
                />
                <FormControlLabel
                  control={<Checkbox checked={templateData.pinterest} onChange={handleContentChange('pinterest')} />}
                  label="Pinterest"
                />
                <FormControlLabel
                  control={<Checkbox checked={templateData.instagram} onChange={handleContentChange('instagram')} />}
                  label="Instagram"
                />
                <FormControlLabel
                  control={<Checkbox checked={templateData.facebook} onChange={handleContentChange('facebook')} />}
                  label="Facebook"
                />
              </Box>

              {/* Copyright */}
              <TextField
                fullWidth
                label="Copyright Content (EN)"
                value={templateData.copyright}
                onChange={handleContentChange('copyright')}
                sx={{ mb: 3 }}
              />

              {/* Action Buttons */}
              <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 2 }}>
                <Button
                  variant="outlined"
                  onClick={handleReset}
                  startIcon={<RestartAltIcon />}
                >
                  Reset
                </Button>
                <Button
                  variant="contained"
                  onClick={handleSave}
                  startIcon={<SaveIcon />}
                  sx={{ backgroundColor: '#1976d2', '&:hover': { backgroundColor: '#1565c0' } }}
                >
                  Save
                </Button>
              </Box>

            
            </CardContent>
          </Card>
        </Box>
      </Box>
    </Box>
  );
}
