import React, { useState } from "react";
import {
  Box,
  Card,
  CardContent,
  Typography,
  TextField,
  Button,
  IconButton,
  Tooltip,
  Snackbar,
  Alert,
  Grid,
  FormControlLabel,
  Radio,
  RadioGroup,
  FormControl,
  FormLabel,
  Checkbox,
  Select,
  MenuItem,
  InputLabel,
  Paper,
  CircularProgress,
  Link,
} from "@mui/material";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import CloudUploadIcon from "@mui/icons-material/CloudUpload";
import InfoOutlinedIcon from "@mui/icons-material/InfoOutlined";
import HelpOutlineIcon from "@mui/icons-material/HelpOutline";

const DefaultMetaSettings = () => {
  const [saving, setSaving] = useState(false);
  const [snackbar, setSnackbar] = useState({ open: false, severity: "success", msg: "" });
  
  // Form state
  const [formData, setFormData] = useState({
    metaTitle: '',
    metaDescription: '',
    canonicalUrl: '',
    ogImage: null,
    ogImageUrl: '',
    robotsIndex: 'index',
    robotsNoFollow: false,
    robotsNoArchive: false,
    robotsNoImageIndex: false,
    robotsNoSnippet: false,
    maxSnippet: '',
    maxVideoPreview: '',
    maxImagePreview: 'standard'
  });

  // Character counters
  const [titleCount, setTitleCount] = useState(0);
  const [descriptionCount, setDescriptionCount] = useState(0);

  const handleChange = (field) => (e) => {
    const value = e.target.value;
    setFormData(prev => ({ ...prev, [field]: value }));
    
    // Update character counts
    if (field === 'metaTitle') setTitleCount(value.length);
    if (field === 'metaDescription') setDescriptionCount(value.length);
  };

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Validate file type and size
      const validTypes = ['image/jpeg', 'image/jpg', 'image/png'];
      const maxSize = 2 * 1024 * 1024; // 2MB
      
      if (!validTypes.includes(file.type)) {
        setSnackbar({ open: true, severity: "error", msg: "Please upload JPG, JPEG, or PNG file only" });
        return;
      }
      
      if (file.size > maxSize) {
        setSnackbar({ open: true, severity: "error", msg: "File size must be less than 2MB" });
        return;
      }
      
      // Create preview URL
      const imageUrl = URL.createObjectURL(file);
      setFormData(prev => ({ ...prev, ogImage: file, ogImageUrl: imageUrl }));
      setSnackbar({ open: true, severity: "success", msg: "Image uploaded successfully!" });
    }
  };

  const handleSubmit = async () => {
    try {
      setSaving(true);
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1500));
      setSnackbar({ open: true, severity: "success", msg: "Default meta settings saved successfully!" });
    } catch (err) {
      console.error("Error saving settings:", err);
      setSnackbar({ open: true, severity: "error", msg: "Failed to save settings" });
    } finally {
      setSaving(false);
    }
  };

  const handleReset = () => {
    setFormData({
      metaTitle: '',
      metaDescription: '',
      canonicalUrl: '',
      ogImage: null,
      ogImageUrl: '',
      robotsIndex: 'index',
      robotsNoFollow: false,
      robotsNoArchive: false,
      robotsNoImageIndex: false,
      robotsNoSnippet: false,
      maxSnippet: '',
      maxVideoPreview: '',
      maxImagePreview: 'standard'
    });
    setTitleCount(0);
    setDescriptionCount(0);
    setSnackbar({ open: true, severity: "info", msg: "Form reset successfully" });
  };

  return (
    <Box sx={{ p: 3, backgroundColor: '#f5f5f5', minHeight: '100vh' }}>
      {/* Header */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <IconButton
            onClick={() => {
              // Navigate back to SEO Settings with Robots Meta Content tab active
              window.location.href = '/seo-settings?tab=robots-meta';
            }}
            sx={{ backgroundColor: 'white', boxShadow: 1 }}
          >
            <ArrowBackIcon />
          </IconButton>
          <Typography variant="h5" sx={{ fontWeight: 600 }}>
            Robots Meta Content & OG Meta Content
          </Typography>
        </Box>
      </Box>

      {/* Main Content */}
      <Grid container spacing={3}>
        {/* Left Column - Text Inputs */}
        <Grid item xs={12} md={8}>
          <Card sx={{ p: 3, boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }}>
            <Typography variant="h6" sx={{ mb: 3, fontWeight: 600 }}>
              Meta Content Settings
            </Typography>

            {/* Meta Title */}
            <Box sx={{ mb: 3 }}>
              <TextField
                fullWidth
                label="Meta Title"
                placeholder="Enter your meta title (ideal: 60 characters)"
                value={formData.metaTitle}
                onChange={handleChange('metaTitle')}
                inputProps={{ maxLength: 120 }}
                helperText={`${titleCount}/120 characters (ideal: 60)`}
                sx={{ mb: 1 }}
              />
              <Typography variant="body2" color="text.secondary">
                The meta title appears in search engine results and browser tabs. Keep it concise and descriptive.
              </Typography>
            </Box>

            {/* Meta Description */}
            <Box sx={{ mb: 3 }}>
              <TextField
                fullWidth
                multiline
                rows={4}
                label="Meta Description"
                placeholder="Enter your meta description (ideal: 160 characters)"
                value={formData.metaDescription}
                onChange={handleChange('metaDescription')}
                inputProps={{ maxLength: 220 }}
                helperText={`${descriptionCount}/220 characters (ideal: 160)`}
                sx={{ mb: 1 }}
              />
              <Typography variant="body2" color="text.secondary">
                The meta description appears below your title in search results. Make it compelling and relevant.
              </Typography>
            </Box>

            {/* Canonical URL */}
            <Box sx={{ mb: 3 }}>
              <TextField
                fullWidth
                label="Canonical URL"
                placeholder="https://yoursite.com/page"
                value={formData.canonicalUrl}
                onChange={handleChange('canonicalUrl')}
                helperText="Set the canonical URL to prevent duplicate content issues"
              />
              <Box sx={{ mt: 1 }}>
                <Link href="#" underline="hover" sx={{ fontSize: '14px', display: 'flex', alignItems: 'center', gap: 0.5 }}>
                  <HelpOutlineIcon fontSize="small" />
                  Learn more about canonical URLs
                </Link>
              </Box>
            </Box>

            {/* Robots Meta Controls */}
            <Box sx={{ mb: 3 }}>
              <Typography variant="subtitle1" sx={{ mb: 2, fontWeight: 600 }}>
                Robots Meta Controls
              </Typography>
              
              {/* Indexing Options */}
              <FormControl component="fieldset" sx={{ mb: 2 }}>
                <FormLabel component="legend">Indexing Options</FormLabel>
                <RadioGroup
                  row
                  value={formData.robotsIndex}
                  onChange={handleChange('robotsIndex')}
                >
                  <FormControlLabel value="index" control={<Radio />} label="Index" />
                  <FormControlLabel value="noindex" control={<Radio />} label="No Index" />
                </RadioGroup>
              </FormControl>

              {/* Additional Robots Options */}
              <Grid container spacing={2}>
                <Grid item xs={12} sm={6}>
                  <FormControlLabel
                    control={
                      <Checkbox
                        checked={formData.robotsNoFollow}
                        onChange={(e) => setFormData(prev => ({ ...prev, robotsNoFollow: e.target.checked }))}
                      />
                    }
                    label="No Follow"
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <FormControlLabel
                    control={
                      <Checkbox
                        checked={formData.robotsNoArchive}
                        onChange={(e) => setFormData(prev => ({ ...prev, robotsNoArchive: e.target.checked }))}
                      />
                    }
                    label="No Archive"
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <FormControlLabel
                    control={
                      <Checkbox
                        checked={formData.robotsNoImageIndex}
                        onChange={(e) => setFormData(prev => ({ ...prev, robotsNoImageIndex: e.target.checked }))}
                      />
                    }
                    label="No Image Index"
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <FormControlLabel
                    control={
                      <Checkbox
                        checked={formData.robotsNoSnippet}
                        onChange={(e) => setFormData(prev => ({ ...prev, robotsNoSnippet: e.target.checked }))}
                      />
                    }
                    label="No Snippet"
                  />
                </Grid>
              </Grid>
            </Box>

            {/* Advanced Snippet Controls */}
            <Box sx={{ mb: 3 }}>
              <Typography variant="subtitle1" sx={{ mb: 2, fontWeight: 600 }}>
                Advanced Snippet & Preview Controls
              </Typography>
              
              <Grid container spacing={2}>
                <Grid item xs={12} sm={4}>
                  <TextField
                    fullWidth
                    label="Max Snippet"
                    type="number"
                    placeholder="150"
                    value={formData.maxSnippet}
                    onChange={handleChange('maxSnippet')}
                    helperText="Character limit"
                  />
                </Grid>
                <Grid item xs={12} sm={4}>
                  <TextField
                    fullWidth
                    label="Max Video Preview"
                    type="number"
                    placeholder="30"
                    value={formData.maxVideoPreview}
                    onChange={handleChange('maxVideoPreview')}
                    helperText="Seconds"
                  />
                </Grid>
                <Grid item xs={12} sm={4}>
                  <FormControl fullWidth>
                    <InputLabel>Max Image Preview</InputLabel>
                    <Select
                      value={formData.maxImagePreview}
                      onChange={handleChange('maxImagePreview')}
                      label="Max Image Preview"
                    >
                      <MenuItem value="none">None</MenuItem>
                      <MenuItem value="standard">Standard</MenuItem>
                      <MenuItem value="large">Large</MenuItem>
                    </Select>
                  </FormControl>
                </Grid>
              </Grid>
            </Box>

            {/* Form Buttons */}
            <Box sx={{ display: 'flex', gap: 2, justifyContent: 'flex-end' }}>
              <Button
                variant="outlined"
                onClick={handleReset}
                disabled={saving}
              >
                Reset
              </Button>
              <Button
                variant="contained"
                onClick={handleSubmit}
                disabled={saving}
                startIcon={saving ? <CircularProgress size={20} /> : null}
                sx={{ backgroundColor: '#1e3a5f', '&:hover': { backgroundColor: '#2d5a8c' } }}
              >
                {saving ? "Saving..." : "Submit"}
              </Button>
            </Box>
          </Card>
        </Grid>

        {/* Right Column - Image Upload */}
        <Grid item xs={12} md={4}>
          <Card sx={{ p: 3, boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }}>
            <Typography variant="h6" sx={{ mb: 3, fontWeight: 600 }}>
              OG Meta Image
            </Typography>

            {/* Upload Area */}
            <Paper
              sx={{
                border: '2px dashed #ccc',
                borderRadius: 2,
                p: 4,
                textAlign: 'center',
                backgroundColor: '#fafafa',
                cursor: 'pointer',
                '&:hover': { borderColor: '#1976d2', backgroundColor: '#f3f8ff' },
                aspectRatio: '2/1',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'center',
                alignItems: 'center',
                position: 'relative',
                overflow: 'hidden'
              }}
              component="label"
            >
              {formData.ogImageUrl ? (
                <img
                  src={formData.ogImageUrl}
                  alt="OG Preview"
                  style={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    width: '100%',
                    height: '100%',
                    objectFit: 'cover'
                  }}
                />
              ) : (
                <>
                  <CloudUploadIcon sx={{ fontSize: 48, color: '#ccc', mb: 2 }} />
                  <Typography variant="body1" sx={{ mb: 1 }}>
                    Click to upload or drag and drop
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    JPG, JPEG, PNG (Max 2MB)
                  </Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                    Recommended aspect ratio: 2:1
                  </Typography>
                </>
              )}
              <input
                type="file"
                accept="image/jpeg,image/jpg,image/png"
                onChange={handleImageUpload}
                style={{ display: 'none' }}
              />
            </Paper>

            {/* Image Info */}
            <Box sx={{ mt: 2 }}>
              <Typography variant="body2" color="text.secondary">
                <Tooltip title="This image will appear when your content is shared on social media platforms like Facebook, Twitter, LinkedIn, etc.">
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                    <InfoOutlinedIcon fontSize="small" />
                    This image appears in social media previews
                  </Box>
                </Tooltip>
              </Typography>
            </Box>
          </Card>
        </Grid>
      </Grid>

      {/* Snackbar */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={3500}
        onClose={() => setSnackbar((s) => ({ ...s, open: false }))}
        anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
      >
        <Alert
          onClose={() => setSnackbar((s) => ({ ...s, open: false }))}
          severity={snackbar.severity}
          sx={{ width: "100%" }}
        >
          {snackbar.msg}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default DefaultMetaSettings;
