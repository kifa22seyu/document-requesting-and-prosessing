const express = require('express');
const router = express.Router();
const User = require('../models/User');
const { check, validationResult } = require('express-validator');
const validator = require('validator');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

// JWT Secret from environment variables
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-here';
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '7d';

// Enhanced validation middleware
const validateRegister = [
  check('name')
    .trim()
    .notEmpty().withMessage('Name is required')
    .custom((value, { req }) => {
      if (!req.body.userType) return true;
      const maxLength = req.body.userType === 'company' ? 100 : 50;
      const errorMsg = req.body.userType === 'company' 
        ? 'Company name must be ≤100 characters' 
        : 'Full name must be ≤50 characters';
      
      if (value.length > maxLength) throw new Error(errorMsg);
      return true;
    }),
  
  check('email')
    .trim()
    .notEmpty().withMessage('Email is required')
    .isEmail().withMessage('Invalid email format')
    .normalizeEmail()
    .custom(async (email) => {
      const existingUser = await User.findOne({ email: { $regex: new RegExp(`^${email}$`, 'i') } });
      if (existingUser) throw new Error('Email already registered');
      return true;
    }),
    
  check('password')
    .notEmpty().withMessage('Password is required')
    .isLength({ min: 6 }).withMessage('Password must be ≥6 characters')
    .custom((value, { req }) => {
      if (value !== req.body.confirmPassword) throw new Error('Passwords do not match');
      return true;
    }),
    
  check('userType')
    .notEmpty().withMessage('User type is required')
    .isIn(['alumni', 'company']).withMessage('Must be "alumni" or "company"')
];

// Registration Route
router.post('/register', validateRegister, async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      message: 'Validation failed',
      errors: errors.array().map(err => err.msg)
    });
  }

  const { name, email, password, userType } = req.body;

  try {
    const userData = {
      name,
      email: email.toLowerCase(),
      password,
      userType
    };

    const newUser = await User.create(userData);

    // Generate JWT token
    const token = jwt.sign(
      { id: newUser._id, userType: newUser.userType },
      JWT_SECRET,
      { expiresIn: JWT_EXPIRES_IN }
    );

    // Secure user object for response
    const userResponse = {
      _id: newUser._id,
      name: newUser.name,
      email: newUser.email,
      userType: newUser.userType,
      token
    };

    res.status(201).json({
      success: true,
      message: 'Registration successful',
      data: userResponse
    });

  } catch (error) {
    console.error('Registration error:', error);
    
    let errorMessage = 'Registration failed. Please try again.';
    if (error.code === 11000) errorMessage = 'Email already exists';

    res.status(500).json({
      success: false,
      message: errorMessage,
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// Login Route
router.post('/login', [
  check('email')
    .trim()
    .notEmpty().withMessage('Email is required')
    .isEmail().withMessage('Invalid email format')
    .normalizeEmail(),
    
  check('password')
    .notEmpty().withMessage('Password is required')
], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      message: 'Validation failed',
      errors: errors.array().map(err => err.msg)
    });
  }

  const { email, password } = req.body;

  try {
    const user = await User.findOne({ 
      email: { $regex: new RegExp(`^${email}$`, 'i') } 
    }).select('+password +active');

    if (!user || !(await user.correctPassword(password, user.password))) {
      return res.status(401).json({
        success: false,
        message: 'Incorrect email or password'
      });
    }

    if (!user.active) {
      return res.status(403).json({
        success: false,
        message: 'Account is deactivated. Please contact support.'
      });
    }

    // Update last login and generate token
    user.lastLogin = Date.now();
    await user.save({ validateBeforeSave: false });

    const token = jwt.sign(
      { id: user._id, userType: user.userType },
      JWT_SECRET,
      { expiresIn: JWT_EXPIRES_IN }
    );

    // Secure user object for response
    const userResponse = {
      _id: user._id,
      name: user.name,
      email: user.email,
      userType: user.userType,
      token
    };

    res.status(200).json({
      success: true,
      message: 'Login successful',
      data: userResponse
    });

  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error during login',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// Profile Completion Route (for later use)
router.put('/complete-profile', [
  // Add your profile completion validation here
], async (req, res) => {
  // Profile completion logic here
});

module.exports = router;