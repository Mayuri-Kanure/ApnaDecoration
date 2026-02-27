import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import { Box, Typography } from '@mui/material';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import VendorLayout from './components/VendorLayout';
import VendorDashboard from './pages/VendorDashboard';
import VendorProducts from './pages/VendorProducts';
import AddProduct from './pages/AddProduct';
import EditProduct from './pages/EditProduct';
import Profile from './pages/Profile';
import Login from './pages/Login';
import Signup from './pages/Signup';
import VendorOrders from './pages/VendorOrders';

// Protected Route component for vendor
const ProtectedVendorRoute = ({ children }) => {
  const { isAuthenticated, isLoading } = useAuth();
  
  if (isLoading) {
    return (
      <Box sx={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        minHeight: '100vh',
        flexDirection: 'column',
        gap: 2
      }}>
        <Typography>Loading...</Typography>
      </Box>
    );
  }
  
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }
  
  return children;
};

const theme = createTheme({
  palette: {
    primary: {
      main: '#1976d2',
    },
    secondary: {
      main: '#dc004e',
    },
  },
});

function App() {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <AuthProvider>
        <Router>
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/signup" element={<Signup />} />
            <Route path="/" element={
              <ProtectedVendorRoute>
                <VendorLayout />
              </ProtectedVendorRoute>
            }>
              <Route index element={<VendorDashboard />} />
              <Route path="dashboard" element={<VendorDashboard />} />
              <Route path="products" element={<VendorProducts />} />
              <Route path="products/add" element={<AddProduct />} />
              <Route path="products/edit/:id" element={<EditProduct />} />
              <Route path="orders" element={<VendorOrders />} />
              <Route path="profile" element={<Profile />} />
            </Route>
          </Routes>
        </Router>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;
