const express = require('express');
const router = express.Router();
const Banner = require('../models/Banner');
const auth = require('../middleware/authMiddleware');
const adminAuth = require('../middleware/adminAuth');
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

// Helper for upload middleware
const uploadMiddleware = (req, res, next) => {
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
    if (err) return res.status(500).json({ message: 'Image upload failed.' });
    next();
  });
};

// @route   GET /api/banners
// @desc    Get all active banners (Public)
// @access  Public
router.get('/', async (req, res) => {
  try {
    const banners = await Banner.find({ isActive: true }).sort({ order: 1 });
    res.json(banners);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   GET /api/banners/admin
// @desc    Get all banners (Admin)
// @access  Private/Admin
router.get('/admin', auth, adminAuth, async (req, res) => {
  try {
    const banners = await Banner.find().sort({ order: 1 });
    res.json(banners);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   POST /api/banners
// @desc    Add a banner
// @access  Private/Admin
router.post('/', auth, adminAuth, uploadMiddleware, async (req, res) => {
  try {
    const { title, link, isActive, order } = req.body;
    let imageUrl = '';

    if (req.file) {
      if (req.file.path && (req.file.path.startsWith('http') || req.file.path.startsWith('https'))) {
        imageUrl = req.file.path;
      } else {
        imageUrl = `/uploads/${req.file.filename}`;
      }
    }

    if (!imageUrl) {
      return res.status(400).json({ message: 'Image is required' });
    }

    const newBanner = new Banner({
      title,
      image: imageUrl,
      link,
      isActive: isActive === 'true' || isActive === true,
      order: order ? parseInt(order) : 0
    });

    await newBanner.save();
    res.json(newBanner);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   DELETE /api/banners/:id
// @desc    Delete a banner
// @access  Private/Admin
router.delete('/:id', auth, adminAuth, async (req, res) => {
  try {
    const banner = await Banner.findById(req.params.id);
    if (!banner) return res.status(404).json({ message: 'Banner not found' });

    await Banner.findByIdAndDelete(req.params.id);
    res.json({ message: 'Banner removed' });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   PUT /api/banners/:id
// @desc    Update a banner
// @access  Private/Admin
router.put('/:id', auth, adminAuth, async (req, res) => {
  try {
    const { isActive, order, title, link } = req.body;
    const banner = await Banner.findById(req.params.id);
    
    if (!banner) return res.status(404).json({ message: 'Banner not found' });

    if (isActive !== undefined) banner.isActive = isActive;
    if (order !== undefined) banner.order = order;
    if (title !== undefined) banner.title = title;
    if (link !== undefined) banner.link = link;

    await banner.save();
    res.json(banner);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
