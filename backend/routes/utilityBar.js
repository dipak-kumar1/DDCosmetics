const express = require('express');
const router = express.Router();
const UtilityBarItem = require('../models/UtilityBarItem');
const auth = require('../middleware/authMiddleware');
const adminAuth = require('../middleware/adminAuth');

// @route   GET /api/utility-bar
// @desc    Get all active utility bar items
// @access  Public
router.get('/', async (req, res) => {
  try {
    const items = await UtilityBarItem.find({ isActive: true }).sort({ order: 1 });
    res.json(items);
  } catch (err) {
    console.error('Error fetching utility bar items:', err);
    res.status(550).json({ message: 'Server error' });
  }
});

// @route   GET /api/utility-bar/admin
// @desc    Get all utility bar items (active & inactive)
// @access  Private/Admin
router.get('/admin', auth, adminAuth, async (req, res) => {
  try {
    const items = await UtilityBarItem.find({}).sort({ order: 1 });
    res.json(items);
  } catch (err) {
    console.error('Error fetching admin utility bar items:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   POST /api/utility-bar
// @desc    Create new utility bar item
// @access  Private/Admin
router.post('/', auth, adminAuth, async (req, res) => {
  const { label, icon, link, badge, isActive, order } = req.body;
  try {
    if (!label || !link) {
      return res.status(400).json({ message: 'Label and Link are required.' });
    }
    const newItem = new UtilityBarItem({
      label,
      icon,
      link,
      badge,
      isActive: isActive !== undefined ? isActive : true,
      order: order || 0
    });
    await newItem.save();
    res.status(201).json(newItem);
  } catch (err) {
    console.error('Error creating utility bar item:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   PUT /api/utility-bar/reorder
// @desc    Bulk reorder utility bar items
// @access  Private/Admin
router.put('/reorder', auth, adminAuth, async (req, res) => {
  const { items } = req.body; // Expected format: [{ id: "...", order: 1 }, ...]
  try {
    if (!Array.isArray(items)) {
      return res.status(400).json({ message: 'Invalid data format. Expected array of items.' });
    }
    for (const item of items) {
      await UtilityBarItem.findByIdAndUpdate(item.id, { order: item.order });
    }
    const updatedItems = await UtilityBarItem.find({}).sort({ order: 1 });
    res.json(updatedItems);
  } catch (err) {
    console.error('Error reordering utility bar items:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   PUT /api/utility-bar/:id
// @desc    Update utility bar item
// @access  Private/Admin
router.put('/:id', auth, adminAuth, async (req, res) => {
  const { label, icon, link, badge, isActive, order } = req.body;
  try {
    let item = await UtilityBarItem.findById(req.params.id);
    if (!item) {
      return res.status(404).json({ message: 'Item not found' });
    }
    
    item.label = label !== undefined ? label : item.label;
    item.icon = icon !== undefined ? icon : item.icon;
    item.link = link !== undefined ? link : item.link;
    item.badge = badge !== undefined ? badge : item.badge;
    item.isActive = isActive !== undefined ? isActive : item.isActive;
    item.order = order !== undefined ? order : item.order;

    await item.save();
    res.json(item);
  } catch (err) {
    console.error('Error updating utility bar item:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   DELETE /api/utility-bar/:id
// @desc    Delete utility bar item
// @access  Private/Admin
router.delete('/:id', auth, adminAuth, async (req, res) => {
  try {
    const item = await UtilityBarItem.findById(req.params.id);
    if (!item) {
      return res.status(404).json({ message: 'Item not found' });
    }
    await UtilityBarItem.findByIdAndDelete(req.params.id);
    res.json({ message: 'Item deleted successfully' });
  } catch (err) {
    console.error('Error deleting utility bar item:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
