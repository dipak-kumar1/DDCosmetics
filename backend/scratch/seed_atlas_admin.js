const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('../models/User');

const run = async () => {
  try {
    const uri = 'mongodb+srv://dipak72529:Dipak85211@clustertest.xpewo89.mongodb.net/ddcosmetics?retryWrites=true&w=majority&appName=ClusterTest';
    await mongoose.connect(uri);
    console.log('Connected to MongoDB Atlas successfully.');

    const adminEmail = 'admin@ddcosmetics.com';
    let admin = await User.findOne({ email: adminEmail });

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash('adminpassword123', salt);

    if (admin) {
      console.log('Admin user found in Atlas. Updating...');
      admin.role = 'admin';
      admin.password = hashedPassword;
      await admin.save();
      console.log('Admin updated successfully.');
    } else {
      console.log('Admin not found in Atlas. Creating default admin...');
      admin = new User({
        name: 'Admin User',
        email: adminEmail,
        password: hashedPassword,
        role: 'admin',
        mobile: '1234567890',
        gender: 'Male'
      });
      await admin.save();
      console.log('Admin user seeded successfully into Atlas!');
    }

    await mongoose.disconnect();
    console.log('Disconnected.');
  } catch (err) {
    console.error('Error seeding Atlas admin:', err.message);
  }
};

run();
