import React, { useState, useEffect } from "react";
import { useOutletContext } from "react-router-dom";

const StudentForm = () => {
  const outletContext = useOutletContext() || {}; // Fallback to an empty object
  const { authToken } = outletContext;

  const [formData, setFormData] = useState({
    fullName: "",
    idNo: "",
    program: "",
    department: "",
    graduationYear: "",
    isEnrolled: false,
    classYear: "",
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState("info"); // 'info', 'success', 'error'
  const [isLoadingCheck, setIsLoadingCheck] = useState(true);
  const [hasAlreadySubmitted, setHasAlreadySubmitted] = useState(null);

  // Check if student information has already been submitted
  useEffect(() => {
    const checkSubmissionStatus = async () => {
      setIsLoadingCheck(true);
      setHasAlreadySubmitted(null);
      setMessage("");

      if (!authToken) {
        setMessage("Authentication error. Please log in again.");
        setMessageType("error");
        setHasAlreadySubmitted(true);
        setIsLoadingCheck(false);
        return;
      }

      try {
        const response = await fetch("http://localhost:8000/api/student-information/check", {
          method: "GET",
          headers: {
            Authorization: `Bearer ${authToken}`,
            "Content-Type": "application/json",
          },
        });

        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}));
          throw new Error(errorData.message || `Failed to check status (${response.status})`);
        }

        const result = await response.json();
        setHasAlreadySubmitted(result.exists);

        if (result.exists) {
          setMessage("You have already submitted your student information.");
          setMessageType("info");
        }
      } catch (error) {
        console.error("Error checking submission status:", error);
        setMessage(`Could not verify submission status: ${error.message}. Form disabled.`);
        setMessageType("error");
        setHasAlreadySubmitted(true);
      } finally {
        setIsLoadingCheck(false);
      }
    };

    checkSubmissionStatus();
  }, [authToken]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleEnrollmentChange = (e) => {
    const isEnrolled = e.target.value === "yes";
    setFormData({ ...formData, isEnrolled, classYear: isEnrolled ? formData.classYear : "" });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (hasAlreadySubmitted === true || isLoadingCheck || !authToken) {
      setMessage("Submission not allowed at this time.");
      setMessageType("error");
      return;
    }

    setIsSubmitting(true);
    setMessage("");
    setMessageType("info");

    try {
      const response = await fetch("http://localhost:8000/api/student-information", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${authToken}`,
        },
        body: JSON.stringify(formData),
      });

      const result = await response.json();

      if (!response.ok) {
        if (response.status === 409) {
          setMessage(result.message || "You have already submitted this information.");
          setMessageType("error");
          setHasAlreadySubmitted(true);
        } else {
          throw new Error(result.message || `Failed to submit (${response.status})`);
        }
      } else {
        setMessage("Form submitted successfully!");
        setMessageType("success");
        setHasAlreadySubmitted(true);
      }
    } catch (error) {
      setMessage(`Error submitting form: ${error.message}. Please try again.`);
      setMessageType("error");
      console.error("Submission Error:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!authToken) {
    return (
      <div className="max-w-4xl mx-auto p-8 text-center text-red-600">
        <p>Error: Authentication token is missing. Please log in again.</p>
      </div>
    );
  }

  if (isLoadingCheck) {
    return (
      <div className="max-w-4xl mx-auto p-8 text-center text-gray-600">
        <svg className="animate-spin h-6 w-6 text-indigo-600 mx-auto mb-3" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
        </svg>
        Checking submission status...
      </div>
    );
  }

  if (hasAlreadySubmitted === true) {
    return (
      <div className="max-w-4xl mx-auto p-8 bg-white shadow-lg rounded-lg text-center">
        <h1 className="text-2xl font-bold mb-4 text-gray-800">Student Information</h1>
        <div
          className={`p-3 rounded text-sm font-medium ${
            messageType === "error"
              ? "bg-red-100 text-red-700 border border-red-300"
              : "bg-blue-100 text-blue-700 border border-blue-300"
          }`}
        >
          {message || "You have already submitted your student information."}
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-6 md:p-8 bg-white shadow-lg rounded-lg">
      <h1 className="text-2xl md:text-3xl font-bold mb-6 md:mb-8 text-center text-gray-800">
        Student Information Form
      </h1>

      {message && (
        <div
          className={`mb-4 p-3 rounded text-center text-sm font-medium ${
            messageType === "success"
              ? "bg-green-100 text-green-700 border border-green-300"
              : messageType === "error"
              ? "bg-red-100 text-red-700 border border-red-300"
              : ""
          }`}
        >
          {message}
        </div>
      )}

      <form className="space-y-5 md:space-y-6" onSubmit={handleSubmit}>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
          <div>
            <label htmlFor="fullName" className="block text-sm font-medium text-gray-700 mb-1">
              Full Name
            </label>
            <input
              id="fullName"
              type="text"
              name="fullName"
              placeholder="Enter your full name"
              value={formData.fullName}
              onChange={handleInputChange}
              className="mt-1 block w-full px-4 py-2.5 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
              required
              disabled={hasAlreadySubmitted === true}
            />
          </div>
          <div>
            <label htmlFor="idNo" className="block text-sm font-medium text-gray-700 mb-1">
              ID Number
            </label>
            <input
              id="idNo"
              type="text"
              name="idNo"
              placeholder="Enter your ID number"
              value={formData.idNo}
              onChange={handleInputChange}
              className="mt-1 block w-full px-4 py-2.5 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
              required
              disabled={hasAlreadySubmitted === true}
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
          <div>
            <label htmlFor="program" className="block text-sm font-medium text-gray-700 mb-1">
              Program
            </label>
            <input
              id="program"
              type="text"
              name="program"
              placeholder="e.g., Regular Degree"
              value={formData.program}
              onChange={handleInputChange}
              className="mt-1 block w-full px-4 py-2.5 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
              required
              disabled={hasAlreadySubmitted === true}
            />
          </div>
          <div>
            <label htmlFor="department" className="block text-sm font-medium text-gray-700 mb-1">
              Department
            </label>
            <input
              id="department"
              type="text"
              name="department"
              placeholder="Enter your department"
              value={formData.department}
              onChange={handleInputChange}
              className="mt-1 block w-full px-4 py-2.5 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
              required
              disabled={hasAlreadySubmitted === true}
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6 items-center">
          <div>
            <label htmlFor="graduationYear" className="block text-sm font-medium text-gray-700 mb-1">
              Year of Graduation (in GC)
            </label>
            <input
              id="graduationYear"
              type="text"
              name="graduationYear"
              placeholder="e.g., 2015"
              value={formData.graduationYear}
              onChange={handleInputChange}
              className="mt-1 block w-full px-4 py-2.5 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
              required
              pattern="\d{4}"
              title="Please enter a 4-digit year"
              disabled={hasAlreadySubmitted === true}
            />
          </div>
          <div className="pt-2 md:pt-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">Are you currently enrolled?</label>
            <div className="flex gap-x-4">
              <label className="inline-flex items-center">
                <input
                  type="radio"
                  name="enrollment"
                  value="yes"
                  checked={formData.isEnrolled === true}
                  onChange={handleEnrollmentChange}
                  className="form-radio h-4 w-4 text-indigo-600 border-gray-300 focus:ring-indigo-500"
                  disabled={hasAlreadySubmitted === true}
                />
                <span className="ml-2 text-sm text-gray-700">Yes</span>
              </label>
              <label className="inline-flex items-center">
                <input
                  type="radio"
                  name="enrollment"
                  value="no"
                  checked={formData.isEnrolled === false}
                  onChange={handleEnrollmentChange}
                  className="form-radio h-4 w-4 text-indigo-600 border-gray-300 focus:ring-indigo-500"
                  disabled={hasAlreadySubmitted === true}
                />
                <span className="ml-2 text-sm text-gray-700">No</span>
              </label>
            </div>
          </div>
        </div>

        {formData.isEnrolled && (
          <div>
            <label htmlFor="classYear" className="block text-sm font-medium text-gray-700 mb-1">
              Class Year
            </label>
            <input
              id="classYear"
              type="text"
              name="classYear"
              placeholder="Enter your current class year"
              value={formData.classYear}
              onChange={handleInputChange}
              className="mt-1 block w-full px-4 py-2.5 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
              required={formData.isEnrolled}
              disabled={hasAlreadySubmitted === true}
            />
          </div>
        )}

        <div className="pt-4">
          <button
            type="submit"
            disabled={isSubmitting || isLoadingCheck || hasAlreadySubmitted === true}
            className={`w-full flex justify-center items-center px-6 py-3 border border-transparent rounded-lg shadow-sm text-base font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition duration-150 ease-in-out ${
              isSubmitting || isLoadingCheck || hasAlreadySubmitted === true ? "opacity-50 cursor-not-allowed" : ""
            }`}
          >
            {isSubmitting ? (
              <>
                <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Submitting...
              </>
            ) : (
              "Submit Information"
            )}
          </button>
        </div>
      </form>
    </div>
  );
};

export default StudentForm;