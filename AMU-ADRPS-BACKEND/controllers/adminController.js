// controllers/adminController.js
const AdminRole = require('../models/Adminc'); // <-- Import the correct model name
const bcrypt = require('bcrypt');
const mongoose = require('mongoose'); // <-- Import mongoose at the top

// --- Helper function for error handling ---
const handleError = (res, error, message = 'An error occurred', statusCode = 500) => {
  console.error(message, error);
  const errorMessage = error?.message || message;
  return res.status(statusCode).json({ success: false, error: errorMessage });
};

// @desc    Get all admins (moderators)
// @route   GET /api/admins
// @access  Public (adjust as needed)
exports.getAllAdmins = async (req, res) => {
  try {
    // Use AdminRole consistently
    const admins = await AdminRole.find().sort({ createdAt: -1 });
    res.status(200).json(admins);
  } catch (error) {
    handleError(res, error, 'Failed to fetch admins');
  }
};

// @desc    Create a new admin (moderator)
// @route   POST /api/admins
// @access  Public (adjust as needed)
exports.createAdmin = async (req, res) => {
  const { fullName, role, email, password } = req.body;

  if (!fullName || !role || !email || !password) {
    return res.status(400).json({ success: false, error: 'Please provide all required fields' });
  }

  try {
    // Use AdminRole consistently
    const existingAdmin = await AdminRole.findOne({ email: email.toLowerCase() }); // Check lowercase email
    if (existingAdmin) {
      return res.status(400).json({ success: false, error: 'Admin with this email already exists' });
    }

    // Use AdminRole consistently
    const newAdmin = await AdminRole.create({
      fullName,
      role,
      email,
      password, // Hashing handled by pre-save hook
    });

    const adminResponse = newAdmin.toObject();
    delete adminResponse.password;

    res.status(201).json(adminResponse);

  } catch (error) {
      if (error.name === 'ValidationError') {
          const messages = Object.values(error.errors).map(val => val.message);
          return res.status(400).json({ success: false, error: messages.join(', ') });
      }
      // Handle potential duplicate key error during creation just in case
      if (error.code === 11000 && error.keyPattern && error.keyPattern.email) {
          return res.status(400).json({ success: false, error: 'Email address is already in use.' });
      }
      handleError(res, error, 'Failed to create admin');
  }
};

// @desc    Update an admin (moderator)
// @route   PUT /api/admins/:id
// @access  Public (adjust as needed)
exports.updateAdmin = async (req, res) => {
  const { id } = req.params;
  const { fullName, role, email, password } = req.body;

  // Use mongoose (imported at top)
  if (!mongoose.Types.ObjectId.isValid(id)) {
       return res.status(400).json({ success: false, error: 'Invalid admin ID format' });
   }

  try {
    // Use AdminRole consistently
    const admin = await AdminRole.findById(id);

    if (!admin) {
      return res.status(404).json({ success: false, error: 'Admin not found' });
    }

    // Prepare updates - allow undefined values to skip update
    if (fullName !== undefined) admin.fullName = fullName;
    if (role !== undefined) admin.role = role;
    if (email !== undefined) admin.email = email.toLowerCase(); // Ensure email updates are lowercase

    // Only update password if a new one is provided and meets criteria
    if (password) {
        if (password.length >= 6) {
            // No need to hash manually here if using admin.save() - pre-save hook will handle it
            admin.password = password; // Let the pre-save hook hash it
        } else {
            return res.status(400).json({ success: false, error: 'Password must be at least 6 characters long if provided' });
        }
    }
    // If password field is not in req.body or is null/empty string, it won't be modified due to the check above

    const updatedAdmin = await admin.save(); // Use save() to trigger validation and pre-save hooks

    const adminResponse = updatedAdmin.toObject();
    // Password should already be excluded due to `select: false` and pre-save hook,
    // but deleting explicitly after toObject() is safe.
    delete adminResponse.password;

    res.status(200).json(adminResponse);

  } catch (error) {
      if (error.code === 11000 && error.keyPattern && error.keyPattern.email) {
          return res.status(400).json({ success: false, error: 'Email address is already in use by another admin.' });
      }
       if (error.name === 'ValidationError') {
           const messages = Object.values(error.errors).map(val => val.message);
           return res.status(400).json({ success: false, error: messages.join(', ') });
       }
      handleError(res, error, `Failed to update admin with ID ${id}`);
  }
};

// @desc    Delete an admin (moderator)
// @route   DELETE /api/admins/:id
// @access  Public (adjust as needed)
exports.deleteAdmin = async (req, res) => {
  const { id } = req.params;

   // Use mongoose (imported at top)
   if (!mongoose.Types.ObjectId.isValid(id)) {
       return res.status(400).json({ success: false, error: 'Invalid admin ID format' });
   }

  try {
    // Use AdminRole consistently
    const admin = await AdminRole.findByIdAndDelete(id);

    if (!admin) {
      return res.status(404).json({ success: false, error: 'Admin not found' });
    }

    res.status(200).json({ success: true, message: 'Admin deleted successfully' });
  } catch (error) {
    handleError(res, error, `Failed to delete admin with ID ${id}`);
  }
};

// --- Removed duplicate mongoose import from here ---