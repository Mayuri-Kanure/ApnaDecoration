// src/pages/BusinessSettings.js
import React, { useState, useEffect } from "react";
import axios from "axios";
import {
  Box,
  Card,
  CardContent,
  Typography,
  Grid,
  Switch,
  FormControlLabel,
  Tooltip,
  IconButton,
  TextField,
  Button,
  Avatar,
  Stack,
  Divider,
  InputAdornment,
  Paper,
} from "@mui/material";
import {
  Edit as EditIcon,
  FlightTakeoff as VacationIcon,
  Language as VisitIcon,
  InfoOutlined as InfoIcon,
  Save as SaveIcon,
} from "@mui/icons-material";

const API_BASE = process.env.REACT_APP_API_BASE || "https://admin-api.apnadecoration.com/api"; // change if you have backend

export default function InhouseShop() {
  // --- component state
  const [saving, setSaving] = useState(false);

  // Shop-related state (simulate fetch)
  const [shop, setShop] = useState({
    id: "shop_001",
    name: "PrintForMee Shop",
    createdAt: "06 Dec, 2025",
    bannerUrl: "", // optional: base64 or url
    logoUrl: "", // optional
    tempClosed: false,
    minimumOrderAmount: 299,
    freeDeliveryOver: 299,
  });

  // When component mounts, fetch real shop data
  useEffect(() => {
    fetchShop();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // --- optional: fetch shop from API
  async function fetchShop() {
    try {
      const res = await axios.get(`${API_BASE}/admin-settings`); // use correct endpoint
      if (res.data) {
        setShop((prev) => ({ 
          ...prev, 
          name: res.data.businessName || 'PrintForMee Shop',
          minimumOrderAmount: res.data.minimumOrderAmount || 299,
          freeDeliveryOver: res.data.freeDeliveryOver || 299,
          tempClosed: res.data.tempClosed || false
        }));
      }
    } catch (err) {
      console.error("Failed to load shop settings:", err);
      // keep defaults
    }
  }

  // --- handlers
  const handleToggleTempClose = (e) => {
    setShop((s) => ({ ...s, tempClosed: e.target.checked }));
  };

  const handleFieldChange = (field) => (e) => {
    const value = e.target.value;
    // keep numbers as numbers when appropriate
    setShop((s) => ({
      ...s,
      [field]:
        field === "minimumOrderAmount" || field === "freeDeliveryOver"
          ? value === "" ? "" : Number(value)
          : value,
    }));
  };

  const handleSave = async () => {
    // basic validation
    if (
      shop.minimumOrderAmount === "" ||
      isNaN(Number(shop.minimumOrderAmount))
    ) {
      alert("Please enter a valid Minimum Order Amount.");
      return;
    }
    if (shop.freeDeliveryOver === "" || isNaN(Number(shop.freeDeliveryOver))) {
      alert("Please enter a valid Free Delivery Over Amount.");
      return;
    }

    setSaving(true);
    try {
      // Call API to save shop settings
      const shopData = {
        businessName: shop.name,
        minimumOrderAmount: shop.minimumOrderAmount,
        freeDeliveryOver: shop.freeDeliveryOver,
        tempClosed: shop.tempClosed
      };
      
      const res = await axios.put(`${API_BASE}/admin-settings`, shopData);
      
      setSaving(false);
      alert("Shop settings saved successfully!");
      console.log("Shop settings saved:", res.data);
    } catch (err) {
      console.error("Save failed:", err);
      setSaving(false);
      alert("Failed to save. See console for details.");
    }
  };

  const handleEditShop = () => {
    // navigate to edit page or show a dialog
    alert("Open Edit Shop page (implement navigation).");
  };

  const handleVacationMode = () => {
    alert("Go to Vacation Mode settings (implement navigation).");
  };

  const handleVisitWebsite = () => {
    // open public shop in new tab
    const publicUrl = `/shop/${shop.id}`; // change to real public url if available
    window.open(publicUrl, "_blank", "noopener,noreferrer");
  };

  // --- small helper for formatted currency input (just display)
  const formatCurrency = (v) => {
    if (v === "" || v === null || v === undefined) return "";
    return Number(v).toString();
  };

  // --- UI rendering
  return (
    <Box sx={{ p: { xs: 2, md: 3 } }}>
      <Typography variant="h5" sx={{ mb: 2, fontWeight: 600 }}>
        Business Setup
      </Typography>

      {/* Temporary Close Card */}
      <Card variant="outlined" sx={{ mb: 3 }}>
        <CardContent>
          <Grid container alignItems="center" spacing={2}>
            <Grid item xs={12} md={10}>
              <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
                Temporary close
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                *By turning on the "Temporary Close" Button admin can pause his shop
                activities and his shop will be shown as "Temporary Close" in the
                system . Customers will not be able to order or purchase from his shop
              </Typography>
            </Grid>

            <Grid item xs={12} md={2} sx={{ textAlign: { xs: "left", md: "right" } }}>
              <FormControlLabel
                control={
                  <Switch
                    checked={!!shop.tempClosed}
                    onChange={handleToggleTempClose}
                    color="primary"
                    inputProps={{ "aria-label": "temporary close toggle" }}
                  />
                }
                label={shop.tempClosed ? "Closed" : "Open"}
                labelPlacement="start"
                sx={{ m: 0 }}
              />
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      {/* Shop Details Card */}
      <Card variant="outlined" sx={{ mb: 3 }}>
        <CardContent>
          <Grid container spacing={2}>
            <Grid item xs={12}>
              <Typography variant="h6" sx={{ fontWeight: 700 }}>
                Shop Details
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                Created at {shop.createdAt}
              </Typography>
            </Grid>

            {/* Banner */}
            <Grid item xs={12}>
              <Paper
                elevation={0}
                sx={{
                  borderRadius: 1,
                  overflow: "hidden",
                  background:
                    "linear-gradient(135deg,#0f3b73 0%, #082b57 40%, rgba(10,30,60,0.9) 60%)",
                  position: "relative",
                  minHeight: 120,
                  display: "flex",
                  alignItems: "center",
                  p: 2,
                }}
              >
                {/* Logo placeholder */}
                <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
                  <Avatar
                    variant="rounded"
                    sx={{
                      width: 96,
                      height: 56,
                      bgcolor: "#fff",
                      border: "1px solid rgba(255,255,255,0.12)",
                      boxShadow: "0 2px 8px rgba(0,0,0,0.12)",
                    }}
                    src={shop.logoUrl || ""}
                  >
                    {/* fallback icon/initial */}
                    {!shop.logoUrl && shop.name ? shop.name.charAt(0) : null}
                  </Avatar>

                  <Box>
                    <Typography variant="h6" sx={{ color: "#fff", fontWeight: 700 }}>
                      {shop.name}
                    </Typography>

                    <Stack direction="row" spacing={1} sx={{ mt: 1 }}>
                      <Button
                        variant="text"
                        size="small"
                        startIcon={<VisitIcon />}
                        onClick={handleVisitWebsite}
                        sx={{
                          color: "#fff",
                          "&:hover": { backgroundColor: "rgba(255,255,255,0.1)" },
                        }}
                      >
                        Visit website
                      </Button>
                    </Stack>
                  </Box>
                </Box>

                {/* Right-aligned action buttons */}
                <Box sx={{ position: "absolute", right: 12, top: 12, display: "flex", gap: 1 }}>
                  <Button
                    variant="outlined"
                    size="small"
                    startIcon={<VacationIcon />}
                    onClick={handleVacationMode}
                    sx={{ borderColor: "rgba(255,255,255,0.18)", color: "rgba(255,255,255,0.9)" }}
                  >
                    Go to Vacation Mode
                  </Button>

                  <Button
                    variant="contained"
                    size="small"
                    startIcon={<EditIcon />}
                    onClick={handleEditShop}
                    sx={{ backgroundColor: "#0b66b3", "&:hover": { backgroundColor: "#095c9d" } }}
                  >
                    Edit shop
                  </Button>
                </Box>
              </Paper>
            </Grid>

            {/* Shop Settings */}
            <Grid item xs={12}>
              <Card variant="outlined" sx={{ borderRadius: 1 }}>
                <CardContent>
                  <Grid container spacing={2} alignItems="center">
                    <Grid item xs={12}>
                      <Box display="flex" alignItems="center" gap={1}>
                        <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
                          Shop Settings
                        </Typography>
                      </Box>
                    </Grid>

                    <Grid item xs={12} md={6}>
                      <TextField
                        fullWidth
                        label={
                          <span>
                            Minimum Order Amount &nbsp;
                            <Tooltip title="Minimum order price required to place an order">
                              <InfoIcon sx={{ fontSize: 16, verticalAlign: "middle" }} />
                            </Tooltip>
                          </span>
                        }
                        value={formatCurrency(shop.minimumOrderAmount)}
                        onChange={handleFieldChange("minimumOrderAmount")}
                        InputProps={{
                          startAdornment: <InputAdornment position="start">₹</InputAdornment>,
                          inputMode: "numeric",
                        }}
                      />
                    </Grid>

                    <Grid item xs={12} md={6}>
                      <TextField
                        fullWidth
                        label="Free Delivery Over Amount (₹)"
                        value={formatCurrency(shop.freeDeliveryOver)}
                        onChange={handleFieldChange("freeDeliveryOver")}
                        InputProps={{
                          startAdornment: <InputAdornment position="start">₹</InputAdornment>,
                          inputMode: "numeric",
                        }}
                      />
                    </Grid>
                  </Grid>
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      {/* Save area */}
      <Box sx={{ display: "flex", justifyContent: "flex-end", gap: 2 }}>
        <Divider sx={{ flex: "1 1 auto", display: { xs: "none", md: "block" } }} />
        <Button
          variant="contained"
          startIcon={<SaveIcon />}
          onClick={handleSave}
          disabled={saving}
          sx={{ minWidth: 160 }}
        >
          {saving ? "Saving..." : "Save information"}
        </Button>
      </Box>
    </Box>
  );
}

// small util used inside component
function formatCurrencyUtil(v) {
  if (v === "" || v === undefined || v === null) return "";
  return Number(v).toString();
}
