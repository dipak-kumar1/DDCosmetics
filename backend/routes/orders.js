const express = require('express');
const router = express.Router();
const auth = require('../middleware/authMiddleware');
const adminAuth = require('../middleware/adminAuth');
const Order = require('../models/Order');
const Product = require('../models/Product');

// @route   POST /api/orders
// @desc    Create a new order (Checkout)
// @access  Private
router.post('/', auth, async (req, res) => {
  try {
    const { 
      fullName, 
      phoneNumber, 
      orderType, 
      address, 
      city, 
      zipCode, 
      items, 
      totalAmount 
    } = req.body;

    if (!items || items.length === 0) {
      return res.status(400).json({ msg: 'No items in order' });
    }

    // Validate phone number (simple check)
    if (!phoneNumber || phoneNumber.length < 10) {
      return res.status(400).json({ msg: 'Valid phone number is required' });
    }

    // Validate stock and reduce it
    for (const item of items) {
      const product = await Product.findById(item.product);
      if (!product) {
        return res.status(404).json({ msg: `Product not found: ${item.product}` });
      }
      if (product.stock < item.quantity) {
        return res.status(400).json({ msg: `Product ${product.name} is out of stock` });
      }
      product.stock -= item.quantity;
      product.totalSold += item.quantity;
      await product.save();
    }

    const newOrder = new Order({
      user: req.user.id,
      fullName,
      phoneNumber,
      orderType,
      address: orderType === 'delivery' ? address : undefined,
      city: orderType === 'delivery' ? city : undefined,
      zipCode: orderType === 'delivery' ? zipCode : undefined,
      items,
      totalAmount,
      status: 'Pending Confirmation'
    });

    const order = await newOrder.save();
    res.json(order);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// @route   GET /api/orders
// @desc    Get all orders (Admin only)
// @access  Private/Admin
router.get('/', auth, adminAuth, async (req, res) => {
  try {
    const orders = await Order.find()
      .populate('user', ['name', 'email'])
      .populate('items.product', ['name', 'images', 'price'])
      .sort({ createdAt: -1 });
    res.json(orders);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// @route   PUT /api/orders/:id/status
// @desc    Update order status (Admin only)
// @access  Private/Admin
router.put('/:id/status', auth, adminAuth, async (req, res) => {
  try {
    const { status } = req.body;
    const order = await Order.findById(req.params.id);

    if (!order) {
      return res.status(404).json({ msg: 'Order not found' });
    }

    order.status = status;
    await order.save();
    res.json(order);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// @route   PUT /api/orders/:id/cancel
// @desc    Cancel order (User only, before Shipped)
// @access  Private
router.put('/:id/cancel', auth, async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);

    if (!order) {
      return res.status(404).json({ msg: 'Order not found' });
    }

    // Ensure user owns the order
    if (order.user.toString() !== req.user.id) {
      return res.status(401).json({ msg: 'Not authorized' });
    }

    // Check status
    if (['Shipped', 'Delivered', 'Cancelled'].includes(order.status)) {
      return res.status(400).json({ msg: 'Order cannot be cancelled at this stage' });
    }

    const { reason } = req.body; // Get reason from request body

    order.status = 'Cancelled';
    order.cancelReason = reason || 'No reason provided';
    
    // Restore stock
    for (const item of order.items) {
      const product = await Product.findById(item.product);
      if (product) {
        product.stock += item.quantity;
        product.totalSold -= item.quantity;
        await product.save();
      }
    }

    await order.save();
    res.json(order);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// @route   GET /api/orders/myorders
// @desc    Get logged in user's orders
// @access  Private
router.get('/myorders', auth, async (req, res) => {
  try {
    const orders = await Order.find({ user: req.user.id })
      .populate('items.product', ['name', 'images', 'price'])
      .sort({ createdAt: -1 });
    res.json(orders);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

module.exports = router;
