// controllers/requestFormController.js
const RequestForm = require("../models/RequestForm");

// Save request form data
exports.saveRequestForm = async (req, res) => {
  try {
    // --- Get userId from authenticated request ---
    const userId = req.userId;
    if (!userId) {
      return res.status(401).json({ message: "Authentication required." });
    }
    // ---

    const { selectedItems, totalFee } = req.body;

    // --- Basic Validation (Matches updated model) ---
    if (!selectedItems || !Array.isArray(selectedItems) || selectedItems.length === 0) {
        return res.status(400).json({ message: "Please select at least one document." });
    }
    if (totalFee === undefined || typeof totalFee !== 'number' || totalFee < 0) {
        return res.status(400).json({ message: "Invalid or missing total fee." });
    }
    // ---

    // Create a new request form document, including userId
    const requestForm = new RequestForm({
      userId, // <<< Add userId here
      selectedItems,
      totalFee,
    });

    // Save to the database
    await requestForm.save();

    res.status(201).json({
        message: "Request form submitted successfully!",
        data: requestForm
    });

  } catch (error) {
    console.error("Error submitting request form:", error);

    // --- Handle Duplicate Key Error (User already submitted) ---
    if (error.code === 11000 && error.keyPattern && error.keyPattern.userId) {
         return res.status(409).json({ // 409 Conflict
            message: "An academic records request has already been submitted for this account.",
         });
    }
    // --- Handle Mongoose Validation Errors ---
    if (error.name === 'ValidationError') {
         return res.status(400).json({ message: error.message });
    }
    // --- Default Server Error ---
    res.status(500).json({
        message: "Error submitting request form",
        error: error.message
    });
  }
};

// --- NEW Controller function to check if a request exists ---
exports.checkExistingRequest = async (req, res) => {
    try {
        const userId = req.userId; // Get userId from authMiddleware
        if (!userId) {
            return res.status(401).json({ message: "Authentication required." });
        }

        // Find if ANY document exists for this userId. Only need the ID.
        const existingRequest = await RequestForm.findOne({ userId: userId }).select('_id').lean();

        // Return boolean status
        res.status(200).json({
            exists: !!existingRequest // true if found, false otherwise
        });

    } catch (error) {
        console.error("Error checking request form existence:", error);
        res.status(500).json({
            message: "Error checking submission status",
            error: error.message,
        });
    }
};
// --- END NEW function ---


// Get all request forms (optional)
exports.getAllRequestForms = async (req, res) => {
  try {
    // Consider adding authorization checks here (e.g., only admin/moderator)
    const requestForms = await RequestForm.find();
    res.status(200).json({ data: requestForms });
  } catch (error) {
     console.error("Error fetching request forms:", error);
    res.status(500).json({ message: "Error fetching request forms", error: error.message });
  }
};