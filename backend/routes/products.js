const express = require('express');
const router = express.Router();
const Product = require('../models/Product');

// @route   GET /api/products
// @desc    Get all active products (with optional category filter)
// @access  Public
router.get('/', async (req, res) => {
  try {
    const { category, search, tag, discount } = req.query;
    let query = { isActive: true };

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
