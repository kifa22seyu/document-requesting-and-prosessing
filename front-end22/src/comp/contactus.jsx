import React, { useState } from "react";
import { motion } from "framer-motion";
import { FiUser, FiMail, FiMessageSquare } from "react-icons/fi";
import Navbar from "./navbar";
import Footer from "./footer";

function ContactForm() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!name || !email || !message) {
      setError("Please fill out all fields.");
    } else {
      setError("");
      // Handle form submission (e.g., send data to an API)
      console.log("Form submitted:", { name, email, message });
    }
  };

  return (
    <>
   <Navbar />
    <div className="hero from-blue-100 via-blue-300 to-blue-500 bg-gradient-to-br py-10">
      <div className="heading mx-auto text-center">
        <motion.h1
          className="mx-auto my-5 text-center sm:text-4xl text-3xl font-bold"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          Have Some Questions?
        </motion.h1>
        <motion.div
          className="contact-icons flex sm:flex-row flex-col items-center justify-center text-center mx-auto"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5, duration: 0.5 }}
        >
          <motion.div className="flex flex-row my-2">
            <img
              src="https://img.icons8.com/material-sharp/24/marker.png"
              alt="location icon"
              width="25"
              height="25"
              className="mr-2"
            />
            Location
          </motion.div>
          <motion.div className="flex flex-row my-2">
            <img
              src="https://img.icons8.com/material-rounded/25/phone--v1.png"
              alt="phone icon"
              width="25"
              height="25"
              className="ml-5 mr-2"
            />
            Phone No.
          </motion.div>
          <motion.div className="flex flex-row my-2">
            <img
              src="https://img.icons8.com/material-rounded/96/mail.png"
              alt="mail icon"
              width="25"
              height="25"
              className="ml-5 mr-2"
            />
            Email Id
          </motion.div>
        </motion.div>
      </div>

      {/* Form Section */}
      <motion.div
        className="form-portion bg-white/20 backdrop-blur-sm sm:w-[80%] w-[90%] mx-auto rounded-lg shadow-lg p-6"
        initial={{ opacity: 0, y: 50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.8, duration: 0.5 }}
      >
        <form onSubmit={handleSubmit}>
          {/* Name Input Field */}
          <div className="relative group mt-5">
            <motion.label
              className="absolute left-3 top-3 text-gray-700 text-sm flex items-center transition-all duration-300 group-hover:-translate-y-5 group-hover:text-blue-500"
            >
              <FiUser className="mr-2 text-gray-700 group-hover:text-blue-500 transition-all duration-300" />
              Full Name
            </motion.label>
            <input
              className="block w-full px-3 pt-6 pb-2 border-b-2 border-gray-300 focus:border-blue-500 outline-none bg-transparent text-gray-800"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
          </div>

          {/* Email Input Field */}
          <div className="relative group mt-8">
            <motion.label
              className="absolute left-3 top-3 text-gray-700 text-sm flex items-center transition-all duration-300 group-hover:-translate-y-5 group-hover:text-blue-500"
            >
              <FiMail className="mr-2 text-gray-700 group-hover:text-blue-500 transition-all duration-300" />
              Email Address
            </motion.label>
            <input
              className="block w-full px-3 pt-6 pb-2 border-b-2 border-gray-300 focus:border-blue-500 outline-none bg-transparent text-gray-800"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          {/* Message Input Field */}
          <div className="relative group mt-8">
            <motion.label
              className="absolute left-3 top-3 text-gray-700 text-sm flex items-center transition-all duration-300 group-hover:-translate-y-5 group-hover:text-blue-500"
            >
              <FiMessageSquare className="mr-2 text-gray-700 group-hover:text-blue-500 transition-all duration-300" />
              Your Message
            </motion.label>
            <textarea
              className="block w-full px-3 pt-6 pb-2 border-b-2 border-gray-300 focus:border-blue-500 outline-none bg-transparent text-gray-800 resize-none"
              rows="4"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              required
            />
          </div>

          {/* Submit Button */}
          <motion.button
            type="submit"
            className="block w-full bg-blue-500 mt-8 py-2 rounded-2xl hover:bg-blue-600 transition-all duration-500 text-white font-semibold"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            Send Message
          </motion.button>
        </form>
      </motion.div>
    </div>
      <Footer/>
     </>
  );
}

export default ContactForm;