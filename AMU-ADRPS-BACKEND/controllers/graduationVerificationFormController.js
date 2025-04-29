const GraduationVerificationForm = require("../models/GraduationVerificationForm");
const mongoose = require('mongoose'); // Import mongoose for ObjectId validation

// Controller to check if a user has already submitted
exports.checkSubmissionStatus = async (req, res) => {
  const { userId } = req.params;

  // Basic validation for userId format (optional but good practice)
  if (!mongoose.Types.ObjectId.isValid(userId)) {
      return res.status(400).json({ message: "Invalid User ID format." });
  }

  try {
    const existingSubmission = await GraduationVerificationForm.findOne({ userId: userId });

    if (existingSubmission) {
      // Found an existing submission for this user
      res.status(200).json({
        hasSubmitted: true,
        message: "A verification request has already been submitted for this user.",
        submission: { // Send back some details if needed
            status: existingSubmission.verificationStatus,
            submittedAt: existingSubmission.createdAt,
            // Add other fields you might want to display
        }
      });
    } else {
      // No submission found for this user
      res.status(200).json({ hasSubmitted: false });
    }
  } catch (error) {
    console.error("Error checking submission status:", error);
    res.status(500).json({ message: "Error checking submission status.", error: error.message });
  }
};


// Verify graduation (handle initial submission from user)
exports.verifyGraduation = async (req, res) => {
  // IMPORTANT: Get userId from the request body (sent by frontend)
  const { userId, candidateName, universityName, departmentName, graduationDate, verifyGraduation } = req.body;

  // --- Basic Input Validation ---
  if (!userId) {
      return res.status(400).json({ message: "User ID is missing." });
  }
  if (!mongoose.Types.ObjectId.isValid(userId)) {
    return res.status(400).json({ message: "Invalid User ID format." });
  }
  if (!verifyGraduation) {
    return res.status(400).json({ message: "Please check the 'Verify Graduation' box before submitting." });
  }
  if (!candidateName || !universityName || !departmentName || !graduationDate) {
      return res.status(400).json({ message: "All fields (candidate, university, department, date) are required." });
  }
  // --- End Validation ---


  // Create the new verification document instance
  const newVerification = new GraduationVerificationForm({
    userId, // Include the userId
    candidateName,
    universityName,
    departmentName,
    graduationDate,
    verifyGraduation, // Store the state of the checkbox at submission time
    verifiedByAdmin: false, // Initially set to false
    verificationStatus: 'Pending', // Initial status
  });

  try {
    await newVerification.save();
    // Successfully saved
    res.status(201).json({ // Use 201 Created for successful resource creation
        message: "Verification request submitted successfully. It is now pending admin review.",
        submissionId: newVerification._id
    });
  } catch (error) {
    // --- Handle Potential Errors ---
    // Check for duplicate key error (code 11000) on the userId field
    if (error.code === 11000 && error.keyPattern && error.keyPattern.userId) {
      return res.status(409).json({ // 409 Conflict is appropriate here
           message: "A verification request has already been submitted for this user.",
           error: "Duplicate submission attempt."
      });
    }
    // Handle validation errors (e.g., missing required fields if frontend check fails)
    if (error.name === 'ValidationError') {
        // Extract specific validation messages
        const messages = Object.values(error.errors).map(err => err.message);
        return res.status(400).json({ message: "Validation failed.", errors: messages });
    }

    // Handle other potential database errors
    console.error("Error saving verification data:", error);
    res.status(500).json({ message: "Error saving verification data.", error: error.message });
  }
};

// Admin verification endpoint (remains the same)
exports.adminVerifyGraduation = async (req, res) => {
    // Ensure you are getting the MongoDB document _id here, not the userId
    const { verificationId, verifiedByAdmin, adminNotes, verificationStatus } = req.body;

    if (!verificationId || !mongoose.Types.ObjectId.isValid(verificationId)) {
        return res.status(400).json({ message: "Valid Verification ID is required." });
    }
    // Basic validation for status if provided
    const allowedStatuses = ['Pending', 'Verified', 'Rejected', 'More Info Required'];
    if (verificationStatus && !allowedStatuses.includes(verificationStatus)) {
         return res.status(400).json({ message: "Invalid verification status provided." });
    }


    try {
        const verification = await GraduationVerificationForm.findById(verificationId);

        if (!verification) {
        return res.status(404).json({ message: "Verification request not found." });
        }

        // Update the verification status fields
        if (verifiedByAdmin !== undefined) {
             verification.verifiedByAdmin = Boolean(verifiedByAdmin); // Ensure boolean
        }
        // Update status and notes only if provided
        if (verificationStatus) {
            verification.verificationStatus = verificationStatus;
            // Automatically update verifiedByAdmin based on status for simplicity,
            // but allow direct override via verifiedByAdmin field if needed.
            if (verificationStatus === 'Verified') verification.verifiedByAdmin = true;
            // Consider if 'Rejected' should also set verifiedByAdmin to false or leave it
            // else if (verificationStatus === 'Rejected') verification.verifiedByAdmin = false;
        }
        if (adminNotes !== undefined) { // Allow empty string for notes
            verification.adminNotes = adminNotes;
        }


        await verification.save();

        res.status(200).json({
            message: `Verification record ${verificationId} updated successfully. Status: ${verification.verificationStatus}`,
            updatedRecord: verification // Send back updated record
        });
    } catch (error) {
        console.error("Error updating verification status:", error);
        res.status(500).json({ message: "Error updating verification status", error: error.message });
    }
};