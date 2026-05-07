const express = require('express');
const crypto = require('crypto');
const Razorpay = require('razorpay');
const auth = require('../middleware/authMiddleware');
const Order = require('../models/Order');
const Product = require('../models/Product');
const User = require('../models/User');
const { sendOrderConfirmationEmail } = require('../utils/emailService');

const router = express.Router();

const PHONE_REGEX = /^[6-9]\d{9}$/;

const getRazorpayInstance = () => {
  if (!process.env.RAZORPAY_KEY_ID || !process.env.RAZORPAY_KEY_SECRET) {
    throw new Error('Razorpay keys are missing on the server.');
  }

  return new Razorpay({
    key_id: process.env.RAZORPAY_KEY_ID,
    key_secret: process.env.RAZORPAY_KEY_SECRET,
  });
};

const validateAndPriceItems = async (items) => {
  if (!Array.isArray(items) || items.length === 0) {
    throw new Error('No items provided for payment.');
  }

  const normalizedItems = [];
  let totalAmount = 0;

  for (const item of items) {
    const product = await Product.findById(item.product);

    if (!product) {
      throw new Error('One or more products were not found.');
    }

    const quantity = Number(item.quantity) || 0;
    if (quantity <= 0) {
      throw new Error(`Invalid quantity for ${product.name}.`);
    }

    if (product.stock < quantity) {
      throw new Error(`${product.name} is out of stock.`);
    }

    const unitPrice = Number(product.discountPrice || product.price);
    totalAmount += unitPrice * quantity;

    normalizedItems.push({
      product: product._id,
      quantity,
      price: unitPrice,
    });
  }

  return { normalizedItems, totalAmount };
};

// @route   POST /api/payments/create-order
// @desc    Create Razorpay order
// @access  Private
router.post('/create-order', auth, async (req, res) => {
  try {
    const { items } = req.body;

    const razorpay = getRazorpayInstance();
    const { normalizedItems, totalAmount } = await validateAndPriceItems(items);

    const options = {
      amount: Math.round(totalAmount * 100),
      currency: 'INR',
      receipt: `rcpt_${Date.now()}`.slice(0, 40),
      notes: {
        userId: req.user.id,
        itemCount: String(normalizedItems.length),
      },
    };

    const order = await razorpay.orders.create(options);

    res.json({
      orderId: order.id,
      amount: order.amount,
      currency: order.currency,
      key: process.env.RAZORPAY_KEY_ID,
    });
  } catch (err) {
    console.error('Create Razorpay order error:', err.message);
    res.status(400).json({ message: err.message || 'Failed to create payment order.' });
  }
});

// @route   POST /api/payments/verify-payment
// @desc    Verify Razorpay payment and create confirmed order
// @access  Private
router.post('/verify-payment', auth, async (req, res) => {
  try {
    getRazorpayInstance();

    const {
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
      customer,
      items,
    } = req.body;

    if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
      return res.status(400).json({ message: 'Payment details are incomplete.' });
    }

    if (!customer?.fullName?.trim()) {
      return res.status(400).json({ message: 'Full name is required.' });
    }

    if (!PHONE_REGEX.test(String(customer?.phoneNumber || '').replace(/\D/g, ''))) {
      return res.status(400).json({ message: 'Please enter a valid 10-digit phone number.' });
    }

    if (customer?.orderType === 'delivery' && !customer?.address?.trim()) {
      return res.status(400).json({ message: 'Delivery address is required.' });
    }

    const expectedSignature = crypto
      .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
      .update(`${razorpay_order_id}|${razorpay_payment_id}`)
      .digest('hex');

    if (expectedSignature !== razorpay_signature) {
      return res.status(400).json({ message: 'Payment signature verification failed.' });
    }

    const existingOrder = await Order.findOne({ razorpayPaymentId: razorpay_payment_id });
    if (existingOrder) {
      return res.json({
        success: true,
        message: 'Payment already verified.',
        orderId: existingOrder._id,
      });
    }

    const { normalizedItems, totalAmount } = await validateAndPriceItems(items);

    for (const item of normalizedItems) {
      const product = await Product.findById(item.product);
      if (!product || product.stock < item.quantity) {
        return res.status(400).json({ message: 'One or more items became unavailable.' });
      }
      product.stock -= item.quantity;
      product.totalSold += item.quantity;
      await product.save();
    }

    const order = await Order.create({
      user: req.user.id,
      fullName: customer.fullName.trim(),
      phoneNumber: String(customer.phoneNumber).replace(/\D/g, ''),
      orderType: customer.orderType,
      address: customer.orderType === 'delivery' ? customer.address : undefined,
      city: customer.orderType === 'delivery' ? customer.city : undefined,
      zipCode: customer.orderType === 'delivery' ? customer.zipCode : undefined,
      items: normalizedItems,
      totalAmount,
      status: 'Confirmed',
      paymentMethod: 'razorpay',
      paymentStatus: 'Paid',
      razorpayOrderId: razorpay_order_id,
      razorpayPaymentId: razorpay_payment_id,
      paidAt: new Date(),
    });

    // Send Confirmation Email asynchronously
    User.findById(req.user.id)
      .then(user => {
        if (user && user.email) {
          Order.findById(order._id).populate('items.product', 'name images')
            .then(populatedOrder => {
              sendOrderConfirmationEmail(populatedOrder, user.email);
            });
        }
      })
      .catch(err => console.error('Failed to trigger email:', err));

    res.json({
      success: true,
      message: 'Payment verified successfully.',
      orderId: order._id,
    });
  } catch (err) {
    console.error('Verify Razorpay payment error:', err.message);
    res.status(500).json({ message: 'Failed to verify payment.' });
  }
});

module.exports = router;
