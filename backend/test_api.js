const axios = require('axios');
const mongoose = require('mongoose');
require('dotenv').config({ path: './.env' });
const User = require('./models/User');
const jwt = require('jsonwebtoken');

async function run() {
  await mongoose.connect(process.env.MONGO_URI);
  const user = await User.findOne({ email: 'deepak72529@gmail.com' });
  
  if (user) {
    const token = jwt.sign(
      { id: user._id, email: user.email, role: user.role }, 
      process.env.JWT_SECRET || 'secretkey', 
      { expiresIn: '7d' }
    );
    
    try {
      const res = await axios.put('http://localhost:5000/api/users/profile', {
        name: 'aaryan',
        email: 'deepak72529@gmail.com',
        mobile: '8521101284',
        gender: ''
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      console.log("Success:", res.data);
    } catch (err) {
      console.error("API Error:", err.response?.data || err.message);
    }
  }
  mongoose.disconnect();
}
run();
