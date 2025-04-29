import React, { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { FiUser, FiBriefcase, FiLogOut } from 'react-icons/fi';

const Dashboard = () => {
  const [message, setMessage] = useState("");
  const [userName, setUserName] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const token = localStorage.getItem("token");
        if (!token) {
          navigate("/login");
          return;
        }

        const storedUserName = localStorage.getItem("userName");
        if (storedUserName) setUserName(storedUserName);

        const config = {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        };

        const response = await axios.get("http://localhost:8000/auth/dashboard", config);
        setMessage(response.data.message);
      } catch (error) {
        console.error("Dashboard error:", error);
        navigate("/login");
      }
    };

    fetchDashboardData();
  }, [navigate]);

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("userName");
    navigate("/login");
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-100 via-blue-300 to-blue-500">
      {/* Beautiful header with logout */}
      <div className="bg-white/30 backdrop-blur-sm p-4 shadow-md flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-800">Alumni Portal</h1>
        <div className="flex items-center space-x-4">
          {userName && (
            <span className="text-gray-700 font-medium">
              {userName}
            </span>
          )}
          <button 
            onClick={handleLogout}
            className="flex items-center text-gray-700 hover:text-red-600 transition-colors"
          >
            <FiLogOut className="mr-1" /> Logout
          </button>
        </div>
      </div>

      {/* Simple two-card layout */}
      <div className="flex justify-center items-center h-[calc(100vh-80px)]">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 p-6 max-w-4xl mx-auto">
          {/* Alumni Portal Card */}
          <div
            className="p-8 bg-white/20 backdrop-blur-sm shadow-lg rounded-2xl text-center cursor-pointer hover:shadow-2xl transition transform hover:scale-105 flex flex-col items-center justify-center"
            onClick={() => navigate('/almunidashbored')}
          >
            <div className="bg-blue-100/50 p-4 rounded-full mb-4">
              <FiUser className="text-blue-500 text-3xl" />
            </div>
            <h2 className="text-2xl font-bold text-gray-700">Alumni Portal</h2>
            <p className="text-gray-700 mt-2">Access your alumni dashboard</p>
          </div>

          {/* Company Portal Card */}
          <div
            className="p-8 bg-white/20 backdrop-blur-sm shadow-lg rounded-2xl text-center cursor-pointer hover:shadow-2xl transition transform hover:scale-105 flex flex-col items-center justify-center"
            onClick={() => navigate('/companydashboard')}
          >
            <div className="bg-purple-100/50 p-4 rounded-full mb-4">
              <FiBriefcase className="text-purple-500 text-3xl" />
            </div>
            <h2 className="text-2xl font-bold text-gray-700">Company Portal</h2>
            <p className="text-gray-700 mt-2">Manage verification requests</p>
          </div>
        </div>
      </div>

      {message && (
        <div className="absolute bottom-8 left-0 right-0 p-4 bg-white/50 rounded-lg max-w-2xl mx-auto text-center">
          <p className="text-gray-700">{message}</p>
        </div>
      )}
    </div>
  );
};

export default Dashboard;