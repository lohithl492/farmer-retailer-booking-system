const express = require('express');
const jwt = require('jsonwebtoken');
const User = require('../models/user');
const router = express.Router();

console.log('Auth routes initializing...');

// OTP storage (in production, use Redis)
const otpStore = {};
const otpTimestamps = {};
const OTP_EXPIRY = 5 * 60 * 1000; // 5 minutes

// ==================== OTP GENERATION ====================

// Generate OTP
router.post('/send-otp', async (req, res) => {
  try {
    const { phone, userType } = req.body;

    console.log('Sending OTP for:', phone, 'Type:', userType);

    if (!phone) {
      return res.status(400).json({ success: false, message: 'Phone number required' });
    }

    // Check if OTP was recently sent (prevent spam)
// Check if OTP was recently sent (prevent spam)
if (otpTimestamps[phone] && Date.now() - otpTimestamps[phone] < 30000) {
  console.log('OTP request blocked: Too soon');
  return res.status(400).json({ 
    success: false, 
    message: 'Please wait 30 seconds before requesting another OTP' 
  });
}

    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    otpStore[phone] = otp;
    otpTimestamps[phone] = Date.now();

    console.log(`📱 OTP for ${phone}: ${otp}`);

    // Remove OTP after expiry
    setTimeout(() => {
      delete otpStore[phone];
      delete otpTimestamps[phone];
    }, OTP_EXPIRY);

    res.json({ 
      success: true, 
      message: 'OTP sent successfully',
      otp: otp // Remove in production
    });
  } catch (error) {
    console.error('Error sending OTP:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// ==================== FARMER AUTHENTICATION ====================

// Register Farmer
router.post('/register-farmer', async (req, res) => {
  try {
    const { name, phone, otp, location } = req.body;

    console.log('Registering farmer:', { name, phone, location });

    if (!name || !phone || !otp || !location) {
      return res.status(400).json({ success: false, message: 'All fields required' });
    }

    if (otpStore[phone] !== otp) {
      return res.status(400).json({ success: false, message: 'Invalid or expired OTP' });
    }

    const existingUser = await User.findOne({ phone, userType: 'farmer' });
    if (existingUser) {
      return res.status(400).json({ success: false, message: 'Phone already registered' });
    }

    const farmer = new User({
      userType: 'farmer',
      name,
      phone,
      password: Math.random().toString(36).slice(-8),
      location,
      isApproved: false
    });

    await farmer.save();
    console.log('Farmer registered:', farmer.name);
    
    delete otpStore[phone];

    const token = jwt.sign({ id: farmer._id, userType: 'farmer' }, process.env.JWT_SECRET || 'secret123', { expiresIn: '7d' });

    res.json({ 
      success: true, 
      message: 'Farmer registered successfully. Awaiting admin approval.',
      token, 
      farmer: {
        id: farmer._id,
        name: farmer.name,
        phone: farmer.phone,
        location: farmer.location,
        userType: 'farmer'
      }
    });
  } catch (error) {
    console.error('Error registering farmer:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// Login Farmer
router.post('/login-farmer', async (req, res) => {
  try {
    const { phone, otp } = req.body;

    console.log('Farmer login attempt:', phone);

    if (!phone || !otp) {
      return res.status(400).json({ success: false, message: 'Phone and OTP required' });
    }

    if (otpStore[phone] !== otp) {
      return res.status(400).json({ success: false, message: 'Invalid or expired OTP' });
    }

    const farmer = await User.findOne({ phone, userType: 'farmer' });
    if (!farmer) {
      return res.status(400).json({ success: false, message: 'Farmer not found' });
    }

    if (!farmer.isApproved) {
      return res.status(400).json({ success: false, message: 'Your account is pending admin approval' });
    }

    const token = jwt.sign({ id: farmer._id, userType: 'farmer' }, process.env.JWT_SECRET || 'secret123', { expiresIn: '7d' });
    delete otpStore[phone];

    console.log('Farmer logged in:', farmer.name);

    res.json({ 
      success: true, 
      message: 'Login successful',
      token, 
      farmer: {
        id: farmer._id,
        name: farmer.name,
        phone: farmer.phone,
        location: farmer.location,
        userType: 'farmer'
      }
    });
  } catch (error) {
    console.error('Error logging in farmer:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// ==================== RETAILER AUTHENTICATION ====================

// Register Retailer
router.post('/register-retailer', async (req, res) => {
  try {
    const { name, phone, email, password } = req.body;

    console.log('Registering retailer:', { name, phone, email });

    if (!name || !phone || !email || !password) {
      return res.status(400).json({ success: false, message: 'All fields required' });
    }

    const existingUser = await User.findOne({ 
      $or: [
        { phone, userType: 'retailer' }, 
        { email, userType: 'retailer' }
      ] 
    });
    
    if (existingUser) {
      return res.status(400).json({ success: false, message: 'User already exists' });
    }

    const retailer = new User({
      userType: 'retailer',
      name,
      phone,
      email,
      password,
      isApproved: false
    });

    await retailer.save();
    console.log('Retailer registered:', retailer.name);

    const token = jwt.sign({ id: retailer._id, userType: 'retailer' }, process.env.JWT_SECRET || 'secret123', { expiresIn: '7d' });

    res.json({ 
      success: true, 
      message: 'Retailer registered successfully. Awaiting admin approval.',
      token, 
      retailer: {
        id: retailer._id,
        name: retailer.name,
        phone: retailer.phone,
        email: retailer.email,
        userType: 'retailer'
      }
    });
  } catch (error) {
    console.error('Error registering retailer:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// Login Retailer
router.post('/login-retailer', async (req, res) => {
  try {
    const { email, password } = req.body;

    console.log('Retailer login attempt:', email);

    if (!email || !password) {
      return res.status(400).json({ success: false, message: 'Email and password required' });
    }

    const retailer = await User.findOne({ email, userType: 'retailer' });
    if (!retailer) {
      return res.status(400).json({ success: false, message: 'User not found' });
    }

    const isPasswordValid = await retailer.comparePassword(password);
    if (!isPasswordValid) {
      return res.status(400).json({ success: false, message: 'Invalid password' });
    }

    if (!retailer.isApproved) {
      return res.status(400).json({ success: false, message: 'Your account is pending admin approval' });
    }

    const token = jwt.sign({ id: retailer._id, userType: 'retailer' }, process.env.JWT_SECRET || 'secret123', { expiresIn: '7d' });

    console.log('Retailer logged in:', retailer.name);

    res.json({ 
      success: true, 
      message: 'Login successful',
      token, 
      retailer: {
        id: retailer._id,
        name: retailer.name,
        phone: retailer.phone,
        email: retailer.email,
        userType: 'retailer'
      }
    });
  } catch (error) {
    console.error('Error logging in retailer:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// ==================== ADMIN AUTHENTICATION ====================

// Admin Login
router.post('/login-admin', async (req, res) => {
  try {
    const { email, password } = req.body;

    console.log('Admin login attempt:', email);

    const ADMIN_EMAIL = 'farmfrdbs@123';
    const ADMIN_PASSWORD = 'frdbs123';

    if (email !== ADMIN_EMAIL || password !== ADMIN_PASSWORD) {
      return res.status(400).json({ success: false, message: 'Invalid admin credentials' });
    }

    const token = jwt.sign({ isAdmin: true }, process.env.JWT_SECRET || 'secret123', { expiresIn: '7d' });

    console.log('Admin logged in');

    res.json({ 
      success: true, 
      message: 'Admin login successful',
      token,
      admin: {
        email: ADMIN_EMAIL,
        userType: 'admin'
      }
    });
  } catch (error) {
    console.error('Error logging in admin:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router;