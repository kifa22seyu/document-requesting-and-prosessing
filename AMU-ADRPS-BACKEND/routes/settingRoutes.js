const express = require('express');
const router = express.Router();
const settingController = require('../controllers/settingController');
const upload = require('../config/settingUpload');

// Initialize settings on first access
router.use(async (req, res, next) => {
  await settingController.initializeSettings();
  next();
});

router.get('/', settingController.getSettings);
router.put('/', upload.single('profileImage'), settingController.updateSettings);

module.exports = router;