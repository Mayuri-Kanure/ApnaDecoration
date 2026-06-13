import React, { useState, useEffect } from "react";
import { useRouter } from "next/router";
import dynamic from "next/dynamic";
import Head from "next/head";
import {
  Box,
  Card,
  CardContent,
  TextField,
  Button,
  Typography,
  Alert,
  LinearProgress,
  Avatar,
  Container,
  Snackbar,
} from "@mui/material";
import { Email, Lock, LocalShipping, ArrowBack } from "@mui/icons-material";
import { DELIVERY_API_URL } from "../../config/constants";
import {
  apiFetch,
  getApiErrorMessage,
  getNetworkErrorMessage,
} from "../../utils/apiFetch";
import toast from "react-hot-toast";
import { validateDeliveryLogin } from "../../utils/formValidation";

function DeliveryBoyLogin() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });
  const [loading, setLoading] = useState(false);
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: "",
    severity: "success",
  });
  const [fieldErrors, setFieldErrors] = useState({});

  useEffect(() => {
    // Check if already logged in
    const token = localStorage.getItem("deliveryBoyToken");
    if (token) {
      router.push("/dashboard");
      return;
    }

    // Handle keyboard visibility and scroll input into view
    const handleFocus = () => {
      setTimeout(() => {
        if (document.activeElement) {
          document.activeElement.scrollIntoView({
            behavior: "smooth",
            block: "center",
          });
        }
      }, 300);
    };

    const handleBlur = () => {
      // Reset scroll position when keyboard closes
      setTimeout(() => {
        window.scrollTo(0, 0);
      }, 300);
    };

    window.addEventListener("focusin", handleFocus);
    window.addEventListener("focusout", handleBlur);

    return () => {
      window.removeEventListener("focusin", handleFocus);
      window.removeEventListener("focusout", handleBlur);
    };
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
    if (fieldErrors[name]) {
      setFieldErrors((prev) => ({ ...prev, [name]: "" }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const validation = validateDeliveryLogin(formData);
    if (!validation.valid) {
      setFieldErrors(validation.errors);
      setSnackbar({
        open: true,
        message: validation.message,
        severity: "error",
      });
      return;
    }
    setFieldErrors({});
    setLoading(true);
    setSnackbar({ open: false, message: "", severity: "success" });

    try {
      const response = await apiFetch(`${DELIVERY_API_URL}/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (response.ok) {
        // Save token and user data
        localStorage.setItem("deliveryBoyToken", data.data.token);
        localStorage.setItem(
          "deliveryBoyUser",
          JSON.stringify(data.data.deliveryBoy),
        );

        toast.success("Login successful!");

        // Redirect to dashboard
        setTimeout(() => {
          router.push("/dashboard");
        }, 1500);
      } else {
        setSnackbar({
          open: true,
          message: getApiErrorMessage(
            data,
            "Login failed. Please check your credentials.",
          ),
          severity: "error",
        });
      }
    } catch (error) {
      console.error("Login error:", error);
      setSnackbar({
        open: true,
        message: getNetworkErrorMessage(error),
        severity: "error",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Head>
        <title>Delivery Boy Login - APNA Decoration</title>
        <meta
          name="description"
          content="Login to APNA Decoration delivery boy portal"
        />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <Box
        sx={{
          minHeight: "100vh",
          backgroundColor: "#F5F5F5", // Admin background color
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          py: 4,
          px: 2,
        }}
      >
        <Container
          maxWidth="sm"
          sx={{ display: "flex", justifyContent: "center" }}
        >
          <Card
            sx={{
              maxWidth: 400,
              width: "100%",
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
                  APNA Delivery
                </Typography>
                <Typography variant="body2" color="textSecondary">
                  Delivery Boy Portal
                </Typography>
              </Box>

              {/* Login Form */}
              <Box component="form" onSubmit={handleSubmit}>
                <TextField
                  fullWidth
                  label="Email Address"
                  name="email"
                  type="email"
                  value={formData.email}
                  onChange={handleChange}
                  margin="normal"
                  required
                  error={!!fieldErrors.email}
                  helperText={fieldErrors.email || " "}
                  autoComplete="email"
                />

                <TextField
                  fullWidth
                  label="Password"
                  name="password"
                  type="password"
                  value={formData.password}
                  onChange={handleChange}
                  margin="normal"
                  required
                  error={!!fieldErrors.password}
                  helperText={fieldErrors.password || " "}
                  autoComplete="current-password"
                />

                <Button
                  type="submit"
                  fullWidth
                  variant="contained"
                  size="large"
                  disabled={loading}
                  sx={{
                    mt: 3,
                    mb: 2,
                    py: 1.5,
                    backgroundColor: "#1e3a5f", // Admin primary color
                    "&:hover": {
                      backgroundColor: "#2d5a8c", // Admin secondary color
                    },
                  }}
                >
                  {loading ? (
                    <Box sx={{ display: "flex", alignItems: "center" }}>
                      <LinearProgress sx={{ mr: 1, width: 20 }} />
                      Signing in...
                    </Box>
                  ) : (
                    "Sign In"
                  )}
                </Button>

                {/* Additional Options */}
                <Box sx={{ mt: 3, textAlign: "center" }}>
                  <Typography variant="body2" color="textSecondary">
                    Don't have an account?{" "}
                    <Button
                      color="primary"
                      onClick={() => router.push("/auth/register")}
                      sx={{ color: "#1e3a5f" }} // Admin primary color
                    >
                      Register here
                    </Button>
                  </Typography>
                </Box>
              </Box>

              {/* Back Button */}
              <Box sx={{ mt: 2, textAlign: "center" }}>
                <Button
                  startIcon={<ArrowBack />}
                  onClick={() => router.push("/")}
                  variant="outlined"
                  sx={{
                    borderColor: "#1e3a5f", // Admin primary color
                    color: "#1e3a5f", // Admin primary color
                    "&:hover": {
                      borderColor: "#2d5a8c", // Admin secondary color
                      backgroundColor: "rgba(30, 58, 95, 0.04)",
                    },
                  }}
                >
                  Back to Home
                </Button>
              </Box>
            </CardContent>
          </Card>
        </Container>

        <Snackbar
          open={snackbar.open}
          autoHideDuration={6000}
          onClose={() => setSnackbar({ ...snackbar, open: false })}
        >
          <Alert
            severity={snackbar.severity}
            onClose={() => setSnackbar({ ...snackbar, open: false })}
          >
            {snackbar.message}
          </Alert>
        </Snackbar>
      </Box>
    </>
  );
}
export default dynamic(() => Promise.resolve(DeliveryBoyLogin), {
  ssr: false,
});
