// backend/routes/authSettingRoutes.js
const express = require('express');
const {
    registerSettingUser,
    loginSettingUser,
    getSettingMe
} = require('../controllers/authSettingController');
const { protectSettingRoute } = require('../middleware/authSettingMiddleware');

const router = express.Router();

router.post('/register', registerSettingUser);
router.post('/login', loginSettingUser);
// Protect the '/me' route - only logged-in users can access it
router.get('/me', protectSettingRoute, getSettingMe);

module.exports = router;