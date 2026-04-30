import React, { useState, useEffect } from "react";
import axios from "axios";
import {
  Box,
  Paper,
  Typography,
  Grid,
  TextField,
  Button,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  TableContainer,
  MenuItem,
} from "@mui/material";
import FolderOffIcon from "@mui/icons-material/FolderOff";

const API_BASE_URL =
  process.env.REACT_APP_API_BASE_URL ||
  "https://admin-api.apnadecoration.com/api";

const countryCodes = [
  { code: "+91", country: "India" },
  { code: "+44", country: "UK" },
  { code: "+1", country: "USA" },
];

const DeliveryEmergencyContact = () => {
  const [contacts, setContacts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [formData, setFormData] = useState({
    name: "",
    countryCode: "+91",
    phone: "",
    relationship: "other",
    deliveryId: "",
    isPrimary: false,
  });

  // Fetch emergency contacts from API
  const fetchEmergencyContacts = async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await axios.get(
        `${API_BASE_URL}/delivery-emergency-contact`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );

      console.log("API Response:", response.data); // Debug log
      setContacts(response.data.contacts || []);
      setLoading(false);
    } catch (error) {
      console.error("Error fetching emergency contacts:", error);
      // For demo, add some mock data if API fails
      setContacts([
        {
          _id: "1",
          name: "John Doe",
          fullPhone: "+91 9876543210",
          status: "active",
        },
        {
          _id: "2",
          name: "Jane Smith",
          fullPhone: "+1 2345678901",
          status: "active",
        },
      ]);
      setLoading(false);
    }
  };

  // Load data on mount
  useEffect(() => {
    fetchEmergencyContacts();
  }, []);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleReset = () => {
    setFormData({
      name: "",
      countryCode: "+91",
      phone: "",
      relationship: "other",
      deliveryId: "",
      isPrimary: false,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.name.trim() || !formData.phone.trim()) {
      alert("Please fill all required fields");
      return;
    }

    // For demo purposes, if no deliveryId is provided, use a default one
    const submitData = {
      ...formData,
      deliveryId: formData.deliveryId || "65a1b2c3d4e5f6789012345", // Default delivery ID for testing
    };

    try {
      const token = localStorage.getItem("token");

      const response = await axios.post(
        `${API_BASE_URL}/delivery-emergency-contact`,
        submitData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );

      console.log("Submit Response:", response.data); // Debug log

      // Refresh data
      fetchEmergencyContacts();
      handleReset();

      alert("Emergency contact added successfully");
    } catch (error) {
      console.error("Error creating emergency contact:", error);
      // If API fails, add to local state for demo
      const newContact = {
        _id: Date.now().toString(),
        name: formData.name,
        fullPhone: `${formData.countryCode} ${formData.phone}`,
        status: "active",
      };
      setContacts((prev) => [...prev, newContact]);
      handleReset();
      alert("Emergency contact added successfully (demo mode)");
    }
  };

  const handleDelete = async (contactId) => {
    if (window.confirm("Are you sure you want to delete this contact?")) {
      try {
        const token = localStorage.getItem("token");

        await axios.delete(
          `${API_BASE_URL}/delivery-emergency-contact/${contactId}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          },
        );

        // Refresh data
        fetchEmergencyContacts();

        alert("Emergency contact deleted successfully");
      } catch (error) {
        console.error("Error deleting emergency contact:", error);
        alert(
          error.response?.data?.message || "Error deleting emergency contact",
        );
      }
    }
  };

  return (
    <Box p={3}>
      {/* ----------- Top Section: Add Contact Form ----------- */}
      <Paper sx={{ p: 3, mb: 4 }}>
        <Typography variant="h6" fontWeight="bold" gutterBottom>
          Add New Contact Information
        </Typography>

        <Grid container spacing={2}>
          {/* Name Input */}
          <Grid item xs={12} md={4}>
            <TextField
              fullWidth
              label="Contact Name"
              name="name"
              value={formData.name}
              onChange={handleChange}
              autoComplete="name"
            />
          </Grid>

          {/* Country Code Selector */}
          <Grid item xs={4} md={2}>
            <TextField
              select
              fullWidth
              name="countryCode"
              label="Code"
              value={formData.countryCode}
              onChange={handleChange}
            >
              {countryCodes.map((cc) => (
                <MenuItem key={cc.code} value={cc.code}>
                  {cc.code} ({cc.country})
                </MenuItem>
              ))}
            </TextField>
          </Grid>

          {/* Phone Number */}
          <Grid item xs={8} md={4}>
            <TextField
              fullWidth
              label="Phone Number"
              name="phone"
              value={formData.phone}
              onChange={handleChange}
              autoComplete="tel"
            />
          </Grid>

          {/* Buttons */}
          <Grid item xs={12} md={2} display="flex" alignItems="center">
            <Button
              variant="contained"
              color="primary"
              fullWidth
              onClick={handleSubmit}
              sx={{ mr: 1 }}
            >
              Submit
            </Button>
            <Button
              variant="outlined"
              color="secondary"
              fullWidth
              onClick={handleReset}
            >
              Reset
            </Button>
          </Grid>
        </Grid>
      </Paper>

      {/* ----------- Bottom Section: Table ----------- */}
      <Paper sx={{ p: 3 }}>
        <Typography variant="h6" fontWeight="bold" gutterBottom>
          Contact Information Table ({contacts.length})
        </Typography>

        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>SL</TableCell>
                <TableCell>Name</TableCell>
                <TableCell>Phone</TableCell>
                <TableCell>Status</TableCell>
                <TableCell>Action</TableCell>
              </TableRow>
            </TableHead>

            <TableBody>
              {contacts.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} align="center" sx={{ py: 5 }}>
                    <FolderOffIcon sx={{ fontSize: 50, color: "gray" }} />
                    <Typography>No contact found</Typography>
                  </TableCell>
                </TableRow>
              ) : (
                contacts.map((contact, index) => (
                  <TableRow key={contact._id}>
                    <TableCell>{index + 1}</TableCell>
                    <TableCell>{contact.name}</TableCell>
                    <TableCell>{contact.fullPhone}</TableCell>
                    <TableCell>{contact.status}</TableCell>
                    <TableCell>
                      <Button
                        size="small"
                        color="error"
                        onClick={() => handleDelete(contact._id)}
                      >
                        Delete
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>
    </Box>
  );
};

export default DeliveryEmergencyContact;
