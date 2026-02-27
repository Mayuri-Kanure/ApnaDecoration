import React from 'react';
import { Box, Typography } from '@mui/material';
import { Link } from 'react-router-dom';
import { Business as BusinessIcon, Person as ProfileIcon, Home as HomeIcon } from '@mui/icons-material';

function Footer() {
  return (
    <Box
      component="footer"
      sx={{
        bgcolor: '#1e293b',
        color: 'white',
        py: 3,
        px: 3,
        mt: 'auto',
        textAlign: 'center'
      }}
    >
      {/* Navigation Links */}
      <Box sx={{ display: 'flex', justifyContent: 'center', gap: 4, mb: 2 }}>
        <Link 
          to="/Business-settings" 
          style={{ 
            color: 'inherit',
            textDecoration: 'none',
            display: 'flex', 
            alignItems: 'center', 
            gap: '4px',
            '&:hover': { color: '#60a5fa' }
          }}
        >
          <BusinessIcon sx={{ fontSize: 20 }} />
          <Typography variant="body2">Business Setup</Typography>
        </Link>
        
        <Link 
          to="/profile" 
          style={{ 
            color: 'inherit',
            textDecoration: 'none',
            display: 'flex', 
            alignItems: 'center', 
            gap: '4px',
            '&:hover': { color: '#60a5fa' }
          }}
        >
          <ProfileIcon sx={{ fontSize: 20 }} />
          <Typography variant="body2">Profile</Typography>
        </Link>
        
        <Link 
          to="/dashboard" 
          style={{ 
            color: 'inherit',
            textDecoration: 'none',
            display: 'flex', 
            alignItems: 'center', 
            gap: '4px',
            '&:hover': { color: '#60a5fa' }
          }}
        >
          <HomeIcon sx={{ fontSize: 20 }} />
          <Typography variant="body2">Home</Typography>
        </Link>
      </Box>

      {/* Version and Copyright */}
      <Box sx={{ mt: 2 }}>
        <Typography variant="body2" sx={{ mb: 1, color: '#94a3b8' }}>
          Software Version (15.0)
        </Typography>
        <Typography variant="caption" color="#64748b">
          © 2025 PrintForMee. All rights reserved.
        </Typography>
      </Box>
    </Box>
  );
}

export default Footer;
