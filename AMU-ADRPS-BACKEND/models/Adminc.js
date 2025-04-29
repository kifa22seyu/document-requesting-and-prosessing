// models/Adminc.js (or models/AdminRole.js)
const mongoose = require('mongoose');
const bcrypt = require('bcrypt');

const adminSchema = new mongoose.Schema({
  fullName: {
    type: String,
    required: [true, 'Full name is required'],
    trim: true,
  },
  role: {
    type: String,
    required: [true, 'Role is required'],
    enum: ['Finance', 'Team Association'], // Use enum for predefined roles
    default: 'Finance',
  },
  email: {
    type: String,
    required: [true, 'Email is required'],
    unique: true, // Ensure emails are unique
    lowercase: true,
    trim: true,
    match: [ // Basic email format validation
      /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/,
      'Please fill a valid email address',
    ],
  },
  password: {
    type: String,
    required: [true, 'Password is required'],
    minlength: [6, 'Password must be at least 6 characters long'],
    select: false, // Hide password field by default when querying admins
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

// --- Password Hashing Middleware ---
adminSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();
  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error);
  }
});

// --- Password Comparison Method ---
adminSchema.methods.comparePassword = async function (enteredPassword) {
    // Ensure 'this.password' exists before comparing. It might not if the query didn't select it.
    // However, the login route correctly uses .select('+password'), so this should be fine there.
    if (!this.password) {
        throw new Error('Password field not available for comparison.');
    }
    return await bcrypt.compare(enteredPassword, this.password);
};

// --- Export the model named 'AdminRole' ---
// The collection name in MongoDB will be 'adminroles' (lowercase, pluralized)
const AdminRole = mongoose.model('Adminrole', adminSchema);

module.exports = AdminRole; // <-- Exporting 'AdminRole'