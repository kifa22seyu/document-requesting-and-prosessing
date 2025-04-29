const express = require("express");
const router = express.Router();
const authMiddleware = require("../middleware/authMiddleware");
const roleMiddleware = require("../middleware/roleMiddleware");

// Finance Dashboard
router.get("/finance", 
  authMiddleware,
  roleMiddleware(["Finance"]),
  (req, res) => {
    res.json({
      success: true,
      message: "Welcome to Finance Dashboard",
      data: {
        user: req.user,
        financialReports: [],
        pendingApprovals: []
      }
    });
  }
);

// Team Association Dashboard
router.get("/team-association", 
  authMiddleware,
  roleMiddleware(["Team Association"]),
  (req, res) => {
    res.json({
      success: true,
      message: "Welcome to Team Association Dashboard",
      data: {
        user: req.user,
        teamActivities: [],
        memberRequests: []
      }
    });
  }
);

module.exports = router;