import React, { useState } from "react";
import axios from "axios";
import {
  Box,
  Card,
  CardContent,
  Typography,
  Checkbox,
  FormControlLabel,
  Button,
  Tabs,
  Tab,
  Link,
  Divider,
  TextField,
  IconButton,
  Tooltip,
  Snackbar,
  Alert,
} from "@mui/material";
import { Info as InfoIcon } from "@mui/icons-material";

const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || 'https://admin-api.apnadecoration.com/api';

const LoginSettings = () => {
  const [activeTab, setActiveTab] = useState(0);
  const [loading, setLoading] = useState(false);
  const [snackbar, setSnackbar] = useState({ open: false, severity: "success", msg: "" });

  const [loginOptions, setLoginOptions] = useState({
    manualLogin: true,
    otpLogin: false,
    socialLogin: true,
  });

  const [socialOptions, setSocialOptions] = useState({
    google: true,
    facebook: true,
    apple: true,
  });

  const [otpOptions, setOtpOptions] = useState({
    emailVerification: false,
    phoneVerification: false,
  });

  const [otpLoginSettings, setOtpLoginSettings] = useState({
    maximumOtpHit: '0',
    otpResendTime: '0',
    temporaryBlockTime: '0',
    maximumLoginHit: '0',
    temporaryLoginBlockTime: '0',
  });

  const [loginUrlSettings, setLoginUrlSettings] = useState({
    adminLoginUrl: 'admin',
    employeeLoginUrl: 'employee',
  });

  const handleTabChange = (_, newValue) => {
    setActiveTab(newValue);
  };

  const handleOtpLoginSettingChange = (field) => (e) => {
    setOtpLoginSettings(prev => ({ ...prev, [field]: e.target.value }));
  };

  const handleLoginUrlChange = (field) => (e) => {
    setLoginUrlSettings(prev => ({ ...prev, [field]: e.target.value }));
  };

  const handleSubmit = async () => {
    try {
      setLoading(true);
      
      const finalData = {
        manualLogin: loginOptions.manualLogin,
        otpLogin: loginOptions.otpLogin,
        socialLogin: loginOptions.socialLogin,
        googleLogin: socialOptions.google,
        facebookLogin: socialOptions.facebook,
        appleLogin: socialOptions.apple,
        emailVerification: otpOptions.emailVerification,
        phoneVerification: otpOptions.phoneVerification,
        maximumOtpHit: otpLoginSettings.maximumOtpHit,
        otpResendTime: otpLoginSettings.otpResendTime,
        temporaryBlockTime: otpLoginSettings.temporaryBlockTime,
        maximumLoginHit: otpLoginSettings.maximumLoginHit,
        temporaryLoginBlockTime: otpLoginSettings.temporaryLoginBlockTime,
        adminLoginUrl: loginUrlSettings.adminLoginUrl,
        employeeLoginUrl: loginUrlSettings.employeeLoginUrl,
      };

      const response = await axios.put(`${API_BASE_URL}/admin-settings`, finalData);
      
      setSnackbar({ open: true, severity: "success", msg: "Login Settings Saved Successfully!" });
      console.log("Saved Settings:", finalData);
      
    } catch (error) {
      console.error("Error saving login settings:", error);
      setSnackbar({ open: true, severity: "error", msg: "Failed to save login settings" });
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    setLoginOptions({
      manualLogin: true,
      otpLogin: false,
      socialLogin: true,
    });
    setSocialOptions({
      google: true,
      facebook: true,
      apple: true,
    });
    setOtpOptions({
      emailVerification: false,
      phoneVerification: false,
    });
    setOtpLoginSettings({
      maximumOtpHit: '0',
      otpResendTime: '0',
      temporaryBlockTime: '0',
      maximumLoginHit: '0',
      temporaryLoginBlockTime: '0',
    });
    setLoginUrlSettings({
      adminLoginUrl: 'admin',
      employeeLoginUrl: 'employee',
    });
  };

  return (
    <Box sx={{ p: 3 }}>
      {/* PAGE TITLE */}
      <Typography variant="h5" fontWeight={600} mb={3}>
        Customer Login
      </Typography>

      {/* TABS */}
      <Tabs
        value={activeTab}
        onChange={handleTabChange}
        sx={{ mb: 3 }}
        textColor="primary"
        indicatorColor="primary"
      >
        <Tab label="Customer Login" />
        <Tab label="OTP & Login Attempts" />
        <Tab label="Login URL" />
      </Tabs>

      {activeTab === 0 && (
        <Card sx={{ borderRadius: 2 }}>
          <CardContent>
            {/* SECTION 1: LOGIN OPTIONS */}
            <Typography variant="h6" fontWeight={600} mb={2}>
              Setup Login Option
            </Typography>
            <Typography variant="body2" color="text.secondary" mb={2}>
              The option you select customer will have the to option to login
            </Typography>

            <Box sx={{ display: "flex", flexDirection: "column", gap: 1 }}>
              <FormControlLabel
                control={
                  <Checkbox
                    checked={loginOptions.manualLogin}
                    onChange={() =>
                      setLoginOptions({
                        ...loginOptions,
                        manualLogin: !loginOptions.manualLogin,
                      })
                    }
                  />
                }
                label="Manual Login"
              />

              <FormControlLabel
                control={
                  <Checkbox
                    checked={loginOptions.otpLogin}
                    onChange={() =>
                      setLoginOptions({
                        ...loginOptions,
                        otpLogin: !loginOptions.otpLogin,
                      })
                    }
                  />
                }
                label="OTP Login"
              />

              <FormControlLabel
                control={
                  <Checkbox
                    checked={loginOptions.socialLogin}
                    onChange={() =>
                      setLoginOptions({
                        ...loginOptions,
                        socialLogin: !loginOptions.socialLogin,
                      })
                    }
                  />
                }
                label="Social Media Login"
              />
            </Box>

            <Divider sx={{ my: 3 }} />

            {/* SECTION 2: SOCIAL LOGIN */}
            <Typography variant="h6" fontWeight={600} mb={2}>
              Social Media Login Setup
            </Typography>

            {loginOptions.socialLogin ? (
              <>
                <Box sx={{ display: "flex", flexDirection: "column", gap: 1 }}>
                  <FormControlLabel
                    control={
                      <Checkbox
                        checked={socialOptions.google}
                        onChange={() =>
                          setSocialOptions({
                            ...socialOptions,
                            google: !socialOptions.google,
                          })
                        }
                      />
                    }
                    label="Google Login"
                  />

                  <FormControlLabel
                    control={
                      <Checkbox
                        checked={socialOptions.facebook}
                        onChange={() =>
                          setSocialOptions({
                            ...socialOptions,
                            facebook: !socialOptions.facebook,
                          })
                        }
                      />
                    }
                    label="Facebook Login"
                  />

                  <FormControlLabel
                    control={
                      <Checkbox
                        checked={socialOptions.apple}
                        onChange={() =>
                          setSocialOptions({
                            ...socialOptions,
                            apple: !socialOptions.apple,
                          })
                        }
                      />
                    }
                    label="Apple Login"
                  />
                </Box>

                <Link href="#" underline="hover" sx={{ mt: 1, display: "block", fontSize: 14 }}>
                  Connect 3rd party login system from here
                </Link>
              </>
            ) : (
              <Typography color="text.secondary" fontSize={14}>
                Enable Social Media Login to configure options.
              </Typography>
            )}

            <Divider sx={{ my: 3 }} />

            {/* SECTION 3: OTP VERIFICATION */}
            <Typography variant="h6" fontWeight={600} mb={2}>
              OTP Verification Option
            </Typography>
            <Typography variant="body2" color="text.secondary" mb={2}>
              The option you select will need to be verified by the customer
            </Typography>

            <Box sx={{ display: "flex", flexDirection: "column", gap: 1 }}>
              <FormControlLabel
                control={
                  <Checkbox
                    checked={otpOptions.emailVerification}
                    onChange={() =>
                      setOtpOptions({
                        ...otpOptions,
                        emailVerification: !otpOptions.emailVerification,
                      })
                    }
                  />
                }
                label="Email Verification"
              />

              <FormControlLabel
                control={
                  <Checkbox
                    checked={otpOptions.phoneVerification}
                    onChange={() =>
                      setOtpOptions({
                        ...otpOptions,
                        phoneVerification: !otpOptions.phoneVerification,
                      })
                    }
                  />
                }
                label="Phone Number Verification"
              />
            </Box>

            {/* BUTTONS */}
            <Box sx={{ display: "flex", justifyContent: "flex-end", mt: 4, gap: 2 }}>
              <Button variant="outlined" onClick={handleReset}>
                Reset
              </Button>
              <Button variant="contained" onClick={handleSubmit}>
                Submit
              </Button>
            </Box>
          </CardContent>
        </Card>
      )}

      {activeTab === 1 && (
        <Card sx={{ borderRadius: 2 }}>
          <CardContent>
            {/* PAGE TITLE */}
            <Typography variant="h5" fontWeight={600} mb={3}>
              OTP & Login Settings
            </Typography>

            {/* OTP CONFIGURATION */}
            <Typography variant="h6" fontWeight={600} mb={2}>
              OTP Configuration
            </Typography>

            <Box sx={{ display: "flex", flexDirection: "column", gap: 3 }}>
              <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                <TextField
                  label="Maximum OTP Hit"
                  value={otpLoginSettings.maximumOtpHit}
                  onChange={handleOtpLoginSettingChange('maximumOtpHit')}
                  placeholder="0"
                  type="number"
                  sx={{ flex: 1 }}
                />
                <Tooltip title="Maximum number of OTP attempts allowed">
                  <IconButton size="small">
                    <InfoIcon fontSize="small" color="action" />
                  </IconButton>
                </Tooltip>
              </Box>

              <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                <TextField
                  label="OTP Resend Time (Sec)"
                  value={otpLoginSettings.otpResendTime}
                  onChange={handleOtpLoginSettingChange('otpResendTime')}
                  placeholder="0"
                  type="number"
                  sx={{ flex: 1 }}
                />
                <Tooltip title="Minimum time between OTP resend requests">
                  <IconButton size="small">
                    <InfoIcon fontSize="small" color="action" />
                  </IconButton>
                </Tooltip>
              </Box>

              <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                <TextField
                  label="Temporary Block Time (Sec)"
                  value={otpLoginSettings.temporaryBlockTime}
                  onChange={handleOtpLoginSettingChange('temporaryBlockTime')}
                  placeholder="0"
                  type="number"
                  sx={{ flex: 1 }}
                />
                <Tooltip title="Duration of temporary block after OTP limit exceeded">
                  <IconButton size="small">
                    <InfoIcon fontSize="small" color="action" />
                  </IconButton>
                </Tooltip>
              </Box>
            </Box>

            <Divider sx={{ my: 3 }} />

            {/* LOGIN ATTEMPT CONFIGURATION */}
            <Typography variant="h6" fontWeight={600} mb={2}>
              Login Attempt Configuration
            </Typography>

            <Box sx={{ display: "flex", flexDirection: "column", gap: 3 }}>
              <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                <TextField
                  label="Maximum Login Hit"
                  value={otpLoginSettings.maximumLoginHit}
                  onChange={handleOtpLoginSettingChange('maximumLoginHit')}
                  placeholder="0"
                  type="number"
                  sx={{ flex: 1 }}
                />
                <Tooltip title="Maximum number of failed login attempts allowed">
                  <IconButton size="small">
                    <InfoIcon fontSize="small" color="action" />
                  </IconButton>
                </Tooltip>
              </Box>

              <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                <TextField
                  label="Temporary Login Block Time (Sec)"
                  value={otpLoginSettings.temporaryLoginBlockTime}
                  onChange={handleOtpLoginSettingChange('temporaryLoginBlockTime')}
                  placeholder="0"
                  type="number"
                  sx={{ flex: 1 }}
                />
                <Tooltip title="Duration of temporary block after login limit exceeded">
                  <IconButton size="small">
                    <InfoIcon fontSize="small" color="action" />
                  </IconButton>
                </Tooltip>
              </Box>
            </Box>

            {/* BUTTONS */}
            <Box sx={{ display: "flex", justifyContent: "flex-end", mt: 4, gap: 2 }}>
              <Button variant="outlined" onClick={handleReset}>
                Reset
              </Button>
              <Button variant="contained" onClick={handleSubmit} disabled={loading}>
                {loading ? 'Saving...' : 'Save'}
              </Button>
            </Box>
          </CardContent>
        </Card>
      )}

      {activeTab === 2 && (
        <>
          <Card sx={{ borderRadius: 2 }}>
            <CardContent>
              <Typography variant="h6" fontWeight={600} mb={2}>
                Admin Login Page
              </Typography>
              
              <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 2 }}>
                <Typography variant="body2" color="text.secondary">
                  https://www.printfornmee.com/login/
                </Typography>
                <TextField
                  value={loginUrlSettings.adminLoginUrl}
                  onChange={handleLoginUrlChange('adminLoginUrl')}
                  placeholder="admin"
                  size="small"
                  sx={{ minWidth: 150 }}
                />
                <Tooltip title="Enter custom path for admin login URL">
                  <IconButton size="small">
                    <InfoIcon fontSize="small" color="action" />
                  </IconButton>
                </Tooltip>
              </Box>
              
              <Button 
                variant="contained" 
                size="small"
                onClick={handleSubmit}
                disabled={loading}
                sx={{ mt: 1 }}
              >
                {loading ? 'Saving...' : 'Submit'}
              </Button>
            </CardContent>
          </Card>

          <Card sx={{ borderRadius: 2, mt: 3 }}>
            <CardContent>
              <Typography variant="h6" fontWeight={600} mb={2}>
                Employee Login Page
              </Typography>
              
              <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 2 }}>
                <Typography variant="body2" color="text.secondary">
                  https://www.printfornmee.com/login/
                </Typography>
                <TextField
                  value={loginUrlSettings.employeeLoginUrl}
                  onChange={handleLoginUrlChange('employeeLoginUrl')}
                  placeholder="employee"
                  size="small"
                  sx={{ minWidth: 150 }}
                />
                <Tooltip title="Enter custom path for employee login URL">
                  <IconButton size="small">
                    <InfoIcon fontSize="small" color="action" />
                  </IconButton>
                </Tooltip>
              </Box>
              
              <Button 
                variant="contained" 
                size="small"
                onClick={handleSubmit}
                disabled={loading}
                sx={{ mt: 1 }}
              >
                {loading ? 'Saving...' : 'Submit'}
              </Button>
            </CardContent>
          </Card>
        </>
      )}
      
      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={() => setSnackbar(prev => ({ ...prev, open: false }))}
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
};

export default LoginSettings;
