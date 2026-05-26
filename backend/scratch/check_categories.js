const mongoose = require('mongoose');
const Category = require('../models/Category');
require('dotenv').config({ path: './.env' });

async function run() {
  try {
    await mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/ddcosmetics');
    console.log("DB Connected.");

    const categories = await Category.find();
    console.log(`Found ${categories.length} categories in DB.`);

    categories.forEach((c, idx) => {
      console.log(`[${idx}] Name: ${c.name}, Slug: ${c.slug}, isActive: ${c.isActive}`);
    });

  } catch (err) {
    console.error(err);
  } finally {
    await mongoose.disconnect();
    console.log("DB Disconnected.");
  }
}

run();
