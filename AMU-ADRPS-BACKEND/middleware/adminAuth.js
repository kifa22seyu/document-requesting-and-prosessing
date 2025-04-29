// File: middleware/adminAuth.js (Should already be like this)
const jwt = require('jsonwebtoken');
const User = require('../models/User'); // Make sure this path is correct

const protectAdmin = async (req, res, next) => {
  try {
    let token;
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
      token = req.headers.authorization.split(' ')[1];
    }

    if (!token) {
      return res.status(401).json({ message: 'Not authorized, no token' });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    // Make sure your User model includes 'Admin'/'Adminrole' or has a role field
    // This assumes a single User model with a 'role' field. Adjust if you have separate Admin models.
    const user = await User.findById(decoded.id).select('-password');

    if (!user) {
         return res.status(401).json({ message: 'User not found for this token' });
    }

    // IMPORTANT: Check the role based on your User schema
    if (user.role !== 'admin') { // Adjust 'admin' if your role name is different
      return res.status(401).json({ message: 'Not authorized as admin' });
    }

    req.user = user; // Attach user to request object
    next();
  } catch (error) {
    console.error("Admin Auth Error:", error); // Log the error
    res.status(401).json({ message: 'Not authorized, token failed or invalid' });
  }
};

module.exports = { protectAdmin };