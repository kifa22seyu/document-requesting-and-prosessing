const express = require('express');
const {
  getAllAdmins,
  createAdmin,
  updateAdmin,
  deleteAdmin
} = require('../controllers/adminController'); // Adjust path if necessary

const router = express.Router();

// --- Define Admin CRUD Routes ---

// GET all admins & POST a new admin
router.route('/')
  .get(getAllAdmins)
  .post(createAdmin);

// PUT (update) an admin & DELETE an admin by ID
router.route('/:id')
  .put(updateAdmin)
  .delete(deleteAdmin);

module.exports = router;