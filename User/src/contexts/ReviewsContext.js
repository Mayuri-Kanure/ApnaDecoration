import React, { createContext, useCallback, useContext, useMemo, useState } from 'react';
import { API_BASE_URL } from '../config/constants';

const ReviewsContext = createContext();

const mapReview = (review) => ({
  id: review.id || review._id,
  reviewId: review.reviewId,
  productId: String(review.productId),
  customerId: String(review.customerId),
  customerName: review.customerName || 'Anonymous',
  customerEmail: review.customerEmail || '',
  rating: Number(review.rating || 0),
  title: review.title || '',
  review: review.review || '',
  helpful: Number(review.helpful || 0),
  verified: Boolean(review.verified),
  status: review.status || 'active',
  date: review.date || review.createdAt || new Date().toISOString(),
  createdAt: review.createdAt,
  updatedAt: review.updatedAt
});

const getAuthHeaders = () => {
  const token = localStorage.getItem('token');
  return {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {})
  };
};

export const useReviews = () => {
  const context = useContext(ReviewsContext);
  if (!context) {
    throw new Error('useReviews must be used within a ReviewsProvider');
  }
  return context;
};

export const ReviewsProvider = ({ children }) => {
  const [reviews, setReviews] = useState([]);

  const getProductReviews = useCallback(async (productId) => {
    const response = await fetch(`${API_BASE_URL}/reviews/product/${productId}`);
    const payload = await response.json();

    if (!response.ok || !payload.success) {
      throw new Error(payload.error || 'Failed to fetch reviews');
    }

    const list = Array.isArray(payload.data) ? payload.data.map(mapReview) : [];
    setReviews(list);
    return list;
  }, []);

  const getProductRating = useCallback(async (productId) => {
    const productReviews = await getProductReviews(productId);
    if (productReviews.length === 0) {
      return { average: 0, count: 0, distribution: [0, 0, 0, 0, 0] };
    }

    const total = productReviews.reduce((sum, review) => sum + review.rating, 0);
    const distribution = [0, 0, 0, 0, 0];

    productReviews.forEach((review) => {
      const idx = Math.max(0, Math.min(4, review.rating - 1));
      distribution[idx] += 1;
    });

    return {
      average: Math.round((total / productReviews.length) * 10) / 10,
      count: productReviews.length,
      distribution
    };
  }, [getProductReviews]);

  const addReview = useCallback(async (productId, reviewData) => {
    const response = await fetch(`${API_BASE_URL}/reviews`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify({
        productId,
        rating: reviewData.rating,
        title: reviewData.title || '',
        review: reviewData.comment || ''
      })
    });

    const payload = await response.json();

    if (!response.ok || !payload.success) {
      throw new Error(payload.error || 'Failed to save review');
    }

    const saved = mapReview(payload.data);
    setReviews((prev) => [saved, ...prev]);
    return saved;
  }, []);

  const updateReview = useCallback(async (reviewId, updateData) => {
    const response = await fetch(`${API_BASE_URL}/reviews/${reviewId}`, {
      method: 'PUT',
      headers: getAuthHeaders(),
      body: JSON.stringify({
        rating: updateData.rating,
        title: updateData.title,
        review: updateData.comment
      })
    });

    const payload = await response.json();

    if (!response.ok || !payload.success) {
      throw new Error(payload.error || 'Failed to update review');
    }

    const updated = mapReview(payload.data);
    setReviews((prev) => prev.map((item) => (item.id === updated.id ? updated : item)));
    return updated;
  }, []);

  const deleteReview = useCallback(async (reviewId) => {
    const response = await fetch(`${API_BASE_URL}/reviews/${reviewId}`, {
      method: 'DELETE',
      headers: getAuthHeaders()
    });

    const payload = await response.json();

    if (!response.ok || !payload.success) {
      throw new Error(payload.error || 'Failed to delete review');
    }

    setReviews((prev) => prev.filter((item) => item.id !== reviewId));
    return true;
  }, []);

  const markHelpful = useCallback(async (reviewId) => {
    const response = await fetch(`${API_BASE_URL}/reviews/${reviewId}/helpful`, {
      method: 'PATCH',
      headers: getAuthHeaders()
    });

    const payload = await response.json();

    if (!response.ok || !payload.success) {
      throw new Error(payload.error || 'Failed to mark helpful');
    }

    const updated = mapReview(payload.data);
    setReviews((prev) => prev.map((item) => (item.id === updated.id ? updated : item)));
    return updated;
  }, []);

  const getUserReviews = useCallback((userId) => {
    return reviews.filter((review) => String(review.customerId) === String(userId));
  }, [reviews]);

  const value = useMemo(() => ({
    reviews,
    getProductReviews,
    getProductRating,
    addReview,
    updateReview,
    deleteReview,
    markHelpful,
    getUserReviews
  }), [
    reviews,
    getProductReviews,
    getProductRating,
    addReview,
    updateReview,
    deleteReview,
    markHelpful,
    getUserReviews
  ]);

  return <ReviewsContext.Provider value={value}>{children}</ReviewsContext.Provider>;
};

export default ReviewsContext;
