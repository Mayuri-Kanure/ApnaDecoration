const CustomerReview = require('../models/CustomerReview');
const Product = require('../models/Product');
const Customer = require('../models/Customer');

const buildReviewQuery = (queryParams) => {
  const query = {};
  const { search, rating, status, productId, customerId, date } = queryParams;

  if (rating && rating !== 'all') {
    const ratingNumber = parseInt(rating, 10);
    if (!Number.isNaN(ratingNumber)) query.rating = ratingNumber;
  }

  if (status && status !== 'all') {
    query.status = status;
  }

  if (productId) {
    query.productId = productId;
  }

  if (customerId) {
    query.customerId = customerId;
  }

  if (date) {
    const start = new Date(date);
    if (!Number.isNaN(start.getTime())) {
      const end = new Date(start);
      end.setDate(end.getDate() + 1);
      query.date = { $gte: start, $lt: end };
    }
  }

  if (search) {
    query.$or = [
      { reviewId: { $regex: search, $options: 'i' } },
      { customerName: { $regex: search, $options: 'i' } },
      { customerEmail: { $regex: search, $options: 'i' } },
      { productName: { $regex: search, $options: 'i' } },
      { review: { $regex: search, $options: 'i' } }
    ];
  }

  return query;
};

exports.getCustomerReviews = async (req, res) => {
  try {
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 10;
    const query = buildReviewQuery(req.query);

    const [reviews, total] = await Promise.all([
      CustomerReview.find(query)
        .populate('productId', 'name')
        .sort({ createdAt: -1 })
        .skip((page - 1) * limit)
        .limit(limit)
        .lean(),
      CustomerReview.countDocuments(query)
    ]);

    const [stats, ratingDistribution, products, customers] = await Promise.all([
      CustomerReview.aggregate([
        { $match: query },
        {
          $group: {
            _id: null,
            totalReviews: { $sum: 1 },
            averageRating: { $avg: '$rating' },
            fiveStar: { $sum: { $cond: [{ $eq: ['$rating', 5] }, 1, 0] } },
            fourStar: { $sum: { $cond: [{ $eq: ['$rating', 4] }, 1, 0] } },
            threeStar: { $sum: { $cond: [{ $eq: ['$rating', 3] }, 1, 0] } },
            twoStar: { $sum: { $cond: [{ $eq: ['$rating', 2] }, 1, 0] } },
            oneStar: { $sum: { $cond: [{ $eq: ['$rating', 1] }, 1, 0] } }
          }
        }
      ]),
      CustomerReview.aggregate([
        { $match: query },
        { $group: { _id: '$rating', count: { $sum: 1 } } },
        { $sort: { _id: -1 } }
      ]),
      CustomerReview.aggregate([
        { $group: { _id: '$productId', name: { $first: '$productName' } } },
        { $project: { _id: 0, id: '$_id', name: '$name' } },
        { $sort: { name: 1 } }
      ]),
      CustomerReview.aggregate([
        {
          $group: {
            _id: '$customerId',
            name: { $first: '$customerName' },
            email: { $first: '$customerEmail' }
          }
        },
        { $project: { _id: 0, id: '$_id', name: '$name', email: '$email' } },
        { $sort: { name: 1 } }
      ])
    ]);

    res.json({
      reviews,
      stats: {
        totalReviews: stats[0]?.totalReviews || 0,
        averageRating: stats[0]?.averageRating || 0,
        ratingDistribution: ratingDistribution || [],
        fiveStar: stats[0]?.fiveStar || 0,
        fourStar: stats[0]?.fourStar || 0,
        threeStar: stats[0]?.threeStar || 0,
        twoStar: stats[0]?.twoStar || 0,
        oneStar: stats[0]?.oneStar || 0
      },
      filterOptions: {
        products: products || [],
        customers: customers || []
      },
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

exports.addCustomerReview = async (req, res) => {
  try {
    const { productId, customerId, rating, review } = req.body;

    const customer = await Customer.findById(customerId);
    const product = await Product.findById(productId);

    if (!customer) {
      return res.status(404).json({ message: 'Customer not found' });
    }

    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }

    const customerReview = new CustomerReview({
      productId,
      customerId,
      customerName: `${customer.firstName} ${customer.lastName}`,
      customerEmail: customer.email,
      productName: product.name,
      rating,
      review
    });

    await customerReview.save();

    res.status(201).json({
      message: 'Customer review created successfully',
      review: customerReview
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

exports.replyToReview = async (req, res) => {
  try {
    const { reply } = req.body;
    const review = await CustomerReview.findById(req.params.id);

    if (!review) {
      return res.status(404).json({ message: 'Review not found' });
    }

    review.reply = reply || '';
    await review.save();

    res.json({
      message: 'Reply added successfully',
      review
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

exports.updateReviewStatus = async (req, res) => {
  try {
    const { status } = req.body;
    const review = await CustomerReview.findById(req.params.id);

    if (!review) {
      return res.status(404).json({ message: 'Review not found' });
    }

    review.status = status;
    await review.save();

    res.json({
      message: 'Review status updated successfully',
      review
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

