// models/StudentInformation.js
const mongoose = require("mongoose");

const studentInformationSchema = new mongoose.Schema({
  // --- NEW: Link to the User and ensure uniqueness ---
  userId: {
    type: mongoose.Schema.Types.ObjectId, // Reference to the User's _id
    ref: 'User',                           // Links to your User model
    required: [true, 'User ID is required for student information.'], // Mandatory link
    unique: true,                          // << CORE CHANGE: Ensures only one record per user
    index: true,                           // Improves query performance for checking existence
  },
  // --- END NEW ---

  fullName: { type: String, required: true },
  idNo: { type: String, required: true },
  program: { type: String, required: true },
  department: { type: String, required: true },
  graduationYear: { type: String, required: true },
  isEnrolled: { type: Boolean, required: true },
  classYear: { type: String }, // Only relevant if isEnrolled is true

  // These might belong in a separate 'Request' model later
  selectedDocuments: {
    type: [String],
    default: [], // Good practice to default arrays
  },
  totalFee: {
    type: Number,
    default: 0, // Good practice to default numbers
  },
  createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model("StudentInformation", studentInformationSchema);