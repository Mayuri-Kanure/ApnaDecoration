import React, { useState, useEffect } from "react";
import axios from "axios";
import {
  Box,
  Card,
  CardContent,
  Grid,
  Typography,
  TextField,
  Button,
  Link,
  CircularProgress,
  IconButton,
  Tooltip,
  Snackbar,
  Alert,
  Tabs,
  Tab,
  Switch,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Checkbox,
  Chip,
  FormControl,
  FormLabel,
  RadioGroup,
  FormControlLabel,
  Radio,
  Select,
  MenuItem,
  InputLabel,
  Paper,
} from "@mui/material";
import ContentCopyIcon from "@mui/icons-material/ContentCopy";
import RestartAltIcon from "@mui/icons-material/RestartAlt";
import SaveIcon from "@mui/icons-material/Save";
import SearchIcon from "@mui/icons-material/Search";
import VisibilityIcon from "@mui/icons-material/Visibility";
import LanguageIcon from "@mui/icons-material/Language";
import InfoOutlinedIcon from "@mui/icons-material/InfoOutlined";
import DeleteIcon from "@mui/icons-material/Delete";
import AddIcon from "@mui/icons-material/Add";
import LinkIcon from "@mui/icons-material/Link";
import CloudUploadIcon from "@mui/icons-material/CloudUpload";

const EXAMPLE_TAGS = {
  google: (id = "your-id") =>
    `<meta name="google-site-verification" content="${id}">`,
  bing: (id = "your-id") =>
    `<meta name="msvalidate.01" content="${id}">`,
  baidu: (id = "your-id") =>
    `<meta name="baidu-site-verification" content="${id}">`,
  yandex: (id = "your-id") =>
    `<meta name="yandex-verification" content="${id}">`,
};

// Search Engine Data
const searchEngines = [
  {
    key: 'google',
    name: 'Google Search Console',
    logo: '🔍',
    color: '#4285f4',
    description: 'Verify your site with Google Search Console',
    verificationUrl: 'https://search.google.com/search-console'
  },
  {
    key: 'bing',
    name: 'Bing Webmaster Tools',
    logo: '🔷',
    color: '#00809D',
    description: 'Submit your site to Bing search engine',
    verificationUrl: 'https://www.bing.com/webmasters'
  },
  {
    key: 'baidu',
    name: 'Baidu Webmaster Tool',
    logo: '🇨🇳',
    color: '#2932E1',
    description: 'Verify with Baidu search engine',
    verificationUrl: 'https://ziyuan.baidu.com/'
  },
  {
    key: 'yandex',
    name: 'Yandex Webmaster Tool',
    logo: '🔵',
    color: '#FFCC00',
    description: 'Connect with Yandex search engine',
    verificationUrl: 'https://webmaster.yandex.ru/'
  }
];

