// routes/moderatorAuthRoutes.js
require('dotenv').config();
const express = require('express');
// const bcrypt = require('bcrypt'); // <-- Removed unused import
const jwt = require('jsonwebtoken');
const AdminRole = require('../models/Adminc'); // <-- Ensure path is correct

const router = express.Router();

// --- Moderator Login Route ---
router.post('/login', async (req, res, next) => {
    // --- Log request reception (Always) ---
    console.log(`[${new Date().toISOString()}] /moderator/login request received.`);
    // ---------------------------------------

    // --- Log request body ONLY in development ---
    if (process.env.NODE_ENV === 'development') {
        console.log("[Backend DEV] Request Body:", req.body);
    }
    // ---------------------------------------------

    const { email, password, role } = req.body;

    // --- Validation (Log errors always) ---
    if (!email || !password || !role) {
        console.log("[Backend] Login failed: Missing email, password, or role."); // Essential Log
        return res.status(400).json({ success: false, message: 'Please provide email, password, and role' });
    }

    const allowedRoles = ['Finance', 'Team Association'];
    if (!allowedRoles.includes(role)) {
      console.log(`[Backend] Login failed: Invalid role specified - ${role}.`); // Essential Log
      return res.status(400).json({ success: false, message: `Invalid role specified. Allowed roles are: ${allowedRoles.join(', ')}` });
    }
    // --- End Validation ---

    try {
        const searchCriteria = {
            email: email.toLowerCase(),
            role: role
        };
        // --- Log search criteria ONLY in development ---
        if (process.env.NODE_ENV === 'development') {
            console.log("[Backend DEV] Searching AdminRole collection with criteria:", searchCriteria);
        }
        // ---------------------------------------------

        // Use .select('+password') because it's hidden by default in the schema
        const moderator = await AdminRole.findOne(searchCriteria).select('+password');

        // --- Log DB result details ONLY in development ---
        if (process.env.NODE_ENV === 'development') {
             console.log("[Backend DEV] Database findOne result (moderator):", moderator ? `FOUND User: ${moderator.email}, Role: ${moderator.role}` : "NOT FOUND");
        }
        // -------------------------------------------

        // --- User not found check (Log error always) ---
        if (!moderator) {
            console.log(`[Backend] Login failed: No user found matching criteria for email ${email.toLowerCase()} and role ${role}.`); // Essential Log
            return res.status(401).json({ success: false, message: 'Invalid credentials' });
        }
        // --- End user not found check ---

        // --- Log password comparison intention ONLY in development ---
        if (process.env.NODE_ENV === 'development') {
            console.log(`[Backend DEV] Comparing provided password for user ${moderator.email}...`);
        }
        // ------------------------------------------------

        // Use the model's method which uses bcrypt internally
        const isMatch = await moderator.comparePassword(password);

        // --- Log password comparison result ONLY in development ---
        if (process.env.NODE_ENV === 'development') {
            console.log("[Backend DEV] Password comparison result (isMatch):", isMatch);
        }
        // ----------------------------------------------

        // --- Password mismatch check (Log error always) ---
        if (!isMatch) {
            console.log(`[Backend] Login failed: Password mismatch for user ${moderator.email}.`); // Essential Log
            return res.status(401).json({ success: false, message: 'Invalid credentials' });
        }
        // --- End password mismatch check ---

        // --- Log success intention ONLY in development ---
        if (process.env.NODE_ENV === 'development') {
            console.log(`[Backend DEV] Password match successful for user ${moderator.email}. Generating token...`);
        }
        // ------------------------------------------

        const payload = {
            userId: moderator._id,
            email: moderator.email,
            role: moderator.role,
            fullName: moderator.fullName,
            type: 'moderator'
        };

        const secret = process.env.JWT_SECRET;
        const expiresIn = process.env.JWT_EXPIRES_IN || '1h';

        // --- JWT Secret Check (Log error always) ---
        if (!secret) {
            console.error("FATAL ERROR: JWT_SECRET is not defined in environment variables."); // Essential Log
            const error = new Error('Server configuration error: JWT secret missing.');
            error.statusCode = 500;
            return next(error); // Pass to global error handler
        }
        // --- End JWT Secret Check ---

        const token = jwt.sign(payload, secret, { expiresIn });

        // --- Log concise success (Always) ---
        console.log(`[Backend] Moderator login successful for user: ${moderator.email}, role: ${moderator.role}.`); // Essential Log
        // -------------------------------------

        // --- Send success response ---
        res.status(200).json({
            success: true,
            message: 'Moderator login successful',
            token: token,
            user: {
                id: moderator._id,
                email: moderator.email,
                role: moderator.role,
                fullName: moderator.fullName
            }
        });
        // --- End send success response ---

    } catch (error) {
        // --- Log general errors (Always) ---
        console.error(`[${new Date().toISOString()}] Error during moderator login process for email ${email}:`, error); // Essential Log
        next(error); // Pass to global error handler
        // --- End log general errors ---
    }
});

module.exports = router;