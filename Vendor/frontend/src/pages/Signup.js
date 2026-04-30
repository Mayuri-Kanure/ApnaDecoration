import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { API_BASE_URL } from "../config/constants";
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
} from "@mui/material";
import LockOutlinedIcon from "@mui/icons-material/LockOutlined";

const steps = ["Business Info", "Account Info", "Terms & Submit"];

const VendorSignup = () => {
  const navigate = useNavigate();
  const [activeStep, setActiveStep] = useState(0);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
    phone: "",
    address: "",
    gstNumber: "",
    agreeTerms: false,
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

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
      if (!formData.name) {
        setError("Please fill Business Name to continue");
        return;
      }
    }
    if (activeStep === 1) {
      if (!formData.email || !formData.password || !formData.confirmPassword) {
        setError("Please fill all required fields in Account Info");
        return;
      }
      if (formData.password !== formData.confirmPassword) {
        setError("Passwords do not match");
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

  const handleSubmit = async () => {
    if (!formData.agreeTerms) {
      setError("You must agree to the Terms and Conditions");
      return;
    }

    // Validate password requirements
    if (formData.password.length < 6) {
      setError("Password must be at least 6 characters long");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const response = await fetch(`${API_BASE_URL}/auth/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          username: formData.name
            .toLowerCase()
            .replace(/[^a-z0-9\s]/g, "")
            .replace(/\s+/g, "_"),
          email: formData.email,
          password: formData.password,
          firstName: formData.name.split(" ")[0] || "Vendor",
          lastName: formData.name.split(" ").slice(1).join(" ") || "User",
          role: "vendor",
        }),
      });

      const data = await response.json();

      if (response.ok) {
        navigate("/login", {
          state: {
            message: "Registration successful! Please login.",
            type: "success",
          },
        });
      } else {
        setError(data.message || "Registration failed");
      }
    } catch (err) {
      setError("Connection error. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const renderStepContent = (step) => {
    switch (step) {
      case 0:
        return (
          <>
            <TextField
              fullWidth
              label="Business Name *"
              name="name"
              value={formData.name}
              onChange={handleChange}
              margin="normal"
            />
            <TextField
              fullWidth
              label="Phone Number"
              name="phone"
              value={formData.phone}
              onChange={handleChange}
              margin="normal"
            />
            <TextField
              fullWidth
              label="Business Address"
              name="address"
              value={formData.address}
              onChange={handleChange}
              margin="normal"
              multiline
              rows={2}
            />
            <TextField
              fullWidth
              label="GST Number"
              name="gstNumber"
              value={formData.gstNumber}
              onChange={handleChange}
              margin="normal"
            />
          </>
        );
      case 1:
        return (
          <>
            <TextField
              fullWidth
              label="Email Address *"
              name="email"
              type="email"
              value={formData.email}
              onChange={handleChange}
              margin="normal"
            />
            <TextField
              fullWidth
              label="Password *"
              name="password"
              type="password"
              value={formData.password}
              onChange={handleChange}
              margin="normal"
            />
            <TextField
              fullWidth
              label="Confirm Password *"
              name="confirmPassword"
              type="password"
              value={formData.confirmPassword}
              onChange={handleChange}
              margin="normal"
            />
          </>
        );
      case 2:
        return (
          <FormControlLabel
            control={
              <Checkbox
                checked={formData.agreeTerms}
                onChange={handleChange}
                name="agreeTerms"
                sx={{ color: "#2F66FF" }}
              />
            }
            label="I agree to the Terms and Conditions"
          />
        );
      default:
        return null;
    }
  };

  return (
    <Box
      sx={{
        minHeight: "100vh",
        background:
          "linear-gradient(180deg, #0f172a 0%, #1e293b 50%, #334155 100%)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        p: 2,
      }}
    >
      <Card
        sx={{ maxWidth: 500, width: "100%", borderRadius: 3, boxShadow: 6 }}
      >
        <CardContent sx={{ p: 5 }}>
          <Box sx={{ textAlign: "center", mb: 3 }}>
            <LockOutlinedIcon sx={{ fontSize: 50, color: "#2F66FF", mb: 1 }} />
            <Typography variant="h4" sx={{ fontWeight: 700, color: "#1e293b" }}>
              Vendor Registration
            </Typography>
            <Typography variant="body2" sx={{ color: "#64748b", mt: 1 }}>
              Create your vendor account to start selling products
            </Typography>
          </Box>

          {error && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {error}
            </Alert>
          )}

          <Stepper activeStep={activeStep} alternativeLabel sx={{ mb: 4 }}>
            {steps.map((label) => (
              <Step key={label}>
                <StepLabel>{label}</StepLabel>
              </Step>
            ))}
          </Stepper>

          <Box component="form">
            {renderStepContent(activeStep)}

            <Box
              sx={{ display: "flex", justifyContent: "space-between", mt: 4 }}
            >
              {activeStep > 0 && (
                <Button onClick={handleBack} variant="outlined">
                  Back
                </Button>
              )}

              {activeStep < steps.length - 1 ? (
                <Button
                  onClick={handleNext}
                  variant="contained"
                  sx={{ ml: "auto" }}
                >
                  Next
                </Button>
              ) : (
                <Button
                  onClick={handleSubmit}
                  variant="contained"
                  disabled={loading || !formData.agreeTerms}
                  sx={{ ml: "auto" }}
                >
                  {loading ? "Creating Account..." : "Create Account"}
                </Button>
              )}
            </Box>
          </Box>

          <Typography
            variant="body2"
            align="center"
            sx={{ mt: 3, color: "#64748b" }}
          >
            Already have an account?{" "}
            <Button
              variant="text"
              onClick={() => navigate("/login")}
              sx={{ color: "#2F66FF", textTransform: "none" }}
            >
              Sign In
            </Button>
          </Typography>
        </CardContent>
      </Card>
    </Box>
  );
};

export default VendorSignup;
