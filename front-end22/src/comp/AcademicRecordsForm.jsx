import React, { useState, useCallback, useEffect } from "react"; // Import useEffect
import { useOutletContext } from "react-router-dom";

const AcademicRecordsForm = () => {
  // --- Get Auth Token ---
  const context = useOutletContext();
  const { authToken = null } = context || {};

  // --- State Variables ---
  const [totalFee, setTotalFee] = useState(0);
  const [checkedItems, setCheckedItems] = useState({});
  const [selectAll, setSelectAll] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState(""); // Changed from submitMessage for consistency
  const [messageType, setMessageType] = useState("info"); // Changed from submitMessageType

  // --- NEW: State for checking previous submission ---
  const [isLoadingCheck, setIsLoadingCheck] = useState(true); // Start loading initially
  const [hasAlreadySubmitted, setHasAlreadySubmitted] = useState(null); // null: unknown, true: yes, false: no
  // --- END NEW State ---

  // --- NEW: useEffect to check if a request already exists ---
  useEffect(() => {
    const checkSubmissionStatus = async () => {
      setIsLoadingCheck(true);
      setHasAlreadySubmitted(null); // Reset check status
      setMessage(""); // Clear any previous messages

      if (!authToken) {
        // Don't try to check if not authenticated
        setMessage("Authentication error. Please log in.");
        setMessageType("error");
        setHasAlreadySubmitted(true); // Treat as submitted to disable form
        setIsLoadingCheck(false);
        return;
      }

      try {
        // IMPORTANT: You need to create this endpoint on your backend
        const response = await fetch("http://localhost:8000/api/request-form/check", {
          method: "GET",
          headers: {
            Authorization: `Bearer ${authToken}`,
            "Content-Type": "application/json",
          },
        });

        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}));
          // Handle specific errors like 404 if needed, otherwise generic message
          throw new Error(errorData.message || `Failed to check request status (${response.status})`);
        }

        const result = await response.json();
        setHasAlreadySubmitted(result.exists); // Expecting { exists: boolean } from backend

        if (result.exists) {
          // Set the message that will be shown persistently
          setMessage("You have already submitted an academic records request.");
          setMessageType("info");
        }
      } catch (error) {
        console.error("Error checking request submission status:", error);
        setMessage(`Could not verify submission status: ${error.message}. Form disabled.`);
        setMessageType("error");
        setHasAlreadySubmitted(true); // Disable form if check fails
      } finally {
        setIsLoadingCheck(false); // Finish loading check
      }
    };

    checkSubmissionStatus();
    // Rerun check if authToken changes
  }, [authToken]);
  // --- END NEW useEffect ---


  const fees = {
    // --- Your extensive fees object remains unchanged ---
    "Student copy/temporary certificate upon graduation (Regular)": 0,
    "Student copy in person (Before Graduation)": 50,
    "Original degree issuance for Regular": 150,
    "Original degree issuance for CCDE": 150,
    "Temporary certificate replacement": 125,
    "Original degree replacement": 300,
    "Official transcript local destination": 50,
    "Official transcript foreign destination": 100,
    "Student Transcript/copy replacement": 30,
    "To whom it may concern in person": 25,
    "To whom it may concern local destination": 50,
    "To whom it may concern foreign destination": 100,
    "Authentication per page in person": 25,
    "Authentication per page local destination": 50,
    "Authentication per page foreign destination": 100,
    "Copying of documents from files/page": 10,
    "Other certificates and letters": 25,
    "Other certificates and letters local destination": 50,
    "Other certificates and letters foreign destination": 100,
    "Other documents per page in person": 25,
    "Other documents per page local destination": 50,
    "Other documents per page foreign destination": 100,
    "Recommendation letter": 50,
    "Confirmation of medium of instruction": 50,
    "Application Fee, CCDE": 60,
    "Application Fee, PG": 29,
    "Advanced stand application": 80,
    "Registration, Regular": 56,
    "Registration, CCDE": 56,
    "Registration, PG": 56,
    "Registration, Regular with penalty (1st day)": 75,
    "Registration, Regular with penalty (2nd day)": 100,
    "Registration, Regular with penalty (3rd day)": 125,
    "Registration, CCDE with penalty (1st day)": 75,
    "Registration, CCDE with penalty (2nd day)": 100,
    "Registration, CCDE with penalty (3rd day)": 125,
    "Registration, PG with penalty (1st day)": 75,
    "Registration, PG with penalty (2nd day)": 100,
    "Registration, PG with penalty (3rd day)": 125,
    "ID Issuance, Regular": 0,
    "ID Issuance (Smart ID), CCDE": 150,
    "ID Issuance (Old), CCDE": 150,
    "ID replacement (Smart ID)": 50,
    "ID replacement (Old)": 50,
    "ID warn out due to mishandling (Old)": 50,
    "Readmission Application, Regular": 30,
    "Readmission Application, CCDE": 30,
    "Readmission Application, PG": 30,
    "Transfer Application": 30,
    "Re-assessment": 30,
    "Make-up/Exp. Exam, Summer program": 300,
    "Make-up/Exp. Exam, Evening program": 300,
    "Make-up/Exp. Exam, Weekend program": 300,
    "Make-up/Exp. Exam, Distance program": 300,
    "Course exemption": 50,
    "Lost clearance": 50,
    "Delayed clearance, Regular": 50,
    "Delayed clearance, CCDE": 60,
    "Delayed clearance, PG": 80,
    "Name change (For active student)": 60,
    "Name change (For graduated students)": 150,
    "Birth date change": 100,
    "To change spelling error committed by students": 100,
    "Delegation": 50,
    "Delegation by email": 60,
    "Online document verification": 60,
    // --- End of fees object ---
  };

  const handleCheckboxChange = (event) => {
    // No changes needed here, logic remains the same
    const checkbox = event.target;
    const labelElement = checkbox.closest("label");
    if (!labelElement) return;
    const documentType = labelElement.textContent.trim();
    if (!fees.hasOwnProperty(documentType)) return;
    const fee = fees[documentType] || 0;
    setCheckedItems((prev) => ({ ...prev, [documentType]: checkbox.checked }));
    setTotalFee((prevFee) => (checkbox.checked ? prevFee + fee : prevFee - fee));
    if (!checkbox.checked) setSelectAll(false);
  };

  const handleSelectAll = useCallback(() => {
    // No changes needed here, logic remains the same
    const nextSelectAllState = !selectAll;
    setSelectAll(nextSelectAllState);
    const newCheckedItems = {};
    let newTotalFee = 0;
    Object.keys(fees).forEach((key) => {
      if (fees.hasOwnProperty(key)) {
        newCheckedItems[key] = nextSelectAllState;
        if (nextSelectAllState) newTotalFee += fees[key] || 0;
      }
    });
    setCheckedItems(newCheckedItems);
    setTotalFee(newTotalFee);
  }, [selectAll, fees]);

  const handleSubmit = async (event) => {
    event.preventDefault();
    setMessage("");
    setMessageType("info");

    // --- Prevent submission if already submitted, loading, or not authenticated ---
    if (hasAlreadySubmitted === true || isLoadingCheck || !authToken) {
      setMessage("Submission not allowed at this time.");
      setMessageType("error");
      return;
    }
    // --- End prevention check ---

    const selectedDocuments = Object.keys(checkedItems).filter((key) => checkedItems[key] === true);
    if (selectedDocuments.length === 0) {
      setMessage("Please select at least one document to request.");
      setMessageType("error");
      return;
    }

    setIsSubmitting(true);
    const formData = { selectedItems: selectedDocuments, totalFee: totalFee };

    try {
      const response = await fetch("http://localhost:8000/api/request-form", { // Endpoint for submitting the form
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${authToken}`,
        },
        body: JSON.stringify(formData),
      });
      const responseData = await response.json().catch(() => ({ message: `Received non-JSON response (Status: ${response.status})` }));

      if (response.ok) { // Success (e.g., 201 Created)
        setMessage(responseData.message || "Request submitted successfully!");
        setMessageType("success");
        // --- IMPORTANT: Set hasAlreadySubmitted to true on success ---
        setHasAlreadySubmitted(true);
        // --- DO NOT reset the form fields here, as it will be hidden ---
      } else {
        // Handle specific errors like 409 Conflict (if backend implements unique check)
        if (response.status === 409) {
             setMessage(responseData.message || "You have already submitted an academic records request.");
             setMessageType("error"); // Use error type for consistency with StudentForm
             setHasAlreadySubmitted(true); // Ensure state reflects backend reality
        } else {
            // Handle other errors (400, 500, etc.)
            console.error("Submission Error:", response.status, responseData);
            setMessage(responseData.message || `Error: ${response.statusText} (${response.status}). Please try again.`);
            setMessageType("error");
        }
      }
    } catch (error) {
      console.error("Network/Fetch Error:", error);
      setMessage("A network error occurred. Please check connection and try again.");
      setMessageType("error");
    } finally {
      setIsSubmitting(false);
    }
  };

  // --- Render Logic ---
  // 1. Check for Auth Token
  if (!context) return <div className="max-w-4xl mx-auto p-8 text-center text-gray-600">Loading authentication context...</div>;
  if (!authToken) return <div className="max-w-4xl mx-auto p-8 text-center text-red-600"><p>Authentication token is missing. Please log in.</p></div>;

  // 2. Show Loading state while checking previous submissions
  if (isLoadingCheck) {
    return (
      <div className="max-w-4xl mx-auto p-8 text-center text-gray-600">
        <svg className="animate-spin h-6 w-6 text-indigo-600 mx-auto mb-3" viewBox="0 0 24 24"> {/* Spinner SVG */}
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
        </svg>
        Checking submission status...
      </div>
    );
  }

  // 3. Show "Already Submitted" message if check is complete and submission exists
  //    (or if check failed, as hasAlreadySubmitted will be true)
  if (hasAlreadySubmitted === true) {
     return (
      <div className="max-w-4xl mx-auto p-8 bg-white shadow-lg rounded-lg text-center">
        <h1 className="text-2xl font-bold mb-4 text-gray-800">Academic Records Request</h1>
        <div
          className={`p-3 rounded text-sm font-medium ${
            messageType === "error" // Use error style if the check failed
              ? "bg-red-100 text-red-700 border border-red-300"
              : "bg-blue-100 text-blue-700 border border-blue-300" // Info style if already submitted
          }`}
        >
          {/* Display the message set in useEffect or handleSubmit */}
          {message || "You have already submitted an academic records request."}
        </div>
        {/* Optionally add link to view request status */}
      </div>
    );
  }


  // 4. Render the form if check complete and no prior submission found
  return (
    <div className="p-4 md:p-8 bg-gray-100 min-h-screen">
      <div className="bg-white p-4 md:p-6 rounded-lg shadow-lg max-w-5xl mx-auto">
        <h1 className="text-xl md:text-2xl font-bold text-center mb-4">
          ARBA MÌNCH UNIVERSITY
        </h1>
        <h2 className="text-lg md:text-xl font-semibold text-center mb-6">
          OFFICE OF REGISTRAR AND ALUMNI DIRECTORATE ACADEMIC RECORDS REQUEST FORM
        </h2>
        <form onSubmit={handleSubmit}>
           {/* Select/Deselect All Button */}
          <div className="flex justify-end mb-4">
            <button
              type="button"
              // Disable if form should be permanently disabled (which it is now due to hasAlreadySubmitted check)
              className={`bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded text-sm transition duration-150 ease-in-out ${isSubmitting || hasAlreadySubmitted ? 'opacity-50 cursor-not-allowed' : ''}`}
              onClick={handleSelectAll}
              disabled={isSubmitting || hasAlreadySubmitted}
            >
              {selectAll ? "Deselect All" : "Select All"}
            </button>
          </div>

          {/* Display submission messages (like transient errors) */}
          {message && messageType === 'error' && !hasAlreadySubmitted && (
            <div className={`my-4 p-3 rounded text-center text-sm font-medium border bg-red-100 text-red-700 border-red-300`}>
              {message}
            </div>
          )}
           {/* Success messages might not be seen as the component will re-render to the 'already submitted' view */}


          {/* Unified Table */}
          <div className="overflow-x-auto border border-gray-200 rounded-lg shadow-sm mb-4">
            <table className="w-full min-w-[700px] border-collapse text-sm">
              {/* ... thead remains the same ... */}
              <thead className="bg-gray-50">
                <tr>
                  <th className="p-3 border-b border-gray-200 text-left font-semibold text-gray-600 uppercase tracking-wider sticky left-0 bg-gray-50 z-10">Section</th>
                  <th className="p-3 border-b border-gray-200 text-left font-semibold text-gray-600 uppercase tracking-wider">Document Type</th>
                  <th className="p-3 border-b border-gray-200 text-right font-semibold text-gray-600 uppercase tracking-wider">Fee (Birr)</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {/* --- RENDER ALL TABLE ROWS AS BEFORE --- */}
                 {/* Make sure checkboxes are disabled if hasAlreadySubmitted is true */}
                 {/* Example for one row, apply pattern to all checkboxes */}
                    <tr>
                        <td className="p-3 border-r border-gray-200 font-medium text-gray-700 align-top sticky left-0 bg-white z-10" rowSpan="6">1. Student Copy</td>
                        <td className="p-3 border-r border-gray-200 text-gray-800">
                            <label className={`flex items-center ${hasAlreadySubmitted ? 'cursor-not-allowed opacity-70' : 'cursor-pointer'}`}>
                                <input
                                  type="checkbox"
                                  className="mr-3 form-checkbox h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500 focus:ring-offset-0"
                                  checked={checkedItems["Student copy/temporary certificate upon graduation (Regular)"] || false}
                                  onChange={handleCheckboxChange}
                                  disabled={isSubmitting || hasAlreadySubmitted} // <<< Disable here
                                 />
                                Student copy/temporary certificate upon graduation (Regular)
                            </label>
                        </td>
                        <td className="p-3 text-right text-gray-600">Free</td>
                    </tr>
                    {/* ... Apply disabled={isSubmitting || hasAlreadySubmitted} to ALL input checkboxes ... */}
                    <tr>
                         <td className="p-3 border-r border-gray-200 text-gray-800">
                           <label className={`flex items-center ${hasAlreadySubmitted ? 'cursor-not-allowed opacity-70' : 'cursor-pointer'}`}>
                               <input type="checkbox" className="mr-3 form-checkbox h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500 focus:ring-offset-0" checked={checkedItems["Student copy in person (Before Graduation)"] || false} onChange={handleCheckboxChange} disabled={isSubmitting || hasAlreadySubmitted}/>
                               Student copy in person (Before Graduation)
                           </label>
                        </td>
                        <td className="p-3 text-right text-gray-600">50</td>
                    </tr>
                     <tr>
                         <td className="p-3 border-r border-gray-200 text-gray-800">
                           <label className={`flex items-center ${hasAlreadySubmitted ? 'cursor-not-allowed opacity-70' : 'cursor-pointer'}`}>
                               <input type="checkbox" className="mr-3 form-checkbox h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500 focus:ring-offset-0" checked={checkedItems["Original degree issuance for Regular"] || false} onChange={handleCheckboxChange} disabled={isSubmitting || hasAlreadySubmitted}/>
                               Original degree issuance for Regular
                           </label>
                        </td>
                        <td className="p-3 text-right text-gray-600">150</td>
                    </tr>
                     {/* ... (Continue applying disabled attribute to all checkboxes in the table) ... */}

                {/* --- REMAINING TABLE ROWS --- */}
                {/* Ensure ALL checkboxes inside the tbody have disabled={isSubmitting || hasAlreadySubmitted} */}
                {/* --- END TABLE ROWS --- */}
                 <tr>
                        <td className="p-3 border-r border-gray-200 text-gray-800">
                            <label className={`flex items-center ${hasAlreadySubmitted ? 'cursor-not-allowed opacity-70' : 'cursor-pointer'}`}>
                                <input type="checkbox" className="mr-3 form-checkbox h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500 focus:ring-offset-0" checked={checkedItems["Original degree issuance for CCDE"] || false} onChange={handleCheckboxChange} disabled={isSubmitting || hasAlreadySubmitted}/>
                                Original degree issuance for CCDE
                            </label>
                        </td>
                        <td className="p-3 text-right text-gray-600">150</td>
                    </tr>
                    <tr>
                        <td className="p-3 border-r border-gray-200 text-gray-800">
                            <label className={`flex items-center ${hasAlreadySubmitted ? 'cursor-not-allowed opacity-70' : 'cursor-pointer'}`}>
                                <input type="checkbox" className="mr-3 form-checkbox h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500 focus:ring-offset-0" checked={checkedItems["Temporary certificate replacement"] || false} onChange={handleCheckboxChange} disabled={isSubmitting || hasAlreadySubmitted}/>
                                Temporary certificate replacement
                            </label>
                        </td>
                        <td className="p-3 text-right text-gray-600">125</td>
                    </tr>
                    <tr>
                        <td className="p-3 border-r border-gray-200 text-gray-800">
                            <label className={`flex items-center ${hasAlreadySubmitted ? 'cursor-not-allowed opacity-70' : 'cursor-pointer'}`}>
                                <input type="checkbox" className="mr-3 form-checkbox h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500 focus:ring-offset-0" checked={checkedItems["Original degree replacement"] || false} onChange={handleCheckboxChange} disabled={isSubmitting || hasAlreadySubmitted}/>
                                Original degree replacement
                            </label>
                        </td>
                        <td className="p-3 text-right text-gray-600">300</td>
                    </tr>

                    {/* Section 2: Official Transcript */}
                    <tr>
                        <td className="p-3 border-r border-gray-200 font-medium text-gray-700 align-top sticky left-0 bg-white z-10" rowSpan="3">2. Official Transcript</td>
                        <td className="p-3 border-r border-gray-200 text-gray-800">
                            <label className={`flex items-center ${hasAlreadySubmitted ? 'cursor-not-allowed opacity-70' : 'cursor-pointer'}`}>
                                <input type="checkbox" className="mr-3 form-checkbox h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500 focus:ring-offset-0" checked={checkedItems["Official transcript local destination"] || false} onChange={handleCheckboxChange} disabled={isSubmitting || hasAlreadySubmitted}/>
                                Official transcript local destination
                            </label>
                        </td>
                        <td className="p-3 text-right text-gray-600">50</td>
                    </tr>
                    <tr>
                        <td className="p-3 border-r border-gray-200 text-gray-800">
                            <label className={`flex items-center ${hasAlreadySubmitted ? 'cursor-not-allowed opacity-70' : 'cursor-pointer'}`}>
                                <input type="checkbox" className="mr-3 form-checkbox h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500 focus:ring-offset-0" checked={checkedItems["Official transcript foreign destination"] || false} onChange={handleCheckboxChange} disabled={isSubmitting || hasAlreadySubmitted}/>
                                Official transcript foreign destination
                            </label>
                        </td>
                        <td className="p-3 text-right text-gray-600">100</td>
                    </tr>
                    <tr>
                        <td className="p-3 border-r border-gray-200 text-gray-800">
                            <label className={`flex items-center ${hasAlreadySubmitted ? 'cursor-not-allowed opacity-70' : 'cursor-pointer'}`}>
                                <input type="checkbox" className="mr-3 form-checkbox h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500 focus:ring-offset-0" checked={checkedItems["Student Transcript/copy replacement"] || false} onChange={handleCheckboxChange} disabled={isSubmitting || hasAlreadySubmitted}/>
                                Student Transcript/copy replacement
                            </label>
                        </td>
                        <td className="p-3 text-right text-gray-600">30</td>
                    </tr>

                    {/* Section 3: To Whom and Authentication */}
                    <tr>
                       <td className="p-3 border-r border-gray-200 font-medium text-gray-700 align-top sticky left-0 bg-white z-10" rowSpan="7">3. To Whom and Authentication</td>
                       <td className="p-3 border-r border-gray-200 text-gray-800">
                           <label className={`flex items-center ${hasAlreadySubmitted ? 'cursor-not-allowed opacity-70' : 'cursor-pointer'}`}>
                               <input type="checkbox" className="mr-3 form-checkbox h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500 focus:ring-offset-0" checked={checkedItems["To whom it may concern in person"] || false} onChange={handleCheckboxChange} disabled={isSubmitting || hasAlreadySubmitted}/>
                               To whom it may concern in person
                           </label>
                       </td>
                       <td className="p-3 text-right text-gray-600">25</td>
                    </tr>
                     <tr>
                       <td className="p-3 border-r border-gray-200 text-gray-800">
                           <label className={`flex items-center ${hasAlreadySubmitted ? 'cursor-not-allowed opacity-70' : 'cursor-pointer'}`}>
                               <input type="checkbox" className="mr-3 form-checkbox h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500 focus:ring-offset-0" checked={checkedItems["To whom it may concern local destination"] || false} onChange={handleCheckboxChange} disabled={isSubmitting || hasAlreadySubmitted}/>
                               To whom it may concern local destination
                           </label>
                       </td>
                       <td className="p-3 text-right text-gray-600">50</td>
                    </tr>
                     <tr>
                       <td className="p-3 border-r border-gray-200 text-gray-800">
                           <label className={`flex items-center ${hasAlreadySubmitted ? 'cursor-not-allowed opacity-70' : 'cursor-pointer'}`}>
                               <input type="checkbox" className="mr-3 form-checkbox h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500 focus:ring-offset-0" checked={checkedItems["To whom it may concern foreign destination"] || false} onChange={handleCheckboxChange} disabled={isSubmitting || hasAlreadySubmitted}/>
                               To whom it may concern foreign destination
                           </label>
                       </td>
                       <td className="p-3 text-right text-gray-600">100</td>
                    </tr>
                     <tr>
                       <td className="p-3 border-r border-gray-200 text-gray-800">
                           <label className={`flex items-center ${hasAlreadySubmitted ? 'cursor-not-allowed opacity-70' : 'cursor-pointer'}`}>
                               <input type="checkbox" className="mr-3 form-checkbox h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500 focus:ring-offset-0" checked={checkedItems["Authentication per page in person"] || false} onChange={handleCheckboxChange} disabled={isSubmitting || hasAlreadySubmitted}/>
                               Authentication per page in person
                           </label>
                       </td>
                       <td className="p-3 text-right text-gray-600">25</td>
                    </tr>
                     <tr>
                       <td className="p-3 border-r border-gray-200 text-gray-800">
                           <label className={`flex items-center ${hasAlreadySubmitted ? 'cursor-not-allowed opacity-70' : 'cursor-pointer'}`}>
                               <input type="checkbox" className="mr-3 form-checkbox h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500 focus:ring-offset-0" checked={checkedItems["Authentication per page local destination"] || false} onChange={handleCheckboxChange} disabled={isSubmitting || hasAlreadySubmitted}/>
                               Authentication per page local destination
                           </label>
                       </td>
                       <td className="p-3 text-right text-gray-600">50</td>
                    </tr>
                     <tr>
                       <td className="p-3 border-r border-gray-200 text-gray-800">
                           <label className={`flex items-center ${hasAlreadySubmitted ? 'cursor-not-allowed opacity-70' : 'cursor-pointer'}`}>
                               <input type="checkbox" className="mr-3 form-checkbox h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500 focus:ring-offset-0" checked={checkedItems["Authentication per page foreign destination"] || false} onChange={handleCheckboxChange} disabled={isSubmitting || hasAlreadySubmitted}/>
                               Authentication per page foreign destination
                           </label>
                       </td>
                       <td className="p-3 text-right text-gray-600">100</td>
                    </tr>
                     <tr>
                       <td className="p-3 border-r border-gray-200 text-gray-800">
                           <label className={`flex items-center ${hasAlreadySubmitted ? 'cursor-not-allowed opacity-70' : 'cursor-pointer'}`}>
                               <input type="checkbox" className="mr-3 form-checkbox h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500 focus:ring-offset-0" checked={checkedItems["Copying of documents from files/page"] || false} onChange={handleCheckboxChange} disabled={isSubmitting || hasAlreadySubmitted}/>
                               Copying of documents from files/page
                           </label>
                       </td>
                       <td className="p-3 text-right text-gray-600">10</td>
                    </tr>

                    {/* Section 4: Other Certificates, Documents, and Letters */}
                     <tr>
                       <td className="p-3 border-r border-gray-200 font-medium text-gray-700 align-top sticky left-0 bg-white z-10" rowSpan="8">4. Other Certificates, Documents, and Letters</td>
                       <td className="p-3 border-r border-gray-200 text-gray-800">
                           <label className={`flex items-center ${hasAlreadySubmitted ? 'cursor-not-allowed opacity-70' : 'cursor-pointer'}`}>
                               <input type="checkbox" className="mr-3 form-checkbox h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500 focus:ring-offset-0" checked={checkedItems["Other certificates and letters"] || false} onChange={handleCheckboxChange} disabled={isSubmitting || hasAlreadySubmitted}/>
                               Other certificates and letters
                           </label>
                       </td>
                       <td className="p-3 text-right text-gray-600">25</td>
                    </tr>
                    <tr>
                       <td className="p-3 border-r border-gray-200 text-gray-800">
                           <label className={`flex items-center ${hasAlreadySubmitted ? 'cursor-not-allowed opacity-70' : 'cursor-pointer'}`}>
                               <input type="checkbox" className="mr-3 form-checkbox h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500 focus:ring-offset-0" checked={checkedItems["Other certificates and letters local destination"] || false} onChange={handleCheckboxChange} disabled={isSubmitting || hasAlreadySubmitted}/>
                               Other certificates and letters local destination
                           </label>
                       </td>
                       <td className="p-3 text-right text-gray-600">50</td>
                    </tr>
                    <tr>
                       <td className="p-3 border-r border-gray-200 text-gray-800">
                           <label className={`flex items-center ${hasAlreadySubmitted ? 'cursor-not-allowed opacity-70' : 'cursor-pointer'}`}>
                               <input type="checkbox" className="mr-3 form-checkbox h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500 focus:ring-offset-0" checked={checkedItems["Other certificates and letters foreign destination"] || false} onChange={handleCheckboxChange} disabled={isSubmitting || hasAlreadySubmitted}/>
                               Other certificates and letters foreign destination
                           </label>
                       </td>
                       <td className="p-3 text-right text-gray-600">100</td>
                    </tr>
                    <tr>
                       <td className="p-3 border-r border-gray-200 text-gray-800">
                           <label className={`flex items-center ${hasAlreadySubmitted ? 'cursor-not-allowed opacity-70' : 'cursor-pointer'}`}>
                               <input type="checkbox" className="mr-3 form-checkbox h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500 focus:ring-offset-0" checked={checkedItems["Other documents per page in person"] || false} onChange={handleCheckboxChange} disabled={isSubmitting || hasAlreadySubmitted}/>
                               Other documents per page in person
                           </label>
                       </td>
                       <td className="p-3 text-right text-gray-600">25</td>
                    </tr>
                    <tr>
                       <td className="p-3 border-r border-gray-200 text-gray-800">
                           <label className={`flex items-center ${hasAlreadySubmitted ? 'cursor-not-allowed opacity-70' : 'cursor-pointer'}`}>
                               <input type="checkbox" className="mr-3 form-checkbox h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500 focus:ring-offset-0" checked={checkedItems["Other documents per page local destination"] || false} onChange={handleCheckboxChange} disabled={isSubmitting || hasAlreadySubmitted}/>
                               Other documents per page local destination
                           </label>
                       </td>
                       <td className="p-3 text-right text-gray-600">50</td>
                    </tr>
                    <tr>
                       <td className="p-3 border-r border-gray-200 text-gray-800">
                           <label className={`flex items-center ${hasAlreadySubmitted ? 'cursor-not-allowed opacity-70' : 'cursor-pointer'}`}>
                               <input type="checkbox" className="mr-3 form-checkbox h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500 focus:ring-offset-0" checked={checkedItems["Other documents per page foreign destination"] || false} onChange={handleCheckboxChange} disabled={isSubmitting || hasAlreadySubmitted}/>
                               Other documents per page foreign destination
                           </label>
                       </td>
                       <td className="p-3 text-right text-gray-600">100</td>
                    </tr>
                     <tr>
                       <td className="p-3 border-r border-gray-200 text-gray-800">
                           <label className={`flex items-center ${hasAlreadySubmitted ? 'cursor-not-allowed opacity-70' : 'cursor-pointer'}`}>
                               <input type="checkbox" className="mr-3 form-checkbox h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500 focus:ring-offset-0" checked={checkedItems["Recommendation letter"] || false} onChange={handleCheckboxChange} disabled={isSubmitting || hasAlreadySubmitted}/>
                               Recommendation letter
                           </label>
                       </td>
                       <td className="p-3 text-right text-gray-600">50</td>
                    </tr>
                     <tr>
                       <td className="p-3 border-r border-gray-200 text-gray-800">
                           <label className={`flex items-center ${hasAlreadySubmitted ? 'cursor-not-allowed opacity-70' : 'cursor-pointer'}`}>
                               <input type="checkbox" className="mr-3 form-checkbox h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500 focus:ring-offset-0" checked={checkedItems["Confirmation of medium of instruction"] || false} onChange={handleCheckboxChange} disabled={isSubmitting || hasAlreadySubmitted}/>
                               Confirmation of medium of instruction
                           </label>
                       </td>
                       <td className="p-3 text-right text-gray-600">50</td>
                    </tr>

                     {/* Section 5a: Application and Registration */}
                     <tr>
                       <td className="p-3 border-r border-gray-200 font-medium text-gray-700 align-top sticky left-0 bg-white z-10" rowSpan="9">5a. Application and Registration</td>
                       <td className="p-3 border-r border-gray-200 text-gray-800">
                           <label className={`flex items-center ${hasAlreadySubmitted ? 'cursor-not-allowed opacity-70' : 'cursor-pointer'}`}>
                               <input type="checkbox" className="mr-3 form-checkbox h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500 focus:ring-offset-0" checked={checkedItems["Application Fee, CCDE"] || false} onChange={handleCheckboxChange} disabled={isSubmitting || hasAlreadySubmitted}/>
                               Application Fee, CCDE
                           </label>
                       </td>
                       <td className="p-3 text-right text-gray-600">60</td>
                    </tr>
                     <tr>
                       <td className="p-3 border-r border-gray-200 text-gray-800">
                           <label className={`flex items-center ${hasAlreadySubmitted ? 'cursor-not-allowed opacity-70' : 'cursor-pointer'}`}>
                               <input type="checkbox" className="mr-3 form-checkbox h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500 focus:ring-offset-0" checked={checkedItems["Application Fee, PG"] || false} onChange={handleCheckboxChange} disabled={isSubmitting || hasAlreadySubmitted}/>
                               Application Fee, PG
                           </label>
                       </td>
                       <td className="p-3 text-right text-gray-600">29</td>
                    </tr>
                     <tr>
                       <td className="p-3 border-r border-gray-200 text-gray-800">
                           <label className={`flex items-center ${hasAlreadySubmitted ? 'cursor-not-allowed opacity-70' : 'cursor-pointer'}`}>
                               <input type="checkbox" className="mr-3 form-checkbox h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500 focus:ring-offset-0" checked={checkedItems["Advanced stand application"] || false} onChange={handleCheckboxChange} disabled={isSubmitting || hasAlreadySubmitted}/>
                               Advanced stand application
                           </label>
                       </td>
                       <td className="p-3 text-right text-gray-600">80</td>
                    </tr>
                     <tr>
                       <td className="p-3 border-r border-gray-200 text-gray-800">
                           <label className={`flex items-center ${hasAlreadySubmitted ? 'cursor-not-allowed opacity-70' : 'cursor-pointer'}`}>
                               <input type="checkbox" className="mr-3 form-checkbox h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500 focus:ring-offset-0" checked={checkedItems["Registration, Regular"] || false} onChange={handleCheckboxChange} disabled={isSubmitting || hasAlreadySubmitted}/>
                               Registration, Regular
                           </label>
                       </td>
                       <td className="p-3 text-right text-gray-600">56</td>
                    </tr>
                     <tr>
                       <td className="p-3 border-r border-gray-200 text-gray-800">
                           <label className={`flex items-center ${hasAlreadySubmitted ? 'cursor-not-allowed opacity-70' : 'cursor-pointer'}`}>
                               <input type="checkbox" className="mr-3 form-checkbox h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500 focus:ring-offset-0" checked={checkedItems["Registration, CCDE"] || false} onChange={handleCheckboxChange} disabled={isSubmitting || hasAlreadySubmitted}/>
                               Registration, CCDE
                           </label>
                       </td>
                       <td className="p-3 text-right text-gray-600">56</td>
                    </tr>
                     <tr>
                       <td className="p-3 border-r border-gray-200 text-gray-800">
                           <label className={`flex items-center ${hasAlreadySubmitted ? 'cursor-not-allowed opacity-70' : 'cursor-pointer'}`}>
                               <input type="checkbox" className="mr-3 form-checkbox h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500 focus:ring-offset-0" checked={checkedItems["Registration, PG"] || false} onChange={handleCheckboxChange} disabled={isSubmitting || hasAlreadySubmitted}/>
                               Registration, PG
                           </label>
                       </td>
                       <td className="p-3 text-right text-gray-600">56</td>
                    </tr>
                     <tr>
                       <td className="p-3 border-r border-gray-200 text-gray-800">
                           <label className={`flex items-center ${hasAlreadySubmitted ? 'cursor-not-allowed opacity-70' : 'cursor-pointer'}`}>
                               <input type="checkbox" className="mr-3 form-checkbox h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500 focus:ring-offset-0" checked={checkedItems["Registration, Regular with penalty (1st day)"] || false} onChange={handleCheckboxChange} disabled={isSubmitting || hasAlreadySubmitted}/>
                               Registration, Regular with penalty (1st day)
                           </label>
                       </td>
                       <td className="p-3 text-right text-gray-600">75</td>
                    </tr>
                     <tr>
                       <td className="p-3 border-r border-gray-200 text-gray-800">
                           <label className={`flex items-center ${hasAlreadySubmitted ? 'cursor-not-allowed opacity-70' : 'cursor-pointer'}`}>
                               <input type="checkbox" className="mr-3 form-checkbox h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500 focus:ring-offset-0" checked={checkedItems["Registration, Regular with penalty (2nd day)"] || false} onChange={handleCheckboxChange} disabled={isSubmitting || hasAlreadySubmitted}/>
                               Registration, Regular with penalty (2nd day)
                           </label>
                       </td>
                       <td className="p-3 text-right text-gray-600">100</td>
                    </tr>
                     <tr>
                       <td className="p-3 border-r border-gray-200 text-gray-800">
                           <label className={`flex items-center ${hasAlreadySubmitted ? 'cursor-not-allowed opacity-70' : 'cursor-pointer'}`}>
                               <input type="checkbox" className="mr-3 form-checkbox h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500 focus:ring-offset-0" checked={checkedItems["Registration, Regular with penalty (3rd day)"] || false} onChange={handleCheckboxChange} disabled={isSubmitting || hasAlreadySubmitted}/>
                               Registration, Regular with penalty (3rd day)
                           </label>
                       </td>
                       <td className="p-3 text-right text-gray-600">125</td>
                    </tr>

                     {/* Section 5b: Application and Registration */}
                     <tr>
                        <td className="p-3 border-r border-gray-200 font-medium text-gray-700 align-top sticky left-0 bg-white z-10" rowSpan="6">5b. Application and Registration</td>
                        <td className="p-3 border-r border-gray-200 text-gray-800">
                           <label className={`flex items-center ${hasAlreadySubmitted ? 'cursor-not-allowed opacity-70' : 'cursor-pointer'}`}>
                               <input type="checkbox" className="mr-3 form-checkbox h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500 focus:ring-offset-0" checked={checkedItems["Registration, CCDE with penalty (1st day)"] || false} onChange={handleCheckboxChange} disabled={isSubmitting || hasAlreadySubmitted}/>
                               Registration, CCDE with penalty (1st day)
                           </label>
                        </td>
                        <td className="p-3 text-right text-gray-600">75</td>
                    </tr>
                    <tr>
                        <td className="p-3 border-r border-gray-200 text-gray-800">
                           <label className={`flex items-center ${hasAlreadySubmitted ? 'cursor-not-allowed opacity-70' : 'cursor-pointer'}`}>
                               <input type="checkbox" className="mr-3 form-checkbox h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500 focus:ring-offset-0" checked={checkedItems["Registration, CCDE with penalty (2nd day)"] || false} onChange={handleCheckboxChange} disabled={isSubmitting || hasAlreadySubmitted}/>
                               Registration, CCDE with penalty (2nd day)
                           </label>
                        </td>
                        <td className="p-3 text-right text-gray-600">100</td>
                    </tr>
                    <tr>
                        <td className="p-3 border-r border-gray-200 text-gray-800">
                           <label className={`flex items-center ${hasAlreadySubmitted ? 'cursor-not-allowed opacity-70' : 'cursor-pointer'}`}>
                               <input type="checkbox" className="mr-3 form-checkbox h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500 focus:ring-offset-0" checked={checkedItems["Registration, CCDE with penalty (3rd day)"] || false} onChange={handleCheckboxChange} disabled={isSubmitting || hasAlreadySubmitted}/>
                               Registration, CCDE with penalty (3rd day)
                           </label>
                        </td>
                        <td className="p-3 text-right text-gray-600">125</td>
                    </tr>
                    <tr>
                        <td className="p-3 border-r border-gray-200 text-gray-800">
                           <label className={`flex items-center ${hasAlreadySubmitted ? 'cursor-not-allowed opacity-70' : 'cursor-pointer'}`}>
                               <input type="checkbox" className="mr-3 form-checkbox h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500 focus:ring-offset-0" checked={checkedItems["Registration, PG with penalty (1st day)"] || false} onChange={handleCheckboxChange} disabled={isSubmitting || hasAlreadySubmitted}/>
                               Registration, PG with penalty (1st day)
                           </label>
                        </td>
                        <td className="p-3 text-right text-gray-600">75</td>
                    </tr>
                    <tr>
                        <td className="p-3 border-r border-gray-200 text-gray-800">
                           <label className={`flex items-center ${hasAlreadySubmitted ? 'cursor-not-allowed opacity-70' : 'cursor-pointer'}`}>
                               <input type="checkbox" className="mr-3 form-checkbox h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500 focus:ring-offset-0" checked={checkedItems["Registration, PG with penalty (2nd day)"] || false} onChange={handleCheckboxChange} disabled={isSubmitting || hasAlreadySubmitted}/>
                               Registration, PG with penalty (2nd day)
                           </label>
                        </td>
                        <td className="p-3 text-right text-gray-600">100</td>
                    </tr>
                    <tr>
                        <td className="p-3 border-r border-gray-200 text-gray-800">
                           <label className={`flex items-center ${hasAlreadySubmitted ? 'cursor-not-allowed opacity-70' : 'cursor-pointer'}`}>
                               <input type="checkbox" className="mr-3 form-checkbox h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500 focus:ring-offset-0" checked={checkedItems["Registration, PG with penalty (3rd day)"] || false} onChange={handleCheckboxChange} disabled={isSubmitting || hasAlreadySubmitted}/>
                               Registration, PG with penalty (3rd day)
                           </label>
                        </td>
                        <td className="p-3 text-right text-gray-600">125</td>
                    </tr>

                    {/* Section 6: ID Card Issuance and Replacement */}
                    <tr>
                        <td className="p-3 border-r border-gray-200 font-medium text-gray-700 align-top sticky left-0 bg-white z-10" rowSpan="6">6. ID Card Issuance and Replacement</td>
                         <td className="p-3 border-r border-gray-200 text-gray-800">
                           <label className={`flex items-center ${hasAlreadySubmitted ? 'cursor-not-allowed opacity-70' : 'cursor-pointer'}`}>
                               <input type="checkbox" className="mr-3 form-checkbox h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500 focus:ring-offset-0" checked={checkedItems["ID Issuance, Regular"] || false} onChange={handleCheckboxChange} disabled={isSubmitting || hasAlreadySubmitted}/>
                               ID Issuance, Regular
                           </label>
                        </td>
                        <td className="p-3 text-right text-gray-600">Free</td>
                    </tr>
                    <tr>
                         <td className="p-3 border-r border-gray-200 text-gray-800">
                           <label className={`flex items-center ${hasAlreadySubmitted ? 'cursor-not-allowed opacity-70' : 'cursor-pointer'}`}>
                               <input type="checkbox" className="mr-3 form-checkbox h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500 focus:ring-offset-0" checked={checkedItems["ID Issuance (Smart ID), CCDE"] || false} onChange={handleCheckboxChange} disabled={isSubmitting || hasAlreadySubmitted}/>
                               ID Issuance (Smart ID), CCDE
                           </label>
                        </td>
                        <td className="p-3 text-right text-gray-600">150</td>
                    </tr>
                     <tr>
                         <td className="p-3 border-r border-gray-200 text-gray-800">
                           <label className={`flex items-center ${hasAlreadySubmitted ? 'cursor-not-allowed opacity-70' : 'cursor-pointer'}`}>
                               <input type="checkbox" className="mr-3 form-checkbox h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500 focus:ring-offset-0" checked={checkedItems["ID Issuance (Old), CCDE"] || false} onChange={handleCheckboxChange} disabled={isSubmitting || hasAlreadySubmitted}/>
                               ID Issuance (Old), CCDE
                           </label>
                        </td>
                        <td className="p-3 text-right text-gray-600">150</td>
                    </tr>
                     <tr>
                         <td className="p-3 border-r border-gray-200 text-gray-800">
                           <label className={`flex items-center ${hasAlreadySubmitted ? 'cursor-not-allowed opacity-70' : 'cursor-pointer'}`}>
                               <input type="checkbox" className="mr-3 form-checkbox h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500 focus:ring-offset-0" checked={checkedItems["ID replacement (Smart ID)"] || false} onChange={handleCheckboxChange} disabled={isSubmitting || hasAlreadySubmitted}/>
                               ID replacement (Smart ID)
                           </label>
                        </td>
                        <td className="p-3 text-right text-gray-600">50</td>
                    </tr>
                     <tr>
                         <td className="p-3 border-r border-gray-200 text-gray-800">
                           <label className={`flex items-center ${hasAlreadySubmitted ? 'cursor-not-allowed opacity-70' : 'cursor-pointer'}`}>
                               <input type="checkbox" className="mr-3 form-checkbox h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500 focus:ring-offset-0" checked={checkedItems["ID replacement (Old)"] || false} onChange={handleCheckboxChange} disabled={isSubmitting || hasAlreadySubmitted}/>
                               ID replacement (Old)
                           </label>
                        </td>
                        <td className="p-3 text-right text-gray-600">50</td>
                    </tr>
                    <tr>
                         <td className="p-3 border-r border-gray-200 text-gray-800">
                           <label className={`flex items-center ${hasAlreadySubmitted ? 'cursor-not-allowed opacity-70' : 'cursor-pointer'}`}>
                               <input type="checkbox" className="mr-3 form-checkbox h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500 focus:ring-offset-0" checked={checkedItems["ID warn out due to mishandling (Old)"] || false} onChange={handleCheckboxChange} disabled={isSubmitting || hasAlreadySubmitted}/>
                               ID warn out due to mishandling (Old)
                           </label>
                        </td>
                        <td className="p-3 text-right text-gray-600">50</td>
                    </tr>

                    {/* Section 7: Application Forms Fee */}
                     <tr>
                        <td className="p-3 border-r border-gray-200 font-medium text-gray-700 align-top sticky left-0 bg-white z-10" rowSpan="5">7. Application Forms Fee</td>
                         <td className="p-3 border-r border-gray-200 text-gray-800">
                           <label className={`flex items-center ${hasAlreadySubmitted ? 'cursor-not-allowed opacity-70' : 'cursor-pointer'}`}>
                               <input type="checkbox" className="mr-3 form-checkbox h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500 focus:ring-offset-0" checked={checkedItems["Readmission Application, Regular"] || false} onChange={handleCheckboxChange} disabled={isSubmitting || hasAlreadySubmitted}/>
                               Readmission Application, Regular
                           </label>
                        </td>
                        <td className="p-3 text-right text-gray-600">30</td>
                    </tr>
                     <tr>
                         <td className="p-3 border-r border-gray-200 text-gray-800">
                           <label className={`flex items-center ${hasAlreadySubmitted ? 'cursor-not-allowed opacity-70' : 'cursor-pointer'}`}>
                               <input type="checkbox" className="mr-3 form-checkbox h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500 focus:ring-offset-0" checked={checkedItems["Readmission Application, CCDE"] || false} onChange={handleCheckboxChange} disabled={isSubmitting || hasAlreadySubmitted}/>
                               Readmission Application, CCDE
                           </label>
                        </td>
                        <td className="p-3 text-right text-gray-600">30</td>
                    </tr>
                    <tr>
                         <td className="p-3 border-r border-gray-200 text-gray-800">
                           <label className={`flex items-center ${hasAlreadySubmitted ? 'cursor-not-allowed opacity-70' : 'cursor-pointer'}`}>
                               <input type="checkbox" className="mr-3 form-checkbox h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500 focus:ring-offset-0" checked={checkedItems["Readmission Application, PG"] || false} onChange={handleCheckboxChange} disabled={isSubmitting || hasAlreadySubmitted}/>
                               Readmission Application, PG
                           </label>
                        </td>
                        <td className="p-3 text-right text-gray-600">30</td>
                    </tr>
                     <tr>
                         <td className="p-3 border-r border-gray-200 text-gray-800">
                           <label className={`flex items-center ${hasAlreadySubmitted ? 'cursor-not-allowed opacity-70' : 'cursor-pointer'}`}>
                               <input type="checkbox" className="mr-3 form-checkbox h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500 focus:ring-offset-0" checked={checkedItems["Transfer Application"] || false} onChange={handleCheckboxChange} disabled={isSubmitting || hasAlreadySubmitted}/>
                               Transfer Application
                           </label>
                        </td>
                        <td className="p-3 text-right text-gray-600">30</td>
                    </tr>
                    <tr>
                         <td className="p-3 border-r border-gray-200 text-gray-800">
                           <label className={`flex items-center ${hasAlreadySubmitted ? 'cursor-not-allowed opacity-70' : 'cursor-pointer'}`}>
                               <input type="checkbox" className="mr-3 form-checkbox h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500 focus:ring-offset-0" checked={checkedItems["Re-assessment"] || false} onChange={handleCheckboxChange} disabled={isSubmitting || hasAlreadySubmitted}/>
                               Re-assessment
                           </label>
                        </td>
                        <td className="p-3 text-right text-gray-600">30</td>
                    </tr>

                    {/* Section 8: Make-Up/Supplemental and Course Exemption */}
                     <tr>
                        <td className="p-3 border-r border-gray-200 font-medium text-gray-700 align-top sticky left-0 bg-white z-10" rowSpan="9">8. Make-Up/Supplemental and Course Exemption</td>
                         <td className="p-3 border-r border-gray-200 text-gray-800">
                           <label className={`flex items-center ${hasAlreadySubmitted ? 'cursor-not-allowed opacity-70' : 'cursor-pointer'}`}>
                               <input type="checkbox" className="mr-3 form-checkbox h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500 focus:ring-offset-0" checked={checkedItems["Make-up/Exp. Exam, Summer program"] || false} onChange={handleCheckboxChange} disabled={isSubmitting || hasAlreadySubmitted}/>
                               Make-up/Exp. Exam, Summer program
                           </label>
                        </td>
                        <td className="p-3 text-right text-gray-600">300</td>
                    </tr>
                    <tr>
                         <td className="p-3 border-r border-gray-200 text-gray-800">
                           <label className={`flex items-center ${hasAlreadySubmitted ? 'cursor-not-allowed opacity-70' : 'cursor-pointer'}`}>
                               <input type="checkbox" className="mr-3 form-checkbox h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500 focus:ring-offset-0" checked={checkedItems["Make-up/Exp. Exam, Evening program"] || false} onChange={handleCheckboxChange} disabled={isSubmitting || hasAlreadySubmitted}/>
                               Make-up/Exp. Exam, Evening program
                           </label>
                        </td>
                        <td className="p-3 text-right text-gray-600">300</td>
                    </tr>
                     <tr>
                         <td className="p-3 border-r border-gray-200 text-gray-800">
                           <label className={`flex items-center ${hasAlreadySubmitted ? 'cursor-not-allowed opacity-70' : 'cursor-pointer'}`}>
                               <input type="checkbox" className="mr-3 form-checkbox h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500 focus:ring-offset-0" checked={checkedItems["Make-up/Exp. Exam, Weekend program"] || false} onChange={handleCheckboxChange} disabled={isSubmitting || hasAlreadySubmitted}/>
                               Make-up/Exp. Exam, Weekend program
                           </label>
                        </td>
                        <td className="p-3 text-right text-gray-600">300</td>
                    </tr>
                     <tr>
                         <td className="p-3 border-r border-gray-200 text-gray-800">
                           <label className={`flex items-center ${hasAlreadySubmitted ? 'cursor-not-allowed opacity-70' : 'cursor-pointer'}`}>
                               <input type="checkbox" className="mr-3 form-checkbox h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500 focus:ring-offset-0" checked={checkedItems["Make-up/Exp. Exam, Distance program"] || false} onChange={handleCheckboxChange} disabled={isSubmitting || hasAlreadySubmitted}/>
                               Make-up/Exp. Exam, Distance program
                           </label>
                        </td>
                        <td className="p-3 text-right text-gray-600">300</td>
                    </tr>
                    <tr>
                         <td className="p-3 border-r border-gray-200 text-gray-800">
                           <label className={`flex items-center ${hasAlreadySubmitted ? 'cursor-not-allowed opacity-70' : 'cursor-pointer'}`}>
                               <input type="checkbox" className="mr-3 form-checkbox h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500 focus:ring-offset-0" checked={checkedItems["Course exemption"] || false} onChange={handleCheckboxChange} disabled={isSubmitting || hasAlreadySubmitted}/>
                               Course exemption
                           </label>
                        </td>
                        <td className="p-3 text-right text-gray-600">50</td>
                    </tr>
                     <tr>
                         <td className="p-3 border-r border-gray-200 text-gray-800">
                           <label className={`flex items-center ${hasAlreadySubmitted ? 'cursor-not-allowed opacity-70' : 'cursor-pointer'}`}>
                               <input type="checkbox" className="mr-3 form-checkbox h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500 focus:ring-offset-0" checked={checkedItems["Lost clearance"] || false} onChange={handleCheckboxChange} disabled={isSubmitting || hasAlreadySubmitted}/>
                               Lost clearance
                           </label>
                        </td>
                        <td className="p-3 text-right text-gray-600">50</td>
                    </tr>
                     <tr>
                         <td className="p-3 border-r border-gray-200 text-gray-800">
                           <label className={`flex items-center ${hasAlreadySubmitted ? 'cursor-not-allowed opacity-70' : 'cursor-pointer'}`}>
                               <input type="checkbox" className="mr-3 form-checkbox h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500 focus:ring-offset-0" checked={checkedItems["Delayed clearance, Regular"] || false} onChange={handleCheckboxChange} disabled={isSubmitting || hasAlreadySubmitted}/>
                               Delayed clearance, Regular
                           </label>
                        </td>
                        <td className="p-3 text-right text-gray-600">50</td>
                    </tr>
                    <tr>
                         <td className="p-3 border-r border-gray-200 text-gray-800">
                           <label className={`flex items-center ${hasAlreadySubmitted ? 'cursor-not-allowed opacity-70' : 'cursor-pointer'}`}>
                               <input type="checkbox" className="mr-3 form-checkbox h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500 focus:ring-offset-0" checked={checkedItems["Delayed clearance, CCDE"] || false} onChange={handleCheckboxChange} disabled={isSubmitting || hasAlreadySubmitted}/>
                               Delayed clearance, CCDE
                           </label>
                        </td>
                        <td className="p-3 text-right text-gray-600">60</td>
                    </tr>
                    <tr>
                         <td className="p-3 border-r border-gray-200 text-gray-800">
                           <label className={`flex items-center ${hasAlreadySubmitted ? 'cursor-not-allowed opacity-70' : 'cursor-pointer'}`}>
                               <input type="checkbox" className="mr-3 form-checkbox h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500 focus:ring-offset-0" checked={checkedItems["Delayed clearance, PG"] || false} onChange={handleCheckboxChange} disabled={isSubmitting || hasAlreadySubmitted}/>
                               Delayed clearance, PG
                           </label>
                        </td>
                        <td className="p-3 text-right text-gray-600">80</td>
                    </tr>

                     {/* Section 9: Other Services */}
                     <tr>
                        <td className="p-3 border-r border-gray-200 font-medium text-gray-700 align-top sticky left-0 bg-white z-10" rowSpan="8">9. Other Services</td>
                         <td className="p-3 border-r border-gray-200 text-gray-800">
                           <label className={`flex items-center ${hasAlreadySubmitted ? 'cursor-not-allowed opacity-70' : 'cursor-pointer'}`}>
                               <input type="checkbox" className="mr-3 form-checkbox h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500 focus:ring-offset-0" checked={checkedItems["Name change (For active student)"] || false} onChange={handleCheckboxChange} disabled={isSubmitting || hasAlreadySubmitted}/>
                               Name change (For active student)
                           </label>
                        </td>
                        <td className="p-3 text-right text-gray-600">60</td>
                    </tr>
                     <tr>
                         <td className="p-3 border-r border-gray-200 text-gray-800">
                           <label className={`flex items-center ${hasAlreadySubmitted ? 'cursor-not-allowed opacity-70' : 'cursor-pointer'}`}>
                               <input type="checkbox" className="mr-3 form-checkbox h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500 focus:ring-offset-0" checked={checkedItems["Name change (For graduated students)"] || false} onChange={handleCheckboxChange} disabled={isSubmitting || hasAlreadySubmitted}/>
                               Name change (For graduated students)
                           </label>
                        </td>
                        <td className="p-3 text-right text-gray-600">150</td>
                    </tr>
                    <tr>
                         <td className="p-3 border-r border-gray-200 text-gray-800">
                           <label className={`flex items-center ${hasAlreadySubmitted ? 'cursor-not-allowed opacity-70' : 'cursor-pointer'}`}>
                               <input type="checkbox" className="mr-3 form-checkbox h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500 focus:ring-offset-0" checked={checkedItems["Birth date change"] || false} onChange={handleCheckboxChange} disabled={isSubmitting || hasAlreadySubmitted}/>
                               Birth date change
                           </label>
                        </td>
                        <td className="p-3 text-right text-gray-600">100</td>
                    </tr>
                     <tr>
                         <td className="p-3 border-r border-gray-200 text-gray-800">
                           <label className={`flex items-center ${hasAlreadySubmitted ? 'cursor-not-allowed opacity-70' : 'cursor-pointer'}`}>
                               <input type="checkbox" className="mr-3 form-checkbox h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500 focus:ring-offset-0" checked={checkedItems["To change spelling error committed by students"] || false} onChange={handleCheckboxChange} disabled={isSubmitting || hasAlreadySubmitted}/>
                               To change spelling error committed by students
                           </label>
                        </td>
                        <td className="p-3 text-right text-gray-600">100</td>
                    </tr>
                     <tr>
                         <td className="p-3 border-r border-gray-200 text-gray-800">
                           <label className={`flex items-center ${hasAlreadySubmitted ? 'cursor-not-allowed opacity-70' : 'cursor-pointer'}`}>
                               <input type="checkbox" className="mr-3 form-checkbox h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500 focus:ring-offset-0" checked={checkedItems["Delegation"] || false} onChange={handleCheckboxChange} disabled={isSubmitting || hasAlreadySubmitted}/>
                               Delegation
                           </label>
                        </td>
                        <td className="p-3 text-right text-gray-600">50</td>
                    </tr>
                    <tr>
                         <td className="p-3 border-r border-gray-200 text-gray-800">
                           <label className={`flex items-center ${hasAlreadySubmitted ? 'cursor-not-allowed opacity-70' : 'cursor-pointer'}`}>
                               <input type="checkbox" className="mr-3 form-checkbox h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500 focus:ring-offset-0" checked={checkedItems["Delegation by email"] || false} onChange={handleCheckboxChange} disabled={isSubmitting || hasAlreadySubmitted}/>
                               Delegation by email
                           </label>
                        </td>
                        <td className="p-3 text-right text-gray-600">60</td>
                    </tr>
                    <tr>
                         <td className="p-3 border-r border-gray-200 text-gray-800">
                           <label className={`flex items-center ${hasAlreadySubmitted ? 'cursor-not-allowed opacity-70' : 'cursor-pointer'}`}>
                               <input type="checkbox" className="mr-3 form-checkbox h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500 focus:ring-offset-0" checked={checkedItems["Online document verification"] || false} onChange={handleCheckboxChange} disabled={isSubmitting || hasAlreadySubmitted}/>
                               Online document verification
                           </label>
                        </td>
                        <td className="p-3 text-right text-gray-600">60</td>
                    </tr>
                 {/* --- END TABLE ROWS --- */}
              </tbody>
            </table>
          </div>

          {/* Total Fee Display */}
          <div className="mt-6 text-right pr-4">
            <h3 className="text-lg font-semibold text-gray-800">Total Fee: <span className="text-blue-600">{totalFee.toFixed(2)} Birr</span></h3>
          </div>

          {/* Submit Button */}
          <div className="mt-8 text-center">
            <button
              type="submit"
              // Disable if submitting OR if already submitted
              disabled={isSubmitting || hasAlreadySubmitted}
              className={`bg-green-600 hover:bg-green-700 text-white font-bold py-2.5 px-8 rounded-lg shadow-md transition duration-150 ease-in-out focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 ${isSubmitting || hasAlreadySubmitted ? 'opacity-50 cursor-not-allowed' : ''}`} // Add hasAlreadySubmitted condition
            >
              {isSubmitting ? (
                 <> {/* Loading Spinner */} </>
              ) : (
                "Submit Request"
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AcademicRecordsForm;