const express = require('express');
const router = express.Router();
const Branding = require('../models/Branding');
const auth = require('../middleware/authMiddleware');
const adminAuth = require('../middleware/adminAuth');
const upload = require('../config/cloudinary');
const cloudinary = require('cloudinary').v2;
const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Ensure uploads directory exists for fallback storage
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

const uploadMiddleware = (req, res, next) => {
  const isCloudinaryConfigured = process.env.CLOUDINARY_CLOUD_NAME && 
                                 process.env.CLOUDINARY_CLOUD_NAME !== 'your_cloud_name' &&
                                 process.env.CLOUDINARY_API_KEY !== 'your_api_key';

  if (!isCloudinaryConfigured) {
    return uploadFallback.single('logo')(req, res, (err) => {
      if (err) return res.status(500).json({ message: 'Form parsing failed.' });
      next();
    });
  }

  upload.single('logo')(req, res, (err) => {
    if (err) return res.status(500).json({ message: 'Image upload failed. ' + err.message });
    next();
  });
};

// Hardcoded fallback default logo (stored in backend/uploads)
const DEFAULT_LOGO_URL = '/uploads/default-logo.png';

// Helper to get absolute resized icon URL using Cloudinary dynamic transformations
function getResizedIcon(url, size, fallback) {
  const targetUrl = url || fallback || DEFAULT_LOGO_URL;
  
  if (targetUrl.includes('res.cloudinary.com')) {
    const parts = targetUrl.split('/upload/');
    if (parts.length === 2) {
      return `${parts[0]}/upload/c_pad,w_${size},h_${size},b_white,f_png/${parts[1]}`;
    }
  }
  return targetUrl;
}

// @route   GET /api/branding
// @desc    Get branding settings
// @access  Public
router.get('/', async (req, res) => {
  try {
    let branding = await Branding.findOne();
    if (!branding) {
      branding = new Branding({
        logoUrl: DEFAULT_LOGO_URL,
        logoPublicId: '',
        title: 'DDCosmetics',
        themeColor: '#ffffff',
        backgroundColor: '#ffffff'
      });
      await branding.save();
    }
    res.json(branding);
  } catch (err) {
    console.error('Error fetching branding settings:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   PUT /api/branding
// @desc    Update branding settings & upload logo
// @access  Private/Admin
router.put('/', auth, adminAuth, uploadMiddleware, async (req, res) => {
  try {
    let branding = await Branding.findOne();
    if (!branding) {
      branding = new Branding();
    }

    const { title, themeColor, backgroundColor } = req.body;

    if (title !== undefined) branding.title = title;
    if (themeColor !== undefined) branding.themeColor = themeColor;
    if (backgroundColor !== undefined) branding.backgroundColor = backgroundColor;

    // Handle new logo upload
    if (req.file) {
      let newLogoUrl = '';
      let newLogoPublicId = '';

      if (req.file.path && (req.file.path.startsWith('http') || req.file.path.startsWith('https'))) {
        newLogoUrl = req.file.path;
        newLogoPublicId = req.file.filename; // Cloudinary returns public ID here
      } else {
        newLogoUrl = `/uploads/${req.file.filename}`;
        newLogoPublicId = '';
      }

      // If there was an old Cloudinary logo, delete it to save space
      if (branding.logoPublicId && branding.logoPublicId !== newLogoPublicId) {
        try {
          await cloudinary.uploader.destroy(branding.logoPublicId);
          console.log(`Deleted old Cloudinary asset: ${branding.logoPublicId}`);
        } catch (e) {
          console.error('Failed to destroy old logo in Cloudinary:', e.message);
        }
      }

      branding.logoUrl = newLogoUrl;
      branding.logoPublicId = newLogoPublicId;
    }

    await branding.save();
    res.json(branding);
  } catch (err) {
    console.error('Error updating branding settings:', err);
    res.status(500).json({ message: 'Server error: ' + err.message });
  }
});

// @route   GET /api/branding/manifest.json
// @desc    Dynamically generate and serve web app manifest
// @access  Public
router.get('/manifest.json', async (req, res) => {
  try {
    let branding = await Branding.findOne();
    const logoUrl = branding ? branding.logoUrl : DEFAULT_LOGO_URL;
    const title = branding ? branding.title : 'DDCosmetics';
    const themeColor = branding ? branding.themeColor : '#ffffff';
    const backgroundColor = branding ? branding.backgroundColor : '#ffffff';

    // Build absolute URL for relative paths if logoUrl is local
    let absoluteLogo192 = getResizedIcon(logoUrl, 192);
    let absoluteLogo512 = getResizedIcon(logoUrl, 512);

    const protocol = req.headers['x-forwarded-proto'] || req.protocol;
    const host = req.get('host');
    const baseUrl = `${protocol}://${host}`;

    if (absoluteLogo192.startsWith('/')) {
      absoluteLogo192 = `${baseUrl}${absoluteLogo192}`;
    }
    if (absoluteLogo512.startsWith('/')) {
      absoluteLogo512 = `${baseUrl}${absoluteLogo512}`;
    }

    const manifest = {
      name: title,
      short_name: title,
      description: `Shop high-quality luxury cosmetics and skincare products on ${title}.`,
      start_url: '/',
      display: 'standalone',
      background_color: backgroundColor,
      theme_color: themeColor,
      orientation: 'portrait',
      icons: [
        {
          src: absoluteLogo192,
          sizes: '192x192',
          type: 'image/png',
          purpose: 'any maskable'
        },
        {
          src: absoluteLogo512,
          sizes: '512x512',
          type: 'image/png',
          purpose: 'any maskable'
        }
      ]
    };

    res.setHeader('Content-Type', 'application/manifest+json; charset=utf-8');
    res.json(manifest);
  } catch (err) {
    console.error('Error generating manifest.json:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
