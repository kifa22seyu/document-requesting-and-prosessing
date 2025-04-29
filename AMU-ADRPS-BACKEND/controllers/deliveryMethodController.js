// backend/controllers/deliveryMethodController.js
const DeliveryMethod = require("../models/DeliveryMethod");

// Save delivery method data
exports.saveDeliveryMethod = async (req, res) => {
  try {
    // --- Get userId from authenticated request ---
    const userId = req.userId;
    if (!userId) {
      return res.status(401).json({ message: "Authentication required." });
    }
    // ---

    const { deliveryMethod, address, confirmationInfo } = req.body;

    // Basic validation (Model validation will also run)
    if (!deliveryMethod || !confirmationInfo || !confirmationInfo.name || !confirmationInfo.telNo || !confirmationInfo.date) {
        return res.status(400).json({ message: "Missing required delivery or confirmation fields." });
    }
    if (deliveryMethod === 'post' && (!address || !address.street || !address.city || !address.country)) {
        return res.status(400).json({ message: "Full address (Street, City, Country) required for post delivery." });
    }


    // Create a new delivery method document
    const newDeliveryMethod = new DeliveryMethod({
      userId, // <<< Add userId
      deliveryMethod,
      // Only include address if method is post, or let model handle defaults
      address: deliveryMethod === 'post' ? address : undefined,
      confirmationInfo,
    });

    // Save to the database
    await newDeliveryMethod.save();

    res.status(201).json({
      message: "Delivery method submitted successfully!",
      data: newDeliveryMethod,
    });
  } catch (error) {
    console.error("Error submitting delivery method:", error);
    // --- Handle Duplicate Key Error (User already submitted) ---
    if (error.code === 11000 && error.keyPattern && error.keyPattern.userId) {
         return res.status(409).json({ // 409 Conflict
            message: "Delivery information has already been submitted for this account.",
         });
    }
    // --- Handle Mongoose Validation Errors ---
    if (error.name === 'ValidationError') {
         return res.status(400).json({ message: error.message });
    }
    // --- Default Server Error ---
    res.status(500).json({
      message: "Error submitting delivery method",
      error: error.message,
    });
  }
};

// --- NEW Controller function to check if delivery info exists ---
exports.checkExistingDeliveryMethod = async (req, res) => {
    try {
        const userId = req.userId; // Get userId from authMiddleware
        if (!userId) {
            return res.status(401).json({ message: "Authentication required." });
        }

        // Check if ANY document exists for this userId
        const existingInfo = await DeliveryMethod.findOne({ userId: userId }).select('_id').lean();

        res.status(200).json({
            exists: !!existingInfo // true if found, false otherwise
        });

    } catch (error) {
        console.error("Error checking delivery method existence:", error);
        res.status(500).json({
            message: "Error checking submission status",
            error: error.message,
        });
    }
};
// --- END NEW function ---


// Get all delivery methods (optional - consider admin/moderator protection)
exports.getAllDeliveryMethods = async (req, res) => {
  try {
    const deliveryMethods = await DeliveryMethod.find();
    res.status(200).json({ data: deliveryMethods });
  } catch (error) {
     console.error("Error fetching delivery methods:", error);
    res.status(500).json({
      message: "Error fetching delivery methods",
      error: error.message,
    });
  }
};