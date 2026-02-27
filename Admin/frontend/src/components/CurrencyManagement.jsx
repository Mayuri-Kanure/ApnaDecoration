import React, { useEffect, useState } from "react";
import {
  Box,
  Card,
  CardContent,
  Grid,
  Typography,
  TextField,
  Button,
  Table,
  TableHead,
  TableBody,
  TableRow,
  TableCell,
  Switch,
  IconButton,
  CircularProgress,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Snackbar,
  Alert,
  MenuItem,
  Select,
  FormControl,
  InputLabel,
  Tooltip,
  Chip,
} from "@mui/material";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import StarIcon from "@mui/icons-material/Star";
import AddIcon from "@mui/icons-material/Add";
import SaveIcon from "@mui/icons-material/Save";
import RestoreIcon from "@mui/icons-material/Restore";

/**
 * CurrencyManagement component
 *
 * Backend contract (expected):
 *  GET    /api/currencies            -> [{ id, name, symbol, code, active, isDefault }]
 *  POST   /api/currencies            -> { name, symbol, code }  (returns created record)
 *  PUT    /api/currencies/:id        -> { name, symbol, code, active }
 *  DELETE /api/currencies/:id
 *  PUT    /api/currencies/:id/default -> set currency as default
 *
 * Adjust endpoints below to your backend.
 */

const API_BASE = "http://localhost:5000/api/currencies"; // <<-- Change to your real API base

