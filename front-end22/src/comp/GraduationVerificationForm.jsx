import React, { useState, useEffect } from "react";

const GraduationVerificationForm = () => {
  // --- State ---
  const [formData, setFormData] = useState({
    candidateName: "",
    universityName: "",
    departmentName: "",
    graduationDate: "",
    verifyGraduation: false,
  });

  // Simulate getting the current user's ID (replace with actual auth context later)
  // !!!!! IMPORTANT: In a real app, get this from your authentication context !!!!!
  const [userId] = useState("66a03aa4e4b0ae1e60f0f0f0"); // Example placeholder ID - MUST BE A VALID MONGO ObjectId

  const [isLoading, setIsLoading] = useState(true); // Loading state for initial check
  const [hasSubmitted, setHasSubmitted] = useState(false); // Flag if user already submitted
  const [existingSubmissionStatus, setExistingSubmissionStatus] = useState(null); // Status of existing submission
  const [submitError, setSubmitError] = useState(null); // Error during submission
  const [verificationResult, setVerificationResult] = useState(null); // Result after submission attempt

  // --- Effects ---
  // Check if the user has already submitted when the component loads
  useEffect(() => {
    if (!userId) {
      console.error("User ID is not available.");
      setIsLoading(false);
      setSubmitError("Cannot check submission status: User ID missing."); // Prevent form use if no user ID
      return;
    }

    const checkStatus = async () => {
      setIsLoading(true);
      setSubmitError(null); // Clear previous errors
      try {
        const response = await fetch(
          `http://localhost:8000/api/graduation-verification/status/${userId}`
        );
        // Check if response is ok, otherwise throw an error to be caught
        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
        }

        const data = await response.json();

        if (data.hasSubmitted) {
          setHasSubmitted(true);
          setExistingSubmissionStatus(data.submission?.status || 'Submitted'); // Use status if available
          setVerificationResult(null); // Clear any previous submission results shown
        } else {
          setHasSubmitted(false);
          setExistingSubmissionStatus(null);
        }
      } catch (error) {
        console.error("Error checking submission status:", error);
        setSubmitError(`Failed to check submission status: ${error.message}. Please try refreshing.`);
        setHasSubmitted(false); // Assume not submitted if check fails, but show error
      } finally {
        setIsLoading(false);
      }
    };

    checkStatus();
  }, [userId]); // Re-run if userId changes (though it's static in this example)

  // --- Handlers ---
  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prevData) => ({
      ...prevData,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitError(null); // Clear previous errors
    setVerificationResult(null); // Clear previous results

    // Basic frontend validation (already handled by 'required' attribute, but good practice)
    if (!formData.verifyGraduation) {
      setSubmitError("Please check the 'Verify Graduation' box before submitting.");
      return;
    }
    if (!userId) {
        setSubmitError("Cannot submit: User ID is missing.");
        return;
    }
    // Prevent submission if already submitted (should be disabled, but double-check)
    if (hasSubmitted) {
        setSubmitError("You have already submitted a request.");
        return;
    }


    setIsLoading(true); // Indicate submission process

    try {
      const response = await fetch(
        "http://localhost:8000/api/graduation-verification/verify-graduation",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          // Include userId along with other form data
          body: JSON.stringify({ ...formData, userId }),
        }
      );

      const data = await response.json();

      if (response.ok) { // Status 200-299
        setVerificationResult(data.message || "Submission successful!");
        setHasSubmitted(true); // Mark as submitted after successful post
        setExistingSubmissionStatus('Pending'); // Update local status
      } else if (response.status === 409) { // Specifically handle conflict (duplicate)
         setVerificationResult(null);
         setSubmitError(data.message || "You have already submitted a verification request.");
         setHasSubmitted(true); // Ensure the state reflects already submitted
         setExistingSubmissionStatus('Submitted'); // Or fetch status again if needed
      }
       else {
        // Handle other errors (400, 500, etc.)
        setVerificationResult(null);
        setSubmitError(data.message || `Error: ${response.statusText}`);
      }
    } catch (error) {
      console.error("Error submitting verification:", error);
      setVerificationResult(null);
      setSubmitError("An error occurred while submitting. Please try again.");
    } finally {
      setIsLoading(false); // Finish loading
    }
  };

  // --- Render Logic ---

  // Display loading indicator during initial check
  if (isLoading && !verificationResult && !submitError && !hasSubmitted) {
    return (
      <div className="w-full max-w-6xl mx-auto p-8 text-center">
        <p className="text-lg text-gray-600">Loading verification status...</p>
      </div>
    );
  }

  // Display message and potentially details if already submitted
  if (hasSubmitted) {
    return (
      <div className="w-full max-w-6xl mx-auto p-8 bg-white shadow-lg rounded-lg text-center">
        <h2 className="text-2xl font-bold mb-4 text-indigo-700">
          Submission Status
        </h2>
        <p className="text-lg text-gray-700 mb-2">
          You have already submitted a graduation verification request.
        </p>
        {existingSubmissionStatus && (
           <p className="text-md text-gray-600">
             Current Status: <span className="font-semibold">{existingSubmissionStatus}</span>
            </p>
        )}
         {/* Optionally show the verification result from the last successful submit if available */}
        {verificationResult && (
             <p className="mt-4 text-green-600">{verificationResult}</p>
        )}
         {/* Show submit error if the last attempt failed even after initial load said submitted (e.g., network issue) */}
        {submitError && !verificationResult && (
            <p className="mt-4 text-red-600">{submitError}</p>
        )}
      </div>
    );
  }

  // Display the form if not loading and not already submitted
  return (
    <div className="w-full max-w-6xl mx-auto p-8 bg-white shadow-lg rounded-lg">
      <h2 className="text-2xl font-bold text-center mb-6 text-gray-800">
        Graduation Verification Request
      </h2>

      {/* Display Submission Errors */}
      {submitError && (
        <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
          <p>{submitError}</p>
        </div>
      )}

      <form className="space-y-6" onSubmit={handleSubmit}>
        {/* Candidate's Name */}
        <div>
          <label htmlFor="candidateName" className="block text-sm font-medium text-gray-700 mb-1">
            Candidate's Full Name:
          </label>
          <input
            id="candidateName"
            type="text"
            name="candidateName"
            value={formData.candidateName}
            onChange={handleChange}
            className="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 disabled:bg-gray-100 disabled:cursor-not-allowed"
            placeholder="Enter candidate's full name"
            required
            disabled={isLoading || hasSubmitted} // Disable if loading or submitted
          />
        </div>

        {/* University Name */}
        <div>
           <label htmlFor="universityName" className="block text-sm font-medium text-gray-700 mb-1">
            University Name:
          </label>
          <input
            id="universityName"
            type="text"
            name="universityName"
            value={formData.universityName}
            onChange={handleChange}
            className="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 disabled:bg-gray-100 disabled:cursor-not-allowed"
            placeholder="Enter university name"
            required
             disabled={isLoading || hasSubmitted}
          />
        </div>

        {/* Department Name */}
        <div>
           <label htmlFor="departmentName" className="block text-sm font-medium text-gray-700 mb-1">
            Department Name:
          </label>
          <input
            id="departmentName"
            type="text"
            name="departmentName"
            value={formData.departmentName}
            onChange={handleChange}
            className="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 disabled:bg-gray-100 disabled:cursor-not-allowed"
            placeholder="Enter department name"
            required
             disabled={isLoading || hasSubmitted}
          />
        </div>

        {/* Graduation Date */}
        <div>
           <label htmlFor="graduationDate" className="block text-sm font-medium text-gray-700 mb-1">
            Graduation Date:
          </label>
          <input
            id="graduationDate"
            type="date"
            name="graduationDate"
            value={formData.graduationDate}
            onChange={handleChange}
            className="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 disabled:bg-gray-100 disabled:cursor-not-allowed"
            required
             disabled={isLoading || hasSubmitted}
          />
        </div>

        {/* Verify Graduation Checkbox */}
        <div>
          <label className="flex items-center space-x-2">
            <input
              type="checkbox"
              name="verifyGraduation"
              checked={formData.verifyGraduation}
              onChange={handleChange}
              className="w-4 h-4 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500 disabled:bg-gray-100 disabled:cursor-not-allowed"
               disabled={isLoading || hasSubmitted}
            />
            <span className="text-sm text-gray-700">
              I confirm the details above are accurate and request verification.
            </span>
          </label>
        </div>

        {/* Submit Button */}
        <div>
          <button
            type="submit"
            className="w-full px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 disabled:bg-indigo-300 disabled:cursor-not-allowed"
            disabled={isLoading || hasSubmitted || !formData.verifyGraduation} // Disable if loading, already submitted, or checkbox not checked
          >
            {isLoading ? "Submitting..." : "Submit Verification Request"}
          </button>
        </div>
      </form>

      {/* Display Verification Result after successful submission */}
      {verificationResult && !submitError && (
        <div className="mt-6 p-4 bg-green-100 border border-green-400 text-green-700 rounded-lg">
          <h3 className="text-lg font-semibold">Submission Confirmation:</h3>
          <p className="mt-1">{verificationResult}</p>
        </div>
      )}
    </div>
  );
};

export default GraduationVerificationForm;