import React, { useState } from "react";
import { Link, Outlet, useLocation, Navigate } from "react-router-dom"; // Import Navigate
import { FiMenu, FiUsers, FiFileText, FiMessageSquare, FiLogOut, FiGrid, FiSettings } from "react-icons/fi"; // Changed icons for admin context

// Renamed the function component to Admindashcontrol
const Admindashcontrol = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [isLoggedOut, setIsLoggedOut] = useState(false); // State for logout status

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  const location = useLocation();

  const handleLogout = () => {
    // Clear the admin token (assuming a different token or key for admin)
    // Adjust 'adminToken' if your key is different
    localStorage.removeItem('adminToken');
    // Or if using the same token key as alumni: localStorage.removeItem('token');
    setIsLoggedOut(true); // Set state to trigger redirection
  };

  // Redirect to an admin login page or home page if logged out
  if (isLoggedOut) {
    // Redirect to '/admin-login' or '/' based on your routing setup
    return <Navigate to="/admin-login" />; // Or <Navigate to="/" />;
  }

  // --- TODO: Add Authentication Check ---
  // You should ideally add a check here to ensure an admin is actually logged in.
  // Example:
  // const adminToken = localStorage.getItem('adminToken');
  // if (!adminToken) {
  //   return <Navigate to="/admin-login" />;
  // }
  // ------------------------------------

  return (
    <div className="flex h-screen font-sans">
      {/* Sidebar - Consider a different color for Admin, e.g., Gray or Dark Green, or keep Blue */}
      <div
        className={`bg-gray-800 text-white shadow-lg transition-all duration-300 ${ // Changed bg color for distinction
          isSidebarOpen ? "w-64" : "w-20"
        }`}
      >
        <div className="p-4 flex justify-between items-center">
          {isSidebarOpen && (
            <h1 className="text-xl font-bold">Admin Dashboard</h1>
          )}
          <button onClick={toggleSidebar} className="text-white focus:outline-none">
            <FiMenu className="h-6 w-6" />
          </button>
        </div>
        <nav className="mt-6">
          {/* Link to Admin Overview/Dashboard Home */}
          <Link
            to="/admin/overview" // Changed base path to /admin/*
            className={`flex items-center p-3 hover:bg-gray-700 transition duration-200 ${
              location.pathname === "/admin/overview" || location.pathname === "/admin" ? "bg-gray-700" : "" // Highlight for base /admin too
            }`}
          >
            <FiGrid className="h-5 w-5" />
            {isSidebarOpen && <span className="ml-3">Overview</span>}
          </Link>

          {/* Link to Manage User Requests */}
          <Link
            to="/admin/requests"
            className={`flex items-center p-3 hover:bg-gray-700 transition duration-200 ${
              location.pathname.startsWith("/admin/requests") ? "bg-gray-700" : "" // Highlight if path starts with /admin/requests
            }`}
          >
            <FiFileText className="h-5 w-5" />
            {isSidebarOpen && <span className="ml-3">Manage Requests</span>}
          </Link>

          {/* Link to Manage Users (Alumni) */}
          <Link
            to="/admin/users"
            className={`flex items-center p-3 hover:bg-gray-700 transition duration-200 ${
              location.pathname.startsWith("/admin/users") ? "bg-gray-700" : ""
            }`}
          >
            <FiUsers className="h-5 w-5" />
            {isSidebarOpen && <span className="ml-3">Manage Users</span>}
          </Link>

          {/* Link to Manage Testimonials */}
          <Link
            to="/admin/testimonials"
            className={`flex items-center p-3 hover:bg-gray-700 transition duration-200 ${
              location.pathname.startsWith("/admin/testimonials") ? "bg-gray-700" : ""
            }`}
          >
            <FiMessageSquare className="h-5 w-5" />
            {isSidebarOpen && <span className="ml-3">Manage Testimonials</span>}
          </Link>

          {/* Optional: Link to Settings */}
          <Link
            to="/admin/settings"
            className={`flex items-center p-3 hover:bg-gray-700 transition duration-200 ${
              location.pathname === "/admin/settings" ? "bg-gray-700" : ""
            }`}
          >
            <FiSettings className="h-5 w-5" />
            {isSidebarOpen && <span className="ml-3">Settings</span>}
          </Link>

          {/* Logout Button */}
          <button
             onClick={handleLogout}
             className="w-full flex items-center p-3 hover:bg-gray-700 transition duration-200 mt-4" // Added w-full for consistency
          >
            <FiLogOut className="h-5 w-5" />
            {isSidebarOpen && <span className="ml-3">Logout</span>}
          </button>
        </nav>
      </div>

      {/* Main Content Area - Keep gradient or use a different one */}
      <div className="flex-1 p-8 overflow-y-auto bg-gradient-to-br from-gray-100 via-gray-200 to-gray-300"> {/* Adjusted gradient */}
        {/* Outlet for Nested Admin Routes */}
        {/* This is where components like RequestList, UserManagementTable, etc. will render */}
        <Outlet />
      </div>
    </div>
  );
};

// Updated the export to use the new function name
export default Admindashcontrol;