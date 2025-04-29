const User = require('../models/User');
const mongoose = require('mongoose');
// Removed bcrypt require here, as hashing is fully handled by the model's pre-save hook.

// Get allowed types directly from the schema's enum definition
const ALLOWED_USER_TYPES = User.schema.path('userType').enumValues; // ['alumni', 'company']

// Helper function for handling validation errors
const handleValidationError = (err, res) => {
  // Extract user-friendly messages from Mongoose validation errors
  const messages = Object.values(err.errors).map(val => val.message);
  // Use the first message or a generic one
  const message = messages.length > 0 ? messages.join('. ') : 'Validation failed. Please check your input.';
  return res.status(400).json({ success: false, message: message });
};

// @desc    Get all users (respects 'active' filter from schema middleware)
// @route   GET /api/users
// @access  Private/Admin
const getUsers = async (req, res) => {
  try {
    // .select('-password') is still needed as 'select: false' only applies by default
    // The 'active' filter is applied automatically by the pre-find hook in User.js
    const users = await User.find({}).select('-password').sort({ createdAt: -1 });
    res.status(200).json(users); // Send array directly as expected by frontend
  } catch (err) {
    console.error("Get Users Error:", err);
    res.status(500).json({ success: false, message: 'Server Error fetching users' });
  }
};

// @desc    Create a user (Admin action)
// @route   POST /api/users
// @access  Private/Admin
const createUser = async (req, res) => {
  const { name, email, password, userType } = req.body;

  // --- Minimal Pre-validation (Optional but good for UX) ---
  if (!password || password.length < 6) {
      // Provide specific feedback before hitting Mongoose validation
      return res.status(400).json({ success: false, message: 'Password is required and must be at least 6 characters long' });
  }
  if (!userType || !ALLOWED_USER_TYPES.includes(userType)) {
     // Provide specific feedback for userType
     return res.status(400).json({ success: false, message: `User type is required and must be one of: ${ALLOWED_USER_TYPES.join(', ')}` });
  }
  // --- End Pre-validation ---

  try {
    // Check if user exists by email (Mongoose unique index also handles this, but this gives a clearer message)
    const existingUser = await User.findOne({ email: email.toLowerCase() }); // Ensure check is case-insensitive
    if (existingUser) {
      return res.status(400).json({ success: false, message: 'User with this email already exists' });
    }

    // Create user instance - Mongoose will validate required fields (name, email) on save
    // Password hashing is handled by the pre-save hook in User.js
    const user = new User({
      name,
      email,
      password, // Pass plain text password
      userType
    });

    // Save triggers Mongoose validation and pre-save hooks (hashing)
    await user.save();

    // Prepare response object using .toObject() and remove password
    const userResponse = user.toObject();
    delete userResponse.password; // Even though select:false, it's on the instance after save

    res.status(201).json(userResponse); // Send new user object directly

  } catch (err) {
    console.error("Create User Error:", err);
     if (err.name === 'ValidationError') {
        // Use helper to format Mongoose validation errors
        return handleValidationError(err, res);
     }
     // Handle potential duplicate email errors if the initial check somehow missed (race condition, etc.)
     if (err.code === 11000 && err.keyPattern && err.keyPattern.email) {
        return res.status(400).json({ success: false, message: 'User with this email already exists.' });
     }
    res.status(500).json({ success: false, message: 'Server Error creating user' });
  }
};

// @desc    Update a user (Admin action)
// @route   PUT /api/users/:id
// @access  Private/Admin
const updateUser = async (req, res) => {
  const { name, email, password, userType } = req.body;
  const userId = req.params.id;

  if (!mongoose.Types.ObjectId.isValid(userId)) {
     return res.status(400).json({ success: false, message: 'Invalid user ID format' });
  }

  // --- Minimal Pre-validation for provided fields ---
  if (password && password.length < 6) {
      return res.status(400).json({ success: false, message: 'New password must be at least 6 characters long' });
  }
  if (userType && !ALLOWED_USER_TYPES.includes(userType)) {
     return res.status(400).json({ success: false, message: `Invalid userType. Must be one of: ${ALLOWED_USER_TYPES.join(', ')}` });
  }
  // --- End Pre-validation ---

  try {
    // Fetch the user - needed to trigger 'save' hooks for password hashing/passwordChangedAt
    // Use .select('+password') if you need to compare old/new passwords (not needed here)
    let user = await User.findById(userId); //.select('+password');
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    // Update fields selectively IF they are provided in the request body
    if (name) user.name = name;
    if (email) user.email = email.toLowerCase(); // Ensure email is lowercase
    if (userType) user.userType = userType;

    // Update password ONLY if it's provided (pre-save hook will hash it)
    if (password) {
        user.password = password; // Assign plain text, pre-save hook handles hashing
        // The pre-save hook also updates passwordChangedAt
        console.log(`Password marked for update for user ${userId}`);
    }

    // Save the updated user document (triggers validation and pre-save hooks)
    await user.save();

    // Prepare response object
    const userResponse = user.toObject();
    delete userResponse.password;

    res.status(200).json(userResponse); // Send updated user object directly

  } catch (err) {
    console.error("Update User Error:", err);
     if (err.name === 'ValidationError') {
        return handleValidationError(err, res);
     }
     // Handle duplicate email error during update
     if (err.code === 11000 && err.keyPattern && err.keyPattern.email) {
         return res.status(400).json({ success: false, message: 'This email address is already in use by another account.' });
     }
    res.status(500).json({ success: false, message: 'Server Error updating user' });
  }
};

// @desc    Delete a user (Admin action) - Considers 'active' flag conceptually
// @route   DELETE /api/users/:id
// @access  Private/Admin
const deleteUser = async (req, res) => {
  const userId = req.params.id;

  if (!mongoose.Types.ObjectId.isValid(userId)) {
     return res.status(400).json({ success: false, message: 'Invalid user ID format' });
  }

  try {
    // findByIdAndDelete bypasses the 'active' filter in pre-find hook, which is usually desired for hard delete.
    // If you wanted a "soft delete" (setting active: false), you'd use findByIdAndUpdate.
    const deletedUser = await User.findByIdAndDelete(userId);

    if (!deletedUser) {
      // This could mean the user ID was valid format but didn't exist,
      // or potentially the user was already inactive if pre-find hook *was* applied (which it isn't for findByIdAndDelete)
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    // Respond based on frontend expectation
    res.status(200).json({ success: true, message: 'User deleted successfully' });

  } catch (err) {
    console.error("Delete User Error:", err);
    res.status(500).json({ success: false, message: 'Server Error deleting user' });
  }
};

module.exports = {
  getUsers,
  createUser,
  updateUser,
  deleteUser
};