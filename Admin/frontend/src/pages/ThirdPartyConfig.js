import React, { useState } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  TextField,
  Button,
  Switch,
  FormControlLabel,
  Tabs,
  Tab,
  Grid,
  IconButton,
  Tooltip,
  Alert,
  Snackbar,
  Divider,
  CircularProgress,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Select,
  MenuItem,
  FormControl,
  InputLabel
} from '@mui/material';
import {
  WhatsApp as WhatsAppIcon,
  Email as EmailIcon,
  Sms as SmsIcon,
  PhoneAndroid as PhoneIcon,
  Info as InfoIcon,
  Refresh as RefreshIcon,
  Save as SaveIcon,
  Apple as AppleIcon,
  Language as LanguageIcon,
  FileUpload as FileUploadIcon,
  ContentCopy as ContentCopyIcon,
  OpenInNew as OpenInNewIcon,
  Visibility as VisibilityIcon,
  VisibilityOff as VisibilityOffIcon,
  Send as SendIcon,
  LocalShipping as LocalShippingIcon,
  Security as SecurityIcon,
  Map as MapIcon,
  Storage as StorageIcon
} from '@mui/icons-material';

function ThirdPartyConfig() {
  const [activeTab, setActiveTab] = useState(0);
  const [mailConfigTab, setMailConfigTab] = useState(0);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });

  // WhatsApp State
  const [whatsappEnabled, setWhatsappEnabled] = useState(true);
  const [whatsappNumber, setWhatsappNumber] = useState('918879619545');
  const [whatsappNumberError, setWhatsappNumberError] = useState('');

  // Social Media Login State
  const [socialLoginEnabled, setSocialLoginEnabled] = useState(false);
  const [googleClientId, setGoogleClientId] = useState('');
  const [facebookAppId, setFacebookAppId] = useState('');

  // Apple Login State
  const [appleClientId, setAppleClientId] = useState('com.mab.ritufaluser');
  const [appleTeamId, setAppleTeamId] = useState('');
  const [appleKeyId, setAppleKeyId] = useState('');
  const [appleKeyFile, setAppleKeyFile] = useState(null);

  // Google Login State
  const [googleCallbackUri, setGoogleCallbackUri] = useState('https://www.apnadecoration.com/auth/google/callback');
  const [googleClientSecret, setGoogleClientSecret] = useState('');

  // Facebook Login State
  const [facebookCallbackUri, setFacebookCallbackUri] = useState('https://www.apnadecoration.com/auth/facebook/callback');
  const [facebookClientSecret, setFacebookClientSecret] = useState('');

  // Mail Config State
  const [mailEnabled, setMailEnabled] = useState(false);
  const [smtpEnabled, setSmtpEnabled] = useState(true);
  const [sendgridEnabled, setSendgridEnabled] = useState(false);

  // SMTP Mail Config State
  const [smtpMailerName, setSmtpMailerName] = useState('demo');
  const [smtpHost, setSmtpHost] = useState('mail.apnadecoration.com');
  const [smtpPort, setSmtpPort] = useState('465');
  const [smtpEmailId, setSmtpEmailId] = useState('inquery@apnadecoration.com');
  const [smtpPassword, setSmtpPassword] = useState('');
  const [smtpDriver, setSmtpDriver] = useState('SMTP');
  const [smtpUsername, setSmtpUsername] = useState('inquery@apnadecoration.com');
  const [smtpEncryption, setSmtpEncryption] = useState('TLS');
  const [showSmtpPassword, setShowSmtpPassword] = useState(false);

  // SendGrid Mail Config State
  const [sendgridHost, setSendgridHost] = useState('');
  const [sendgridPort, setSendgridPort] = useState('587');
  const [sendgridApiKey, setSendgridApiKey] = useState('');
  const [sendgridEmail, setSendgridEmail] = useState('');
  const [sendgridFromName, setSendgridFromName] = useState('');
  const [showSendgridApiKey, setShowSendgridApiKey] = useState(false);

  // Send Test Mail State
  const [testEmail, setTestEmail] = useState('');
  const [testSubject, setTestSubject] = useState('Test Email from APNADECORATION');
  const [testMessage, setTestMessage] = useState('This is a test email to verify your mail configuration is working correctly.');
  const [isSendingTestMail, setIsSendingTestMail] = useState(false);

  // SMS Config State
  const [smsEnabled, setSmsEnabled] = useState(false);
  const [smsProvider, setSmsProvider] = useState('twilio');

  // Twilio SMS State
  const [twilioSid, setTwilioSid] = useState('');
  const [twilioMessagingServiceSid, setTwilioMessagingServiceSid] = useState('');
  const [twilioToken, setTwilioToken] = useState('');
  const [twilioFrom, setTwilioFrom] = useState('');
  const [twilioOtpTemplate, setTwilioOtpTemplate] = useState('');

  // Nexmo SMS State
  const [nexmoApiKey, setNexmoApiKey] = useState('');
  const [nexmoApiSecret, setNexmoApiSecret] = useState('');
  const [nexmoToken, setNexmoToken] = useState('');
  const [nexmoFrom, setNexmoFrom] = useState('');
  const [nexmoOtpTemplate, setNexmoOtpTemplate] = useState('');

  // 2Factor SMS State
  const [twoFactorApiKey, setTwoFactorApiKey] = useState('');

  // MSG91 SMS State
  const [msg91TemplateId, setMsg91TemplateId] = useState('');
  const [msg91AuthKey, setMsg91AuthKey] = useState('');

  // ALPHANET SMS State
  const [alphaneApiKey, setAlphaneApiKey] = useState('');
  const [alphaneOtpTemplate, setAlphaneOtpTemplate] = useState('');

  // RELEANS SMS State
  const [releansApiKey, setReleansApiKey] = useState('');
  const [releansFrom, setReleansFrom] = useState('');
  const [releansOtpTemplate, setReleansOtpTemplate] = useState('');

  // Shiprocket Config State
  const [shiprocketEnabled, setShiprocketEnabled] = useState(false);
  const [shiprocketEmail, setShiprocketEmail] = useState('support@ritufai.com');
  const [shiprocketPassword, setShiprocketPassword] = useState('');
  const [shiprocketPhone, setShiprocketPhone] = useState('');
  const [shiprocketCompanyName, setShiprocketCompanyName] = useState('DMK Bazaar');
  const [shiprocketCompanyId, setShiprocketCompanyId] = useState('5439024');
  const [shiprocketChannelId, setShiprocketChannelId] = useState('');
  const [shiprocketPickupLocation, setShiprocketPickupLocation] = useState('');
  const [showShiprocketPassword, setShowShiprocketPassword] = useState(false);

  // reCAPTCHA Config State
  const [recaptchaEnabled, setRecaptchaEnabled] = useState(false);
  const [recaptchaSiteKey, setRecaptchaSiteKey] = useState('');
  const [recaptchaSecretKey, setRecaptchaSecretKey] = useState('');
  const [showRecaptchaConfirmDialog, setShowRecaptchaConfirmDialog] = useState(false);
  const [pendingRecaptchaState, setPendingRecaptchaState] = useState(false);

  // Google Map APIs Config State
  const [googleMapEnabled, setGoogleMapEnabled] = useState(false);
  const [googleMapClientKey, setGoogleMapClientKey] = useState('AIzaSyBeIR-4Maq90BHCA0HDq8GnoFFRia-eM1I');
  const [googleMapServerKey, setGoogleMapServerKey] = useState('AIzaSyBeIR-4Maq90BHCA0HDq8GnoFFRia-eM1I');

  // Storage Connection Config State
  const [storageEnabled, setStorageEnabled] = useState(false);
  const [localStorageEnabled, setLocalStorageEnabled] = useState(false);
  const [thirdPartyStorageEnabled, setThirdPartyStorageEnabled] = useState(false);
  const [storageType, setStorageType] = useState('local');
  const [s3AccessKey, setS3AccessKey] = useState('');
  const [s3SecretKey, setS3SecretKey] = useState('');
  const [s3Region, setS3Region] = useState('');
  const [s3Bucket, setS3Bucket] = useState('');
  const [s3Url, setS3Url] = useState('');
  const [s3Endpoint, setS3Endpoint] = useState('');
  const [showS3SecretKey, setShowS3SecretKey] = useState(false);

  // Firebase Auth Config State
  const [firebaseAuthEnabled, setFirebaseAuthEnabled] = useState(false);
  const [firebaseAuthVerificationStatus, setFirebaseAuthVerificationStatus] = useState(false);
  const [firebaseWebApiKey, setFirebaseWebApiKey] = useState('');
  const [showFirebaseAuthConfirmDialog, setShowFirebaseAuthConfirmDialog] = useState(false);
  const [pendingFirebaseAuthState, setPendingFirebaseAuthState] = useState(false);
  const [showFirebaseConfigAlert, setShowFirebaseConfigAlert] = useState(false);

  // Firebase Configuration State
  const [firebaseConfigEnabled, setFirebaseConfigEnabled] = useState(false);
  const [firebaseProjectId, setFirebaseProjectId] = useState('');
  const [firebaseStorageBucket, setFirebaseStorageBucket] = useState('');

  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue);
  };

  const handleSave = (section) => {
    setSnackbar({
      open: true,
      message: `${section} settings saved successfully!`,
      severity: 'success'
    });
  };

  const handleReset = (section) => {
    setSnackbar({
      open: true,
      message: `${section} settings reset to default`,
      severity: 'info'
    });
  };

  const handleSnackbarClose = () => {
    setSnackbar({ ...snackbar, open: false });
  };

  const handleCopyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    setSnackbar({
      open: true,
      message: 'Copied to clipboard!',
      severity: 'success'
    });
  };

  const handleFileUpload = (event) => {
    const file = event.target.files[0];
    if (file) {
      setAppleKeyFile(file);
    }
  };

  const handleSendTestMail = async () => {
    if (!testEmail) {
      setSnackbar({
        open: true,
        message: 'Please enter a test email address',
        severity: 'error'
      });
      return;
    }

    setIsSendingTestMail(true);
    
    try {
      // Simulate API call to send test email
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      setSnackbar({
        open: true,
        message: `Test email sent successfully to ${testEmail}`,
        severity: 'success'
      });
    } catch (error) {
      setSnackbar({
        open: true,
        message: 'Failed to send test email. Please check your configuration.',
        severity: 'error'
      });
    } finally {
      setIsSendingTestMail(false);
    }
  };

  const handleRecaptchaToggle = (newValue) => {
    setPendingRecaptchaState(newValue);
    setShowRecaptchaConfirmDialog(true);
  };

  const confirmRecaptchaToggle = () => {
    setRecaptchaEnabled(pendingRecaptchaState);
    setShowRecaptchaConfirmDialog(false);
    setPendingRecaptchaState(false);
    
    setSnackbar({
      open: true,
      message: `reCAPTCHA ${pendingRecaptchaState ? 'enabled' : 'disabled'} successfully!`,
      severity: 'success'
    });
  };

  const cancelRecaptchaToggle = () => {
    setShowRecaptchaConfirmDialog(false);
    setPendingRecaptchaState(false);
  };

  const handleLocalStorageToggle = (newValue) => {
    if (newValue) {
      // Turning ON Local system, turn OFF 3rd Party Storage
      setLocalStorageEnabled(true);
      setThirdPartyStorageEnabled(false);
    } else {
      // Turning OFF Local system, turn ON 3rd Party Storage
      setLocalStorageEnabled(false);
      setThirdPartyStorageEnabled(true);
    }
  };

  const handleThirdPartyStorageToggle = (newValue) => {
    if (newValue) {
      // Turning ON 3rd Party Storage, turn OFF Local system
      setThirdPartyStorageEnabled(true);
      setLocalStorageEnabled(false);
    } else {
      // Turning OFF 3rd Party Storage, turn ON Local system
      setThirdPartyStorageEnabled(false);
      setLocalStorageEnabled(true);
    }
  };

  const handleFirebaseAuthVerificationToggle = (newValue) => {
    if (newValue) {
      // Only allow enabling - show configuration setup alert first
      setShowFirebaseConfigAlert(true);
    }
    // Don't allow disabling - do nothing
  };

  const confirmFirebaseAuthVerificationToggle = () => {
    setFirebaseAuthVerificationStatus(true);
    setShowFirebaseAuthConfirmDialog(false);
    setPendingFirebaseAuthState(false);
    
    setSnackbar({
      open: true,
      message: 'Firebase Auth Verification enabled successfully!',
      severity: 'success'
    });
  };

  const cancelFirebaseAuthVerificationToggle = () => {
    setShowFirebaseAuthConfirmDialog(false);
    setPendingFirebaseAuthState(false);
  };

  const handleGoToFirebaseConfig = () => {
    // Navigate to Firebase Auth tab (tab index 8) since Firebase Configuration tab is removed
    setActiveTab(8);
    setShowFirebaseConfigAlert(false);
  };

  const validateWhatsappNumber = (number) => {
    const phoneRegex = /^\d{10,15}$/;
    return phoneRegex.test(number.replace(/\D/g, ''));
  };

  const handleWhatsappNumberChange = (e) => {
    const value = e.target.value;
    setWhatsappNumber(value);
    
    if (value && !validateWhatsappNumber(value)) {
      setWhatsappNumberError('Please enter a valid phone number');
    } else {
      setWhatsappNumberError('');
    }
  };

  const renderSocialMediaChat = () => (
    <Card sx={{ mb: 3 }}>
      <CardContent sx={{ p: 3 }}>
        <Box display="flex" alignItems="center" mb={3}>
          <WhatsAppIcon sx={{ mr: 2, color: '#25D366', fontSize: 28 }} />
          <Typography variant="h5" sx={{ fontWeight: 600 }}>
            WhatsApp Integration
          </Typography>
          <Box sx={{ ml: 'auto' }}>
            <FormControlLabel
              control={
                <Switch
                  checked={whatsappEnabled}
                  onChange={(e) => setWhatsappEnabled(e.target.checked)}
                  color="primary"
                />
              }
              label="Enable WhatsApp"
            />
          </Box>
        </Box>

        <Grid container spacing={3}>
          <Grid item xs={12} md={8}>
            <TextField
              fullWidth
              label="WhatsApp Number"
              value={whatsappNumber}
              onChange={handleWhatsappNumberChange}
              error={!!whatsappNumberError}
              helperText={whatsappNumberError || 'Enter the WhatsApp business number customers will chat with'}
              InputProps={{
                startAdornment: (
                  <Box sx={{ mr: 1, display: 'flex', alignItems: 'center' }}>
                    <WhatsAppIcon sx={{ color: '#25D366', mr: 1 }} />
                    <Typography variant="body2" color="text.secondary">
                      +91
                    </Typography>
                  </Box>
                ),
                endAdornment: (
                  <Tooltip title="This number will be used for customer support chat">
                    <IconButton size="small">
                      <InfoIcon color="action" />
                    </IconButton>
                  </Tooltip>
                )
              }}
              disabled={!whatsappEnabled}
            />
          </Grid>
          <Grid item xs={12} md={4}>
            <Box sx={{ display: 'flex', gap: 2, height: '100%', alignItems: 'flex-end' }}>
              <Button
                variant="outlined"
                startIcon={<RefreshIcon />}
                onClick={() => handleReset('WhatsApp')}
                disabled={!whatsappEnabled}
                sx={{ flex: 1 }}
              >
                Reset
              </Button>
              <Button
                variant="contained"
                startIcon={<SaveIcon />}
                onClick={() => handleSave('WhatsApp')}
                disabled={!whatsappEnabled || !!whatsappNumberError}
                sx={{ flex: 1 }}
              >
                Save
              </Button>
            </Box>
          </Grid>
        </Grid>

        {whatsappEnabled && (
          <Alert severity="info" sx={{ mt: 3 }}>
            <Typography variant="body2">
              WhatsApp integration allows customers to initiate chat directly from your website. 
              Make sure the WhatsApp Business API is properly configured for this number.
            </Typography>
          </Alert>
        )}
      </CardContent>
    </Card>
  );

  const renderSocialMediaLogin = () => (
    <Box>
      {/* Apple Login Configuration */}
      <Card sx={{ mb: 3 }}>
        <CardContent sx={{ p: 3 }}>
          <Box display="flex" alignItems="center" justifyContent="space-between" mb={3}>
            <Box display="flex" alignItems="center">
              <AppleIcon sx={{ mr: 2, color: '#000000', fontSize: 28 }} />
              <Typography variant="h5" sx={{ fontWeight: 600 }}>
                Apple Login
              </Typography>
            </Box>
            <Button
              variant="text"
              startIcon={<OpenInNewIcon />}
              size="small"
              onClick={() => window.open('https://developer.apple.com/documentation/sign_in_with_apple', '_blank')}
            >
              Credential Setup
            </Button>
          </Box>

          <Grid container spacing={3}>
            <Grid item xs={12} md={4}>
              <TextField
                fullWidth
                label="Client Id"
                value={appleClientId}
                onChange={(e) => setAppleClientId(e.target.value)}
                helperText="Bundle ID (e.g., com.mab.ritufaluser)"
                InputProps={{
                  endAdornment: (
                    <Tooltip title="Enter your Apple Bundle ID">
                      <IconButton size="small">
                        <InfoIcon color="action" />
                      </IconButton>
                    </Tooltip>
                  )
                }}
              />
            </Grid>
            <Grid item xs={12} md={4}>
              <TextField
                fullWidth
                label="Team Id"
                value={appleTeamId}
                onChange={(e) => setAppleTeamId(e.target.value)}
                helperText="Your Apple Developer Team ID"
                InputProps={{
                  endAdornment: (
                    <Tooltip title="Find this in Apple Developer Portal">
                      <IconButton size="small">
                        <InfoIcon color="action" />
                      </IconButton>
                    </Tooltip>
                  )
                }}
              />
            </Grid>
            <Grid item xs={12} md={4}>
              <TextField
                fullWidth
                label="Key Id"
                value={appleKeyId}
                onChange={(e) => setAppleKeyId(e.target.value)}
                helperText="Private Key ID from Apple Developer"
                InputProps={{
                  endAdornment: (
                    <Tooltip title="Key ID for your private key">
                      <IconButton size="small">
                        <InfoIcon color="action" />
                      </IconButton>
                    </Tooltip>
                  )
                }}
              />
            </Grid>
            <Grid item xs={12}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <Button
                  variant="outlined"
                  component="label"
                  startIcon={<FileUploadIcon />}
                >
                  Choose Updated File
                  <input
                    type="file"
                    hidden
                    accept=".p8"
                    onChange={handleFileUpload}
                  />
                </Button>
                {appleKeyFile && (
                  <Typography variant="body2" color="text.secondary">
                    Selected: {appleKeyFile.name}
                  </Typography>
                )}
              </Box>
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      {/* Google Login Configuration */}
      <Card sx={{ mb: 3 }}>
        <CardContent sx={{ p: 3 }}>
          <Box display="flex" alignItems="center" justifyContent="space-between" mb={3}>
            <Box display="flex" alignItems="center">
              <LanguageIcon sx={{ mr: 2, color: '#4285F4', fontSize: 28 }} />
              <Typography variant="h5" sx={{ fontWeight: 600 }}>
                Google Login
              </Typography>
            </Box>
            <Button
              variant="text"
              startIcon={<OpenInNewIcon />}
              size="small"
              onClick={() => window.open('https://console.developers.google.com/', '_blank')}
            >
              Credential Setup
            </Button>
          </Box>

          <Grid container spacing={3}>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Callback URI"
                value={googleCallbackUri}
                onChange={(e) => setGoogleCallbackUri(e.target.value)}
                helperText="Google will redirect to this URL after authentication"
                InputProps={{
                  endAdornment: (
                    <Tooltip title="Copy this URL to Google Developer Console">
                      <IconButton 
                        size="small" 
                        onClick={() => handleCopyToClipboard(googleCallbackUri)}
                      >
                        <ContentCopyIcon />
                      </IconButton>
                    </Tooltip>
                  )
                }}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Store Client ID"
                value={googleClientId}
                onChange={(e) => setGoogleClientId(e.target.value)}
                helperText="Ex Client ID"
                placeholder="Ex Client ID"
                InputProps={{
                  endAdornment: (
                    <Tooltip title="Google OAuth 2.0 Client ID">
                      <IconButton size="small">
                        <InfoIcon color="action" />
                      </IconButton>
                    </Tooltip>
                  )
                }}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Store Client Secret Key"
                value={googleClientSecret}
                onChange={(e) => setGoogleClientSecret(e.target.value)}
                type="password"
                helperText="Google OAuth 2.0 Client Secret"
                InputProps={{
                  endAdornment: (
                    <Tooltip title="Keep this secret and secure">
                      <IconButton size="small">
                        <InfoIcon color="action" />
                      </IconButton>
                    </Tooltip>
                  )
                }}
              />
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      {/* Facebook Login Configuration */}
      <Card sx={{ mb: 3 }}>
        <CardContent sx={{ p: 3 }}>
          <Box display="flex" alignItems="center" justifyContent="space-between" mb={3}>
            <Box display="flex" alignItems="center">
              <LanguageIcon sx={{ mr: 2, color: '#1877F2', fontSize: 28 }} />
              <Typography variant="h5" sx={{ fontWeight: 600 }}>
                Facebook Login
              </Typography>
            </Box>
            <Button
              variant="text"
              startIcon={<OpenInNewIcon />}
              size="small"
              onClick={() => window.open('https://developers.facebook.com/', '_blank')}
            >
              Credential Setup
            </Button>
          </Box>

          <Grid container spacing={3}>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Callback URI"
                value={facebookCallbackUri}
                onChange={(e) => setFacebookCallbackUri(e.target.value)}
                helperText="Facebook will redirect to this URL after authentication"
                InputProps={{
                  endAdornment: (
                    <Tooltip title="Copy this URL to Facebook Developer Portal">
                      <IconButton 
                        size="small" 
                        onClick={() => handleCopyToClipboard(facebookCallbackUri)}
                      >
                        <ContentCopyIcon />
                      </IconButton>
                    </Tooltip>
                  )
                }}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Store Client ID"
                value={facebookAppId}
                onChange={(e) => setFacebookAppId(e.target.value)}
                helperText="Facebook App ID"
                InputProps={{
                  endAdornment: (
                    <Tooltip title="Facebook App ID from Developer Portal">
                      <IconButton size="small">
                        <InfoIcon color="action" />
                      </IconButton>
                    </Tooltip>
                  )
                }}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Store Client Secret Key"
                value={facebookClientSecret}
                onChange={(e) => setFacebookClientSecret(e.target.value)}
                type="password"
                helperText="Facebook App Secret"
                InputProps={{
                  endAdornment: (
                    <Tooltip title="Keep this secret and secure">
                      <IconButton size="small">
                        <InfoIcon color="action" />
                      </IconButton>
                    </Tooltip>
                  )
                }}
              />
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      {/* Common Action Buttons */}
      <Box sx={{ display: 'flex', gap: 2, justifyContent: 'flex-end', mt: 3 }}>
        <Button
          variant="outlined"
          startIcon={<RefreshIcon />}
          onClick={() => handleReset('Social Login')}
        >
          Reset
        </Button>
        <Button
          variant="contained"
          startIcon={<SaveIcon />}
          onClick={() => handleSave('Social Login')}
        >
          Save
        </Button>
      </Box>
    </Box>
  );

  const renderMailConfig = () => (
    <Box>
      {/* Mail Configuration Header */}
      <Box display="flex" alignItems="center" justifyContent="space-between" mb={3}>
        <Box display="flex" alignItems="center">
          <EmailIcon sx={{ mr: 2, color: '#EA4335', fontSize: 28 }} />
          <Typography variant="h5" sx={{ fontWeight: 600 }}>
            Mail Configuration
          </Typography>
        </Box>
        <Box display="flex" alignItems="center" gap={2}>
          <Button
            variant="text"
            startIcon={<OpenInNewIcon />}
            size="small"
            onClick={() => window.open('https://docs.google.com/document/d/mail-setup-guide', '_blank')}
          >
            How it Works
          </Button>
        </Box>
      </Box>

      {/* Mail Configuration Sub-Tabs */}
      <Card sx={{ mb: 3 }}>
        <CardContent sx={{ p: 0 }}>
          <Tabs
            value={mailConfigTab}
            onChange={(event, newValue) => setMailConfigTab(newValue)}
            sx={{ 
              borderBottom: 1, 
              borderColor: 'divider',
              '& .MuiTab-root': {
                textTransform: 'none',
                fontWeight: 500,
                minWidth: 120
              }
            }}
          >
            <Tab 
              icon={<EmailIcon />} 
              label="Mail Configuration" 
              iconPosition="start" 
            />
            <Tab 
              icon={<SendIcon />} 
              label="Send Test Mail" 
              iconPosition="start" 
            />
          </Tabs>
        </CardContent>
      </Card>

      {/* Tab Content */}
      {mailConfigTab === 0 && (
        <Box>
          {/* SMTP Mail Configuration */}
          <Card sx={{ mb: 3 }}>
            <CardContent sx={{ p: 3 }}>
              <Box display="flex" alignItems="center" justifyContent="space-between" mb={3}>
                <Typography variant="h6" sx={{ fontWeight: 600 }}>
                  SMTP Mail Config
                </Typography>
                <FormControlLabel
                  control={
                    <Switch
                      checked={smtpEnabled}
                      onChange={(e) => setSmtpEnabled(e.target.checked)}
                      color="primary"
                    />
                  }
                  label="Enable SMTP"
                />
              </Box>

              <Grid container spacing={3}>
                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    label="Mailer Name"
                    value={smtpMailerName}
                    onChange={(e) => setSmtpMailerName(e.target.value)}
                    helperText="Name for email identification"
                    disabled={!mailEnabled || !smtpEnabled}
                    InputProps={{
                      endAdornment: (
                        <Tooltip title="This name appears in email headers">
                          <IconButton size="small">
                            <InfoIcon color="action" />
                          </IconButton>
                        </Tooltip>
                      )
                    }}
                  />
                </Grid>
                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    label="Driver"
                    value={smtpDriver}
                    onChange={(e) => setSmtpDriver(e.target.value)}
                    helperText="Mail driver protocol"
                    disabled={!mailEnabled || !smtpEnabled}
                    InputProps={{
                      endAdornment: (
                        <Tooltip title="Protocol type (SMTP, SENDMAIL, etc.)">
                          <IconButton size="small">
                            <InfoIcon color="action" />
                          </IconButton>
                        </Tooltip>
                      )
                    }}
                  />
                </Grid>
                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    label="Host"
                    value={smtpHost}
                    onChange={(e) => setSmtpHost(e.target.value)}
                    helperText="SMTP server address"
                    placeholder="e.g., mail.printformee.com"
                    disabled={!mailEnabled || !smtpEnabled}
                    InputProps={{
                      endAdornment: (
                        <Tooltip title="Your SMTP server hostname">
                          <IconButton size="small">
                            <InfoIcon color="action" />
                          </IconButton>
                        </Tooltip>
                      )
                    }}
                  />
                </Grid>
                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    label="Port"
                    value={smtpPort}
                    onChange={(e) => setSmtpPort(e.target.value)}
                    helperText="SMTP server port"
                    placeholder="e.g., 465"
                    disabled={!mailEnabled || !smtpEnabled}
                    InputProps={{
                      endAdornment: (
                        <Tooltip title="Common ports: 25, 465, 587">
                          <IconButton size="small">
                            <InfoIcon color="action" />
                          </IconButton>
                        </Tooltip>
                      )
                    }}
                  />
                </Grid>
                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    label="Username"
                    value={smtpUsername}
                    onChange={(e) => setSmtpUsername(e.target.value)}
                    helperText="SMTP login username"
                    disabled={!mailEnabled || !smtpEnabled}
                    InputProps={{
                      endAdornment: (
                        <Tooltip title="SMTP authentication username">
                          <IconButton size="small">
                            <InfoIcon color="action" />
                          </IconButton>
                        </Tooltip>
                      )
                    }}
                  />
                </Grid>
                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    label="Email ID"
                    value={smtpEmailId}
                    onChange={(e) => setSmtpEmailId(e.target.value)}
                    helperText="Sender email address"
                    placeholder="e.g., inquery@printformee.com"
                    disabled={!mailEnabled || !smtpEnabled}
                    InputProps={{
                      endAdornment: (
                        <Tooltip title="Email that appears as sender">
                          <IconButton size="small">
                            <InfoIcon color="action" />
                          </IconButton>
                        </Tooltip>
                      )
                    }}
                  />
                </Grid>
                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    label="Password"
                    type={showSmtpPassword ? "text" : "password"}
                    value={smtpPassword}
                    onChange={(e) => setSmtpPassword(e.target.value)}
                    helperText="SMTP account password"
                    disabled={!mailEnabled || !smtpEnabled}
                    InputProps={{
                      endAdornment: (
                        <Box sx={{ display: 'flex', alignItems: 'center' }}>
                          <Tooltip title="Toggle password visibility">
                            <IconButton 
                              size="small" 
                              onClick={() => setShowSmtpPassword(!showSmtpPassword)}
                              disabled={!mailEnabled || !smtpEnabled}
                            >
                              {showSmtpPassword ? <VisibilityOffIcon /> : <VisibilityIcon />}
                            </IconButton>
                          </Tooltip>
                          <Tooltip title="SMTP account password">
                            <IconButton size="small">
                              <InfoIcon color="action" />
                            </IconButton>
                          </Tooltip>
                        </Box>
                      )
                    }}
                  />
                </Grid>
                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    select
                    label="Encryption"
                    value={smtpEncryption}
                    onChange={(e) => setSmtpEncryption(e.target.value)}
                    helperText="Email encryption protocol"
                    disabled={!mailEnabled || !smtpEnabled}
                    SelectProps={{ native: true }}
                    InputProps={{
                      endAdornment: (
                        <Tooltip title="Security protocol for email transmission">
                          <IconButton size="small">
                            <InfoIcon color="action" />
                          </IconButton>
                        </Tooltip>
                      )
                    }}
                  >
                    <option value="TLS">TLS</option>
                    <option value="SSL">SSL</option>
                    <option value="STARTTLS">STARTTLS</option>
                    <option value="none">None</option>
                  </TextField>
                </Grid>
              </Grid>
            </CardContent>
          </Card>

          {/* SendGrid Mail Configuration */}
          <Card sx={{ mb: 3 }}>
            <CardContent sx={{ p: 3 }}>
              <Box display="flex" alignItems="center" justifyContent="space-between" mb={3}>
                <Typography variant="h6" sx={{ fontWeight: 600 }}>
                  SendGrid Mail Config
                </Typography>
                <FormControlLabel
                  control={
                    <Switch
                      checked={sendgridEnabled}
                      onChange={(e) => setSendgridEnabled(e.target.checked)}
                      color="primary"
                    />
                  }
                  label="Enable SendGrid"
                />
              </Box>

              <Grid container spacing={3}>
                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    label="Host"
                    value={sendgridHost}
                    onChange={(e) => setSendgridHost(e.target.value)}
                    helperText="SendGrid server host"
                    placeholder="e.g., smtp.sendgrid.net"
                    disabled={!mailEnabled || !sendgridEnabled}
                    InputProps={{
                      endAdornment: (
                        <Tooltip title="SendGrid SMTP server">
                          <IconButton size="small">
                            <InfoIcon color="action" />
                          </IconButton>
                        </Tooltip>
                      )
                    }}
                  />
                </Grid>
                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    label="Port"
                    value={sendgridPort}
                    onChange={(e) => setSendgridPort(e.target.value)}
                    helperText="SendGrid server port"
                    placeholder="e.g., 587"
                    disabled={!mailEnabled || !sendgridEnabled}
                    InputProps={{
                      endAdornment: (
                        <Tooltip title="SendGrid SMTP port">
                          <IconButton size="small">
                            <InfoIcon color="action" />
                          </IconButton>
                        </Tooltip>
                      )
                    }}
                  />
                </Grid>
                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    label="API Key"
                    type={showSendgridApiKey ? "text" : "password"}
                    value={sendgridApiKey}
                    onChange={(e) => setSendgridApiKey(e.target.value)}
                    helperText="SendGrid API key"
                    disabled={!mailEnabled || !sendgridEnabled}
                    InputProps={{
                      endAdornment: (
                        <Box sx={{ display: 'flex', alignItems: 'center' }}>
                          <Tooltip title="Toggle API key visibility">
                            <IconButton 
                              size="small" 
                              onClick={() => setShowSendgridApiKey(!showSendgridApiKey)}
                              disabled={!mailEnabled || !sendgridEnabled}
                            >
                              {showSendgridApiKey ? <VisibilityOffIcon /> : <VisibilityIcon />}
                            </IconButton>
                          </Tooltip>
                          <Tooltip title="Your SendGrid API key">
                            <IconButton size="small">
                              <InfoIcon color="action" />
                            </IconButton>
                          </Tooltip>
                        </Box>
                      )
                    }}
                  />
                </Grid>
                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    label="From Email"
                    value={sendgridEmail}
                    onChange={(e) => setSendgridEmail(e.target.value)}
                    helperText="Default sender email"
                    placeholder="e.g., noreply@printformee.com"
                    disabled={!mailEnabled || !sendgridEnabled}
                    InputProps={{
                      endAdornment: (
                        <Tooltip title="Default from email address">
                          <IconButton size="small">
                            <InfoIcon color="action" />
                          </IconButton>
                        </Tooltip>
                      )
                    }}
                  />
                </Grid>
                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    label="From Name"
                    value={sendgridFromName}
                    onChange={(e) => setSendgridFromName(e.target.value)}
                    helperText="Default sender name"
                    placeholder="e.g., PrintForMee"
                    disabled={!mailEnabled || !sendgridEnabled}
                    InputProps={{
                      endAdornment: (
                        <Tooltip title="Default from name for emails">
                          <IconButton size="small">
                            <InfoIcon color="action" />
                          </IconButton>
                        </Tooltip>
                      )
                    }}
                  />
                </Grid>
              </Grid>
            </CardContent>
          </Card>

          {/* Common Action Buttons */}
          <Box sx={{ display: 'flex', gap: 2, justifyContent: 'flex-end', mt: 3 }}>
            <Button
              variant="outlined"
              startIcon={<RefreshIcon />}
              onClick={() => handleReset('Mail')}
              disabled={!mailEnabled}
            >
              Reset
            </Button>
            <Button
              variant="contained"
              startIcon={<SaveIcon />}
              onClick={() => handleSave('Mail')}
              disabled={!mailEnabled}
            >
              Save
            </Button>
          </Box>
        </Box>
      )}

      {mailConfigTab === 1 && (
        <Card sx={{ mb: 3 }}>
          <CardContent sx={{ p: 3 }}>
            <Box display="flex" alignItems="center" justifyContent="space-between" mb={3}>
              <Box display="flex" alignItems="center">
                <SendIcon sx={{ mr: 2, color: '#4CAF50', fontSize: 28 }} />
                <Typography variant="h5" sx={{ fontWeight: 600 }}>
                  Send Test Mail
                </Typography>
              </Box>
              <Typography variant="body2" color="text.secondary">
                Verify your mail configuration
              </Typography>
            </Box>

            <Alert severity="info" sx={{ mb: 3 }}>
              <Typography variant="body2">
                Send a test email to verify that your mail configuration is working correctly. 
                Make sure you have configured either SMTP or SendGrid settings in the Mail Configuration tab.
              </Typography>
            </Alert>

            <Grid container spacing={3}>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Test Email Address"
                  value={testEmail}
                  onChange={(e) => setTestEmail(e.target.value)}
                  helperText="Enter an email address to send a test email"
                  placeholder="e.g., test@example.com"
                  disabled={!mailEnabled}
                  InputProps={{
                    startAdornment: (
                      <EmailIcon sx={{ mr: 1, color: 'action' }} />
                    )
                  }}
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Subject"
                  value={testSubject}
                  onChange={(e) => setTestSubject(e.target.value)}
                  helperText="Test email subject"
                  disabled={!mailEnabled}
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Message"
                  value={testMessage}
                  onChange={(e) => setTestMessage(e.target.value)}
                  helperText="Test email message content"
                  multiline
                  rows={4}
                  disabled={!mailEnabled}
                />
              </Grid>
            </Grid>

            <Box sx={{ display: 'flex', gap: 2, justifyContent: 'flex-end', mt: 3 }}>
              <Button
                variant="outlined"
                onClick={() => {
                  setTestEmail('');
                  setTestSubject('Test Email from PrintForMee');
                  setTestMessage('This is a test email to verify your mail configuration is working correctly.');
                }}
                disabled={!mailEnabled}
              >
                Clear
              </Button>
              <Button
                variant="contained"
                startIcon={isSendingTestMail ? <CircularProgress size={20} /> : <SendIcon />}
                onClick={handleSendTestMail}
                disabled={!mailEnabled || !testEmail || isSendingTestMail}
                sx={{ minWidth: 120 }}
              >
                {isSendingTestMail ? 'Sending...' : 'Send Test Mail'}
              </Button>
            </Box>
          </CardContent>
        </Card>
      )}
    </Box>
  );

  const renderSmsConfig = () => (
    <Box>
      {/* Warning Notice */}
      <Alert severity="warning" sx={{ mb: 3 }}>
        <Typography variant="body2" sx={{ fontWeight: 600 }}>
          NB: Please re-check if you have put all the data correctly or contact your SMS gateway provider for assistance.
        </Typography>
      </Alert>

      {/* SMS Provider Selection */}
      <Card sx={{ mb: 3 }}>
        <CardContent sx={{ p: 3 }}>
          <Typography variant="h6" sx={{ fontWeight: 600, mb: 2 }}>
            Select SMS Provider
          </Typography>
          <TextField
            fullWidth
            select
            label="SMS Provider"
            value={smsProvider}
            onChange={(e) => setSmsProvider(e.target.value)}
            SelectProps={{ native: true }}
          >
            <option value="twilio">Twilio</option>
            <option value="nexmo">Nexmo</option>
            <option value="twofactor">2Factor</option>
            <option value="msg91">MSG91</option>
            <option value="alphane">ALPHANET SMS</option>
            <option value="releans">RELEANS</option>
          </TextField>
        </CardContent>
      </Card>

      {/* Twilio Configuration */}
      {smsProvider === 'twilio' && (
        <Card sx={{ mb: 3 }}>
          <CardContent sx={{ p: 3 }}>
            <Box display="flex" alignItems="center" mb={3}>
              <Typography variant="h6" sx={{ fontWeight: 600 }}>
                twilio
              </Typography>
            </Box>
            <Grid container spacing={3}>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Sid"
                  value={twilioSid}
                  onChange={(e) => setTwilioSid(e.target.value)}
                  helperText="Your Twilio Account SID"
                  disabled={false}
                  InputProps={{
                    endAdornment: (
                      <Tooltip title="Find this in your Twilio Console">
                        <IconButton size="small">
                          <InfoIcon color="action" />
                        </IconButton>
                      </Tooltip>
                    )
                  }}
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Messaging Service Sid"
                  value={twilioMessagingServiceSid}
                  onChange={(e) => setTwilioMessagingServiceSid(e.target.value)}
                  helperText="Your Twilio Messaging Service SID"
                  disabled={false}
                  InputProps={{
                    endAdornment: (
                      <Tooltip title="Find this in your Twilio Console">
                        <IconButton size="small">
                          <InfoIcon color="action" />
                        </IconButton>
                      </Tooltip>
                    )
                  }}
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Token"
                  type="password"
                  value={twilioToken}
                  onChange={(e) => setTwilioToken(e.target.value)}
                  helperText="Your Twilio Auth Token"
                  disabled={false}
                  InputProps={{
                    endAdornment: (
                      <Tooltip title="Keep this token secure">
                        <IconButton size="small">
                          <InfoIcon color="action" />
                        </IconButton>
                      </Tooltip>
                    )
                  }}
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="From"
                  value={twilioFrom}
                  onChange={(e) => setTwilioFrom(e.target.value)}
                  helperText="Your Twilio phone number"
                  placeholder="+1234567890"
                  disabled={false}
                  InputProps={{
                    endAdornment: (
                      <Tooltip title="Must be a Twilio number or verified caller ID">
                        <IconButton size="small">
                          <InfoIcon color="action" />
                        </IconButton>
                      </Tooltip>
                    )
                  }}
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Otp Template"
                  value={twilioOtpTemplate}
                  onChange={(e) => setTwilioOtpTemplate(e.target.value)}
                  helperText="OTP message template"
                  placeholder="Your verification code is: {{code}}"
                  disabled={false}
                  InputProps={{
                    endAdornment: (
                      <Tooltip title="Use {{code}} as placeholder for OTP">
                        <IconButton size="small">
                          <InfoIcon color="action" />
                        </IconButton>
                      </Tooltip>
                    )
                  }}
                />
              </Grid>
            </Grid>
          </CardContent>
        </Card>
      )}

      {/* Nexmo Configuration */}
      {smsProvider === 'nexmo' && (
        <Card sx={{ mb: 3 }}>
          <CardContent sx={{ p: 3 }}>
            <Box display="flex" alignItems="center" mb={3}>
              <Typography variant="h6" sx={{ fontWeight: 600 }}>
                nexmo
              </Typography>
            </Box>
            <Grid container spacing={3}>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Api Key"
                  value={nexmoApiKey}
                  onChange={(e) => setNexmoApiKey(e.target.value)}
                  helperText="Your Nexmo API Key"
                  disabled={false}
                  InputProps={{
                    endAdornment: (
                      <Tooltip title="Find this in your Nexmo Dashboard">
                        <IconButton size="small">
                          <InfoIcon color="action" />
                        </IconButton>
                      </Tooltip>
                    )
                  }}
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Api Secret"
                  type="password"
                  value={nexmoApiSecret}
                  onChange={(e) => setNexmoApiSecret(e.target.value)}
                  helperText="Your Nexmo API Secret"
                  disabled={false}
                  InputProps={{
                    endAdornment: (
                      <Tooltip title="Keep this secret secure">
                        <IconButton size="small">
                          <InfoIcon color="action" />
                        </IconButton>
                      </Tooltip>
                    )
                  }}
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Token"
                  value={nexmoToken}
                  onChange={(e) => setNexmoToken(e.target.value)}
                  helperText="Your Nexmo Token"
                  disabled={false}
                  InputProps={{
                    endAdornment: (
                      <Tooltip title="Your Nexmo authentication token">
                        <IconButton size="small">
                          <InfoIcon color="action" />
                        </IconButton>
                      </Tooltip>
                    )
                  }}
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="From"
                  value={nexmoFrom}
                  onChange={(e) => setNexmoFrom(e.target.value)}
                  helperText="Your Nexmo virtual number"
                  placeholder="PrintForMee"
                  disabled={false}
                  InputProps={{
                    endAdornment: (
                      <Tooltip title="Alphanumeric sender ID or virtual number">
                        <IconButton size="small">
                          <InfoIcon color="action" />
                        </IconButton>
                      </Tooltip>
                    )
                  }}
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Otp Template"
                  value={nexmoOtpTemplate}
                  onChange={(e) => setNexmoOtpTemplate(e.target.value)}
                  helperText="OTP message template"
                  placeholder="Your verification code is: {{code}}"
                  disabled={false}
                  InputProps={{
                    endAdornment: (
                      <Tooltip title="Use {{code}} as placeholder for OTP">
                        <IconButton size="small">
                          <InfoIcon color="action" />
                        </IconButton>
                      </Tooltip>
                    )
                  }}
                />
              </Grid>
            </Grid>
          </CardContent>
        </Card>
      )}

      {/* 2Factor Configuration */}
      {smsProvider === 'twofactor' && (
        <Card sx={{ mb: 3 }}>
          <CardContent sx={{ p: 3 }}>
            <Box display="flex" alignItems="center" mb={3}>
              <Typography variant="h6" sx={{ fontWeight: 600 }}>
                2Factor
              </Typography>
            </Box>
            <Grid container spacing={3}>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Api Key"
                  value={twoFactorApiKey}
                  onChange={(e) => setTwoFactorApiKey(e.target.value)}
                  helperText="Your 2Factor API Key"
                  disabled={false}
                  InputProps={{
                    endAdornment: (
                      <Tooltip title="Get this from your 2Factor account">
                        <IconButton size="small">
                          <InfoIcon color="action" />
                        </IconButton>
                      </Tooltip>
                    )
                  }}
                />
              </Grid>
            </Grid>
          </CardContent>
        </Card>
      )}

      {/* MSG91 Configuration */}
      {smsProvider === 'msg91' && (
        <Card sx={{ mb: 3 }}>
          <CardContent sx={{ p: 3 }}>
            <Box display="flex" alignItems="center" mb={3}>
              <Typography variant="h6" sx={{ fontWeight: 600 }}>
                msg91
              </Typography>
            </Box>
            <Grid container spacing={3}>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Template Id"
                  value={msg91TemplateId}
                  onChange={(e) => setMsg91TemplateId(e.target.value)}
                  helperText="MSG91 DLT Template ID"
                  disabled={false}
                  InputProps={{
                    endAdornment: (
                      <Tooltip title="Required for DLT compliance in India">
                        <IconButton size="small">
                          <InfoIcon color="action" />
                        </IconButton>
                      </Tooltip>
                    )
                  }}
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Auth Key"
                  value={msg91AuthKey}
                  onChange={(e) => setMsg91AuthKey(e.target.value)}
                  helperText="Your MSG91 Auth Key"
                  disabled={false}
                  InputProps={{
                    endAdornment: (
                      <Tooltip title="Find this in MSG91 Panel">
                        <IconButton size="small">
                          <InfoIcon color="action" />
                        </IconButton>
                      </Tooltip>
                    )
                  }}
                />
              </Grid>
            </Grid>
          </CardContent>
        </Card>
      )}

      {/* ALPHANET SMS Configuration */}
      {smsProvider === 'alphane' && (
        <Card sx={{ mb: 3 }}>
          <CardContent sx={{ p: 3 }}>
            <Box display="flex" alignItems="center" mb={3}>
              <Typography variant="h6" sx={{ fontWeight: 600 }}>
                alphanet sms
              </Typography>
            </Box>
            <Grid container spacing={3}>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Api Key"
                  value={alphaneApiKey}
                  onChange={(e) => setAlphaneApiKey(e.target.value)}
                  helperText="Your ALPHANET API Key"
                  disabled={false}
                  InputProps={{
                    endAdornment: (
                      <Tooltip title="Get this from your ALPHANET account">
                        <IconButton size="small">
                          <InfoIcon color="action" />
                        </IconButton>
                      </Tooltip>
                    )
                  }}
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Otp Template"
                  value={alphaneOtpTemplate}
                  onChange={(e) => setAlphaneOtpTemplate(e.target.value)}
                  helperText="OTP message template"
                  placeholder="Your verification code is: {{code}}"
                  disabled={false}
                  InputProps={{
                    endAdornment: (
                      <Tooltip title="Use {{code}} as placeholder for OTP">
                        <IconButton size="small">
                          <InfoIcon color="action" />
                        </IconButton>
                      </Tooltip>
                    )
                  }}
                />
              </Grid>
            </Grid>
          </CardContent>
        </Card>
      )}

      {/* RELEANS SMS Configuration */}
      {smsProvider === 'releans' && (
        <Card sx={{ mb: 3 }}>
          <CardContent sx={{ p: 3 }}>
            <Box display="flex" alignItems="center" mb={3}>
              <Typography variant="h6" sx={{ fontWeight: 600 }}>
                releans
              </Typography>
            </Box>
            <Grid container spacing={3}>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Api Key"
                  value={releansApiKey}
                  onChange={(e) => setReleansApiKey(e.target.value)}
                  helperText="Your RELEANS API Key"
                  disabled={false}
                  InputProps={{
                    endAdornment: (
                      <Tooltip title="Get this from your RELEANS account">
                        <IconButton size="small">
                          <InfoIcon color="action" />
                        </IconButton>
                      </Tooltip>
                    )
                  }}
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="From"
                  value={releansFrom}
                  onChange={(e) => setReleansFrom(e.target.value)}
                  helperText="Your sender ID or phone number"
                  placeholder="RELEANS"
                  disabled={false}
                  InputProps={{
                    endAdornment: (
                      <Tooltip title="Your approved sender ID">
                        <IconButton size="small">
                          <InfoIcon color="action" />
                        </IconButton>
                      </Tooltip>
                    )
                  }}
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Otp Template"
                  value={releansOtpTemplate}
                  onChange={(e) => setReleansOtpTemplate(e.target.value)}
                  helperText="OTP message template"
                  placeholder="Your verification code is: {{code}}"
                  disabled={false}
                  InputProps={{
                    endAdornment: (
                      <Tooltip title="Use {{code}} as placeholder for OTP">
                        <IconButton size="small">
                          <InfoIcon color="action" />
                        </IconButton>
                      </Tooltip>
                    )
                  }}
                />
              </Grid>
            </Grid>
          </CardContent>
        </Card>
      )}

      {/* Common Action Buttons */}
      <Box sx={{ display: 'flex', gap: 2, justifyContent: 'flex-end', mt: 3 }}>
        <Button
          variant="outlined"
          startIcon={<RefreshIcon />}
          onClick={() => handleReset('SMS')}
          disabled={false}
        >
          Reset
        </Button>
        <Button
          variant="contained"
          startIcon={<SaveIcon />}
          onClick={() => handleSave('SMS')}
          disabled={false}
        >
          Save
        </Button>
      </Box>
    </Box>
  );

  const renderShiprocketConfig = () => (
    <Box>
      {/* Shiprocket Configuration Header */}
      <Box display="flex" alignItems="center" justifyContent="space-between" mb={3}>
        <Box display="flex" alignItems="center">
          <LocalShippingIcon sx={{ mr: 2, color: '#FF6B35', fontSize: 28 }} />
          <Typography variant="h5" sx={{ fontWeight: 600 }}>
            Shiprocket Configuration
          </Typography>
        </Box>
        <Box display="flex" alignItems="center" gap={2}>
          <Button
            variant="text"
            startIcon={<OpenInNewIcon />}
            size="small"
            onClick={() => window.open('https://docs.google.com/document/d/shiprocket-setup-guide', '_blank')}
          >
            How it Works
          </Button>
        </Box>
      </Box>

      {/* Shiprocket Configuration Card */}
      <Card sx={{ mb: 3 }}>
        <CardContent sx={{ p: 3 }}>
          <Box display="flex" alignItems="center" justifyContent="space-between" mb={3}>
            <Typography variant="h6" sx={{ fontWeight: 600 }}>
              Connect to Shiprocket Logistics Service
            </Typography>
            <FormControlLabel
              control={
                <Switch
                  checked={shiprocketEnabled}
                  onChange={(e) => setShiprocketEnabled(e.target.checked)}
                  color="primary"
                />
              }
              label="Enable Shiprocket"
            />
          </Box>

          <Grid container spacing={3}>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Email ID"
                type="email"
                value={shiprocketEmail}
                onChange={(e) => setShiprocketEmail(e.target.value)}
                helperText="Your Shiprocket account email"
                placeholder="support@ritufai.com"
                disabled={!shiprocketEnabled}
                InputProps={{
                  endAdornment: (
                    <Tooltip title="Email used for Shiprocket account registration">
                      <IconButton size="small">
                        <InfoIcon color="action" />
                      </IconButton>
                    </Tooltip>
                  )
                }}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Phone Number"
                value={shiprocketPhone}
                onChange={(e) => setShiprocketPhone(e.target.value)}
                helperText="Your registered phone number"
                placeholder="+919876543210"
                disabled={!shiprocketEnabled}
                InputProps={{
                  endAdornment: (
                    <Tooltip title="Phone number linked to your Shiprocket account">
                      <IconButton size="small">
                        <InfoIcon color="action" />
                      </IconButton>
                    </Tooltip>
                  )
                }}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Password"
                type={showShiprocketPassword ? "text" : "password"}
                value={shiprocketPassword}
                onChange={(e) => setShiprocketPassword(e.target.value)}
                helperText="Your Shiprocket account password"
                disabled={!shiprocketEnabled}
                InputProps={{
                  endAdornment: (
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                      <Tooltip title="Toggle password visibility">
                        <IconButton 
                          size="small" 
                          onClick={() => setShowShiprocketPassword(!showShiprocketPassword)}
                          disabled={!shiprocketEnabled}
                        >
                          {showShiprocketPassword ? <VisibilityOffIcon /> : <VisibilityIcon />}
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="Keep this password secure">
                        <IconButton size="small">
                          <InfoIcon color="action" />
                        </IconButton>
                      </Tooltip>
                    </Box>
                  )
                }}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Company Name"
                value={shiprocketCompanyName}
                onChange={(e) => setShiprocketCompanyName(e.target.value)}
                helperText="Your registered company name"
                placeholder="DMK Bazaar"
                disabled={!shiprocketEnabled}
                InputProps={{
                  endAdornment: (
                    <Tooltip title="Company name registered with Shiprocket">
                      <IconButton size="small">
                        <InfoIcon color="action" />
                      </IconButton>
                    </Tooltip>
                  )
                }}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Company Id"
                value={shiprocketCompanyId}
                onChange={(e) => setShiprocketCompanyId(e.target.value)}
                helperText="Your Shiprocket company ID"
                placeholder="5439024"
                disabled={!shiprocketEnabled}
                InputProps={{
                  endAdornment: (
                    <Tooltip title="Unique company identifier in Shiprocket">
                      <IconButton size="small">
                        <InfoIcon color="action" />
                      </IconButton>
                    </Tooltip>
                  )
                }}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Channel Id"
                value={shiprocketChannelId}
                onChange={(e) => setShiprocketChannelId(e.target.value)}
                helperText="Your sales channel ID"
                placeholder="e.g., AMAZON, FLIPKART"
                disabled={!shiprocketEnabled}
                InputProps={{
                  endAdornment: (
                    <Tooltip title="Channel identifier for order processing">
                      <IconButton size="small">
                        <InfoIcon color="action" />
                      </IconButton>
                    </Tooltip>
                  )
                }}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Pickup Location"
                value={shiprocketPickupLocation}
                onChange={(e) => setShiprocketPickupLocation(e.target.value)}
                helperText="Default pickup address for shipments"
                placeholder="123 Warehouse Street, City, State, PIN"
                multiline
                rows={2}
                disabled={!shiprocketEnabled}
                InputProps={{
                  endAdornment: (
                    <Tooltip title="Default pickup location for all shipments">
                      <IconButton size="small">
                        <InfoIcon color="action" />
                      </IconButton>
                    </Tooltip>
                  )
                }}
              />
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      {/* Action Buttons */}
      <Box sx={{ display: 'flex', gap: 2, justifyContent: 'flex-end', mt: 3 }}>
        <Button
          variant="outlined"
          startIcon={<RefreshIcon />}
          onClick={() => handleReset('Shiprocket')}
          disabled={!shiprocketEnabled}
        >
          Reset
        </Button>
        <Button
          variant="contained"
          startIcon={<SaveIcon />}
          onClick={() => handleSave('Shiprocket')}
          disabled={!shiprocketEnabled}
        >
          Save
        </Button>
      </Box>
    </Box>
  );

  const renderRecaptchaConfig = () => (
    <Box>
      {/* reCAPTCHA Configuration Card */}
      <Card sx={{ mb: 3 }}>
        <CardContent sx={{ p: 3 }}>
          {/* Status Section */}
          <Box display="flex" alignItems="center" justifyContent="space-between" mb={4}>
            <Typography variant="h6" sx={{ fontWeight: 600 }}>
              Status
            </Typography>
            <Box display="flex" alignItems="center" gap={2}>
              <Button
                variant="text"
                startIcon={<OpenInNewIcon />}
                size="small"
                onClick={() => window.open('https://docs.google.com/document/d/recaptcha-setup-guide', '_blank')}
              >
                How it Works
              </Button>
              <FormControlLabel
                control={
                  <Switch
                    checked={recaptchaEnabled}
                    onChange={(e) => handleRecaptchaToggle(e.target.checked)}
                    color="primary"
                  />
                }
                label="Turn ON"
              />
            </Box>
          </Box>

          <Divider sx={{ mb: 4 }} />

          {/* Keys Section */}
          <Typography variant="h6" sx={{ fontWeight: 600, mb: 3 }}>
            Keys
          </Typography>

          <Grid container spacing={3} sx={{ mb: 4 }}>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Site Key"
                value={recaptchaSiteKey}
                onChange={(e) => setRecaptchaSiteKey(e.target.value)}
                helperText="Public key for frontend reCAPTCHA widget"
                placeholder="6LeIxAcTAAAAAJcZVRqyHh71UMIEbQjY3B1Q2f0W"
                disabled={!recaptchaEnabled}
                InputProps={{
                  endAdornment: (
                    <Tooltip title="Public key used to display reCAPTCHA widget">
                      <IconButton size="small">
                        <InfoIcon color="action" />
                      </IconButton>
                    </Tooltip>
                  )
                }}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Secret Key"
                type="password"
                value={recaptchaSecretKey}
                onChange={(e) => setRecaptchaSecretKey(e.target.value)}
                helperText="Private key for backend verification"
                placeholder="6LeIxAcTAAAAAGG-vFI1TnRWxMZNFuojJ4WifJWe"
                disabled={!recaptchaEnabled}
                InputProps={{
                  endAdornment: (
                    <Tooltip title="Private key used for server-side verification">
                      <IconButton size="small">
                        <InfoIcon color="action" />
                      </IconButton>
                    </Tooltip>
                  )
                }}
              />
            </Grid>
          </Grid>

          <Divider sx={{ mb: 4 }} />

          {/* Instructions Section */}
          <Typography variant="h6" sx={{ fontWeight: 600, mb: 3 }}>
            Instructions
          </Typography>

          <Box sx={{ bgcolor: '#f8f9fa', p: 3, borderRadius: 2, mb: 3 }}>
            <Typography variant="body2" component="div" sx={{ lineHeight: 2 }}>
              <ol style={{ margin: 0, paddingLeft: '1.5rem' }}>
                <li sx={{ mb: 1 }}>Go to the Google reCAPTCHA admin console 
                  <Typography 
                    component="a" 
                    href="https://www.google.com/recaptcha/admin/create" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    sx={{ color: '#1976d2', textDecoration: 'none', ml: 1 }}
                    onClick={(e) => {
                      e.preventDefault();
                      window.open('https://www.google.com/recaptcha/admin/create', '_blank');
                    }}
                  >
                    (Click here)
                  </Typography>
                </li>
                <li sx={{ mb: 1 }}>Add a label (e.g., your company name)</li>
                <li sx={{ mb: 1 }}>Select <strong>reCAPTCHA v2</strong> as the reCAPTCHA Type</li>
                <li sx={{ mb: 1 }}>Select the <strong>"I'm not a robot" checkbox</strong> subtype</li>
                <li sx={{ mb: 1 }}>Add your application's domain (e.g., <code>demo.ifamtech.com</code>)</li>
                <li sx={{ mb: 1 }}>Accept the reCAPTCHA Terms of Service</li>
                <li sx={{ mb: 1 }}>Press Submit</li>
                <li>Copy the generated <strong>Site Key</strong> and <strong>Secret Key</strong> and paste them into the input fields above</li>
              </ol>
            </Typography>
          </Box>
        </CardContent>
      </Card>

      {/* Action Buttons */}
      <Box sx={{ display: 'flex', gap: 2, justifyContent: 'flex-end', mt: 3 }}>
        <Button
          variant="outlined"
          startIcon={<RefreshIcon />}
          onClick={() => handleReset('reCAPTCHA')}
          disabled={!recaptchaEnabled}
        >
          Reset
        </Button>
        <Button
          variant="contained"
          startIcon={<SaveIcon />}
          onClick={() => handleSave('reCAPTCHA')}
          disabled={!recaptchaEnabled}
        >
          Save
        </Button>
      </Box>

      {/* Confirmation Dialog */}
      <Dialog
        open={showRecaptchaConfirmDialog}
        onClose={cancelRecaptchaToggle}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle sx={{ pb: 2 }}>
          <Typography variant="h6" sx={{ fontWeight: 600 }}>
            Confirm reCAPTCHA Status Change
          </Typography>
        </DialogTitle>
        <DialogContent sx={{ pb: 3 }}>
          <Typography variant="body1" sx={{ mb: 2 }}>
            Are you sure you want to {pendingRecaptchaState ? 'enable' : 'disable'} reCAPTCHA protection?
          </Typography>
          <Typography variant="body2" color="text.secondary">
            {pendingRecaptchaState 
              ? 'Enabling reCAPTCHA will add security verification to your forms to protect against bots and spam.' 
              : 'Disabling reCAPTCHA will remove the security verification from your forms, making them vulnerable to automated spam and bots.'
            }
          </Typography>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 3 }}>
          <Button
            onClick={cancelRecaptchaToggle}
            variant="outlined"
          >
            Cancel
          </Button>
          <Button
            onClick={confirmRecaptchaToggle}
            variant="contained"
            color={pendingRecaptchaState ? 'primary' : 'error'}
          >
            {pendingRecaptchaState ? 'Enable reCAPTCHA' : 'Disable reCAPTCHA'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );

  const renderGoogleMapConfig = () => (
    <Box>
      {/* Firebase Auth Configuration Header */}
      <Box display="flex" alignItems="center" justifyContent="space-between" mb={3}>
        <Box display="flex" alignItems="center">
          <SecurityIcon sx={{ mr: 2, color: '#FFCA28', fontSize: 28 }} />
          <Typography variant="h5" sx={{ fontWeight: 600 }}>
            Firebase Auth
          </Typography>
        </Box>
        <Button
          variant="text"
          startIcon={<OpenInNewIcon />}
          size="small"
          onClick={() => window.open('https://docs.google.com/document/d/firebase-auth-setup-guide', '_blank')}
        >
          How it Works
        </Button>
      </Box>

      {/* Warning Notice */}
      <Alert severity="warning" sx={{ mb: 3 }}>
        <Typography variant="body2" sx={{ fontWeight: 600 }}>
          NB: Client key should have enable map javascript api and you can restrict it with http refer Server key should have enable place api key and you can restrict it with ip You can use same api for both field without any restrictions.
        </Typography>
      </Alert>

      {/* Google Map APIs Configuration Card */}
      <Card sx={{ mb: 3 }}>
        <CardContent sx={{ p: 3 }}>
          <Typography variant="h6" sx={{ fontWeight: 600, mb: 3 }}>
            API Keys Configuration
          </Typography>

          <Grid container spacing={3}>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Map api key(Client)"
                value={googleMapClientKey}
                onChange={(e) => setGoogleMapClientKey(e.target.value)}
                helperText="Client key for JavaScript API (restrict with HTTP referer)"
                placeholder="AIzaSyBeIR-4Maq90BHCA0HDq8GnoFFRia-eM1I"
                disabled={!googleMapEnabled}
                InputProps={{
                  endAdornment: (
                    <Tooltip title="Enable Maps JavaScript API, restrict with HTTP referer">
                      <IconButton size="small">
                        <InfoIcon color="action" />
                      </IconButton>
                    </Tooltip>
                  )
                }}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Map api key (Server)"
                value={googleMapServerKey}
                onChange={(e) => setGoogleMapServerKey(e.target.value)}
                helperText="Server key for Places API (restrict with IP address)"
                placeholder="AIzaSyBeIR-4Maq90BHCA0HDq8GnoFFRia-eM1I"
                disabled={!googleMapEnabled}
                InputProps={{
                  endAdornment: (
                    <Tooltip title="Enable Places API, restrict with IP address">
                      <IconButton size="small">
                        <InfoIcon color="action" />
                      </IconButton>
                    </Tooltip>
                  )
                }}
              />
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      {/* Action Buttons */}
      <Box sx={{ display: 'flex', gap: 2, justifyContent: 'flex-end', mt: 3 }}>
        <Button
          variant="outlined"
          startIcon={<RefreshIcon />}
          onClick={() => handleReset('Google Map APIs')}
          disabled={!googleMapEnabled}
        >
          Reset
        </Button>
        <Button
          variant="contained"
          startIcon={<SaveIcon />}
          onClick={() => handleSave('Google Map APIs')}
          disabled={!googleMapEnabled}
        >
          Save
        </Button>
      </Box>
    </Box>
  );

  const renderStorageConfig = () => (
    <Box>
      {/* Storage Connection Configuration Header */}
      <Box display="flex" alignItems="center" justifyContent="space-between" mb={3}>
        <Box display="flex" alignItems="center">
          <StorageIcon sx={{ mr: 2, color: '#FF9800', fontSize: 28 }} />
          <Typography variant="h5" sx={{ fontWeight: 600 }}>
            Storage connection settings
          </Typography>
        </Box>
        <Button
          variant="text"
          startIcon={<OpenInNewIcon />}
          size="small"
          onClick={() => window.open('https://docs.google.com/document/d/storage-setup-guide', '_blank')}
        >
          How it Works
        </Button>
      </Box>

      {/* Storage Type Selection Card */}
      <Card sx={{ mb: 3 }}>
        <CardContent sx={{ p: 3 }}>
          <Typography variant="h6" sx={{ fontWeight: 600, mb: 3 }}>
            Storage Type
          </Typography>

          <Grid container spacing={3}>
            <Grid item xs={12} md={6}>
              <Box 
                sx={{ 
                  p: 3, 
                  border: 2, 
                  borderColor: localStorageEnabled ? 'primary.main' : 'grey.300',
                  borderRadius: 2,
                  bgcolor: localStorageEnabled ? 'primary.50' : 'grey.50',
                  cursor: 'pointer',
                  transition: 'all 0.3s ease',
                  '&:hover': {
                    borderColor: 'primary.main',
                    bgcolor: localStorageEnabled ? 'primary.100' : 'grey.100'
                  }
                }}
                onClick={() => handleLocalStorageToggle(!localStorageEnabled)}
              >
                <Box display="flex" alignItems="center" justifyContent="space-between">
                  <Box display="flex" alignItems="center">
                    <StorageIcon sx={{ mr: 2, color: localStorageEnabled ? 'primary.main' : 'grey.600' }} />
                    <Box>
                      <Typography variant="h6" sx={{ fontWeight: 600, color: localStorageEnabled ? 'primary.main' : 'text.primary' }}>
                        Local system
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        Store files on your local server
                      </Typography>
                    </Box>
                  </Box>
                  <Switch
                    checked={localStorageEnabled}
                    onChange={(e) => handleLocalStorageToggle(e.target.checked)}
                    color="primary"
                  />
                </Box>
              </Box>
            </Grid>
            <Grid item xs={12} md={6}>
              <Box 
                sx={{ 
                  p: 3, 
                  border: 2, 
                  borderColor: thirdPartyStorageEnabled ? 'primary.main' : 'grey.300',
                  borderRadius: 2,
                  bgcolor: thirdPartyStorageEnabled ? 'primary.50' : 'grey.50',
                  cursor: 'pointer',
                  transition: 'all 0.3s ease',
                  '&:hover': {
                    borderColor: 'primary.main',
                    bgcolor: thirdPartyStorageEnabled ? 'primary.100' : 'grey.100'
                  }
                }}
                onClick={() => handleThirdPartyStorageToggle(!thirdPartyStorageEnabled)}
              >
                <Box display="flex" alignItems="center" justifyContent="space-between">
                  <Box display="flex" alignItems="center">
                    <StorageIcon sx={{ mr: 2, color: thirdPartyStorageEnabled ? 'primary.main' : 'grey.600' }} />
                    <Box>
                      <Typography variant="h6" sx={{ fontWeight: 600, color: thirdPartyStorageEnabled ? 'primary.main' : 'text.primary' }}>
                        3rd Party Storage
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        Store files on cloud storage (S3)
                      </Typography>
                    </Box>
                  </Box>
                  <Switch
                    checked={thirdPartyStorageEnabled}
                    onChange={(e) => handleThirdPartyStorageToggle(e.target.checked)}
                    color="primary"
                  />
                </Box>
              </Box>
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      {/* S3 Credential Configuration Card - Only show for 3rd Party Storage */}
      {thirdPartyStorageEnabled && (
        <Card sx={{ mb: 3 }}>
          <CardContent sx={{ p: 3 }}>
            <Typography variant="h6" sx={{ fontWeight: 600, mb: 3 }}>
              S3 Credential
            </Typography>

            <Box sx={{ mb: 3, p: 2, bgcolor: '#f8f9fa', borderRadius: 2 }}>
              <Typography variant="body2" sx={{ fontWeight: 600 }}>
                The Access Key ID is a publicly accessible identifier used to authenticate requests to S3. 
                <Typography 
                  component="a" 
                  href="https://docs.aws.amazon.com/IAM/latest/UserGuide/id_credentials_access-keys.html" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  sx={{ color: '#1976d2', textDecoration: 'none', ml: 1 }}
                  onClick={(e) => {
                    e.preventDefault();
                    window.open('https://docs.aws.amazon.com/IAM/latest/UserGuide/id_credentials_access-keys.html', '_blank');
                  }}
                >
                  Learn More
                </Typography>
              </Typography>
            </Box>

            <Grid container spacing={3}>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Access key"
                  value={s3AccessKey}
                  onChange={(e) => setS3AccessKey(e.target.value)}
                  helperText="Enter your access key"
                  placeholder="AKIAIOSFODNN7EXAMPLE"
                  disabled={!thirdPartyStorageEnabled}
                  InputProps={{
                    endAdornment: (
                      <Tooltip title="Your AWS S3 Access Key ID">
                        <IconButton size="small">
                          <InfoIcon color="action" />
                        </IconButton>
                      </Tooltip>
                    )
                  }}
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Secret access kay"
                  type={showS3SecretKey ? "text" : "password"}
                  value={s3SecretKey}
                  onChange={(e) => setS3SecretKey(e.target.value)}
                  helperText="Enter your secret access kay"
                  placeholder="wJalrXUtnFEMI/K7MDENG/bPxRfiCYEXAMPLEKEY"
                  disabled={!thirdPartyStorageEnabled}
                  InputProps={{
                    endAdornment: (
                      <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        <Tooltip title="Toggle password visibility">
                          <IconButton 
                            size="small" 
                            onClick={() => setShowS3SecretKey(!showS3SecretKey)}
                            disabled={!thirdPartyStorageEnabled}
                          >
                            {showS3SecretKey ? <VisibilityOffIcon /> : <VisibilityIcon />}
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="Your AWS S3 Secret Access Key">
                          <IconButton size="small">
                            <InfoIcon color="action" />
                          </IconButton>
                        </Tooltip>
                      </Box>
                    )
                  }}
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Region"
                  value={s3Region}
                  onChange={(e) => setS3Region(e.target.value)}
                  helperText="Enter your region"
                  placeholder="us-east-1"
                  disabled={!thirdPartyStorageEnabled}
                  InputProps={{
                    endAdornment: (
                      <Tooltip title="AWS S3 bucket region">
                        <IconButton size="small">
                          <InfoIcon color="action" />
                        </IconButton>
                      </Tooltip>
                    )
                  }}
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Bucket"
                  value={s3Bucket}
                  onChange={(e) => setS3Bucket(e.target.value)}
                  helperText="Enter your bucket"
                  placeholder="my-storage-bucket"
                  disabled={!thirdPartyStorageEnabled}
                  InputProps={{
                    endAdornment: (
                      <Tooltip title="Your S3 bucket name">
                        <IconButton size="small">
                          <InfoIcon color="action" />
                        </IconButton>
                      </Tooltip>
                    )
                  }}
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="URL"
                  value={s3Url}
                  onChange={(e) => setS3Url(e.target.value)}
                  helperText="Enter your url"
                  placeholder="https://s3.amazonaws.com"
                  disabled={!thirdPartyStorageEnabled}
                  InputProps={{
                    endAdornment: (
                      <Tooltip title="S3 service URL">
                        <IconButton size="small">
                          <InfoIcon color="action" />
                        </IconButton>
                      </Tooltip>
                    )
                  }}
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Endpoint"
                  value={s3Endpoint}
                  onChange={(e) => setS3Endpoint(e.target.value)}
                  helperText="Enter your endpoint"
                  placeholder="s3.amazonaws.com"
                  disabled={!thirdPartyStorageEnabled}
                  InputProps={{
                    endAdornment: (
                      <Tooltip title="S3 service endpoint">
                        <IconButton size="small">
                          <InfoIcon color="action" />
                        </IconButton>
                      </Tooltip>
                    )
                  }}
                />
              </Grid>
            </Grid>
          </CardContent>
        </Card>
      )}

      {/* Action Buttons */}
      <Box sx={{ display: 'flex', gap: 2, justifyContent: 'flex-end', mt: 3 }}>
        <Button
          variant="outlined"
          startIcon={<RefreshIcon />}
          onClick={() => handleReset('Storage Connection')}
          disabled={!storageEnabled}
        >
          Reset
        </Button>
        <Button
          variant="contained"
          startIcon={<SaveIcon />}
          onClick={() => handleSave('Storage Connection')}
          disabled={!storageEnabled}
        >
          Save
        </Button>
      </Box>
    </Box>
  );

  const renderFirebaseAuthConfig = () => (
    <Box>
      {/* Firebase Auth Configuration Header */}
      <Box display="flex" alignItems="center" justifyContent="space-between" mb={3}>
        <Box display="flex" alignItems="center">
          <SecurityIcon sx={{ mr: 2, color: '#FFCA28', fontSize: 28 }} />
          <Typography variant="h5" sx={{ fontWeight: 600 }}>
            Firebase Auth
          </Typography>
        </Box>
        <Box display="flex" alignItems="center" gap={2}>
          <Button
            variant="text"
            startIcon={<OpenInNewIcon />}
            size="small"
            onClick={() => window.open('https://docs.google.com/document/d/firebase-auth-setup-guide', '_blank')}
          >
            How it Works
          </Button>
          
        </Box>
      </Box>

      {/* Firebase Configuration Notice */}
      <Alert severity="info" sx={{ mb: 3 }}>
        <Typography variant="body2" sx={{ fontWeight: 600 }}>
          Please ensure that your firebase configuration is set up before using these features. 
          <Typography 
            component="a" 
            href="https://console.firebase.google.com/" 
            target="_blank" 
            rel="noopener noreferrer"
            sx={{ color: '#1976d2', textDecoration: 'none', ml: 1 }}
            onClick={(e) => {
              e.preventDefault();
              window.open('https://console.firebase.google.com/', '_blank');
            }}
          >
            Check Firebase Configuration
          </Typography>
        </Typography>
      </Alert>

      {/* Firebase Auth Configuration Card */}
      <Card sx={{ mb: 3 }}>
        <CardContent sx={{ p: 3 }}>
          <Typography variant="h6" sx={{ fontWeight: 600, mb: 3 }}>
            Credential setup
          </Typography>

          <Grid container spacing={3}>
            <Grid item xs={12} md={6}>
              <Box display="flex" alignItems="center" justifyContent="space-between" mb={2}>
                <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
                  Firebase Auth Verification Status
                </Typography>
                <FormControlLabel
                  control={
                    <Switch
                      checked={firebaseAuthVerificationStatus}
                      onChange={(e) => handleFirebaseAuthVerificationToggle(e.target.checked)}
                      color="primary"
                      disabled={firebaseAuthVerificationStatus} // Can't turn off once enabled
                    />
                  }
                  label=""
                />
              </Box>
              <Typography variant="body2" color="text.secondary">
                Enable verification for Firebase authentication
              </Typography>
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Web Api Key"
                value={firebaseWebApiKey}
                onChange={(e) => setFirebaseWebApiKey(e.target.value)}
                helperText="Enter your Web API Key"
                placeholder="AIzaSy...your-web-api-key"
                InputProps={{
                  endAdornment: (
                    <Tooltip title="Your Firebase Web API Key from project settings">
                      <IconButton size="small">
                        <InfoIcon color="action" />
                      </IconButton>
                    </Tooltip>
                  )
                }}
              />
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      {/* Action Buttons */}
      <Box sx={{ display: 'flex', gap: 2, justifyContent: 'flex-end', mt: 3 }}>
        <Button
          variant="outlined"
          startIcon={<RefreshIcon />}
          onClick={() => handleReset('Firebase Auth')}
          disabled={!firebaseAuthVerificationStatus}
        >
          Reset
        </Button>
        <Button
          variant="contained"
          startIcon={<SaveIcon />}
          onClick={() => handleSave('Firebase Auth')}
          disabled={!firebaseAuthVerificationStatus}
        >
          Save
        </Button>
      </Box>

      {/* Confirmation Dialog */}
      <Dialog
        open={showFirebaseAuthConfirmDialog}
        onClose={cancelFirebaseAuthVerificationToggle}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle sx={{ pb: 2 }}>
          <Typography variant="h6" sx={{ fontWeight: 600 }}>
            Confirm Firebase Auth Verification Status Change
          </Typography>
        </DialogTitle>
        <DialogContent sx={{ pb: 3 }}>
          <Typography variant="body1" sx={{ mb: 2 }}>
            Are you sure you want to enable Firebase Auth verification?
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Enabling Firebase Auth verification will add user authentication and verification features to your application.
          </Typography>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 3 }}>
          <Button
            onClick={cancelFirebaseAuthVerificationToggle}
            variant="outlined"
          >
            Cancel
          </Button>
          <Button
            onClick={confirmFirebaseAuthVerificationToggle}
            variant="contained"
            color="primary"
          >
            Enable Firebase Auth Verification
          </Button>
        </DialogActions>
      </Dialog>

      {/* Firebase Configuration Setup Alert */}
      <Dialog
        open={showFirebaseConfigAlert}
        onClose={() => setShowFirebaseConfigAlert(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle sx={{ pb: 2 }}>
          <Typography variant="h6" sx={{ fontWeight: 600 }}>
            Set up firebase configuration first
          </Typography>
        </DialogTitle>
        <DialogContent sx={{ pb: 3 }}>
          <Typography variant="body1" sx={{ mb: 2 }}>
            It looks like your firebase login configuration is not set up yet. To enable the firebase login option please set up the firebase configuration first.
          </Typography>
          <Typography 
            component="a" 
            href="#" 
            sx={{ 
              color: '#1976d2', 
              textDecoration: 'none', 
              cursor: 'pointer',
              fontWeight: 600,
              '&:hover': { textDecoration: 'underline' }
            }}
            onClick={(e) => {
              e.preventDefault();
              handleGoToFirebaseConfig();
            }}
          >
            Go to Firebase configuration
          </Typography>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 3 }}>
          <Button
            onClick={() => setShowFirebaseConfigAlert(false)}
            variant="outlined"
          >
            Cancel
          </Button>
          <Button
            onClick={handleGoToFirebaseConfig}
            variant="contained"
            color="primary"
          >
            OK
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );

  const renderFirebaseConfig = () => (
    <Box>
      {/* Firebase Configuration Header */}
      <Box display="flex" alignItems="center" justifyContent="space-between" mb={3}>
        <Box display="flex" alignItems="center">
          <SecurityIcon sx={{ mr: 2, color: '#FFCA28', fontSize: 28 }} />
          <Typography variant="h5" sx={{ fontWeight: 600 }}>
            Firebase Configuration
          </Typography>
        </Box>
        <Button
          variant="text"
          startIcon={<OpenInNewIcon />}
          size="small"
          onClick={() => window.open('https://console.firebase.google.com/', '_blank')}
        >
          How it Works
        </Button>
      </Box>

      {/* Firebase Configuration Notice */}
      <Alert severity="info" sx={{ mb: 3 }}>
        <Typography variant="body2" sx={{ fontWeight: 600 }}>
          Configure your Firebase project settings to enable Firebase services. 
          <Typography 
            component="a" 
            href="https://console.firebase.google.com/" 
            target="_blank" 
            rel="noopener noreferrer"
            sx={{ color: '#1976d2', textDecoration: 'none', ml: 1 }}
            onClick={(e) => {
              e.preventDefault();
              window.open('https://console.firebase.google.com/', '_blank');
            }}
          >
            Visit Firebase Console
          </Typography>
        </Typography>
      </Alert>

      {/* Firebase Configuration Card */}
      <Card sx={{ mb: 3 }}>
        <CardContent sx={{ p: 3 }}>
          <Typography variant="h6" sx={{ fontWeight: 600, mb: 3 }}>
            Firebase Project Settings
          </Typography>

          <Grid container spacing={3}>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Project ID"
                value={firebaseProjectId}
                onChange={(e) => setFirebaseProjectId(e.target.value)}
                helperText="Enter your Firebase project ID"
                placeholder="Ex: my-app-12345"
                disabled={!firebaseConfigEnabled}
                InputProps={{
                  endAdornment: (
                    <Tooltip title="Your Firebase project ID from project settings">
                      <IconButton size="small">
                        <InfoIcon color="action" />
                      </IconButton>
                    </Tooltip>
                  )
                }}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Storage Bucket"
                value={firebaseStorageBucket}
                onChange={(e) => setFirebaseStorageBucket(e.target.value)}
                helperText="Enter your Firebase storage bucket"
                placeholder="Ex: ****-2050.appspot.com"
                disabled={!firebaseConfigEnabled}
                InputProps={{
                  endAdornment: (
                    <Tooltip title="Your Firebase storage bucket name">
                      <IconButton size="small">
                        <InfoIcon color="action" />
                      </IconButton>
                    </Tooltip>
                  )
                }}
              />
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      {/* Action Buttons */}
      <Box sx={{ display: 'flex', gap: 2, justifyContent: 'flex-end', mt: 3 }}>
        <Button
          variant="outlined"
          startIcon={<RefreshIcon />}
          onClick={() => handleReset('Firebase Configuration')}
          disabled={!firebaseConfigEnabled}
        >
          Reset
        </Button>
        <Button
          variant="contained"
          startIcon={<SaveIcon />}
          onClick={() => handleSave('Firebase Configuration')}
          disabled={!firebaseConfigEnabled}
        >
          Save
        </Button>
      </Box>
    </Box>
  );

  const renderTabContent = () => {
    switch (activeTab) {
      case 0:
        return renderSocialMediaChat();
      case 1:
        return renderSocialMediaLogin();
      case 2:
        return renderMailConfig();
      case 3:
        return renderSmsConfig();
      case 4:
        return renderShiprocketConfig();
      case 5:
        return renderRecaptchaConfig();
      case 6:
        return renderGoogleMapConfig();
      case 7:
        return renderStorageConfig();
      case 8:
        return renderFirebaseAuthConfig();
      case 9:
        return renderFirebaseConfig();
      default:
        return (
          <Card>
            <CardContent sx={{ p: 4, textAlign: 'center' }}>
              <Typography variant="h6" color="text.secondary">
                Configuration for this section is coming soon...
              </Typography>
            </CardContent>
          </Card>
        );
    }
  };

  return (
    <Box sx={{ p: 3, bgcolor: '#f5f7fa', minHeight: '100vh' }}>
      <Typography variant="h4" sx={{ mb: 3, fontWeight: 600, color: '#1e293b' }}>
        3rd Party Configuration
      </Typography>

      <Card sx={{ mb: 3 }}>
        <CardContent sx={{ p: 0 }}>
          <Tabs
            value={activeTab}
            onChange={handleTabChange}
            variant="scrollable"
            scrollButtons="auto"
            sx={{ 
              borderBottom: 1, 
              borderColor: 'divider',
              '& .MuiTab-root': {
                textTransform: 'none',
                fontWeight: 500,
                minWidth: 120
              }
            }}
          >
            <Tab 
              icon={<WhatsAppIcon />} 
              label="Social Media Chat" 
              iconPosition="start" 
            />
            <Tab 
              icon={<PhoneIcon />} 
              label="Social Media Login" 
              iconPosition="start" 
            />
            <Tab 
              icon={<EmailIcon />} 
              label="Mail Config" 
              iconPosition="start" 
            />
            <Tab 
              icon={<SmsIcon />} 
              label="SMS Config" 
              iconPosition="start" 
            />
            <Tab 
              icon={<LocalShippingIcon />} 
              label="Shiprocket Config" 
              iconPosition="start" 
            />
            <Tab 
              icon={<SecurityIcon />} 
              label="Recaptcha" 
              iconPosition="start" 
            />
            <Tab 
              icon={<MapIcon />} 
              label="Google Map APIs" 
              iconPosition="start" 
            />
            <Tab 
              icon={<StorageIcon />} 
              label="Storage Connection" 
              iconPosition="start" 
            />
            <Tab 
              icon={<SecurityIcon />} 
              label="Firebase Auth" 
              iconPosition="start" 
            />
          </Tabs>
        </CardContent>
      </Card>

      {renderTabContent()}

      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={handleSnackbarClose}
        anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
      >
        <Alert 
          onClose={handleSnackbarClose} 
          severity={snackbar.severity}
          sx={{ width: '100%' }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
}

export default ThirdPartyConfig;
