import React, { useState, useEffect } from "react";
import { Link, Outlet, useLocation, useNavigate } from "react-router-dom";
import { 
  FiMenu, 
  FiCheckCircle, 
  FiUserCheck, 
  FiFileText, 
  FiTruck, 
  FiCreditCard, 
  FiMessageCircle, 
  FiLogOut, 
  FiMessageSquare 
} from "react-icons/fi";

const AlumniDashboard = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [userName, setUserName] = useState("Alumni");
  const [authToken, setAuthToken] = useState(null);
  const [isAuthenticating, setIsAuthenticating] = useState(true);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    let userInfo = null;
    setIsAuthenticating(true);

    console.log("AlumniDashboard: useEffect running...");

    const token = localStorage.getItem("token");

    if (token) {
      setAuthToken(token);
      console.log("AlumniDashboard: Auth token found in localStorage ('token' key).");

      try {
        const storedUserInfo = localStorage.getItem("userInfo");
        console.log("AlumniDashboard: Raw userInfo from localStorage:", storedUserInfo);

        if (storedUserInfo) {
          userInfo = JSON.parse(storedUserInfo);
          console.log("AlumniDashboard: Parsed userInfo:", userInfo);

          const nameFromStorage = userInfo.fullName || userInfo.name || "Alumni";
          setUserName(nameFromStorage);
          console.log("AlumniDashboard: User name set to:", nameFromStorage);
        } else {
          console.warn("AlumniDashboard: No userInfo found in localStorage ('userInfo' key), but token exists.");
        }
      } catch (error) {
        console.error("AlumniDashboard: Error parsing userInfo from localStorage:", error);
      }
    } else {
      console.error("AlumniDashboard: Auth token NOT found in localStorage ('token' key). Redirecting to login.");
      localStorage.clear();
      navigate("/login");
      return;
    }

    setIsAuthenticating(false);
    console.log("AlumniDashboard: Authentication check complete.");
  }, [navigate]);

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  const handleLogout = () => {
    console.log("Logging out...");
    localStorage.removeItem("token");
    localStorage.removeItem("userInfo");
    localStorage.removeItem("userRoleType");
    setAuthToken(null);
    setUserName("Alumni");
    navigate("/login");
  };

  const menuItems = [
    { path: "/alumni-dashboard/identity-verification", icon: FiCheckCircle, label: "Verified Identity", color: "bg-green-500" },
    { path: "/alumni-dashboard/student-information", icon: FiUserCheck, label: "Student Info", color: "bg-blue-500" },
    { path: "/alumni-dashboard/request-form", icon: FiFileText, label: "Request Form", color: "bg-yellow-500" },
    { path: "/alumni-dashboard/delivery-method", icon: FiTruck, label: "Delivery", color: "bg-orange-500" },
    { path: "/alumni-dashboard/payment-methods", icon: FiCreditCard, label: "Payments", color: "bg-purple-500" },
    { path: "/alumni-dashboard/messaging", icon: FiMessageSquare, label: "Messaging", color: "bg-indigo-500" },
    { path: "/alumni-dashboard/testimonial", icon: FiMessageCircle, label: "Testimonial", color: "bg-pink-500" },
  ];

  return (
    <div className="flex h-screen bg-gray-100">
      {/* Sidebar */}
      <div className={`${isSidebarOpen ? "w-64" : "w-20"} bg-blue-800 text-white transition-all duration-300 flex flex-col`}>
        {/* Header */}
        <div className="p-4 flex justify-between items-center border-b border-blue-700">
          {isSidebarOpen && (
            <div className="flex items-center">
              <h1 className="text-xl font-bold truncate" title={`Hi, ${userName}!`}>
                Hi, {userName}!
              </h1>
            </div>
          )}
          <button
            onClick={toggleSidebar}
            className="p-2 rounded-full hover:bg-blue-700 focus:outline-none"
            aria-label={isSidebarOpen ? "Close sidebar" : "Open sidebar"}
          >
            <FiMenu className="h-5 w-5" />
          </button>
        </div>

        {/* Navigation */}
        <nav className="mt-4 flex-1 overflow-y-auto px-2 space-y-2">
          {menuItems.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              className={`flex items-center p-3 rounded-lg text-sm font-medium
                ${location.pathname.startsWith(item.path) ?
                  `${item.color} text-white shadow-md` :
                  "bg-blue-700 bg-opacity-10 text-blue-100 hover:bg-blue-700 hover:bg-opacity-30"
                }
                ${!isSidebarOpen ? "justify-center" : ""}
              `}
              title={item.label}
            >
              <item.icon className={`h-5 w-5 ${isSidebarOpen ? "mr-3" : ""}`} />
              {isSidebarOpen && item.label}
            </Link>
          ))}
        </nav>

        {/* Logout button */}
        <div className="mt-auto p-3 border-t border-blue-700">
          <button
            onClick={handleLogout}
            className={`flex items-center w-full py-2 rounded-lg text-sm font-medium transition-colors duration-150
              bg-red-600 text-white hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 focus:ring-offset-blue-800
              ${!isSidebarOpen ? "px-3 justify-center" : "px-4"}`}
            title="Logout"
          >
            <FiLogOut className={`h-5 w-5 ${isSidebarOpen ? "mr-2" : ""}`} />
            {isSidebarOpen && "Logout"}
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        <main className="flex-1 p-4 md:p-6 overflow-y-auto bg-gray-200">
          {isAuthenticating ? (
            <div className="flex justify-center items-center h-full">
              <div className="text-center p-10">
                <svg className="animate-spin h-8 w-8 text-blue-600 mx-auto mb-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Verifying authentication...
              </div>
            </div>
          ) : (
            <Outlet context={{ authToken }} />
          )}
        </main>
      </div>
    </div>
  );
};

export default AlumniDashboard;