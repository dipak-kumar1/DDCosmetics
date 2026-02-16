const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const User = require('../models/User');
require('dotenv').config();

const createAdmin = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/ddcosmetics');
    console.log('MongoDB connected');

    const adminEmail = 'admin@ddcosmetics.com';
    const adminPassword = 'admin123';

    const existingAdmin = await User.findOne({ email: adminEmail });
    if (existingAdmin) {
      console.log('Admin already exists');
      // Update role just in case
      existingAdmin.role = 'admin';
      await existingAdmin.save();
      console.log('Admin role ensured');
    } else {
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(adminPassword, salt);

      const newAdmin = new User({
        name: 'Super Admin',
        email: adminEmail,
        password: hashedPassword,
        role: 'admin'
      });

      await newAdmin.save();
      console.log('Admin created successfully');
      console.log(`Email: ${adminEmail}`);
      console.log(`Password: ${adminPassword}`);
    }

    process.exit();
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
};

createAdmin();
