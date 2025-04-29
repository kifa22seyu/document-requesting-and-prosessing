import React, { useState, useEffect } from "react";
import { Link, Outlet, useLocation, useNavigate } from "react-router-dom";
import { 
  FiMenu, FiCheckCircle, FiLogOut, FiBell, FiUser,
  FiHome, FiDatabase, FiSettings, FiDollarSign, 
  FiCreditCard, FiPieChart, FiTrendingUp, FiFileText
} from "react-icons/fi";
import { motion, AnimatePresence } from "framer-motion";

const FinanceAdmin = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [activeHover, setActiveHover] = useState(null);
  const [isCelebrating, setIsCelebrating] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [showNotifications, setShowNotifications] = useState(false);
  const [profileImage, setProfileImage] = useState(null);
  const [userData] = useState({
    name: "Finance Admin",
    role: "Finance Administrator"
  });
  const [payments] = useState([
    { id: 1, studentId: "STU001", name: "John Doe", amount: 2500, date: "2023-05-15", status: "verified", method: "Chapa" },
    { id: 2, studentId: "STU002", name: "Jane Smith", amount: 3000, date: "2023-05-14", status: "pending", method: "Chapa" },
    { id: 3, studentId: "STU003", name: "Mike Johnson", amount: 2750, date: "2023-05-14", status: "verified", method: "Bank Transfer" },
    { id: 4, studentId: "STU004", name: "Sarah Williams", amount: 3200, date: "2023-05-13", status: "rejected", method: "Chapa" },
    { id: 5, studentId: "STU005", name: "David Brown", amount: 2900, date: "2023-05-12", status: "verified", method: "Chapa" },
  ]);
  const navigate = useNavigate();
  const location = useLocation();

  const pendingVerifications = payments.filter(payment => payment.status === "pending");

  const getTimeEmoji = () => {
    const hour = new Date().getHours();
    if (hour < 12) return "🌞";
    if (hour < 18) return "🌤️";
    return "🌙";
  };

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
    triggerCelebration();
  };

  const triggerCelebration = () => {
    setIsCelebrating(true);
    setTimeout(() => setIsCelebrating(false), 1000);
  };

  const handleLogout = () => {
    triggerCelebration();
    setTimeout(() => navigate("/"), 800);
  };

  const stats = [
    { title: "Total Revenue", value: "₦1,245,800", change: "+18%", icon: <FiTrendingUp />, color: "from-green-400 to-green-600" },
    { title: "Pending Verifications", value: pendingVerifications.length, change: "+5%", icon: <FiFileText />, color: "from-yellow-400 to-yellow-600" },
    { title: "Verified Payments", value: payments.filter(p => p.status === "verified").length, change: "+12%", icon: <FiCheckCircle />, color: "from-blue-400 to-blue-600" },
    { title: "Rejected Payments", value: payments.filter(p => p.status === "rejected").length, change: "-2%", icon: <FiDatabase />, color: "from-red-400 to-red-600" },
  ];

  const menuItems = [
    { path: "/financeadmin", icon: FiHome, label: "Dashboard", emoji: "📊", color: "from-indigo-400 to-indigo-600" },
    { path: "/financeadmin/payments", icon: FiDollarSign, label: "Payment Records", emoji: "💰", color: "from-green-400 to-green-600" },
    { path: "/financeadmin/verification", icon: FiCheckCircle, label: "Verification", emoji: "✅", color: "from-blue-400 to-blue-600" },
    { path: "/financeadmin/chapa", icon: FiCreditCard, label: "Chapa Payments", emoji: "💳", color: "from-purple-400 to-purple-600" },
    { path: "/financeadmin/reports", icon: FiPieChart, label: "Reports", emoji: "📈", color: "from-teal-400 to-teal-600" },
    { path: "/financeadmin/settings", icon: FiSettings, label: "Settings", emoji: "⚙️", color: "from-gray-400 to-gray-600" },
  ];

  const Confetti = () => (
    <AnimatePresence>
      {isCelebrating && (
        <div className="fixed inset-0 pointer-events-none z-50 overflow-hidden">
          {[...Array(50)].map((_, i) => (
            <motion.div
              key={i}
              className="absolute w-2 h-2 rounded-full"
              style={{
                backgroundColor: [
                  '#ff0000', '#00ff00', '#0000ff', '#ffff00', 
                  '#ff00ff', '#00ffff', '#ff8800'
                ][Math.floor(Math.random() * 7)],
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
              }}
              initial={{ y: -20, opacity: 1 }}
              animate={{ 
                y: [0, window.innerHeight * 0.8],
                x: [0, (Math.random() - 0.5) * 200],
                opacity: [1, 0],
                rotate: [0, Math.random() * 360]
              }}
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
        {/* Header */}
        <motion.div 
          className="p-4 flex justify-between items-center border-b border-blue-700/50"
          whileHover={{ scale: 1.02 }}
        >
          {isSidebarOpen && (
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="flex items-center"
            >
              <motion.span 
                className="text-2xl mr-2"
                animate={{ rotate: [0, 20, -20, 0], y: [0, -5, 0] }}
                transition={{ duration: 1.5, repeat: Infinity, repeatDelay: 3 }}
              >
                {getTimeEmoji()}
              </motion.span>
              <h1 className="text-xl font-bold truncate bg-clip-text text-transparent bg-gradient-to-r from-yellow-300 to-white">
                Finance Admin
              </h1>
            </motion.div>
          )}
          <motion.button
            onClick={toggleSidebar}
            className="p-2 rounded-full hover:bg-blue-700 relative"
            whileTap={{ scale: 0.9 }}
            whileHover={{ scale: 1.1 }}
          >
            <FiMenu className="h-5 w-5" />
            {!isSidebarOpen && (
              <motion.span 
                className="absolute -right-1 -top-1 bg-red-500 text-xs rounded-full h-5 w-5 flex items-center justify-center"
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
              >
                👋
              </motion.span>
            )}
          </motion.button>
        </motion.div>

        {/* Navigation */}
        <nav className="mt-4 flex-1 overflow-y-auto px-2 space-y-2">
          {menuItems.map((item, index) => (
            <motion.div
              key={item.path}
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              onHoverStart={() => setActiveHover(index)}
              onHoverEnd={() => setActiveHover(null)}
            >
              <Link
                to={item.path}
                className={`flex items-center p-3 rounded-xl text-sm font-medium transition-all duration-300
                  ${location.pathname === item.path ? 
                    `bg-gradient-to-r ${item.color} text-white shadow-lg` : 
                    `bg-blue-700/10 text-blue-100 hover:bg-blue-700/30 hover:shadow-lg ${item.color.replace('from-', 'hover:shadow-').replace('to-', '300/50')}`
                  }
                  ${!isSidebarOpen ? "justify-center" : ""}
                `}
              >
                <motion.div
                  className={`relative ${isSidebarOpen ? "mr-3" : ""}`}
                  animate={{
                    y: activeHover === index ? [0, -5, 0] : 0,
                    rotate: activeHover === index ? [0, 10, -10, 0] : 0
                  }}
                >
                  <item.icon className={`h-6 w-6 ${item.color.includes('green') ? 'text-green-300' : 
                    item.color.includes('blue') ? 'text-blue-300' :
                    item.color.includes('purple') ? 'text-purple-300' :
                    item.color.includes('gray') ? 'text-gray-300' : 'text-indigo-300'}`} />
                  {activeHover === index && (
                    <motion.span 
                      className="absolute -top-2 -right-2 text-xs"
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                    >
                      {item.emoji}
                    </motion.span>
                  )}
                </motion.div>
                {isSidebarOpen && <span>{item.label}</span>}
              </Link>
            </motion.div>
          ))}
        </nav>

        {/* Logout */}
        <motion.div 
          className="mt-auto p-3 border-t border-blue-700/50"
          whileHover={{ scale: 1.01 }}
        >
          <motion.button
            onClick={handleLogout}
            className={`flex items-center w-full py-3 rounded-xl text-sm font-medium
              bg-gradient-to-r from-red-500 to-pink-600 text-white
              shadow-md hover:shadow-lg hover:shadow-red-300/50
              ${!isSidebarOpen ? "px-3 justify-center" : "px-4"}`}
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
        {/* Floating elements */}
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
                backgroundColor: [
                  '#ff0000', '#00ff00', '#0000ff', '#ffff00', 
                  '#ff00ff', '#00ffff', '#ff8800'
                ][Math.floor(Math.random() * 7)],
              }}
              animate={{
                y: [0, -100, 0],
                x: [0, (Math.random() - 0.5) * 100, 0],
                rotate: [0, Math.random() * 360],
              }}
              transition={{
                duration: Math.random() * 20 + 10,
                repeat: Infinity,
                repeatType: "reverse",
                ease: "easeInOut",
              }}
            />
          ))}
        </div>

        {/* Top Bar */}
        <header className="bg-white shadow-sm z-10">
          <div className="flex items-center justify-between p-4">
            <h2 className="text-xl font-semibold text-gray-800">
              {location.pathname === "/financeadmin" && "Finance Dashboard"}
              {location.pathname.includes("/payments") && "Payment Records"}
              {location.pathname.includes("/verification") && "Payment Verification"}
              {location.pathname.includes("/chapa") && "Chapa Payments"}
              {location.pathname.includes("/reports") && "Financial Reports"}
              {location.pathname.includes("/settings") && "Settings"}
            </h2>
            
            <div className="flex items-center space-x-4">
              {/* Notifications */}
              <div className="relative">
                <button 
                  onClick={() => setShowNotifications(!showNotifications)}
                  className="p-2 rounded-full hover:bg-gray-100 relative"
                >
                  <FiBell className="h-5 w-5 text-gray-600" />
                  {unreadCount > 0 && (
                    <span className="absolute top-0 right-0 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                      {unreadCount}
                    </span>
                  )}
                </button>
                
                {showNotifications && (
                  <div className="absolute right-0 mt-2 w-80 bg-white rounded-md shadow-lg overflow-hidden z-20">
                    <div className="p-3 bg-gradient-to-r from-blue-600 to-blue-800 text-white flex justify-between items-center">
                      <h3 className="font-medium">Notifications</h3>
                      <button className="text-xs hover:underline">Mark all as read</button>
                    </div>
                    <div className="max-h-96 overflow-y-auto">
                      {notifications.map(notification => (
                        <div key={notification.id} className="p-3 border-b hover:bg-gray-50">
                          <div className="flex justify-between">
                            <h4 className="font-medium">{notification.title}</h4>
                            {!notification.read && (
                              <span className="h-2 w-2 bg-blue-800 rounded-full"></span>
                            )}
                          </div>
                          <p className="text-sm text-gray-600">{notification.message}</p>
                          <p className="text-xs text-gray-400 mt-1">{notification.time}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
              
              {/* User Profile */}
              <div className="flex items-center space-x-2">
                <div className="relative">
                  {profileImage ? (
                    <img src={profileImage} alt="Profile" className="h-8 w-8 rounded-full object-cover" />
                  ) : (
                    <div className="h-8 w-8 rounded-full bg-blue-100 flex items-center justify-center">
                      <FiUser className="h-4 w-4 text-blue-800" />
                    </div>
                  )}
                </div>
                <div className="text-right">
                  <p className="text-sm font-medium">{userData.name}</p>
                  <p className="text-xs text-gray-500">{userData.role}</p>
                </div>
              </div>
            </div>
          </div>
        </header>

        {/* Main Content */}
        <main className="flex-1 overflow-y-auto p-6 bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50">
          {/* Dashboard Overview */}
          {location.pathname === "/financeadmin" && (
            <div className="mb-8">
              <h3 className="text-lg font-semibold text-gray-800 mb-4">Financial Overview</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {stats.map((stat, index) => (
                  <motion.div 
                    key={index}
                    className="bg-white rounded-lg shadow p-6 hover:shadow-md transition-shadow"
                    whileHover={{ y: -5 }}
                  >
                    <div className="flex justify-between">
                      <div>
                        <p className="text-sm font-medium text-gray-500">{stat.title}</p>
                        <p className="text-2xl font-semibold text-gray-800 mt-1">{stat.value}</p>
                        <p className={`text-xs mt-1 ${
                          stat.change.startsWith('+') ? 'text-green-500' : 'text-red-500'
                        }`}>
                          {stat.change} from last month
                        </p>
                      </div>
                      <div className={`h-12 w-12 rounded-full flex items-center justify-center text-white bg-gradient-to-r ${stat.color}`}>
                        <stat.icon.type className="h-6 w-6" />
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>

              {/* Recent Payments */}
              <div className="mt-8">
                <h3 className="text-lg font-semibold text-gray-800 mb-4">Recent Payments</h3>
                <div className="bg-white rounded-lg shadow overflow-hidden">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Student ID</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Amount</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Method</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {payments.map((payment) => (
                        <tr key={payment.id} className="hover:bg-gray-50">
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{payment.studentId}</td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{payment.name}</td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">₦{payment.amount.toLocaleString()}</td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{payment.date}</td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{payment.method}</td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm">
                            <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                              payment.status === 'verified' ? 'bg-green-100 text-green-800' :
                              payment.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                              'bg-red-100 text-red-800'
                            }`}>
                              {payment.status.charAt(0).toUpperCase() + payment.status.slice(1)}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}
          
          {/* Outlet */}
          <div className="bg-white rounded-lg shadow p-6">
            <Outlet context={{ payments, pendingVerifications }} />
          </div>
        </main>
      </div>
    </div>
  );
};

export default FinanceAdmin;