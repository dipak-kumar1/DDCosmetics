const express = require('express');
const router = express.Router();
const Review = require('../models/Review');
const Order = require('../models/Order');
const Product = require('../models/Product');
const auth = require('../middleware/authMiddleware');
const upload = require('../config/cloudinary');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Ensure uploads directory exists
const uploadDir = path.join(__dirname, '../uploads');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, uploadDir);
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  }
});

const uploadFallback = multer({ storage: storage });

// Helper upload middleware for multiple files (up to 5 images)
const uploadMiddleware = (req, res, next) => {
  const isCloudinaryConfigured = process.env.CLOUDINARY_CLOUD_NAME && 
                                 process.env.CLOUDINARY_CLOUD_NAME !== 'your_cloud_name' &&
                                 process.env.CLOUDINARY_API_KEY !== 'your_api_key';

  if (!isCloudinaryConfigured) {
    return uploadFallback.array('images', 5)(req, res, (err) => {
      if (err) {
        console.error('Multer local error:', err);
        return res.status(500).json({ message: 'Form parsing failed.' });
      }
      next();
    });
  }

  upload.array('images', 5)(req, res, (err) => {
    if (err) {
      console.error('Cloudinary upload error:', err);
      return res.status(500).json({ message: 'Image upload failed.' });
    }
    next();
  });
};

// @route   GET /api/reviews/product/:productId
// @desc    Get all reviews for a product with filters & summary
// @access  Public
router.get('/product/:productId', async (req, res) => {
  try {
    const { sort, imagesOnly } = req.query;
    let query = { product: req.params.productId };
    
    if (imagesOnly === 'true') {
      query.images = { $exists: true, $not: { $size: 0 } };
    }
    
    let sortQuery = { createdAt: -1 }; // default latest
    if (sort === 'highest') {
      sortQuery = { rating: -1, createdAt: -1 };
    } else if (sort === 'lowest') {
      sortQuery = { rating: 1, createdAt: -1 };
    }

    const reviews = await Review.find(query)
      .populate('user', 'name')
      .sort(sortQuery);

    // Compute rating summary stats
    const allReviews = await Review.find({ product: req.params.productId });
    const totalReviews = allReviews.length;
    
    let sumRatings = 0;
    let distribution = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };
    
    allReviews.forEach(r => {
      sumRatings += r.rating;
      if (distribution[r.rating] !== undefined) {
        distribution[r.rating]++;
      }
    });
    
    const averageRating = totalReviews > 0 ? Number((sumRatings / totalReviews).toFixed(1)) : 0;

    res.json({
      reviews,
      summary: {
        averageRating,
        totalReviews,
        distribution
      }
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error fetching reviews.' });
  }
});

// @route   GET /api/reviews/product/:productId/can-review
// @desc    Check if a user is eligible to write a review
// @access  Private
router.get('/product/:productId/can-review', auth, async (req, res) => {
  try {
    const hasPurchased = await Order.exists({
      user: req.user.id,
      "items.product": req.params.productId,
      status: { $ne: 'Cancelled' },
      $or: [
        { paymentStatus: 'Paid' },
        { status: 'Delivered' }
      ]
    });

    const hasReviewed = await Review.exists({
      product: req.params.productId,
      user: req.user.id
    });

    res.json({
      canReview: !!(hasPurchased && !hasReviewed),
      hasReviewed: !!hasReviewed,
      isVerified: !!hasPurchased
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error checking review eligibility.' });
  }
});

// @route   POST /api/reviews/product/:productId
// @desc    Create a new product review
// @access  Private
router.post('/product/:productId', auth, uploadMiddleware, async (req, res) => {
  try {
    const { rating, comment } = req.body;
    const productId = req.params.productId;

    if (!rating || !comment) {
      return res.status(400).json({ message: 'Rating and comment are required.' });
    }

    const ratingNum = Number(rating);
    if (isNaN(ratingNum) || ratingNum < 1 || ratingNum > 5) {
      return res.status(400).json({ message: 'Rating must be a number between 1 and 5.' });
    }

    // Verify purchase
    const hasPurchased = await Order.exists({
      user: req.user.id,
      "items.product": productId,
      status: { $ne: 'Cancelled' },
      $or: [
        { paymentStatus: 'Paid' },
        { status: 'Delivered' }
      ]
    });

    if (!hasPurchased) {
      return res.status(400).json({ message: 'Only users who purchased this product can write a review.' });
    }

    // Check duplicate
    const alreadyReviewed = await Review.exists({
      product: productId,
      user: req.user.id
    });

    if (alreadyReviewed) {
      return res.status(400).json({ message: 'You have already reviewed this product.' });
    }

    // Process files
    let imageUrls = [];
    if (req.files && req.files.length > 0) {
      imageUrls = req.files.map(file => {
        if (file.path && (file.path.startsWith('http') || file.path.startsWith('https'))) {
          return file.path;
        }
        return `/uploads/${file.filename}`;
      });
    }

    const review = new Review({
      product: productId,
      user: req.user.id,
      rating: ratingNum,
      comment,
      images: imageUrls,
      isVerifiedPurchase: true
    });

    await review.save();

    // Recalculate product metrics
    const productReviews = await Review.find({ product: productId });
    const numReviews = productReviews.length;
    const avgRating = productReviews.reduce((sum, r) => sum + r.rating, 0) / numReviews;

    await Product.findByIdAndUpdate(productId, {
      ratings: Number(avgRating.toFixed(1)),
      numReviews
    });

    // Populate user info for frontend immediate render
    await review.populate('user', 'name');

    res.status(201).json(review);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error creating review.' });
  }
});

// @route   PUT /api/reviews/review/:reviewId
// @desc    Update a review
// @access  Private
router.put('/review/:reviewId', auth, async (req, res) => {
  try {
    const { rating, comment } = req.body;
    const review = await Review.findById(req.params.reviewId);

    if (!review) {
      return res.status(404).json({ message: 'Review not found.' });
    }

    if (review.user.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Not authorized to edit this review.' });
    }

    if (rating) {
      const ratingNum = Number(rating);
      if (isNaN(ratingNum) || ratingNum < 1 || ratingNum > 5) {
        return res.status(400).json({ message: 'Rating must be a number between 1 and 5.' });
      }
      review.rating = ratingNum;
    }

    if (comment) {
      review.comment = comment;
    }

    await review.save();

    // Recalculate product metrics
    const productReviews = await Review.find({ product: review.product });
    const numReviews = productReviews.length;
    const avgRating = productReviews.reduce((sum, r) => sum + r.rating, 0) / numReviews;

    await Product.findByIdAndUpdate(review.product, {
      ratings: Number(avgRating.toFixed(1)),
      numReviews
    });

    await review.populate('user', 'name');

    res.json(review);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error updating review.' });
  }
});

module.exports = router;
