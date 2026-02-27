import React, { useEffect, useState, useCallback } from "react";
import axios from "axios";
import {
  Box,
  Card,
  CardContent,
  Typography,
  Grid,
  TextField,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  TablePagination,
  CircularProgress,
  Chip,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Snackbar,
  Alert
} from "@mui/material";
import {
  CloudDownload as ExportIcon,
  Search as SearchIcon,
  Check as ApproveIcon,
  Close as RejectIcon,
  Visibility as ViewIcon,
  AccountBalanceWallet as WithdrawIcon,
  Inbox as InboxIcon
} from "@mui/icons-material";

/**
 * WithdrawRequests component
 * - Uses axios to call your API endpoints
 * - Expects a MongoDB-backed API described in the header comments
 */
export default function WithdrawRequests() {
  // UI state
  const [rows, setRows] = useState([]);
  const [total, setTotal] = useState(0);
  const [statusFilter, setStatusFilter] = useState("all");
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(0); // zero-based internally
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [loading, setLoading] = useState(false);

  // dialogs & notifications
  const [confirmDialog, setConfirmDialog] = useState({ open: false, id: null, type: null, label: "" });
  const [viewing, setViewing] = useState(null); // object for view dialog
  const [snackbar, setSnackbar] = useState({ open: false, message: "", severity: "success" });

  // fetch list from backend
  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const resp = await axios.get(`${process.env.REACT_APP_API_URL || 'https://admin-api.apnadecoration.com/api'}/withdraws`, {
        headers: { Authorization: `Bearer ${token}` },
        params: {
          status: statusFilter,
          search: search || undefined,
          page: page + 1, // backend expects 1-based page
          limit: rowsPerPage
        }
      });
      const { data, total: count } = resp.data;
      setRows(Array.isArray(data) ? data : []);
      setTotal(typeof count === "number" ? count : (Array.isArray(data) ? data.length : 0));
    } catch (err) {
      console.error("Failed to fetch withdraw requests", err);
      setSnackbar({ open: true, message: "Failed to load requests", severity: "error" });
    } finally {
      setLoading(false);
    }
  }, [statusFilter, search, page, rowsPerPage]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // approve / reject actions
  const handleAction = async (id, action, reason = "") => {
    // action: 'approve' | 'reject'
    setConfirmDialog({ open: false, id: null, type: null, label: "" });
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const url = `/api/withdraw/${action}/${id}`;
      const response = await axios.patch(url, { reason }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setSnackbar({ open: true, message: response.data?.message || `${action}d successfully`, severity: "success" });
      // refresh list
      fetchData();
    } catch (err) {
      console.error(`${action} error`, err);
      setSnackbar({ open: true, message: err?.response?.data?.message || `Failed to ${action}`, severity: "error" });
    } finally {
      setLoading(false);
    }
  };

  // Export file - expects a blob response
  const handleExport = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(`${process.env.REACT_APP_API_URL || 'https://admin-api.apnadecoration.com/api'}/withdraw-methods`, {
        headers: { Authorization: `Bearer ${token}` },
        params: { status: statusFilter, search: search || undefined },
        responseType: "blob"
      });

      // Try detect filename from content-disposition
      const cd = response.headers["content-disposition"];
      let filename = "withdraw_export.xlsx";
      if (cd) {
        const match = cd.match(/filename="?(.+)"?/);
        if (match) filename = match[1];
      }

      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", filename);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
      setSnackbar({ open: true, message: "Export started", severity: "success" });
    } catch (err) {
      console.error("Export error", err);
      setSnackbar({ open: true, message: "Export failed", severity: "error" });
    } finally {
      setLoading(false);
    }
  };

  // pagination handlers
  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };
  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  // confirm dialog open
  const openConfirm = (id, type) => {
    const label = type === "approve" ? "Approve this withdrawal?" : "Reject this withdrawal?";
    setConfirmDialog({ open: true, id, type, label });
  };

  // view dialog open (show minimal fields)
  const openView = (row) => setViewing(row);
  const closeView = () => setViewing(null);

  // small helper to format date
  const formatDate = (iso) => {
    if (!iso) return "-";
    try {
      const d = new Date(iso);
      return d.toLocaleString();
    } catch {
      return iso;
    }
  };

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h5" sx={{ mb: 2, display: "flex", alignItems: "center", gap: 1 }}>
        <WithdrawIcon sx={{ fontSize: 24, color: '#4CAF50' }} /> Vendor Withdrawals
      </Typography>

      <Card sx={{ mb: 3, borderRadius: 2 }}>
        <CardContent>
          <Grid container spacing={2} alignItems="center">
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                placeholder="Search by vendor name, phone, email or reference"
                size="small"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                InputProps={{ startAdornment: <SearchIcon sx={{ mr: 1 }} /> }}
              />
            </Grid>

            <Grid item xs={6} md={3}>
              <FormControl fullWidth size="small">
                <InputLabel id="status-label">Status</InputLabel>
                <Select
                  labelId="status-label"
                  value={statusFilter}
                  label="Status"
                  onChange={(e) => { setStatusFilter(e.target.value); setPage(0); }}
                >
                  <MenuItem value="all">All</MenuItem>
                  <MenuItem value="pending">Pending</MenuItem>
                  <MenuItem value="approved">Approved</MenuItem>
                  <MenuItem value="rejected">Rejected</MenuItem>
                </Select>
              </FormControl>
            </Grid>

            <Grid item xs={6} md={3} sx={{ display: "flex", justifyContent: "flex-end", gap: 1 }}>
              <Button variant="outlined" startIcon={<ExportIcon />} onClick={handleExport} disabled={loading}>
                Export
              </Button>
              <Button variant="contained" onClick={() => { setPage(0); fetchData(); }} disabled={loading}>
                Filter
              </Button>
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      <Card sx={{ borderRadius: 2 }}>
        <CardContent>
          <Typography variant="subtitle1" sx={{ mb: 1 }}>
            Vendor Withdrawal Requests <Chip label={total} size="small" sx={{ ml: 1 }} />
          </Typography>

          {loading ? (
            <Box sx={{ display: "flex", justifyContent: "center", py: 8 }}>
              <CircularProgress />
            </Box>
          ) : rows.length === 0 ? (
            // Empty state
            <Box sx={{ textAlign: "center", py: 8 }}>
              <InboxIcon sx={{ fontSize: 80, color: '#CCCCCC', mb: 2 }} />
              <Typography sx={{ mt: 2, color: "text.secondary" }}>No vendor withdrawal requests found</Typography>
            </Box>
          ) : (
            <>
              <TableContainer component={Paper} sx={{ boxShadow: "none" }}>
                <Table>
                  <TableHead>
                    <TableRow sx={{ background: "#F6F8FA" }}>
                      <TableCell>SL</TableCell>
                      <TableCell>Amount</TableCell>
                      <TableCell>Vendor Name</TableCell>
                      <TableCell>Request Time</TableCell>
                      <TableCell>Status</TableCell>
                      <TableCell>Action</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {rows.map((row, idx) => (
                      <TableRow key={row._id}>
                        <TableCell>{page * rowsPerPage + idx + 1}</TableCell>
                        <TableCell>₹ {row.amount?.toLocaleString?.() ?? row.amount}</TableCell>
                        <TableCell>
                          <Box>
                            <Typography sx={{ fontWeight: 'medium' }}>
                              {row.userName || row.vendorName || row.name || "-"}
                            </Typography>
                            <Typography variant="caption" color="text.secondary">
                              {row.userEmail || row.vendorEmail || row.email || ""}
                            </Typography>
                          </Box>
                        </TableCell>
                        <TableCell>{formatDate(row.requestedAt || row.requestTime || row.createdAt)}</TableCell>
                        <TableCell>
                          {row.status === "approved" && <Chip label="Approved" color="success" size="small" />}
                          {row.status === "rejected" && <Chip label="Rejected" color="error" size="small" />}
                          {row.status === "pending" && <Chip label="Pending" color="warning" size="small" />}
                        </TableCell>
                        <TableCell>
                          <IconButton size="small" onClick={() => openView(row)}><ViewIcon /></IconButton>

                          {row.status === "pending" && (
                            <>
                              <IconButton size="small" color="success" onClick={() => openConfirm(row._id, "approve")}>
                                <ApproveIcon />
                              </IconButton>
                              <IconButton size="small" color="error" onClick={() => openConfirm(row._id, "reject")}>
                                <RejectIcon />
                              </IconButton>
                            </>
                          )}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>

              <TablePagination
                component="div"
                count={total}
                page={page}
                onPageChange={handleChangePage}
                rowsPerPage={rowsPerPage}
                onRowsPerPageChange={handleChangeRowsPerPage}
                rowsPerPageOptions={[5, 10, 20, 50]}
              />
            </>
          )}
        </CardContent>
      </Card>

      {/* Confirm Approve/Reject Dialog */}
      <Dialog
        open={confirmDialog.open}
        onClose={() => setConfirmDialog({ open: false, id: null, type: null, label: "" })}
      >
        <DialogTitle>{confirmDialog.type === "approve" ? "Approve withdrawal" : "Reject withdrawal"}</DialogTitle>
        <DialogContent>
          <Typography>{confirmDialog.label}</Typography>
          {confirmDialog.type === "reject" && (
            <TextField
              fullWidth
              multiline
              rows={3}
              placeholder="Optional reason for rejection"
              sx={{ mt: 2 }}
              id="reject-reason"
            />
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setConfirmDialog({ open: false, id: null, type: null, label: "" })}>Cancel</Button>
          <Button
            variant="contained"
            color={confirmDialog.type === "approve" ? "success" : "error"}
            onClick={() => {
              const reasonEl = document.getElementById("reject-reason");
              const reason = reasonEl ? reasonEl.value : "";
              handleAction(confirmDialog.id, confirmDialog.type, reason);
            }}
          >
            {confirmDialog.type === "approve" ? "Approve" : "Reject"}
          </Button>
        </DialogActions>
      </Dialog>

      {/* View Dialog */}
      <Dialog open={!!viewing} onClose={closeView} maxWidth="sm" fullWidth>
        <DialogTitle>Vendor Withdraw Request</DialogTitle>
        <DialogContent dividers>
          {viewing && (
            <Grid container spacing={2}>
              <Grid item xs={6}><Typography variant="subtitle2">Vendor</Typography><Typography>{viewing.userName || viewing.vendorName}</Typography></Grid>
              <Grid item xs={6}><Typography variant="subtitle2">Amount</Typography><Typography>₹ {viewing.amount}</Typography></Grid>
              <Grid item xs={6}><Typography variant="subtitle2">Requested On</Typography><Typography>{formatDate(viewing.requestedAt || viewing.requestTime || viewing.createdAt)}</Typography></Grid>
              <Grid item xs={6}><Typography variant="subtitle2">Status</Typography>
                {viewing.status === "pending" ? <Chip label="Pending" color="warning" /> : viewing.status === "approved" ? <Chip label="Approved" color="success" /> : <Chip label="Rejected" color="error" />}
              </Grid>
              <Grid item xs={12}><Typography variant="subtitle2">Reference</Typography><Typography>{viewing.withdrawId || viewing.reference || "-"}</Typography></Grid>
              {viewing.notes && <Grid item xs={12}><Typography variant="subtitle2">Note</Typography><Typography>{viewing.notes}</Typography></Grid>}
            </Grid>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={closeView}>Close</Button>
        </DialogActions>
      </Dialog>

      {/* snackbar */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={4000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
        anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
      >
        <Alert severity={snackbar.severity} onClose={() => setSnackbar({ ...snackbar, open: false })}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
}
