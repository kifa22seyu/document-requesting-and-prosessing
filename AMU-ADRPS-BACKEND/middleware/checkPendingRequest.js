const StudentInformation = require("../models/StudentInformation");

const checkPendingRequest = async (req, res, next) => {
  try {
    const { idNo } = req.body;
    
    if (!idNo) {
      return res.status(400).json({
        success: false,
        message: 'ID number is required'
      });
    }

    const existingRequest = await StudentInformation.findOne({ 
      idNo,
      requestStatus: 'pending'
    });

    if (existingRequest) {
      return res.status(400).json({
        success: false,
        message: 'You already have a pending request. Please wait for resolution.',
        existingRequest
      });
    }
    
    next();
  } catch (err) {
    console.error('Error in checkPendingRequest:', err);
    res.status(500).json({ 
      success: false,
      message: 'Server error while checking for duplicate requests' 
    });
  }
};

module.exports = checkPendingRequest;