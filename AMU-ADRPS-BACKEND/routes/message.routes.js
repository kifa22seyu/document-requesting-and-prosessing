const express = require('express');
const router = express.Router();
const { check } = require('express-validator');
const messageController = require('../controllers/message.controller');
const { protect } = require('../middleware/authMiddleware');

// @route   POST /api/messages
// @desc    Send a new message
// @access  Private
router.post(
  '/:receiverId',
  protect,
  [
    check('content', 'Message content is required').not().isEmpty(),
    check('receiverId', 'Invalid receiver ID').isMongoId()
  ],
  messageController.sendMessage
);

// @route   GET /api/messages/conversation/:conversationId
// @desc    Get messages in a conversation
// @access  Private
router.get(
  '/conversation/:conversationId',
  protect,
  [
    check('conversationId', 'Invalid conversation ID').isMongoId()
  ],
  messageController.getMessages
);

// @route   GET /api/messages/conversations
// @desc    Get all conversations for current user
// @access  Private
router.get(
  '/conversations',
  protect,
  messageController.getConversations
);

module.exports = router;