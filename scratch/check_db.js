const mongoose = require('mongoose');
require('dotenv').config({ path: '../backend/.env' });
const User = require('../backend/models/User');

async function run() {
  await mongoose.connect(process.env.MONGO_URI);
  const users = await User.find({});
  for (const user of users) {
    console.log(`User: ${user.email}, Addresses: ${user.addresses?.length}`);
  }
  mongoose.disconnect();
}
run();