function extractExampleId(input = "") {
  if (!input) return "";
  const contentMatch = input.match(/content\s*=\s*"(.*?)"/i) || input.match(/content\s*=\s*'(.*?)'/i);
  if (contentMatch && contentMatch[1]) return contentMatch[1].trim();
  const trimmed = input.trim();
  const altMatch = input.match(/content\s*=\s*([^\s>]+)/i);
  if (altMatch && altMatch[1]) return altMatch[1].replace(/["'>]/g, "").trim();
  if (trimmed.length <= 200) return trimmed;
  return "";
}

const SeoSettings = () => {
  const [activeTab, setActiveTab] = useState(0);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [confirmModal, setConfirmModal] = useState({
    open: false,
    field: '',
    value: false,
    title: '',
    message: '',
    iconType: ''
  });
  const [snackbar, setSnackbar] = useState({ open: false, severity: "success", msg: "" });

  // Webmaster Tools State
  const [webmasterValues, setWebmasterValues] = useState({
    google: "",
    bing: "",
    baidu: "",
    yandex: "",
  });

  // General SEO State
  const [seoSettings, setSeoSettings] = useState({
    enableSEO: false,
    enableMetaTags: false,
    enableOpenGraph: false,
    enableStructuredData: false,
    enableSitemap: false,
    enableRobotsTxt: false,
    metaTitle: '',
    metaDescription: '',
    metaKeywords: '',
    ogTitle: '',
    ogDescription: '',
    ogImage: '',
    siteName: '',
    siteUrl: '',
    twitterCard: 'summary',
    twitterSite: '',
  });

  // Robots.txt State
  const [robotsContent, setRobotsContent] = useState(
    "User-agent: *\nAllow: /\nSitemap: https://yoursite.com/sitemap.xml"
  );

  // Sitemap State
  const [sitemapSettings, setSitemapSettings] = useState({
    enabled: false,
    frequency: 'weekly',
    priority: '0.8',
    includeImages: true,
    includeProducts: true,
    includeCategories: true,
  });

  // Robots Meta Content State
  const [robotsMetaSettings, setRobotsMetaSettings] = useState({
    index: true,
    follow: true,
    noarchive: false,
    nosnippet: false,
    noimageindex: false,
    notranslate: false,
  });

  // Default Meta Content State
  const [defaultMetaContent, setDefaultMetaContent] = useState([]);

  // Page Robots Meta State
  const [pageRobotsMeta, setPageRobotsMeta] = useState([]);

  // Add Page Modal State
  const [addPageModal, setAddPageModal] = useState({
    open: false,
    pageName: '',
    pageUrl: ''
  });

  // API URL
  const API = process.env.REACT_APP_API_BASE_URL || 'https://admin-api.apnadecoration.com/api';

  // Load SEO settings from backend
  useEffect(() => {
    const loadSeoSettings = async () => {
      try {
        setLoading(true);
        const response = await axios.get(`${API}/admin-settings`);
        const data = response.data;
        
        // Map backend data to frontend state
        setSeoSettings(prev => ({
          ...prev,
          enableSEO: data.enableSEO || false,
          enableMetaTags: data.enableMetaTags || false,
          enableOpenGraph: data.enableOpenGraph || false,
          enableStructuredData: data.enableStructuredData || false,
          enableSitemap: data.enableSitemap || false,
          enableRobotsTxt: data.enableRobotsTxt || false,
          metaTitle: data.metaTitle || '',
          metaDescription: data.metaDescription || '',
          metaKeywords: data.metaKeywords || '',
          ogTitle: data.ogTitle || '',
          ogDescription: data.ogDescription || '',
          ogImage: data.ogImage || '',
          siteName: data.siteName || data.businessName || '',
          siteUrl: data.siteUrl || '',
          twitterCard: data.twitterCard || 'summary',
          twitterSite: data.twitterSite || ''
        }));
        
        setWebmasterValues(prev => ({
          ...prev,
          google: data.googleVerification || '',
          bing: data.bingVerification || '',
          baidu: data.baiduVerification || '',
          yandex: data.yandexVerification || ''
        }));
        
      } catch (error) {
        console.error('Error loading SEO settings:', error);
      } finally {
        setLoading(false);
      }
    };

    loadSeoSettings();
  }, []);

  // CMS Page Options
  const cmsPageOptions = [
    'About Us',
    'Contact Us', 
    'Privacy Policy',
    'Terms & Conditions',
    'FAQs',
    'Blog',
    'Services',
    'Portfolio',
    'Careers',
    'Support'
  ];

  // 404 Logs State
  const [logs404, setLogs404] = useState([
    {
      id: 1,
      url: '/products/non-existent-product',
      hits: 15,
      lastHit: '2024-01-15 10:30 AM',
      redirectUrl: '/products/all-products',
      isAttack: false
    },
    {
      id: 2,
      url: '/wp-config.php',
      hits: 8,
      lastHit: '2024-01-15 09:15 AM',
      redirectUrl: '',
      isAttack: true
    },
    {
      id: 3,
      url: '/admin/old-panel',
      hits: 23,
      lastHit: '2024-01-14 02:45 PM',
      redirectUrl: '/admin/dashboard',
      isAttack: true
    },
    {
      id: 4,
      url: '/blog/missing-article',
      hits: 5,
      lastHit: '2024-01-13 04:20 PM',
      redirectUrl: '/blog/all-articles',
      isAttack: false
    }
  ]);
  const [selectedLogs, setSelectedLogs] = useState([]);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [redirectModal, setRedirectModal] = useState({ open: false, url: '', redirectUrl: '' });

  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue);
  };

  // Handle URL parameters to set active tab
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const tabParam = urlParams.get('tab');
    
    if (tabParam === 'robots-meta') {
      setActiveTab(3); // Robots Meta Content tab (index 3)
    }
  }, []);

  // Add Page Modal handlers
  const generateSlug = (pageName) => {
    if (!pageName) return '';
    return pageName
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .trim('-');
  };

  const handleAddPageModalChange = (field) => (e) => {
    const value = e.target.value;
    setAddPageModal(prev => ({ ...prev, [field]: value }));
    
    // Auto-generate URL when page name is selected
    if (field === 'pageName' && value) {
      const slug = generateSlug(value);
      setAddPageModal(prev => ({ 
        ...prev, 
        pageUrl: `https://www.printformee.com/${slug}` 
      }));
    }
  };

  const handleSavePageMeta = async () => {
    if (!addPageModal.pageName || !addPageModal.pageUrl) {
      setSnackbar({ open: true, severity: "error", msg: "Please fill in all required fields" });
      return;
    }

    try {
      setSaving(true);
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // Add new page meta to the list
      const newPageMeta = {
        id: Date.now(),
        page: addPageModal.pageUrl,
        title: addPageModal.pageName,
        meta: 'index, follow' // Default robots meta
      };
      
      setPageRobotsMeta(prev => [...prev, newPageMeta]);
      setSnackbar({ open: true, severity: "success", msg: "Page added successfully!" });
      
      // Reset and close modal
      setAddPageModal({
        open: false,
        pageName: '',
        pageUrl: ''
      });
    } catch (err) {
      console.error("Error saving page meta:", err);
      setSnackbar({ open: true, severity: "error", msg: "Failed to save page" });
    } finally {
      setSaving(false);
    }
  };

  // Confirmation popup handler for SEO toggles
  const handleChange = (field, value) => {
    if (field === 'enableSEO' || field === 'enableMetaTags' || field === 'enableOpenGraph' || field === 'enableStructuredData' || field === 'enableSitemap' || field === 'enableRobotsTxt') {
      const fieldLabels = {
        enableSEO: 'SEO',
        enableMetaTags: 'Meta Tags',
        enableOpenGraph: 'Open Graph',
        enableStructuredData: 'Structured Data',
        enableSitemap: 'Sitemap',
        enableRobotsTxt: 'Robots.txt'
      };
      
      const action = value ? 'Enable' : 'Disable';
      const messages = {
        enableSEO: value
          ? 'Are you sure you want to enable SEO? This will activate SEO features for your website.'
          : 'Are you sure you want to disable SEO? This will deactivate SEO features for your website.',
        enableMetaTags: value
          ? 'Are you sure you want to enable Meta Tags? This will add meta tags to your pages.'
          : 'Are you sure you want to disable Meta Tags? This will remove meta tags from your pages.',
        enableOpenGraph: value
          ? 'Are you sure you want to enable Open Graph? This will add Open Graph tags for social media sharing.'
          : 'Are you sure you want to disable Open Graph? This will remove Open Graph tags from your pages.',
        enableStructuredData: value
          ? 'Are you sure you want to enable Structured Data? This will add structured data markup to your pages.'
          : 'Are you sure you want to disable Structured Data? This will remove structured data markup from your pages.',
        enableSitemap: value
          ? 'Are you sure you want to enable Sitemap? This will generate sitemap for search engines.'
          : 'Are you sure you want to disable Sitemap? This will stop sitemap generation for search engines.',
        enableRobotsTxt: value
          ? 'Are you sure you want to enable Robots.txt? This will create robots.txt file for search engine crawlers.'
          : 'Are you sure you want to disable Robots.txt? This will remove robots.txt file for search engine crawlers.'
      };
      
      setConfirmModal({
        open: true,
        title: `${action} ${fieldLabels[field]}`,
        message: messages[field],
        field: field,
        value: value,
        iconType: field === 'enableSEO' ? 'seo' : field === 'enableMetaTags' ? 'meta' : field === 'enableOpenGraph' ? 'opengraph' : field === 'enableStructuredData' ? 'structured' : field === 'enableSitemap' ? 'sitemap' : 'robots'
      });
    } else {
      setSeoSettings((prev) => ({ ...prev, [field]: value }));
    }
  };

  const handleConfirmToggle = () => {
    setSeoSettings((prev) => ({ ...prev, [confirmModal.field]: confirmModal.value }));
    setConfirmModal({ open: false, title: '', message: '', field: '', value: false, iconType: '' });
  };

  const copyToClipboard = async (text) => {
    try {
      await navigator.clipboard.writeText(text);
      setSnackbar({ open: true, severity: "success", msg: "Copied to clipboard" });
    } catch (err) {
      console.error("Copy failed", err);
      setSnackbar({ open: true, severity: "error", msg: "Copy failed" });
    }
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      
      // Prepare data for API
      const seoData = {
        ...seoSettings,
        googleVerification: webmasterValues.google,
        bingVerification: webmasterValues.bing,
        baiduVerification: webmasterValues.baidu,
        yandexVerification: webmasterValues.yandex
      };
      
      // Call API to save SEO settings
      const response = await axios.put(`${API}/admin-settings`, seoData);
      
      setSnackbar({ open: true, severity: "success", msg: "SEO Settings Saved Successfully" });
      console.log('SEO settings saved:', response.data);
    } catch (err) {
      console.error("Error saving settings:", err);
      setSnackbar({ open: true, severity: "error", msg: "Failed to save settings" });
    } finally {
      setSaving(false);
    }
  };

  const handleWebmasterSubmit = async () => {
    try {
      setSaving(true);
      
      // Prepare webmaster data for API
      const webmasterData = {
        googleVerification: webmasterValues.google,
        bingVerification: webmasterValues.bing,
        baiduVerification: webmasterValues.baidu,
        yandexVerification: webmasterValues.yandex
      };
      
      // Call API to save webmaster settings
      const response = await axios.put(`${API}/admin-settings`, webmasterData);
      
      setSnackbar({ open: true, severity: "success", msg: "Webmaster settings saved successfully." });
      console.log('Webmaster settings saved:', response.data);
    } catch (err) {
      console.error("Error saving webmaster settings:", err);
      setSnackbar({ open: true, severity: "error", msg: "Failed to save webmaster settings" });
    } finally {
      setSaving(false);
    }
  };

  const handleWebmasterReset = () => {
    setWebmasterValues({ google: "", bing: "", baidu: "", yandex: "" });
    setSnackbar({ open: true, severity: "info", msg: "Form reset" });
  };

  const handleWebmasterChange = (key) => (e) => {
    setWebmasterValues((s) => ({ ...s, [key]: e.target.value }));
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" py={6}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" sx={{ mb: 4, fontWeight: 600 }}>
        SEO Settings
      </Typography>

      <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}>
        <Tabs value={activeTab} onChange={handleTabChange}>
          <Tab label="Webmaster Tools" />
          <Tab label="Robots.txt" />
          <Tab label="Sitemap" />
          <Tab label="Robots Meta Content" />
          <Tab label="404 Logs" />
        </Tabs>
      </Box>

      {/* Webmaster Tools Tab */}
      {activeTab === 0 && (
        <Box>
          <Card sx={{ mb: 3 }}>
            <CardContent>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                Enter the HTML verification code or the verification ID provided by each search engine.
                You can copy the example meta tag shown below and paste the value into your site's HEAD,
                or save the ID here and the system will use it where needed.
                <br />
                <Link href="https://developers.google.com/search/docs/crawling-indexing/verify-site" target="_blank" rel="noopener">
                  Learn more about site verification
                </Link>
              </Typography>

              <Grid container spacing={3}>
                {[
                  { key: "google", label: "Google Search Console", helpUrl: "https://search.google.com/search-console/about" },
                  { key: "bing", label: "Bing Webmaster Tools", helpUrl: "https://www.bing.com/webmasters" },
                  { key: "baidu", label: "Baidu Webmaster Tool", helpUrl: "http://zhanzhang.baidu.com/" },
                  { key: "yandex", label: "Yandex Webmaster Tool", helpUrl: "https://webmaster.yandex.com/" },
                ].map(({ key, label, helpUrl }) => (
                  <Grid item xs={12} md={6} key={key}>
                    <Card variant="outlined" sx={{ p: 2, height: "100%" }}>
                      <Box display="flex" alignItems="center" justifyContent="space-between" mb={1}>
                        <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
                          {label}
                        </Typography>
                        <Link href={helpUrl} target="_blank" rel="noopener" underline="hover">
                          Get verification ID
                        </Link>
                      </Box>

                      <TextField
                        label="Enter your HTML code or ID"
                        placeholder="e.g. abcde12345 or <meta name=...>"
                        value={webmasterValues[key]}
                        onChange={handleWebmasterChange(key)}
                        fullWidth
                        multiline
                        minRows={1}
                        maxRows={3}
                        variant="outlined"
                        sx={{ mb: 1 }}
                      />

                      <Box display="flex" alignItems="center" justifyContent="space-between" mt={1}>
                        <Typography variant="body2" color="text.secondary" sx={{ fontFamily: "monospace", fontSize: 13 }}>
                          {EXAMPLE_TAGS[key](extractExampleId(webmasterValues[key]) || "your-id")}
                        </Typography>
                        <Box>
                          <Tooltip title="Copy example meta tag">
                            <IconButton
                              size="small"
                              onClick={() => copyToClipboard(EXAMPLE_TAGS[key](extractExampleId(webmasterValues[key]) || "your-id"))}
                            >
                              <ContentCopyIcon fontSize="small" />
                            </IconButton>
                          </Tooltip>
                        </Box>
                      </Box>
                    </Card>
                  </Grid>
                ))}
              </Grid>
            </CardContent>
          </Card>

          <Box display="flex" gap={2} justifyContent="flex-end">
            <Button
              variant="outlined"
              startIcon={<RestartAltIcon />}
              onClick={handleWebmasterReset}
              disabled={saving}
            >
              Reset
            </Button>
            <Button
              variant="contained"
              startIcon={saving ? <CircularProgress size={18} /> : <SaveIcon />}
              onClick={handleWebmasterSubmit}
              disabled={saving}
            >
              {saving ? "Saving..." : "Submit"}
            </Button>
          </Box>
        </Box>
      )}

      {/* Robots.txt Tab */}
      {activeTab === 1 && (
        <Card>
          <CardContent>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
              <Box>
                <Typography variant="h6" sx={{ fontWeight: 600 }}>
                  Robots.txt Editor
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
                  Control search engine crawlers access to specific pages on a website
                </Typography>
              </Box>
              <Button
                variant="outlined"
                startIcon={<LanguageIcon />}
                onClick={() => window.open('/robots.txt', '_blank')}
                sx={{ textTransform: 'none' }}
              >
                View URL
              </Button>
            </Box>

            {/* Information Box */}
            <Box sx={{ 
              backgroundColor: '#e3f2fd', 
              border: '1px solid #90caf9', 
              borderRadius: 1, 
              p: 2, 
              mb: 3 
            }}>
              <Typography variant="body2" sx={{ color: '#1565c0' }}>
                <strong>Robots.txt</strong> tells search engines which parts of your website they should or should not crawl.
                <br />
                The system will automatically generate a robots.txt for your site, but you can edit or modify this robots.txt.
              </Typography>
            </Box>

            {/* Robots.txt Editor Field */}
            <Grid container spacing={3}>
              <Grid item xs={12}>
                <Typography variant="body2" sx={{ mb: 1, fontWeight: 500 }}>
                  Robots.txt Content
                </Typography>
                <TextField
                  fullWidth
                  multiline
                  rows={12}
                  value={robotsContent}
                  onChange={(e) => setRobotsContent(e.target.value)}
                  placeholder="Enter your robots.txt content here..."
                  sx={{ 
                    fontFamily: 'monospace',
                    fontSize: '14px',
                    '& .MuiInputBase-input': {
                      fontFamily: 'monospace',
                      fontSize: '14px',
                      lineHeight: 1.5
                    }
                  }}
                  helperText="Example: User-agent: *\nDisallow: /login/admin/\nSitemap: https://yoursite.com/sitemap.xml"
                />
              </Grid>
            </Grid>

            {/* Action Buttons */}
            <Box sx={{ mt: 3, display: 'flex', justifyContent: 'flex-end', gap: 2 }}>
              <Button
                variant="outlined"
                startIcon={<RestartAltIcon />}
                onClick={() => {
                  setRobotsContent("User-agent: *\nAllow: /\nSitemap: https://yoursite.com/sitemap.xml");
                  setSnackbar({ open: true, severity: "info", msg: "Content reset to default" });
                }}
                disabled={saving}
              >
                Reset
              </Button>
              <Button
                variant="contained"
                startIcon={saving ? <CircularProgress size={18} /> : <SaveIcon />}
                onClick={handleSave}
                disabled={saving}
              >
                {saving ? "Saving..." : "Submit"}
              </Button>
            </Box>
          </CardContent>
        </Card>
      )}

      {/* Sitemap Tab */}
      {activeTab === 2 && (
        <Card>
          <CardContent>
            <Box sx={{ mb: 3 }}>
              <Typography variant="h6" sx={{ fontWeight: 600 }}>
                Site Map
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
                Organized for navigation and search engine optimization
              </Typography>
            </Box>

            {/* Information Box */}
            <Box sx={{ 
              backgroundColor: '#e3f2fd', 
              border: '1px solid #90caf9', 
              borderRadius: 1, 
              p: 2, 
              mb: 3 
            }}>
              <Typography variant="body2" sx={{ color: '#1565c0' }}>
                <strong>A sitemap is an xml file that contains all the web pages of a website.</strong> 
                It allows search engines to find and display your products and services in search results.
              </Typography>
            </Box>

            {/* Sitemap Generation Options */}
            <Box sx={{ mb: 4 }}>
              <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 2 }}>
                Download Generate Sitemap
              </Typography>
              
              <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
                <Button
                  variant="contained"
                  startIcon={saving ? <CircularProgress size={18} /> : <SaveIcon />}
                  onClick={async () => {
                    setSaving(true);
                    // Simulate sitemap generation and download
                    await new Promise(resolve => setTimeout(resolve, 1500));
                    setSnackbar({ open: true, severity: "success", msg: "Sitemap generated and downloaded successfully!" });
                    setSaving(false);
                  }}
                  disabled={saving}
                  sx={{ 
                    backgroundColor: '#1e3a5f',
                    '&:hover': { backgroundColor: '#2d5a8c' }
                  }}
                >
                  {saving ? "Generating..." : "Generate & Download"}
                </Button>

                <Button
                  variant="outlined"
                  startIcon={saving ? <CircularProgress size={18} /> : <SaveIcon />}
                  onClick={async () => {
                    setSaving(true);
                    // Simulate sitemap generation and upload
                    await new Promise(resolve => setTimeout(resolve, 1500));
                    setSnackbar({ open: true, severity: "success", msg: "Sitemap generated and uploaded to server successfully!" });
                    setSaving(false);
                  }}
                  disabled={saving}
                >
                  {saving ? "Uploading..." : "Generate & Upload to Server"}
                </Button>

                <Button
                  variant="outlined"
                  component="label"
                  startIcon={<SaveIcon />}
                  disabled={saving}
                >
                  Upload Sitemap
                  <input
                    type="file"
                    accept=".xml"
                    style={{ display: 'none' }}
                    onChange={(e) => {
                      const file = e.target.files[0];
                      if (file) {
                        setSnackbar({ open: true, severity: "success", msg: `Sitemap "${file.name}" uploaded successfully!` });
                      }
                    }}
                  />
                </Button>
              </Box>
            </Box>

            {/* Sitemap Log/Table */}
            <Box>
              <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 2 }}>
                Sitemap History
              </Typography>
              
              <Box sx={{ 
                border: '1px solid #e0e0e0', 
                borderRadius: 1,
                overflow: 'hidden'
              }}>
                <TableContainer>
                  <Table>
                    <TableHead sx={{ backgroundColor: '#f5f5f5' }}>
                      <TableRow>
                        <TableCell sx={{ fontWeight: 600, fontSize: '14px' }}>SL</TableCell>
                        <TableCell sx={{ fontWeight: 600, fontSize: '14px' }}>NAME</TableCell>
                        <TableCell sx={{ fontWeight: 600, fontSize: '14px' }}>FILE SIZE</TableCell>
                        <TableCell sx={{ fontWeight: 600, fontSize: '14px' }}>DATE</TableCell>
                        <TableCell sx={{ fontWeight: 600, fontSize: '14px' }}>ACTION</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {[
                        { id: 1, name: 'sitemap.xml', size: '2.4 KB', date: '2024-01-15 10:30 AM' },
                        { id: 2, name: 'sitemap_products.xml', size: '1.8 KB', date: '2024-01-14 02:15 PM' },
                        { id: 3, name: 'sitemap_categories.xml', size: '0.9 KB', date: '2024-01-13 09:45 AM' },
                      ].map((sitemap) => (
                        <TableRow key={sitemap.id} sx={{ '&:hover': { backgroundColor: '#f9f9f9' } }}>
                          <TableCell sx={{ fontSize: '14px' }}>{sitemap.id}</TableCell>
                          <TableCell sx={{ fontSize: '14px' }}>{sitemap.name}</TableCell>
                          <TableCell sx={{ fontSize: '14px' }}>{sitemap.size}</TableCell>
                          <TableCell sx={{ fontSize: '14px' }}>{sitemap.date}</TableCell>
                          <TableCell>
                            <Box sx={{ display: 'flex', gap: 1 }}>
                              <IconButton
                                size="small"
                                onClick={() => {
                                  setSnackbar({ open: true, severity: "info", msg: `Downloading ${sitemap.name}...` });
                                }}
                                sx={{ color: '#1976d2' }}
                              >
                                <SaveIcon fontSize="small" />
                              </IconButton>
                              <IconButton
                                size="small"
                                onClick={() => {
                                  setSnackbar({ open: true, severity: "warning", msg: `Deleted ${sitemap.name}` });
                                }}
                                sx={{ color: '#d32f2f' }}
                              >
                                <RestartAltIcon fontSize="small" />
                              </IconButton>
                            </Box>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              </Box>
            </Box>
          </CardContent>
        </Card>
      )}

      {/* Robots Meta Content Tab */}
      {activeTab === 3 && (
        <Card>
          <CardContent>
            <Typography variant="h6" sx={{ mb: 3, fontWeight: 600 }}>
              Robots Meta Content Settings
            </Typography>

            {/* Set Default Meta Section */}
            <Box sx={{ mb: 4 }}>
              <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 2 }}>
                Set Default Meta
              </Typography>
              
              <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                If you do not have any meta content in any page, it will automatically use as meta content from this section
              </Typography>

              {defaultMetaContent.length === 0 ? (
                <Box sx={{ 
                  textAlign: 'center', 
                  py: 4, 
                  border: '2px dashed #e0e0e0', 
                  borderRadius: 2,
                  backgroundColor: '#fafafa'
                }}>
                  <Typography variant="body1" color="text.secondary" sx={{ mb: 2 }}>
                    No default meta content configured yet
                  </Typography>
                  <Button
                    variant="contained"
                    startIcon={<SaveIcon />}
                    onClick={() => {
                      setDefaultMetaContent([{
                        name: 'robots',
                        content: 'index, follow'
                      }]);
                      setSnackbar({ open: true, severity: "success", msg: "Default meta content added successfully!" });
                      // Navigate to DefaultMetaSettings page
                      window.location.href = '/default-meta-settings';
                    }}
                    sx={{ backgroundColor: '#1976d2' }}
                  >
                    + Add Content
                  </Button>
                </Box>
              ) : (
                <Box>
                  {defaultMetaContent.map((meta, index) => (
                    <Box key={index} sx={{ 
                      display: 'flex', 
                      alignItems: 'center', 
                      gap: 2, 
                      p: 2, 
                      border: '1px solid #e0e0e0', 
                      borderRadius: 1, 
                      mb: 2 
                    }}>
                      <Typography variant="body2" sx={{ minWidth: 100, fontWeight: 500 }}>
                        {meta.name}
                      </Typography>
                      <Typography variant="body2" color="text.secondary" sx={{ flex: 1 }}>
                        {meta.content}
                      </Typography>
                      <IconButton
                        size="small"
                        onClick={() => {
                          setDefaultMetaContent(prev => prev.filter((_, i) => i !== index));
                          setSnackbar({ open: true, severity: "warning", msg: "Meta content removed" });
                        }}
                        sx={{ color: '#d32f2f' }}
                      >
                        <RestartAltIcon fontSize="small" />
                      </IconButton>
                    </Box>
                  ))}
                  <Button
                    variant="outlined"
                    startIcon={<SaveIcon />}
                    onClick={() => {
                      setDefaultMetaContent(prev => [...prev, { name: 'robots', content: 'index, follow' }]);
                      setSnackbar({ open: true, severity: "success", msg: "Additional meta content added!" });
                    }}
                  >
                    + Add Content
                  </Button>
                </Box>
              )}
            </Box>

            {/* Default Pages Robots Meta Content Settings Section */}
            <Box>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
                  Default Pages Robots Meta Content Settings
                </Typography>
                <Tooltip title="Configure specific robots meta tags for important pages like Login, Search, or Admin pages">
                  <IconButton size="small">
                    <InfoOutlinedIcon fontSize="small" />
                  </IconButton>
                </Tooltip>
              </Box>

              {pageRobotsMeta.length === 0 ? (
                <Box sx={{ 
                  textAlign: 'center', 
                  py: 6, 
                  border: '2px dashed #e0e0e0', 
                  borderRadius: 2,
                  backgroundColor: '#fafafa'
                }}>
                  <Box sx={{ mb: 2 }}>
                    <InfoOutlinedIcon sx={{ fontSize: 48, color: '#9e9e9e' }} />
                  </Box>
                  <Typography variant="h6" color="text.secondary" sx={{ mb: 1 }}>
                    No data found
                  </Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                    No custom page-specific robot directives have been set yet
                  </Typography>
                  <Button
                    variant="contained"
                    color="error"
                    startIcon={<SaveIcon />}
                    onClick={() => {
                      setAddPageModal(prev => ({ ...prev, open: true }));
                    }}
                    sx={{ backgroundColor: '#4caf50' }}
                  >
                    + Add Page
                  </Button>
                </Box>
              ) : (
                <Box>
                  {pageRobotsMeta.map((pageMeta, index) => (
                    <Box key={index} sx={{ 
                      display: 'flex', 
                      alignItems: 'center', 
                      gap: 2, 
                      p: 2, 
                      border: '1px solid #e0e0e0', 
                      borderRadius: 1, 
                      mb: 2 
                    }}>
                      <Typography variant="body2" sx={{ minWidth: 150, fontWeight: 500 }}>
                        {pageMeta.page}
                      </Typography>
                      <Typography variant="body2" color="text.secondary" sx={{ flex: 1 }}>
                        {pageMeta.meta}
                      </Typography>
                      <IconButton
                        size="small"
                        onClick={() => {
                          setPageRobotsMeta(prev => prev.filter((_, i) => i !== index));
                          setSnackbar({ open: true, severity: "warning", msg: "Page robots meta removed" });
                        }}
                        sx={{ color: '#d32f2f' }}
                      >
                        <RestartAltIcon fontSize="small" />
                      </IconButton>
                    </Box>
                  ))}
                  <Button
                    variant="outlined"
                    startIcon={<SaveIcon />}
                    onClick={() => {
                      setPageRobotsMeta(prev => [...prev, { page: '/admin', meta: 'noindex, nofollow' }]);
                      setSnackbar({ open: true, severity: "success", msg: "Additional page robots meta added!" });
                    }}
                  >
                    + Add Page
                  </Button>
                </Box>
              )}
            </Box>
          </CardContent>
        </Card>
      )}

      {/* 404 Logs Tab */}
      {activeTab === 4 && (
        <Card>
          <CardContent>
            <Box sx={{ mb: 3 }}>
              <Typography variant="h6" sx={{ fontWeight: 600 }}>
                404 Logs
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
                Track instances of page not found errors faced by users on your website
              </Typography>
            </Box>

            {/* Search and Filter Bar */}
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
              <TextField
                size="small"
                placeholder="Search 404 logs..."
                InputProps={{
                  startAdornment: <SearchIcon sx={{ fontSize: 20, color: 'text.secondary', mr: 1 }} />
                }}
                sx={{ width: 300 }}
              />
              
              <Box sx={{ display: 'flex', gap: 1 }}>
                <Button
                  variant="outlined"
                  startIcon={<SaveIcon />}
                  onClick={() => setSnackbar({ open: true, severity: "info", msg: "Export feature coming soon!" })}
                >
                  Export
                </Button>
                {selectedLogs.length > 0 && (
                  <Button
                    variant="contained"
                    color="error"
                    startIcon={<DeleteIcon />}
                    onClick={() => {
                      setLogs404(prev => prev.filter(log => !selectedLogs.includes(log.id)));
                      setSelectedLogs([]);
                      setSnackbar({ open: true, severity: "success", msg: "Selected logs deleted!" });
                    }}
                  >
                    Delete Selected ({selectedLogs.length})
                  </Button>
                )}
              </Box>
            </Box>

            {/* 404 Logs Table */}
            <Box sx={{ 
              border: '1px solid #e0e0e0', 
              borderRadius: 1,
              overflow: 'hidden'
            }}>
              <TableContainer>
                <Table>
                  <TableHead sx={{ backgroundColor: '#f5f5f5' }}>
                    <TableRow>
                      <TableCell padding="checkbox">
                        <Checkbox
                          indeterminate={selectedLogs.length > 0 && selectedLogs.length < logs404.length}
                          checked={selectedLogs.length === logs404.length}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setSelectedLogs(logs404.map(log => log.id));
                            } else {
                              setSelectedLogs([]);
                            }
                          }}
                        />
                      </TableCell>
                      <TableCell sx={{ fontWeight: 600, fontSize: '14px' }}>URL</TableCell>
                      <TableCell sx={{ fontWeight: 600, fontSize: '14px', textAlign: 'center' }}>Hits</TableCell>
                      <TableCell sx={{ fontWeight: 600, fontSize: '14px' }}>Last Hit Date</TableCell>
                      <TableCell sx={{ fontWeight: 600, fontSize: '14px' }}>Redirection Link</TableCell>
                      <TableCell sx={{ fontWeight: 600, fontSize: '14px' }}>Action</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {logs404.map((log) => (
                      <TableRow 
                        key={log.id} 
                        sx={{ 
                          '&:hover': { backgroundColor: '#f9f9f9' },
                          backgroundColor: log.isAttack ? '#fff3f3' : 'inherit'
                        }}
                      >
                        <TableCell padding="checkbox">
                          <Checkbox
                            checked={selectedLogs.includes(log.id)}
                            onChange={(e) => {
                              if (e.target.checked) {
                                setSelectedLogs(prev => [...prev, log.id]);
                              } else {
                                setSelectedLogs(prev => prev.filter(id => id !== log.id));
                              }
                            }}
                          />
                        </TableCell>
                        <TableCell>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            {log.isAttack && (
                              <Box sx={{ 
                                width: 8, 
                                height: 8, 
                                borderRadius: '50%', 
                                backgroundColor: '#ff5252' 
                              }} />
                            )}
                            <Link
                              href={log.url}
                              target="_blank"
                              underline="hover"
                              sx={{ fontSize: '14px', color: '#1976d2' }}
                            >
                              {log.url}
                            </Link>
                          </Box>
                        </TableCell>
                        <TableCell sx={{ textAlign: 'center', fontSize: '14px' }}>
                          <Chip 
                            label={log.hits} 
                            size="small" 
                            color={log.hits > 10 ? 'warning' : 'default'}
                          />
                        </TableCell>
                        <TableCell sx={{ fontSize: '14px' }}>{log.lastHit}</TableCell>
                        <TableCell>
                          {log.redirectUrl ? (
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                              <LinkIcon sx={{ fontSize: 16, color: '#4caf50' }} />
                              <Typography variant="body2" sx={{ fontSize: '12px' }}>
                                {log.redirectUrl}
                              </Typography>
                            </Box>
                          ) : (
                            <Button
                              variant="outlined"
                              size="small"
                              startIcon={<AddIcon />}
                              onClick={() => setRedirectModal({ open: true, url: log.url, redirectUrl: '' })}
                              sx={{ fontSize: '12px', py: 0.5 }}
                            >
                              Add Link
                            </Button>
                          )}
                        </TableCell>
                        <TableCell>
                          <IconButton
                            size="small"
                            onClick={() => {
                              setLogs404(prev => prev.filter(l => l.id !== log.id));
                              setSnackbar({ open: true, severity: "warning", msg: "404 log deleted" });
                            }}
                            sx={{ color: '#d32f2f' }}
                          >
                            <DeleteIcon fontSize="small" />
                          </IconButton>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            </Box>

            {/* Pagination */}
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mt: 3 }}>
              <Typography variant="body2" color="text.secondary">
                Showing {logs404.length} entries
              </Typography>
              <Box sx={{ display: 'flex', gap: 1 }}>
                <Button
                  size="small"
                  disabled={page === 0}
                  onClick={() => setPage(prev => Math.max(0, prev - 1))}
                >
                  Previous
                </Button>
                {[0, 1, 2, 3, 4].map((pageNum) => (
                  <Button
                    key={pageNum}
                    size="small"
                    variant={page === pageNum ? 'contained' : 'outlined'}
                    onClick={() => setPage(pageNum)}
                  >
                    {pageNum + 1}
                  </Button>
                ))}
                <Typography variant="body2" sx={{ display: 'flex', alignItems: 'center' }}>...</Typography>
                <Button size="small">658</Button>
                <Button size="small">659</Button>
                <Button
                  size="small"
                  onClick={() => setPage(prev => prev + 1)}
                >
                  Next
                </Button>
              </Box>
            </Box>
          </CardContent>
        </Card>
      )}

      {/* Add Page Modal */}
      <Dialog 
        open={addPageModal.open} 
        onClose={() => setAddPageModal(prev => ({ ...prev, open: false }))}
        maxWidth="sm"
        fullWidth
        PaperProps={{
          sx: {
            borderRadius: 2,
            boxShadow: '0 4px 20px rgba(0,0,0,0.15)'
          }
        }}
      >
        {/* Header with Close Button */}
        <Box sx={{ 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center', 
          p: 3, 
          borderBottom: '1px solid #e0e0e0' 
        }}>
          <Typography variant="h6" sx={{ fontWeight: 600 }}>
            Add Page
          </Typography>
          <IconButton
            onClick={() => setAddPageModal(prev => ({ ...prev, open: false }))}
            sx={{ 
              width: 32, 
              height: 32,
              '&:hover': { backgroundColor: '#f5f5f5' }
            }}
          >
            <RestartAltIcon sx={{ fontSize: 18 }} />
          </IconButton>
        </Box>
        
        <DialogContent sx={{ p: 3 }}>
          {/* Page Name Dropdown */}
          <Box sx={{ mb: 3 }}>
            <Typography variant="body2" sx={{ mb: 1, fontWeight: 500 }}>
              Page Name
            </Typography>
            <FormControl fullWidth>
              <Select
                value={addPageModal.pageName}
                onChange={handleAddPageModalChange('pageName')}
                displayEmpty
                sx={{
                  '& .MuiOutlinedInput-notchedOutline': {
                    borderRadius: 2,
                  }
                }}
              >
                <MenuItem value="" disabled>
                  Select Page
                </MenuItem>
                {cmsPageOptions.map((page) => (
                  <MenuItem key={page} value={page}>
                    {page}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Box>
          
          {/* Page URL Input */}
          <Box>
            <Typography variant="body2" sx={{ mb: 1, fontWeight: 500 }}>
              Page URL
            </Typography>
            <TextField
              fullWidth
              placeholder="https://www.example.com/page-url"
              value={addPageModal.pageUrl}
              onChange={handleAddPageModalChange('pageUrl')}
              sx={{
                '& .MuiOutlinedInput-notchedOutline': {
                  borderRadius: 2,
                }
              }}
            />
            <Typography variant="caption" color="text.secondary" sx={{ mt: 0.5, display: 'block' }}>
              URL is auto-generated based on page name but can be edited
            </Typography>
          </Box>
        </DialogContent>
        
        <DialogActions sx={{ p: 3, pt: 0 }}>
          <Button
            variant="contained"
            onClick={handleSavePageMeta}
            disabled={saving || !addPageModal.pageName || !addPageModal.pageUrl}
            startIcon={saving ? <CircularProgress size={18} /> : <SaveIcon />}
            sx={{ 
              backgroundColor: '#0d47a1',
              '&:hover': { backgroundColor: '#1565c0' },
              '&:disabled': { backgroundColor: '#ccc' },
              borderRadius: 2,
              textTransform: 'none',
              px: 3
            }}
          >
            {saving ? "Saving..." : "Save"}
          </Button>
        </DialogActions>
      </Dialog>
      <Dialog open={redirectModal.open} onClose={() => setRedirectModal({ open: false, url: '', redirectUrl: '' })} maxWidth="sm" fullWidth>
        <DialogTitle>Add Redirection Link</DialogTitle>
        <DialogContent>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            URL: <strong>{redirectModal.url}</strong>
          </Typography>
          <TextField
            fullWidth
            label="Redirect Target URL"
            placeholder="Enter the target URL (e.g., /products/all-products)"
            value={redirectModal.redirectUrl}
            onChange={(e) => setRedirectModal(prev => ({ ...prev, redirectUrl: e.target.value }))}
            sx={{ mt: 2 }}
          />
        </DialogContent>
        <DialogActions sx={{ p: 3 }}>
          <Button onClick={() => setRedirectModal({ open: false, url: '', redirectUrl: '' })}>
            Cancel
          </Button>
          <Button
            variant="contained"
            onClick={() => {
              if (redirectModal.redirectUrl) {
                setLogs404(prev => prev.map(log => 
                  log.url === redirectModal.url 
                    ? { ...log, redirectUrl: redirectModal.redirectUrl }
                    : log
                ));
                setSnackbar({ open: true, severity: "success", msg: "Redirect added successfully!" });
                setRedirectModal({ open: false, url: '', redirectUrl: '' });
              }
            }}
          >
            Add Redirect
          </Button>
        </DialogActions>
      </Dialog>

      {/* Confirmation Modal for SEO Toggles */}
      <Dialog open={confirmModal.open} onClose={() => setConfirmModal({ open: false, title: '', message: '', field: '', value: false, iconType: '' })} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ textAlign: 'center', pb: 1 }}>
          {confirmModal.iconType === 'seo' ? (
            <SearchIcon sx={{ fontSize: 48, color: '#2196f3', mb: 2 }} />
          ) : confirmModal.iconType === 'meta' ? (
            <VisibilityIcon sx={{ fontSize: 48, color: '#4caf50', mb: 2 }} />
          ) : confirmModal.iconType === 'opengraph' ? (
            <LanguageIcon sx={{ fontSize: 48, color: '#ff9800', mb: 2 }} />
          ) : confirmModal.iconType === 'structured' ? (
            <SearchIcon sx={{ fontSize: 48, color: '#9c27b0', mb: 2 }} />
          ) : confirmModal.iconType === 'sitemap' ? (
            <SearchIcon sx={{ fontSize: 48, color: '#ff5722', mb: 2 }} />
          ) : confirmModal.iconType === 'robots' ? (
            <SearchIcon sx={{ fontSize: 48, color: '#607d8b', mb: 2 }} />
          ) : (
            <SearchIcon sx={{ fontSize: 48, color: '#2196f3', mb: 2 }} />
          )}
          <Typography variant="h6" sx={{ fontWeight: 600 }}>
            {confirmModal.title}
          </Typography>
        </DialogTitle>
        <DialogContent sx={{ textAlign: 'center', py: 2 }}>
          <Typography variant="body2" color="text.secondary">
            {confirmModal.message}
          </Typography>
        </DialogContent>
        <DialogActions sx={{ justifyContent: 'center', pb: 3, gap: 2 }}>
          <Button
            onClick={handleConfirmToggle}
            variant="contained"
            color="primary"
            sx={{ minWidth: 100 }}
          >
            OK
          </Button>
          <Button
            onClick={() => setConfirmModal({ open: false, title: '', message: '', field: '', value: false, iconType: '' })}
            variant="outlined"
            color="error"
            sx={{ minWidth: 100 }}
          >
            Cancel
          </Button>
        </DialogActions>
      </Dialog>

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

export default SeoSettings;
