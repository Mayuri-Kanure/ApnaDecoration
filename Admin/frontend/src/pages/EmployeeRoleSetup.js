import React, { useState } from "react";
import {
  Box,
  Paper,
  Typography,
  TextField,
  Button,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  TableContainer,
  Checkbox,
  FormControlLabel,
  Chip,
  IconButton,
  InputAdornment,
} from "@mui/material";
import {
  Search as SearchIcon,
  FileDownload as ExportIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  FolderOff as EmptyIcon,
} from "@mui/icons-material";

const modules = [
  "Dashboard",
  "POS Management",
  "Order Management",
  "Product Management",
  "Promotion Management",
  "Help & Support",
  "Reports & Analytics",
  "User Management",
  "System Settings",
];

const EmployeeRoleSetup = () => {
  const [roles, setRoles] = useState([]);
  const [roleName, setRoleName] = useState("");
  const [selectedModules, setSelectedModules] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectAll, setSelectAll] = useState(false);

  const handleModuleToggle = (module) => {
    const currentIndex = selectedModules.indexOf(module);
    const newSelected = [...selectedModules];

    if (currentIndex === -1) {
      newSelected.push(module);
    } else {
      newSelected.splice(currentIndex, 1);
    }

    setSelectedModules(newSelected);
    setSelectAll(newSelected.length === modules.length);
  };

  const handleSelectAllToggle = () => {
    if (selectAll) {
      setSelectedModules([]);
      setSelectAll(false);
    } else {
      setSelectedModules([...modules]);
      setSelectAll(true);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!roleName.trim() || selectedModules.length === 0) return;

    const newRole = {
      id: Date.now(),
      name: roleName,
      modules: [...selectedModules],
      createdAt: new Date().toISOString(),
      status: "Active",
    };

    setRoles([...roles, newRole]);
    setRoleName("");
    setSelectedModules([]);
    setSelectAll(false);
  };

  const handleReset = () => {
    setRoleName("");
    setSelectedModules([]);
    setSelectAll(false);
  };

  const filteredRoles = roles.filter((role) =>
    role.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleExport = () => {
    if (filteredRoles.length === 0) return;

    const csvContent = [
      ["SL", "Role Name", "Modules", "Created At", "Status"].join(","),
      ...filteredRoles.map((role, index) => [
        index + 1,
        role.name,
        role.modules.join("; "),
        new Date(role.createdAt).toLocaleDateString(),
        role.status,
      ].join(",")),
    ].join("\n");

    const blob = new Blob([csvContent], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "employee_roles.csv";
    a.click();
    window.URL.revokeObjectURL(url);
  };

  return (
    <Box p={3}>
      {/* ----------- Role List Section ----------- */}
      <Paper sx={{ p: 3 }}>
        <Typography variant="h6" fontWeight="bold" gutterBottom>
          Employee Roles
        </Typography>

        {/* Search Bar */}
        <TextField
          fullWidth
          placeholder="Search roles..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon />
              </InputAdornment>
            ),
          }}
          sx={{ mb: 3 }}
        />

        {/* Export Button */}
        <Button
          variant="outlined"
          startIcon={<ExportIcon />}
          onClick={handleExport}
          disabled={filteredRoles.length === 0}
          sx={{ mb: 3 }}
        >
          Export to CSV
        </Button>

        {/* Roles Table */}
        {filteredRoles.length === 0 ? (
          <Box
            sx={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              py: 8,
              color: "text.secondary",
            }}
          >
            <EmptyIcon sx={{ fontSize: 64, mb: 2 }} />
            <Typography variant="h6" gutterBottom>
              No roles found
            </Typography>
            <Typography variant="body2">
              {searchTerm
                ? "No roles match your search criteria"
                : "No roles have been created yet"}
            </Typography>
          </Box>
        ) : (
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>SL</TableCell>
                  <TableCell>Role Name</TableCell>
                  <TableCell>Modules</TableCell>
                  <TableCell>Created At</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell align="center">Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {filteredRoles.map((role, index) => (
                  <TableRow key={role.id}>
                    <TableCell>{index + 1}</TableCell>
                    <TableCell>{role.name}</TableCell>
                    <TableCell>
                      <Box sx={{ display: "flex", flexWrap: "wrap", gap: 0.5 }}>
                        {role.modules.map((module) => (
                          <Chip
                            key={module}
                            label={module}
                            size="small"
                            variant="outlined"
                          />
                        ))}
                      </Box>
                    </TableCell>
                    <TableCell>
                      {new Date(role.createdAt).toLocaleDateString()}
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={role.status}
                        color={role.status === "Active" ? "success" : "default"}
                        size="small"
                      />
                    </TableCell>
                    <TableCell align="center">
                      <IconButton size="small" color="primary">
                        <EditIcon />
                      </IconButton>
                      <IconButton size="small" color="error">
                        <DeleteIcon />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        )}
      </Paper>
    </Box>
  );
};

export default EmployeeRoleSetup;
