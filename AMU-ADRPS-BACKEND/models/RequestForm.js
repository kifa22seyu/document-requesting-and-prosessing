// models/RequestForm.js
const mongoose = require("mongoose");

const requestFormSchema = new mongoose.Schema({
  // --- Link to the User and ensure uniqueness ---
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User', // Make sure 'User' is the name of your user model
    required: [true, 'User ID is required for the request.'],
    index: true,
    unique: true, // <<< IMPORTANT: Ensures only one request form per user
  },
  // --- Updated selectedItems ---
  selectedItems: {
     type: [String], // Array of selected document names (more standard)
     required: [true, 'At least one item must be selected.'],
     validate: [val => Array.isArray(val) && val.length > 0, 'Please select at least one document.'] // Ensure not empty
  },
  // --- Updated totalFee ---
  totalFee: {
    type: Number,
    required: true,
    min: [0, 'Total fee cannot be negative.'] // Validate minimum value
  },
  createdAt: { type: Date, default: Date.now }, // Timestamp
});

module.exports = mongoose.model("RequestForm", requestFormSchema);