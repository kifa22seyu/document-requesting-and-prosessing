// controllers/personalInformationController.js
const PersonalInformation = require("../models/PersonalInformation");

// Save personal information
exports.savePersonalInformation = async (req, res) => {
  try {
    const { englishName, amharicName, idNo, department, faculty, program, isEnrolled, date } = req.body;

    // Create a new personal information document
    const personalInfo = new PersonalInformation({
      englishName,
      amharicName,
      idNo,
      department,
      faculty,
      program,
      isEnrolled,
      date,
    });

    // Save to the database
    await personalInfo.save();

    res.status(201).json({ message: "Personal information saved successfully", data: personalInfo });
  } catch (error) {
    res.status(500).json({ message: "Error saving personal information", error: error.message });
  }
};

// Get all personal information (optional)
exports.getAllPersonalInformation = async (req, res) => {
  try {
    const personalInfoList = await PersonalInformation.find();
    res.status(200).json({ data: personalInfoList });
  } catch (error) {
    res.status(500).json({ message: "Error fetching personal information", error: error.message });
  }
};