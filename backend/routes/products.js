const express = require('express');
const router = express.Router();
const Product = require('../models/Product');

// @route   GET /api/products
// @desc    Get all active products (with optional category filter)
// @access  Public
router.get('/', async (req, res) => {
  try {
    const { category, search, tag, discount, isWholesale, skinType, skinConcern, finish, preferences } = req.query;
    let query = { isActive: true };

    // Default to excluding wholesale products unless specifically requested
    if (isWholesale === 'true') {
      query.isWholesale = true;
    } else {
      // Include products where isWholesale is false OR missing (undefined/null)
      query.isWholesale = { $ne: true };
    }

    if (category) {
      // Case-insensitive search for category
      query.category = { $regex: new RegExp(category, 'i') };
    }

    if (tag) {
      // Search for tag in tags array
      query.tags = { $in: [new RegExp(tag, 'i')] };
    }

    if (discount === 'true') {
      // Filter products with discountPrice less than price
      query.discountPrice = { $exists: true, $ne: null };
      query.$expr = { $lt: ["$discountPrice", "$price"] };
    }

    // Cosmetic Filters
    if (skinType) {
      query.skinType = { $in: skinType.split(',') };
    }
    if (skinConcern) {
      query.skinConcern = { $in: skinConcern.split(',') };
    }
    if (finish) {
      query.finish = { $in: finish.split(',') };
    }
    if (preferences) {
      query.preferences = { $in: preferences.split(',') };
    }

    if (search) {
      query.$or = [
        { name: { $regex: new RegExp(search, 'i') } },
        { description: { $regex: new RegExp(search, 'i') } },
        { category: { $regex: new RegExp(search, 'i') } },
        { tags: { $in: [new RegExp(search, 'i')] } }
      ];
    }

    let queryBuilder = Product.find(query).sort({ createdAt: -1 });

    if (req.query.limit) {
      queryBuilder = queryBuilder.limit(parseInt(req.query.limit));
    }

    const products = await queryBuilder;
    res.json(products);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// @route   GET /api/products/trending
// @desc    Get top 8 trending products (sorted by totalSold)
// @access  Public
router.get('/trending', async (req, res) => {
  try {
    const products = await Product.find({ isActive: true })
      .sort({ totalSold: -1 })
      .limit(8);
    res.json(products);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// @route   GET /api/products/bestsellers
// @desc    Get best selling products (highest sales in last 30 days)
// @access  Public
router.get('/bestsellers', async (req, res) => {
  try {
    const products = await Product.find({ isActive: true })
      .sort({ salesLast30Days: -1 }) // Assuming salesLast30Days is populated
      .limit(8); // Grid layout: 4 desktop, 2 mobile -> 8 is a good number
    res.json(products);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// @route   GET /api/products/combos
// @desc    Get festival combo products
// @access  Public
router.get('/combos', async (req, res) => {
  try {
    const products = await Product.find({ isActive: true, isCombo: true })
      .limit(8);
    res.json(products);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// @route   GET /api/products/new-arrivals
// @desc    Get latest products
// @access  Public
router.get('/new-arrivals', async (req, res) => {
  try {
    const products = await Product.find({ isActive: true })
      .sort({ createdAt: -1 })
      .limit(8);
    res.json(products);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// @route   GET /api/products/:id
// @desc    Get product by ID
// @access  Public
router.get('/:id', async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    
    if (!product) {
      return res.status(404).json({ msg: 'Product not found' });
    }

    res.json(product);
  } catch (err) {
    console.error(err.message);
    if (err.kind === 'ObjectId') {
      return res.status(404).json({ msg: 'Product not found' });
    }
    res.status(500).send('Server Error');
  }
});

module.exports = router;
