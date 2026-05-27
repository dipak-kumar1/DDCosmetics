const mongoose = require('mongoose');
const dotenv = require('dotenv');
const Product = require('./models/Product');
const connectDB = require('./config/db');

dotenv.config();
connectDB();

const PRODUCTS = [
  {
    name: 'Velvet Matte Lipstick',
    category: 'Makeup',
    price: 24.99,
    description: 'A rich, highly pigmented lipstick that glides on smoothly and leaves a velvety matte finish that lasts all day.',
    stock: 50,
    images: ['https://images.unsplash.com/photo-1586495777744-4413f21062fa?auto=format&fit=crop&q=80&w=800'],
    finish: 'Matte',
    skinType: ['Normal', 'Combination'],
    skinConcern: ['Glow'],
    preferences: ['Vegan', 'Cruelty-Free']
  },
  {
    name: 'Hydrating Face Serum',
    category: 'Skincare',
    price: 45.00,
    description: 'Deeply hydrate and plump your skin with this lightweight serum enriched with hyaluronic acid and vitamins.',
    stock: 30,
    images: ['https://images.unsplash.com/photo-1620916566398-39f1143ab7be?auto=format&fit=crop&q=80&w=800'],
    finish: 'Dewy',
    skinType: ['Dry', 'Sensitive', 'Normal'],
    skinConcern: ['Dryness', 'Glow'],
    preferences: ['Organic', 'Vegan', 'Cruelty-Free', 'Paraben-Free']
  },
  {
    name: 'Rose Gold Highlighter',
    category: 'Makeup',
    price: 32.50,
    description: 'Achieve a radiant glow with our buildable rose gold highlighter that complements all skin tones.',
    stock: 40,
    images: ['https://images.unsplash.com/photo-1596462502278-27bfdd403348?auto=format&fit=crop&q=80&w=800'],
    finish: 'Glossy',
    skinType: ['Normal', 'Combination', 'Oily'],
    skinConcern: ['Glow'],
    preferences: ['Cruelty-Free']
  },
  {
    name: 'Night Repair Cream',
    category: 'Skincare',
    price: 58.00,
    description: 'Wake up to rejuvenated skin. This rich night cream works while you sleep to repair and restore skin barrier.',
    stock: 25,
    images: ['https://images.unsplash.com/photo-1570194065650-d99fb4b8ccb0?auto=format&fit=crop&q=80&w=800'],
    finish: 'Satin',
    skinType: ['Dry', 'Normal', 'Sensitive'],
    skinConcern: ['Anti-Aging', 'Dryness'],
    preferences: ['Vegan', 'Cruelty-Free', 'Paraben-Free']
  },
  {
    name: 'Signature Fragrance',
    category: 'Fragrance',
    price: 85.00,
    description: 'A timeless scent featuring notes of jasmine, vanilla, and sandalwood. Elegant and long-lasting.',
    stock: 20,
    images: ['https://images.unsplash.com/photo-1541643600914-78b084683601?auto=format&fit=crop&q=80&w=800'],
    finish: '',
    skinType: ['Normal'],
    skinConcern: [],
    preferences: []
  },
  {
    name: 'Volumizing Mascara',
    category: 'Makeup',
    price: 18.00,
    description: 'Get dramatic volume and length without clumps. Our smudge-proof formula lasts all day.',
    stock: 60,
    images: ['https://images.unsplash.com/photo-1631214500115-598fc2cb8d2d?auto=format&fit=crop&q=80&w=800'],
    finish: 'Matte',
    skinType: ['Normal', 'Sensitive'],
    skinConcern: ['Glow'],
    preferences: ['Vegan', 'Cruelty-Free']
  },
  {
    name: 'Daily Sunscreen SPF 50',
    category: 'Skincare',
    price: 28.00,
    description: 'Broad-spectrum protection that absorbs quickly without a white cast. Perfect for daily wear under makeup.',
    stock: 45,
    images: ['https://images.unsplash.com/photo-1556228720-1987556551b7?auto=format&fit=crop&q=80&w=800'],
    finish: 'Dewy',
    skinType: ['Oily', 'Dry', 'Combination', 'Sensitive', 'Normal'],
    skinConcern: ['Anti-Aging', 'Dark Spots'],
    preferences: ['Organic', 'Cruelty-Free', 'Paraben-Free']
  },
  {
    name: 'Lavender Body Wash',
    category: 'Body Care',
    price: 22.00,
    description: 'Relax and unwind with the soothing scent of lavender. Cleanses gently while moisturizing your skin.',
    stock: 55,
    images: ['https://images.unsplash.com/photo-1556228852-6d35a585d566?auto=format&fit=crop&q=80&w=800'],
    finish: 'Satin',
    skinType: ['Normal', 'Dry', 'Combination'],
    skinConcern: ['Dryness'],
    preferences: ['Vegan', 'Cruelty-Free']
  },
];

const seedProducts = async () => {
  try {
    await Product.deleteMany({}); // Clear existing products
    await Product.insertMany(PRODUCTS);
    console.log('Products Seeded Successfully');
    process.exit();
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
};

seedProducts();
