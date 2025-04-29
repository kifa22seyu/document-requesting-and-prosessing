const mongoose = require('mongoose');
// const bcrypt = require('bcryptjs'); // REMOVED - Using bcrypt instead
const bcrypt = require('bcrypt');     // ADDED - Use the native bcrypt library
const validator = require('validator');

const userSchema = new mongoose.Schema({
  // Basic information (from your form)
  name: {
    type: String,
    required: [true, 'Name is required'],
    trim: true,
    maxlength: [100, 'Name cannot exceed 100 characters']
  },
  email: {
    type: String,
    required: [true, 'Email is required'],
    unique: true,
    lowercase: true,
    validate: [validator.isEmail, 'Please provide a valid email'],
    trim: true,
    maxlength: [100, 'Email cannot exceed 100 characters']
  },
  password: {
    type: String,
    required: [true, 'Password is required'],
    minlength: [6, 'Password must be at least 6 characters'],
    select: false // Correctly hides password by default
  },
  userType: {
    type: String,
    required: [true, 'User type is required'],
    enum: {
      // Ensure these values EXACTLY match what frontend sends ('alumni', 'company')
      values: ['alumni', 'company'],
      message: 'User type must be either "alumni" or "company"'
    }
  },
  // Field for Admin/Moderator roles (if applicable, otherwise can be removed)
  role: {
      type: String,
      enum: ['user', 'admin', 'finance', 'team association'], // Add possible roles
      default: 'user' // Default role for alumni/company?
  },
  // Additional fields
  profilePicture: {
    type: String,
    default: 'default.jpg' // Consider a placeholder image URL if needed
  },
  isVerified: { // Important if you implement email verification
    type: Boolean,
    default: false
  },
  verificationToken: String,
  verificationTokenExpires: Date,
  passwordChangedAt: Date, // Tracks when password was last changed
  lastLogin: { // Added field to track last login (used in controller)
      type: Date
  },
  active: { // Used by login controller
    type: Boolean,
    default: true, // Assume users are active by default on registration
    select: false // Hide by default, but login controller selects it
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: { // Automatically updated by findOneAndUpdate hook
    type: Date,
    default: Date.now
  }
}, {
  // Schema options
  timestamps: false, // Manually handle createdAt/updatedAt or set to true and remove manual defaults/hooks
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// --- Middleware (Hooks) ---

// Combined pre('save') hook for password hashing and setting passwordChangedAt
userSchema.pre('save', async function(next) {
  // Only run this function if password was actually modified
  if (!this.isModified('password')) return next();

  // Hash the password with cost factor 12 (adjust as needed)
  // Ensure 'bcrypt' is required at the top
  this.password = await bcrypt.hash(this.password, 12);

  // If the document is not new (i.e., it's an update where password was changed),
  // set passwordChangedAt slightly in the past.
  if (!this.isNew) {
    this.passwordChangedAt = Date.now() - 1000; // 1 second ago to ensure token validity
  }

  // Remove passwordConfirm field if you were using it for validation
  // this.passwordConfirm = undefined;

  next();
});


// Update the updatedAt field before any 'findAndUpdate' type operation
// Useful for operations like user profile updates that don't use .save()
userSchema.pre('findOneAndUpdate', function(next) {
    // 'this' refers to the query object here
    this.set({ updatedAt: Date.now() });
    next();
});


// Query middleware to exclude inactive users by default for find operations
// Note: The login controller explicitly selects '+active', so it can find
// inactive users and then check the flag. This hook affects general queries.
userSchema.pre(/^find/, function(next) {
  // 'this' refers to the query object
  // Only apply if the query doesn't explicitly ask about 'active' status
  if (this.getOptions().includeInactive !== true && !this.getQuery().active) {
     this.find({ active: { $ne: false } });
  }
  next();
});


// --- Instance Methods ---

// Method to compare candidate password with the user's hashed password
userSchema.methods.correctPassword = async function(candidatePassword) {
    // 'this.password' refers to the hashed password of the instance
    // Ensure 'bcrypt' is required at the top
    // 'this.password' is available here even with `select: false` because
    // the login controller uses .select('+password') when fetching the user.
    return await bcrypt.compare(candidatePassword, this.password);
};

// Method to check if password was changed after a JWT token was issued
userSchema.methods.changedPasswordAfter = function(JWTTimestamp) {
  if (this.passwordChangedAt) {
    // Convert passwordChangedAt Date to timestamp (seconds)
    const changedTimestamp = parseInt(this.passwordChangedAt.getTime() / 1000, 10);
    // Check if the token was issued before the password change
    return JWTTimestamp < changedTimestamp;
  }
  // False means password never changed OR changed before token was issued
  return false;
};


// --- Model Creation ---
const User = mongoose.model('User', userSchema);

module.exports = User;