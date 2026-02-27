import React, { useState } from "react";
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
} from "@mui/material";

const CustomerLoginSettings = () => {
  const [activeTab, setActiveTab] = useState(0);

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

  const handleTabChange = (_, newValue) => {
    setActiveTab(newValue);
  };

  const handleSubmit = () => {
    const finalData = {
      loginOptions,
      socialOptions,
      otpOptions,
    };

    console.log("Saved Settings:", finalData);
    alert("Login Settings Saved Successfully");
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
    </Box>
  );
};

export default CustomerLoginSettings;
