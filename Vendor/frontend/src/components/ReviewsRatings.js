import React, { useState, useEffect } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Grid,
  Avatar,
  Rating,
  Chip,
  Divider,
  Button,
  Tab,
  Tabs,
  List,
  ListItem,
  ListItemText,
  ListItemAvatar,
  LinearProgress,
} from '@mui/material';
import {
  Star as StarIcon,
  TrendingUp as TrendingUpIcon,
  People as PeopleIcon,
  ThumbUp as ThumbsUpIcon,
  ThumbDown as ThumbsDownIcon,
  Comment as CommentIcon,
} from '@mui/icons-material';

const ReviewsRatings = () => {
  const [tabValue, setTabValue] = useState(0);
  const [reviews, setReviews] = useState([]);
  const [ratings, setRatings] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Mock data for reviews and ratings
    const mockReviews = [
      {
        id: 1,
        productName: 'Premium Wall Clock',
        customerName: 'Rahul Sharma',
        rating: 5,
        comment: 'Excellent quality! The clock looks exactly like the pictures and works perfectly. Very satisfied with the purchase.',
        date: '2024-01-15',
        helpful: 12,
        verified: true,
        images: ['clock1.jpg', 'clock2.jpg']
      },
      {
        id: 2,
        productName: 'Modern Table Lamp',
        customerName: 'Priya Patel',
        rating: 4,
        comment: 'Good product, nice design and bright light. The only reason I\'m giving 4 stars is that the cord could be longer.',
        date: '2024-01-12',
        helpful: 8,
        verified: true,
        images: ['lamp1.jpg']
      },
      {
        id: 3,
        productName: 'Decorative Vase Set',
        customerName: 'Amit Kumar',
        rating: 5,
        comment: 'Beautiful vases! Perfect for my living room. The quality is amazing and the packaging was very secure.',
        date: '2024-01-10',
        helpful: 15,
        verified: false,
        images: []
      },
      {
        id: 4,
        productName: 'Canvas Wall Art',
        customerName: 'Sneha Reddy',
        rating: 3,
        comment: 'Colors are not as vibrant as shown in pictures. Still decent for the price though.',
        date: '2024-01-08',
        helpful: 3,
        verified: false,
        images: ['art1.jpg']
      },
      {
        id: 5,
        productName: 'Throw Pillows Set',
        customerName: 'Vikram Singh',
        rating: 4,
        comment: 'Comfortable and good quality. The pillows are soft and the covers are washable.',
        date: '2024-01-05',
        helpful: 7,
        verified: true,
        images: ['pillow1.jpg', 'pillow2.jpg']
      }
    ];

    const mockRatings = {
      averageRating: 4.2,
      totalReviews: 127,
      ratingDistribution: {
        5: 45,
        4: 38,
        3: 25,
        2: 12,
        1: 7
      },
      productRatings: [
        { productName: 'Premium Wall Clock', rating: 4.8, reviews: 23 },
        { productName: 'Modern Table Lamp', rating: 4.2, reviews: 18 },
        { productName: 'Decorative Vase Set', rating: 4.5, reviews: 15 },
        { productName: 'Canvas Wall Art', rating: 3.9, reviews: 12 },
        { productName: 'Throw Pillows Set', rating: 4.6, reviews: 19 },
      ]
    };

    setReviews(mockReviews);
    setRatings(mockRatings);
    setLoading(false);
  }, []);

  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric' 
    });
  };

  const getRatingColor = (rating) => {
    if (rating >= 4.5) return '#10B981';
    if (rating >= 3.5) return '#F59E0B';
    if (rating >= 2.5) return '#F59E0B';
    return '#64748B';
  };

  const renderStars = (rating) => {
    return (
      <Rating
        value={rating}
        precision={0.1}
        readOnly
        size="small"
        sx={{
          color: getRatingColor(rating),
        }}
      />
    );
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh' }}>
        <Typography>Loading reviews and ratings...</Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3, backgroundColor: '#f8fafc' }}>
      <Typography variant="h4" sx={{ fontWeight: 600, mb: 3, color: '#1e293b' }}>
        Reviews & Ratings
      </Typography>

      <Tabs value={tabValue} onChange={handleTabChange} sx={{ mb: 3 }}>
        <Tab label="Customer Reviews" />
        <Tab label="Product Ratings" />
        <Tab label="Analytics" />
      </Tabs>

      {tabValue === 0 && (
        <Grid container spacing={3}>
          {/* Reviews Summary Card */}
          <Grid item xs={12} md={4}>
            <Card sx={{ p: 3, borderRadius: 2, boxShadow: 2 }}>
              <CardContent>
                <Box sx={{ textAlign: 'center', mb: 2 }}>
                  <StarIcon sx={{ fontSize: 40, color: '#F59E0B', mb: 1 }} />
                  <Typography variant="h3" sx={{ fontWeight: 700, color: '#1e293b' }}>
                    {ratings.averageRating.toFixed(1)}
                  </Typography>
                  <Typography variant="body2" color="#64748b">
                    Average Rating
                  </Typography>
                </Box>
                <Divider sx={{ my: 2 }} />
                <Box sx={{ textAlign: 'center' }}>
                  <PeopleIcon sx={{ fontSize: 32, color: '#2F66FF', mb: 1 }} />
                  <Typography variant="h5" sx={{ fontWeight: 600, color: '#1e293b' }}>
                    {ratings.totalReviews}
                  </Typography>
                  <Typography variant="body2" color="#64748b">
                    Total Reviews
                  </Typography>
                </Box>
              </CardContent>
            </Card>
          </Grid>

          {/* Recent Reviews */}
          <Grid item xs={12} md={8}>
            <Card sx={{ borderRadius: 2, boxShadow: 2 }}>
              <CardContent sx={{ p: 3 }}>
                <Typography variant="h6" sx={{ fontWeight: 600, mb: 2, color: '#1e293b' }}>
                  Recent Customer Reviews
                </Typography>
                <List sx={{ p: 0 }}>
                  {reviews.slice(0, 5).map((review) => (
                    <ListItem
                      key={review.id}
                      alignItems="flex-start"
                      sx={{
                        p: 2,
                        mb: 1,
                        borderRadius: 2,
                        border: '1px solid #e2e8f0',
                        '&:hover': {
                          backgroundColor: '#f8fafc'
                        }
                      }}
                    >
                      <ListItemAvatar>
                        <Avatar sx={{ bgcolor: '#2F66FF' }}>
                          {review.customerName.charAt(0).toUpperCase()}
                        </Avatar>
                      </ListItemAvatar>
                      <ListItemText
                        primary={
                          <Box>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                              <Typography variant="body1" sx={{ fontWeight: 600 }}>
                                {review.customerName}
                              </Typography>
                              {review.verified && (
                                <Chip
                                  label="Verified"
                                  size="small"
                                  color="primary"
                                  sx={{ fontSize: 10, height: 18 }}
                                />
                              )}
                            </Box>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                              {renderStars(review.rating)}
                              <Typography variant="caption" color="#64748b">
                                {formatDate(review.date)}
                              </Typography>
                            </Box>
                          </Box>
                        }
                        secondary={
                          <Box>
                            <Typography variant="body2" color="#64748b" sx={{ mb: 1 }}>
                              {review.productName}
                            </Typography>
                            <Typography variant="body2" color="#1e293b" sx={{ fontStyle: 'italic' }}>
                              "{review.comment}"
                            </Typography>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mt: 1 }}>
                              <Button
                                size="small"
                                startIcon={<ThumbsUpIcon />}
                                sx={{ fontSize: 12 }}
                              >
                                Helpful ({review.helpful})
                              </Button>
                            </Box>
                          </Box>
                        }
                      />
                    </ListItem>
                  ))}
                </List>
                {reviews.length > 5 && (
                  <Box sx={{ textAlign: 'center', mt: 2 }}>
                    <Button variant="outlined">
                      View All Reviews
                    </Button>
                  </Box>
                )}
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      )}

      {tabValue === 1 && (
        <Grid container spacing={3}>
          {/* Rating Distribution */}
          <Grid item xs={12} md={6}>
            <Card sx={{ p: 3, borderRadius: 2, boxShadow: 2 }}>
              <CardContent>
                <Typography variant="h6" sx={{ fontWeight: 600, mb: 3, color: '#1e293b' }}>
                  Rating Distribution
                </Typography>
                <Box sx={{ mt: 2 }}>
                  {Object.entries(ratings.ratingDistribution).map(([stars, count]) => (
                    <Box key={stars} sx={{ mb: 2 }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 1 }}>
                        <Typography variant="body2" sx={{ minWidth: 20 }}>
                          {stars} stars
                        </Typography>
                        <Box sx={{ flex: 1 }}>
                          <LinearProgress
                            variant="determinate"
                            value={(count / ratings.totalReviews) * 100}
                            sx={{
                              height: 8,
                              borderRadius: 4,
                              backgroundColor: '#e2e8f0',
                            }}
                          />
                        </Box>
                        <Typography variant="body2" sx={{ minWidth: 30, textAlign: 'right' }}>
                          {count} reviews
                        </Typography>
                      </Box>
                    </Box>
                  ))}
                </Box>
              </CardContent>
            </Card>
          </Grid>

          {/* Product Performance */}
          <Grid item xs={12} md={6}>
            <Card sx={{ p: 3, borderRadius: 2, boxShadow: 2 }}>
              <CardContent>
                <Typography variant="h6" sx={{ fontWeight: 600, mb: 3, color: '#1e293b' }}>
                  Product Performance
                </Typography>
                <List sx={{ p: 0 }}>
                  {ratings.productRatings.map((product, index) => (
                    <ListItem
                      key={index}
                      sx={{
                        p: 2,
                        mb: 1,
                        borderRadius: 2,
                        border: '1px solid #e2e8f0',
                      }}
                    >
                      <ListItemText
                        primary={
                          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <Typography variant="body2" sx={{ fontWeight: 500 }}>
                              {product.productName}
                            </Typography>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                              {renderStars(product.rating)}
                              <Typography variant="caption" color="#64748b">
                                ({product.reviews} reviews)
                              </Typography>
                            </Box>
                          </Box>
                        }
                        secondary={
                          <Typography variant="body2" color="#64748b">
                            Performance: {product.rating >= 4.0 ? 'Excellent' : product.rating >= 3.5 ? 'Good' : 'Needs Improvement'}
                          </Typography>
                        }
                      />
                    </ListItem>
                  ))}
                </List>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      )}

      {tabValue === 2 && (
        <Grid container spacing={3}>
          {/* Reviews Analytics */}
          <Grid item xs={12} md={4}>
            <Card sx={{ p: 3, borderRadius: 2, boxShadow: 2 }}>
              <CardContent>
                <Box sx={{ textAlign: 'center', mb: 2 }}>
                  <TrendingUpIcon sx={{ fontSize: 40, color: '#10B981', mb: 1 }} />
                  <Typography variant="h4" sx={{ fontWeight: 700, color: '#1e293b' }}>
                    +23%
                  </Typography>
                  <Typography variant="body2" color="#64748b">
                    Review Growth
                  </Typography>
                </Box>
                <Divider sx={{ my: 2 }} />
                <Box sx={{ textAlign: 'center' }}>
                  <CommentIcon sx={{ fontSize: 40, color: '#2F66FF', mb: 1 }} />
                  <Typography variant="h4" sx={{ fontWeight: 700, color: '#1e293b' }}>
                    89%
                  </Typography>
                  <Typography variant="body2" color="#64748b">
                    Positive Reviews
                  </Typography>
                </Box>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} md={4}>
            <Card sx={{ p: 3, borderRadius: 2, boxShadow: 2 }}>
              <CardContent>
                <Box sx={{ textAlign: 'center', mb: 2 }}>
                  <StarIcon sx={{ fontSize: 40, color: '#F59E0B', mb: 1 }} />
                  <Typography variant="h4" sx={{ fontWeight: 700, color: '#1e293b' }}>
                    4.2
                  </Typography>
                  <Typography variant="body2" color="#64748b">
                    Average Rating
                  </Typography>
                </Box>
                <Divider sx={{ my: 2 }} />
                <Box sx={{ textAlign: 'center' }}>
                  <PeopleIcon sx={{ fontSize: 40, color: '#8B5CF6', mb: 1 }} />
                  <Typography variant="h4" sx={{ fontWeight: 700, color: '#1e293b' }}>
                    1,247
                  </Typography>
                  <Typography variant="body2" color="#64748b">
                    Total Customers
                  </Typography>
                </Box>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} md={4}>
            <Card sx={{ p: 3, borderRadius: 2, boxShadow: 2 }}>
              <CardContent>
                <Box sx={{ textAlign: 'center', mb: 2 }}>
                  <ThumbsUpIcon sx={{ fontSize: 40, color: '#28C76F', mb: 1 }} />
                  <Typography variant="h4" sx={{ fontWeight: 700, color: '#1e293b' }}>
                    78%
                  </Typography>
                  <Typography variant="body2" color="#64748b">
                    Customer Satisfaction
                  </Typography>
                </Box>
                <Divider sx={{ my: 2 }} />
                <Box sx={{ textAlign: 'center' }}>
                  <Typography variant="h6" sx={{ fontWeight: 600, color: '#64748b' }}>
                    Response Rate
                  </Typography>
                  <Typography variant="body2" color="#64748b">
                    94% of reviews responded within 24 hours
                  </Typography>
                </Box>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      )}
    </Box>
  );
};

export default ReviewsRatings;
