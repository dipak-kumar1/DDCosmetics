const mongoose = require('mongoose');
const dotenv = require('dotenv');
const Category = require('./models/Category');

dotenv.config();

const seedCategories = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('MongoDB Connected');

    const categories = [
      { name: 'Skincare', slug: 'skincare', isActive: true },
      { name: 'Makeup', slug: 'makeup', isActive: true },
      { name: 'Fragrance', slug: 'fragrance', isActive: true },
      { name: 'Hair Care', slug: 'hair-care', isActive: true },
      { name: 'Body Care', slug: 'body-care', isActive: true },
    ];

    for (const cat of categories) {
      const exists = await Category.findOne({ slug: cat.slug });
      if (!exists) {
        await Category.create(cat);
        console.log(`Created category: ${cat.name}`);
      } else {
        console.log(`Category already exists: ${cat.name}`);
      }
    }

    console.log('Category seeding completed');
    process.exit(0);
  } catch (error) {
    console.error('Seeding Error:', error);
    process.exit(1);
  }
};

seedCategories();