export default function CurrencyManagement() {
  // UI state
  const [currencies, setCurrencies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const [snack, setSnack] = useState({ open: false, severity: "success", message: "" });

  // Add form state
  const [form, setForm] = useState({ name: "", symbol: "", code: "" });
  const [formErrors, setFormErrors] = useState({});

  // Edit modal state
  const [editOpen, setEditOpen] = useState(false);
  const [editItem, setEditItem] = useState(null);

  // Confirmation dialogs
  const [confirmDelete, setConfirmDelete] = useState({ open: false, id: null });
  const [confirmDefault, setConfirmDefault] = useState({ open: false, id: null });

  useEffect(() => {
    fetchList();
  }, []);

  async function fetchList() {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(API_BASE);
      if (!res.ok) throw new Error("Failed to fetch currencies");
      const data = await res.json();
      setCurrencies(data);
    } catch (err) {
      setError(err.message);
      showSnack("error", "Could not load currencies");
    } finally {
      setLoading(false);
    }
  }

  // Form helpers
  function handleChange(e) {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    if (formErrors[name]) {
      setFormErrors((prev) => ({ ...prev, [name]: "" }));
    }
  }

  function validateForm() {
    const errors = {};
    if (!form.name.trim()) errors.name = "Currency name is required";
    if (!form.symbol.trim()) errors.symbol = "Symbol is required";
    if (!form.code.trim()) {
      errors.code = "Currency code is required";
    } else if (form.code.length !== 3) {
      errors.code = "Currency code must be 3 characters";
    }
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  }

  async function handleAddSubmit(e) {
    e.preventDefault();
    if (!validateForm()) return;

    setSaving(true);
    try {
      const res = await fetch(API_BASE, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      if (!res.ok) throw new Error("Failed to add currency");
      await fetchList();
      setForm({ name: "", symbol: "", code: "" });
      showSnack("success", "Currency added successfully");
    } catch (err) {
      showSnack("error", "Could not add currency");
    } finally {
      setSaving(false);
    }
  }

  function handleReset() {
    setForm({ name: "", symbol: "", code: "" });
    setFormErrors({});
  }

  // Edit modal
  function openEditModal(currency) {
    setEditItem({ ...currency });
    setEditOpen(true);
  }

  function handleEditChange(e) {
    const { name, value } = e.target;
    setEditItem((prev) => ({ ...prev, [name]: value }));
  }

  async function handleEditSave() {
    if (!editItem) return;
    setSaving(true);
    try {
      const res = await fetch(`${API_BASE}/${editItem.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: editItem.name,
          symbol: editItem.symbol,
          code: editItem.code,
          active: editItem.active,
        }),
      });
      if (!res.ok) throw new Error("Failed to update currency");
      await fetchList();
      setEditOpen(false);
      setEditItem(null);
      showSnack("success", "Currency updated");
    } catch (err) {
      showSnack("error", "Could not update currency");
    } finally {
      setSaving(false);
    }
  }

  // Status toggle
  async function handleStatusToggle(currency) {
    setSaving(true);
    try {
      const res = await fetch(`${API_BASE}/${currency.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ active: !currency.active }),
      });
      if (!res.ok) throw new Error("Failed to update status");
      await fetchList();
      showSnack("success", "Status updated");
    } catch (err) {
      showSnack("error", "Could not update status");
    } finally {
      setSaving(false);
    }
  }

  // Set default
  async function setAsDefault(id) {
    setSaving(true);
    try {
      const res = await fetch(`${API_BASE}/${id}/default`, {
        method: "PUT",
      });
      if (!res.ok) throw new Error("Failed to set default");
      await fetchList();
      showSnack("success", "Default currency updated");
    } catch (err) {
      showSnack("error", "Could not set default currency");
    } finally {
      setSaving(false);
      setConfirmDefault({ open: false, id: null });
    }
  }

  // Delete
  async function handleDelete(id) {
    setSaving(true);
    try {
      const res = await fetch(`${API_BASE}/${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Failed to delete currency");
      await fetchList();
      showSnack("success", "Currency deleted");
    } catch (err) {
      showSnack("error", "Could not delete currency");
    } finally {
      setSaving(false);
      setConfirmDelete({ open: false, id: null });
    }
  }

  function showSnack(severity, message) {
    setSnack({ open: true, severity, message });
  }

  return (
    <Box sx={{ p: 3 }}>
      {/* Header */}
      <Typography variant="h4" sx={{ fontWeight: 600, mb: 3 }}>
        Currency Management
      </Typography>

      {/* Default Currency Setup */}
      <Card sx={{ mb: 3 }}>
        <CardContent sx={{ p: 3 }}>
          <Typography variant="h6" sx={{ fontWeight: 600, mb: 2 }}>
            Default Currency Setup
          </Typography>
          <Grid container spacing={2} alignItems="center">
            <Grid item xs={12} md={4}>
              <FormControl fullWidth>
                <InputLabel>Currency</InputLabel>
                <Select
                  value={currencies.find((c) => c.isDefault)?.id || ""}
                  onChange={(e) => {
                    const id = e.target.value;
                    if (id) setConfirmDefault({ open: true, id });
                  }}
                  label="Currency"
                >
                  {currencies.map((currency) => (
                    <MenuItem key={currency.id} value={currency.id}>
                      {currency.name} ({currency.symbol})
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item>
              <Button
                variant="contained"
                startIcon={<SaveIcon />}
                onClick={() => {
                  const defaultCurrency = currencies.find((c) => c.isDefault);
                  if (defaultCurrency) showSnack("info", "Default currency already set");
                }}
                sx={{ borderRadius: 2 }}
              >
                Save
              </Button>
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      {/* Add Currency & Currency List */}
      <Card>
        <CardContent sx={{ p: 3 }}>
          <Typography variant="h6" sx={{ fontWeight: 600, mb: 3 }}>
            Add Currency & Currency List
          </Typography>

          {/* Add Currency Form */}
          <Box component="form" onSubmit={handleAddSubmit} sx={{ mb: 4 }}>
            <Grid container spacing={2}>
              <Grid item xs={12} md={3}>
                <TextField
                  fullWidth
                  label="Currency Name"
                  name="name"
                  value={form.name}
                  onChange={handleChange}
                  placeholder="Ex: United States Dollar"
                  error={!!formErrors.name}
                  helperText={formErrors.name}
                  sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
                />
              </Grid>
              <Grid item xs={12} md={3}>
                <TextField
                  fullWidth
                  label="Currency Symbol"
                  name="symbol"
                  value={form.symbol}
                  onChange={handleChange}
                  placeholder="$"
                  error={!!formErrors.symbol}
                  helperText={formErrors.symbol}
                  sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
                />
              </Grid>
              <Grid item xs={12} md={3}>
                <TextField
                  fullWidth
                  label="Currency Code"
                  name="code"
                  value={form.code}
                  onChange={handleChange}
                  placeholder="USD"
                  error={!!formErrors.code}
                  helperText={formErrors.code}
                  sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
                />
              </Grid>
              <Grid item xs={12} md={3}>
                <Box sx={{ display: "flex", gap: 1 }}>
                  <Button
                    type="submit"
                    variant="contained"
                    startIcon={saving ? <CircularProgress size={16} /> : <AddIcon />}
                    disabled={saving}
                    sx={{ borderRadius: 2 }}
                  >
                    {saving ? "Saving..." : "Submit"}
                  </Button>
                  <Button
                    variant="outlined"
                    startIcon={<RestoreIcon />}
                    onClick={handleReset}
                    disabled={saving}
                    sx={{ borderRadius: 2 }}
                  >
                    Reset
                  </Button>
                </Box>
              </Grid>
            </Grid>
          </Box>

          {/* Currency List Table */}
          {loading ? (
            <Box sx={{ display: "flex", justifyContent: "center", py: 4 }}>
              <CircularProgress />
            </Box>
          ) : error ? (
            <Alert severity="error" sx={{ mb: 2 }}>
              {error}
            </Alert>
          ) : (
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>SL</TableCell>
                  <TableCell>Currency Name</TableCell>
                  <TableCell>
                    <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                      Currency Symbol
                      <Tooltip title="The symbol used to represent the currency">
                        <IconButton size="small">
                          <StarIcon fontSize="small" color="action" />
                        </IconButton>
                      </Tooltip>
                    </Box>
                  </TableCell>
                  <TableCell>
                    <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                      Currency Code
                      <Tooltip title="3-letter ISO currency code">
                        <IconButton size="small">
                          <StarIcon fontSize="small" color="action" />
                        </IconButton>
                      </Tooltip>
                    </Box>
                  </TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {currencies.map((currency, index) => (
                  <TableRow key={currency.id} sx={{ '&:hover': { backgroundColor: '#f9f9f9' } }}>
                    <TableCell>{index + 1}</TableCell>
                    <TableCell>{currency.name}</TableCell>
                    <TableCell>{currency.symbol}</TableCell>
                    <TableCell>{currency.code}</TableCell>
                    <TableCell>
                      {currency.isDefault ? (
                        <Chip label="Default" color="primary" size="small" />
                      ) : (
                        <Switch
                          checked={currency.active}
                          onChange={() => handleStatusToggle(currency)}
                          disabled={saving}
                        />
                      )}
                    </TableCell>
                    <TableCell>
                      <Box sx={{ display: "flex", gap: 1 }}>
                        <IconButton
                          size="small"
                          onClick={() => openEditModal(currency)}
                          disabled={saving}
                        >
                          <EditIcon fontSize="small" />
                        </IconButton>
                        <IconButton
                          size="small"
                          onClick={() => setConfirmDelete({ open: true, id: currency.id })}
                          disabled={saving || currency.isDefault}
                          color={currency.isDefault ? "disabled" : "error"}
                        >
                          <DeleteIcon fontSize="small" />
                        </IconButton>
                      </Box>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Edit Modal */}
      <Dialog open={editOpen} onClose={() => setEditOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Edit Currency</DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Currency Name"
                name="name"
                value={editItem?.name || ""}
                onChange={handleEditChange}
                sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Currency Symbol"
                name="symbol"
                value={editItem?.symbol || ""}
                onChange={handleEditChange}
                sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Currency Code"
                name="code"
                value={editItem?.code || ""}
                onChange={handleEditChange}
                sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setEditOpen(false)}>Cancel</Button>
          <Button onClick={handleEditSave} variant="contained" disabled={saving}>
            {saving ? "Saving..." : "Save"}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Delete Confirmation */}
      <Dialog open={confirmDelete.open} onClose={() => setConfirmDelete({ open: false, id: null })}>
        <DialogTitle>Confirm Delete</DialogTitle>
        <DialogContent>
          <Typography>Are you sure you want to delete this currency? This action cannot be undone.</Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setConfirmDelete({ open: false, id: null })}>Cancel</Button>
          <Button onClick={() => handleDelete(confirmDelete.id)} color="error" variant="contained">
            Delete
          </Button>
        </DialogActions>
      </Dialog>

      {/* Set Default Confirmation */}
      <Dialog open={confirmDefault.open} onClose={() => setConfirmDefault({ open: false, id: null })}>
        <DialogTitle>Set Default Currency</DialogTitle>
        <DialogContent>
          <Typography>Are you sure you want to set this as the default currency?</Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setConfirmDefault({ open: false, id: null })}>Cancel</Button>
          <Button onClick={() => setAsDefault(confirmDefault.id)} variant="contained">
            Set Default
          </Button>
        </DialogActions>
      </Dialog>

      {/* Snackbar */}
      <Snackbar
        open={snack.open}
        autoHideDuration={6000}
        onClose={() => setSnack((prev) => ({ ...prev, open: false }))}
        anchorOrigin={{ vertical: "top", horizontal: "right" }}
      >
        <Alert
          onClose={() => setSnack((prev) => ({ ...prev, open: false }))}
          severity={snack.severity}
          sx={{ width: "100%" }}
        >
          {snack.message}
        </Alert>
      </Snackbar>
    </Box>
  );
}
