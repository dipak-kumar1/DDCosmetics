const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const User = require('./models/User');
require('dotenv').config();

const resetAdminPassword = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/ddcosmetics');
    console.log('MongoDB connected');

    const adminEmail = 'admin@ddcosmetics.com';
    const newPassword = 'admin123';

    const user = await User.findOne({ email: adminEmail });
    if (!user) {
      console.log('Admin user not found!');
    } else {
      const salt = await bcrypt.genSalt(10);
      user.password = await bcrypt.hash(newPassword, salt);
      user.role = 'admin'; // Ensure role is admin
      await user.save();
      console.log('Admin password reset successfully to: admin123');
    }
    process.exit();
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
};

resetAdminPassword();
