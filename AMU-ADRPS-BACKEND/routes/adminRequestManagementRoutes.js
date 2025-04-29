// File: routes/admin/adminRequestManagementRoutes.js
const express = require('express');
const router = express.Router();
const {
  getAllGraduationVerifications,
  getAllAcademicRequests,
  getAllDeliveryInfos,
  getAllStudentInfos,
  updateGraduationVerificationStatus,
  downloadAcademicDocument
} = require('../../controllers/admin/adminRequestManagementController');
const { protectAdmin } = require('../../middleware/adminAuth');
const validateObjectId = require('../../middleware/validateObjectId');

// Apply admin protection to all routes
router.use(protectAdmin);

// Get all requests
router.get('/graduation', getAllGraduationVerifications);
router.get('/academic', getAllAcademicRequests);
router.get('/delivery', getAllDeliveryInfos);
router.get('/student-info', getAllStudentInfos);

// Update verification status
router.patch('/graduation/:id/verify', validateObjectId, updateGraduationVerificationStatus);

// Download document
router.get('/academic/:id/download', validateObjectId, downloadAcademicDocument);

module.exports = router;