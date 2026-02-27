import React, { useState, useEffect } from 'react';
import {
  Box,
  Grid,
  Card,
  CardContent,
  Typography,
  TextField,
  Button,
  CircularProgress,
  IconButton,
  Switch,
  FormControl,
  Select,
  MenuItem,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Tooltip,
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import FolderIcon from '@mui/icons-material/Folder';
import WarningIcon from '@mui/icons-material/Warning';

const DeliveryRestrictionSettings = () => {
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [confirmModal, setConfirmModal] = useState({
    open: false,
    action: '',
    data: null,
    title: '',
    message: ''
  });
  const [settings, setSettings] = useState({
    deliveryAvailableCountry: false,
    deliveryAvailableZipCode: false,
    selectedCountry: '',
    zipCodeInput: '',
    countries: [],
    zipCodes: []
  });

  // Load settings from backend
  useEffect(() => {
    const fetchSettings = async () => {
      try {
        setLoading(true);
        const res = await fetch('http://localhost:5000/api/settings/delivery-restriction');
        const data = await res.json();
        setSettings(data);
      } catch (err) {
        console.error('Error fetching delivery restriction settings:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchSettings();
  }, []);

  const handleToggleChange = (field, currentValue) => {
    const fieldLabels = {
      deliveryAvailableCountry: 'Delivery Available Country',
      deliveryAvailableZipCode: 'Delivery Available Zip Code Area'
    };

    const action = currentValue ? 'Turn OFF' : 'Turn ON';
    
    setConfirmModal({
      open: true,
      action: 'toggle',
      data: { field, value: !currentValue },
      title: `Want to ${action} ${fieldLabels[field]}?`,
      message: currentValue 
        ? `Are you sure you want to turn off ${fieldLabels[field]}? This will hide the ${fieldLabels[field]} section.`
        : `Are you sure you want to turn on ${fieldLabels[field]}? This will show the ${fieldLabels[field]} section.`
    });
  };

  const handleConfirmAction = () => {
    if (confirmModal.action === 'toggle') {
      setSettings(prev => ({
        ...prev,
        [confirmModal.data.field]: confirmModal.data.value
      }));
    } else if (confirmModal.action === 'deleteCountry') {
      setSettings(prev => ({
        ...prev,
        countries: prev.countries.filter(country => country.id !== confirmModal.data)
      }));
    } else if (confirmModal.action === 'deleteZipCode') {
      setSettings(prev => ({
        ...prev,
        zipCodes: prev.zipCodes.filter(zip => zip.id !== confirmModal.data)
      }));
    }
    setConfirmModal({ open: false, action: '', data: null, title: '', message: '' });
  };

  const handleSaveCountry = () => {
    if (settings.selectedCountry && !settings.countries.find(c => c.name === settings.selectedCountry)) {
      setSettings(prev => ({
        ...prev,
        countries: [...prev.countries, {
          id: Date.now(),
          name: settings.selectedCountry
        }],
        selectedCountry: ''
      }));
    }
  };

  const handleSaveZipCode = () => {
    if (settings.zipCodeInput.trim()) {
      const zipCodes = settings.zipCodeInput
        .split(',')
        .map(zip => zip.trim())
        .filter(zip => zip && !settings.zipCodes.find(z => z.code === zip));
      
      setSettings(prev => ({
        ...prev,
        zipCodes: [...prev.zipCodes, ...zipCodes.map(zip => ({
          id: Date.now() + Math.random(),
          code: zip
        }))],
        zipCodeInput: ''
      }));
    }
  };

  const handleDeleteCountry = (id) => {
    const country = settings.countries.find(c => c.id === id);
    setConfirmModal({
      open: true,
      action: 'deleteCountry',
      data: id,
      title: 'Delete Country',
      message: `Are you sure you want to remove "${country.name}" from delivery availability?`
    });
  };

  const handleDeleteZipCode = (id) => {
    const zipCode = settings.zipCodes.find(z => z.id === id);
    setConfirmModal({
      open: true,
      action: 'deleteZipCode',
      data: id,
      title: 'Delete Zip Code',
      message: `Are you sure you want to remove zip code "${zipCode.code}" from delivery availability?`
    });
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      const res = await fetch('http://localhost:5000/api/settings/delivery-restriction', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(settings),
      });

      const data = await res.json();
      console.log('Saved:', data);
      alert('Delivery Restriction Settings Saved Successfully');
    } catch (err) {
      console.error('Error saving settings:', err);
      alert('Failed to save settings');
    } finally {
      setSaving(false);
    }
  };

  if (loading)
    return (
      <Box display="flex" justifyContent="center" mt={5}>
        <CircularProgress />
      </Box>
    );

  return (
    <Box sx={{ p: 3 }}>
      {/* Delivery Toggles Section */}
      <Card sx={{ borderRadius: 2, boxShadow: '0 6px 18px rgba(15,23,42,0.06)', mb: 3 }}>
        <CardContent sx={{ p: 3 }}>
          <Typography variant="h6" sx={{ mb: 3, fontWeight: 600 }}>
            Delivery Settings
          </Typography>

          <Grid container spacing={3}>
            <Grid item xs={12} md={6}>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', p: 2, border: '1px solid #e0e0e0', borderRadius: 1 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <Typography variant="body2" sx={{ fontWeight: 500 }}>
                    Delivery Available Country
                  </Typography>
                  <Tooltip title="Enable/disable delivery by country">
                    <IconButton size="small">
                      <InfoOutlinedIcon fontSize="small" />
                    </IconButton>
                  </Tooltip>
                </Box>
                <Switch
                  checked={settings.deliveryAvailableCountry}
                  onChange={() => handleToggleChange('deliveryAvailableCountry', settings.deliveryAvailableCountry)}
                  color="primary"
                />
              </Box>
            </Grid>

            <Grid item xs={12} md={6}>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', p: 2, border: '1px solid #e0e0e0', borderRadius: 1 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <Typography variant="body2" sx={{ fontWeight: 500 }}>
                    Delivery Available Zip Code Area
                  </Typography>
                  <Tooltip title="Enable/disable delivery by zip code">
                    <IconButton size="small">
                      <InfoOutlinedIcon fontSize="small" />
                    </IconButton>
                  </Tooltip>
                </Box>
                <Switch
                  checked={settings.deliveryAvailableZipCode}
                  onChange={() => handleToggleChange('deliveryAvailableZipCode', settings.deliveryAvailableZipCode)}
                  color="primary"
                />
              </Box>
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      {/* Country Management Section */}
      {settings.deliveryAvailableCountry && (
        <Card sx={{ borderRadius: 2, boxShadow: '0 6px 18px rgba(15,23,42,0.06)', mb: 3 }}>
          <CardContent sx={{ p: 3 }}>
            <Typography variant="h6" sx={{ mb: 3, fontWeight: 600 }}>
              Country Management
            </Typography>

            <Grid container spacing={2} sx={{ mb: 3 }}>
              <Grid item xs={12} md={8}>
                <FormControl fullWidth>
                  <Select
                    value={settings.selectedCountry}
                    onChange={(e) => setSettings(prev => ({ ...prev, selectedCountry: e.target.value }))}
                    displayEmpty
                    sx={{ height: 42 }}
                  >
                    <MenuItem value="">Select Country</MenuItem>
                    <MenuItem value="United States">United States</MenuItem>
                    <MenuItem value="United Kingdom">United Kingdom</MenuItem>
                    <MenuItem value="Canada">Canada</MenuItem>
                    <MenuItem value="Australia">Australia</MenuItem>
                    <MenuItem value="India">India</MenuItem>
                    <MenuItem value="Germany">Germany</MenuItem>
                    <MenuItem value="France">France</MenuItem>
                    <MenuItem value="Japan">Japan</MenuItem>
                    <MenuItem value="China">China</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12} md={4}>
                <Button
                  variant="contained"
                  color="primary"
                  onClick={handleSaveCountry}
                  sx={{ height: 42 }}
                >
                  Save Country
                </Button>
              </Grid>
            </Grid>

            <TableContainer>
              <Table>
                <TableHead sx={{ backgroundColor: '#F7FAFF' }}>
                  <TableRow>
                    <TableCell sx={{ fontWeight: 600 }}>Sl No</TableCell>
                    <TableCell sx={{ fontWeight: 600 }}>Country Name</TableCell>
                    <TableCell sx={{ fontWeight: 600 }}>Action</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {settings.countries.length > 0 ? (
                    settings.countries.map((country, index) => (
                      <TableRow key={country.id}>
                        <TableCell>{index + 1}</TableCell>
                        <TableCell>{country.name}</TableCell>
                        <TableCell>
                          <IconButton
                            color="error"
                            onClick={() => handleDeleteCountry(country.id)}
                          >
                            <DeleteIcon />
                          </IconButton>
                        </TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={3} sx={{ textAlign: 'center', py: 4 }}>
                        <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 1 }}>
                          <FolderIcon sx={{ fontSize: 48, color: '#9CA3AF' }} />
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <WarningIcon sx={{ color: '#9CA3AF' }} />
                            <Typography variant="body2" color="text.secondary">
                              No country found
                            </Typography>
                          </Box>
                        </Box>
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </TableContainer>
          </CardContent>
        </Card>
      )}

      {/* Zip Code Management Section */}
      {settings.deliveryAvailableZipCode && (
        <Card sx={{ borderRadius: 2, boxShadow: '0 6px 18px rgba(15,23,42,0.06)', mb: 3 }}>
          <CardContent sx={{ p: 3 }}>
            <Typography variant="h6" sx={{ mb: 3, fontWeight: 600 }}>
              Zip Code Management
            </Typography>

            <Grid container spacing={2} sx={{ mb: 3 }}>
              <Grid item xs={12} md={8}>
                <TextField
                  fullWidth
                  placeholder="Enter zip code (multiple zips separated by comma)"
                  value={settings.zipCodeInput}
                  onChange={(e) => setSettings(prev => ({ ...prev, zipCodeInput: e.target.value }))}
                  onKeyPress={(e) => e.key === 'Enter' && handleSaveZipCode()}
                  sx={{ height: 42 }}
                  InputProps={{ sx: { height: 42 } }}
                />
              </Grid>
              <Grid item xs={12} md={4}>
                <Button
                  variant="contained"
                  color="primary"
                  onClick={handleSaveZipCode}
                  sx={{ height: 42 }}
                >
                  Save Zip Code
                </Button>
              </Grid>
            </Grid>

            <TableContainer>
              <Table>
                <TableHead sx={{ backgroundColor: '#F7FAFF' }}>
                  <TableRow>
                    <TableCell sx={{ fontWeight: 600 }}>Sl No</TableCell>
                    <TableCell sx={{ fontWeight: 600 }}>Zip Code</TableCell>
                    <TableCell sx={{ fontWeight: 600 }}>Action</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {settings.zipCodes.length > 0 ? (
                    settings.zipCodes.map((zipCode, index) => (
                      <TableRow key={zipCode.id}>
                        <TableCell>{index + 1}</TableCell>
                        <TableCell>{zipCode.code}</TableCell>
                        <TableCell>
                          <IconButton
                            color="error"
                            onClick={() => handleDeleteZipCode(zipCode.id)}
                          >
                            <DeleteIcon />
                          </IconButton>
                        </TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={3} sx={{ textAlign: 'center', py: 4 }}>
                        <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 1 }}>
                          <FolderIcon sx={{ fontSize: 48, color: '#9CA3AF' }} />
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <WarningIcon sx={{ color: '#9CA3AF' }} />
                            <Typography variant="body2" color="text.secondary">
                              No zip code found
                            </Typography>
                          </Box>
                        </Box>
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </TableContainer>
          </CardContent>
        </Card>
      )}

      {/* Confirmation Modal */}
      <Dialog open={confirmModal.open} onClose={() => setConfirmModal({ open: false, action: '', data: null, title: '', message: '' })} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ textAlign: 'center', pb: 1 }}>
          <LocationOnIcon sx={{ fontSize: 48, color: '#1976d2', mb: 2 }} />
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
            onClick={handleConfirmAction}
            variant="contained"
            color="primary"
            sx={{ minWidth: 100 }}
          >
            OK
          </Button>
          <Button
            onClick={() => setConfirmModal({ open: false, action: '', data: null, title: '', message: '' })}
            variant="outlined"
            color="error"
            sx={{ minWidth: 100 }}
          >
            Cancel
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default DeliveryRestrictionSettings;
