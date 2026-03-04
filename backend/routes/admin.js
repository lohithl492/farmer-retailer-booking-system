const express = require('express');
const router = express.Router();

// Import models only once
const User = require('../models/user');
const Crop = require('../models/crop');
const Booking = require('../models/Booking');

// Get all users (farmers and retailers)
router.get('/users', async (req, res) => {
  try {
    console.log('Getting all users...');
    const users = await User.find({ userType: { $ne: 'admin' } })
      .select('-password')
      .sort({ createdAt: -1 });
    
    console.log('Found users:', users.length);
    res.json({ success: true, users });
  } catch (error) {
    console.error('Error getting users:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// Get farmers only
router.get('/farmers', async (req, res) => {
  try {
    const farmers = await User.find({ userType: 'farmer' })
      .select('-password')
      .sort({ createdAt: -1 });
    
    res.json({ success: true, farmers });
  } catch (error) {
    console.error('Error getting farmers:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// Get retailers only
router.get('/retailers', async (req, res) => {
  try {
    const retailers = await User.find({ userType: 'retailer' })
      .select('-password')
      .sort({ createdAt: -1 });
    
    res.json({ success: true, retailers });
  } catch (error) {
    console.error('Error getting retailers:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// Get pending approvals
router.get('/pending-approvals', async (req, res) => {
  try {
    console.log('Getting pending approvals...');
    const pendingUsers = await User.find({ isApproved: false })
      .select('-password')
      .sort({ createdAt: -1 });
    
    console.log('Found pending users:', pendingUsers.length);
    res.json({ success: true, pendingUsers });
  } catch (error) {
    console.error('Error getting pending approvals:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// Approve user
router.post('/approve-user/:userId', async (req, res) => {
  try {
    console.log('Approving user:', req.params.userId);
    const user = await User.findByIdAndUpdate(
      req.params.userId,
      { isApproved: true },
      { new: true }
    ).select('-password');

    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    console.log('User approved:', user.name);
    res.json({ 
      success: true, 
      message: `${user.name} approved successfully`,
      user 
    });
  } catch (error) {
    console.error('Error approving user:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// Reject user
router.post('/reject-user/:userId', async (req, res) => {
  try {
    console.log('Rejecting user:', req.params.userId);
    const user = await User.findByIdAndDelete(req.params.userId);

    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    console.log('User rejected:', user.name);
    res.json({ 
      success: true, 
      message: `${user.name} rejected and removed`
    });
  } catch (error) {
    console.error('Error rejecting user:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// Get app statistics
router.get('/stats', async (req, res) => {
  try {
    console.log('Getting statistics...');
    const totalFarmers = await User.countDocuments({ userType: 'farmer', isApproved: true });
    const totalRetailers = await User.countDocuments({ userType: 'retailer', isApproved: true });
    const pendingApprovals = await User.countDocuments({ isApproved: false });
    const totalCrops = await Crop.countDocuments();
    const totalBookings = await Booking.countDocuments();
    const completedBookings = await Booking.countDocuments({ status: 'completed' });

    const stats = {
      totalFarmers,
      totalRetailers,
      pendingApprovals,
      totalCrops,
      totalBookings,
      completedBookings
    };

    console.log('Statistics:', stats);
    res.json({ success: true, stats });
  } catch (error) {
    console.error('Error getting statistics:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// Get all crops
router.get('/crops', async (req, res) => {
  try {
    const crops = await Crop.find()
      .populate('farmerId', 'name phone location')
      .sort({ createdAt: -1 });
    
    res.json({ success: true, crops });
  } catch (error) {
    console.error('Error getting crops:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// Get all bookings
router.get('/bookings', async (req, res) => {
  try {
    const bookings = await Booking.find()
      .populate('cropId')
      .populate('farmerId', 'name phone')
      .populate('retailerId', 'name phone email')
      .sort({ createdAt: -1 });
    
    res.json({ success: true, bookings });
  } catch (error) {
    console.error('Error getting bookings:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// Delete user
router.delete('/delete-user/:userId', async (req, res) => {
  try {
    const user = await User.findByIdAndDelete(req.params.userId);

    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    res.json({ success: true, message: 'User deleted successfully' });
  } catch (error) {
    console.error('Error deleting user:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router;