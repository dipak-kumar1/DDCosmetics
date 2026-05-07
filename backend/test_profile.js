const mongoose = require('mongoose');
require('dotenv').config({ path: './.env' });
const User = require('./models/User');

async function run() {
  await mongoose.connect(process.env.MONGO_URI);
  const user = await User.findOne({ email: 'deepak72529@gmail.com' });
  
  if (user) {
    try {
      user.gender = '';
      await user.save();
      console.log("User saved successfully with empty gender!");
    } catch (e) {
      console.error("Save error:", e.message);
    }
  }
  mongoose.disconnect();
}
run();
