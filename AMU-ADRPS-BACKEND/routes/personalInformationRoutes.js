// routes/personalInformationRoutes.js
const express = require("express");
const router = express.Router();
const personalInformationController = require("../controllers/personalInformationController");

// Save personal information
router.post("/", personalInformationController.savePersonalInformation);

// Get all personal information (optional)
router.get("/", personalInformationController.getAllPersonalInformation);

module.exports = router;