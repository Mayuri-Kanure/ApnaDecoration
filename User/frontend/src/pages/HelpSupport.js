import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Box,
  Typography,
  Card,
  CardContent,
  Button,
  Grid,
  TextField,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Alert,
} from "@mui/material";
import {
  MessageCircle,
  Phone,
  Mail,
  Package,
  Calendar,
  HelpCircle,
  ArrowRight,
} from "lucide-react";

const HelpSupport = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    subject: "",
    category: "general",
    priority: "medium",
    orderId: "",
    description: "",
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    // Handle form submission
    console.log("Support ticket created:", formData);
    // Navigate to support center with form data
    navigate("/support", { state: { formData } });
  };

  const quickActions = [
    {
      title: "Order Issues",
      description: "Delivery, payment, refund problems",
      icon: <Package className="w-6 h-6" />,
      action: () => navigate("/dashboard/orders"),
    },
    {
      title: "Service Booking",
      description: "Decoration setup, vendor issues",
      icon: <Calendar className="w-6 h-6" />,
      action: () => navigate("/dashboard/bookings"),
    },
    {
      title: "General Help",
      description: "Account, website, other queries",
      icon: <HelpCircle className="w-6 h-6" />,
      action: () => setFormData({ ...formData, category: "general" }),
    },
  ];

  return (
    <Box sx={{ p: 3, maxWidth: 1200, mx: "auto" }}>
      <Typography variant="h3" sx={{ mb: 2, fontWeight: 600 }}>
        Help & Support
      </Typography>
      <Typography variant="body1" color="text.secondary" sx={{ mb: 4 }}>
        We're here to help! Get quick assistance for your orders, services, and
        account.
      </Typography>

      {/* Quick Actions */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        {quickActions.map((action, index) => (
          <Grid item xs={12} md={4} key={index}>
            <Card
              sx={{
                cursor: "pointer",
                transition: "all 0.3s",
                "&:hover": {
                  transform: "translateY(-4px)",
                  boxShadow: 4,
                },
              }}
              onClick={action.action}
            >
              <CardContent sx={{ p: 3, textAlign: "center" }}>
                <Box
                  sx={{
                    display: "flex",
                    justifyContent: "center",
                    mb: 2,
                    color: "primary.main",
                  }}
                >
                  {action.icon}
                </Box>
                <Typography variant="h6" sx={{ mb: 1 }}>
                  {action.title}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {action.description}
                </Typography>
                <Box sx={{ mt: 2 }}>
                  <ArrowRight className="w-4 h-4" />
                </Box>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      {/* Support Form */}
      <Card sx={{ mb: 4 }}>
        <CardContent sx={{ p: 4 }}>
          <Typography variant="h5" sx={{ mb: 3 }}>
            Create Support Ticket
          </Typography>

          <form onSubmit={handleSubmit}>
            <Grid container spacing={3}>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Subject"
                  value={formData.subject}
                  onChange={(e) =>
                    setFormData({ ...formData, subject: e.target.value })
                  }
                  required
                />
              </Grid>

              <Grid item xs={12} md={6}>
                <FormControl fullWidth>
                  <InputLabel>Category</InputLabel>
                  <Select
                    value={formData.category}
                    onChange={(e) =>
                      setFormData({ ...formData, category: e.target.value })
                    }
                    label="Category"
                  >
                    <MenuItem value="order">Order Related</MenuItem>
                    <MenuItem value="payment">Payment Issue</MenuItem>
                    <MenuItem value="service">Service Issue</MenuItem>
                    <MenuItem value="technical">Technical Problem</MenuItem>
                    <MenuItem value="general">General Inquiry</MenuItem>
                  </Select>
                </FormControl>
              </Grid>

              <Grid item xs={12} md={6}>
                <FormControl fullWidth>
                  <InputLabel>Priority</InputLabel>
                  <Select
                    value={formData.priority}
                    onChange={(e) =>
                      setFormData({ ...formData, priority: e.target.value })
                    }
                    label="Priority"
                  >
                    <MenuItem value="low">Low</MenuItem>
                    <MenuItem value="medium">Medium</MenuItem>
                    <MenuItem value="high">High</MenuItem>
                    <MenuItem value="urgent">Urgent</MenuItem>
                  </Select>
                </FormControl>
              </Grid>

              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Order ID (Optional)"
                  value={formData.orderId}
                  onChange={(e) =>
                    setFormData({ ...formData, orderId: e.target.value })
                  }
                />
              </Grid>

              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Description"
                  multiline
                  rows={4}
                  value={formData.description}
                  onChange={(e) =>
                    setFormData({ ...formData, description: e.target.value })
                  }
                  required
                />
              </Grid>

              <Grid item xs={12}>
                <Button
                  type="submit"
                  variant="contained"
                  size="large"
                  sx={{ minWidth: 200 }}
                >
                  Submit Ticket
                </Button>
              </Grid>
            </Grid>
          </form>
        </CardContent>
      </Card>

      {/* Contact Options */}
      <Grid container spacing={3}>
        <Grid item xs={12} md={4}>
          <Card>
            <CardContent sx={{ textAlign: "center", p: 3 }}>
              <MessageCircle
                className="w-8 h-8 mb-2"
                style={{ color: "#1976d2" }}
              />
              <Typography variant="h6" sx={{ mb: 1 }}>
                Live Chat
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Chat with our support team instantly
              </Typography>
              <Button variant="outlined" sx={{ mt: 2 }}>
                Start Chat
              </Button>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={4}>
          <Card>
            <CardContent sx={{ textAlign: "center", p: 3 }}>
              <Phone className="w-8 h-8 mb-2" style={{ color: "#4caf50" }} />
              <Typography variant="h6" sx={{ mb: 1 }}>
                Call Support
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Mon-Sat: 9AM-8PM, Sun: 10AM-6PM
              </Typography>
              <Button variant="outlined" sx={{ mt: 2 }}>
                Call +91 98765 12345
              </Button>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={4}>
          <Card>
            <CardContent sx={{ textAlign: "center", p: 3 }}>
              <Mail className="w-8 h-8 mb-2" style={{ color: "#ff9800" }} />
              <Typography variant="h6" sx={{ mb: 1 }}>
                Email Support
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Get response within 24 hours
              </Typography>
              <Button variant="outlined" sx={{ mt: 2 }}>
                support@apnadecoration.com
              </Button>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
};

export default HelpSupport;
