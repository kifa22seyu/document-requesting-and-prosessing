const Setting = require('../models/Setting');
const fs = require('fs');
const path = require('path');

// Initialize default settings
exports.initializeSettings = async () => {
  try {
    const settings = await Setting.findOne();
    if (!settings) {
      const defaultSettings = await Setting.create({});
      console.log('Default settings initialized');
      return defaultSettings;
    }
    return settings;
  } catch (error) {
    console.error('Error initializing settings:', error);
    throw error;
  }
};

// Get current settings
exports.getSettings = async (req, res) => {
  try {
    const settings = await Setting.findOne();
    res.status(200).json({
      success: true,
      data: settings || await this.initializeSettings()
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error retrieving settings'
    });
  }
};

// Update settings
exports.updateSettings = async (req, res) => {
  try {
    let settings = await Setting.findOne();
    
    if (!settings) {
      settings = await this.initializeSettings();
    }

    // Handle file upload
    if (req.file) {
      // Remove old image if it exists and isn't default
      if (settings.profileImage && !settings.profileImage.includes('/defaults/')) {
        const oldImagePath = path.join(__dirname, '../public', settings.profileImage);
        if (fs.existsSync(oldImagePath)) {
          fs.unlinkSync(oldImagePath);
        }
      }
    }

    // Update fields
    settings.name = req.body.name || settings.name;
    settings.email = req.body.email || settings.email;
    settings.role = req.body.role || settings.role;
    settings.profileImage = req.file || settings.profileImage;

    await settings.save();

    res.status(200).json({
      success: true,
      data: settings,
      imageUrl: settings.imageUrl
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
};