import React, { useState, useEffect } from "react";
import { Link, Outlet, useLocation, useNavigate } from "react-router-dom";
import {
  FiMenu, FiCheckCircle, FiUser, FiUsers, FiFileText,
  FiLogOut, FiBell, FiHome, FiDatabase, FiSettings,
  FiAlertCircle
} from "react-icons/fi";
import { motion, AnimatePresence } from "framer-motion";

const TeamAssociationDashboard = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [activeHover, setActiveHover] = useState(null);
  const [isCelebrating, setIsCelebrating] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [showNotifications, setShowNotifications] = useState(false);
  const [profileImage, setProfileImage] = useState(null);
  const [userData, setUserData] = useState({
    name: "Loading...",
    email: "",
    role: ""
  });
  const [requests, setRequests] = useState([]);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    // Authentication & Role Check
    const token = localStorage.getItem("token");
    const userRoleType = localStorage.getItem("userRoleType");

    if (!token || userRoleType !== 'moderator-teamassoc') {
      localStorage.removeItem("token");
      localStorage.removeItem("userInfo");
      localStorage.removeItem("userRoleType");
      localStorage.removeItem("teamAssocProfileImage");
      navigate('/');
      return;
    }

    // Load User Info
    const storedUserInfo = localStorage.getItem("userInfo");
    if (storedUserInfo) {
      try {
        const parsedInfo = JSON.parse(storedUserInfo);
        setUserData({
          name: parsedInfo.name || "Team Member",
          email: parsedInfo.email || "N/A",
          role: parsedInfo.role || "Team Association"
        });
      } catch (e) {
        setUserData({ name: "Error Loading", email: "", role: "" });
      }
    } else {
      setUserData({ name: "User (No Details)", email: "", role: "Team Association" });
    }

    // Load Profile Image
    const savedImage = localStorage.getItem('teamAssocProfileImage');
    if (savedImage) {
      setProfileImage(savedImage);
    }

    // Mock Data
    const mockRequests = [
      { id: 1, studentId: "STU001", name: "John Doe", type: "Diploma Verification", date: "2023-05-15", status: "pending", details: "Requesting verification for 2023 diploma" },
      { id: 2, studentId: "STU002", name: "Jane Smith", type: "Transcript Request", date: "2023-05-14", status: "pending", details: "Need official transcript for job application" },
      { id: 3, studentId: "STU003", name: "Mike Johnson", type: "Certificate Verification", date: "2023-05-14", status: "approved", details: "Verification for professional certification" },
      { id: 4, studentId: "STU004", name: "Sarah Williams", type: "Diploma Verification", date: "2023-05-13", status: "rejected", details: "Incomplete documentation provided" },
      { id: 5, studentId: "STU005", name: "David Brown", type: "Transcript Request", date: "2023-05-12", status: "approved", details: "Transcript for graduate school application" },
    ];

    const mockNotifications = [
      { id: 1, title: "New verification request", message: "3 new requests pending review", time: "15 mins ago", read: false },
      { id: 2, title: "Request approved", message: "Your approval for STU005 has been processed", time: "3 hours ago", read: false },
      { id: 3, title: "System update", message: "New features added to verification system", time: "1 day ago", read: true },
    ];

    setRequests(mockRequests);
    setNotifications(mockNotifications);
    setUnreadCount(mockNotifications.filter(n => !n.read).length);
  }, [navigate]);

  const getTimeEmoji = () => {
    const hour = new Date().getHours();
    if (hour < 12) return "🌞";
    if (hour < 18) return "🌤️";
    return "🌙";
  };

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  const triggerCelebration = () => {
    setIsCelebrating(true);
    setTimeout(() => setIsCelebrating(false), 1000);
  };

  const handleLogout = () => {
    triggerCelebration();
    setTimeout(() => {
      localStorage.removeItem("token");
      localStorage.removeItem("userInfo");
      localStorage.removeItem("userRoleType");
      localStorage.removeItem("teamAssocProfileImage");
      navigate("/");
    }, 800);
  };

  const markAsRead = (id) => {
    const updatedNotifications = notifications.map(notification =>
      notification.id === id ? { ...notification, read: true } : notification
    );
    setNotifications(updatedNotifications);
    setUnreadCount(updatedNotifications.filter(n => !n.read).length);
  };

  const markAllAsRead = () => {
    const updatedNotifications = notifications.map(notification =>
      ({ ...notification, read: true })
    );
    setNotifications(updatedNotifications);
    setUnreadCount(0);
  };

  const updateUserDataState = (newUserData) => {
    setUserData(prev => ({...prev, ...newUserData}));
  };

  const handleImageUploadState = (imageDataUrl) => {
    setProfileImage(imageDataUrl);
    localStorage.setItem('teamAssocProfileImage', imageDataUrl);
  };

  const approveRequest = (requestId) => {
    setRequests(prevRequests => prevRequests.map(request =>
      request.id === requestId ? { ...request, status: "approved" } : request
    ));
    triggerCelebration();
  };

  const rejectRequest = (requestId) => {
    setRequests(prevRequests => prevRequests.map(request =>
      request.id === requestId ? { ...request, status: "rejected" } : request
    ));
  };

  const stats = [
    { title: "Pending Requests", value: requests.filter(r => r.status === "pending").length, change: "+5%", icon: FiFileText, color: "from-yellow-400 to-yellow-600" },
    { title: "Approved Requests", value: requests.filter(r => r.status === "approved").length, change: "+12%", icon: FiCheckCircle, color: "from-green-400 to-green-600" },
    { title: "Rejected Requests", value: requests.filter(r => r.status === "rejected").length, change: "-3%", icon: FiAlertCircle, color: "from-red-400 to-red-600" },
    { title: "Total Processed", value: requests.length, change: "+8%", icon: FiDatabase, color: "from-blue-400 to-blue-600" },
  ];

  const menuItems = [
    { path: "/teamassociation", icon: FiHome, label: "Dashboard", emoji: "📊", color: "from-indigo-400 to-indigo-600", isBasePath: true },
    { path: "requests", icon: FiFileText, label: "Request Review", emoji: "📝", color: "from-purple-400 to-purple-600" },
    { path: "verification", icon: FiCheckCircle, label: "Verification", emoji: "✅", color: "from-teal-400 to-teal-600" },
    { path: "members", icon: FiUsers, label: "Team Members", emoji: "👥", color: "from-blue-400 to-blue-600" },
    { path: "settings", icon: FiSettings, label: "Settings", emoji: "⚙️", color: "from-gray-400 to-gray-600" },
  ];

  const isActiveLink = (itemPath, isBasePath = false) => {
    const currentPath = location.pathname;
    if (isBasePath) {
      return currentPath === itemPath;
    }
    return currentPath === `${menuItems.find(item => item.isBasePath)?.path || ''}/${itemPath}` || 
           currentPath.startsWith(`${menuItems.find(item => item.isBasePath)?.path || ''}/${itemPath}/`);
  };

  const activeMenuItem = menuItems.find(item => isActiveLink(item.path, item.isBasePath));
  const currentTitle = activeMenuItem ? activeMenuItem.label : "Team Dashboard";

  const Confetti = () => (
    <AnimatePresence>
      {isCelebrating && (
        <div className="fixed inset-0 pointer-events-none z-50 overflow-hidden">
          {[...Array(50)].map((_, i) => (
            <motion.div
              key={i}
              className="absolute w-2 h-2 rounded-full"
              style={{
                backgroundColor: ['#ff0000', '#00ff00', '#0000ff', '#ffff00', '#ff00ff', '#00ffff', '#ff8800'][Math.floor(Math.random() * 7)],
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
              }}
              initial={{ y: -20, opacity: 1 }}
              animate={{ y: [0, window.innerHeight * 0.8], x: [0, (Math.random() - 0.5) * 200], opacity: [1, 0], rotate: [0, Math.random() * 360] }}
              transition={{ duration: 1.5, ease: "linear" }}
              exit={{ opacity: 0 }}
            />
          ))}
        </div>
      )}
    </AnimatePresence>
  );

  return (
    <div className="flex h-screen font-sans bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 overflow-hidden">
      <Confetti />

      {/* Sidebar */}
      <motion.div
        className="relative z-20 shadow-2xl flex flex-col bg-gradient-to-b from-blue-600 to-blue-800 text-white"
        initial={{ width: 256 }}
        animate={{ width: isSidebarOpen ? 256 : 80 }}
        transition={{ type: "spring", stiffness: 300, damping: 30 }}
      >
        {/* Sidebar Header */}
        <motion.div
          className="p-4 flex justify-between items-center border-b border-blue-700/50"
          whileHover={{ scale: 1.02 }}
        >
          {isSidebarOpen && (
            <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} className="flex items-center">
              <motion.span className="text-2xl mr-2" animate={{ rotate: [0, 20, -20, 0], y: [0, -5, 0] }} transition={{ duration: 1.5, repeat: Infinity, repeatDelay: 3 }}>
                {getTimeEmoji()}
              </motion.span>
              <h1 className="text-xl font-bold truncate bg-clip-text text-transparent bg-gradient-to-r from-yellow-300 to-white">
                Team Association
              </h1>
            </motion.div>
          )}
          <motion.button onClick={toggleSidebar} className="p-2 rounded-full hover:bg-blue-700 relative" whileTap={{ scale: 0.9 }} whileHover={{ scale: 1.1 }}>
            <FiMenu className="h-5 w-5" />
            {!isSidebarOpen && ( <motion.span className="absolute -right-1 -top-1 bg-red-500 text-xs rounded-full h-5 w-5 flex items-center justify-center" initial={{ scale: 0 }} animate={{ scale: 1 }}> 👋 </motion.span> )}
          </motion.button>
        </motion.div>

        {/* Navigation */}
        <nav className="mt-4 flex-1 overflow-y-auto px-2 space-y-2">
          {menuItems.map((item, index) => (
            <motion.div
              key={`${item.path}-${index}`}
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              onHoverStart={() => setActiveHover(index)}
              onHoverEnd={() => setActiveHover(null)}
            >
              <Link
                to={item.isBasePath ? item.path : item.path}
                className={`flex items-center p-3 rounded-xl text-sm font-medium transition-all duration-300
                  ${isActiveLink(item.path, item.isBasePath) ?
                    `bg-gradient-to-r ${item.color} text-white shadow-lg` :
                    `bg-blue-700/10 text-blue-100 hover:bg-blue-700/30 hover:shadow-lg ${item.color.replace('from-', 'hover:shadow-').replace('to-', '300/50')}`
                  }
                  ${!isSidebarOpen ? "justify-center" : ""}
                `}
              >
                <motion.div className={`relative ${isSidebarOpen ? "mr-3" : ""}`} animate={{ y: activeHover === index ? [0, -5, 0] : 0, rotate: activeHover === index ? [0, 10, -10, 0] : 0 }}>
                  <item.icon className={`h-6 w-6 ${item.color.includes('green') ? 'text-green-300' : item.color.includes('blue') ? 'text-blue-300' : item.color.includes('purple') ? 'text-purple-300' : item.color.includes('gray') ? 'text-gray-300' : 'text-indigo-300'}`} />
                  {activeHover === index && ( <motion.span className="absolute -top-2 -right-2 text-xs" initial={{ scale: 0 }} animate={{ scale: 1 }}> {item.emoji} </motion.span> )}
                </motion.div>
                {isSidebarOpen && <span>{item.label}</span>}
              </Link>
            </motion.div>
          ))}
        </nav>

        {/* Logout Button */}
        <motion.div className="mt-auto p-3 border-t border-blue-700/50" whileHover={{ scale: 1.01 }}>
          <motion.button
            onClick={handleLogout}
            className={`flex items-center w-full py-3 rounded-xl text-sm font-medium bg-gradient-to-r from-red-500 to-pink-600 text-white shadow-md hover:shadow-lg hover:shadow-red-300/50 ${!isSidebarOpen ? "px-3 justify-center" : "px-4"}`}
            whileHover={{ scale: 1.05, transition: { yoyo: Infinity, duration: 0.4 } }}
            whileTap={{ scale: 0.95 }}
          >
            <FiLogOut className={`h-5 w-5 ${isSidebarOpen ? "mr-2" : ""}`} />
            {isSidebarOpen && "Logout"}
          </motion.button>
        </motion.div>
      </motion.div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden relative">
        {/* Background elements */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          {[...Array(15)].map((_, i) => (
            <motion.div
              key={i}
              className="absolute rounded-full opacity-10"
              style={{
                width: Math.random() * 120 + 30,
                height: Math.random() * 120 + 30,
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
                backgroundColor: ['#ff0000', '#00ff00', '#0000ff', '#ffff00', '#ff00ff', '#00ffff', '#ff8800'][Math.floor(Math.random() * 7)],
              }}
              animate={{
                y: [0, Math.random() * -200 - 50, 0],
                x: [0, (Math.random() - 0.5) * 150, 0],
                rotate: [0, Math.random() * 360],
                scale: [1, Math.random() * 0.5 + 0.8, 1],
              }}
              transition={{
                duration: Math.random() * 25 + 15,
                repeat: Infinity,
                repeatType: "mirror",
                ease: "easeInOut",
              }}
            />
          ))}
        </div>

        {/* Top Bar */}
        <header className="bg-white/80 backdrop-blur-sm shadow-sm z-10 border-b border-gray-200/50">
          <div className="flex items-center justify-between p-4">
            <h2 className="text-xl font-semibold text-gray-800">{currentTitle}</h2>

            <div className="flex items-center space-x-4">
              {/* Notifications */}
              <div className="relative">
                <button onClick={() => setShowNotifications(!showNotifications)} className="p-2 rounded-full hover:bg-gray-100 relative transition-colors">
                  <FiBell className="h-5 w-5 text-gray-600" />
                  {unreadCount > 0 && ( <span className="absolute top-0 right-0 bg-red-500 text-white text-xs rounded-full h-4 w-4 flex items-center justify-center text-[10px] animate-pulse"> {unreadCount} </span> )}
                </button>
                
                <AnimatePresence>
                  {showNotifications && (
                    <motion.div
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      transition={{ duration: 0.2 }}
                      className="absolute right-0 mt-2 w-80 bg-white rounded-md shadow-lg overflow-hidden z-20 border"
                    >
                      <div className="p-3 bg-gradient-to-r from-blue-600 to-blue-800 text-white flex justify-between items-center">
                        <h3 className="font-medium text-sm">Notifications</h3>
                        {notifications.length > 0 && unreadCount > 0 && (
                          <button onClick={markAllAsRead} className="text-xs hover:underline opacity-80 hover:opacity-100 transition-opacity">
                            Mark all as read
                          </button>
                        )}
                      </div>
                      <div className="max-h-96 overflow-y-auto">
                        {notifications.length === 0 ? (
                          <p className="p-4 text-center text-sm text-gray-500">No new notifications.</p>
                        ) : (
                          notifications.map(notification => (
                            <div
                              key={notification.id}
                              className={`p-3 border-b hover:bg-gray-50 cursor-pointer transition-colors ${!notification.read ? 'bg-blue-50 font-medium' : 'text-gray-700'}`}
                              onClick={() => markAsRead(notification.id)}
                            >
                              <div className="flex justify-between items-center mb-1">
                                <h4 className={`text-sm ${!notification.read ? 'text-blue-800' : 'text-gray-800'}`}>{notification.title}</h4>
                                {!notification.read && ( <span className="h-2 w-2 bg-blue-500 rounded-full flex-shrink-0 ml-2"></span> )}
                              </div>
                              <p className={`text-xs ${!notification.read ? 'text-gray-600' : 'text-gray-500'}`}>{notification.message}</p>
                              <p className="text-xs text-gray-400 mt-1">{notification.time}</p>
                            </div>
                          ))
                        )}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* User Profile */}
              <div className="flex items-center space-x-2 cursor-pointer group" onClick={() => navigate('settings')}>
                <div className="relative">
                  {profileImage ? (
                    <img src={profileImage} alt="Profile" className="h-9 w-9 rounded-full object-cover border-2 border-transparent group-hover:border-blue-400 transition-colors" />
                  ) : (
                    <div className="h-9 w-9 rounded-full bg-blue-100 flex items-center justify-center border-2 border-transparent group-hover:border-blue-400 transition-colors">
                      <FiUser className="h-4 w-4 text-blue-600" />
                    </div>
                  )}
                  <span className="absolute bottom-0 right-0 block h-2.5 w-2.5 rounded-full bg-green-400 ring-2 ring-white"></span>
                </div>
                <div className="text-right hidden sm:block">
                  <p className="text-sm font-medium text-gray-800">{userData.name}</p>
                  <p className="text-xs text-gray-500">{userData.role}</p>
                </div>
              </div>
            </div>
          </div>
        </header>

        {/* Main Content Area */}
        <main className="flex-1 overflow-y-auto p-6 bg-gradient-to-br from-blue-50/10 via-purple-50/10 to-pink-50/10">
          <Outlet context={{
            userData,
            updateUserDataState,
            profileImage,
            handleImageUploadState,
            requests,
            approveRequest,
            rejectRequest
          }} />
        </main>
      </div>
    </div>
  );
};

export default TeamAssociationDashboard;