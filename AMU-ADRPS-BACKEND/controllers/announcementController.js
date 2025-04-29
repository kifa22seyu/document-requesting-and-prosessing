const Announcement = require('../models/Announcement');

// Create announcement
exports.createAnnouncement = async (req, res) => {
  try {
    const { title, content, isImportant } = req.body;
    
    if (!title || !content) {
      return res.status(400).json({ 
        success: false,
        message: 'Title and content are required' 
      });
    }

    const announcement = new Announcement({
      title,
      content,
      isImportant: isImportant || false
    });

    const savedAnnouncement = await announcement.save();
    
    res.status(201).json({
      success: true,
      message: 'Announcement created successfully',
      data: savedAnnouncement
    });

  } catch (error) {
    console.error('Error creating announcement:', error);
    res.status(500).json({ 
      success: false,
      message: 'Server error while creating announcement' 
    });
  }
};

// Update announcement
exports.updateAnnouncement = async (req, res) => {
  try {
    const { id } = req.params;
    const { title, content, isImportant } = req.body;

    const announcement = await Announcement.findById(id);
    if (!announcement) {
      return res.status(404).json({ 
        success: false,
        message: 'Announcement not found' 
      });
    }

    announcement.title = title || announcement.title;
    announcement.content = content || announcement.content;
    announcement.isImportant = isImportant || announcement.isImportant;

    const updatedAnnouncement = await announcement.save();
    
    res.json({
      success: true,
      message: 'Announcement updated successfully',
      data: updatedAnnouncement
    });

  } catch (error) {
    console.error('Error updating announcement:', error);
    res.status(500).json({ 
      success: false,
      message: 'Server error while updating announcement' 
    });
  }
};

// Other controller methods (get, delete, etc.) would go here