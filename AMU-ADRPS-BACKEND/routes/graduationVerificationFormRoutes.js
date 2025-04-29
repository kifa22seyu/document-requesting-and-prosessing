const express = require("express");
const graduationVerificationFormController = require("../controllers/graduationVerificationFormController");

const router = express.Router();

// --- NEW: GET route to check submission status for a user ---
router.get("/status/:userId", graduationVerificationFormController.checkSubmissionStatus);

// POST route for submitting verification request (by user)
router.post("/verify-graduation", graduationVerificationFormController.verifyGraduation);

// POST route for admin verification/update
// Changed PUT to POST as originally, but PUT might be semantically better for updates
router.post("/admin-verify-graduation", graduationVerificationFormController.adminVerifyGraduation);
// Consider changing the above route path to something like /admin/update/:verificationId
// and method to PUT or PATCH if following REST principles more strictly.

module.exports = router;