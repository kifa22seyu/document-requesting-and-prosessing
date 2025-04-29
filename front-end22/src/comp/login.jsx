import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { FiMail, FiLock, FiX, FiKey, FiUser, FiBriefcase, FiEye, FiEyeOff } from "react-icons/fi";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";

// Assuming image and video paths are correct relative to this file's location
import bgVideo from "../image/Gamo_Square.mp4";
import image1 from "../image/thumb-1920-157142.png";
import image2 from "../image/thumb-1920-1205860.png";
import image3 from "../image/thumb-1920-1357274.png";
import image4 from "../image/thumb-1920-1205860.png";

function Login() {
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    role: ""
  });
  const [currentIndex, setCurrentIndex] = useState(0);
  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [loginType, setLoginType] = useState("user");
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();

  const images = [image1, image2, image3, image4];

  // Image Slider Effect
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentIndex((prevIndex) => (prevIndex + 1) % images.length);
    }, 3000);
    return () => clearInterval(interval);
  }, [images.length]);

  const handleClear = () => {
    setFormData({ 
      email: "", 
      password: "", 
      role: "" 
    });
    setError("");
    setSuccessMessage("");
  };

  const toggleLoginType = () => {
    setLoginType((prevLoginType) => {
      const nextType = prevLoginType === "user" ? "moderator" 
                    : prevLoginType === "moderator" ? "admin" 
                    : "user";
      
      setFormData({ email: "", password: "", role: "" });
      setError("");
      setSuccessMessage("");
      return nextType;
    });
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const validateForm = () => {
    if (!formData.email || !formData.password) {
      setError("Please fill in all required fields.");
      return false;
    }

    if (!formData.email.includes('@') || !formData.email.includes('.')) {
      setError("Please enter a valid email address.");
      return false;
    }

    if (formData.password.length < 8) {
      setError("Password must be at least 8 characters.");
      return false;
    }

    if (loginType === "moderator" && !formData.role) {
      setError("Please select a moderator role.");
      return false;
    }

    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccessMessage("");
    
    if (!validateForm()) return;

    setIsLoading(true);

    let endpoint;
    let payload;

    try {
      // Determine endpoint and payload
      if (loginType === "moderator") {
        endpoint = "http://localhost:8000/moderator/login";
        payload = { 
          email: formData.email, 
          password: formData.password, 
          role: formData.role 
        };
      } else if (loginType === "admin") {
        endpoint = "http://localhost:8000/admin/login";
        payload = { 
          email: formData.email, 
          password: formData.password 
        };
      } else {
        endpoint = "http://localhost:8000/auth/login";
        payload = { 
          email: formData.email, 
          password: formData.password 
        };
      }

      // API Call
      const response = await axios.post(endpoint, payload);
      
      if (!response.data.token) {
        throw new Error("Authentication token not received");
      }

      // Store token and user info
      localStorage.setItem("token", response.data.token);
      
      if (response.data.user) {
        localStorage.setItem("userInfo", JSON.stringify(response.data.user));
      }

      // Determine redirect path
      let targetPath = '';
      let actualUserType = loginType;

      if (loginType === 'user') {
        const userType = response.data.user?.userType?.toLowerCase();
        if (userType === 'alumni') {
          targetPath = '/alumni-dashboard';
          actualUserType = 'alumni';
        } else if (userType === 'company') {
          targetPath = '/company-dashboard';
          actualUserType = 'company';
        } else {
          throw new Error("User role could not be determined");
        }
      } else if (loginType === 'moderator') {
        const role = response.data.user?.role;
        if (role === 'Finance') {
          targetPath = '/finance-dashboard';
          actualUserType = 'moderator-finance';
        } else if (role === 'Team Association') {
          targetPath = '/team-association-dashboard';
          actualUserType = 'moderator-teamassoc';
        } else {
          throw new Error("Moderator role could not be determined");
        }
      } else if (loginType === 'admin') {
        targetPath = '/registraradmin';
        actualUserType = 'admin';
      }

      // Store user type and redirect
      localStorage.setItem("userRoleType", actualUserType);
      
      if (targetPath) {
        setSuccessMessage("Login successful! Redirecting...");
        setTimeout(() => navigate(targetPath), 1500);
      } else {
        throw new Error("Redirection path could not be determined");
      }

    } catch (err) {
      localStorage.removeItem("token");
      localStorage.removeItem("userInfo");
      localStorage.removeItem("userRoleType");

      const errorMessage = err.response?.data?.message 
                         || err.message 
                         || "Login failed. Please try again.";
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="h-screen flex">
      {/* Left Side - Image Slider */}
      <div className="hidden lg:flex w-1/2 justify-center items-center relative overflow-hidden">
        <AnimatePresence>
          <motion.div
            key={currentIndex}
            className="absolute inset-0 bg-cover bg-center bg-no-repeat transition-transform duration-500 ease-in-out hover:scale-110"
            style={{ backgroundImage: `url(${images[currentIndex]})` }}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 1 }}
          />
        </AnimatePresence>
        <div className="relative z-10 text-center px-10">
          <h1 className="text-white font-bold text-4xl">
            {loginType === 'admin' ? "Admin Portal" : 
             loginType === 'moderator' ? "Moderator Portal" : "Alumni & Company Portal"}
          </h1>
          <p className="text-white mt-2">
            Access your dedicated resources.
          </p>
        </div>
      </div>

      {/* Right Side - Login Form */}
      <div className="flex w-full lg:w-1/2 justify-center items-center bg-white relative">
        {/* Background Video */}
        <div className="absolute inset-0 w-full h-full">
          <video autoPlay loop muted playsInline className="absolute inset-0 w-full h-full object-cover">
            <source src={bgVideo} type="video/mp4" />
            Your browser does not support the video tag.
          </video>
          <div className="absolute inset-0 bg-black opacity-40"></div>
        </div>

        {/* Form Container */}
        <div className="relative z-10 w-full px-8 md:px-32 lg:px-24">
          <form className="bg-white/30 backdrop-blur-sm p-6 rounded-md shadow-2xl" onSubmit={handleSubmit}>
            {/* Header and Mode Toggle */}
            <div className="flex justify-between items-center mb-4">
              <h1 className="text-gray-800 font-bold text-2xl">
                {loginType === 'admin' ? "Admin Login" : 
                 loginType === 'moderator' ? "Moderator Login" : "Welcome Back!"}
              </h1>
              <button
                type="button"
                onClick={toggleLoginType}
                className={`px-4 py-1 rounded-full text-sm font-semibold transition-colors duration-200 flex items-center ${
                  loginType === "admin" ? "bg-red-600 hover:bg-red-700 text-white" :
                  loginType === "moderator" ? "bg-purple-600 hover:bg-purple-700 text-white" :
                  "bg-indigo-600 hover:bg-indigo-700 text-white"
                }`}
              >
                {loginType === 'admin' ? <><FiKey className="mr-1"/> Admin</> : 
                 loginType === 'moderator' ? <><FiBriefcase className="mr-1"/> Mod</> : 
                 <><FiUser className="mr-1"/>Alumni/Co.</>} Mode
              </button>
            </div>

            {/* Subtitle */}
            <p className="text-sm font-normal text-gray-600 mb-8">
              {loginType === 'admin' ? "Access the administration panel." : 
               loginType === 'moderator' ? "Access the moderator tools." : 
               "Log in as Alumni or Company."}
            </p>

            {/* Error/Success Messages */}
            {error && (
              <motion.div
                initial={{ opacity: 0, y: -10 }} 
                animate={{ opacity: 1, y: 0 }}
                className="mb-4 p-3 bg-red-100 text-red-700 rounded border border-red-300 text-sm"
              >
                {error}
              </motion.div>
            )}
            {successMessage && (
              <motion.div
                initial={{ opacity: 0, y: -10 }} 
                animate={{ opacity: 1, y: 0 }}
                className="mb-4 p-3 bg-green-100 text-green-700 rounded border border-green-300 text-sm"
              >
                {successMessage}
              </motion.div>
            )}

            {/* Email field */}
            <div className="relative group mt-5">
              <label className="absolute left-3 top-3 text-gray-500 text-sm flex items-center pointer-events-none">
                <FiMail className="mr-2" /> Email Address
              </label>
              <input
                className="block w-full px-3 pt-6 pb-2 border-b-2 border-gray-300 focus:border-indigo-500 outline-none bg-transparent text-gray-800"
                type="email"
                name="email"
                value={formData.email}
                onChange={handleInputChange}
                required
                autoComplete="email"
                placeholder="example@domain.com"
              />
            </div>

            {/* Password field */}
            <div className="relative group mt-8">
              <label className="absolute left-3 top-3 text-gray-500 text-sm flex items-center pointer-events-none">
                <FiLock className="mr-2" /> Password
              </label>
              <input
                className="block w-full px-3 pt-6 pb-2 border-b-2 border-gray-300 focus:border-indigo-500 outline-none bg-transparent text-gray-800 pr-10"
                type={showPassword ? "text" : "password"}
                name="password"
                value={formData.password}
                onChange={handleInputChange}
                required
                autoComplete="current-password"
                placeholder="••••••••"
                minLength="8"
              />
              <button 
                type="button" 
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-0 top-1/2 transform -translate-y-1/2 mt-1 text-gray-500 hover:text-gray-700"
              >
                {showPassword ? <FiEyeOff size={18} /> : <FiEye size={18} />}
              </button>
            </div>

            {/* Role Select - Conditional for Moderator */}
            {loginType === 'moderator' && (
              <div className="relative group mt-8">
                <label className="absolute left-3 top-3 text-gray-500 text-sm flex items-center pointer-events-none">
                  <FiBriefcase className="mr-2" /> Moderator Role
                </label>
                <select
                  className="block w-full px-3 pt-6 pb-2 border-b-2 border-gray-300 focus:border-indigo-500 outline-none bg-transparent text-gray-800 appearance-none"
                  name="role"
                  value={formData.role}
                  onChange={handleInputChange}
                  required
                >
                  <option value="" disabled>Select your role</option>
                  <option value="Finance">Finance</option>
                  <option value="Team Association">Team Association</option>
                </select>
                <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-500 top-1/2 -translate-y-1/2 mt-1.5">
                  <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20">
                    <path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z"/>
                  </svg>
                </div>
              </div>
            )}

            {/* Buttons */}
            <div className="flex gap-4 mt-8">
              <motion.button
                type="button"
                onClick={handleClear}
                className="flex-1 bg-gray-500 hover:bg-gray-600 py-2.5 rounded-lg text-white flex items-center justify-center font-semibold"
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.98 }}
                disabled={isLoading}
              >
                <FiX className="mr-1" /> Clear
              </motion.button>

              <motion.button
                type="submit"
                className="flex-1 bg-indigo-600 hover:bg-indigo-700 py-2.5 rounded-lg text-white flex items-center justify-center font-semibold"
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.98 }}
                disabled={isLoading}
              >
                {isLoading ? (
                  <span className="flex items-center">
                    <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Processing...
                  </span>
                ) : (
                  <>
                    {loginType === 'admin' ? "Login Admin" : 
                     loginType === 'moderator' ? "Login Moderator" : "Login"}
                  </>
                )}
              </motion.button>
            </div>

            {/* Links - Conditional for User Mode */}
            {loginType === 'user' && (
              <div className="flex justify-between mt-4 text-sm">
                <Link to="/forgot-password" className="text-indigo-200 hover:text-white hover:underline">
                  Forgot Password?
                </Link>
                <Link to="/register" className="text-indigo-200 hover:text-white hover:underline">
                  Create Account
                </Link>
              </div>
            )}
          </form>
        </div>
      </div>
    </div>
  );
}

export default Login;