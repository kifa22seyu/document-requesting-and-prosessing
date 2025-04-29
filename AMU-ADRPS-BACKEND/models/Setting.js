const mongoose = require('mongoose');
const path = require('path');

const settingSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Name is required'],
    trim: true,
    minlength: [2, 'Name must be at least 2 characters'],
    maxlength: [50, 'Name cannot exceed 50 characters'],
    default: "Admin User"
  },
  email: {
    type: String,
    required: [true, 'Email is required'],
    unique: true,
    trim: true,
    lowercase: true,
    match: [/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/, 'Please fill a valid email address'],
    default: "admin@example.com"
  },
  role: {
    type: String,
    enum: {
      values: ['Administrator', 'Editor', 'Viewer'],
      message: '{VALUE} is not a valid role'
    },
    default: "Administrator"
  },
  profileImage: {
    type: String,
    default: "/defaults/admin-default.png",
    set: function(image) {
      if (!image) return this.profileImage; // Keep existing if no new image
      
      // Handle different input types
      if (typeof image === 'string') {
        // From direct path input
        return image.startsWith('/') ? image : `/${image}`;
      } else if (image.path) {
        // From multer file object
        return path.join('/uploads', path.basename(image.path));
      }
      return image;
    }
  }
}, { 
  timestamps: true,
  toJSON: { 
    virtuals: true,
    transform: function(doc, ret) {
      // Remove version and internal fields from JSON output
      delete ret.__v;
      delete ret._id;
      return ret;
    }
  },
  toObject: { virtuals: true }
});

// Virtual for full image URL
settingSchema.virtual('imageUrl').get(function() {
  if (!this.profileImage) return null;
  
  // Handle different environments
  const baseUrl = process.env.BASE_URL || 'http://localhost:8000';
  return this.profileImage.startsWith('http') 
    ? this.profileImage 
    : `${baseUrl}${this.profileImage}`;
});

// Form-specific methods
settingSchema.statics.createFromForm = async function(formData) {
  const { name, email, role, profileImage } = formData;
  
  return this.create({
    name,
    email,
    role,
    profileImage: profileImage || undefined // Let default handle if empty
  });
};

settingSchema.methods.updateFromForm = async function(formData) {
  const { name, email, role, profileImage } = formData;
  
  this.name = name || this.name;
  this.email = email || this.email;
  this.role = role || this.role;
  
  if (profileImage) {
    this.profileImage = profileImage;
  }
  
  return this.save();
};

module.exports = mongoose.model('Setting', settingSchema);