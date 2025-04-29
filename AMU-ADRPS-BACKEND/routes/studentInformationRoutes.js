// routes/studentInformationRoutes.js
const express = require("express");
const router = express.Router();
const studentInformationController = require("../controllers/studentInformationController");
const authMiddleware = require("../middleware/authMiddleware"); // <-- IMPORT Middleware

// --- NEW: Route to check if info exists for the logged-in user ---
// Use authMiddleware to ensure only logged-in users can check
router.get("/check", authMiddleware, studentInformationController.checkExistingInformation);

// --- MODIFY: Protect the POST route with authMiddleware ---
// Now only authenticated users can attempt to save information
router.post("/", authMiddleware, studentInformationController.saveStudentInformation);

// Optional: Keep GET all route, maybe protect it for admins later
router.get("/", studentInformationController.getAllStudentInformation); // Consider adding admin/moderator protection here

module.exports = router;