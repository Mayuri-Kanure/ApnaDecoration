import React, { useState, useEffect } from "react";
import axios from "axios";
import {
  Box,
  Typography,
  Grid,
  TextField,
  FormControl,
  Select,
  MenuItem,
  Switch,
  FormControlLabel,
  Card,
  CardContent,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  IconButton,
  InputLabel,
  Alert,
  Snackbar,
} from "@mui/material";
import { InfoOutlined, Business, AttachMoney, Save } from "@mui/icons-material";

const GeneralSettings = () => {
  const [form, setForm] = useState({
    // System Maintenance
    maintenanceMode: false,

    // Company Information
    businessName: "",
    phone: "",
    email: "",
    address: "",
    latitude: "",
    longitude: "",

    // Currency Settings
    currency: "USD",
    currencyPosition: "left",
    thousandSeparator: ",",
    decimalSeparator: ".",

    // Business Settings
    businessModel: "single",
    pagination: "10",
    copyrightText: "",
    decimalDigits: "2",

    // App Store Settings
    showAppStore: false,
    appStoreLink: "",
    showPlayStore: false,
    playStoreLink: "",

    // App Settings
    appVersion: "1.0.0",
    androidVersion: "1.0.0",
    iosVersion: "1.0.0",

    // Theme Settings
    primaryColor: "#1976d2",
    secondaryColor: "#dc004e",
    logo: null,
    favicon: null,

    // Digital Product
    sellDigitalProduct: false,
  });

  const [loading, setLoading] = useState(false);
  const [maintenanceDialogOpen, setMaintenanceDialogOpen] = useState(false);
  const [digitalProductDialogOpen, setDigitalProductDialogOpen] =
    useState(false);
  const [maintenanceConfirmDialogOpen, setMaintenanceConfirmDialogOpen] =
    useState(false);
  const [pendingMaintenanceMode, setPendingMaintenanceMode] = useState(false);
  const [pendingMaintenanceModeOriginal, setPendingMaintenanceModeOriginal] =
    useState(false);
  const [alert, setAlert] = useState({
    open: false,
    message: "",
    severity: "success",
  });

  // API URL
  const API =
    process.env.REACT_APP_API_URL || "https://admin-api.apnadecoration.com/api";

  // Load settings from backend
  useEffect(() => {
    const loadSettings = async () => {
      try {
        setLoading(true);
        const response = await axios.get(`${API}/admin-settings`);
        setForm(response.data);
      } catch (error) {
        console.error("Error loading settings:", error);
        setAlert({
          open: true,
          message: "Failed to load settings",
          severity: "error",
        });
      } finally {
        setLoading(false);
      }
    };

    loadSettings();
  }, []);

  const onChange = (e) => {
    const { name, value, type, checked } = e.target;

    // Special handling for maintenance mode
    if (name === "maintenanceMode") {
      // Update the state immediately to show the toggle change
      const tempForm = { ...form, maintenanceMode: checked };
      setForm(tempForm);

      setPendingMaintenanceMode(checked);
      setPendingMaintenanceModeOriginal(!checked); // Store original value
      setMaintenanceConfirmDialogOpen(true);
      return; // Don't update form yet, wait for confirmation
    }

    setForm((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleMaintenanceModeConfirm = async () => {
    try {
      setLoading(true);

      // Use current form state (which already has the updated maintenance mode)
      // API call to save settings
      const response = await axios.put(`${API}/admin-settings`, form);

      setForm(response.data.settings);
      setAlert({
        open: true,
        message: `Maintenance mode ${pendingMaintenanceMode ? "enabled" : "disabled"} successfully!`,
        severity: "success",
      });

      // Close confirmation dialog
      setMaintenanceConfirmDialogOpen(false);
      setPendingMaintenanceMode(false);
      setPendingMaintenanceModeOriginal(false);
    } catch (error) {
      console.error("Error updating maintenance mode:", error);
      setAlert({
        open: true,
        message:
          "Failed to update maintenance mode: " +
          (error.response?.data?.message || error.message),
        severity: "error",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleMaintenanceModeCancel = () => {
    // Revert the state back to original value
    setForm((prev) => ({
      ...prev,
      maintenanceMode: pendingMaintenanceModeOriginal,
    }));
    setMaintenanceConfirmDialogOpen(false);
    setPendingMaintenanceMode(false);
    setPendingMaintenanceModeOriginal(false);
  };

  const onSave = async () => {
    try {
      setLoading(true);

      // API call to save settings
      const response = await axios.put(`${API}/admin-settings`, form);

      setForm(response.data.settings);
      setAlert({
        open: true,
        message: "General Settings saved successfully!",
        severity: "success",
      });
    } catch (error) {
      console.error("Error saving settings:", error);
      setAlert({
        open: true,
        message:
          "Failed to save settings: " +
          (error.response?.data?.message || error.message),
        severity: "error",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      {/* Maintenance Mode Banner */}
      {form.maintenanceMode && (
        <Box
          sx={{
            mb: 3,
            p: 2,
            backgroundColor: "#fff3cd",
            border: "1px solid #ffeaa7",
            borderRadius: 2,
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          <Box sx={{ display: "flex", alignItems: "center" }}>
            <InfoOutlined sx={{ mr: 1, color: "#f57c00" }} />
            <Typography
              variant="body1"
              sx={{ color: "#856404", fontWeight: "bold" }}
            >
              🚧 MAINTENANCE MODE IS ENABLED
            </Typography>
          </Box>
          <Typography variant="body2" sx={{ color: "#856404" }}>
            Website is currently under maintenance. Users cannot access the
            site.
          </Typography>
        </Box>
      )}

      <Box sx={{ p: 3, backgroundColor: "#F5F5F5", minHeight: "100vh" }}>
        {/* Header */}
        <Box sx={{ backgroundColor: "#1e3a5f", color: "white", p: 2, mb: 3 }}>
          <Typography variant="h6">Settings</Typography>
        </Box>

        {/* System Maintenance Section */}
        <Card sx={{ mb: 3 }}>
          <CardContent>
            <Typography
              variant="h6"
              sx={{ mb: 3, display: "flex", alignItems: "center" }}
            >
              <InfoOutlined sx={{ mr: 1 }} />
              System Maintenance
            </Typography>
            <FormControlLabel
              control={
                <Switch
                  checked={form.maintenanceMode}
                  onChange={onChange}
                  name="maintenanceMode"
                  disabled={form.maintenanceMode} // Disable when maintenance mode is on
                />
              }
              label={
                <Box
                  component="span"
                  onClick={() => setMaintenanceDialogOpen(true)}
                  sx={{ cursor: "pointer" }}
                >
                  Maintenance Mode{" "}
                  {form.maintenanceMode ? "(ENABLED)" : "(DISABLED)"}
                </Box>
              }
            />
            <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
              {form.maintenanceMode
                ? "⚠️ Maintenance mode is currently enabled. Go to Order tab to disable."
                : "By turning on maintenance mode Control your all system & function"}
            </Typography>
            {form.maintenanceMode && (
              <Typography
                variant="body2"
                color="error.main"
                sx={{ mt: 1, fontWeight: "bold" }}
              >
                ⚠️ To disable maintenance mode, please go to the Order tab and
                use the toggle there.
              </Typography>
            )}
          </CardContent>
        </Card>

        {/* Company Information Section */}
        <Card sx={{ mb: 3 }}>
          <CardContent>
            <Typography
              variant="h6"
              sx={{ mb: 3, display: "flex", alignItems: "center" }}
            >
              <Business sx={{ mr: 1 }} />
              Company Information
            </Typography>
            <Grid container spacing={3}>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Business Name"
                  name="businessName"
                  value={form.businessName}
                  onChange={onChange}
                  sx={{ mb: 2 }}
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Phone"
                  name="phone"
                  value={form.phone}
                  onChange={onChange}
                  sx={{ mb: 2 }}
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Email"
                  name="email"
                  value={form.email}
                  onChange={onChange}
                  sx={{ mb: 2 }}
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Address"
                  name="address"
                  value={form.address}
                  onChange={onChange}
                  sx={{ mb: 2 }}
                  multiline
                  rows={2}
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Latitude"
                  name="latitude"
                  value={form.latitude}
                  onChange={onChange}
                  sx={{ mb: 2 }}
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Longitude"
                  name="longitude"
                  value={form.longitude}
                  onChange={onChange}
                  sx={{ mb: 2 }}
                />
              </Grid>
            </Grid>
          </CardContent>
        </Card>

        {/* Business Information Section */}
        <Card sx={{ mb: 3 }}>
          <CardContent>
            <Typography
              variant="h6"
              sx={{ mb: 3, display: "flex", alignItems: "center" }}
            >
              <AttachMoney sx={{ mr: 1 }} />
              Business Information
            </Typography>
            <Grid container spacing={3}>
              <Grid item xs={12} md={6}>
                <FormControl fullWidth sx={{ mb: 2 }}>
                  <InputLabel>Currency</InputLabel>
                  <Select
                    name="currency"
                    value={form.currency}
                    onChange={onChange}
                    label="Currency"
                  >
                    <MenuItem value="INR">Indian Rupee</MenuItem>
                    <MenuItem value="USD">US Dollar</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12} md={6}>
                <FormControl fullWidth sx={{ mb: 2 }}>
                  <InputLabel>Currency Position</InputLabel>
                  <Select
                    name="currencyPosition"
                    value={form.currencyPosition}
                    onChange={onChange}
                    label="Currency Position"
                  >
                    <MenuItem value="left">Left</MenuItem>
                    <MenuItem value="right">Right</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12} md={6}>
                <FormControl fullWidth sx={{ mb: 2 }}>
                  <InputLabel>Business Model</InputLabel>
                  <Select
                    name="businessModel"
                    value={form.businessModel}
                    onChange={onChange}
                    label="Business Model"
                  >
                    <MenuItem value="single">Single Vendor</MenuItem>
                    <MenuItem value="multi">Multi Vendor</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Pagination"
                  name="pagination"
                  type="number"
                  value={form.pagination}
                  onChange={onChange}
                  sx={{ mb: 2 }}
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Copyright Text"
                  name="copyrightText"
                  value={form.copyrightText}
                  onChange={onChange}
                  sx={{ mb: 2 }}
                />
              </Grid>
            </Grid>
          </CardContent>
        </Card>

        {/* Save Button */}
        <Box sx={{ mt: 3, display: "flex", justifyContent: "flex-end" }}>
          <Button
            variant="contained"
            size="large"
            startIcon={<Save />}
            onClick={onSave}
            disabled={loading}
            sx={{ minWidth: 200 }}
          >
            {loading ? "Saving..." : "Save Information"}
          </Button>
        </Box>
      </Box>

      {/* Maintenance Mode Dialog */}
      <Dialog
        open={maintenanceDialogOpen}
        onClose={() => setMaintenanceDialogOpen(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>
          <Box sx={{ display: "flex", alignItems: "center" }}>
            <InfoOutlined sx={{ mr: 1 }} />
            Maintenance Mode Information
          </Box>
        </DialogTitle>
        <DialogContent>
          <Typography variant="body1" sx={{ mb: 2 }}>
            When enabled, the website becomes inaccessible to users. Only
            administrators can access the system.
          </Typography>
          <Typography variant="body2" color="text.secondary">
            This feature is typically used during:
          </Typography>
          <ul>
            <li>System updates and maintenance</li>
            <li>Database migrations</li>
            <li>Security patches</li>
            <li>Feature deployments</li>
          </ul>
          <Typography
            variant="body2"
            color="warning.main"
            sx={{ mt: 2, fontWeight: "bold" }}
          >
            Warning: Enabling maintenance mode will immediately make your
            website unavailable to all users.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setMaintenanceDialogOpen(false)}>Close</Button>
        </DialogActions>
      </Dialog>

      {/* Maintenance Mode Confirmation Dialog */}
      <Dialog
        open={maintenanceConfirmDialogOpen}
        onClose={handleMaintenanceModeCancel}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>
          <Box sx={{ display: "flex", alignItems: "center" }}>
            <InfoOutlined sx={{ mr: 1 }} />
            Confirm Maintenance Mode
          </Box>
        </DialogTitle>
        <DialogContent>
          <Typography variant="body1" sx={{ mb: 2 }}>
            Are you sure you want to{" "}
            {pendingMaintenanceMode ? "enable" : "disable"} maintenance mode?
          </Typography>
          {pendingMaintenanceMode ? (
            <>
              <Typography
                variant="body2"
                color="warning.main"
                sx={{ mb: 2, fontWeight: "bold" }}
              >
                ⚠️ WARNING: This will make your website inaccessible to all
                users!
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Only administrators will be able to access the system while
                maintenance mode is enabled.
              </Typography>
            </>
          ) : (
            <Typography variant="body2" color="text.secondary">
              Disabling maintenance mode will make your website accessible to
              all users again.
            </Typography>
          )}
        </DialogContent>
        <DialogActions>
          <Button
            onClick={handleMaintenanceModeCancel}
            variant="outlined"
            disabled={loading}
          >
            Cancel
          </Button>
          <Button
            onClick={handleMaintenanceModeConfirm}
            variant="contained"
            color={pendingMaintenanceMode ? "warning" : "primary"}
            disabled={loading}
          >
            {loading
              ? "Processing..."
              : `Yes, ${pendingMaintenanceMode ? "Enable" : "Disable"} Maintenance Mode`}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Digital Product Dialog */}
      <Dialog
        open={digitalProductDialogOpen}
        onClose={() => setDigitalProductDialogOpen(false)}
        maxWidth="sm"
        fullWidth
        PaperProps={{
          sx: {
            borderRadius: 2,
            boxShadow: 3,
          },
        }}
      >
        <DialogTitle
          sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            borderBottom: "1px solid #e0e0e0",
            pb: 2,
          }}
        >
          <Typography variant="h6" component="div">
            Sell digital product
          </Typography>
          <IconButton
            onClick={() => setDigitalProductDialogOpen(false)}
            size="small"
            sx={{ color: "#666" }}
          >
            ×
          </IconButton>
        </DialogTitle>
        <DialogContent sx={{ pt: 3, pb: 2 }}>
          <Typography variant="body1" sx={{ mb: 3, lineHeight: 1.6 }}>
            By enabling this feature you can sell digital products like e-books,
            PDFs, software, music, videos, and other downloadable items on your
            platform.
          </Typography>

          <Typography variant="body1" sx={{ mb: 2, fontWeight: "bold" }}>
            Features:
          </Typography>

          <Box
            component="ul"
            sx={{
              pl: 3,
              mb: 3,
              "& li": {
                mb: 1,
                fontSize: "0.95rem",
                lineHeight: 1.5,
                color: "#555",
              },
            }}
          >
            <li>Instant digital delivery after purchase</li>
            <li>Secure download links with expiration</li>
            <li>Automatic order fulfillment</li>
            <li>Customer access to purchased files</li>
            <li>Download limit and security options</li>
          </Box>

          <Typography
            variant="body2"
            sx={{ color: "#666", fontStyle: "italic" }}
          >
            Perfect for selling digital content, templates, courses, and more.
          </Typography>
        </DialogContent>
        <DialogActions
          sx={{
            justifyContent: "center",
            pt: 2,
            pb: 3,
            gap: 2,
          }}
        >
          <Button
            onClick={() => setDigitalProductDialogOpen(false)}
            variant="outlined"
            sx={{ minWidth: 120 }}
          >
            Cancel
          </Button>
          <Button
            onClick={() => setDigitalProductDialogOpen(false)}
            variant="contained"
            color="primary"
            sx={{ minWidth: 120 }}
          >
            Got it
          </Button>
        </DialogActions>
      </Dialog>

      {/* Alert Snackbar */}
      <Snackbar
        open={alert.open}
        autoHideDuration={6000}
        onClose={() => setAlert((prev) => ({ ...prev, open: false }))}
      >
        <Alert
          severity={alert.severity}
          onClose={() => setAlert((prev) => ({ ...prev, open: false }))}
        >
          {alert.message}
        </Alert>
      </Snackbar>
    </>
  );
};

export default GeneralSettings;
