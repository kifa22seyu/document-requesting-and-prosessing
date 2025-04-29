// routes/requestFormRoutes.js
const express = require("express");
const router = express.Router();
const requestFormController = require("../controllers/requestFormController");
const authMiddleware = require("../middleware/authMiddleware"); // <-- IMPORT your auth middleware

// --- NEW: Route to check if a request exists for the logged-in user ---
// Protected by authMiddleware
router.get("/check", authMiddleware, requestFormController.checkExistingRequest);

// --- Protect the POST route ---
// Protected by authMiddleware
router.post("/", authMiddleware, requestFormController.saveRequestForm);

// Get all request forms (optional - Consider protecting for admin/moderator roles later)
router.get("/", requestFormController.getAllRequestForms);

module.exports = router;