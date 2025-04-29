const User = require('../models/User'); // Verify path is correct
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt'); // Use bcrypt consistently
const { validationResult } = require('express-validator');

// --- Token Generation ---
// Include role in the token payload if it exists
const generateToken = (userId, userType, role = null) => {
  const payload = {
      userId,
      userType,
      iss: 'your-app-name',  // Use your actual app name
      aud: 'your-app-client' // Use your actual client ID
  };
  if (role) { // Add role conditionally
      payload.role = role;
  }
  console.log("Generating token with payload:", payload); // Debugging
  return jwt.sign(
    payload,
    process.env.JWT_SECRET,
    {
      expiresIn: process.env.JWT_EXPIRES_IN || '1h',
      algorithm: 'HS256'
    }
  );
};

// --- Register User ---
// CORRECTED: No manual password hashing here
exports.register = async (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ success: false, message: 'Validation failed', errors: errors.array() });
  }

  const { name, email, password, userType } = req.body;

  try {
    const existingUser = await User.findOne({ email: { $regex: new RegExp(`^${email}$`, 'i') } });
    if (existingUser) {
      return res.status(409).json({ success: false, message: 'Email address is already registered.' });
    }

    // Create user instance with PLAIN password
    const user = new User({
      name,
      email: email.toLowerCase(),
      password: password, // Pass plain password - pre('save') hook in User model MUST handle hashing
      userType,
      role: (userType === 'alumni' || userType === 'company') ? 'user' : undefined // Assign default 'user' role? Adjust if needed
      // Ensure 'active' and 'isVerified' default correctly in your schema
    });

    // Mongoose pre('save') hook handles hashing now
    await user.save();
    console.log(`User ${user.email} saved successfully.`); // Debugging

    // Generate token (include role)
    const token = generateToken(user._id, user.userType, user.role);

    // Prepare response (exclude sensitive data)
    const userResponse = {
      userId: user._id,
      name: user.name,
      email: user.email,
      userType: user.userType,
      role: user.role,
      createdAt: user.createdAt
    };

    res.status(201).json({
      success: true,
      message: 'User registered successfully',
      token,
      user: userResponse
    });

  } catch (error) {
    console.error('Registration Error:', error);
    let statusCode = 500;
    let errorMessage = 'Registration failed due to a server error.';
    if (error.name === 'ValidationError') {
        statusCode = 400;
        errorMessage = Object.values(error.errors).map(err => err.message).join(', ');
    }
    res.status(statusCode).json({
      success: false,
      message: errorMessage,
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// --- Login User ---
// This function handles authentication for ALL user types
exports.login = async (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ success: false, message: 'Validation failed', errors: errors.array() });
  }

  const { email, password } = req.body;

  try {
    // Find user, select password and active status explicitly
    const user = await User.findOne({
      email: { $regex: new RegExp(`^${email}$`, 'i') }
    }).select('+password +active +role'); // Select role as well

    // Check user existence
    if (!user) {
      console.log(`Login attempt failed: User not found for email ${email}`);
      return res.status(401).json({ success: false, message: 'Invalid credentials' });
    }

    // Check if account is active
    if (!user.active) {
       console.log(`Login attempt failed: Account deactivated for email ${email}`);
      return res.status(403).json({ success: false, message: 'Account is deactivated. Please contact support.' });
    }

    // Compare passwords using bcrypt
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
       console.log(`Login attempt failed: Invalid password for email ${email}`);
      return res.status(401).json({ success: false, message: 'Invalid credentials' });
    }

    // --- Login Successful ---
    console.log(`Login successful for ${email}`);

    // Update last login time (optional)
    try {
        user.lastLogin = Date.now();
        await user.save({ validateBeforeSave: false });
    } catch (saveError) {
        console.error(`Error updating last login for user ${user.email}:`, saveError);
    }

    // Generate token (include role)
    const token = generateToken(user._id, user.userType, user.role);

    // Prepare response object (include role)
    const userResponse = {
      userId: user._id,
      name: user.name,
      email: user.email,
      userType: user.userType,
      role: user.role, // Crucial for frontend redirection logic
      lastLogin: user.lastLogin
    };

    // Send success response
    res.status(200).json({
      success: true,
      message: 'Login successful',
      token,
      user: userResponse
    });

  } catch (error) {
    console.error('Login Error:', error);
    res.status(500).json({
      success: false,
      message: 'Login failed due to a server error.',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};


// --- Token Verification Middleware ---
// No changes needed here, but ensure it attaches role if present in token
exports.verifyToken = async (req, res, next) => {
  let token;
  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
      token = req.headers.authorization.split(' ')[1];
  }

  if (!token) {
    return res.status(401).json({ success: false, message: 'Not authorized, no token provided.' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    console.log("Decoded Token:", decoded); // Debugging

    // Attach decoded info to request
    req.userId = decoded.userId;
    req.userType = decoded.userType;
    req.userRole = decoded.role; // Make sure role is attached

    // Optional: Fetch fresh user data if needed
    // req.user = await User.findById(decoded.userId).select('-password');
    // if (!req.user) throw new Error('User not found');

    next();

  } catch (error) {
    console.error('Token verification error:', error.name, error.message);
    let message = 'Not authorized, token failed.';
    let statusCode = 401;
    if (error.name === 'TokenExpiredError') {
      message = 'Your session has expired. Please login again.';
    } else if (error.name === 'JsonWebTokenError') {
      message = 'Invalid token signature. Please login again.';
    } else {
        message = 'Authorization failed.';
        statusCode = 403; // Or stick with 401
    }
    res.status(statusCode).json({ success: false, message });
  }
};