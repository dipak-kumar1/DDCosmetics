const mongoose = require('mongoose');
require('dotenv').config({ path: './.env' });
const User = require('./models/User');

async function run() {
  await mongoose.connect(process.env.MONGO_URI);
  const user = await User.findOne({ email: 'aryan123@gmail.com' });
  console.log(user);
  mongoose.disconnect();
}
run();
