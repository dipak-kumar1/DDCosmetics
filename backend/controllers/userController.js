const User = require('../models/User');

// @desc    Update user profile
// @route   PUT /api/users/profile
// @access  Private
exports.updateProfile = async (req, res) => {
  try {
    const { name, mobile, gender, email } = req.body;
    
    // Check if email is being updated and if it's already taken
    if (email) {
      const existingUser = await User.findOne({ email });
      if (existingUser && existingUser._id.toString() !== req.user.id) {
        return res.status(400).json({ message: 'Email already in use' });
      }
    }

    const user = await User.findById(req.user.id);

    if (user) {
      user.name = name || user.name;
      if (mobile !== undefined) user.mobile = mobile;
      if (gender) user.gender = gender;
      if (email) user.email = email;

      const updatedUser = await user.save();

      res.json({
        _id: updatedUser._id,
        name: updatedUser.name,
        email: updatedUser.email,
        mobile: updatedUser.mobile,
        gender: updatedUser.gender,
        role: updatedUser.role,
        addresses: updatedUser.addresses,
        token: req.token // Ideally, we don't need to send token back, but for simplicity
      });
    } else {
      res.status(404).json({ message: 'User not found' });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Add new address
// @route   POST /api/users/addresses
// @access  Private
exports.addAddress = async (req, res) => {
  try {
    const { name, phone, pincode, locality, address, city, state, landmark, alternatePhone, type } = req.body;
    
    const user = await User.findById(req.user.id);
    
    if (user) {
      const newAddress = {
        name,
        phone,
        pincode,
        locality,
        address,
        city,
        state,
        landmark,
        alternatePhone,
        type
      };
      
      user.addresses.push(newAddress);
      await user.save();
      
      res.json(user.addresses);
    } else {
      res.status(404).json({ message: 'User not found' });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Update address
// @route   PUT /api/users/addresses/:id
// @access  Private
exports.updateAddress = async (req, res) => {
  try {
    const { name, phone, pincode, locality, address, city, state, landmark, alternatePhone, type } = req.body;
    
    const user = await User.findById(req.user.id);
    
    if (user) {
      const addressIndex = user.addresses.findIndex(addr => addr._id.toString() === req.params.id);
      
      if (addressIndex !== -1) {
        user.addresses[addressIndex] = {
          ...user.addresses[addressIndex].toObject(), // Keep existing fields like _id
          name,
          phone,
          pincode,
          locality,
          address,
          city,
          state,
          landmark,
          alternatePhone,
          type
        };
        
        await user.save();
        res.json(user.addresses);
      } else {
        res.status(404).json({ message: 'Address not found' });
      }
    } else {
      res.status(404).json({ message: 'User not found' });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Delete address
// @route   DELETE /api/users/addresses/:id
// @access  Private
exports.deleteAddress = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    
    if (user) {
      user.addresses = user.addresses.filter(addr => addr._id.toString() !== req.params.id);
      await user.save();
      res.json(user.addresses);
    } else {
      res.status(404).json({ message: 'User not found' });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};
