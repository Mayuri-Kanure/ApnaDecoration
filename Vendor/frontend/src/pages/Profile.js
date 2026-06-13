import React, { useState, useEffect } from "react";
import { useAuth } from "../contexts/AuthContext";
import {
  Box,
  Card,
  CardContent,
  Typography,
  TextField,
  Button,
  Grid,
  Avatar,
  Alert,
  MenuItem,
  Switch,
  FormControlLabel,
} from "@mui/material";
import {
  Person as PersonIcon,
  Email as EmailIcon,
  Phone as PhoneIcon,
  Store as StoreIcon,
  Save as SaveIcon,
  Lock as LockIcon,
  Business as BusinessIcon,
  LocationOn as LocationIcon,
  Web as WebIcon,
  Description as DescriptionIcon,
  Notifications as NotificationsIcon,
} from "@mui/icons-material";

const Profile = () => {
  const { user, updateProfile } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [editMode, setEditMode] = useState(false);

  const [profileData, setProfileData] = useState({
    name: "",
    email: "",
    phone: "",
    username: "",
    avatar: "",
    businessName: "",
    businessType: "",
    address: "",
    city: "",
    state: "",
    postalCode: "",
    country: "",
    website: "",
    description: "",
    gstNumber: "",
    panNumber: "",
    establishedYear: "",
  });

  const [passwordData, setPasswordData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  const [pushEnabled, setPushEnabled] = useState(
    () => localStorage.getItem("vendorPushEnabled") === "true",
  );

  useEffect(() => {
    // Load vendor profile data
    loadProfileData();
  }, [user]); // Add user dependency to reload when user data changes

  const loadProfileData = () => {
    console.log("🔍 Profile - User data from AuthContext:", user);
    console.log(
      "🔍 Profile - User data keys:",
      user ? Object.keys(user) : "No user data",
    );

    if (user) {
      const profile = {
        name: user.name || user.firstName || user.businessName || "Vendor Name",
        email: user.email || "vendor@example.com",
        phone: user.phone || user.phoneNumber || "Not provided",
        username: user.username || user.email?.split("@")[0] || "vendor",
        avatar: user.avatar || user.profileImage || "",
        businessName: user.businessName || "",
        businessType: user.businessType || "Retail",
        address: user.address || "",
        city: user.city || "",
        state: user.state || "",
        postalCode: user.postalCode || "",
        country: user.country || "India",
        website: user.website || "",
        description: user.description || "",
        gstNumber: user.gstNumber || "",
        panNumber: user.panNumber || "",
        establishedYear: user.establishedYear || new Date().getFullYear() - 5,
      };

      console.log("🔍 Profile - Processed profile data:", profile);
      setProfileData(profile);
    } else {
      console.log("❌ Profile - No user data available");
    }
  };

  const handleProfileChange = (e) => {
    const { name, value } = e.target;
    setProfileData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handlePasswordChange = (e) => {
    const { name, value } = e.target;
    setPasswordData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSaveProfile = async () => {
    try {
      setLoading(true);
      setError("");
      setSuccess("");

      // API call to update profile
      console.log("Saving profile:", profileData);

      // Call the updateProfile function from AuthContext
      console.log("🔄 Profile - Calling updateProfile with data:", profileData);
      const result = await updateProfile(profileData);
      console.log("📤 Profile - Update result:", result);

      if (result.success) {
        console.log("✅ Profile - Update successful");
        setSuccess("Profile updated successfully!");
        setEditMode(false);
        // Reload profile data to show updated values
        setTimeout(() => loadProfileData(), 1000);
      } else {
        console.log("❌ Profile - Update failed:", result.error);
        setError(result.error || "Failed to update profile");
      }
    } catch (error) {
      console.error("Error updating profile:", error);
      setError("Failed to update profile");
    } finally {
      setLoading(false);
    }
  };

  const handleChangePassword = async () => {
    try {
      setLoading(true);
      setError("");
      setSuccess("");

      // Validate passwords
      if (passwordData.newPassword !== passwordData.confirmPassword) {
        setError("New passwords do not match");
        return;
      }

      if (passwordData.newPassword.length < 6) {
        setError("Password must be at least 6 characters long");
        return;
      }

      // API call to change password
      // PUT /api/vendor/password
      console.log("Changing password");

      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1000));

      setSuccess("Password changed successfully!");
      setPasswordData({
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
      });
    } catch (error) {
      setError("Failed to change password");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box sx={{ backgroundColor: "#f8fafc", minHeight: "100vh" }}>
      <Typography
        variant="h4"
        sx={{ fontWeight: 600, color: "#1e293b", mb: 3 }}
      >
        My Profile
      </Typography>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      {success && (
        <Alert severity="success" sx={{ mb: 3 }}>
          {success}
        </Alert>
      )}

      <Grid container spacing={3}>
        {/* Profile Information */}
        <Grid item xs={12} md={8}>
          <Card>
            <CardContent sx={{ p: 4 }}>
              <Box
                sx={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  mb: 3,
                }}
              >
                <Typography variant="h6" sx={{ fontWeight: 600 }}>
                  Profile Information
                </Typography>
                <Button
                  variant={editMode ? "outlined" : "contained"}
                  onClick={() => setEditMode(!editMode)}
                >
                  {editMode ? "Cancel" : "Edit Profile"}
                </Button>
              </Box>

              <Box sx={{ display: "flex", alignItems: "center", mb: 3 }}>
                <Avatar
                  sx={{
                    width: 80,
                    height: 80,
                    mr: 3,
                    backgroundColor: "#1976d2",
                  }}
                >
                  <PersonIcon sx={{ fontSize: 40 }} />
                </Avatar>
                <Box>
                  <Typography variant="h6">
                    {profileData.name || "Vendor Name"}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {profileData.email || "vendor@example.com"}
                  </Typography>
                </Box>
              </Box>

              <Grid container spacing={3}>
                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    label="Name"
                    name="name"
                    value={profileData.name}
                    onChange={handleProfileChange}
                    disabled={!editMode}
                  />
                </Grid>
                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    label="Username"
                    name="username"
                    value={profileData.username}
                    onChange={handleProfileChange}
                    disabled={!editMode}
                  />
                </Grid>
                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    label="Phone"
                    name="phone"
                    value={profileData.phone}
                    onChange={handleProfileChange}
                    disabled={!editMode}
                  />
                </Grid>
                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    label="Business Name"
                    name="businessName"
                    value={profileData.businessName}
                    onChange={handleProfileChange}
                    disabled={!editMode}
                  />
                </Grid>
                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    label="Business Type"
                    name="businessType"
                    value={profileData.businessType}
                    onChange={handleProfileChange}
                    disabled={!editMode}
                    select
                  >
                    <MenuItem value="Retail">Retail</MenuItem>
                    <MenuItem value="Wholesale">Wholesale</MenuItem>
                    <MenuItem value="Manufacturing">Manufacturing</MenuItem>
                    <MenuItem value="Service">Service</MenuItem>
                    <MenuItem value="E-commerce">E-commerce</MenuItem>
                    <MenuItem value="Distributor">Distributor</MenuItem>
                    <MenuItem value="Other">Other</MenuItem>
                  </TextField>
                </Grid>
                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    label="Website"
                    name="website"
                    value={profileData.website}
                    onChange={handleProfileChange}
                    disabled={!editMode}
                  />
                </Grid>
                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    label="Address"
                    name="address"
                    value={profileData.address}
                    onChange={handleProfileChange}
                    disabled={!editMode}
                    multiline
                    rows={2}
                  />
                </Grid>
                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    label="City"
                    name="city"
                    value={profileData.city}
                    onChange={handleProfileChange}
                    disabled={!editMode}
                  />
                </Grid>
                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    label="State"
                    name="state"
                    value={profileData.state}
                    onChange={handleProfileChange}
                    disabled={!editMode}
                  />
                </Grid>
                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    label="Postal Code"
                    name="postalCode"
                    value={profileData.postalCode}
                    onChange={handleProfileChange}
                    disabled={!editMode}
                  />
                </Grid>
                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    label="Country"
                    name="country"
                    value={profileData.country}
                    onChange={handleProfileChange}
                    disabled={!editMode}
                  />
                </Grid>
                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    label="GST Number"
                    name="gstNumber"
                    value={profileData.gstNumber}
                    onChange={handleProfileChange}
                    disabled={!editMode}
                  />
                </Grid>
                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    label="PAN Number"
                    name="panNumber"
                    value={profileData.panNumber}
                    onChange={handleProfileChange}
                    disabled={!editMode}
                  />
                </Grid>
                <Grid item xs={12} md={12}>
                  <TextField
                    fullWidth
                    label="Business Description"
                    name="description"
                    value={profileData.description}
                    onChange={handleProfileChange}
                    disabled={!editMode}
                    multiline
                    rows={4}
                  />
                </Grid>
                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    label="Established Year"
                    name="establishedYear"
                    value={profileData.establishedYear}
                    onChange={handleProfileChange}
                    disabled={!editMode}
                    type="number"
                  />
                </Grid>
                <Grid item xs={12}>
                  <Button
                    type="submit"
                    variant="contained"
                    color="primary"
                    startIcon={<SaveIcon />}
                    onClick={handleSaveProfile}
                    disabled={loading || !editMode}
                    sx={{ mt: 2 }}
                  >
                    {loading ? "Saving..." : "Save Changes"}
                  </Button>
                </Grid>
              </Grid>
            </CardContent>
          </Card>
        </Grid>

        {/* Password Change Section */}
        <Grid item xs={12} md={4}>
          <Card>
            <CardContent sx={{ p: 4 }}>
              <Box
                sx={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  mb: 3,
                }}
              >
                <Typography variant="h6" sx={{ fontWeight: 600 }}>
                  Change Password
                </Typography>
              </Box>

              <Grid container spacing={3}>
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="Current Password"
                    name="currentPassword"
                    type="password"
                    value={passwordData.currentPassword}
                    onChange={handlePasswordChange}
                    disabled={!editMode}
                  />
                </Grid>
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="New Password"
                    name="newPassword"
                    type="password"
                    value={passwordData.newPassword}
                    onChange={handlePasswordChange}
                    disabled={!editMode}
                  />
                </Grid>
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="Confirm New Password"
                    name="confirmPassword"
                    type="password"
                    value={passwordData.confirmPassword}
                    onChange={handlePasswordChange}
                    disabled={!editMode}
                  />
                </Grid>
                <Grid item xs={12}>
                  <Button
                    type="submit"
                    variant="contained"
                    color="secondary"
                    startIcon={<LockIcon />}
                    onClick={handleChangePassword}
                    disabled={loading || !editMode}
                    sx={{ mt: 2 }}
                  >
                    {loading ? "Changing..." : "Change Password"}
                  </Button>
                </Grid>
              </Grid>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                <NotificationsIcon color="primary" />
                Push Notifications
              </Typography>
              <FormControlLabel
                control={
                  <Switch
                    checked={pushEnabled}
                    onChange={async (e) => {
                      const on = e.target.checked;
                      try {
                        const push = (await import("../services/pushNotificationService")).default;
                        if (on) {
                          await push.enablePush();
                          localStorage.setItem("vendorPushEnabled", "true");
                        } else {
                          await push.disablePush();
                          localStorage.setItem("vendorPushEnabled", "false");
                        }
                        setPushEnabled(on);
                        setSuccess(on ? "Push notifications enabled" : "Push notifications disabled");
                      } catch (err) {
                        setError(err.message || "Failed to update push settings");
                      }
                    }}
                  />
                }
                label="Order alerts on this device (APK)"
              />
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
};

export default Profile;
