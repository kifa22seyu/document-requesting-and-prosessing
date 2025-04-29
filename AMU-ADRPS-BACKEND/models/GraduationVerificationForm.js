// backend/models/GraduationVerificationForm.js
const mongoose = require("mongoose");

const GraduationVerificationFormSchema = new mongoose.Schema({
  // --- Link to the User (e.g., the Company User) who submitted ---
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User', // Make sure 'User' is your user model name
    required: [true, 'User ID is required for verification request.'],
    index: true,
    unique: true, // <<< IMPORTANT: Ensures only one request per submitting user
  },
  // --- Data being submitted for verification ---
  candidateName: {
    type: String,
    required: [true, "Candidate's name is required."],
    trim: true
  },
  universityName: {
    type: String,
    required: [true, 'University name is required.'],
    trim: true
  },
  departmentName: {
    type: String,
    required: [true, 'Department name is required.'],
    trim: true
  },
  graduationDate: {
    type: Date, // Store as Date for better querying/sorting
    required: [true, 'Graduation date is required.']
  },
  // --- Status Fields ---
  verifyGraduation: { type: Boolean, default: false }, // From form checkbox
  verifiedByAdmin: { type: Boolean, default: false }, // Status set by admin
  verificationStatus: { // More detailed status
      type: String,
      enum: ['Pending', 'Verified', 'Rejected', 'More Info Required'],
      default: 'Pending'
  },
  adminNotes: { // Optional: Notes from the admin
      type: String,
      trim: true
  }
}, { timestamps: true }); // Use built-in timestamps for createdAt/updatedAt

module.exports = mongoose.model("GraduationVerificationForm", GraduationVerificationFormSchema);