import React, { useState, useEffect } from "react"; // Import useEffect
import { useOutletContext } from "react-router-dom";

const AdditionalInfoForm = () => {
  // --- Get Auth Token Safely ---
  const context = useOutletContext();
  const { authToken = null } = context || {};

  // --- State Variables ---
  const [deliveryMethod, setDeliveryMethod] = useState('');
  const [address, setAddress] = useState({ street: '', city: '', postalCode: '', country: '' });
  const [confirmationInfo, setConfirmationInfo] = useState({ name: '', telNo: '', date: '' });

  // --- State for Submission & Loading ---
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState("info"); // 'info', 'success', 'error'
  const [isLoadingCheck, setIsLoadingCheck] = useState(true);
  const [hasAlreadySubmitted, setHasAlreadySubmitted] = useState(null); // null | boolean

  // --- Check if delivery info already submitted ---
  useEffect(() => {
    const checkSubmissionStatus = async () => {
      setIsLoadingCheck(true);
      setHasAlreadySubmitted(null);
      setMessage("");

      if (!authToken) {
        setMessage("Authentication error. Please log in again.");
        setMessageType("error");
        setHasAlreadySubmitted(true); // Disable form if not authenticated
        setIsLoadingCheck(false);
        return;
      }

      try {
        const response = await fetch("http://localhost:8000/api/delivery-method/check", { // Use the new check endpoint
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
          setMessage("You have already submitted your delivery information.");
          setMessageType("info"); // Use 'info' for this persistent message
        }
      } catch (error) {
        console.error("Error checking delivery submission status:", error);
        setMessage(`Could not verify submission status: ${error.message}. Form disabled.`);
        setMessageType("error");
        setHasAlreadySubmitted(true); // Disable form if check fails
      } finally {
        setIsLoadingCheck(false);
      }
    };

    // Only run check if authToken is present
    if (authToken) {
         checkSubmissionStatus();
    } else {
        // Handle case where component mounts but token is still missing from context
        setIsLoadingCheck(false);
        setHasAlreadySubmitted(true); // Prevent form interaction
        setMessage("Authentication token not available.");
        setMessageType("error");
    }

  }, [authToken]); // Dependency: check again if token changes

  // --- Input Handlers (remain the same) ---
  const handleDeliveryChange = (e) => {
    setDeliveryMethod(e.target.value);
    // Clear address if switching away from 'post'
    if (e.target.value !== 'post') {
        setAddress({ street: '', city: '', postalCode: '', country: '' });
    }
  };

  const handleAddressChange = (e) => {
    setAddress({ ...address, [e.target.name]: e.target.value });
  };

  const handleConfirmationChange = (e) => {
    setConfirmationInfo({ ...confirmationInfo, [e.target.name]: e.target.value });
  };

  // --- Updated Submit Handler ---
  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage(""); // Clear previous transient messages
    setMessageType("info");

    // Prevent submission if already submitted, loading, or not authenticated
    if (hasAlreadySubmitted === true || isLoadingCheck || !authToken) {
      setMessage("Submission not allowed at this time.");
      setMessageType("error");
      return;
    }

     // Add specific validation before submitting if needed
    if (!deliveryMethod) {
        setMessage("Please select a delivery method.");
        setMessageType("error");
        return;
    }
     if (deliveryMethod === 'post' && (!address.street || !address.city || !address.country)) {
        setMessage("Street, City, and Country are required for post delivery.");
        setMessageType("error");
        return;
    }
    if (!confirmationInfo.name || !confirmationInfo.telNo || !confirmationInfo.date) {
        setMessage("Please fill in all Confirmation fields (Name, Tel No, Date).");
        setMessageType("error");
        return;
    }


    setIsSubmitting(true);

    const formData = {
      deliveryMethod,
      // Only send address if method is 'post'
      address: deliveryMethod === 'post' ? address : undefined,
      confirmationInfo,
    };

    try {
      const response = await fetch('http://localhost:8000/api/delivery-method', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${authToken}`, // Send token
        },
        body: JSON.stringify(formData),
      });

      const responseData = await response.json().catch(() => ({ message: `Received non-JSON response (Status: ${response.status})` }));

      if (response.ok) { // 201 Created (or other 2xx)
        setMessage(responseData.message || 'Delivery method submitted successfully!');
        setMessageType("success");
        // --- Set state to indicate submission completed ---
        setHasAlreadySubmitted(true);
        // --- Do NOT reset fields, the component will show the "already submitted" view ---
      } else {
          // Handle 409 Conflict specifically
          if (response.status === 409) {
            setMessage(responseData.message || "You have already submitted delivery information.");
            setMessageType("error"); // Show as error because submission failed
            setHasAlreadySubmitted(true); // Update state to reflect backend
          } else {
            // Handle other errors (400, 500, etc.)
            console.error('Submission Error:', response.status, responseData);
            setMessage(responseData.message || `Error submitting: ${response.statusText} (${response.status}).`);
            setMessageType("error");
          }
      }
    } catch (error) { // Network error
      console.error('Network/Fetch Error:', error);
      setMessage('An unexpected network error occurred. Please try again later.');
      setMessageType("error");
    } finally {
      setIsSubmitting(false); // Finish submitting state
    }
  };

  // --- Conditional Rendering Logic ---

  // 1. Loading check state
  if (isLoadingCheck) {
    return (
      <div className="max-w-4xl mx-auto p-8 text-center text-gray-600">
        {/* Spinner SVG */}
        <svg className="animate-spin h-6 w-6 text-indigo-600 mx-auto mb-3" viewBox="0 0 24 24">
           <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
           <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
        </svg>
        Checking delivery information status...
      </div>
    );
  }

  // 2. Already Submitted state (or check failed)
  if (hasAlreadySubmitted === true) {
    return (
      <div className="max-w-4xl mx-auto p-8 bg-white shadow-lg rounded-lg text-center">
        <h2 className="text-xl font-semibold mb-4 text-gray-800">
          Delivery Information
        </h2>
        <div
          className={`p-3 rounded text-sm font-medium border ${
            messageType === "error"
              ? "bg-red-100 text-red-700 border-red-300" // Error during check
              : "bg-blue-100 text-blue-700 border-blue-300" // Info for already submitted
          }`}
        >
          {message || "You have already submitted your delivery information."}
        </div>
         {/* You might want a link here to view/edit the info if applicable */}
      </div>
    );
  }

  // 3. Render the form if check complete and not submitted
  return (
    <div className="max-w-4xl mx-auto p-6 md:p-8 bg-white shadow-lg rounded-lg">
      <h2 className="text-xl font-semibold text-center mb-6 text-gray-800">
        Additional Information (Delivery)
      </h2>

       {/* Display transient error messages here if needed */}
       {message && messageType === 'error' && !hasAlreadySubmitted && (
         <div className="mb-4 p-3 rounded text-center text-sm font-medium border bg-red-100 text-red-700 border-red-300">
           {message}
         </div>
       )}

      <form className="space-y-6" onSubmit={handleSubmit}>
        {/* Delivery Method */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Select Delivery Method:
          </label>
          <div className="mt-2 space-x-4">
            <label className={`inline-flex items-center ${hasAlreadySubmitted ? 'cursor-not-allowed opacity-70' : 'cursor-pointer'}`}>
              <input
                type="radio" name="deliveryMethod" value="post"
                checked={deliveryMethod === 'post'} onChange={handleDeliveryChange}
                className="form-radio h-5 w-5 text-indigo-600"
                disabled={isSubmitting || hasAlreadySubmitted} // Disable
              />
              <span className="ml-2 text-gray-700">Post</span>
            </label>
            <label className={`inline-flex items-center ${hasAlreadySubmitted ? 'cursor-not-allowed opacity-70' : 'cursor-pointer'}`}>
              <input
                type="radio" name="deliveryMethod" value="appointment"
                checked={deliveryMethod === 'appointment'} onChange={handleDeliveryChange}
                className="form-radio h-5 w-5 text-indigo-600"
                 disabled={isSubmitting || hasAlreadySubmitted} // Disable
              />
              <span className="ml-2 text-gray-700">Appointment</span>
            </label>
          </div>
        </div>

        {/* Post Address Form (Conditional Rendering) */}
        {deliveryMethod === 'post' && (
          <div className="border-t border-gray-200 pt-4 mt-4"> {/* Added separator */}
            <p className="block text-sm font-medium text-gray-700 mb-2">
              Postal Address:
            </p>
            <div className="space-y-3">
              {/* Street */}
              <div>
                 <label htmlFor="street" className="block text-xs font-medium text-gray-600 mb-1">Street Address:</label>
                 <input
                   type="text" id="street" name="street" value={address.street}
                   onChange={handleAddressChange} disabled={isSubmitting || hasAlreadySubmitted} // Disable
                   className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm text-sm focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 disabled:bg-gray-100"
                   placeholder="Street Address" required={deliveryMethod === 'post'}
                 />
               </div>
               {/* City */}
              <div>
                 <label htmlFor="city" className="block text-xs font-medium text-gray-600 mb-1">City:</label>
                 <input
                   type="text" id="city" name="city" value={address.city}
                   onChange={handleAddressChange} disabled={isSubmitting || hasAlreadySubmitted} // Disable
                   className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm text-sm focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 disabled:bg-gray-100"
                   placeholder="City" required={deliveryMethod === 'post'}
                 />
               </div>
               {/* Postal Code */}
              <div>
                 <label htmlFor="postalCode" className="block text-xs font-medium text-gray-600 mb-1">Postal Code:</label>
                 <input
                   type="text" id="postalCode" name="postalCode" value={address.postalCode}
                   onChange={handleAddressChange} disabled={isSubmitting || hasAlreadySubmitted} // Disable
                   className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm text-sm focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 disabled:bg-gray-100"
                   placeholder="Postal Code"
                 />
               </div>
               {/* Country */}
              <div>
                 <label htmlFor="country" className="block text-xs font-medium text-gray-600 mb-1">Country:</label>
                 <input
                   type="text" id="country" name="country" value={address.country}
                   onChange={handleAddressChange} disabled={isSubmitting || hasAlreadySubmitted} // Disable
                   className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm text-sm focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 disabled:bg-gray-100"
                   placeholder="Country" required={deliveryMethod === 'post'}
                 />
               </div>
            </div>
          </div>
        )}

        {/* N. B. Section */}
        <div className="border-t border-gray-200 pt-4 mt-4">
          <p className="block text-sm font-medium text-gray-700 mb-1">N. B.</p>
          <ul className="list-decimal pl-5 space-y-1 text-gray-600 text-xs">
            <li>Please attach the Receipt (Handled in Payment section perhaps?)</li>
            <li>Delivery times may vary. Please submit requests early.</li>
          </ul>
        </div>

        {/* Confirmation by the Applicant */}
        <div className="border-t border-gray-200 pt-4 mt-4">
          <p className="block text-sm font-medium text-gray-700 mb-2">Confirmation by the Applicant</p>
          <div className="space-y-3">
             {/* Name */}
             <div>
               <label htmlFor="conf_name" className="block text-xs font-medium text-gray-600 mb-1">Name:</label>
               <input
                 type="text" id="conf_name" name="name" value={confirmationInfo.name}
                 onChange={handleConfirmationChange} disabled={isSubmitting || hasAlreadySubmitted} // Disable
                 className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm text-sm focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 disabled:bg-gray-100"
                 placeholder="Your Full Name" required
               />
             </div>
             {/* Tel No */}
             <div>
               <label htmlFor="telNo" className="block text-xs font-medium text-gray-600 mb-1">Tel. No:</label>
               <input
                 type="tel" id="telNo" name="telNo" value={confirmationInfo.telNo}
                 onChange={handleConfirmationChange} disabled={isSubmitting || hasAlreadySubmitted} // Disable
                 className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm text-sm focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 disabled:bg-gray-100"
                 placeholder="Telephone Number" required
               />
             </div>
             {/* Date */}
             <div>
               <label htmlFor="date" className="block text-xs font-medium text-gray-600 mb-1">Date:</label>
               <input
                 type="date" id="date" name="date" value={confirmationInfo.date}
                 onChange={handleConfirmationChange} disabled={isSubmitting || hasAlreadySubmitted} // Disable
                 className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm text-sm focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 disabled:bg-gray-100 disabled:text-gray-500"
                 required
               />
             </div>
          </div>
        </div>

        {/* Submit Button */}
        <div className="pt-4">
          <button
            type="submit"
            // Disable button based on loading, submitting, or already submitted status
            disabled={isSubmitting || isLoadingCheck || hasAlreadySubmitted}
            className={`w-full flex justify-center items-center px-6 py-3 border border-transparent rounded-lg shadow-sm text-base font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition duration-150 ease-in-out ${
              isSubmitting || isLoadingCheck || hasAlreadySubmitted ? "opacity-50 cursor-not-allowed" : ""
            }`}
          >
            {isSubmitting ? (
              <> {/* Spinner */}
                <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Submitting...
              </>
            ) : (
              "Submit Delivery Info"
            )}
          </button>
        </div>
      </form>
    </div>
  );
};

export default AdditionalInfoForm;