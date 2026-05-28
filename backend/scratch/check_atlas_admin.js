const mongoose = require('mongoose');
const User = require('../models/User');
require('dotenv').config({ path: '../.env' });

const run = async () => {
  try {
    const uri = 'mongodb+srv://dipak72529:Dipak85211@clustertest.xpewo89.mongodb.net/ddcosmetics?retryWrites=true&w=majority&appName=ClusterTest';
    await mongoose.connect(uri);
    console.log('Connected to MongoDB Atlas successfully.');

    const admins = await User.find({ role: 'admin' });
    console.log('Admins found in Atlas:', admins.length);
    for (const admin of admins) {
      console.log(`- Name: ${admin.name}, Email: ${admin.email}, Role: ${admin.role}`);
    }

    const allUsers = await User.find({});
    console.log('Total users in Atlas:', allUsers.length);
    for (const u of allUsers) {
      console.log(`- Email: ${u.email}, Role: ${u.role}`);
    }

    await mongoose.disconnect();
  } catch (err) {
    console.error('Error:', err.message);
  }
};

run();
