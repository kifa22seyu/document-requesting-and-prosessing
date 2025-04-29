const express = require('express');
const router = express.Router();
const {
  createAnnouncement,
  updateAnnouncement
} = require('../controllers/announcementController');

// Public routes - no authentication
router.post('/', createAnnouncement);
router.put('/:id', updateAnnouncement);

module.exports = router;