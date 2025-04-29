// File: routes/messageRoutes.js

const express = require('express');
const { param, validationResult } = require('express-validator');
const mongoose = require('mongoose');

// --- THIS IS THE CORRECTED REQUIRE STATEMENT ---
// It points to the ACTUAL filename 'message.controller.js'
const { sendMessage, getMessages } = require('../controllers/message.controller.js');
// ---------------------------------------------

// Ensure the path to your admin auth middleware is correct
const { protectAdmin } = require('../middleware/adminAuth.js');

const router = express.Router();

// --- Input Validation Middleware ---
const isValidObjectId = (value) => mongoose.Types.ObjectId.isValid(value);
const handleValidationErrors = (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        console.error("Validation Errors:", errors.array());
        return res.status(400).json({
             message: 'Validation failed',
             error: errors.array()[0]?.msg || 'Invalid input provided.'
            });
    }
    next();
};

// --- Routes Definition ---

// GET /api/messages/:peerId
router.get(
    '/:peerId',
    protectAdmin,
    param('peerId')
        .custom(isValidObjectId)
        .withMessage('Invalid Peer ID format.'),
    handleValidationErrors,
    getMessages
);

// POST /api/messages/send/:peerId
router.post(
    '/send/:peerId',
    protectAdmin,
    param('peerId')
         .custom(isValidObjectId)
         .withMessage('Invalid Peer ID format.'),
    // Add body validation here if needed
    handleValidationErrors,
    sendMessage
);

module.exports = router;