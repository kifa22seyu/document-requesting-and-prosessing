import React, { useState, useCallback, useEffect, useRef } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { FiMail, FiLock, FiUser, FiEye, FiEyeOff, FiBriefcase, FiX } from "react-icons/fi";
import axios from 'axios';
import bgVideo from "../image/exgamo.mp4"; // Ensure this path is correct

// --- Constants ---
const REGISTER_ENDPOINT = 'http://localhost:8000/auth/register'; // Verify this endpoint
const SUCCESS_MESSAGE_DURATION = 5000; // 5 seconds
const USER_TYPES = { // Consistent user type constants
    ALUMNI: 'alumni',
    COMPANY: 'company',
};
const PASSWORD_MIN_LENGTH = 6; // Match backend schema

function RegisterForm() {
  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);
  // Determine initial type: check URL param, otherwise null (force selection)
  const initialUserType = Object.values(USER_TYPES).includes(queryParams.get('userType'))
                            ? queryParams.get('userType')
                            : null;

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
    userType: initialUserType
  });

  // State for errors (field-specific and general server/API errors)
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [apiSuccessMessage, setApiSuccessMessage] = useState(null);
  const navigate = useNavigate();
  const successTimeoutRef = useRef(null); // For auto-clearing success message


  // --- Input Handling ---
  const handleChange = useCallback((e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    // Clear related errors when user types
    if (errors[name] || errors.server) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[name];
        delete newErrors.server; // Clear server error on interaction
        return newErrors;
      });
    }
    // Clear success message on interaction
    if (apiSuccessMessage) setApiSuccessMessage(null);
    if (successTimeoutRef.current) clearTimeout(successTimeoutRef.current);

  }, [errors, apiSuccessMessage]);

  // --- User Type Selection ---
  const setUserType = useCallback((type) => {
    if (!Object.values(USER_TYPES).includes(type)) return; // Ensure valid type

    setFormData(prev => ({
      ...prev,
      userType: type
    }));
    // Clear related errors
    if (errors.userType || errors.name || errors.server) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors.userType;
        // Name field label might change, so clear its error too
        delete newErrors.name;
        delete newErrors.server;
        return newErrors;
      });
    }
     // Clear success message on interaction
    if (apiSuccessMessage) setApiSuccessMessage(null);
    if (successTimeoutRef.current) clearTimeout(successTimeoutRef.current);

  }, [errors, apiSuccessMessage]);


  // --- Client-Side Validation ---
  const validateForm = useCallback(() => {
    const newErrors = {};
    const { name, email, password, confirmPassword, userType } = formData;

    if (!userType) {
      newErrors.userType = 'Please select whether you are registering as an Alumni or a Company.';
    }

    // Determine label based on selected type for error messages
    const nameLabel = userType === USER_TYPES.ALUMNI ? 'Full Name'
                    : userType === USER_TYPES.COMPANY ? 'Company Name'
                    : 'Name'; // Fallback

    if (!name.trim()) {
      newErrors.name = `${nameLabel} is required.`;
    }
    // Basic length checks (adjust if needed)
    else if ((userType === USER_TYPES.ALUMNI && name.length > 50) || (userType === USER_TYPES.COMPANY && name.length > 100)) {
      newErrors.name = `${nameLabel} is too long (max ${userType === USER_TYPES.ALUMNI ? 50 : 100} chars).`;
    }

    if (!email.trim()) {
      newErrors.email = 'Email address is required.';
    } else if (!/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/.test(email)) { // Simple regex
      newErrors.email = 'Please enter a valid email address format (e.g., user@example.com).';
    }

    if (!password) {
      newErrors.password = 'Password is required.';
    } else if (password.length < PASSWORD_MIN_LENGTH) {
      newErrors.password = `Password must be at least ${PASSWORD_MIN_LENGTH} characters long.`;
    }

    if (!confirmPassword) {
      newErrors.confirmPassword = 'Please confirm your password.';
    } else if (password !== confirmPassword) {
      newErrors.confirmPassword = 'The passwords entered do not match.';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0; // True if no errors
  }, [formData]);


  // --- Form Submission ---
  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrors({}); // Clear previous errors before new submission
    setApiSuccessMessage(null);
    if (successTimeoutRef.current) clearTimeout(successTimeoutRef.current);

    // Run validation again before submitting
    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);

    // Prepare payload - ensure data is clean
    const payload = {
      name: formData.name.trim(),
      email: formData.email.toLowerCase().trim(),
      password: formData.password, // Send plain password, backend MUST hash it
      userType: formData.userType
    };

    try {
      console.log("Sending registration payload to:", REGISTER_ENDPOINT, payload);
      const response = await axios.post(REGISTER_ENDPOINT, payload);
      console.log("Registration response received:", response);

      // Check backend response structure for success
      if (response.status === 201 && response.data?.success) {
        const successMsg = response.data.message || 'Registration successful!';
        // **Modify if email verification is required by your backend:**
        // setApiSuccessMessage(`${successMsg} Please check your email to verify your account. Redirecting to login...`);
        setApiSuccessMessage(`${successMsg} Redirecting to login page...`);

        // Navigate after showing the success message
        successTimeoutRef.current = setTimeout(() => {
          navigate("/login", { replace: true }); // Use replace for cleaner history
        }, SUCCESS_MESSAGE_DURATION);

      } else {
        // Handle cases where status might be 2xx but data indicates failure
        console.warn("Registration response indicates potential issue:", response.data);
        setErrors({ server: response.data?.message || 'Registration completed, but server indicated an issue.' });
      }

    } catch (error) {
      console.error("Registration API Error:", error);
      let serverErrorMessage = 'Registration failed. Please try again later.';
      const fieldErrors = {}; // To hold field-specific errors from backend

      if (error.response) {
        // Server responded with an error status code (4xx or 5xx)
        const status = error.response.status;
        const responseData = error.response.data;
        serverErrorMessage = responseData?.message || `Server error (${status}). Check details or try again.`;

        // Attempt to parse field-specific errors (like 'UserCrud' might expect)
        // **Adjust `responseData.errors` key if your backend uses something different**
        const backendFieldErrors = responseData?.errors;
        if (backendFieldErrors && typeof backendFieldErrors === 'object') {
          console.log("Backend field errors received:", backendFieldErrors);
          Object.keys(backendFieldErrors).forEach(key => {
            // Map backend error key to frontend formData key if possible
            // (This assumes backend keys like 'email', 'name', 'password' match frontend)
            if (Object.prototype.hasOwnProperty.call(formData, key)) {
              // Ensure the error message is a string
              fieldErrors[key] = Array.isArray(backendFieldErrors[key])
                ? backendFieldErrors[key].join(' ')
                : String(backendFieldErrors[key]);
            } else {
              // If error key is not a direct form field, append to general message
               console.warn(`Backend error key "${key}" not found in form fields.`);
               serverErrorMessage += ` (${key}: ${backendFieldErrors[key]})`;
            }
          });
        }
         // Specific check for common conflict errors
         if (status === 409) { // HTTP 409 Conflict
            serverErrorMessage = responseData?.message || 'Email address is already registered.';
            fieldErrors.email = fieldErrors.email || 'This email is already in use.'; // Set field error too
         }

      } else if (error.request) {
        // Network error (request made, no response received)
        serverErrorMessage = 'Network error: Unable to connect to the server. Please check your connection.';
      } else {
        // Other errors (e.g., setting up the request)
        serverErrorMessage = `An unexpected client-side error occurred: ${error.message}`;
      }

      // Update the errors state
      setErrors({
        ...fieldErrors,     // Include specific field errors parsed from backend
        server: serverErrorMessage // Always include the general server error message
      });

    } finally {
      setIsSubmitting(false); // Ensure loading indicator stops
    }
  };

  // --- Clear Form ---
  const handleClear = useCallback(() => {
    setFormData({
      name: "", email: "", password: "", confirmPassword: "", userType: initialUserType
    });
    setErrors({});
    setIsSubmitting(false);
    setApiSuccessMessage(null);
    if (successTimeoutRef.current) clearTimeout(successTimeoutRef.current);
  }, [initialUserType]);


  // --- Effect for Auto-clearing Timeout ---
  useEffect(() => {
    // Cleanup function runs when component unmounts or before next run
    return () => {
      if (successTimeoutRef.current) {
        clearTimeout(successTimeoutRef.current);
      }
    };
  }, []); // Empty dependency array means run only on mount and unmount


  // --- JSX ---
  return (
    // Design remains the same as your previous version
    <div className="min-h-screen h-screen flex justify-center items-center bg-gray-100 relative overflow-hidden p-4">
      {/* Background Video */}
      <div className="absolute inset-0 w-full h-full z-0 overflow-hidden">
        <video autoPlay loop muted playsInline className="absolute min-w-full min-h-full w-auto h-auto object-cover">
          <source src={bgVideo} type="video/mp4" />
          Your browser does not support HTML5 video.
        </video>
        <div className="absolute inset-0 bg-black/60"></div>
      </div>

      {/* Registration Form Container */}
      <motion.div
        className="relative z-10 w-full max-w-lg px-4 sm:px-6 py-6"
        initial={{ opacity: 0, y: -30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
      >
        <form
          className="bg-white/40 backdrop-blur-lg p-6 sm:p-8 rounded-xl shadow-2xl border border-white/10"
          onSubmit={handleSubmit}
          noValidate
        >
          {/* Form Header */}
          <h1 className="text-white font-bold text-3xl mb-2 text-center">
            Create Account
          </h1>
          <p className="text-base text-gray-200 mb-6 text-center">
            Join our Alumni & Partner Network!
          </p>

          {/* --- Messages Area --- */}
          <AnimatePresence>
            {errors.server && (
              <motion.div
                className="mb-4 p-3 bg-red-100/80 border border-red-300/50 text-red-800 text-sm rounded-md text-center shadow"
                initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }}
                role="alert"
              >
                {errors.server}
              </motion.div>
            )}
            {apiSuccessMessage && (
              <motion.div
                className="mb-4 p-3 bg-green-100/80 border border-green-300/50 text-green-900 text-sm rounded-md text-center shadow"
                 initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }}
                role="status"
              >
                {apiSuccessMessage}
              </motion.div>
            )}
          </AnimatePresence>


          {/* User Type Selection */}
          <div className="mb-5">
            <label className="block text-sm font-medium text-gray-100 mb-2">
              I am registering as: <span className="text-red-400">*</span>
            </label>
            <div className="flex rounded-lg overflow-hidden border border-gray-300/50 shadow-sm bg-white/30">
              <button
                type="button"
                className={`flex-1 py-2.5 px-3 text-sm sm:text-base transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:ring-offset-1 focus:ring-offset-black/20 ${
                  formData.userType === USER_TYPES.ALUMNI
                    ? 'bg-indigo-600 text-white font-semibold shadow-inner'
                    : 'text-gray-200 hover:bg-white/10 hover:text-white'
                }`}
                onClick={() => setUserType(USER_TYPES.ALUMNI)}
                disabled={isSubmitting} // Disable during submission
              >
                <div className="flex items-center justify-center gap-2">
                  <FiUser className="flex-shrink-0" />
                  <span className="truncate">Alumni</span>
                </div>
              </button>
              <button
                type="button"
                className={`flex-1 py-2.5 px-3 text-sm sm:text-base transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:ring-offset-1 focus:ring-offset-black/20 ${
                  formData.userType === USER_TYPES.COMPANY
                    ? 'bg-indigo-600 text-white font-semibold shadow-inner'
                    : 'text-gray-200 hover:bg-white/10 hover:text-white'
                }`}
                onClick={() => setUserType(USER_TYPES.COMPANY)}
                 disabled={isSubmitting} // Disable during submission
              >
                <div className="flex items-center justify-center gap-2">
                  <FiBriefcase className="flex-shrink-0" />
                  <span className="truncate">Company</span>
                </div>
              </button>
            </div>
            {errors.userType && (
              <p className="text-red-400 text-xs mt-1">{errors.userType}</p>
            )}
          </div>

          {/* Name Field */}
          <div className="relative mt-6">
            <input
              id="name"
              className={`peer block w-full px-3 pt-5 pb-2 border-b-2 ${
                errors.name ? 'border-red-400 focus:border-red-500' : 'border-gray-300/50 focus:border-indigo-400'
              } outline-none bg-transparent text-white placeholder-transparent transition-colors disabled:opacity-70`}
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              required
              placeholder="Your Name or Company Name"
              aria-invalid={!!errors.name}
              aria-describedby={errors.name ? "name-error" : undefined}
              disabled={isSubmitting}
            />
            <label
              htmlFor="name"
              className={`absolute left-3 -top-3.5 text-gray-400 text-xs peer-placeholder-shown:text-sm peer-placeholder-shown:text-gray-400 peer-placeholder-shown:top-3.5 transition-all peer-focus:-top-3.5 ${errors.name ? 'peer-focus:text-red-400' : 'peer-focus:text-indigo-400'} peer-focus:text-xs flex items-center pointer-events-none`}
            >
              <FiUser className="mr-2" />
              {formData.userType === USER_TYPES.ALUMNI ? 'Full Name' :
               formData.userType === USER_TYPES.COMPANY ? 'Company Name' : 'Name'}
              <span className="text-red-400 ml-1">*</span>
            </label>
            {errors.name && (
              <p id="name-error" className="text-red-400 text-xs mt-1">{errors.name}</p>
            )}
          </div>

          {/* Email Field */}
          <div className="relative mt-6">
            <input
              id="email"
              className={`peer block w-full px-3 pt-5 pb-2 border-b-2 ${
                errors.email ? 'border-red-400 focus:border-red-500' : 'border-gray-300/50 focus:border-indigo-400'
              } outline-none bg-transparent text-white placeholder-transparent transition-colors disabled:opacity-70`}
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              required
              autoComplete="email"
              placeholder="you@example.com"
              aria-invalid={!!errors.email}
              aria-describedby={errors.email ? "email-error" : undefined}
              disabled={isSubmitting}
            />
             <label
              htmlFor="email"
              className={`absolute left-3 -top-3.5 text-gray-400 text-xs peer-placeholder-shown:text-sm peer-placeholder-shown:text-gray-400 peer-placeholder-shown:top-3.5 transition-all peer-focus:-top-3.5 ${errors.email ? 'peer-focus:text-red-400' : 'peer-focus:text-indigo-400'} peer-focus:text-xs flex items-center pointer-events-none`}
            >
              <FiMail className="mr-2" /> Email Address
              <span className="text-red-400 ml-1">*</span>
            </label>
            {errors.email && (
              <p id="email-error" className="text-red-400 text-xs mt-1">{errors.email}</p>
            )}
          </div>

          {/* Password Field */}
          <div className="relative mt-6">
            <input
              id="password"
              className={`peer block w-full px-3 pt-5 pb-2 border-b-2 ${
                errors.password ? 'border-red-400 focus:border-red-500' : 'border-gray-300/50 focus:border-indigo-400'
              } outline-none bg-transparent text-white placeholder-transparent transition-colors pr-10 disabled:opacity-70`}
              type={showPassword ? "text" : "password"}
              name="password"
              value={formData.password}
              onChange={handleChange}
              required
              autoComplete="new-password"
              placeholder="Create a password"
              aria-invalid={!!errors.password}
              aria-describedby={errors.password ? "password-error" : undefined}
              disabled={isSubmitting}
              minLength={PASSWORD_MIN_LENGTH}
            />
            <label
              htmlFor="password"
              className={`absolute left-3 -top-3.5 text-gray-400 text-xs peer-placeholder-shown:text-sm peer-placeholder-shown:text-gray-400 peer-placeholder-shown:top-3.5 transition-all peer-focus:-top-3.5 ${errors.password ? 'peer-focus:text-red-400' : 'peer-focus:text-indigo-400'} peer-focus:text-xs flex items-center pointer-events-none`}
            >
              <FiLock className="mr-2" /> Password
              <span className="text-red-400 ml-1">*</span>
            </label>
            <button
              type="button"
              className="absolute right-2 top-3.5 text-gray-400 hover:text-white cursor-pointer focus:outline-none disabled:opacity-50"
              onClick={() => setShowPassword(!showPassword)}
              aria-label={showPassword ? "Hide password" : "Show password"}
              title={showPassword ? "Hide password" : "Show password"}
              disabled={isSubmitting}
            >
              {showPassword ? <FiEyeOff size={18} /> : <FiEye size={18} />}
            </button>
            {errors.password && (
              <p id="password-error" className="text-red-400 text-xs mt-1">{errors.password}</p>
            )}
          </div>

          {/* Confirm Password Field */}
          <div className="relative mt-6">
             <input
              id="confirmPassword"
              className={`peer block w-full px-3 pt-5 pb-2 border-b-2 ${
                errors.confirmPassword ? 'border-red-400 focus:border-red-500' : 'border-gray-300/50 focus:border-indigo-400'
              } outline-none bg-transparent text-white placeholder-transparent transition-colors pr-10 disabled:opacity-70`}
              type={showConfirmPassword ? "text" : "password"}
              name="confirmPassword"
              value={formData.confirmPassword}
              onChange={handleChange}
              required
              autoComplete="new-password"
              placeholder="Confirm your password"
              aria-invalid={!!errors.confirmPassword}
              aria-describedby={errors.confirmPassword ? "confirm-password-error" : undefined}
              disabled={isSubmitting}
            />
             <label
              htmlFor="confirmPassword"
              className={`absolute left-3 -top-3.5 text-gray-400 text-xs peer-placeholder-shown:text-sm peer-placeholder-shown:text-gray-400 peer-placeholder-shown:top-3.5 transition-all peer-focus:-top-3.5 ${errors.confirmPassword ? 'peer-focus:text-red-400' : 'peer-focus:text-indigo-400'} peer-focus:text-xs flex items-center pointer-events-none`}
            >
              <FiLock className="mr-2" /> Confirm Password
              <span className="text-red-400 ml-1">*</span>
            </label>
            <button
              type="button"
              className="absolute right-2 top-3.5 text-gray-400 hover:text-white cursor-pointer focus:outline-none disabled:opacity-50"
              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              aria-label={showConfirmPassword ? "Hide confirm password" : "Show confirm password"}
              title={showConfirmPassword ? "Hide confirm password" : "Show confirm password"}
              disabled={isSubmitting}
            >
              {showConfirmPassword ? <FiEyeOff size={18} /> : <FiEye size={18} />}
            </button>
            {errors.confirmPassword && (
              <p id="confirm-password-error" className="text-red-400 text-xs mt-1">{errors.confirmPassword}</p>
            )}
          </div>


          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 mt-8">
            {/* Submit Button */}
            <motion.button
              type="submit"
              className={`flex-1 order-1 sm:order-2 inline-flex items-center justify-center py-2.5 rounded-lg font-semibold focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-black/30 transition duration-150 ease-in-out shadow-lg ${
                isSubmitting
                  ? 'bg-indigo-400 cursor-not-allowed text-white'
                  : 'bg-indigo-600 hover:bg-indigo-500 focus:ring-indigo-500 text-white'
              }`}
              whileHover={!isSubmitting ? { scale: 1.03, y: -1 } : {}}
              whileTap={!isSubmitting ? { scale: 0.98 } : {}}
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                  <div className="flex items-center justify-center">
                      <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Registering...
                  </div>
              ) : 'Create Account'}
            </motion.button>

             {/* Clear Button */}
            <motion.button
                type="button"
                className="flex-1 order-2 sm:order-1 bg-gray-600/70 mt-3 sm:mt-0 py-2.5 rounded-lg text-white font-semibold hover:bg-gray-500/80 focus:outline-none focus:ring-2 focus:ring-gray-400 focus:ring-offset-2 focus:ring-offset-black/30 transition duration-150 ease-in-out shadow-md disabled:opacity-60 disabled:cursor-not-allowed"
                whileHover={!isSubmitting ? { scale: 1.03, y: -1 } : {}}
                whileTap={!isSubmitting ? { scale: 0.98 } : {}}
                onClick={handleClear}
                disabled={isSubmitting}
            >
               <div className="flex items-center justify-center gap-2">
                 <FiX /> Clear Form
               </div>
            </motion.button>
          </div>

          {/* Login Link */}
          <div className="text-center mt-6 text-sm">
            <span className="text-gray-200">Already have an account? </span>
            <Link
              to="/login" // Ensure this route is correct
              className="text-indigo-300 hover:text-white hover:underline font-medium transition-colors"
            >
              Login here
            </Link>
          </div>
        </form>
      </motion.div>
    </div>
  );
}

export default RegisterForm;