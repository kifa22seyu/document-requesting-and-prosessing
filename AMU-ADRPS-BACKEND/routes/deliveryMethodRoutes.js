// backend/routes/deliveryMethodRoutes.js
const express = require("express");
const {
  saveDeliveryMethod,
  getAllDeliveryMethods,
  checkExistingDeliveryMethod, // <-- Import the new controller function
} = require("../controllers/deliveryMethodController");
const authMiddleware = require("../middleware/authMiddleware"); // <-- Import middleware

const router = express.Router();

// --- NEW: Route to check if delivery info exists for the user ---
router.get("/check", authMiddleware, checkExistingDeliveryMethod);

// --- Protect the POST route ---
router.post("/", authMiddleware, saveDeliveryMethod);

// Get all delivery methods (optional - consider admin protection)
router.get("/", getAllDeliveryMethods);

module.exports = router;