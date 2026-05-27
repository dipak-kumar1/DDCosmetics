const mongoose = require('mongoose');
const connectDB = require('../config/db');
require('dotenv').config({ path: '../.env' });

const Product = require('../models/Product');

const run = async () => {
  try {
    await connectDB();
    console.log('Database connected successfully.');

    // Find any active product and update its stock to 3
    const product = await Product.findOne({ isActive: true });
    if (!product) {
      console.log('No active product found to update.');
    } else {
      console.log('Original Product:', product.name, 'Stock:', product.stock);
      product.stock = 3;
      await product.save();
      console.log('Updated Product:', product.name, 'Stock now:', product.stock);
    }

    await mongoose.disconnect();
    console.log('Database disconnected.');
  } catch (err) {
    console.error('Error running script:', err);
    process.exit(1);
  }
};

run();
