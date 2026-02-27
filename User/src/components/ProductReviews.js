import React, { useEffect, useMemo, useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useReviews } from '../contexts/ReviewsContext';
import { Star, ThumbsUp, Trash2, Filter, MessageSquare, CheckCircle } from 'lucide-react';

const ProductReviews = ({ productId }) => {
  const { user, isAuthenticated } = useAuth();
  const { getProductReviews, getProductRating, addReview, markHelpful, deleteReview } = useReviews();

  const [showReviewForm, setShowReviewForm] = useState(false);
  const [reviewForm, setReviewForm] = useState({ rating: 5, title: '', comment: '' });
  const [hoveredRating, setHoveredRating] = useState(0);
  const [productReviews, setProductReviews] = useState([]);
  const [loading, setLoading] = useState(false);
  const [ratingData, setRatingData] = useState({ average: 0, count: 0, distribution: [0, 0, 0, 0, 0] });
  const [sortBy, setSortBy] = useState('most-recent');
  const [filterRating, setFilterRating] = useState('all');
  const [error, setError] = useState('');

  const loadReviews = async () => {
    setLoading(true);
    setError('');
    try {
      const [reviews, rating] = await Promise.all([
        getProductReviews(productId),
        getProductRating(productId)
      ]);
      setProductReviews(reviews);
      setRatingData(rating);
    } catch (err) {
      setError(err.message || 'Failed to load reviews');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!productId) return;
    loadReviews();
  }, [productId]);

  const handleSubmitReview = async (e) => {
    e.preventDefault();
    if (!isAuthenticated) {
      setError('Please login to submit a review.');
      return;
    }

    if (!reviewForm.comment.trim()) {
      setError('Review text is required.');
      return;
    }

    setLoading(true);
    setError('');
    try {
      await addReview(productId, reviewForm);
      setReviewForm({ rating: 5, title: '', comment: '' });
      setShowReviewForm(false);
      await loadReviews();
    } catch (err) {
      setError(err.message || 'Failed to submit review');
    } finally {
      setLoading(false);
    }
  };

  const handleHelpful = async (reviewId) => {
    try {
      await markHelpful(reviewId);
      await loadReviews();
    } catch (err) {
      setError(err.message || 'Failed to mark helpful');
    }
  };

  const handleDelete = async (reviewId) => {
    try {
      await deleteReview(reviewId);
      await loadReviews();
    } catch (err) {
      setError(err.message || 'Failed to delete review');
    }
  };

  const filteredAndSortedReviews = useMemo(() => {
    const filtered = productReviews.filter((review) => {
      if (filterRating === 'all') return true;
      return review.rating === Number(filterRating);
    });

    return filtered.sort((a, b) => {
      if (sortBy === 'most-helpful') return (b.helpful || 0) - (a.helpful || 0);
      if (sortBy === 'highest-rating') return b.rating - a.rating;
      if (sortBy === 'lowest-rating') return a.rating - b.rating;
      return new Date(b.date) - new Date(a.date);
    });
  }, [productReviews, filterRating, sortBy]);

  const StarRating = ({ rating, interactive = false, onRatingChange, size = 16 }) => (
    <div className="flex items-center gap-1">
      {[1, 2, 3, 4, 5].map((star) => (
        <Star
          key={star}
          size={size}
          className={`cursor-pointer transition-colors ${
            star <= (interactive ? hoveredRating || rating : rating) ? 'text-yellow-400 fill-current' : 'text-gray-300'
          }`}
          onClick={() => interactive && onRatingChange && onRatingChange(star)}
          onMouseEnter={() => interactive && setHoveredRating(star)}
          onMouseLeave={() => interactive && setHoveredRating(0)}
        />
      ))}
    </div>
  );

  const formatDate = (value) => new Date(value).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  });

  if (loading && productReviews.length === 0) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 border-t-transparent border-t-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <div className="flex items-center">
              <Star className="w-5 h-5 text-yellow-400" />
              <span className="font-semibold text-lg text-gray-900">{(ratingData.average || 0).toFixed(1)}</span>
              <span className="text-gray-700 text-sm">({ratingData.count} reviews)</span>
            </div>
            <div className="text-sm text-gray-700">
              {ratingData.count > 0 && <CheckCircle className="w-4 h-4 text-green-500 inline mr-1" />}
              Verified Purchase
            </div>
          </div>
        </div>

        <button
          onClick={() => setShowReviewForm((prev) => !prev)}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-blue-700 transition-colors flex items-center gap-2"
        >
          <MessageSquare className="w-4 h-4" />
          Write a Review
        </button>
      </div>

      {error && <div className="mb-4 rounded-md bg-red-50 text-red-700 px-3 py-2 text-sm">{error}</div>}

      {productReviews.length > 0 && (
        <div className="flex items-center gap-4 mb-6 p-4 bg-gray-50 rounded-lg">
          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4 text-gray-500" />
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="most-recent">Most Recent</option>
              <option value="most-helpful">Most Helpful</option>
              <option value="highest-rating">Highest Rating</option>
              <option value="lowest-rating">Lowest Rating</option>
            </select>
          </div>

          <div className="flex items-center gap-2">
            <Star className="w-4 h-4 text-gray-500" />
            <select
              value={filterRating}
              onChange={(e) => setFilterRating(e.target.value)}
              className="border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">All Ratings</option>
              <option value="5">5 Stars</option>
              <option value="4">4 Stars</option>
              <option value="3">3 Stars</option>
              <option value="2">2 Stars</option>
              <option value="1">1 Star</option>
            </select>
          </div>
        </div>
      )}

      {showReviewForm && (
        <div className="mb-8 p-6 bg-blue-50 rounded-lg border border-blue-200">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">Write Your Review</h3>
            <button onClick={() => setShowReviewForm(false)} className="text-gray-400 hover:text-gray-600">x</button>
          </div>

          <form onSubmit={handleSubmitReview} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Overall Rating</label>
              <StarRating
                rating={reviewForm.rating}
                interactive={true}
                onRatingChange={(rating) => setReviewForm((prev) => ({ ...prev, rating }))}
                size={20}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Review Title</label>
              <input
                type="text"
                value={reviewForm.title}
                onChange={(e) => setReviewForm((prev) => ({ ...prev, title: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Summarize your experience"
                maxLength={100}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Review</label>
              <textarea
                value={reviewForm.comment}
                onChange={(e) => setReviewForm((prev) => ({ ...prev, comment: e.target.value }))}
                rows={4}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Tell us about your experience with this product..."
                maxLength={500}
              />
            </div>

            <div className="flex items-center gap-4">
              <button type="submit" className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-md font-medium hover:bg-blue-700 transition-colors">
                Submit Review
              </button>
              <button
                type="button"
                onClick={() => {
                  setShowReviewForm(false);
                  setReviewForm({ rating: 5, title: '', comment: '' });
                }}
                className="flex-1 bg-gray-300 text-gray-700 py-2 px-4 rounded-md font-medium hover:bg-gray-400 transition-colors"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {filteredAndSortedReviews.length === 0 ? (
        <div className="text-center py-12">
          <MessageSquare className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-gray-900 mb-2">No Reviews Yet</h3>
          <p className="text-gray-600 mb-6">Be the first to review this product!</p>
          <button
            onClick={() => setShowReviewForm(true)}
            className="bg-blue-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-blue-700 transition-colors"
          >
            Write Your Review
          </button>
        </div>
      ) : (
        <div className="space-y-6">
          {filteredAndSortedReviews.map((review) => (
            <div key={review.id} className="border-b border-gray-200 pb-6 last:border-b-0">
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center">
                  <span className="text-lg font-bold text-gray-700">{review.customerName?.charAt(0)?.toUpperCase() || 'U'}</span>
                </div>

                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <StarRating rating={review.rating} size={14} />
                    <span className="font-medium text-gray-900">{review.rating.toFixed(1)}</span>
                    <span className="text-sm text-gray-500">{formatDate(review.date)}</span>
                  </div>

                  <h4 className="font-semibold text-gray-900 mb-2">{review.title || 'Review'}</h4>
                  <p className="text-gray-700 leading-relaxed">{review.review}</p>

                  <div className="flex items-center gap-4 mt-4">
                    <button
                      onClick={() => handleHelpful(review.id)}
                      className="flex items-center gap-1 text-sm text-gray-500 hover:text-blue-600"
                    >
                      <ThumbsUp className="w-4 h-4" />
                      Helpful ({review.helpful || 0})
                    </button>

                    {(String(review.customerId) === String(user?.id) || user?.role === 'admin') && (
                      <button
                        onClick={() => handleDelete(review.id)}
                        className="flex items-center gap-1 text-sm text-red-500 hover:text-red-600"
                      >
                        <Trash2 className="w-4 h-4" />
                        Delete
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default ProductReviews;
