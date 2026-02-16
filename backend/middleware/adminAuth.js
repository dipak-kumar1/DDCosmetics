const User = require('../models/User');

module.exports = async (req, res, next) => {
  try {
    // req.user is already set by authMiddleware
    if (!req.user) {
      return res.status(401).json({ message: 'Authorization denied' });
    }

    const user = await User.findById(req.user.id);
    
    if (!user) {
      return res.status(401).json({ message: 'User not found' });
    }

    if (user.role !== 'admin') {
      return res.status(403).json({ message: 'Access denied. Admin only.' });
    }

    next();
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};
