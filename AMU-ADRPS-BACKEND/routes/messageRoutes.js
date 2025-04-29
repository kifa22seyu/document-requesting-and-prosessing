// backend/routes/messageRoutes.js
const express = require('express');
const messageController = require('../controllers/messageController'); // Adjust path
const { verifyToken } = require('../controllers/authController'); // Import YOUR verifyToken

const router = express.Router();

// Apply verifyToken middleware to all message routes
router.use(verifyToken);

router.get('/:otherUserId', messageController.getMessages); // GET /api/messages/someUserId
router.post('/', messageController.sendMessage);          // POST /api/messages

module.exports = router;