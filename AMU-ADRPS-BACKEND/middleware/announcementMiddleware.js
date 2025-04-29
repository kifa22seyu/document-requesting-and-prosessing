const jwt = require('jsonwebtoken');
const announcementConfig = require('../announcementConfig');

// Middleware to authenticate JWT token
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];
  if (!token) return res.status(401).json({ message: 'Access denied. No token provided.' });

  jwt.verify(token, announcementConfig.JWT_SECRET, (err, user) => {
    if (err) return res.status(403).json({ message: 'Invalid or expired token.' });
    req.user = user;
    next();
  });
};

// Middleware to validate announcement data
const validateAnnouncementData = (req, res, next) => {
  const { title, content } = req.body;
  if (!title || !content) {
    return res.status(400).json({ message: 'Title and Content are required fields.' });
  }
  next();
};

module.exports = { authenticateToken, validateAnnouncementData };