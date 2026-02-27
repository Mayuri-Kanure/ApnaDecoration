import React, { useState, useRef, useEffect } from 'react';
import axios from 'axios';
import {
  Box,
  Card,
  CardContent,
  Grid,
  Typography,
  TextField,
  Button,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  CircularProgress,
  Snackbar,
  Alert,
  Tabs,
  Tab,
  Tooltip,
  IconButton,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Switch,
  Chip,
  Menu,
  ListItemIcon,
  ListItemText,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  FormControlLabel,
} from '@mui/material';
import { 
  Settings as SettingsIcon, 
  Save as SaveIcon, 
  RestartAlt as RestartAltIcon,
  Info as InfoIcon,
  Android as AndroidIcon,
  Apple as AppleIcon,
  Add as AddIcon,
  MoreVert as MoreVertIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Visibility as VisibilityIcon
} from '@mui/icons-material';
import CurrencyManagement from '../components/CurrencyManagement';

const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || 'https://admin-api.apnadecoration.com/api';

function SystemSettings() {
  // Tab state
  const [activeTab, setActiveTab] = useState(0);

  // Environment Settings State
  const [envSettings, setEnvSettings] = useState({
    appName: 'APNA DECORATION',
    appDebug: false,
    appMode: 'production',
    appUrl: 'https://apnadecoration.com',
    dbConnection: 'mongodb',
    dbHost: 'localhost',
    dbPort: '27017',
    dbDatabase: 'apna_decoration',
    dbUsername: '',
    dbPassword: '',
    buyerUsername: '',
    purchaseCode: ''
  });

  // App Version Control State
  const [versionControl, setVersionControl] = useState({
    customer: {
      android: {
        minVersion: '1.0.0',
        downloadUrl: 'https://play.google.com/store/apps/details?id=com.apnadecoration.customer'
      },
      ios: {
        minVersion: '1.0.0',
        downloadUrl: 'https://apps.apple.com/app/apnadecoration-customer'
      }
    },
    vendor: {
      android: {
        minVersion: '1.0.0',
        downloadUrl: 'https://play.google.com/store/apps/details?id=com.apnadecoration.vendor'
      },
      ios: {
        minVersion: '1.0.0',
        downloadUrl: 'https://apps.apple.com/app/apnadecoration-vendor'
      }
    },
    deliveryman: {
      android: {
        minVersion: '1.0.0',
        downloadUrl: 'https://play.google.com/store/apps/details?id=com.apnadecoration.delivery'
      },
      ios: {
        minVersion: '1.0.0',
        downloadUrl: 'https://apps.apple.com/app/apnadecoration-delivery'
      }
    }
  });

  // Loading and feedback states
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(false);
  const [snackbar, setSnackbar] = useState({ open: false, severity: "info", msg: "" });

  // Software Upload State
  const [uploadData, setUploadData] = useState({
    username: '',
    purchaseCode: '',
    file: null
  });
  const fileInputRef = useRef(null);

  // Language Management State
  const [languages, setLanguages] = useState([
    {
      id: 1,
      name: 'english (ltr)',
      code: 'en',
      status: true,
      defaultStatus: true
    }
  ]);
  const [languageMenuAnchor, setLanguageMenuAnchor] = useState(null);
  const [selectedLanguage, setSelectedLanguage] = useState(null);

  // Add Language Modal State
  const [addLanguageModal, setAddLanguageModal] = useState({
    open: false,
    language: '',
    country: 'AD',
    direction: 'ltr'
  });

  // Cookie Settings State
  const [cookieSettings, setCookieSettings] = useState({
    essentialCookies: true,
    analyticsCookies: false,
    marketingCookies: false,
    functionalCookies: false,
    cookiePolicyUrl: '',
    privacyPolicyUrl: '',
    cookieConsentText: 'We use cookies to enhance your experience. By continuing to visit this site you agree to our use of cookies.',
    cookieConsentButtonText: 'Accept All',
    cookieConsentRejectButtonText: 'Reject All',
    cookieConsentCustomizeButtonText: 'Customize',
    showCookieBanner: true
  });

  // Database Cleanup State
  const [cleanupOptions, setCleanupOptions] = useState({
    clearOrders: false,
    clearCustomers: false,
    clearProducts: false,
    clearServices: false,
    clearCategories: false,
    clearBanners: false,
    clearNotifications: false,
    clearReviews: false,
    clearWishlist: false,
    clearWallet: false,
    clearLoyaltyPoints: false,
    clearWithdraws: false,
    olderThanDays: 30,
    backupBeforeCleanup: true
  });
  const [cleanupStats, setCleanupStats] = useState({
    totalOrders: 0,
    totalCustomers: 0,
    totalProducts: 0,
    totalServices: 0,
    totalNotifications: 0,
    totalReviews: 0
  });
  const [cleanupLoading, setCleanupLoading] = useState(false);

  // Load data on component mount
  useEffect(() => {
    loadSystemSettings();
    loadVersionControl();
    loadLanguages();
    loadCookieSettings();
    loadCleanupStats();
  }, []);

  const loadCookieSettings = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${API_BASE_URL}/system-settings/cookies`);
      setCookieSettings(response.data);
    } catch (error) {
      console.error('Error loading cookie settings:', error);
      // Use defaults if API fails
    } finally {
      setLoading(false);
    }
  };

  const loadSystemSettings = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${API_BASE_URL}/system-settings`);
      setEnvSettings(response.data);
    } catch (error) {
      console.error('Error loading system settings:', error);
      setSnackbar({ open: true, severity: "error", msg: "Failed to load system settings" });
    } finally {
      setLoading(false);
    }
  };

  const loadVersionControl = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${API_BASE_URL}/system-settings/version-control`);
      setVersionControl(response.data);
    } catch (error) {
      console.error('Error loading version control:', error);
      setSnackbar({ open: true, severity: "error", msg: "Failed to load version control" });
    } finally {
      setLoading(false);
    }
  };

  const loadLanguages = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${API_BASE_URL}/system-settings/languages`);
      setLanguages(response.data);
    } catch (error) {
      console.error('Error loading languages:', error);
      setSnackbar({ open: true, severity: "error", msg: "Failed to load languages" });
    } finally {
      setLoading(false);
    }
  };

  // Handle tab change
  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue);
  };

  // Handle form field changes
  const handleInputChange = (field) => (e) => {
    const value = e.target.type === 'checkbox' ? e.target.checked : e.target.value;
    setEnvSettings(prev => ({ ...prev, [field]: value }));
  };

  // Handle version control field changes
  const handleVersionChange = (appType, platform, field) => (e) => {
    setVersionControl(prev => ({
      ...prev,
      [appType]: {
        ...prev[appType],
        [platform]: {
          ...prev[appType][platform],
          [field]: e.target.value
        }
      }
    }));
  };

  // Validate version format (x.y or x.y.z)
  const validateVersion = (version) => {
    const versionRegex = /^\d+\.\d+(\.\d+)?$/;
    return versionRegex.test(version);
  };

  // Validate URL format
  const validateUrl = (url) => {
    try {
      new URL(url);
      return true;
    } catch {
      return false;
    }
  };

  // Handle version control save
  const handleVersionSave = async (appType, platform) => {
    const config = versionControl[appType][platform];
    
    // Validation
    if (!validateVersion(config.minVersion)) {
      setSnackbar({ open: true, severity: "error", msg: "Invalid version format. Use x.y or x.y.z format" });
      return;
    }
    
    if (!validateUrl(config.downloadUrl)) {
      setSnackbar({ open: true, severity: "error", msg: "Invalid URL format" });
      return;
    }

    try {
      setSaving(true);
      const response = await axios.post(`${API_BASE_URL}/system-settings/version-control`, {
        appType,
        platform,
        minVersion: config.minVersion,
        downloadUrl: config.downloadUrl
      });
      
      setSnackbar({ 
        open: true, 
        severity: "success", 
        msg: `${appType.charAt(0).toUpperCase() + appType.slice(1)} ${platform.charAt(0).toUpperCase() + platform.slice(1)} version control updated successfully!` 
      });
    } catch (err) {
      console.error("Error saving version control:", err);
      setSnackbar({ open: true, severity: "error", msg: "Failed to save version control" });
    } finally {
      setSaving(false);
    }
  };

  // Handle version control reset
  const handleVersionReset = (appType, platform) => {
    const defaultUrls = {
      customer: {
        android: 'https://play.google.com/store/apps/details?id=com.printformee.customer',
        ios: 'https://apps.apple.com/app/printformee-customer'
      },
      vendor: {
        android: 'https://play.google.com/store/apps/details?id=com.printformee.vendor',
        ios: 'https://apps.apple.com/app/printformee-vendor'
      },
      deliveryman: {
        android: 'https://play.google.com/store/apps/details?id=com.printformee.delivery',
        ios: 'https://apps.apple.com/app/printformee-delivery'
      }
    };

    setVersionControl(prev => ({
      ...prev,
      [appType]: {
        ...prev[appType],
        [platform]: {
          minVersion: '1.0.0',
          downloadUrl: defaultUrls[appType][platform]
        }
      }
    }));

    setSnackbar({ open: true, severity: "info", msg: "Version control reset to defaults" });
  };

  // Handle upload field changes
  const handleUploadChange = (field) => (e) => {
    if (field === 'file') {
      const file = e.target.files[0];
      if (file) {
        // Validate file type
        const allowedTypes = ['application/zip', 'application/x-rar-compressed', 'application/octet-stream'];
        if (!allowedTypes.includes(file.type) && !file.name.match(/\.(zip|rar)$/i)) {
          setSnackbar({ open: true, severity: "error", msg: "Please upload a ZIP or RAR file" });
          return;
        }
        
        // Validate file size (max 50MB)
        if (file.size > 50 * 1024 * 1024) {
          setSnackbar({ open: true, severity: "error", msg: "File size must be less than 50MB" });
          return;
        }
      }
      setUploadData(prev => ({ ...prev, file: e.target.files[0] }));
    } else {
      setUploadData(prev => ({ ...prev, [field]: e.target.value }));
    }
  };

  // Handle file browse
  const handleFileBrowse = () => {
    fileInputRef.current?.click();
  };

  // Validate purchase code format
  const validatePurchaseCode = (code) => {
    // CodeCanyon purchase code format: xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx
    const purchaseCodeRegex = /^[a-f0-9]{8}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{12}$/i;
    return purchaseCodeRegex.test(code);
  };

  // Handle software upload
  const handleSoftwareUpload = async () => {
    // Validation
    if (!uploadData.username.trim()) {
      setSnackbar({ open: true, severity: "error", msg: "Please enter CodeCanyon username" });
      return;
    }
    
    if (!validatePurchaseCode(uploadData.purchaseCode)) {
      setSnackbar({ open: true, severity: "error", msg: "Invalid purchase code format" });
      return;
    }
    
    if (!uploadData.file) {
      setSnackbar({ open: true, severity: "error", msg: "Please select a file to upload" });
      return;
    }

    try {
      setSaving(true);
      
      // Create FormData for file upload
      const formData = new FormData();
      formData.append('username', uploadData.username);
      formData.append('purchaseCode', uploadData.purchaseCode);
      formData.append('file', uploadData.file);
      
      const response = await axios.post(`${API_BASE_URL}/system-settings/software-upload`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });
      
      setSnackbar({ 
        open: true, 
        severity: "success", 
        msg: "Software uploaded and updated successfully!" 
      });
      
      // Reset form
      setUploadData({ username: '', purchaseCode: '', file: null });
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
      
    } catch (err) {
      console.error("Error uploading software:", err);
      setSnackbar({ open: true, severity: "error", msg: "Failed to upload software. Please verify your purchase code." });
    } finally {
      setSaving(false);
    }
  };

  // Handle upload reset
  const handleUploadReset = () => {
    setUploadData({ username: '', purchaseCode: '', file: null });
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
    setSnackbar({ open: true, severity: "info", msg: "Upload form reset" });
  };

  // Handle language status toggle
  const handleLanguageStatusToggle = (languageId) => {
    setLanguages(prev => prev.map(lang => 
      lang.id === languageId ? { ...lang, status: !lang.status } : lang
    ));
    setSnackbar({ open: true, severity: "success", msg: "Language status updated successfully!" });
  };

  // Handle default language toggle
  const handleDefaultLanguageToggle = (languageId) => {
    setLanguages(prev => prev.map(lang => {
      return {
        ...lang,
        defaultStatus: lang.id === languageId ? !lang.defaultStatus : false
      };
    }));
    setSnackbar({ open: true, severity: "success", msg: "Default language updated successfully!" });
  };

  // Handle language menu
  const handleLanguageMenuClick = (event, language) => {
    setLanguageMenuAnchor(event.currentTarget);
    setSelectedLanguage(language);
  };

  const handleLanguageMenuClose = () => {
    setLanguageMenuAnchor(null);
    setSelectedLanguage(null);
  };

  // Handle language actions
  const handleEditLanguage = () => {
    setSnackbar({ open: true, severity: "info", msg: `Editing language: ${selectedLanguage.name}` });
    handleLanguageMenuClose();
  };

  const handleViewLanguage = () => {
    setSnackbar({ open: true, severity: "info", msg: `Viewing details for: ${selectedLanguage.name}` });
    handleLanguageMenuClose();
  };

  const handleDeleteLanguage = () => {
    if (selectedLanguage.code === 'en') {
      setSnackbar({ open: true, severity: "error", msg: "Cannot delete default language" });
      handleLanguageMenuClose();
      return;
    }
    
    setLanguages(prev => prev.filter(lang => lang.id !== selectedLanguage.id));
    setSnackbar({ open: true, severity: "success", msg: `Language deleted successfully: ${selectedLanguage.name}` });
    handleLanguageMenuClose();
  };

  // Handle add new language
  const handleAddLanguage = () => {
    setAddLanguageModal(prev => ({ ...prev, open: true }));
  };

  // Handle modal field changes
  const handleModalChange = (field) => (e) => {
    setAddLanguageModal(prev => ({ ...prev, [field]: e.target.value }));
  };

  // Handle save new language
  const handleSaveLanguage = () => {
    // Validation
    if (!addLanguageModal.language.trim()) {
      setSnackbar({ open: true, severity: "error", msg: "Please enter language" });
      return;
    }
    
    if (!addLanguageModal.country) {
      setSnackbar({ open: true, severity: "error", msg: "Please select country code" });
      return;
    }

    // Add new language
    const newLanguage = {
      id: languages.length + 1,
      name: addLanguageModal.language,
      code: addLanguageModal.country,
      direction: addLanguageModal.direction,
      status: true,
      defaultStatus: false
    };
    
    setLanguages(prev => [...prev, newLanguage]);
    setSnackbar({ open: true, severity: "success", msg: "New language added successfully!" });
    
    // Reset and close modal
    setAddLanguageModal({
      open: false,
      language: '',
      country: 'AD',
      direction: 'ltr'
    });
  };

  // Handle modal close
  const handleModalClose = () => {
    setAddLanguageModal({
      open: false,
      language: '',
      country: 'AD',
      direction: 'ltr'
    });
  };

  // Cookie Settings Handlers
  const handleCookieChange = (field) => (event) => {
    const value = event.target.type === 'checkbox' ? event.target.checked : event.target.value;
    setCookieSettings(prev => ({ ...prev, [field]: value }));
  };

  const handleCookieSave = async () => {
    try {
      setSaving(true);
      const response = await axios.post(`${API_BASE_URL}/system-settings/cookies`, cookieSettings);
      setSnackbar({ open: true, severity: "success", msg: "Cookie settings saved successfully!" });
    } catch (error) {
      console.error('Error saving cookie settings:', error);
      setSnackbar({ open: true, severity: "error", msg: "Failed to save cookie settings" });
    } finally {
      setSaving(false);
    }
  };

  const handleCookieReset = () => {
    setCookieSettings({
      essentialCookies: true,
      analyticsCookies: false,
      marketingCookies: false,
      functionalCookies: false,
      cookiePolicyUrl: '',
      privacyPolicyUrl: '',
      cookieConsentText: 'We use cookies to enhance your experience. By continuing to visit this site you agree to our use of cookies.',
      cookieConsentButtonText: 'Accept All',
      cookieConsentRejectButtonText: 'Reject All',
      cookieConsentCustomizeButtonText: 'Customize',
      showCookieBanner: true
    });
    setSnackbar({ open: true, severity: "info", msg: "Cookie settings reset to defaults" });
  };

  // Database Cleanup Handlers
  const handleCleanupOptionChange = (field) => (event) => {
    const value = event.target.type === 'checkbox' ? event.target.checked : event.target.value;
    setCleanupOptions(prev => ({ ...prev, [field]: value }));
  };

  const loadCleanupStats = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${API_BASE_URL}/system-settings/cleanup-stats`);
      setCleanupStats(response.data);
    } catch (error) {
      console.error('Error loading cleanup stats:', error);
      setSnackbar({ open: true, severity: "error", msg: "Failed to load database statistics" });
    } finally {
      setLoading(false);
    }
  };

  const handleDatabaseCleanup = async () => {
    // Validate at least one option is selected
    const hasSelectedOption = Object.keys(cleanupOptions).some(key => 
      key !== 'olderThanDays' && key !== 'backupBeforeCleanup' && cleanupOptions[key]
    );
    
    if (!hasSelectedOption) {
      setSnackbar({ open: true, severity: "error", msg: "Please select at least one cleanup option" });
      return;
    }

    // Confirmation dialog
    const confirmMessage = `Are you sure you want to clean the database? This action cannot be undone.${cleanupOptions.backupBeforeCleanup ? ' A backup will be created before cleanup.' : ''}`;
    if (!window.confirm(confirmMessage)) {
      return;
    }

    try {
      setCleanupLoading(true);
      const response = await axios.post(`${API_BASE_URL}/system-settings/cleanup-database`, cleanupOptions);
      
      setSnackbar({ 
        open: true, 
        severity: "success", 
        msg: `Database cleanup completed successfully! ${response.data.deletedCount || 0} records deleted.` 
      });
      
      // Reload stats after cleanup
      await loadCleanupStats();
      
      // Reset options
      setCleanupOptions({
        clearOrders: false,
        clearCustomers: false,
        clearProducts: false,
        clearServices: false,
        clearCategories: false,
        clearBanners: false,
        clearNotifications: false,
        clearReviews: false,
        clearWishlist: false,
        clearWallet: false,
        clearLoyaltyPoints: false,
        clearWithdraws: false,
        olderThanDays: 30,
        backupBeforeCleanup: true
      });
    } catch (error) {
      console.error('Error during database cleanup:', error);
      setSnackbar({ open: true, severity: "error", msg: "Failed to clean database. Please check logs." });
    } finally {
      setCleanupLoading(false);
    }
  };

  // Handle form submission
  const handleSubmit = async () => {
    // Enhanced validation
    if (!envSettings.appName || !envSettings.appUrl || !envSettings.dbHost) {
      setSnackbar({ open: true, severity: "error", msg: "Please fill in all required fields" });
      return;
    }

    // App name validation
    if (envSettings.appName.length < 2 || envSettings.appName.length > 50) {
      setSnackbar({ open: true, severity: "error", msg: "App name must be between 2 and 50 characters" });
      return;
    }

    // URL validation
    try {
      const url = new URL(envSettings.appUrl);
      if (!['http:', 'https:'].includes(url.protocol)) {
        setSnackbar({ open: true, severity: "error", msg: "URL must use HTTP or HTTPS protocol" });
        return;
      }
    } catch {
      setSnackbar({ open: true, severity: "error", msg: "Please enter a valid URL (e.g., https://yourapp.com)" });
      return;
    }

    // Database validation
    if (!envSettings.dbHost || envSettings.dbHost.length < 1) {
      setSnackbar({ open: true, severity: "error", msg: "Database host is required" });
      return;
    }

    if (envSettings.dbPort && (isNaN(envSettings.dbPort) || envSettings.dbPort < 1 || envSettings.dbPort > 65535)) {
      setSnackbar({ open: true, severity: "error", msg: "Database port must be between 1 and 65535" });
      return;
    }

    if (envSettings.appMode === 'production' && envSettings.appDebug) {
      setSnackbar({ open: true, severity: "warning", msg: "Warning: Debug mode should be disabled in production" });
    }

    try {
      setSaving(true);
      const response = await axios.post(`${API_BASE_URL}/system-settings`, envSettings);
      
      setSnackbar({ open: true, severity: "success", msg: "Environment settings saved successfully!" });
    } catch (err) {
      console.error("Error saving settings:", err);
      setSnackbar({ open: true, severity: "error", msg: "Failed to save settings" });
    } finally {
      setSaving(false);
    }
  };

  // Handle reset
  const handleReset = () => {
    setEnvSettings({
      appName: 'APNA DECORATION',
      appDebug: false,
      appMode: 'production',
      appUrl: 'https://apnadecoration.com',
      dbConnection: 'mongodb',
      dbHost: 'localhost',
      dbPort: '27017',
      dbDatabase: 'apna_decoration',
      dbUsername: '',
      dbPassword: '',
      buyerUsername: '',
      purchaseCode: ''
    });
    setSnackbar({ open: true, severity: "info", msg: "Settings reset to defaults" });
  };

  return (
    <Box sx={{ p: 3 }}>
      {/* Header */}
      <Box sx={{ mb: 3 }}>
        <Typography variant="h4" sx={{ fontWeight: 600, mb: 1 }}>
          System Setup
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Configure system-wide settings and environment variables
        </Typography>
      </Box>

      {/* Navigation Tabs */}
      <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}>
        <Tabs value={activeTab} onChange={handleTabChange}>
          <Tab label="Environment Settings" />
          <Tab label="App Settings" />
          <Tab label="Software Update" />
          <Tab label="Language" />
          <Tab label="Currency" />
          <Tab label="Cookies" />
          <Tab label="Clean Database" />
        </Tabs>
      </Box>

      {/* Environment Settings Tab */}
      {activeTab === 0 && (
        <Card sx={{ borderRadius: 2, boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }}>
          <CardContent sx={{ p: 4 }}>
            {/* Section Header */}
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 4 }}>
              <SettingsIcon sx={{ fontSize: 28, color: '#1976d2', mr: 2 }} />
              <Typography variant="h6" sx={{ fontWeight: 600 }}>
                Environment Information
              </Typography>
            </Box>

            {/* Two-Column Grid Layout */}
            <Grid container spacing={3}>
              {/* App Configuration */}
              <Grid item xs={12}>
                <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 2, color: '#666' }}>
                  Application Configuration
                </Typography>
              </Grid>
              
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="App Name"
                  value={envSettings.appName}
                  onChange={handleInputChange('appName')}
                  placeholder="Enter application name"
                  sx={{ mb: 2 }}
                />
              </Grid>

              <Grid item xs={12} md={6}>
                <FormControl fullWidth sx={{ mb: 2 }}>
                  <InputLabel>App Debug</InputLabel>
                  <Select
                    value={envSettings.appDebug ? 'true' : 'false'}
                    onChange={(e) => handleInputChange('appDebug')({ target: { value: e.target.value === 'true' } })}
                    label="App Debug"
                  >
                    <MenuItem value="true">Enabled</MenuItem>
                    <MenuItem value="false">Disabled</MenuItem>
                  </Select>
                </FormControl>
              </Grid>

              <Grid item xs={12} md={6}>
                <FormControl fullWidth sx={{ mb: 2 }}>
                  <InputLabel>App Mode</InputLabel>
                  <Select
                    value={envSettings.appMode}
                    onChange={handleInputChange('appMode')}
                    label="App Mode"
                  >
                    <MenuItem value="production">Production</MenuItem>
                    <MenuItem value="live">Live</MenuItem>
                    <MenuItem value="testing">Testing</MenuItem>
                    <MenuItem value="local">Local</MenuItem>
                  </Select>
                </FormControl>
              </Grid>

              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="App URL"
                  value={envSettings.appUrl}
                  onChange={handleInputChange('appUrl')}
                  placeholder="https://yourapp.com"
                  sx={{ mb: 2 }}
                />
              </Grid>

              {/* Database Configuration */}
              <Grid item xs={12}>
                <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 2, mt: 3, color: '#666' }}>
                  Database Configuration
                </Typography>
              </Grid>

              <Grid item xs={12} md={6}>
                <FormControl fullWidth sx={{ mb: 2 }}>
                  <InputLabel>DB Connection</InputLabel>
                  <Select
                    value={envSettings.dbConnection}
                    onChange={handleInputChange('dbConnection')}
                    label="DB Connection"
                  >
                    <MenuItem value="mysql">MySQL</MenuItem>
                    <MenuItem value="pgsql">PostgreSQL</MenuItem>
                    <MenuItem value="sqlite">SQLite</MenuItem>
                    <MenuItem value="sqlsrv">SQL Server</MenuItem>
                  </Select>
                </FormControl>
              </Grid>

              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="DB Host"
                  value={envSettings.dbHost}
                  onChange={handleInputChange('dbHost')}
                  placeholder="localhost"
                  sx={{ mb: 2 }}
                />
              </Grid>

              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="DB Port"
                  value={envSettings.dbPort}
                  onChange={handleInputChange('dbPort')}
                  placeholder="3306"
                  sx={{ mb: 2 }}
                />
              </Grid>

              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="DB Database"
                  value={envSettings.dbDatabase}
                  onChange={handleInputChange('dbDatabase')}
                  placeholder="database_name"
                  sx={{ mb: 2 }}
                />
              </Grid>

              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="DB Username"
                  value={envSettings.dbUsername}
                  onChange={handleInputChange('dbUsername')}
                  placeholder="username"
                  sx={{ mb: 2 }}
                />
              </Grid>

              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="DB Password"
                  type="password"
                  value={envSettings.dbPassword}
                  onChange={handleInputChange('dbPassword')}
                  placeholder="Enter database password"
                  sx={{ mb: 2 }}
                />
              </Grid>

              {/* License Details */}
              <Grid item xs={12}>
                <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 2, mt: 3, color: '#666' }}>
                  License Details
                </Typography>
              </Grid>

              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Buyer Username"
                  value={envSettings.buyerUsername}
                  onChange={handleInputChange('buyerUsername')}
                  placeholder="Enter buyer username"
                  sx={{ mb: 2 }}
                />
              </Grid>

              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Purchase Code"
                  value={envSettings.purchaseCode}
                  onChange={handleInputChange('purchaseCode')}
                  placeholder="Enter purchase code"
                  sx={{ mb: 2 }}
                />
              </Grid>
            </Grid>

            {/* Action Buttons */}
            <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 2, mt: 4, pt: 3, borderTop: '1px solid #e0e0e0' }}>
              <Button
                variant="outlined"
                onClick={handleReset}
                disabled={saving}
                startIcon={<RestartAltIcon />}
                sx={{ borderRadius: 2 }}
              >
                Reset
              </Button>
              <Button
                variant="contained"
                onClick={handleSubmit}
                disabled={saving}
                startIcon={saving ? <CircularProgress size={18} /> : <SaveIcon />}
                sx={{ 
                  backgroundColor: '#1976d2',
                  '&:hover': { backgroundColor: '#1565c0' },
                  borderRadius: 2
                }}
              >
                {saving ? "Saving..." : "Submit"}
              </Button>
            </Box>
          </CardContent>
        </Card>
      )}

      {/* App Settings Tab */}
      {activeTab === 1 && (
        <Box>
          {/* User App Version Control */}
          <Card sx={{ borderRadius: 2, boxShadow: '0 2px 8px rgba(0,0,0,0.1)', mb: 4 }}>
            <CardContent sx={{ p: 4 }}>
              <Typography variant="h6" sx={{ fontWeight: 600, mb: 3 }}>
                User App Version Control
              </Typography>
              
              <Grid container spacing={4}>
                {/* Android Section */}
                <Grid item xs={12} md={6}>
                  <Box sx={{ 
                    border: '1px solid #e0e0e0', 
                    borderRadius: 2, 
                    p: 3,
                    height: '100%'
                  }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
                      <AndroidIcon sx={{ fontSize: 32, color: '#3ddc84', mr: 2 }} />
                      <Typography variant="h6" sx={{ fontWeight: 600 }}>
                        For Android
                      </Typography>
                      <Tooltip title="Enter minimum version required for Android app to run">
                        <IconButton size="small" sx={{ ml: 1 }}>
                          <InfoIcon fontSize="small" color="action" />
                        </IconButton>
                      </Tooltip>
                    </Box>
                    
                    <TextField
                      fullWidth
                      label="Minimum App Version"
                      value={versionControl.customer.android.minVersion}
                      onChange={handleVersionChange('customer', 'android', 'minVersion')}
                      placeholder="1.0.0"
                      helperText="Format: x.y or x.y.z (e.g., 1.2.3)"
                      sx={{ mb: 3 }}
                    />
                    
                    <TextField
                      fullWidth
                      label="Download URL"
                      value={versionControl.customer.android.downloadUrl}
                      onChange={handleVersionChange('customer', 'android', 'downloadUrl')}
                      placeholder="https://play.google.com/store/apps/details?id=..."
                      helperText="Google Play Store download URL"
                      sx={{ mb: 3 }}
                    />
                    
                    <Box sx={{ display: 'flex', gap: 2, justifyContent: 'flex-end' }}>
                      <Button
                        variant="outlined"
                        onClick={() => handleVersionReset('customer', 'android')}
                        disabled={saving}
                        startIcon={<RestartAltIcon />}
                        size="small"
                      >
                        Reset
                      </Button>
                      <Button
                        variant="contained"
                        onClick={() => handleVersionSave('customer', 'android')}
                        disabled={saving}
                        startIcon={saving ? <CircularProgress size={16} /> : <SaveIcon />}
                        size="small"
                        sx={{ backgroundColor: '#3ddc84', '&:hover': { backgroundColor: '#2ecc71' } }}
                      >
                        {saving ? "Saving..." : "Save"}
                      </Button>
                    </Box>
                  </Box>
                </Grid>

                {/* iOS Section */}
                <Grid item xs={12} md={6}>
                  <Box sx={{ 
                    border: '1px solid #e0e0e0', 
                    borderRadius: 2, 
                    p: 3,
                    height: '100%'
                  }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
                      <AppleIcon sx={{ fontSize: 32, color: '#000000', mr: 2 }} />
                      <Typography variant="h6" sx={{ fontWeight: 600 }}>
                        For iOS
                      </Typography>
                      <Tooltip title="Enter minimum version required for iOS app to run">
                        <IconButton size="small" sx={{ ml: 1 }}>
                          <InfoIcon fontSize="small" color="action" />
                        </IconButton>
                      </Tooltip>
                    </Box>
                    
                    <TextField
                      fullWidth
                      label="Minimum App Version"
                      value={versionControl.customer.ios.minVersion}
                      onChange={handleVersionChange('customer', 'ios', 'minVersion')}
                      placeholder="1.0.0"
                      helperText="Format: x.y or x.y.z (e.g., 1.2.3)"
                      sx={{ mb: 3 }}
                    />
                    
                    <TextField
                      fullWidth
                      label="Download URL"
                      value={versionControl.customer.ios.downloadUrl}
                      onChange={handleVersionChange('customer', 'ios', 'downloadUrl')}
                      placeholder="https://apps.apple.com/app/..."
                      helperText="App Store download URL"
                      sx={{ mb: 3 }}
                    />
                    
                    <Box sx={{ display: 'flex', gap: 2, justifyContent: 'flex-end' }}>
                      <Button
                        variant="outlined"
                        onClick={() => handleVersionReset('customer', 'ios')}
                        disabled={saving}
                        startIcon={<RestartAltIcon />}
                        size="small"
                      >
                        Reset
                      </Button>
                      <Button
                        variant="contained"
                        onClick={() => handleVersionSave('customer', 'ios')}
                        disabled={saving}
                        startIcon={saving ? <CircularProgress size={16} /> : <SaveIcon />}
                        size="small"
                        sx={{ backgroundColor: '#000000', '&:hover': { backgroundColor: '#333333' } }}
                      >
                        {saving ? "Saving..." : "Save"}
                      </Button>
                    </Box>
                  </Box>
                </Grid>
              </Grid>
            </CardContent>
          </Card>

          {/* Vendor App Version Control */}
          <Card sx={{ borderRadius: 2, boxShadow: '0 2px 8px rgba(0,0,0,0.1)', mb: 4 }}>
            <CardContent sx={{ p: 4 }}>
              <Typography variant="h6" sx={{ fontWeight: 600, mb: 3 }}>
                Vendor App Version Control
              </Typography>
              
              <Grid container spacing={4}>
                {/* Android Section */}
                <Grid item xs={12} md={6}>
                  <Box sx={{ 
                    border: '1px solid #e0e0e0', 
                    borderRadius: 2, 
                    p: 3,
                    height: '100%'
                  }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
                      <AndroidIcon sx={{ fontSize: 32, color: '#3ddc84', mr: 2 }} />
                      <Typography variant="h6" sx={{ fontWeight: 600 }}>
                        For Android
                      </Typography>
                      <Tooltip title="Enter minimum version required for Android app to run">
                        <IconButton size="small" sx={{ ml: 1 }}>
                          <InfoIcon fontSize="small" color="action" />
                        </IconButton>
                      </Tooltip>
                    </Box>
                    
                    <TextField
                      fullWidth
                      label="Minimum App Version"
                      value={versionControl.vendor.android.minVersion}
                      onChange={handleVersionChange('vendor', 'android', 'minVersion')}
                      placeholder="1.0.0"
                      helperText="Format: x.y or x.y.z (e.g., 1.2.3)"
                      sx={{ mb: 3 }}
                    />
                    
                    <TextField
                      fullWidth
                      label="Download URL"
                      value={versionControl.vendor.android.downloadUrl}
                      onChange={handleVersionChange('vendor', 'android', 'downloadUrl')}
                      placeholder="https://play.google.com/store/apps/details?id=..."
                      helperText="Google Play Store download URL"
                      sx={{ mb: 3 }}
                    />
                    
                    <Box sx={{ display: 'flex', gap: 2, justifyContent: 'flex-end' }}>
                      <Button
                        variant="outlined"
                        onClick={() => handleVersionReset('vendor', 'android')}
                        disabled={saving}
                        startIcon={<RestartAltIcon />}
                        size="small"
                      >
                        Reset
                      </Button>
                      <Button
                        variant="contained"
                        onClick={() => handleVersionSave('vendor', 'android')}
                        disabled={saving}
                        startIcon={saving ? <CircularProgress size={16} /> : <SaveIcon />}
                        size="small"
                        sx={{ backgroundColor: '#3ddc84', '&:hover': { backgroundColor: '#2ecc71' } }}
                      >
                        {saving ? "Saving..." : "Save"}
                      </Button>
                    </Box>
                  </Box>
                </Grid>

                {/* iOS Section */}
                <Grid item xs={12} md={6}>
                  <Box sx={{ 
                    border: '1px solid #e0e0e0', 
                    borderRadius: 2, 
                    p: 3,
                    height: '100%'
                  }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
                      <AppleIcon sx={{ fontSize: 32, color: '#000000', mr: 2 }} />
                      <Typography variant="h6" sx={{ fontWeight: 600 }}>
                        For iOS
                      </Typography>
                      <Tooltip title="Enter minimum version required for iOS app to run">
                        <IconButton size="small" sx={{ ml: 1 }}>
                          <InfoIcon fontSize="small" color="action" />
                        </IconButton>
                      </Tooltip>
                    </Box>
                    
                    <TextField
                      fullWidth
                      label="Minimum App Version"
                      value={versionControl.vendor.ios.minVersion}
                      onChange={handleVersionChange('vendor', 'ios', 'minVersion')}
                      placeholder="1.0.0"
                      helperText="Format: x.y or x.y.z (e.g., 1.2.3)"
                      sx={{ mb: 3 }}
                    />
                    
                    <TextField
                      fullWidth
                      label="Download URL"
                      value={versionControl.vendor.ios.downloadUrl}
                      onChange={handleVersionChange('vendor', 'ios', 'downloadUrl')}
                      placeholder="https://apps.apple.com/app/..."
                      helperText="App Store download URL"
                      sx={{ mb: 3 }}
                    />
                    
                    <Box sx={{ display: 'flex', gap: 2, justifyContent: 'flex-end' }}>
                      <Button
                        variant="outlined"
                        onClick={() => handleVersionReset('vendor', 'ios')}
                        disabled={saving}
                        startIcon={<RestartAltIcon />}
                        size="small"
                      >
                        Reset
                      </Button>
                      <Button
                        variant="contained"
                        onClick={() => handleVersionSave('vendor', 'ios')}
                        disabled={saving}
                        startIcon={saving ? <CircularProgress size={16} /> : <SaveIcon />}
                        size="small"
                        sx={{ backgroundColor: '#000000', '&:hover': { backgroundColor: '#333333' } }}
                      >
                        {saving ? "Saving..." : "Save"}
                      </Button>
                    </Box>
                  </Box>
                </Grid>
              </Grid>
            </CardContent>
          </Card>

          {/* Deliveryman App Version Control */}
          <Card sx={{ borderRadius: 2, boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }}>
            <CardContent sx={{ p: 4 }}>
              <Typography variant="h6" sx={{ fontWeight: 600, mb: 3 }}>
                Deliveryman App Version Control
              </Typography>
              
              <Grid container spacing={4}>
                {/* Android Section */}
                <Grid item xs={12} md={6}>
                  <Box sx={{ 
                    border: '1px solid #e0e0e0', 
                    borderRadius: 2, 
                    p: 3,
                    height: '100%'
                  }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
                      <AndroidIcon sx={{ fontSize: 32, color: '#3ddc84', mr: 2 }} />
                      <Typography variant="h6" sx={{ fontWeight: 600 }}>
                        For Android
                      </Typography>
                      <Tooltip title="Enter minimum version required for Android app to run">
                        <IconButton size="small" sx={{ ml: 1 }}>
                          <InfoIcon fontSize="small" color="action" />
                        </IconButton>
                      </Tooltip>
                    </Box>
                    
                    <TextField
                      fullWidth
                      label="Minimum App Version"
                      value={versionControl.deliveryman.android.minVersion}
                      onChange={handleVersionChange('deliveryman', 'android', 'minVersion')}
                      placeholder="1.0.0"
                      helperText="Format: x.y or x.y.z (e.g., 1.2.3)"
                      sx={{ mb: 3 }}
                    />
                    
                    <TextField
                      fullWidth
                      label="Download URL"
                      value={versionControl.deliveryman.android.downloadUrl}
                      onChange={handleVersionChange('deliveryman', 'android', 'downloadUrl')}
                      placeholder="https://play.google.com/store/apps/details?id=..."
                      helperText="Google Play Store download URL"
                      sx={{ mb: 3 }}
                    />
                    
                    <Box sx={{ display: 'flex', gap: 2, justifyContent: 'flex-end' }}>
                      <Button
                        variant="outlined"
                        onClick={() => handleVersionReset('deliveryman', 'android')}
                        disabled={saving}
                        startIcon={<RestartAltIcon />}
                        size="small"
                      >
                        Reset
                      </Button>
                      <Button
                        variant="contained"
                        onClick={() => handleVersionSave('deliveryman', 'android')}
                        disabled={saving}
                        startIcon={saving ? <CircularProgress size={16} /> : <SaveIcon />}
                        size="small"
                        sx={{ backgroundColor: '#3ddc84', '&:hover': { backgroundColor: '#2ecc71' } }}
                      >
                        {saving ? "Saving..." : "Save"}
                      </Button>
                    </Box>
                  </Box>
                </Grid>

                {/* iOS Section */}
                <Grid item xs={12} md={6}>
                  <Box sx={{ 
                    border: '1px solid #e0e0e0', 
                    borderRadius: 2, 
                    p: 3,
                    height: '100%'
                  }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
                      <AppleIcon sx={{ fontSize: 32, color: '#000000', mr: 2 }} />
                      <Typography variant="h6" sx={{ fontWeight: 600 }}>
                        For iOS
                      </Typography>
                      <Tooltip title="Enter minimum version required for iOS app to run">
                        <IconButton size="small" sx={{ ml: 1 }}>
                          <InfoIcon fontSize="small" color="action" />
                        </IconButton>
                      </Tooltip>
                    </Box>
                    
                    <TextField
                      fullWidth
                      label="Minimum App Version"
                      value={versionControl.deliveryman.ios.minVersion}
                      onChange={handleVersionChange('deliveryman', 'ios', 'minVersion')}
                      placeholder="1.0.0"
                      helperText="Format: x.y or x.y.z (e.g., 1.2.3)"
                      sx={{ mb: 3 }}
                    />
                    
                    <TextField
                      fullWidth
                      label="Download URL"
                      value={versionControl.deliveryman.ios.downloadUrl}
                      onChange={handleVersionChange('deliveryman', 'ios', 'downloadUrl')}
                      placeholder="https://apps.apple.com/app/..."
                      helperText="App Store download URL"
                      sx={{ mb: 3 }}
                    />
                    
                    <Box sx={{ display: 'flex', gap: 2, justifyContent: 'flex-end' }}>
                      <Button
                        variant="outlined"
                        onClick={() => handleVersionReset('deliveryman', 'ios')}
                        disabled={saving}
                        startIcon={<RestartAltIcon />}
                        size="small"
                      >
                        Reset
                      </Button>
                      <Button
                        variant="contained"
                        onClick={() => handleVersionSave('deliveryman', 'ios')}
                        disabled={saving}
                        startIcon={saving ? <CircularProgress size={16} /> : <SaveIcon />}
                        size="small"
                        sx={{ backgroundColor: '#000000', '&:hover': { backgroundColor: '#333333' } }}
                      >
                        {saving ? "Saving..." : "Save"}
                      </Button>
                    </Box>
                  </Box>
                </Grid>
              </Grid>
            </CardContent>
          </Card>
        </Box>
      )}

      {/* Software Update Tab */}
      {activeTab === 2 && (
        <Card sx={{ borderRadius: 2, boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }}>
          <CardContent sx={{ p: 4 }}>
            {/* Header */}
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 4 }}>
              <SettingsIcon sx={{ fontSize: 28, color: '#1976d2', mr: 2 }} />
              <Typography variant="h6" sx={{ fontWeight: 600 }}>
                Upload The Updated File
              </Typography>
              <Tooltip title="Upload updated software files for CodeCanyon purchases. Verify your purchase code and upload the new version.">
                <IconButton size="small" sx={{ ml: 1 }}>
                  <InfoIcon fontSize="small" color="action" />
                </IconButton>
              </Tooltip>
            </Box>

            {/* Two-Column Layout for Verification Inputs */}
            <Grid container spacing={3} sx={{ mb: 4 }}>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="CodeCanyon Username"
                  value={uploadData.username}
                  onChange={handleUploadChange('username')}
                  placeholder="Enter your CodeCanyon username"
                  helperText="Your CodeCanyon account username"
                  sx={{ 
                    '& .MuiOutlinedInput-root': {
                      borderRadius: 2,
                      '&:hover': {
                        borderColor: '#1976d2'
                      }
                    }
                  }}
                />
              </Grid>

              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Purchase Code"
                  value={uploadData.purchaseCode}
                  onChange={handleUploadChange('purchaseCode')}
                  placeholder="xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx"
                  helperText="Format: xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx"
                  sx={{ 
                    '& .MuiOutlinedInput-root': {
                      borderRadius: 2,
                      '&:hover': {
                        borderColor: '#1976d2'
                      }
                    }
                  }}
                />
              </Grid>
            </Grid>

            {/* File Upload Section */}
            <Grid container spacing={3} sx={{ mb: 4 }}>
              <Grid item xs={12}>
                <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 2, color: '#666' }}>
                  File Selection
                </Typography>
                <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
                  <TextField
                    fullWidth
                    label="Choose Updated File"
                    value={uploadData.file ? uploadData.file.name : ''}
                    placeholder="No file selected"
                    helperText="Supported formats: ZIP, RAR (Max size: 50MB)"
                    InputProps={{
                      readOnly: true,
                      sx: {
                        borderRadius: 2,
                        backgroundColor: '#f8f9fa'
                      }
                    }}
                  />
                  <Button
                    variant="outlined"
                    onClick={handleFileBrowse}
                    sx={{ 
                      borderRadius: 2,
                      minWidth: '120px',
                      borderColor: '#1976d2',
                      color: '#1976d2',
                      '&:hover': {
                        borderColor: '#1565c0',
                        backgroundColor: 'rgba(25, 118, 210, 0.04)'
                      }
                    }}
                  >
                    Browse
                  </Button>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept=".zip,.rar"
                    onChange={handleUploadChange('file')}
                    style={{ display: 'none' }}
                  />
                </Box>
              </Grid>
            </Grid>

            {/* File Information */}
            {uploadData.file && (
              <Box sx={{ 
                backgroundColor: '#e3f2fd', 
                border: '1px solid #90caf9', 
                borderRadius: 2, 
                p: 2, 
                mb: 4 
              }}>
                <Typography variant="body2" sx={{ color: '#1565c0' }}>
                  <strong>Selected File:</strong> {uploadData.file.name} ({(uploadData.file.size / 1024 / 1024).toFixed(2)} MB)
                </Typography>
              </Box>
            )}

            {/* Action Buttons */}
            <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 2, pt: 3, borderTop: '1px solid #e0e0e0' }}>
              <Button
                variant="outlined"
                onClick={handleUploadReset}
                disabled={saving}
                startIcon={<RestartAltIcon />}
                sx={{ borderRadius: 2 }}
              >
                Reset
              </Button>
              <Button
                variant="contained"
                onClick={handleSoftwareUpload}
                disabled={saving}
                startIcon={saving ? <CircularProgress size={18} /> : <SaveIcon />}
                sx={{ 
                  backgroundColor: '#1976d2',
                  '&:hover': { backgroundColor: '#1565c0' },
                  borderRadius: 2
                }}
              >
                {saving ? "Uploading..." : "Upload & Update"}
              </Button>
            </Box>
          </CardContent>
        </Card>
      )}

      {/* Language Tab */}
      {activeTab === 3 && (
        <Card sx={{ borderRadius: 2, boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }}>
          <CardContent sx={{ p: 4 }}>
            {/* Header */}
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <Typography variant="h6" sx={{ fontWeight: 600 }}>
                  Language Table
                </Typography>
                <Tooltip title="Manage system languages, set default language, and control language availability">
                  <IconButton size="small" sx={{ ml: 1 }}>
                    <InfoIcon fontSize="small" color="action" />
                  </IconButton>
                </Tooltip>
              </Box>
              <Button
                variant="contained"
                startIcon={<AddIcon />}
                onClick={handleAddLanguage}
                sx={{ 
                  backgroundColor: '#1976d2',
                  '&:hover': { backgroundColor: '#1565c0' },
                  borderRadius: 2
                }}
              >
                + Add new language
              </Button>
            </Box>

            {/* Language Table */}
            <TableContainer sx={{ 
              border: '1px solid #e0e0e0', 
              borderRadius: 1,
              overflow: 'hidden'
            }}>
              <Table>
                <TableHead sx={{ backgroundColor: '#f5f5f5' }}>
                  <TableRow>
                    <TableCell sx={{ fontWeight: 600, fontSize: '14px' }}>SL</TableCell>
                    <TableCell sx={{ fontWeight: 600, fontSize: '14px' }}>ID</TableCell>
                    <TableCell sx={{ fontWeight: 600, fontSize: '14px' }}>Name</TableCell>
                    <TableCell sx={{ fontWeight: 600, fontSize: '14px' }}>Code</TableCell>
                    <TableCell sx={{ fontWeight: 600, fontSize: '14px', textAlign: 'center' }}>Status</TableCell>
                    <TableCell sx={{ fontWeight: 600, fontSize: '14px', textAlign: 'center' }}>Default Status</TableCell>
                    <TableCell sx={{ fontWeight: 600, fontSize: '14px', textAlign: 'center' }}>Action</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {languages.map((language, index) => (
                    <TableRow key={language.id} sx={{ '&:hover': { backgroundColor: '#f9f9f9' } }}>
                      <TableCell sx={{ fontSize: '14px' }}>{index + 1}</TableCell>
                      <TableCell sx={{ fontSize: '14px' }}>{language.id}</TableCell>
                      <TableCell sx={{ fontSize: '14px' }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <Typography variant="body2">{language.name}</Typography>
                          {language.code === 'en' && (
                            <Chip 
                              label="Default" 
                              size="small" 
                              color="primary" 
                              sx={{ fontSize: '11px', height: '20px' }}
                            />
                          )}
                        </Box>
                      </TableCell>
                      <TableCell sx={{ fontSize: '14px' }}>
                        <Chip 
                          label={language.code.toUpperCase()} 
                          size="small" 
                          variant="outlined"
                          sx={{ fontSize: '11px', fontWeight: 500 }}
                        />
                      </TableCell>
                      <TableCell sx={{ textAlign: 'center' }}>
                        <Switch
                          checked={language.status}
                          onChange={() => handleLanguageStatusToggle(language.id)}
                          color="primary"
                          size="small"
                        />
                      </TableCell>
                      <TableCell sx={{ textAlign: 'center' }}>
                        <Switch
                          checked={language.defaultStatus}
                          onChange={() => handleDefaultLanguageToggle(language.id)}
                          color="primary"
                          size="small"
                        />
                      </TableCell>
                      <TableCell sx={{ textAlign: 'center' }}>
                        <IconButton
                          size="small"
                          onClick={(e) => handleLanguageMenuClick(e, language)}
                          sx={{ color: '#666' }}
                        >
                          <MoreVertIcon fontSize="small" />
                        </IconButton>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>

            {/* Language Action Menu */}
            <Menu
              anchorEl={languageMenuAnchor}
              open={Boolean(languageMenuAnchor)}
              onClose={handleLanguageMenuClose}
              PaperProps={{
                sx: {
                  boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
                  borderRadius: 1,
                  minWidth: '180px'
                }
              }}
            >
              <MenuItem onClick={handleViewLanguage}>
                <ListItemIcon>
                  <VisibilityIcon fontSize="small" />
                </ListItemIcon>
                <ListItemText>View Details</ListItemText>
              </MenuItem>
              <MenuItem onClick={handleEditLanguage}>
                <ListItemIcon>
                  <EditIcon fontSize="small" />
                </ListItemIcon>
                <ListItemText>Edit</ListItemText>
              </MenuItem>
              <MenuItem 
                onClick={handleDeleteLanguage}
                sx={{ color: '#d32f2f' }}
                disabled={selectedLanguage?.code === 'en'}
              >
                <ListItemIcon>
                  <DeleteIcon fontSize="small" sx={{ color: '#d32f2f' }} />
                </ListItemIcon>
                <ListItemText>Delete</ListItemText>
              </MenuItem>
            </Menu>

            {/* Empty State */}
            {languages.length === 0 && (
              <Box sx={{ 
                textAlign: 'center', 
                py: 8, 
                border: '2px dashed #e0e0e0', 
                borderRadius: 2,
                backgroundColor: '#fafafa'
              }}>
                <Typography variant="h6" color="text.secondary" sx={{ mb: 1 }}>
                  No languages configured
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                  Add your first language to get started
                </Typography>
                <Button
                  variant="contained"
                  startIcon={<AddIcon />}
                  onClick={handleAddLanguage}
                  sx={{ backgroundColor: '#1976d2' }}
                >
                  Add Language
                </Button>
              </Box>
            )}
          </CardContent>
        </Card>
      )}

      {/* Add Language Modal */}
      <Dialog
        open={addLanguageModal.open}
        onClose={handleModalClose}
        maxWidth="sm"
        fullWidth
        PaperProps={{
          sx: {
            borderRadius: 2,
            boxShadow: '0 8px 32px rgba(0,0,0,0.12)'
          }
        }}
      >
        <DialogTitle sx={{ pb: 2 }}>
          <Typography variant="h6" sx={{ fontWeight: 600 }}>
            Add New Language
          </Typography>
        </DialogTitle>
        
        <DialogContent sx={{ pt: 1, pb: 2 }}>
  <Grid container spacing={3}>
    <Grid item xs={12}>
      <TextField
        fullWidth
        label="Language"
        value={addLanguageModal.language}
        onChange={handleModalChange('language')}
        placeholder="Spanish"
        sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
      />
    </Grid>
    
    <Grid item xs={12}>
      <FormControl fullWidth>
        <InputLabel>Country Code</InputLabel>
        <Select
          value={addLanguageModal.country}
          onChange={handleModalChange('country')}
          label="Country Code"
          sx={{ borderRadius: 2 }}
        >
          <MenuItem value="AD">AD</MenuItem>
          <MenuItem value="AE">AE</MenuItem>
          <MenuItem value="AF">AF</MenuItem>
          <MenuItem value="AL">AL</MenuItem>
          <MenuItem value="DZ">DZ</MenuItem>
          {/* Add more countries as needed */}
        </Select>
      </FormControl>
    </Grid>
    
    <Grid item xs={12}>
      <FormControl fullWidth>
        <InputLabel>Direction</InputLabel>
        <Select
          value={addLanguageModal.direction}
          onChange={handleModalChange('direction')}
          label="Direction"
          sx={{ borderRadius: 2 }}
        >
          <MenuItem value="ltr">LTR</MenuItem>
          <MenuItem value="rtl">RTL</MenuItem>
        </Select>
      </FormControl>
    </Grid>
  </Grid>
</DialogContent>
        
        <DialogActions sx={{ px: 3, pb: 3 }}>
          <Button
            onClick={handleModalClose}
            variant="outlined"
            sx={{ borderRadius: 2 }}
          >
            Cancel
          </Button>
          <Button
            onClick={handleSaveLanguage}
            variant="contained"
            sx={{ 
              backgroundColor: '#1976d2',
              '&:hover': { backgroundColor: '#1565c0' },
              borderRadius: 2
            }}
          >
            Add Language
          </Button>
        </DialogActions>
      </Dialog>

      {/* Currency Tab */}
      {activeTab === 4 && (
        <CurrencyManagement />
      )}

      {/* Cookies Tab */}
      {activeTab === 5 && (
        <Card sx={{ borderRadius: 2, boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }}>
          <CardContent sx={{ p: 4 }}>
            {/* Section Header */}
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 4 }}>
              <SettingsIcon sx={{ fontSize: 28, color: '#1976d2', mr: 2 }} />
              <Typography variant="h6" sx={{ fontWeight: 600 }}>
                Cookie Settings
              </Typography>
            </Box>

            <Grid container spacing={4}>
              {/* Cookie Types */}
              <Grid item xs={12} md={6}>
                <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 3, color: '#666' }}>
                  Cookie Categories
                </Typography>
                
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', p: 2, border: '1px solid #e0e0e0', borderRadius: 1 }}>
                    <Box>
                      <Typography variant="body2" sx={{ fontWeight: 500 }}>Essential Cookies</Typography>
                      <Typography variant="caption" color="text.secondary">Required for the site to function</Typography>
                    </Box>
                    <Switch
                      checked={cookieSettings.essentialCookies}
                      onChange={handleCookieChange('essentialCookies')}
                      disabled
                      size="small"
                    />
                  </Box>

                  <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', p: 2, border: '1px solid #e0e0e0', borderRadius: 1 }}>
                    <Box>
                      <Typography variant="body2" sx={{ fontWeight: 500 }}>Analytics Cookies</Typography>
                      <Typography variant="caption" color="text.secondary">Help us improve the website</Typography>
                    </Box>
                    <Switch
                      checked={cookieSettings.analyticsCookies}
                      onChange={handleCookieChange('analyticsCookies')}
                      size="small"
                    />
                  </Box>

                  <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', p: 2, border: '1px solid #e0e0e0', borderRadius: 1 }}>
                    <Box>
                      <Typography variant="body2" sx={{ fontWeight: 500 }}>Marketing Cookies</Typography>
                      <Typography variant="caption" color="text.secondary">Used for advertising purposes</Typography>
                    </Box>
                    <Switch
                      checked={cookieSettings.marketingCookies}
                      onChange={handleCookieChange('marketingCookies')}
                      size="small"
                    />
                  </Box>

                  <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', p: 2, border: '1px solid #e0e0e0', borderRadius: 1 }}>
                    <Box>
                      <Typography variant="body2" sx={{ fontWeight: 500 }}>Functional Cookies</Typography>
                      <Typography variant="caption" color="text.secondary">Enhance functionality</Typography>
                    </Box>
                    <Switch
                      checked={cookieSettings.functionalCookies}
                      onChange={handleCookieChange('functionalCookies')}
                      size="small"
                    />
                  </Box>
                </Box>
              </Grid>

              {/* Cookie Banner Settings */}
              <Grid item xs={12} md={6}>
                <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 3, color: '#666' }}>
                  Cookie Banner Configuration
                </Typography>
                
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
                  <FormControlLabel
                    control={
                      <Switch
                        checked={cookieSettings.showCookieBanner}
                        onChange={handleCookieChange('showCookieBanner')}
                        size="small"
                      />
                    }
                    label="Show Cookie Banner"
                  />

                  <TextField
                    fullWidth
                    label="Cookie Policy URL"
                    value={cookieSettings.cookiePolicyUrl}
                    onChange={handleCookieChange('cookiePolicyUrl')}
                    placeholder="https://yourapp.com/cookie-policy"
                    size="small"
                  />

                  <TextField
                    fullWidth
                    label="Privacy Policy URL"
                    value={cookieSettings.privacyPolicyUrl}
                    onChange={handleCookieChange('privacyPolicyUrl')}
                    placeholder="https://yourapp.com/privacy-policy"
                    size="small"
                  />

                  <TextField
                    fullWidth
                    multiline
                    rows={3}
                    label="Cookie Consent Text"
                    value={cookieSettings.cookieConsentText}
                    onChange={handleCookieChange('cookieConsentText')}
                    placeholder="Enter cookie consent message"
                    size="small"
                  />

                  <Grid container spacing={2}>
                    <Grid item xs={4}>
                      <TextField
                        fullWidth
                        label="Accept Button Text"
                        value={cookieSettings.cookieConsentButtonText}
                        onChange={handleCookieChange('cookieConsentButtonText')}
                        size="small"
                      />
                    </Grid>
                    <Grid item xs={4}>
                      <TextField
                        fullWidth
                        label="Reject Button Text"
                        value={cookieSettings.cookieConsentRejectButtonText}
                        onChange={handleCookieChange('cookieConsentRejectButtonText')}
                        size="small"
                      />
                    </Grid>
                    <Grid item xs={4}>
                      <TextField
                        fullWidth
                        label="Customize Button Text"
                        value={cookieSettings.cookieConsentCustomizeButtonText}
                        onChange={handleCookieChange('cookieConsentCustomizeButtonText')}
                        size="small"
                      />
                    </Grid>
                  </Grid>
                </Box>
              </Grid>
            </Grid>

            {/* Action Buttons */}
            <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 2, mt: 4, pt: 3, borderTop: '1px solid #e0e0e0' }}>
              <Button
                variant="outlined"
                onClick={handleCookieReset}
                disabled={saving}
                startIcon={<RestartAltIcon />}
                sx={{ borderRadius: 2 }}
              >
                Reset
              </Button>
              <Button
                variant="contained"
                onClick={handleCookieSave}
                disabled={saving}
                startIcon={saving ? <CircularProgress size={18} /> : <SaveIcon />}
                sx={{ 
                  backgroundColor: '#1976d2',
                  '&:hover': { backgroundColor: '#1565c0' },
                  borderRadius: 2
                }}
              >
                {saving ? "Saving..." : "Save"}
              </Button>
            </Box>
          </CardContent>
        </Card>
      )}

      {/* Clean Database Tab */}
      {activeTab === 6 && (
        <Card sx={{ borderRadius: 2, boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }}>
          <CardContent sx={{ p: 4 }}>
            {/* Section Header */}
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 4 }}>
              <SettingsIcon sx={{ fontSize: 28, color: '#f44336', mr: 2 }} />
              <Typography variant="h6" sx={{ fontWeight: 600, color: '#f44336' }}>
                Clean Database
              </Typography>
            </Box>

            <Alert severity="warning" sx={{ mb: 4 }}>
              <Typography variant="body2">
                <strong>Warning:</strong> Database cleanup is a destructive action and cannot be undone. 
                Please review your selections carefully before proceeding.
              </Typography>
            </Alert>

            <Grid container spacing={4}>
              {/* Database Statistics */}
              <Grid item xs={12} md={4}>
                <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 3, color: '#666' }}>
                  Database Statistics
                </Typography>
                
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                  <Box sx={{ p: 2, border: '1px solid #e0e0e0', borderRadius: 1 }}>
                    <Typography variant="body2" color="text.secondary">Total Orders</Typography>
                    <Typography variant="h6" sx={{ fontWeight: 600 }}>{cleanupStats.totalOrders}</Typography>
                  </Box>
                  <Box sx={{ p: 2, border: '1px solid #e0e0e0', borderRadius: 1 }}>
                    <Typography variant="body2" color="text.secondary">Total Customers</Typography>
                    <Typography variant="h6" sx={{ fontWeight: 600 }}>{cleanupStats.totalCustomers}</Typography>
                  </Box>
                  <Box sx={{ p: 2, border: '1px solid #e0e0e0', borderRadius: 1 }}>
                    <Typography variant="body2" color="text.secondary">Total Products</Typography>
                    <Typography variant="h6" sx={{ fontWeight: 600 }}>{cleanupStats.totalProducts}</Typography>
                  </Box>
                  <Box sx={{ p: 2, border: '1px solid #e0e0e0', borderRadius: 1 }}>
                    <Typography variant="body2" color="text.secondary">Total Services</Typography>
                    <Typography variant="h6" sx={{ fontWeight: 600 }}>{cleanupStats.totalServices}</Typography>
                  </Box>
                  <Box sx={{ p: 2, border: '1px solid #e0e0e0', borderRadius: 1 }}>
                    <Typography variant="body2" color="text.secondary">Total Reviews</Typography>
                    <Typography variant="h6" sx={{ fontWeight: 600 }}>{cleanupStats.totalReviews}</Typography>
                  </Box>
                  <Button
                    variant="outlined"
                    onClick={loadCleanupStats}
                    disabled={loading}
                    startIcon={<RestartAltIcon />}
                    size="small"
                    sx={{ mt: 1 }}
                  >
                    Refresh Stats
                  </Button>
                </Box>
              </Grid>

              {/* Cleanup Options */}
              <Grid item xs={12} md={8}>
                <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 3, color: '#666' }}>
                  Cleanup Options
                </Typography>
                
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                    Select the data you want to remove from the database:
                  </Typography>

                  <Grid container spacing={2}>
                    <Grid item xs={6}>
                      <FormControlLabel
                        control={
                          <Switch
                            checked={cleanupOptions.clearOrders}
                            onChange={handleCleanupOptionChange('clearOrders')}
                            size="small"
                            color="error"
                          />
                        }
                        label="Clear Orders"
                      />
                    </Grid>
                    <Grid item xs={6}>
                      <FormControlLabel
                        control={
                          <Switch
                            checked={cleanupOptions.clearCustomers}
                            onChange={handleCleanupOptionChange('clearCustomers')}
                            size="small"
                            color="error"
                          />
                        }
                        label="Clear Customers"
                      />
                    </Grid>
                    <Grid item xs={6}>
                      <FormControlLabel
                        control={
                          <Switch
                            checked={cleanupOptions.clearProducts}
                            onChange={handleCleanupOptionChange('clearProducts')}
                            size="small"
                            color="error"
                          />
                        }
                        label="Clear Products"
                      />
                    </Grid>
                    <Grid item xs={6}>
                      <FormControlLabel
                        control={
                          <Switch
                            checked={cleanupOptions.clearServices}
                            onChange={handleCleanupOptionChange('clearServices')}
                            size="small"
                            color="error"
                          />
                        }
                        label="Clear Services"
                      />
                    </Grid>
                    <Grid item xs={6}>
                      <FormControlLabel
                        control={
                          <Switch
                            checked={cleanupOptions.clearCategories}
                            onChange={handleCleanupOptionChange('clearCategories')}
                            size="small"
                            color="error"
                          />
                        }
                        label="Clear Categories"
                      />
                    </Grid>
                    <Grid item xs={6}>
                      <FormControlLabel
                        control={
                          <Switch
                            checked={cleanupOptions.clearBanners}
                            onChange={handleCleanupOptionChange('clearBanners')}
                            size="small"
                            color="error"
                          />
                        }
                        label="Clear Banners"
                      />
                    </Grid>
                    <Grid item xs={6}>
                      <FormControlLabel
                        control={
                          <Switch
                            checked={cleanupOptions.clearNotifications}
                            onChange={handleCleanupOptionChange('clearNotifications')}
                            size="small"
                            color="error"
                          />
                        }
                        label="Clear Notifications"
                      />
                    </Grid>
                    <Grid item xs={6}>
                      <FormControlLabel
                        control={
                          <Switch
                            checked={cleanupOptions.clearReviews}
                            onChange={handleCleanupOptionChange('clearReviews')}
                            size="small"
                            color="error"
                          />
                        }
                        label="Clear Reviews"
                      />
                    </Grid>
                    <Grid item xs={6}>
                      <FormControlLabel
                        control={
                          <Switch
                            checked={cleanupOptions.clearWishlist}
                            onChange={handleCleanupOptionChange('clearWishlist')}
                            size="small"
                            color="error"
                          />
                        }
                        label="Clear Wishlist"
                      />
                    </Grid>
                    <Grid item xs={6}>
                      <FormControlLabel
                        control={
                          <Switch
                            checked={cleanupOptions.clearWallet}
                            onChange={handleCleanupOptionChange('clearWallet')}
                            size="small"
                            color="error"
                          />
                        }
                        label="Clear Wallet"
                      />
                    </Grid>
                    <Grid item xs={6}>
                      <FormControlLabel
                        control={
                          <Switch
                            checked={cleanupOptions.clearLoyaltyPoints}
                            onChange={handleCleanupOptionChange('clearLoyaltyPoints')}
                            size="small"
                            color="error"
                          />
                        }
                        label="Clear Loyalty Points"
                      />
                    </Grid>
                    <Grid item xs={6}>
                      <FormControlLabel
                        control={
                          <Switch
                            checked={cleanupOptions.clearWithdraws}
                            onChange={handleCleanupOptionChange('clearWithdraws')}
                            size="small"
                            color="error"
                          />
                        }
                        label="Clear Withdraws"
                      />
                    </Grid>
                  </Grid>

                  <Box sx={{ mt: 3, p: 2, bgcolor: '#f5f5f5', borderRadius: 1 }}>
                    <TextField
                      fullWidth
                      label="Delete records older than (days)"
                      type="number"
                      value={cleanupOptions.olderThanDays}
                      onChange={handleCleanupOptionChange('olderThanDays')}
                      size="small"
                      sx={{ mb: 2 }}
                      helperText="Only records older than this many days will be deleted"
                    />
                    
                    <FormControlLabel
                      control={
                        <Switch
                          checked={cleanupOptions.backupBeforeCleanup}
                          onChange={handleCleanupOptionChange('backupBeforeCleanup')}
                          size="small"
                          color="primary"
                        />
                      }
                      label="Create backup before cleanup (Recommended)"
                    />
                  </Box>
                </Box>
              </Grid>
            </Grid>

            {/* Action Buttons */}
            <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 2, mt: 4, pt: 3, borderTop: '1px solid #e0e0e0' }}>
              <Button
                variant="outlined"
                color="secondary"
                onClick={() => setCleanupOptions({
                  clearOrders: false,
                  clearCustomers: false,
                  clearProducts: false,
                  clearServices: false,
                  clearCategories: false,
                  clearBanners: false,
                  clearNotifications: false,
                  clearReviews: false,
                  clearWishlist: false,
                  clearWallet: false,
                  clearLoyaltyPoints: false,
                  clearWithdraws: false,
                  olderThanDays: 30,
                  backupBeforeCleanup: true
                })}
                disabled={cleanupLoading}
                sx={{ borderRadius: 2 }}
              >
                Clear Selection
              </Button>
              <Button
                variant="contained"
                color="error"
                onClick={handleDatabaseCleanup}
                disabled={cleanupLoading || !Object.keys(cleanupOptions).some(key => 
                  key !== 'olderThanDays' && key !== 'backupBeforeCleanup' && cleanupOptions[key]
                )}
                startIcon={cleanupLoading ? <CircularProgress size={18} /> : <DeleteIcon />}
                sx={{ 
                  borderRadius: 2
                }}
              >
                {cleanupLoading ? "Cleaning..." : "Clean Database"}
              </Button>
            </Box>
          </CardContent>
        </Card>
      )}

      {/* Snackbar for notifications */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={() => setSnackbar(prev => ({ ...prev, open: false }))}
        anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
      >
        <Alert
          onClose={() => setSnackbar(prev => ({ ...prev, open: false }))}
          severity={snackbar.severity}
          sx={{ width: '100%' }}
        >
          {snackbar.msg}
        </Alert>
      </Snackbar>
    </Box>
  );
}

export default SystemSettings;
