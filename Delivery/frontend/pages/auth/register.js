import React, { useState } from "react";
import { useRouter } from "next/router";
import Head from "next/head";
import { Container } from "@mui/material";
import { DELIVERY_API_URL } from "../../config/constants";
import {
  Box,
  Card,
  CardContent,
  TextField,
  Button,
  Typography,
  Alert,
  Stepper,
  Step,
  StepLabel,
  FormControlLabel,
  Checkbox,
  Grid,
  InputLabel,
  Select,
  MenuItem,
  LinearProgress,
  Avatar,
} from "@mui/material";
import {
  Person,
  Email,
  Phone,
  LocalShipping,
  AccountBalance,
  ArrowBack,
  Lock,
} from "@mui/icons-material";
import toast from "react-hot-toast";

const steps = ["Personal Info", "Vehicle & Bank", "Terms & Submit"];

export default function DeliveryBoyRegister() {
  const router = useRouter();
  const [activeStep, setActiveStep] = useState(0);
  const [formData, setFormData] = useState({
    // Personal Info
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    password: "",
    confirmPassword: "",

    // Vehicle & Bank
    vehicleType: "",
    vehicleNumber: "",
    drivingLicense: "",
    bankAccount: "",
    ifscCode: "",
    bankName: "",

    // Terms
    agreeTerms: false,
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  React.useEffect(() => {
    // Check if already logged in
    const token = localStorage.getItem("deliveryBoyToken");
    if (token) {
      router.push("/dashboard");
      return;
    }
  }, []);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === "checkbox" ? checked : value,
    });
  };

  const handleNext = () => {
    // Validate current step
    if (activeStep === 0) {
      if (
        !formData.firstName ||
        !formData.lastName ||
        !formData.email ||
        !formData.phone
      ) {
        setError("Please fill all required personal information");
        return;
      }
      if (!formData.password || !formData.confirmPassword) {
        setError("Please enter and confirm your password");
        return;
      }
      if (formData.password !== formData.confirmPassword) {
        setError("Passwords do not match");
        return;
      }
      if (formData.password.length < 6) {
        setError("Password must be at least 6 characters long");
        return;
      }
    }
    if (activeStep === 1) {
      if (!formData.vehicleType || !formData.vehicleNumber) {
        setError("Please provide vehicle information");
        return;
      }
      if (!formData.bankAccount || !formData.ifscCode) {
        setError("Please provide bank account details");
        return;
      }
    }
    setError("");
    setActiveStep((prev) => prev + 1);
  };

  const handleBack = () => {
    setError("");
    setActiveStep((prev) => prev - 1);
  };

  // Enhanced form validation functions
  const validateEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return {
        isValid: false,
        error: "Please enter a valid email address",
        helperText: "Example: john.doe@example.com",
      };
    }
    return { isValid: true };
  };

  const validatePhone = (phone) => {
    const phoneRegex = /^[6-9]\d{9}$/;
    if (!phoneRegex.test(phone)) {
      return {
        isValid: false,
        error: "Please enter a valid 10-digit phone number",
        helperText: "Example: 9876543210",
      };
    }
    return { isValid: true };
  };

  const validatePassword = (password) => {
    if (password.length < 6) {
      return {
        isValid: false,
        error: "Password must be at least 6 characters",
        helperText: "Example: Password123",
      };
    }
    return { isValid: true };
  };

  const validateVehicleType = (vehicleType) => {
    const validTypes = ["motorcycle", "scooter", "bicycle", "car", "van"];
    if (!validTypes.includes(vehicleType)) {
      return {
        isValid: false,
        error: "Please select a valid vehicle type",
        helperText: "Options: motorcycle, scooter, bicycle, car, van",
      };
    }
    return { isValid: true };
  };

  const validateRequired = (value, fieldName) => {
    if (!value || value.trim() === "") {
      return {
        isValid: false,
        error: `${fieldName} is required`,
      };
    }
    return { isValid: true };
  };

  // Real-time validation function
  const validateField = (value, fieldName, validationRules) => {
    for (const rule of validationRules) {
      const result = rule(value);
      if (!result.isValid) {
        return {
          isValid: false,
          error: result.error,
        };
      }
    }
    return { isValid: true };
  };

  // Enhanced form validation
  const validateForm = (formData) => {
    const errors = [];

    // Validate each field
    const emailValid = validateEmail(formData.email);
    if (!emailValid.isValid) {
      errors.push(emailValid.error);
    }

    const phoneValid = validatePhone(formData.phone);
    if (!phoneValid.isValid) {
      errors.push(phoneValid.error);
    }

    const passwordValid = validatePassword(formData.password);
    if (!passwordValid.isValid) {
      errors.push(passwordValid.error);
    }

    const vehicleTypeValid = validateVehicleType(formData.vehicleType);
    if (!vehicleTypeValid.isValid) {
      errors.push(vehicleTypeValid.error);
    }

    const vehicleNumberValid = validateRequired(formData.vehicleNumber);
    if (!vehicleNumberValid.isValid) {
      errors.push(vehicleNumberValid.error);
    }

    const bankAccountValid = validateRequired(formData.bankAccount);
    if (!bankAccountValid.isValid) {
      errors.push(bankAccountValid.error);
    }

    const ifscCodeValid = validateRequired(formData.ifscCode);
    if (!ifscCodeValid.isValid) {
      errors.push(ifscCodeValid.error);
    }

    const bankNameValid =
      formData.bankName?.trim() !== ""
        ? { isValid: true }
        : { isValid: false, error: "Bank name is required" };
    if (!bankNameValid.isValid) {
      errors.push(bankNameValid.error);
    }

    // Terms agreement check
    if (!formData.agreeTerms) {
      errors.push("You must agree to Terms and Conditions");
    }

    return {
      isValid: errors.length === 0,
      errors,
      error: errors.length > 0 ? errors[0] : null,
    };
  };

  const handleSubmit = async () => {
    // Enhanced validation before API call
    const validation = validateForm(formData);

    if (!validation.isValid) {
      setError(validation.error);
      return;
    }

    setLoading(true);
    setError("");

    // Debug: Log form data
    console.log("Registration Form Data:", formData);

    try {
      // Simplified data structure to match backend validation
      const response = await fetch(`${DELIVERY_API_URL}/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          firstName: formData.firstName.trim(),
          lastName: formData.lastName.trim(),
          email: formData.email.trim().toLowerCase(),
          phone: formData.phone.trim(),
          password: formData.password,
          vehicleType: formData.vehicleType,
          vehicleNumber: formData.vehicleNumber.trim(),
          drivingLicense: formData.drivingLicense?.trim(),
          bankAccount: formData.bankAccount?.trim(),
          ifscCode: formData.ifscCode?.trim(),
          bankName: formData.bankName?.trim(),
          agreeTerms: formData.agreeTerms,
        }),
      });

      console.log("Registration Response Status:", response.status);

      const data = await response.json();
      console.log("Registration Response Data:", data);

      if (response.ok) {
        toast.success("Registration successful! Please login.");
        // Redirect to login after successful registration
        setTimeout(() => {
          router.push("/auth/login");
        }, 2000);
      } else {
        setError(data.message || "Registration failed");
      }
    } catch (err) {
      console.error("Registration Error:", err);
      setError("Connection error. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const renderStepContent = (step) => {
    switch (step) {
      case 0:
        return (
          <Grid container spacing={2}>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="First Name *"
                name="firstName"
                value={formData.firstName}
                onChange={handleChange}
                margin="normal"
                InputProps={{
                  startAdornment: <Person sx={{ mr: 1, color: "#1e3a5f" }} />,
                }}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Last Name *"
                name="lastName"
                value={formData.lastName}
                onChange={handleChange}
                margin="normal"
                InputProps={{
                  startAdornment: <Person sx={{ mr: 1, color: "#1e3a5f" }} />,
                }}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Email Address *"
                name="email"
                type="email"
                value={formData.email.trim()} // Trim whitespace
                onChange={handleChange}
                margin="normal"
                required
                InputProps={{
                  startAdornment: <Email sx={{ mr: 1, color: "#1e3a5f" }} />,
                }}
                helperText="Enter valid email without spaces"
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Phone Number *"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                margin="normal"
                InputProps={{
                  startAdornment: <Phone sx={{ mr: 1, color: "#1e3a5f" }} />,
                }}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Password *"
                name="password"
                type="password"
                value={formData.password}
                onChange={handleChange}
                margin="normal"
                InputProps={{
                  startAdornment: <Lock sx={{ mr: 1, color: "#1e3a5f" }} />,
                }}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Confirm Password *"
                name="confirmPassword"
                type="password"
                value={formData.confirmPassword}
                onChange={handleChange}
                margin="normal"
                InputProps={{
                  startAdornment: <Lock sx={{ mr: 1, color: "#1e3a5f" }} />,
                }}
              />
            </Grid>
          </Grid>
        );
      case 1:
        return (
          <Grid container spacing={2}>
            <Grid item xs={12}>
              <InputLabel sx={{ mb: 1, color: "#1e3a5f" }}>
                Vehicle Type *
              </InputLabel>
              <Select
                fullWidth
                name="vehicleType"
                value={formData.vehicleType}
                onChange={handleChange}
                sx={{ mb: 2 }}
              >
                <MenuItem value="motorcycle">Motorcycle</MenuItem>
                <MenuItem value="scooter">Scooter</MenuItem>
                <MenuItem value="bicycle">Bicycle</MenuItem>
                <MenuItem value="car">Car</MenuItem>
                <MenuItem value="van">Van</MenuItem>
              </Select>
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Vehicle Number *"
                name="vehicleNumber"
                value={formData.vehicleNumber}
                onChange={handleChange}
                margin="normal"
                InputProps={{
                  startAdornment: (
                    <LocalShipping sx={{ mr: 1, color: "#1e3a5f" }} />
                  ),
                }}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Driving License Number"
                name="drivingLicense"
                value={formData.drivingLicense}
                onChange={handleChange}
                margin="normal"
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Bank Account Number *"
                name="bankAccount"
                value={formData.bankAccount}
                onChange={handleChange}
                margin="normal"
                InputProps={{
                  startAdornment: (
                    <AccountBalance sx={{ mr: 1, color: "#1e3a5f" }} />
                  ),
                }}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="IFSC Code *"
                name="ifscCode"
                value={formData.ifscCode}
                onChange={handleChange}
                margin="normal"
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Bank Name"
                name="bankName"
                value={formData.bankName}
                onChange={handleChange}
                margin="normal"
              />
            </Grid>
          </Grid>
        );
      case 2:
        return (
          <Box sx={{ textAlign: "center", py: 2 }}>
            <Typography variant="h6" sx={{ mb: 2, color: "#1e3a5f" }}>
              Terms and Conditions
            </Typography>
            <Typography variant="body2" sx={{ mb: 3, color: "#666" }}>
              By registering as a delivery boy, you agree to our terms of
              service, privacy policy, and commit to providing reliable delivery
              services to our customers.
            </Typography>
            <FormControlLabel
              control={
                <Checkbox
                  checked={formData.agreeTerms}
                  onChange={handleChange}
                  name="agreeTerms"
                  sx={{ color: "#1e3a5f" }}
                />
              }
              label="I agree to the Terms and Conditions *"
            />
          </Box>
        );
      default:
        return null;
    }
  };

  return (
    <>
      <Head>
        <title>Delivery Boy Registration - APNA Decoration</title>
        <meta
          name="description"
          content="Register as delivery boy for APNA Decoration"
        />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <Box
        sx={{
          minHeight: "100vh",
          backgroundColor: "#F5F5F5", // Admin background color
          py: 4,
        }}
      >
        <Container maxWidth="md">
          <Card
            sx={{
              boxShadow: "0 2px 8px rgba(0,0,0,0.1)", // Admin card shadow
              borderRadius: 8, // Admin border radius
              overflow: "hidden",
            }}
          >
            <CardContent sx={{ p: 4 }}>
              {/* Header */}
              <Box sx={{ textAlign: "center", mb: 4 }}>
                <Avatar
                  sx={{
                    backgroundColor: "#1e3a5f", // Admin primary color
                    width: 64,
                    height: 64,
                    mx: "auto",
                    mb: 2,
                  }}
                >
                  <LocalShipping sx={{ fontSize: 32 }} />
                </Avatar>
                <Typography
                  variant="h4"
                  sx={{
                    color: "#1e3a5f", // Admin primary color
                    fontWeight: 600,
                    mb: 1,
                  }}
                >
                  Delivery Boy Registration
                </Typography>
                <Typography variant="body2" color="textSecondary">
                  Join APNA Decoration delivery team
                </Typography>
              </Box>

              {error && (
                <Alert severity="error" sx={{ mb: 2 }}>
                  {error}
                </Alert>
              )}

              {/* Stepper */}
              <Stepper activeStep={activeStep} alternativeLabel sx={{ mb: 4 }}>
                {steps.map((label) => (
                  <Step key={label}>
                    <StepLabel>{label}</StepLabel>
                  </Step>
                ))}
              </Stepper>

              {/* Form Content */}
              <Box component="form">
                {renderStepContent(activeStep)}

                {/* Navigation Buttons */}
                <Box
                  sx={{
                    display: "flex",
                    justifyContent: "space-between",
                    mt: 4,
                  }}
                >
                  {activeStep > 0 && (
                    <Button
                      onClick={handleBack}
                      variant="outlined"
                      sx={{
                        borderColor: "#1e3a5f",
                        color: "#1e3a5f",
                        "&:hover": {
                          borderColor: "#2d5a8c",
                          backgroundColor: "rgba(30, 58, 95, 0.04)",
                        },
                      }}
                    >
                      Back
                    </Button>
                  )}

                  {activeStep < steps.length - 1 ? (
                    <Button
                      onClick={handleNext}
                      variant="contained"
                      sx={{
                        ml: "auto",
                        backgroundColor: "#1e3a5f",
                        "&:hover": {
                          backgroundColor: "#2d5a8c",
                        },
                      }}
                    >
                      Next
                    </Button>
                  ) : (
                    <Button
                      onClick={handleSubmit}
                      variant="contained"
                      disabled={loading || !formData.agreeTerms}
                      sx={{
                        ml: "auto",
                        backgroundColor: "#1e3a5f",
                        "&:hover": {
                          backgroundColor: "#2d5a8c",
                        },
                      }}
                    >
                      {loading ? (
                        <Box sx={{ display: "flex", alignItems: "center" }}>
                          <LinearProgress sx={{ mr: 1 }} size={20} />
                          Registering...
                        </Box>
                      ) : (
                        "Create Account"
                      )}
                    </Button>
                  )}
                </Box>
              </Box>

              {/* Back to Login */}
              <Typography
                variant="body2"
                align="center"
                sx={{ mt: 3, color: "#666" }}
              >
                Already have an account?{" "}
                <Button
                  color="primary"
                  onClick={() => router.push("/auth/login")}
                  sx={{ color: "#1e3a5f" }}
                >
                  Login here
                </Button>
              </Typography>

              {/* Back Button */}
              <Box sx={{ mt: 2, textAlign: "center" }}>
                <Button
                  startIcon={<ArrowBack />}
                  onClick={() => router.push("/auth/login")}
                  variant="outlined"
                  sx={{
                    borderColor: "#1e3a5f",
                    color: "#1e3a5f",
                    "&:hover": {
                      borderColor: "#2d5a8c",
                      backgroundColor: "rgba(30, 58, 95, 0.04)",
                    },
                  }}
                >
                  Back to Login
                </Button>
              </Box>
            </CardContent>
          </Card>
        </Container>
      </Box>
    </>
  );
}
