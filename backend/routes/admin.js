const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const Product = require('../models/Product');
const Category = require('../models/Category');
const Order = require('../models/Order');
const auth = require('../middleware/authMiddleware'); // Verifies token
const adminAuth = require('../middleware/adminAuth'); // Verifies role
const upload = require('../config/cloudinary');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Ensure uploads directory exists
const uploadDir = path.join(__dirname, '../uploads');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

const parseArrayField = (field) => {
  if (!field) return [];
  if (Array.isArray(field)) return field;
  try {
    const parsed = JSON.parse(field);
    if (Array.isArray(parsed)) return parsed;
  } catch (e) {}
  if (typeof field === 'string') {
    return field.split(',').map(s => s.trim()).filter(Boolean);
  }
  return [];
};

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

// @route   POST /api/admin/login
// @desc    Admin Login
// @access  Public
router.post('/login', async (req, res) => {
  const { email, password } = req.body;
  try {
    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ message: 'Invalid credentials' });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(400).json({ message: 'Invalid credentials' });

    if (user.role !== 'admin') {
      return res.status(403).json({ message: 'Access denied. Not an admin.' });
    }

    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET || 'secretkey', { expiresIn: '1d' });
    res.json({ token, user: { id: user._id, name: user.name, email: user.email, role: user.role } });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   GET /api/admin/dashboard-stats
