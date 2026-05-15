const express = require('express');
const router = express.Router();
const User = require('../models/usersModel');
const { verifyToken } = require('../middlewares/auth');

// Get all professionals (for dropdown)
router.get('/professionals', verifyToken, async (req, res) => {
  try {
    const professionals = await User.find({ role: 'professional' }).select('name specialty _id');
    res.json({ success: true, professionals });
  } catch (error) {
    console.error('Error fetching professionals:', error);
    res.status(500).json({ message: 'Error fetching professionals' });
  }
});

module.exports = router;