const mongoose = require('mongoose');
const { CustomerReview, Product } = require('../models');

const isValidObjectId = (value) => mongoose.Types.ObjectId.isValid(value);

const mapReview = (review) => ({
  id: String(review._id),
  reviewId: review.reviewId,
  productId: String(review.productId),
  productName: review.productName,
  productImage: review.productImage,
  customerId: String(review.customerId),
  customerName: review.customerName,
  customerEmail: review.customerEmail,
  rating: review.rating,
  title: review.title || '',
  review: review.review,
  helpful: review.helpful || 0,
  verified: !!review.verified,
  status: review.status,
  date: review.date || review.createdAt,
  createdAt: review.createdAt,
  updatedAt: review.updatedAt
});

const refreshProductStats = async (productId) => {
  if (!isValidObjectId(productId)) return;

  const productObjectId = new mongoose.Types.ObjectId(productId);
  const [stats] = await CustomerReview.aggregate([
    { $match: { productId: productObjectId, status: 'active' } },
    {
      $group: {
        _id: '$productId',
        avgRating: { $avg: '$rating' },
        reviewCount: { $sum: 1 }
      }
    }
  ]);

  await Product.findByIdAndUpdate(productId, {
    averageRating: stats ? Math.round((stats.avgRating || 0) * 10) / 10 : 0,
    reviewCount: stats ? stats.reviewCount : 0
  });
};

const getAuthUser = (req) => {
  if (!req.user) return null;
  if (req.user._id) return req.user;
  if (req.user.id && isValidObjectId(req.user.id)) {
    return { ...req.user, _id: req.user.id };
  }
  return null;
};

