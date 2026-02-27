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

export default function VendorMailTemplate() {
  const navigate = useNavigate();
  
  // Template selection state
  const [selectedTemplate, setSelectedTemplate] = useState('vendor-mail-template');
  const [activeTab, setActiveTab] = useState('registration');

  // Template activation state
  const [emailEnabled, setEmailEnabled] = useState(true);

  // Template content state
  const [templateData, setTemplateData] = useState({
    registration: {
      logo: null,
      title: 'Registration Complete',
      mailBody: '<p>Hi [vendorName],</p><p>Thank you for your registration request. Your request has been sent to the admin for review.</p><p>Please wait until admin review your registration.</p><p>Visit our website: <a href="https://ilenubox.com">https://ilenubox.com</a></p>',
      sectionText: 'Please contact us for any queries regarding your registration.',
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
    },
    'registration-approved': {
      logo: null,
      title: 'Registration Approved',
      mailBody: '<p>Hi [vendorName],</p><p>Congratulations! Your registration has been approved by the admin.</p><p>You can now start using your vendor account.</p><p>Visit our website: <a href="https://ilenubox.com">https://ilenubox.com</a></p>',
      sectionText: 'Please contact us for any queries regarding your approved account.',
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
    },
    'registration-denied': {
      logo: null,
      title: 'Registration Denied',
      mailBody: '<p>Hi [vendorName],</p><p>We regret to inform you that your registration request has been denied.</p><p>Please contact support for more information.</p><p>Visit our website: <a href="https://ilenubox.com">https://ilenubox.com</a></p>',
      sectionText: 'Please contact us for any queries regarding your registration status.',
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
    },
    'account-suspended': {
      logo: null,
      title: 'Account Suspended',
      mailBody: '<p>Hi [vendorName],</p><p>Your vendor account has been suspended due to policy violations.</p><p>Please contact support for more details.</p><p>Visit our website: <a href="https://ilenubox.com">https://ilenubox.com</a></p>',
      sectionText: 'Please contact us for any queries regarding your account suspension.',
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
    },
    'account-activation': {
      logo: null,
      title: 'Account Activated',
      mailBody: '<p>Hi [vendorName],</p><p>Your vendor account has been successfully activated.</p><p>You can now access all features of your account.</p><p>Visit our website: <a href="https://ilenubox.com">https://ilenubox.com</a></p>',
      sectionText: 'Please contact us for any queries regarding your account activation.',
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
    },
    'forgot-password': {
      logo: null,
      title: 'Password Reset',
      mailBody: '<p>Hi [vendorName],</p><p>We received a request to reset your password.</p><p>Click the link below to reset your password.</p><p>Visit our website: <a href="https://ilenubox.com">https://ilenubox.com</a></p>',
      sectionText: 'Please contact us for any queries regarding your password reset.',
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
    },
    'order-recevied': {
      logo: null,
      title: 'Order Received',
      mailBody: '<p>Hi [vendorName],</p><p>You have received a new order.</p><p>Please check your dashboard for order details.</p><p>Visit our website: <a href="https://ilenubox.com">https://ilenubox.com</a></p>',
      sectionText: 'Please contact us for any queries regarding your orders.',
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
    },
  });

  // Handle template selection
  const handleTemplateChange = (event) => {
    const templateValue = event.target.value;
    setSelectedTemplate(templateValue);
    setActiveTab(templateValue);
    
    // Navigate to different template pages
    if (templateValue === 'admin-mail-template') {
      navigate('/email-template');
    } else if (templateValue === 'customer-mail-template') {
      navigate('/customer-mail-template');
    } else if (templateValue === 'delivery-man-mail-template') {
      navigate('/delivery-man-mail-template');
    }
    // For vendor-mail-template, stay on current page
  };

  // Handle content changes
  const handleContentChange = (field) => (event) => {
    const value = event.target.type === 'checkbox' ? event.target.checked : event.target.value;
    setTemplateData(prev => ({
      ...prev,
      [activeTab]: {
        ...prev[activeTab],
        [field]: value
      }
    }));
  };

  // Handle logo upload
  const handleLogoUpload = (event) => {
    const file = event.target.files[0];
    if (file) {
      setTemplateData(prev => ({
        ...prev,
        [activeTab]: {
          ...prev[activeTab],
          logo: file
        }
      }));
    }
  };

  // Handle save
  const handleSave = () => {
    console.log('Saving vendor template:', templateData);
    alert('Vendor email template saved successfully!');
  };

  // Handle reset
  const handleReset = () => {
    const defaultContent = {
      registration: {
        logo: null,
        title: 'Registration Complete',
        mailBody: '<p>Hi [vendorName],</p><p>Thank you for your registration request. Your request has been sent to the admin for review.</p><p>Please wait until admin review your registration.</p><p>Visit our website: <a href="https://ilenubox.com">https://ilenubox.com</a></p>',
        sectionText: 'Please contact us for any queries regarding your registration.',
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
      },
      'registration-approved': {
        logo: null,
        title: 'Registration Approved',
        mailBody: '<p>Hi [vendorName],</p><p>Congratulations! Your registration has been approved by the admin.</p><p>You can now start using your vendor account.</p><p>Visit our website: <a href="https://ilenubox.com">https://ilenubox.com</a></p>',
        sectionText: 'Please contact us for any queries regarding your approved account.',
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
      },
      'registration-denied': {
        logo: null,
        title: 'Registration Denied',
        mailBody: '<p>Hi [vendorName],</p><p>We regret to inform you that your registration request has been denied.</p><p>Please contact support for more information.</p><p>Visit our website: <a href="https://ilenubox.com">https://ilenubox.com</a></p>',
        sectionText: 'Please contact us for any queries regarding your registration status.',
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
      },
      'account-suspended': {
        logo: null,
        title: 'Account Suspended',
        mailBody: '<p>Hi [vendorName],</p><p>Your vendor account has been suspended due to policy violations.</p><p>Please contact support for more details.</p><p>Visit our website: <a href="https://ilenubox.com">https://ilenubox.com</a></p>',
        sectionText: 'Please contact us for any queries regarding your account suspension.',
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
      },
      'account-activation': {
        logo: null,
        title: 'Account Activated',
        mailBody: '<p>Hi [vendorName],</p><p>Your vendor account has been successfully activated.</p><p>You can now access all features of your account.</p><p>Visit our website: <a href="https://ilenubox.com">https://ilenubox.com</a></p>',
        sectionText: 'Please contact us for any queries regarding your account activation.',
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
      },
      'forgot-password': {
        logo: null,
        title: 'Password Reset',
        mailBody: '<p>Hi [vendorName],</p><p>We received a request to reset your password.</p><p>Click the link below to reset your password.</p><p>Visit our website: <a href="https://ilenubox.com">https://ilenubox.com</a></p>',
        sectionText: 'Please contact us for any queries regarding your password reset.',
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
      },
      'order-recevied': {
        logo: null,
        title: 'Order Received',
        mailBody: '<p>Hi [vendorName],</p><p>You have received a new order.</p><p>Please check your dashboard for order details.</p><p>Visit our website: <a href="https://ilenubox.com">https://ilenubox.com</a></p>',
        sectionText: 'Please contact us for any queries regarding your orders.',
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
        copyright: ' 2024 Your Company. All rights reserved.',
        includeOrderInfo: true,
      },
    };
    setTemplateData(defaultContent);
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
  const EmailPreview = () => {
    const currentTemplate = templateData[activeTab] || templateData.registration;
    
    return (
      <Paper sx={{ p: 3, backgroundColor: '#fff', border: '1px solid #e0e0e0', height: '100%' }}>
        {/* Email Header */}
        <Box sx={{ textAlign: 'center', mb: 3 }}>
          {currentTemplate.logo ? (
            <Box sx={{ width: 120, height: 60, backgroundColor: '#f0f0f0', mx: 'auto', mb: 2, borderRadius: 1 }}>
              <Typography variant="body2" sx={{ p: 2, textAlign: 'center' }}>Logo</Typography>
            </Box>
          ) : (
            <Box sx={{ width: 120, height: 60, backgroundColor: '#f0f0f0', mx: 'auto', mb: 2, borderRadius: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <ImageIcon sx={{ color: '#ccc' }} />
            </Box>
          )}
          <Typography variant="h6" sx={{ fontWeight: 600, mb: 1 }}>
            {currentTemplate.title}
          </Typography>
        </Box>

        {/* Email Body */}
        <Box sx={{ mb: 3 }}>
          <div dangerouslySetInnerHTML={{ __html: currentTemplate.mailBody }} />
        </Box>

        {/* Order Information Box - only show for order-recevied tab */}
        {activeTab === 'order-recevied' && (
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

        {/* Registration Status Box - only show for registration tab */}
        {activeTab === 'registration' && (
          <Box sx={{ 
            backgroundColor: '#fff3cd', 
            border: '1px solid #ffeaa7',
            p: 3, 
            borderRadius: 2, 
            mb: 3
          }}>
            <Typography variant="body2" sx={{ fontWeight: 600, mb: 1, color: '#856404' }}>
              Registration Status: Pending Review
            </Typography>
            <Typography variant="body2" sx={{ color: '#856404' }}>
              Your registration request has been sent to the administrator for approval. 
              You will receive another email once your account has been reviewed.
            </Typography>
          </Box>
        )}

        {/* Footer */}
        <Box sx={{ textAlign: 'center', pt: 2, borderTop: '1px solid #e0e0e0' }}>
          <Typography variant="body2" sx={{ mb: 2 }}>
            {currentTemplate.sectionText}
          </Typography>
          
          {/* Page Links */}
          <Box sx={{ display: 'flex', justifyContent: 'center', gap: 2, mb: 2, flexWrap: 'wrap' }}>
            {currentTemplate.privacyPolicy && (
              <Link href="#" underline="hover" sx={{ fontSize: 12 }}>
                Privacy Policy
              </Link>
            )}
            {currentTemplate.refundPolicy && (
              <Link href="#" underline="hover" sx={{ fontSize: 12 }}>
                Refund Policy
              </Link>
            )}
            {currentTemplate.cancellationPolicy && (
              <Link href="#" underline="hover" sx={{ fontSize: 12 }}>
                Cancellation Policy
              </Link>
            )}
            {currentTemplate.contactUs && (
              <Link href="#" underline="hover" sx={{ fontSize: 12 }}>
                Contact Us
              </Link>
            )}
          </Box>
          
          {/* Social Media Links */}
          <Box sx={{ display: 'flex', justifyContent: 'center', gap: 1, mb: 2 }}>
            {currentTemplate.twitter && <Box sx={{ width: 24, height: 24, backgroundColor: '#1DA1F2', borderRadius: '50%' }} />}
            {currentTemplate.linkedin && <Box sx={{ width: 24, height: 24, backgroundColor: '#0077B5', borderRadius: '50%' }} />}
            {currentTemplate.googlePlus && <Box sx={{ width: 24, height: 24, backgroundColor: '#DB4437', borderRadius: '50%' }} />}
            {currentTemplate.pinterest && <Box sx={{ width: 24, height: 24, backgroundColor: '#BD081C', borderRadius: '50%' }} />}
            {currentTemplate.instagram && <Box sx={{ width: 24, height: 24, backgroundColor: '#E4405F', borderRadius: '50%' }} />}
            {currentTemplate.facebook && <Box sx={{ width: 24, height: 24, backgroundColor: '#4267B2', borderRadius: '50%' }} />}
          </Box>
          
          {/* Copyright */}
          <Typography variant="body2" color="text.secondary" sx={{ fontSize: 11 }}>
            {currentTemplate.copyright}
          </Typography>
        </Box>
      </Paper>
    );
  };

  return (
    <Box sx={{ p: 3 }}>
      {/* Header */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4" sx={{ fontWeight: 600 }}>
          Vendor Mail Template
        </Typography>
        
       {/* Template Selector */}
               <FormControl size="small" sx={{ minWidth: 200 }}>
                 <InputLabel>vendor-mail-template</InputLabel>
                 <Select
                   value={selectedTemplate}
                   onChange={handleTemplateChange}
                   label="vendor-mail-template"
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
          {['registration', 'registration-approved', 'registration-denied', 'account-suspended', 'account-activation', 'forgot-password', 'order-recevied'].map((tab) => (
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
              <Card sx={{ backgroundColor: '#f8f9fa', border: '1px solid #e9ecef', mb: 3 }}>
                <CardContent sx={{ p: 3 }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Box>
                      <Typography variant="body1" sx={{ fontWeight: 500 }}>
                        Get Email On Registration?
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        Enable this to send email notifications when vendors register
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

              {/* Template Settings */}
              <Typography variant="h6" sx={{ fontWeight: 600, mb: 3 }}>
                Template Content Editor
              </Typography>
              {/* Instructions Link */}
              <Box sx={{ mt: 2, textAlign: 'right' }}>
                <Link href="#" underline="hover" sx={{ fontSize: 14 }}>
                  Read instructions
                </Link>
              </Box>

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
                      id="vendor-logo-upload"
                    />
                    <label htmlFor="vendor-logo-upload" style={{ cursor: 'pointer' }}>
                      <UploadIcon sx={{ color: '#ccc', fontSize: 20 }} />
                    </label>
                  </Box>
                  <Typography variant="body2" color="text.secondary">
                    {templateData[activeTab]?.logo ? templateData[activeTab].logo.name : 'No logo uploaded'}
                  </Typography>
                </Box>
              </Box>

              {/* Title */}
              <TextField
                fullWidth
                label="Title (EN)"
                value={templateData[activeTab]?.title || ''}
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
                value={(templateData[activeTab]?.mailBody || '').replace(/<[^>]*>/g, '')}
                onChange={(e) => setTemplateData(prev => ({
                  ...prev,
                  [activeTab]: {
                    ...prev[activeTab],
                    mailBody: e.target.value
                  }
                }))}
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

              {/* Section Text */}
              <TextField
                fullWidth
                label="Section Text (EN)"
                value={templateData[activeTab]?.sectionText || ''}
                onChange={handleContentChange('sectionText')}
                sx={{ mb: 3 }}
              />

              {/* Page Links */}
              <Typography variant="body2" sx={{ fontWeight: 500, mb: 2 }}>
                Page Links
              </Typography>
              <Box sx={{ display: 'flex', flexDirection: 'row', gap: 1, mb: 3 }}>
                <FormControlLabel
                  control={<Checkbox checked={templateData[activeTab]?.privacyPolicy || false} onChange={handleContentChange('privacyPolicy')} />}
                  label="Privacy Policy"
                />
                <FormControlLabel
                  control={<Checkbox checked={templateData[activeTab]?.refundPolicy || false} onChange={handleContentChange('refundPolicy')} />}
                  label="Refund Policy"
                />
                <FormControlLabel
                  control={<Checkbox checked={templateData[activeTab]?.cancellationPolicy || false} onChange={handleContentChange('cancellationPolicy')} />}
                  label="Cancellation Policy"
                />
                <FormControlLabel
                  control={<Checkbox checked={templateData[activeTab]?.contactUs || false} onChange={handleContentChange('contactUs')} />}
                  label="Contact Us"
                />
              </Box>

              {/* Social Media Links */}
              <Typography variant="body2" sx={{ fontWeight: 500, mb: 2 }}>
                Social Media Links
              </Typography>
              <Box sx={{ display: 'flex', flexDirection: 'row', gap: 1, mb: 3 }}>
                <FormControlLabel
                  control={<Checkbox checked={templateData[activeTab]?.twitter || false} onChange={handleContentChange('twitter')} />}
                  label="Twitter"
                />
                <FormControlLabel
                  control={<Checkbox checked={templateData[activeTab]?.linkedin || false} onChange={handleContentChange('linkedin')} />}
                  label="LinkedIn"
                />
                <FormControlLabel
                  control={<Checkbox checked={templateData[activeTab]?.googlePlus || false} onChange={handleContentChange('googlePlus')} />}
                  label="Google-Plus"
                />
                <FormControlLabel
                  control={<Checkbox checked={templateData[activeTab]?.pinterest || false} onChange={handleContentChange('pinterest')} />}
                  label="Pinterest"
                />
                <FormControlLabel
                  control={<Checkbox checked={templateData[activeTab]?.instagram || false} onChange={handleContentChange('instagram')} />}
                  label="Instagram"
                />
                <FormControlLabel
                  control={<Checkbox checked={templateData[activeTab]?.facebook || false} onChange={handleContentChange('facebook')} />}
                  label="Facebook"
                />
              </Box>

              {/* Copyright */}
              <TextField
                fullWidth
                label="Copyright Content (EN)"
                value={templateData[activeTab]?.copyright || ''}
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
