const UserActivity = require('../models/UserActivity');
const Product = require('../models/Product');
const Order = require('../models/Order');

// Weights for different actions
const ACTION_WEIGHTS = {
  view: 1,
  search: 2,
  wishlist: 3,
  cart: 5,
  purchase: 10
};

// @desc    Track user activity
// @route   POST /api/recommendations/track
// @access  Public (Uses sessionToken for guests)
exports.trackActivity = async (req, res) => {
  try {
    const { sessionToken, productId, category, action, timeSpent, metadata } = req.body;
    const userId = req.user ? req.user.id : null;

    if (!userId && !sessionToken) {
      return res.status(400).json({ message: 'User ID or Session Token required' });
    }

    const weight = ACTION_WEIGHTS[action] || 1;

    // If it's a view action, we might just want to update timeSpent if it already exists within the last hour
    if (action === 'view') {
      const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000);
      const existingView = await UserActivity.findOne({
        $or: [{ user: userId }, { sessionToken }],
        product: productId,
        action: 'view',
        createdAt: { $gte: oneHourAgo }
      });

      if (existingView) {
        existingView.timeSpent = (existingView.timeSpent || 0) + (timeSpent || 0);
        existingView.weight = Math.min(existingView.weight + 0.5, 5); // Max weight for repeated views
        await existingView.save();
        return res.status(200).json({ message: 'Activity updated' });
      }
    }

    await UserActivity.create({
      user: userId,
      sessionToken,
      product: productId,
      category,
      action,
      weight,
      timeSpent: timeSpent || 0,
      metadata
    });

    res.status(201).json({ message: 'Activity tracked successfully' });
  } catch (error) {
    console.error('Tracking Error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Helper: Get user's purchased product IDs
const getPurchasedProductIds = async (userId, sessionToken) => {
  const purchasedActivities = await UserActivity.find({
    $or: [{ user: userId }, { sessionToken }],
    action: 'purchase'
  }).select('product');
  return purchasedActivities.map(a => a.product.toString());
};

// @desc    Get Personalized Recommendations
// @route   GET /api/recommendations/personalized
// @access  Public
exports.getPersonalized = async (req, res) => {
  try {
    const sessionToken = req.headers['x-session-token'];
    const userId = req.user ? req.user.id : null;

    if (!userId && !sessionToken) {
      return res.json({ recommendedForYou: [], basedOnInterests: [] });
    }

    // 1. Analyze User Preferences
    // Get activities from the last 30 days
    const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    const activities = await UserActivity.find({
      $or: [{ user: userId }, { sessionToken }],
      createdAt: { $gte: thirtyDaysAgo }
    }).populate('product', 'category');

    if (activities.length === 0) {
      // Fallback to trending products
      const trending = await Product.find({ isActive: true }).sort({ totalSold: -1, ratings: -1 }).limit(10);
      return res.json({
        recommendedForYou: trending.slice(0, 5),
        basedOnInterests: trending.slice(5, 10)
      });
    }

    // Calculate category scores
    const categoryScores = {};
    const productScores = {};

    activities.forEach(activity => {
      // Use category from activity or fallback to populated product category
      const category = activity.category || (activity.product && activity.product.category);
      const productId = activity.product ? activity.product._id.toString() : null;
      
      if (category) {
        categoryScores[category] = (categoryScores[category] || 0) + activity.weight;
      }
      
      if (productId) {
        productScores[productId] = (productScores[productId] || 0) + activity.weight;
      }
    });

    // Sort categories by score
    const topCategories = Object.entries(categoryScores)
      .sort((a, b) => b[1] - a[1])
      .map(entry => entry[0])
      .slice(0, 3); // Get top 3 categories

    const purchasedIds = await getPurchasedProductIds(userId, sessionToken);

    // 2. Fetch "Recommended For You" (Top products from their favorite categories)
    let recommendedForYou = [];
    if (topCategories.length > 0) {
      recommendedForYou = await Product.find({
        isActive: true,
        category: { $in: topCategories },
        _id: { $nin: purchasedIds }
      })
      .sort({ totalSold: -1, ratings: -1 })
      .limit(8);
    }

    // 3. Fetch "Based on Your Interests"
    // Products similar to highly interacted items, or newer items in favorite categories
    let basedOnInterests = [];
    if (topCategories.length > 0) {
      basedOnInterests = await Product.find({
        isActive: true,
        category: { $in: topCategories },
        _id: { $nin: [...purchasedIds, ...recommendedForYou.map(p => p._id)] }
      })
      .sort({ createdAt: -1 }) // Newest items in their favorite categories
      .limit(8);
    }

    res.json({
      recommendedForYou,
      basedOnInterests
    });

  } catch (error) {
    console.error('Personalized Recommendations Error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Get Recommendations for a specific product
// @route   GET /api/recommendations/product/:id
// @access  Public
exports.getProductRecommendations = async (req, res) => {
  try {
    const { id } = req.params;
    const sessionToken = req.headers['x-session-token'];
    const userId = req.user ? req.user.id : null;

    const currentProduct = await Product.findById(id);
    if (!currentProduct) {
      return res.status(404).json({ message: 'Product not found' });
    }

    // 1. "Customers Also Bought"
    // Find orders that contain this product, then get other products from those orders
    const ordersWithProduct = await Order.find({ 'items.product': id }).select('items.product');
    
    const alsoBoughtMap = {};
    ordersWithProduct.forEach(order => {
      order.items.forEach(item => {
        const prodId = item.product.toString();
        if (prodId !== id) {
          alsoBoughtMap[prodId] = (alsoBoughtMap[prodId] || 0) + 1;
        }
      });
    });

    // Sort by frequency
    const alsoBoughtIds = Object.entries(alsoBoughtMap)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 8)
      .map(entry => entry[0]);

    const customersAlsoBought = alsoBoughtIds.length > 0 
      ? await Product.find({ _id: { $in: alsoBoughtIds }, isActive: true }) 
      : [];

    // 2. "Similar Products"
    // Same category, exclude current product and 'also bought' products
    const similarProducts = await Product.find({
      category: currentProduct.category,
      isActive: true,
      _id: { $nin: [id, ...alsoBoughtIds] }
    })
    .sort({ ratings: -1, totalSold: -1 })
    .limit(8);

    // 3. "Because You Viewed This"
    // We can pull products from their recent view history
    let becauseYouViewedThis = [];
    if (userId || sessionToken) {
      const recentViews = await UserActivity.find({
        $or: [{ user: userId }, { sessionToken }],
        action: 'view',
        product: { $ne: id }
      })
      .sort({ createdAt: -1 })
      .populate('product')
      .limit(10);

      // Extract unique active products
      const uniqueProducts = new Map();
      recentViews.forEach(activity => {
        if (activity.product && activity.product.isActive && uniqueProducts.size < 8) {
          uniqueProducts.set(activity.product._id.toString(), activity.product);
        }
      });
      becauseYouViewedThis = Array.from(uniqueProducts.values());
    }

    res.json({
      customersAlsoBought,
      similarProducts,
      becauseYouViewedThis
    });

  } catch (error) {
    console.error('Product Recommendations Error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};
