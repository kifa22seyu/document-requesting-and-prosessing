import React, { useState } from "react";
import { motion } from "framer-motion";
import { FiMail } from "react-icons/fi";
import { Link } from "react-router-dom";

import bgVideo from "../image/Gamo_Square.mp4"; // Ensure this path is correct

function ForgetPassword() {
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();
    setMessage("If this email is registered, you will receive a password reset link.");
  };

  return (
    <div className="h-screen flex justify-center items-center bg-white relative">
      <div className="absolute inset-0 w-full h-full">
        <video autoPlay loop muted className="absolute inset-0 w-full h-full object-cover">
          <source src={bgVideo} type="video/mp4" />
          Your browser does not support the video tag.
        </video>
        <div className="absolute inset-0 bg-black opacity-40"></div>
      </div>

      <div className="relative z-10 w-full max-w-lg px-8 md:px-12">
        <form
          className="bg-white/30 backdrop-blur-sm p-6 rounded-md shadow-2xl relative overflow-hidden w-full"
          onSubmit={handleSubmit}
        >
          <h1 className="text-gray-800 font-bold text-2xl mb-1 text-center">Forgot Password?</h1>
          <p className="text-sm font-normal text-gray-600 mb-8 text-center">
            Enter your email to receive a password reset link.
          </p>

          {message && <p className="text-green-600 text-center mb-4">{message}</p>}

          <div className="relative group mt-5 w-full">
            <motion.label className="absolute left-3 top-3 text-gray-500 text-sm flex items-center transition-all duration-300">
              <FiMail className="mr-2 text-gray-500" />
              Email Address
            </motion.label>
            <input
              className="block w-full px-3 pt-6 pb-2 border-b-2 border-gray-300 focus:border-indigo-500 outline-none bg-transparent text-gray-800"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          <motion.button
            type="submit"
            className="block w-full bg-indigo-600 mt-8 py-2 rounded-2xl hover:bg-indigo-700 transition-all duration-500 text-white font-semibold"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            Send Reset Link
          </motion.button>

          {/* Back to Login */}
          <div className="flex justify-center mt-4">
            <Link to="/login" className="text-sm hover:text-blue-500 cursor-pointer transition-all">
              Back to Login
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
}

export default ForgetPassword;