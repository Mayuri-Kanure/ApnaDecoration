import React, { useState } from 'react';
import {
  Box,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  FormControlLabel,
  Checkbox,
  Slider,
  FormGroup,
  Typography,
  Divider,
  Chip,
  Stack,
  Rating,
  TextField,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
} from '@mui/material';
import {
  Filter as FilterIcon,
  Close as CloseIcon,
  RestartAlt as ResetIcon,
} from '@mui/icons-material';

/**
 * Advanced Product Filters Component
 * Provides filtering by price, rating, stock, discounts, and more
 */
export const AdvancedFilters = ({
  filters,
  onFiltersChange,
  priceRange = [0, 50000],
  onPriceChange,
  categories = [],
  onCategoryChange,
}) => {
  const [open, setOpen] = useState(false);
  const [tempFilters, setTempFilters] = useState(filters);

  const handleOpen = () => {
    setTempFilters(filters);
    setOpen(true);
  };

  const handleClose = () => setOpen(false);

  const handleApply = () => {
    onFiltersChange(tempFilters);
    handleClose();
  };

  const handleReset = () => {
    setTempFilters({
      minRating: 0,
      inStock: false,
      onSale: false,
      newArrivals: false,
      hasDiscount: false,
      condition: 'all',
      selectedCategories: [],
    });
  };

  const handleFilterChange = (key, value) => {
    setTempFilters((prev) => ({
      ...prev,
      [key]: value,
    }));
  };

  const handleCategoryToggle = (categoryId) => {
    setTempFilters((prev) => ({
      ...prev,
      selectedCategories: prev.selectedCategories.includes(categoryId)
        ? prev.selectedCategories.filter((id) => id !== categoryId)
        : [...prev.selectedCategories, categoryId],
    }));
  };

  const activeFilterCount = Object.values(tempFilters).filter(
    (v) => v !== false && v !== 'all' && v !== 0 && v?.length > 0
  ).length;

  return (
    <>
      {/* Filter Button */}
      <Button
        variant="outlined"
        startIcon={<FilterIcon />}
        onClick={handleOpen}
        sx={{
          borderColor: '#9333ea',
          color: '#9333ea',
          '&:hover': { borderColor: '#7e22ce', backgroundColor: '#f3e8ff' },
          position: 'relative',
        }}
      >
        Filters
        {activeFilterCount > 0 && (
          <Chip
            label={activeFilterCount}
            size="small"
            sx={{
              ml: 1,
              backgroundColor: '#ef4444',
              color: 'white',
              height: '20px',
              fontSize: '0.75rem',
            }}
          />
        )}
      </Button>

      {/* Advanced Filters Dialog */}
      <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
        <DialogTitle
          sx={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            backgroundColor: '#f3e8ff',
          }}
        >
          Advanced Filters
          <Button onClick={handleClose} variant="text" size="small">
            <CloseIcon />
          </Button>
        </DialogTitle>

        <DialogContent sx={{ pt: 3 }}>
          <Stack spacing={3}>
            {/* Rating Filter */}
            <Box>
              <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 2 }}>
                Minimum Rating
              </Typography>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <Rating
                  value={tempFilters.minRating}
                  onChange={(e, val) => handleFilterChange('minRating', val)}
                />
                <Typography variant="body2" color="textSecondary">
                  {tempFilters.minRating}+ stars
                </Typography>
              </Box>
            </Box>

            <Divider />

            {/* Stock Filter */}
            <FormGroup>
              <FormControlLabel
                control={
                  <Checkbox
                    checked={tempFilters.inStock}
                    onChange={(e) =>
                      handleFilterChange('inStock', e.target.checked)
                    }
                  />
                }
                label={
                  <Box>
                    <Typography variant="body2" sx={{ fontWeight: 500 }}>
                      In Stock Only
                    </Typography>
                    <Typography variant="caption" color="textSecondary">
                      Show only available products
                    </Typography>
                  </Box>
                }
              />
            </FormGroup>

            <Divider />

            {/* Sale & Discount Filters */}
            <FormGroup>
              <FormControlLabel
                control={
                  <Checkbox
                    checked={tempFilters.onSale}
                    onChange={(e) =>
                      handleFilterChange('onSale', e.target.checked)
                    }
                  />
                }
                label={
                  <Box>
                    <Typography variant="body2" sx={{ fontWeight: 500 }}>
                      On Sale
                    </Typography>
                    <Typography variant="caption" color="textSecondary">
                      Special promotions only
                    </Typography>
                  </Box>
                }
              />
              <FormControlLabel
                control={
                  <Checkbox
                    checked={tempFilters.hasDiscount}
                    onChange={(e) =>
                      handleFilterChange('hasDiscount', e.target.checked)
                    }
                  />
                }
                label={
                  <Box>
                    <Typography variant="body2" sx={{ fontWeight: 500 }}>
                      Has Discount
                    </Typography>
                    <Typography variant="caption" color="textSecondary">
                      Products with price reduction
                    </Typography>
                  </Box>
                }
              />
            </FormGroup>

            <Divider />

            {/* New Arrivals */}
            <FormGroup>
              <FormControlLabel
                control={
                  <Checkbox
                    checked={tempFilters.newArrivals}
                    onChange={(e) =>
                      handleFilterChange('newArrivals', e.target.checked)
                    }
                  />
                }
                label={
                  <Box>
                    <Typography variant="body2" sx={{ fontWeight: 500 }}>
                      New Arrivals
                    </Typography>
                    <Typography variant="caption" color="textSecondary">
                      Latest added products
                    </Typography>
                  </Box>
                }
              />
            </FormGroup>

            <Divider />

            {/* Product Condition */}
            <FormControl fullWidth>
              <InputLabel>Product Condition</InputLabel>
              <Select
                value={tempFilters.condition}
                label="Product Condition"
                onChange={(e) =>
                  handleFilterChange('condition', e.target.value)
                }
              >
                <MenuItem value="all">All Conditions</MenuItem>
                <MenuItem value="new">New</MenuItem>
                <MenuItem value="like-new">Like New</MenuItem>
                <MenuItem value="good">Good</MenuItem>
              </Select>
            </FormControl>

            <Divider />

            {/* Categories Multi-Select */}
            {categories.length > 0 && (
              <Box>
                <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 2 }}>
                  Categories
                </Typography>
                <FormGroup>
                  {categories.map((cat) => (
                    <FormControlLabel
                      key={cat._id}
                      control={
                        <Checkbox
                          checked={tempFilters.selectedCategories.includes(
                            cat._id
                          )}
                          onChange={() => handleCategoryToggle(cat._id)}
                        />
                      }
                      label={cat.name}
                    />
                  ))}
                </FormGroup>
              </Box>
            )}
          </Stack>
        </DialogContent>

        <DialogActions sx={{ p: 2, backgroundColor: '#f9fafb' }}>
          <Button
            onClick={handleReset}
            startIcon={<ResetIcon />}
            variant="text"
          >
            Reset
          </Button>
          <Button onClick={handleClose} variant="text">
            Cancel
          </Button>
          <Button
            onClick={handleApply}
            variant="contained"
            sx={{ backgroundColor: '#9333ea' }}
          >
            Apply Filters
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default AdvancedFilters;
