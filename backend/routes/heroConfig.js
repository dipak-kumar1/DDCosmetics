const express = require('express');
const router = express.Router();
const HeroConfig = require('../models/HeroConfig');
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

// @route   GET /api/hero-config
// @desc    Get hero configuration
// @access  Public
router.get('/', async (req, res) => {
  try {
    let config = await HeroConfig.findOne();
    if (!config) {
      // Return default config if none exists
      config = new HeroConfig();
      await config.save();
    }
    res.json(config);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   PUT /api/hero-config
// @desc    Update hero configuration
// @access  Private/Admin
router.put('/', auth, adminAuth, uploadMiddleware, async (req, res) => {
  try {
    let config = await HeroConfig.findOne();
    if (!config) {
      config = new HeroConfig();
    }

    // Handle image upload
    if (req.file) {
      let imageUrl = '';
      if (req.file.path && (req.file.path.startsWith('http') || req.file.path.startsWith('https'))) {
        imageUrl = req.file.path;
      } else {
        imageUrl = `/uploads/${req.file.filename}`;
      }
      config.backgroundImage = imageUrl;
    }

    // Handle text fields
    // Note: req.body fields might be strings if coming from FormData
    const { 
      title, subtitle, isActive, offerBadge,
      cta1Text, cta1Type, cta1Link,
      cta2Text, cta2Type, cta2Link,
      deliveryText, deliveryMapLink, deliveryWhatsapp
    } = req.body;

    if (title !== undefined) config.title = title;
    if (subtitle !== undefined) config.subtitle = subtitle;
    if (isActive !== undefined) config.isActive = isActive === 'true' || isActive === true;
    if (offerBadge !== undefined) config.offerBadge = offerBadge;

    // Update CTA 1
    if (cta1Text !== undefined) config.cta1.text = cta1Text;
    if (cta1Type !== undefined) config.cta1.type = cta1Type;
    if (cta1Link !== undefined) config.cta1.link = cta1Link;

    // Update CTA 2
    if (cta2Text !== undefined) config.cta2.text = cta2Text;
    if (cta2Type !== undefined) config.cta2.type = cta2Type;
    if (cta2Link !== undefined) config.cta2.link = cta2Link;

    // Update Delivery Info
    if (deliveryText !== undefined) config.deliveryInfo.text = deliveryText;
    if (deliveryMapLink !== undefined) config.deliveryInfo.mapLink = deliveryMapLink;
    if (deliveryWhatsapp !== undefined) config.deliveryInfo.whatsappNumber = deliveryWhatsapp;

    await config.save();
    res.json(config);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
