const mongoose = require('mongoose');
const Product = require('../models/Product');
require('dotenv').config({ path: './.env' });

async function run() {
  try {
    await mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/ddcosmetics');
    console.log("DB Connected.");

    const products = await Product.find();
    console.log(`Found ${products.length} products in DB.`);

    products.forEach((p, idx) => {
      console.log(`[${idx}] Name: ${p.name}`);
      console.log(`    isActive: ${p.isActive} (Type: ${typeof p.isActive})`);
      console.log(`    price: ${p.price} (Type: ${typeof p.price})`);
      console.log(`    category: ${p.category} (Type: ${typeof p.category})`);
    });

  } catch (err) {
    console.error(err);
  } finally {
    await mongoose.disconnect();
    console.log("DB Disconnected.");
  }
}

run();