const reviewController = {
  getReviews: async (req, res) => {
    try {
      const { productId } = req.params;

      if (!isValidObjectId(productId)) {
        return res.status(400).json({ success: false, error: 'Invalid product ID' });
      }

      const reviews = await CustomerReview.find({ productId, status: 'active' }).sort({ createdAt: -1 }).lean();

      return res.status(200).json({
        success: true,
        data: reviews.map(mapReview)
      });
    } catch (error) {
      console.error('Error fetching reviews:', error);
      return res.status(500).json({ success: false, error: 'Failed to fetch reviews' });
    }
  },

  getMyReviewForProduct: async (req, res) => {
    try {
      const { productId } = req.params;
      const authUser = getAuthUser(req);

      if (!authUser) {
        return res.status(401).json({ success: false, error: 'Invalid user authentication' });
      }

      if (!isValidObjectId(productId)) {
        return res.status(400).json({ success: false, error: 'Invalid product ID' });
      }

      const review = await CustomerReview.findOne({ productId, customerId: authUser._id }).lean();
      return res.status(200).json({
        success: true,
        data: review ? mapReview(review) : null
      });
    } catch (error) {
      console.error('Error fetching my review:', error);
      return res.status(500).json({ success: false, error: 'Failed to fetch review' });
    }
  },

  createReview: async (req, res) => {
    try {
      const authUser = getAuthUser(req);
      if (!authUser) {
        return res.status(401).json({ success: false, error: 'Invalid user authentication' });
      }

      const { productId, rating, title = '', review } = req.body;
      if (!productId || !rating || !review) {
        return res.status(400).json({
          success: false,
          error: 'Product ID, rating, and review are required'
        });
      }

      if (!isValidObjectId(productId)) {
        return res.status(400).json({ success: false, error: 'Invalid product ID' });
      }

      const ratingNumber = Number(rating);
      if (!Number.isFinite(ratingNumber) || ratingNumber < 1 || ratingNumber > 5) {
        return res.status(400).json({ success: false, error: 'Rating must be between 1 and 5' });
      }

      const existingReview = await CustomerReview.findOne({
        productId,
        customerId: authUser._id
      });

      if (existingReview) {
        return res.status(409).json({
          success: false,
          error: 'You have already reviewed this product'
        });
      }

      let productName = 'Unknown Product';
      let productImage = '/api/placeholder/50/50';
      const product = await Product.findById(productId).select('name thumbnail');
      if (product) {
        productName = product.name || productName;
        productImage = product.thumbnail || productImage;
      }

      const newReview = await CustomerReview.create({
        reviewId: `REV-${Date.now().toString(36).slice(-6).toUpperCase()}`,
        productId,
        productName,
        productImage,
        customerId: authUser._id,
        customerName: `${authUser.firstName || ''} ${authUser.lastName || ''}`.trim() || 'Anonymous',
        customerEmail: authUser.email || '',
        rating: ratingNumber,
        title: String(title || '').trim(),
        review: String(review || '').trim(),
        verified: false,
        status: 'active'
      });

      await refreshProductStats(productId);

      return res.status(201).json({
        success: true,
        message: 'Review created successfully',
        data: mapReview(newReview)
      });
    } catch (error) {
      console.error('Error creating review:', error);
      return res.status(500).json({ success: false, error: 'Failed to create review' });
    }
  },

  updateReview: async (req, res) => {
    try {
      const authUser = getAuthUser(req);
      if (!authUser) {
        return res.status(401).json({ success: false, error: 'Invalid user authentication' });
      }

      const { id } = req.params;
      if (!isValidObjectId(id)) {
        return res.status(400).json({ success: false, error: 'Invalid review ID' });
      }

      const reviewDoc = await CustomerReview.findById(id);
      if (!reviewDoc) {
        return res.status(404).json({ success: false, error: 'Review not found' });
      }

      const isOwner = String(reviewDoc.customerId) === String(authUser._id);
      const isAdmin = authUser.role === 'admin';
      if (!isOwner && !isAdmin) {
        return res.status(403).json({ success: false, error: 'You do not have permission to update this review' });
      }

      const { rating, title, review } = req.body;
      if (rating !== undefined) {
        const ratingNumber = Number(rating);
        if (!Number.isFinite(ratingNumber) || ratingNumber < 1 || ratingNumber > 5) {
          return res.status(400).json({ success: false, error: 'Rating must be between 1 and 5' });
        }
        reviewDoc.rating = ratingNumber;
      }
      if (title !== undefined) {
        reviewDoc.title = String(title || '').trim();
      }
      if (review !== undefined) {
        reviewDoc.review = String(review || '').trim();
      }

      await reviewDoc.save();
      await refreshProductStats(reviewDoc.productId);

      return res.status(200).json({
        success: true,
        message: 'Review updated successfully',
        data: mapReview(reviewDoc)
      });
    } catch (error) {
      console.error('Error updating review:', error);
      return res.status(500).json({ success: false, error: 'Failed to update review' });
    }
  },

  deleteReview: async (req, res) => {
    try {
      const authUser = getAuthUser(req);
      if (!authUser) {
        return res.status(401).json({ success: false, error: 'Invalid user authentication' });
      }

      const { id } = req.params;
      if (!isValidObjectId(id)) {
        return res.status(400).json({ success: false, error: 'Invalid review ID' });
      }

      const reviewDoc = await CustomerReview.findById(id);
      if (!reviewDoc) {
        return res.status(404).json({ success: false, error: 'Review not found' });
      }

      const isOwner = String(reviewDoc.customerId) === String(authUser._id);
      const isAdmin = authUser.role === 'admin';
      if (!isOwner && !isAdmin) {
        return res.status(403).json({ success: false, error: 'You do not have permission to delete this review' });
      }

      await CustomerReview.findByIdAndDelete(id);
      await refreshProductStats(reviewDoc.productId);

      return res.status(200).json({
        success: true,
        message: 'Review deleted successfully'
      });
    } catch (error) {
      console.error('Error deleting review:', error);
      return res.status(500).json({ success: false, error: 'Failed to delete review' });
    }
  },

  markHelpful: async (req, res) => {
    try {
      const { id } = req.params;
      if (!isValidObjectId(id)) {
        return res.status(400).json({ success: false, error: 'Invalid review ID' });
      }

      const reviewDoc = await CustomerReview.findByIdAndUpdate(
        id,
        { $inc: { helpful: 1 } },
        { new: true }
      );

      if (!reviewDoc) {
        return res.status(404).json({ success: false, error: 'Review not found' });
      }

      return res.status(200).json({
        success: true,
        message: 'Marked as helpful',
        data: mapReview(reviewDoc)
      });
    } catch (error) {
      console.error('Error marking review as helpful:', error);
      return res.status(500).json({ success: false, error: 'Failed to mark helpful' });
    }
  }
};

module.exports = reviewController;
