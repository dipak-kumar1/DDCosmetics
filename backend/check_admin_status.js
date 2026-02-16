const mongoose = require('mongoose');
const User = require('./models/User');
require('dotenv').config();

const checkAdmin = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/ddcosmetics');
    console.log('MongoDB connected');

    const admin = await User.findOne({ email: 'admin@ddcosmetics.com' });
    if (admin) {
      console.log('Admin found:');
      console.log(`Email: ${admin.email}`);
      console.log(`Role: ${admin.role}`);
      console.log(`Password Hash: ${admin.password.substring(0, 20)}...`);
    } else {
      console.log('Admin NOT found!');
    }
    process.exit();
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
};

checkAdmin();
