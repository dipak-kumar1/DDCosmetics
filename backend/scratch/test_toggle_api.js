const mongoose = require('mongoose');
const axios = require('axios');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const Product = require('../models/Product');
require('dotenv').config({ path: './.env' });

async function run() {
  try {
    console.log("Connecting to DB:", process.env.MONGO_URI || 'mongodb://localhost:27017/ddcosmetics');
    await mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/ddcosmetics');
    console.log("DB connected successfully.");

    // Find admin user
    const admin = await User.findOne({ role: 'admin' });
    if (!admin) {
      console.error("Admin user not found in database.");
      process.exit(1);
    }
    console.log(`Found admin: ${admin.email}`);

    // Generate token
    const token = jwt.sign(
      { id: admin._id, role: admin.role },
      process.env.JWT_SECRET || 'secretkey',
      { expiresIn: '1d' }
    );
    console.log("Generated token:", token.substring(0, 20) + "...");

    // Find a product
    const product = await Product.findOne();
    if (!product) {
      console.error("No product found in database.");
      process.exit(1);
    }
    console.log(`Found product: ${product.name} (ID: ${product._id}), isActive: ${product.isActive}`);

    // Call PUT API to toggle status
    const targetStatus = !product.isActive;
    console.log(`Attempting to update status to: ${targetStatus}`);

    const res = await axios.put(`http://localhost:5000/api/admin/products/${product._id}/toggle`, 
      {},
      {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      }
    );

    console.log("API Response status:", res.status);
    console.log("API Response data:", res.data);

    // Verify in DB
    const updatedProduct = await Product.findById(product._id);
    console.log(`Verified in DB: isActive is now ${updatedProduct.isActive}`);

  } catch (err) {
    console.error("Error occurred:");
    if (err.response) {
      console.error("Status:", err.response.status);
      console.error("Data:", err.response.data);
    } else {
      console.error(err);
    }
  } finally {
    await mongoose.disconnect();
    console.log("DB disconnected.");
  }
}

run();
