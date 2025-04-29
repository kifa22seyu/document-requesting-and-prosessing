import React from "react";
import { Link } from "react-router-dom";
import { FiUser, FiBriefcase } from "react-icons/fi";

const Client = () => {
  return (
    <div className="flex justify-center items-center h-screen bg-gradient-to-br from-blue-100 via-blue-300 to-blue-500">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 p-6 max-w-4xl mx-auto">
        {/* Alumni Login Card */}
        <Link
          to="/almunidashbored" // Ensure this matches the route in App
          className="p-8 bg-white/20 backdrop-blur-sm shadow-lg rounded-2xl text-center cursor-pointer hover:shadow-2xl transition transform hover:scale-105 flex flex-col items-center justify-center"
        >
          <div className="bg-blue-100/50 p-4 rounded-full mb-4">
            <FiUser className="text-blue-500 text-3xl" />
          </div>
          <h2 className="text-2xl font-bold text-gray-700">Login as Alumni</h2>
          <p className="text-gray-700 mt-2">Access your alumni portal</p>
        </Link>

        {/* Company Login Card */}
        <Link
          to="/company-login"
          className="p-8 bg-white/20 backdrop-blur-sm shadow-lg rounded-2xl text-center cursor-pointer hover:shadow-2xl transition transform hover:scale-105 flex flex-col items-center justify-center"
        >
          <div className="bg-purple-100/50 p-4 rounded-full mb-4">
            <FiBriefcase className="text-purple-500 text-3xl" />
          </div>
          <h2 className="text-2xl font-bold text-gray-700">Login as Company</h2>
          <p className="text-gray-700 mt-2">Manage verification requests</p>
        </Link>
      </div>
    </div>
  );
};

export default Client;