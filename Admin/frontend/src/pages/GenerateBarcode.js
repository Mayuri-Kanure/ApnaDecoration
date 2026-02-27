import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import axios from 'axios';
import {
  Box,
  Typography,
  Card,
  CardContent,
  TextField,
  Button,
  Grid,
  Paper,
  Alert,
  InputAdornment,
  Divider,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
} from '@mui/material';
import {
  Print as PrintIcon,
  Refresh as RefreshIcon,
  QrCode as QrCodeIcon,
  Delete as DeleteIcon,
  Inventory as ProductIcon,
  LocalOffer as PriceIcon,
} from '@mui/icons-material';

const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || 'https://admin-api.apnadecoration.com/api';

function GenerateBarcode() {
  const location = useLocation();
  const navigate = useNavigate();
  const { product } = location.state || {};

  const [barcodeItems, setBarcodeItems] = useState([]);
  const [generatedBarcodes, setGeneratedBarcodes] = useState([]);
  const [error, setError] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);

  const MAX_QUANTITY = 270;

  useEffect(() => {
    if (product) {
      setBarcodeItems([
        {
          id: 1,
          code: product?.sku || product?.product_name_en?.replace(/\s+/g, '') || 'UNKNOWN',
          name: product?.product_name_en || 'Unknown Product',
          quantity: 1,
        },
      ]);
    } else if (!product && barcodeItems.length === 0) {
      navigate('/dashboard/product-list');
    }
  }, [product, navigate, barcodeItems.length]);

  const handleQuantityChange = (id, value) => {
    const numValue = parseInt(value) || 0;
    let correctedValue = numValue;
    let showAutoCorrection = false;
    
    // Auto-correction for values exceeding maximum
    if (numValue > MAX_QUANTITY) {
      correctedValue = MAX_QUANTITY;
      showAutoCorrection = true;
      setError(`Quantity adjusted to maximum limit (${MAX_QUANTITY})`);
    } else if (numValue < 1) {
      correctedValue = 1;
      showAutoCorrection = true;
      setError(`Quantity adjusted to minimum (1)`);
    } else {
      setError('');
    }

    setBarcodeItems((items) =>
      items.map((item) =>
        item.id === id
          ? { ...item, quantity: correctedValue }
          : item
      )
    );

    // Clear auto-correction message after 3 seconds
    if (showAutoCorrection) {
      setTimeout(() => setError(''), 3000);
    }
  };

  const handleDeleteItem = (id) => {
    if (barcodeItems.length > 1) {
      setBarcodeItems((items) => items.filter((item) => item.id !== id));
    }
  };

  const generateBarcodeForItem = (itemId) => {
    const item = barcodeItems.find(item => item.id === itemId);
    if (!item || item.quantity < 1 || item.quantity > MAX_QUANTITY) {
      setError(`Please enter valid quantity (1-${MAX_QUANTITY}) for this item`);
      return;
    }

    setIsGenerating(true);
    setError('');

    // Generate barcode labels for this specific item
    const itemBarcodes = [];
    for (let i = 0; i < item.quantity; i++) {
      itemBarcodes.push({
        id: generatedBarcodes.length + i + 1,
        productCode: item.code,
        productName: item.name,
        brandName: 'P',
        price: product?.unit_price || 0,
        barcode: generateBarcodeNumber(item.code, i + 1),
        itemId: itemId,
      });
    }

    setGeneratedBarcodes(prev => [...prev, ...itemBarcodes]);
    setIsGenerating(false);
  };

  const resetItem = (itemId) => {
    setBarcodeItems(items => 
      items.map(item => 
        item.id === itemId 
          ? { ...item, quantity: 1 }
          : item
      )
    );
    // Remove generated barcodes for this item
    setGeneratedBarcodes(prev => prev.filter(barcode => barcode.itemId !== itemId));
  };

  const printItemBarcodes = (itemId) => {
    const itemBarcodes = generatedBarcodes.filter(barcode => barcode.itemId === itemId);
    if (itemBarcodes.length === 0) {
      setError('Please generate barcodes for this item first');
      return;
    }
    
    // For now, print all barcodes. In a real implementation, you might want to filter
    window.print();
  };

  const generateBarcode = () => {
    const hasValidItems = barcodeItems.some(
      (item) => item.quantity >= 1 && item.quantity <= MAX_QUANTITY
    );

    if (!hasValidItems) {
      setError(`Please enter valid quantities (1-${MAX_QUANTITY})`);
      return;
    }

    setIsGenerating(true);
    setError('');

    // Generate barcode labels for all items
    const allBarcodes = [];
    barcodeItems.forEach((item) => {
      for (let i = 0; i < item.quantity; i++) {
        allBarcodes.push({
          id: allBarcodes.length + 1,
          productCode: item.code,
          productName: item.name,
          brandName: 'PrintForMee',
          price: product?.unit_price || 0,
          barcode: generateBarcodeNumber(item.code, i + 1),
        });
      }
    });

    setGeneratedBarcodes(allBarcodes);
    setIsGenerating(false);
  };

  const generateBarcodeNumber = (productCode, index) => {
    const baseCode = productCode.replace(/[^a-zA-Z0-9]/g, '').toUpperCase();
    const paddedIndex = String(index).padStart(3, '0');
    return `${baseCode}${paddedIndex}`;
  };

  const handleReset = () => {
    setBarcodeItems((items) => items.map((item) => ({ ...item, quantity: 1 })));
    setGeneratedBarcodes([]);
    setError('');
  };

  const handlePrint = () => {
    if (generatedBarcodes.length === 0) {
      setError('Please generate barcodes first');
      return;
    }
    window.print();
  };

  const renderFlatBarcodeLabel = (barcode) => (
    <Box
      key={barcode.id}
      className="flat-barcode-label"
      sx={{
        width: '100%',
        height: '120px',
        border: '1px solid #e0e0e0',
        backgroundColor: '#ffffff',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        p: 1.5,
        pageBreakInside: 'avoid',
      }}
    >
      {/* Product Name */}
      <Box sx={{ textAlign: 'center' }}>
        <Typography 
          variant="caption" 
          sx={{ 
            fontWeight: 600, 
            fontSize: '9px', 
            lineHeight: 1.2,
            color: '#333',
            display: 'block'
          }}
        >
          {barcode.productName.length > 20 ? barcode.productName.substring(0, 20) + '...' : barcode.productName}
        </Typography>
      </Box>

      {/* Price */}
      <Box sx={{ textAlign: 'center' }}>
        <Typography 
          variant="caption" 
          sx={{ 
            fontWeight: 700, 
            fontSize: '10px',
            color: '#000',
            fontFamily: 'monospace'
          }}
        >
          ₹{barcode.price.toFixed(2)}
        </Typography>
      </Box>

      {/* Barcode */}
      <Box sx={{ textAlign: 'center', flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <Box
          sx={{
            width: '120px',
            height: '35px',
            backgroundColor: '#000000',
            backgroundImage: `repeating-linear-gradient(90deg, #000 0px, #000 2px, #fff 2px, #fff 4px)`,
          }}
        />
      </Box>

      {/* Code */}
      <Box sx={{ textAlign: 'center', borderTop: '1px solid #f0f0f0', pt: 0.5 }}>
        <Typography 
          variant="caption" 
          sx={{ 
            fontSize: '8px', 
            fontFamily: 'monospace', 
            color: '#666',
            fontWeight: 500
          }}
        >
          {barcode.productCode}
        </Typography>
      </Box>
    </Box>
  );

  if (!product && barcodeItems.length === 0) {
    return (
      <Box sx={{ p: 3, textAlign: 'center' }}>
        <Typography variant="h6">No product selected</Typography>
        <Button onClick={() => navigate('/dashboard/product-list')} sx={{ mt: 2 }}>
          Back to Product List
        </Button>
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3, backgroundColor: '#f5f5f5', minHeight: '100vh' }}>
      {/* Header */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4" sx={{ fontWeight: 600, color: '#333' }}>
          Generate Barcode
        </Typography>
        <Button
          variant="outlined"
          startIcon={<RefreshIcon />}
          onClick={() => navigate('/dashboard/product-list')}
        >
          Back to Products
        </Button>
      </Box>

      <Grid container spacing={3}>
        
        {/* Barcode Table */}
        <Grid item xs={12}>
          <Card sx={{ borderRadius: 2, boxShadow: 1 }}>
            <CardContent sx={{ p: 3 }}>
              <Typography variant="h6" sx={{ fontWeight: 600, mb: 2, color: '#333' }}>
                Barcode Generation
              </Typography>

              <TableContainer component={Paper} elevation={0} sx={{ border: '1px solid #e0e0e0' }}>
                <Table>
                  <TableHead sx={{ backgroundColor: '#fafafa' }}>
                    <TableRow>
                      <TableCell sx={{ fontWeight: 600, color: '#333', borderBottom: '1px solid #e0e0e0' }}>Code</TableCell>
                      <TableCell sx={{ fontWeight: 600, color: '#333', borderBottom: '1px solid #e0e0e0' }}>Name</TableCell>
                      <TableCell sx={{ fontWeight: 600, color: '#333', borderBottom: '1px solid #e0e0e0' }}>Quantity</TableCell>
                      <TableCell sx={{ fontWeight: 600, color: '#333', borderBottom: '1px solid #e0e0e0' }}>Action</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {barcodeItems.map((item) => (
                      <TableRow key={item.id} hover sx={{ '&:hover': { backgroundColor: '#f9f9f9' } }}>
                        <TableCell sx={{ borderBottom: '1px solid #e0e0e0' }}>
                          <Typography variant="body2" sx={{ fontFamily: 'monospace', fontWeight: 500 }}>
                            {item.code}
                          </Typography>
                        </TableCell>
                        <TableCell sx={{ borderBottom: '1px solid #e0e0e0' }}>
                          <Typography variant="body2">
                            {item.name.length > 25 ? item.name.substring(0, 25) + '...' : item.name}
                          </Typography>
                        </TableCell>
                        <TableCell sx={{ borderBottom: '1px solid #e0e0e0' }}>
                          <Box>
                            <TextField
                              type="number"
                              value={item.quantity}
                              onChange={(e) => handleQuantityChange(item.id, e.target.value)}
                              size="small"
                              sx={{ width: '100px' }}
                              inputProps={{ min: 1, max: MAX_QUANTITY }}
                              error={item.quantity > MAX_QUANTITY || item.quantity < 1}
                              helperText={
                                item.quantity > MAX_QUANTITY 
                                  ? "Quantity cannot exceed 270 labels"
                                  : item.quantity < 1
                                  ? "Minimum quantity is 1"
                                  : `Maximum allowed: ${MAX_QUANTITY} labels`
                              }
                              color={item.quantity > MAX_QUANTITY ? "error" : "primary"}
                            />
                            <Box sx={{ display: 'flex', gap: 0.5, mt: 1 }}>
                              <Button
                                size="small"
                                variant="outlined"
                                onClick={() => handleQuantityChange(item.id, Math.max(1, item.quantity - 1))}
                                disabled={item.quantity <= 1}
                                sx={{ minWidth: '30px', p: 0.5 }}
                              >
                                -
                              </Button>
                              <Button
                                size="small"
                                variant="outlined"
                                onClick={() => handleQuantityChange(item.id, Math.min(MAX_QUANTITY, item.quantity + 1))}
                                disabled={item.quantity >= MAX_QUANTITY}
                                sx={{ minWidth: '30px', p: 0.5 }}
                              >
                                +
                              </Button>
                            </Box>
                          </Box>
                        </TableCell>
                        <TableCell sx={{ borderBottom: '1px solid #e0e0e0' }}>
                          <Box sx={{ display: 'flex', gap: 1, flexDirection: 'column' }}>
                            <Button
                              variant="contained"
                              size="small"
                              startIcon={<QrCodeIcon />}
                              onClick={() => generateBarcodeForItem(item.id)}
                              disabled={isGenerating || item.quantity > MAX_QUANTITY || item.quantity < 1}
                              sx={{ fontSize: '0.75rem', py: 0.5 }}
                            >
                              Generate Barcode
                            </Button>
                            <Button
                              variant="outlined"
                              size="small"
                              startIcon={<RefreshIcon />}
                              onClick={() => resetItem(item.id)}
                              sx={{ fontSize: '0.75rem', py: 0.5 }}
                            >
                              Reset
                            </Button>
                            <Button
                              variant="contained"
                              color="success"
                              size="small"
                              startIcon={<PrintIcon />}
                              onClick={() => printItemBarcodes(item.id)}
                              sx={{ fontSize: '0.75rem', py: 0.5 }}
                            >
                              Print
                            </Button>
                          </Box>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>

              {error && (
                <Alert severity={error.includes('adjusted') ? 'info' : 'error'} sx={{ mt: 2 }}>
                  {error}
                </Alert>
              )}

              {generatedBarcodes.length > 0 && (
                <Box sx={{ mt: 3 }}>
                  <Typography variant="body2" sx={{ color: '#666', textAlign: 'center' }}>
                    {generatedBarcodes.length} barcode(s) generated successfully
                  </Typography>
                </Box>
              )}
            </CardContent>
          </Card>
        </Grid>

        {/* Generated Barcodes - Professional All-in-One Design */}
        {generatedBarcodes.length > 0 && (
          <Grid item xs={12}>
            <Box sx={{ 
              border: '2px solid #e0e0e0', 
              borderRadius: 2, 
              backgroundColor: '#ffffff',
              p: 3
            }}>
              <Typography variant="h6" sx={{ fontWeight: 600, mb: 2, color: '#333', textAlign: 'center' }}>
                Generated Barcode Labels
              </Typography>
              
              {/* Unified Barcode Grid Container */}
              <Box sx={{ 
                border: '1px solid #f0f0f0', 
                backgroundColor: '#fafafa',
                p: 2,
                mb: 3
              }}>
                <Box
                  sx={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(4, 1fr)',
                    gap: 1,
                    '@media print': {
                      gridTemplateColumns: 'repeat(4, 1fr)',
                      gap: 0.5,
                    },
                    '@media (max-width: 1400px)': {
                      gridTemplateColumns: 'repeat(3, 1fr)',
                    },
                    '@media (max-width: 1000px)': {
                      gridTemplateColumns: 'repeat(2, 1fr)',
                    },
                    '@media (max-width: 600px)': {
                      gridTemplateColumns: 'repeat(1, 1fr)',
                    },
                  }}
                >
                  {generatedBarcodes.map((barcode) => renderFlatBarcodeLabel(barcode))}
                </Box>
              </Box>
              
              {/* Summary Information - Outside Grid */}
              <Box sx={{ 
                display: 'flex', 
                justifyContent: 'space-between', 
                alignItems: 'center',
                borderTop: '1px solid #e0e0e0',
                pt: 2,
                px: 1
              }}>
                <Typography variant="body2" sx={{ color: '#666' }}>
                  Total barcodes generated: <strong>{generatedBarcodes.length}</strong>
                </Typography>
                <Typography variant="body2" sx={{ color: '#666' }}>
                  Maximum quantity allowed: <strong>270</strong>
                </Typography>
              </Box>
            </Box>
          </Grid>
        )}
      </Grid>

      {/* Print Styles - Print-First Design Optimization */}
      <style>{`
        @media print {
          body * {
            visibility: hidden;
          }
          
          .generated-barcodes, .generated-barcodes * {
            visibility: visible;
          }
          
          .generated-barcodes {
            position: absolute;
            left: 0;
            top: 0;
            width: 100%;
            padding: 15px;
            background: white;
          }
          
          .flat-barcode-label {
            break-inside: avoid;
            page-break-inside: avoid;
            border: 1px solid #000 !important;
            margin-bottom: 5px;
          }
          
          /* Ensure high contrast for printing */
          .flat-barcode-label * {
            color: black !important;
          }
          
          /* Remove backgrounds for printing */
          .flat-barcode-label, .generated-barcodes {
            background: none !important;
          }
          
          /* Optimize barcode for printing */
          .flat-barcode-label .barcode-bar {
            background: black !important;
          }
        }
      `}</style>
    </Box>
  );
}

export default GenerateBarcode;
