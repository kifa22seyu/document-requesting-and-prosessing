const Admin = require('../models/AdminModel');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

exports.loginAdmin = async (req, res) => {
  const { email, password } = req.body;

  try {
    // Check if the admin exists
    const admin = await Admin.findOne({ email });
    if (!admin) {
      return res.status(404).json({ message: 'Admin not found' });
    }

    // Compare the entered password with the hashed password
    const isMatch = await bcrypt.compare(password, admin.password);
    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    // Generate a JWT token
    const token = jwt.sign({ id: admin._id, role: 'admin' }, process.env.JWT_SECRET, {
      expiresIn: '1h',
    });

    res.status(200).json({ token, message: 'Login successful' });
  } catch (error) {
    console.error('Error during admin login:', error);
    res.status(500).json({ message: 'Server error' });
  }
};