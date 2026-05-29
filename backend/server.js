const express = require('express');
const cors = require('cors');
const path = require('path');
const connectDB = require('./config/db');
require('dotenv').config();

const app = express();

// Connect DB & Seed Admin User
const seedAdminOnStartup = async () => {
  try {
    const User = require('./models/User');
    const bcrypt = require('bcryptjs');
    const adminEmail = 'admin@ddcosmetics.com';
    const admin = await User.findOne({ email: adminEmail });
    if (!admin) {
      console.log('No admin user found. Creating default admin...');
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash('adminpassword123', salt);
      const newAdmin = new User({
        name: 'Admin User',
        email: adminEmail,
        password: hashedPassword,
        role: 'admin',
        mobile: '1234567890',
        gender: 'Male'
      });
      await newAdmin.save();
      console.log('Default admin user created successfully!');
    } else {
      console.log('Admin user verified on startup.');
    }
  } catch (err) {
    console.error('Error seeding default admin on startup:', err.message);
  }
};

connectDB().then(() => {
  seedAdminOnStartup();
});

if (!process.env.JWT_SECRET) {
  console.warn('WARNING: JWT_SECRET is not defined in .env file. Using default "secretkey" (INSECURE).');
}

// Middleware
app.use(cors({
  origin: true,
  credentials: true
}));
app.use(express.json());

// Serve Static Files (Uploads)
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/users', require('./routes/users'));
app.use('/api/products', require('./routes/products'));
app.use('/api/categories', require('./routes/categories'));
app.use('/api/banners', require('./routes/banners'));
app.use('/api/promo-banners', require('./routes/promoBanners'));
app.use('/api/hero-config', require('./routes/heroConfig'));
app.use('/api/orders', require('./routes/orders'));
app.use('/api/payments', require('./routes/payments'));
app.use('/api/admin', require('./routes/admin'));
app.use('/api/recommendations', require('./routes/recommendations'));
app.use('/api/reviews', require('./routes/reviews'));
app.use('/api/utility-bar', require('./routes/utilityBar'));
app.use('/api/branding', require('./routes/branding'));

// Health Check / Ping
app.get('/api/ping', (req, res) => res.json({ status: 'ok', time: new Date() }));

// Global Error Handler
app.use((err, req, res, next) => {
  console.error('Unhandled Error:', err);
  res.status(500).json({ message: 'Internal Server Error', error: err.message });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
// Trigger reload 2

