const express = require('express');
const router = express.Router();
const { updateProfile, addAddress, updateAddress, deleteAddress } = require('../controllers/userController');
const auth = require('../middleware/authMiddleware');

// User Profile
router.put('/profile', auth, updateProfile);

// Address Management
router.post('/addresses', auth, addAddress);
router.put('/addresses/:id', auth, updateAddress);
router.delete('/addresses/:id', auth, deleteAddress);

module.exports = router;
