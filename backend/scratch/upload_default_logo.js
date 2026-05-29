const mongoose = require('mongoose');
const path = require('path');
const fs = require('fs');
require('dotenv').config();

// Connect DB
const connectDB = require('../config/db');
const Branding = require('../models/Branding');

const GENERATED_LOGO_PATH = 'C:\\Users\\dipak kumar\\.gemini\\antigravity-ide\\brain\\0e12c903-372a-4a80-bc33-c7ddeae41a81\\dd_default_logo_1780053958125.png';
const TARGET_LOGO_PATH = path.join(__dirname, '../uploads/default-logo.png');

async function initializeBranding() {
  try {
    // 1. Copy generated image to uploads folder
    const uploadsDir = path.join(__dirname, '../uploads');
    if (!fs.existsSync(uploadsDir)) {
      fs.mkdirSync(uploadsDir, { recursive: true });
    }

    fs.copyFileSync(GENERATED_LOGO_PATH, TARGET_LOGO_PATH);
    console.log(`Default logo copied to: ${TARGET_LOGO_PATH}`);

    // 2. Connect to Database (Atlas)
    await connectDB();
    console.log('Database connected.');

    // 3. Upsert database branding document
    let branding = await Branding.findOne();
    if (!branding) {
      branding = new Branding({
        logoUrl: '/uploads/default-logo.png',
        logoPublicId: '',
        title: 'DDCosmetics',
        themeColor: '#ffffff',
        backgroundColor: '#ffffff'
      });
      console.log('No branding document found. Creating a new one with default-logo.png...');
      await branding.save();
      console.log('Branding settings created successfully!');
    } else {
      console.log('Branding settings already exist in database:', branding);
    }

    process.exit(0);
  } catch (err) {
    console.error('Error during branding initialization:', err);
    process.exit(1);
  }
}

initializeBranding();
