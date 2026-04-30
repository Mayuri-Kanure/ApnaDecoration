// AddVendor.jsx
import React, { useState } from "react";
import {
  Box,
  Card,
  CardContent,
  Typography,
  Grid,
  TextField,
  Button,
  IconButton,
  InputAdornment,
} from "@mui/material";
import { Visibility, VisibilityOff, UploadFile } from "@mui/icons-material";
import axios from "axios";

const API_BASE_URL =
  process.env.REACT_APP_API_URL || "https://admin-api.apnadecoration.com/api";

const initialForm = {
  firstName: "",
  lastName: "",
  countryCode: "+91",
  phone: "",
  email: "",
  password: "",
  confirmPassword: "",
  shopName: "",
  shopAddress: "",
};

export default function AddVendor() {
  const [form, setForm] = useState(initialForm);
  const [passwordVisible, setPasswordVisible] = useState(false);
  const [confirmVisible, setConfirmVisible] = useState(false);
  const [vendorImageFile, setVendorImageFile] = useState(null);
  const [logoFile, setLogoFile] = useState(null);
  const [bannerFile, setBannerFile] = useState(null);
  const [vendorImagePreview, setVendorImagePreview] = useState(null);
  const [logoPreview, setLogoPreview] = useState(null);
  const [bannerPreview, setBannerPreview] = useState(null);
  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);

  // Basic client-side validation rules
  const validate = () => {
    const e = {};
    if (!form.firstName.trim()) e.firstName = "First name required";
    if (!form.lastName.trim()) e.lastName = "Last name required";
    if (!/^\d{7,15}$/.test(form.phone))
      e.phone = "Enter valid phone (digits only)";
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email))
      e.email = "Invalid email";
    if (!form.password || form.password.length < 8) e.password = "Min 8 chars";
    if (form.password !== form.confirmPassword)
      e.confirmPassword = "Passwords do not match";
    if (!form.shopName.trim()) e.shopName = "Shop name required";
    if (!form.shopAddress.trim()) e.shopAddress = "Shop address required";
    return e;
  };

  const handleFileChange = (setterFile, setterPreview) => (ev) => {
    const f = ev.target.files[0];
    if (!f) return;
    // basic client-side file checks
    if (!["image/png", "image/jpeg", "image/jpg"].includes(f.type)) {
      alert("Only JPG/PNG allowed");
      return;
    }
    if (f.size > 4 * 1024 * 1024) {
      // 4MB
      alert("Max 4MB");
      return;
    }
    setterFile(f);
    setterPreview(URL.createObjectURL(f));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const e2 = validate();
    setErrors(e2);
    if (Object.keys(e2).length) return;

    setSubmitting(true);
    try {
      // Build multipart form data; backend will handle uploads to Cloudinary/S3
      const fd = new FormData();
      fd.append("firstName", form.firstName);
      fd.append("lastName", form.lastName);
      fd.append("countryCode", form.countryCode);
      fd.append("phone", form.phone);
      fd.append("email", form.email);
      fd.append("password", form.password);
      fd.append("shopName", form.shopName);
      fd.append("shopAddress", form.shopAddress);

      if (vendorImageFile) fd.append("vendorImage", vendorImageFile);
      if (logoFile) fd.append("shopLogo", logoFile);
      if (bannerFile) fd.append("shopBanner", bannerFile);

      const res = await axios.post(`${API_BASE_URL}/vendors`, fd, {
        headers: {
          "Content-Type": "multipart/form-data",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });

      alert("Vendor created");
      setForm(initialForm);
      setVendorImageFile(null);
      setLogoFile(null);
      setBannerFile(null);
      setVendorImagePreview(null);
      setLogoPreview(null);
      setBannerPreview(null);
    } catch (err) {
      console.error(err);
      alert(err?.response?.data?.message || "Failed");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h5" sx={{ mb: 2 }}>
        Add New Vendor
      </Typography>

      <form onSubmit={handleSubmit}>
        <Card sx={{ mb: 3 }}>
          <CardContent>
            <Typography variant="subtitle1">Vendor Information</Typography>
            <Grid container spacing={2} sx={{ mt: 1 }}>
              <Grid item xs={12} md={6}>
                <TextField
                  label="First Name"
                  fullWidth
                  value={form.firstName}
                  onChange={(e) =>
                    setForm({ ...form, firstName: e.target.value })
                  }
                  error={!!errors.firstName}
                  helperText={errors.firstName}
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  label="Last Name"
                  fullWidth
                  value={form.lastName}
                  onChange={(e) =>
                    setForm({ ...form, lastName: e.target.value })
                  }
                  error={!!errors.lastName}
                  helperText={errors.lastName}
                />
              </Grid>

              <Grid item xs={12} md={6}>
                <TextField
                  label="Phone"
                  fullWidth
                  placeholder="Enter phone number"
                  value={form.phone}
                  onChange={(e) =>
                    setForm({
                      ...form,
                      phone: e.target.value.replace(/\D/g, ""),
                    })
                  }
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        {form.countryCode}
                      </InputAdornment>
                    ),
                  }}
                  error={!!errors.phone}
                  helperText={errors.phone}
                />
              </Grid>

              <Grid
                item
                xs={12}
                md={6}
                sx={{ display: "flex", alignItems: "center", gap: 2 }}
              >
                <Box sx={{ flex: 1 }}>
                  <Button
                    variant="outlined"
                    component="label"
                    startIcon={<UploadFile />}
                  >
                    Upload Vendor Image
                    <input
                      hidden
                      type="file"
                      accept="image/*"
                      onChange={handleFileChange(
                        setVendorImageFile,
                        setVendorImagePreview,
                      )}
                    />
                  </Button>
                </Box>
                <Box
                  sx={{
                    width: 96,
                    height: 96,
                    border: "1px dashed #ddd",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  {vendorImagePreview ? (
                    <img
                      src={vendorImagePreview}
                      alt="preview"
                      style={{ maxWidth: "100%", maxHeight: "100%" }}
                    />
                  ) : (
                    "Preview"
                  )}
                </Box>
              </Grid>
            </Grid>
          </CardContent>
        </Card>

        <Card sx={{ mb: 3 }}>
          <CardContent>
            <Typography variant="subtitle1">Account Information</Typography>
            <Grid container spacing={2} sx={{ mt: 1 }}>
              <Grid item xs={12} md={6}>
                <TextField
                  label="Email"
                  fullWidth
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                  error={!!errors.email}
                  helperText={errors.email}
                />
              </Grid>
              <Grid item xs={12} md={3}>
                <TextField
                  label="Password"
                  type={passwordVisible ? "text" : "password"}
                  fullWidth
                  value={form.password}
                  onChange={(e) =>
                    setForm({ ...form, password: e.target.value })
                  }
                  autoComplete="new-password"
                  InputProps={{
                    endAdornment: (
                      <InputAdornment position="end">
                        <IconButton
                          size="small"
                          onClick={() => setPasswordVisible((v) => !v)}
                        >
                          {passwordVisible ? <VisibilityOff /> : <Visibility />}
                        </IconButton>
                      </InputAdornment>
                    ),
                  }}
                  error={!!errors.password}
                  helperText={errors.password}
                />
              </Grid>
              <Grid item xs={12} md={3}>
                <TextField
                  label="Confirm Password"
                  type={confirmVisible ? "text" : "password"}
                  fullWidth
                  value={form.confirmPassword}
                  onChange={(e) =>
                    setForm({ ...form, confirmPassword: e.target.value })
                  }
                  autoComplete="new-password"
                  InputProps={{
                    endAdornment: (
                      <InputAdornment position="end">
                        <IconButton
                          size="small"
                          onClick={() => setConfirmVisible((v) => !v)}
                        >
                          {confirmVisible ? <VisibilityOff /> : <Visibility />}
                        </IconButton>
                      </InputAdornment>
                    ),
                  }}
                  error={!!errors.confirmPassword}
                  helperText={errors.confirmPassword}
                />
              </Grid>
            </Grid>
          </CardContent>
        </Card>

        <Card sx={{ mb: 3 }}>
          <CardContent>
            <Typography variant="subtitle1">Shop Information</Typography>
            <Grid container spacing={2} sx={{ mt: 1 }}>
              <Grid item xs={12} md={6}>
                <TextField
                  label="Shop Name"
                  fullWidth
                  value={form.shopName}
                  onChange={(e) =>
                    setForm({ ...form, shopName: e.target.value })
                  }
                  error={!!errors.shopName}
                  helperText={errors.shopName}
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  label="Shop Address"
                  fullWidth
                  value={form.shopAddress}
                  onChange={(e) =>
                    setForm({ ...form, shopAddress: e.target.value })
                  }
                  error={!!errors.shopAddress}
                  helperText={errors.shopAddress}
                />
              </Grid>

              <Grid
                item
                xs={12}
                md={6}
                sx={{ display: "flex", gap: 2, alignItems: "center" }}
              >
                <Button
                  variant="outlined"
                  component="label"
                  startIcon={<UploadFile />}
                >
                  Upload Logo
                  <input
                    hidden
                    type="file"
                    accept="image/*"
                    onChange={handleFileChange(setLogoFile, setLogoPreview)}
                  />
                </Button>
                <Box
                  sx={{
                    width: 96,
                    height: 96,
                    border: "1px dashed #ddd",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  {logoPreview ? (
                    <img
                      src={logoPreview}
                      alt="logo"
                      style={{ maxWidth: "100%", maxHeight: "100%" }}
                    />
                  ) : (
                    "Logo"
                  )}
                </Box>
              </Grid>

              <Grid
                item
                xs={12}
                md={6}
                sx={{ display: "flex", gap: 2, alignItems: "center" }}
              >
                <Button
                  variant="outlined"
                  component="label"
                  startIcon={<UploadFile />}
                >
                  Upload Banner
                  <input
                    hidden
                    type="file"
                    accept="image/*"
                    onChange={handleFileChange(setBannerFile, setBannerPreview)}
                  />
                </Button>
                <Box
                  sx={{
                    flex: 1,
                    height: 96,
                    border: "1px dashed #ddd",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  {bannerPreview ? (
                    <img
                      src={bannerPreview}
                      alt="banner"
                      style={{ maxWidth: "100%", maxHeight: "100%" }}
                    />
                  ) : (
                    "Banner"
                  )}
                </Box>
              </Grid>
            </Grid>
          </CardContent>
          <Box
            sx={{ display: "flex", justifyContent: "flex-end", gap: 2, p: 2 }}
          >
            <Button
              variant="outlined"
              onClick={() => {
                setForm(initialForm);
                setLogoFile(null);
                setBannerFile(null);
                setVendorImageFile(null);
                setLogoPreview(null);
                setBannerPreview(null);
                setVendorImagePreview(null);
              }}
            >
              Reset
            </Button>
            <Button variant="contained" type="submit" disabled={submitting}>
              {submitting ? "Saving..." : "Submit"}
            </Button>
          </Box>
        </Card>
      </form>
    </Box>
  );
}
