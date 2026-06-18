const express = require('express');
const router = express.Router();
const auth = require('../middleware/authMiddleware');
const adminAuth = require('../middleware/adminAuth');
const Product = require('../models/Product');
const UserActivity = require('../models/UserActivity');
const Order = require('../models/Order');
const User = require('../models/User');
const { sendOrderConfirmationEmail } = require('../utils/emailService');


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

    // Send Confirmation Email (Awaited to ensure completion on host environment)
    try {
      const user = await User.findById(req.user.id);
      if (user && user.email) {
        const populatedOrder = await Order.findById(order._id).populate('items.product', 'name images');
        if (populatedOrder) {
          await sendOrderConfirmationEmail(populatedOrder, user.email);
        }
      }
    } catch (err) {
      console.error('Failed to send order confirmation email:', err);
    }


    // Track purchase activity for recommendations
    try {
      const activities = items.map(item => ({
        user: req.user.id,
        product: item.product,
        action: 'purchase',
        weight: 10,
        timeSpent: 0
      }));
      await UserActivity.insertMany(activities);
    } catch (activityErr) {
      console.error('Failed to log purchase activity:', activityErr.message);
    }

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

// @route   POST /api/orders/check-delivery
// @desc    Check if delivery is available for a pincode
// @access  Public
router.post('/check-delivery', async (req, res) => {
  try {
    const { pincode } = req.body;
    if (!pincode) return res.status(400).json({ msg: 'Pincode is required' });
    
    // Simple validation for 6-digit Indian pincode
    const isValidPincode = /^[1-9][0-9]{5}$/.test(pincode);
    
    // For demo purposes, let's say all valid pincodes are deliverable except those starting with '9'
    if (isValidPincode && !pincode.startsWith('9')) {
      res.json({ deliverable: true, message: 'Delivery Available' });
    } else {
      res.json({ deliverable: false, message: 'Not Deliverable to this pincode' });
    }
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// @route   PUT /api/orders/:id/address
// @desc    Update order delivery address
// @access  Private
router.put('/:id/address', auth, async (req, res) => {
  try {
    const { address, city, zipCode } = req.body;
    let order = await Order.findById(req.params.id);

    if (!order) {
      return res.status(404).json({ msg: 'Order not found' });
    }

    // Ensure user owns order
    if (order.user.toString() !== req.user.id) {
      return res.status(401).json({ msg: 'User not authorized' });
    }

    // Check if order can be updated
    if (!['Pending Confirmation', 'Confirmed', 'Ready for Pickup'].includes(order.status)) {
      return res.status(400).json({ msg: `Cannot change address. Order is already ${order.status}` });
    }

    if (address) order.address = address;
    if (city) order.city = city;
    if (zipCode) order.zipCode = zipCode;

    await order.save();
    res.json(order);
  } catch (err) {
    console.error(err.message);
    if (err.kind === 'ObjectId') {
      return res.status(404).json({ msg: 'Order not found' });
    }
    res.status(500).send('Server Error');
  }
});

module.exports = router;