// @desc    Get dashboard statistics
// @access  Private/Admin
router.get('/dashboard-stats', auth, adminAuth, async (req, res) => {
  try {
    const totalProducts = await Product.countDocuments();
    const totalOrders = await Order.countDocuments();
    const totalUsers = await User.countDocuments({ role: 'user' });
    const pendingOrders = await Order.countDocuments({ status: 'Pending' });

    // Calculate total revenue (excluding Cancelled orders)
    const revenueAgg = await Order.aggregate([
      { $match: { status: { $ne: 'Cancelled' } } },
      { $group: { _id: null, total: { $sum: '$totalAmount' } } }
    ]);
    const totalRevenue = revenueAgg.length > 0 ? revenueAgg[0].total : 0;

    // Fetch recent 5 orders
    const recentOrders = await Order.find()
      .sort({ createdAt: -1 })
      .limit(5);

    // Aggregate top selling products from confirmed/paid orders
    const topProductsAgg = await Order.aggregate([
      { $match: { status: { $ne: 'Cancelled' } } },
      { $unwind: '$items' },
      {
        $group: {
          _id: '$items.product',
          totalSales: { $sum: '$items.quantity' }
        }
      },
      { $sort: { totalSales: -1 } },
      { $limit: 5 }
    ]);

    // Populate top products
    const topProducts = await Promise.all(
      topProductsAgg.map(async (item) => {
        if (!item._id) return null;
        const prod = await Product.findById(item._id);
        if (prod) {
          return {
            _id: prod._id,
            name: prod.name,
            price: prod.price,
            category: prod.category,
            images: prod.images,
            sales: item.totalSales
          };
        }
        return null;
      })
    );
    const filteredTopProducts = topProducts.filter(p => p !== null);

    // Fallback if no order items are present yet (use seeded totalSold)
    let finalTopProducts = filteredTopProducts;
    if (finalTopProducts.length === 0) {
      const placeholderProds = await Product.find().sort({ totalSold: -1 }).limit(5);
      finalTopProducts = placeholderProds.map(p => ({
        _id: p._id,
        name: p.name,
        price: p.price,
        category: p.category,
        images: p.images,
        sales: p.totalSold || 0
      }));
    }

    // Aggregation for Daily Revenue (last 7 days)
    const startOf7DaysAgo = new Date();
    startOf7DaysAgo.setDate(startOf7DaysAgo.getDate() - 6);
    startOf7DaysAgo.setHours(0, 0, 0, 0);

    const dailyRevenueAgg = await Order.aggregate([
      { 
        $match: { 
          status: { $ne: 'Cancelled' },
          createdAt: { $gte: startOf7DaysAgo }
        } 
      },
      {
        $group: {
          _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } },
          revenue: { $sum: "$totalAmount" },
          orders: { $sum: 1 }
        }
      },
      { $sort: { _id: 1 } }
    ]);

    const dailyRevenue = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const dateStr = d.toISOString().split('T')[0];
      const match = dailyRevenueAgg.find(item => item._id === dateStr);
      dailyRevenue.push({
        date: dateStr,
        formattedDate: d.toLocaleDateString('en-US', { day: 'numeric', month: 'short' }),
        revenue: match ? match.revenue : 0,
        orders: match ? match.orders : 0
      });
    }

    // Aggregation for Monthly Revenue (last 6 months)
    const startOf6MonthsAgo = new Date();
    startOf6MonthsAgo.setMonth(startOf6MonthsAgo.getMonth() - 5);
    startOf6MonthsAgo.setDate(1);
    startOf6MonthsAgo.setHours(0, 0, 0, 0);

    const monthlyRevenueAgg = await Order.aggregate([
      { 
        $match: { 
          status: { $ne: 'Cancelled' },
          createdAt: { $gte: startOf6MonthsAgo }
        } 
      },
      {
        $group: {
          _id: {
            year: { $year: "$createdAt" },
            month: { $month: "$createdAt" }
          },
          revenue: { $sum: "$totalAmount" },
          orders: { $sum: 1 }
        }
      }
    ]);

    const monthlyRevenue = [];
    const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    for (let i = 5; i >= 0; i--) {
      const d = new Date();
      d.setMonth(d.getMonth() - i);
      const year = d.getFullYear();
      const monthVal = d.getMonth() + 1;
      const match = monthlyRevenueAgg.find(item => item._id && item._id.year === year && item._id.month === monthVal);
      monthlyRevenue.push({
        month: `${monthNames[d.getMonth()]} ${year.toString().slice(-2)}`,
        revenue: match ? match.revenue : 0,
        orders: match ? match.orders : 0
      });
    }

    // Fetch products with low stock (less than 5)
    const lowStockProducts = await Product.find({
      isActive: true,
      stock: { $lt: 5 }
    }).select('name stock price images category');

    res.json({
      totalProducts,
      totalOrders,
      totalUsers,
      pendingOrders,
      totalRevenue,
      recentOrders: recentOrders || [],
      topSellingProducts: finalTopProducts || [],
      dailyRevenue,
      monthlyRevenue,
      lowStockProducts: lowStockProducts || []
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

// ================= PRODUCT ROUTES =================

// @route   GET /api/admin/products
// @desc    Get all products
// @access  Private/Admin
router.get('/products', auth, adminAuth, async (req, res) => {
  try {
    const products = await Product.find().sort({ createdAt: -1 });
    res.json(products);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   POST /api/admin/products
// @desc    Add a product
// @access  Private/Admin
router.post('/products', auth, adminAuth, (req, res, next) => {
  // Check if Cloudinary is configured
  const isCloudinaryConfigured = process.env.CLOUDINARY_CLOUD_NAME && 
                                 process.env.CLOUDINARY_CLOUD_NAME !== 'your_cloud_name' &&
                                 process.env.CLOUDINARY_API_KEY !== 'your_api_key';

  if (!isCloudinaryConfigured) {
    console.warn('Cloudinary not configured. Using fallback storage to parse fields.');
    return uploadFallback.array('images', 5)(req, res, (err) => {
      if (err) {
        console.error('Fallback Upload Error:', err);
        return res.status(500).json({ message: 'Form parsing failed.' });
      }
      next();
    });
  }

  upload.array('images', 5)(req, res, (err) => {
    if (err) {
      console.error('Image Upload Error:', err);
      return res.status(500).json({ message: 'Image upload failed. Check Cloudinary credentials. Error: ' + err.message });
    }
    next();
  });
}, async (req, res) => {
  try {
    const { 
      name, 
      price, 
      category, 
      description, 
      stock, 
      isWholesale, 
      moq, 
      bulkPricing, 
      sellerType, 
      shopName, 
      contactNumber, 
      location,
      skinType,
      skinConcern,
      finish,
      preferences
    } = req.body;
    
    // Determine images
    let imageUrls = [];
    if (req.files && req.files.length > 0) {
      imageUrls = req.files.map(file => {
        // If it's a Cloudinary URL, use it directly
        if (file.path && (file.path.startsWith('http') || file.path.startsWith('https'))) {
          return file.path;
        }
        // Otherwise, it's a local file, return the static path
        return `/uploads/${file.filename}`;
      });
    } else {
      // Use placeholder if no images uploaded (or Cloudinary skipped)
      imageUrls = ['https://via.placeholder.com/300?text=No+Image'];
    }

    const newProduct = new Product({
      name,
      price,
      category,
      description,
      stock,
      images: imageUrls,
      isWholesale: isWholesale === 'true' || isWholesale === true,
      moq: moq || 1,
      bulkPricing: bulkPricing ? JSON.parse(bulkPricing) : [],
      sellerType: sellerType || 'own',
      shopName: shopName || '',
      contactNumber: contactNumber || '',
      location: location || '',
      skinType: parseArrayField(skinType),
      skinConcern: parseArrayField(skinConcern),
      finish: finish || '',
      preferences: parseArrayField(preferences)
    });

    await newProduct.save();
    res.json(newProduct);
  } catch (err) {
    console.error('Product Save Error:', err);
    res.status(500).json({ message: 'Server error: ' + err.message });
  }
});

// @route   GET /api/admin/products/:id
// @desc    Get single product by ID
// @access  Private/Admin
router.get('/products/:id', auth, adminAuth, async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }
    res.json(product);
  } catch (err) {
    console.error(err);
    if (err.kind === 'ObjectId') {
      return res.status(404).json({ message: 'Product not found' });
    }
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   PUT /api/admin/products/:id/toggle
// @desc    Toggle product active/deactive status
// @access  Private/Admin
router.put('/products/:id/toggle', auth, adminAuth, async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }
    product.isActive = !product.isActive;
    await product.save();
    res.json(product);
  } catch (err) {
    console.error('Toggle Product Status Error:', err);
    res.status(500).json({ message: 'Server error: ' + err.message });
  }
});

// @route   PUT /api/admin/products/:id
// @desc    Update product (or disable)
// @access  Private/Admin
router.put('/products/:id', auth, adminAuth, (req, res, next) => {
  // Check if Cloudinary is configured
  const isCloudinaryConfigured = process.env.CLOUDINARY_CLOUD_NAME && 
                                 process.env.CLOUDINARY_CLOUD_NAME !== 'your_cloud_name' &&
                                 process.env.CLOUDINARY_API_KEY !== 'your_api_key';

  if (!isCloudinaryConfigured) {
    console.warn('Cloudinary not configured. Using fallback storage to parse fields.');
    return uploadFallback.array('images', 5)(req, res, (err) => {
      if (err) {
        console.error('Fallback Upload Error:', err);
        return res.status(500).json({ message: 'Form parsing failed.' });
      }
      next();
    });
  }

  upload.array('images', 5)(req, res, (err) => {
    if (err) {
      console.error('Image Upload Error:', err);
      return res.status(500).json({ message: 'Image upload failed. Check Cloudinary credentials. Error: ' + err.message });
    }
    next();
  });
}, async (req, res) => {
  try {
    const { 
      name, 
      price, 
      category, 
      description, 
      stock,
      isWholesale, 
      moq, 
      bulkPricing, 
      sellerType, 
      shopName, 
      contactNumber, 
      location,
      isActive,
      skinType,
      skinConcern,
      finish,
      preferences
    } = req.body;
    
    // Find the existing product first
    let product = await Product.findById(req.params.id);
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }

    // Determine images (only modify if existingImages or new files are provided)
    if (req.body.existingImages !== undefined || (req.files && req.files.length > 0)) {
      let imageUrls = [];
      
      // Parse existing images
      if (req.body.existingImages) {
        try {
          const parsed = JSON.parse(req.body.existingImages);
          if (Array.isArray(parsed)) {
            imageUrls = parsed;
          } else if (typeof parsed === 'string') {
             imageUrls = [parsed];
          }
        } catch (e) {
          // Fallback if not JSON or just a single string
          if (Array.isArray(req.body.existingImages)) {
            imageUrls = req.body.existingImages;
          } else {
            imageUrls = [req.body.existingImages];
          }
        }
      }

      // Append new uploaded images
      if (req.files && req.files.length > 0) {
        const newImageUrls = req.files.map(file => {
          if (file.path && (file.path.startsWith('http') || file.path.startsWith('https'))) {
            return file.path;
          }
          return `/uploads/${file.filename}`;
        });
        imageUrls = [...imageUrls, ...newImageUrls];
      }
      
      product.images = imageUrls;
    }
    
    // Update fields
    product.name = name || product.name;
    if (price !== undefined) product.price = Number(price);
    product.category = category || product.category;
    product.description = description || product.description;
    if (stock !== undefined) product.stock = Number(stock);
    
    // Wholesale fields update
    if (isWholesale !== undefined) product.isWholesale = isWholesale === 'true' || isWholesale === true;
    if (moq !== undefined) product.moq = Number(moq);
    if (bulkPricing !== undefined) product.bulkPricing = typeof bulkPricing === 'string' ? JSON.parse(bulkPricing) : bulkPricing;
    if (sellerType !== undefined) product.sellerType = sellerType;
    if (shopName !== undefined) product.shopName = shopName;
    if (contactNumber !== undefined) product.contactNumber = contactNumber;
    if (location !== undefined) product.location = location;

    // Active status update
    if (isActive !== undefined) {
      product.isActive = isActive === 'true' || isActive === true;
    }

    // Cosmetic Filters
    if (skinType !== undefined) product.skinType = parseArrayField(skinType);
    if (skinConcern !== undefined) product.skinConcern = parseArrayField(skinConcern);
    if (finish !== undefined) product.finish = finish;
    if (preferences !== undefined) product.preferences = parseArrayField(preferences);

    await product.save();
    res.json(product);
  } catch (err) {
    console.error('Product Update Error:', err);
    res.status(500).json({ message: 'Server error: ' + err.message });
  }
});

// ================= CATEGORY ROUTES =================

// @route   GET /api/admin/categories
// @desc    Get all categories
// @access  Private/Admin
router.get('/categories', auth, adminAuth, async (req, res) => {
  try {
    const categories = await Category.find().sort({ createdAt: -1 });
    res.json(categories);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   POST /api/admin/categories
// @desc    Add category
// @access  Private/Admin
router.post('/categories', auth, adminAuth, (req, res, next) => {
  const isCloudinaryConfigured = process.env.CLOUDINARY_CLOUD_NAME && 
                                 process.env.CLOUDINARY_CLOUD_NAME !== 'your_cloud_name' &&
                                 process.env.CLOUDINARY_API_KEY !== 'your_api_key';

  if (!isCloudinaryConfigured) {
    return uploadFallback.single('image')(req, res, (err) => {
      if (err) return res.status(500).json({ message: 'Form parsing failed.' });
      next();
    });
  }

  upload.single('image')(req, res, (err) => {
    if (err) return res.status(500).json({ message: 'Image upload failed. ' + err.message });
    next();
  });
}, async (req, res) => {
  try {
    const { name, slug } = req.body;
    let imageUrl = '';

    if (req.file) {
      if (req.file.path && (req.file.path.startsWith('http') || req.file.path.startsWith('https'))) {
        imageUrl = req.file.path;
      } else {
        imageUrl = `/uploads/${req.file.filename}`;
      }
    }

    const category = new Category({ name, slug, image: imageUrl });
    await category.save();
    res.json(category);
  } catch (err) {
    if (err.code === 11000) {
      return res.status(400).json({ message: 'Category slug already exists' });
    }
    console.error('Category Save Error:', err);
    res.status(500).json({ message: 'Server error: ' + err.message });
  }
});

// @route   PUT /api/admin/categories/:id
// @desc    Update category (enable/disable + image)
// @access  Private/Admin
router.put('/categories/:id', auth, adminAuth, (req, res, next) => {
  const isCloudinaryConfigured = process.env.CLOUDINARY_CLOUD_NAME && 
                                 process.env.CLOUDINARY_CLOUD_NAME !== 'your_cloud_name' &&
                                 process.env.CLOUDINARY_API_KEY !== 'your_api_key';

  if (!isCloudinaryConfigured) {
    return uploadFallback.single('image')(req, res, (err) => {
      if (err) return res.status(500).json({ message: 'Form parsing failed.' });
      next();
    });
  }

  upload.single('image')(req, res, (err) => {
    if (err) return res.status(500).json({ message: 'Image upload failed. ' + err.message });
    next();
  });
}, async (req, res) => {
  try {
    const { name, slug, isActive } = req.body;
    
    // Find category first
    let category = await Category.findById(req.params.id);
    if (!category) return res.status(404).json({ message: 'Category not found' });

    // Handle Image
    if (req.file) {
      if (req.file.path && (req.file.path.startsWith('http') || req.file.path.startsWith('https'))) {
        category.image = req.file.path;
      } else {
        category.image = `/uploads/${req.file.filename}`;
      }
    }

    if (name) category.name = name;
    if (slug) category.slug = slug;
    if (isActive !== undefined) category.isActive = isActive;

    await category.save();
    res.json(category);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

// ================= ORDER ROUTES =================

// @route   GET /api/admin/orders
// @desc    Get all orders
// @access  Private/Admin
router.get('/orders', auth, adminAuth, async (req, res) => {
  try {
    const orders = await Order.find()
      .populate('user', 'name email')
      .sort({ createdAt: -1 });
    res.json(orders);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   PUT /api/admin/orders/:id/status
// @desc    Update order status
// @access  Private/Admin
router.put('/orders/:id/status', auth, adminAuth, async (req, res) => {
  try {
    const { status } = req.body;
    const order = await Order.findByIdAndUpdate(req.params.id, { status }, { new: true });
    res.json(order);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

// ================= CHANGE PASSWORD =================

// @route   PUT /api/admin/change-password
// @desc    Change admin password
// @access  Private/Admin
router.put('/change-password', auth, adminAuth, async (req, res) => {
  const { oldPassword, newPassword } = req.body;
  try {
    const user = await User.findById(req.user.id);
    const isMatch = await bcrypt.compare(oldPassword, user.password);
    if (!isMatch) return res.status(400).json({ message: 'Invalid old password' });

    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(newPassword, salt);
    await user.save();

    res.json({ message: 'Password updated successfully' });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
