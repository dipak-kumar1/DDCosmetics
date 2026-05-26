const express = require('express');
const router = express.Router();
const PromoBanner = require('../models/PromoBanner');
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
      if (err) {
        console.error('Local form parsing failed:', err);
        return res.status(500).json({ message: 'Form parsing failed.' });
      }
      next();
    });
  }

  upload.single('image')(req, res, (err) => {
    if (err) {
      console.error('Cloudinary upload failed:', err);
      return res.status(500).json({ message: 'Image upload failed.' });
    }
    next();
  });
};

// @route   GET /api/promo-banners
// @desc    Get all active promotional banners (Public)
// @access  Public
router.get('/', async (req, res) => {
  try {
    const banners = await PromoBanner.find({ isActive: true }).sort({ order: 1 });
    res.json(banners);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   GET /api/promo-banners/admin
// @desc    Get all promotional banners (Admin)
// @access  Private/Admin
router.get('/admin', auth, adminAuth, async (req, res) => {
  try {
    const banners = await PromoBanner.find().sort({ order: 1 });
    res.json(banners);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   POST /api/promo-banners
// @desc    Add a promotional banner
// @access  Private/Admin
router.post('/', auth, adminAuth, uploadMiddleware, async (req, res) => {
  try {
    const { title, subtitle, link, buttonText, isActive, order } = req.body;
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

    const newBanner = new PromoBanner({
      title,
      subtitle: subtitle || '',
      image: imageUrl,
      link: link || '',
      buttonText: buttonText || 'Shop Now',
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

// @route   PUT /api/promo-banners/:id
// @desc    Update a promotional banner
// @access  Private/Admin
router.put('/:id', auth, adminAuth, uploadMiddleware, async (req, res) => {
  try {
    const { title, subtitle, link, buttonText, isActive, order } = req.body;
    const banner = await PromoBanner.findById(req.params.id);
    
    if (!banner) return res.status(404).json({ message: 'Promotional banner not found' });

    if (title !== undefined) banner.title = title;
    if (subtitle !== undefined) banner.subtitle = subtitle;
    if (link !== undefined) banner.link = link;
    if (buttonText !== undefined) banner.buttonText = buttonText;
    if (isActive !== undefined) banner.isActive = isActive === 'true' || isActive === true;
    if (order !== undefined) banner.order = order ? parseInt(order) : 0;

    if (req.file) {
      if (req.file.path && (req.file.path.startsWith('http') || req.file.path.startsWith('https'))) {
        banner.image = req.file.path;
      } else {
        banner.image = `/uploads/${req.file.filename}`;
      }
    }

    await banner.save();
    res.json(banner);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   DELETE /api/promo-banners/:id
// @desc    Delete a promotional banner
// @access  Private/Admin
router.delete('/:id', auth, adminAuth, async (req, res) => {
  try {
    const banner = await PromoBanner.findById(req.params.id);
    if (!banner) return res.status(404).json({ message: 'Promotional banner not found' });

    await PromoBanner.findByIdAndDelete(req.params.id);
    res.json({ message: 'Promotional banner removed' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
