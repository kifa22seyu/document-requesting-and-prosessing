// controllers/studentInformationController.js
const StudentInformation = require("../models/StudentInformation");

// Save student information (handles both student details and request form)
exports.saveStudentInformation = async (req, res) => {
    try {
        // --- NEW: Get userId from the request (added by authMiddleware) ---
        const userId = req.userId;
        if (!userId) {
            // This should technically be caught by authMiddleware, but belt-and-suspenders
            return res.status(401).json({ message: "Authentication required." });
        }
        // --- END NEW ---

        const {
            fullName, idNo, program, department, graduationYear,
            isEnrolled, classYear, selectedDocuments, totalFee,
        } = req.body;

        // Validate required fields (Student Information part)
        if (!fullName || !idNo || !program || !department || !graduationYear || isEnrolled === undefined) {
            return res.status(400).json({ message: "Missing required student information fields." });
        }

        // Optional validation for other fields remains the same
        if (selectedDocuments && !Array.isArray(selectedDocuments)) {
            return res.status(400).json({ message: "selectedDocuments must be an array." });
        }
        if (totalFee !== undefined && (typeof totalFee !== 'number' || totalFee < 0)) {
            return res.status(400).json({ message: "totalFee must be a non-negative number." });
        }

        // Create a new student information document including the userId
        const studentInfo = new StudentInformation({
            userId, // <-- Include the logged-in user's ID
            fullName,
            idNo,
            program,
            department,
            graduationYear,
            isEnrolled,
            classYear: isEnrolled ? classYear : undefined, // Only save classYear if enrolled
            selectedDocuments: selectedDocuments || [],
            totalFee: totalFee || 0,
        });

        // Save to the database
        await studentInfo.save();

        // If save successful (no unique constraint violation)
        res.status(201).json({
            message: "Student information saved successfully",
            data: studentInfo, // Send back the created data
        });

    } catch (error) {
        console.error("Error saving student information:", error);

        // --- NEW: Handle Duplicate Key Error (User already submitted) ---
        if (error.code === 11000 && error.keyPattern && error.keyPattern.userId) {
            return res.status(409).json({ // 409 Conflict status code
                message: "Student information has already been submitted for this account.",
                // Optionally, you could fetch and return the existing data here if needed
            });
        }
        // --- END NEW ---

        // Handle other potential errors (e.g., validation errors not caught above, DB connection issues)
        if (error.name === 'ValidationError') {
             return res.status(400).json({ message: error.message });
        }

        // Default to 500 Internal Server Error for unexpected issues
        res.status(500).json({
            message: "Error saving student information",
            error: error.message,
        });
    }
};

// --- NEW: Controller function to check if info exists for the current user ---
exports.checkExistingInformation = async (req, res) => {
    try {
        const userId = req.userId; // Get userId from authMiddleware
        if (!userId) {
            return res.status(401).json({ message: "Authentication required." });
        }

        // Find if a document exists for this userId. Select only '_id' for efficiency.
        const existingInfo = await StudentInformation.findOne({ userId: userId }).select('_id').lean(); // .lean() returns a plain JS object

        res.status(200).json({
            exists: !!existingInfo // Convert result to boolean (true if found, false otherwise)
        });

    } catch (error) {
        console.error("Error checking student information existence:", error);
        res.status(500).json({
            message: "Error checking submission status",
            error: error.message,
        });
    }
};
// --- END NEW ---


// Get all student information (optional - consider protecting for admin/moderator)
exports.getAllStudentInformation = async (req, res) => {
  try {
    const studentInfoList = await StudentInformation.find();
    res.status(200).json({ data: studentInfoList });
  } catch (error) {
    res.status(500).json({ message: "Error fetching student information", error: error.message });
  }
};