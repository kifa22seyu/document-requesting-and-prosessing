// File: controllers/admin/adminRequestManagementController.js
const GraduationVerification = require('../../models/GraduationVerification');
const AcademicRequest = require('../../models/AcademicRequest');
const DeliveryInfo = require('../../models/DeliveryInfo');
const StudentInformation = require('../../models/StudentInformation');
const fs = require('fs');
const path = require('path');

// Get all graduation verification requests
exports.getAllGraduationVerifications = async (req, res) => {
  try {
    const requests = await GraduationVerification.find()
      .populate('student', 'fullName studentId')
      .sort({ createdAt: -1 });
    res.json(requests);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get all academic document requests
exports.getAllAcademicRequests = async (req, res) => {
  try {
    const requests = await AcademicRequest.find()
      .populate('student', 'fullName studentId')
      .sort({ createdAt: -1 });
    res.json(requests);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get all delivery information
exports.getAllDeliveryInfos = async (req, res) => {
  try {
    const deliveries = await DeliveryInfo.find()
      .populate('student', 'fullName studentId')
      .sort({ createdAt: -1 });
    res.json(deliveries);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get all student information
exports.getAllStudentInfos = async (req, res) => {
  try {
    const students = await StudentInformation.find()
      .populate('user', 'email')
      .sort({ createdAt: -1 });
    res.json(students);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Update graduation verification status
exports.updateGraduationVerificationStatus = async (req, res) => {
  try {
    const { status, adminComments } = req.body;
    const request = await GraduationVerification.findByIdAndUpdate(
      req.params.id,
      { status, adminComments, verifiedBy: req.user._id, verifiedAt: new Date() },
      { new: true }
    );
    res.json(request);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Download academic document
exports.downloadAcademicDocument = async (req, res) => {
  try {
    const request = await AcademicRequest.findById(req.params.id);
    if (!request || !request.documentPath) {
      return res.status(404).json({ message: 'Document not found' });
    }

    const filePath = path.join(__dirname, '../../public', request.documentPath);
    if (!fs.existsSync(filePath)) {
      return res.status(404).json({ message: 'File not found' });
    }

    res.download(filePath);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};