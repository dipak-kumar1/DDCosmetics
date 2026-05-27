const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('./models/User');
const dotenv = require('dotenv');

dotenv.config();

const createAdmin = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log('MongoDB Connected');

    const adminEmail = 'admin@ddcosmetics.com';
    const adminPassword = 'adminpassword123';

    let admin = await User.findOne({ email: adminEmail });

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(adminPassword, salt);

    if (admin) {
      console.log('Admin user found. Updating role and password...');
      admin.role = 'admin';
      admin.password = hashedPassword;
      await admin.save();
      console.log('Admin user updated successfully');
    } else {
      console.log('Creating new admin user...');
      admin = new User({
        name: 'Admin User',
        email: adminEmail,
        password: hashedPassword,
        role: 'admin',
        mobile: '1234567890',
        gender: 'Male'
      });
      await admin.save();
      console.log('Admin user created successfully');
    }

    console.log(`Email: ${adminEmail}`);
    console.log(`Password: ${adminPassword}`);

    mongoose.connection.close();
  } catch (err) {
    console.error(err);
    mongoose.connection.close();
  }
};

createAdmin();