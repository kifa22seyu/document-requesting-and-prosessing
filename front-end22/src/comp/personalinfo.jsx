// Inside PersonalInfo.jsx

import React, { useState } from "react";

const PersonalInfo = () => {
  const [formData, setFormData] = useState({
    englishName: "",
    amharicName: "",
    idNo: "",
    department: "",
    faculty: "",
    program: "",
    isEnrolled: false,
    date: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState("");

  const handleInputChange = (e) => {
    const { id, value } = e.target;
    setFormData({ ...formData, [id]: value });
  };

  const handleEnrollmentChange = (e) => {
    const isEnrolled = e.target.value === "yes";
    setFormData({ ...formData, isEnrolled });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setMessage("");

    // --- Step 1: Retrieve the token ---
    // Replace 'yourAuthTokenKey' with the actual key you use to store the token
    const token = localStorage.getItem('yourAuthTokenKey'); // Or sessionStorage, or context, etc.

    if (!token) {
        setMessage("Error: You are not logged in.");
        setIsSubmitting(false);
        console.error("Auth token not found.");
        return; // Stop the submission if no token exists
    }

    try {
      const response = await fetch("http://localhost:8000/api/personal-information", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          // --- Step 2: Add the Authorization header ---
          "Authorization": `Bearer ${token}` // Add this line
        },
        body: JSON.stringify(formData),
      });

      // Check for 401 or other auth errors specifically
      if (response.status === 401) {
          setMessage("Authentication failed. Please log in again.");
          // Optional: Redirect to login or clear token
          localStorage.removeItem('yourAuthTokenKey');
          throw new Error("Unauthorized");
      }

      if (!response.ok) {
          // Try to get error message from backend response body
          const errorData = await response.json().catch(() => ({})); // Attempt to parse JSON error
          const errorMessage = errorData.message || `Failed to submit form (Status: ${response.status})`;
          throw new Error(errorMessage);
      }

      const result = await response.json();
      setMessage("Form submitted successfully!");
      console.log("Submission Result:", result); // Log the success response
      // Optionally clear the form or redirect
      // setFormData({ ...initial empty state... });

    } catch (error) {
      // Avoid setting generic message if a specific one was set (like 401)
      if (!message) {
        setMessage(`Error submitting form: ${error.message}. Please try again.`);
      }
      console.error("Submission Error:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  // ... rest of your component return statement (JSX) ...
  return (
    <div className="max-w-4xl mx-auto p-8 bg-white shadow-lg rounded-lg">
       {/* ... Your existing JSX ... */}

        {/* Message Display - Consider styling for errors */}
        {message && (
          <div className={`mt-4 text-center text-sm font-medium ${message.startsWith("Error") || message.startsWith("Authentication failed") ? 'text-red-600' : 'text-green-600'}`}>
            {message}
          </div>
        )}

       {/* ... Your existing JSX ... */}
    </div>
  );
};

export default PersonalInfo;