import React, { useState, useEffect, useRef, useCallback } from "react";
import { Link, Outlet, useLocation, useNavigate } from "react-router-dom";
import {
  FiMenu, FiCheckCircle, FiLogOut, FiSettings, FiMail, FiInbox, FiSend,
  FiChevronDown, FiChevronUp
} from "react-icons/fi";
import { motion, AnimatePresence } from "framer-motion";

const CompanyDashboard = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [activeHover, setActiveHover] = useState(null);
  const [isCelebrating, setIsCelebrating] = useState(false);
  const [companyName, setCompanyName] = useState("Company");
  const [isMessagesSubmenuOpen, setIsMessagesSubmenuOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    try {
      const storedUserInfo = localStorage.getItem("userInfo");
      if (storedUserInfo) {
        const userInfo = JSON.parse(storedUserInfo);
        const nameFromStorage = userInfo.name || userInfo.companyName || "Company";
        setCompanyName(nameFromStorage);
      }
    } catch (error) {
      console.error("Error parsing userInfo:", error);
    }
  }, []);

  const getTimeEmoji = () => {
    const hour = new Date().getHours();
    if (hour < 12) return "🌞";
    if (hour < 18) return "🌤️";
    return "🌙";
  };

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
    if (isSidebarOpen) {
       setIsMessagesSubmenuOpen(false);
    }
  };

  const toggleMessagesSubmenu = () => {
      if (isSidebarOpen) {
          setIsMessagesSubmenuOpen(prev => !prev);
      }
  }

  const handleLogout = () => {
    setIsCelebrating(true);
    setTimeout(() => {
      localStorage.removeItem("token");
      localStorage.removeItem("userInfo");
      localStorage.removeItem("userRoleType");
      navigate("/login");
    }, 800);
  };

  const menuItems = [
    {
      path: "/company-dashboard/verify-graduates",
      icon: FiCheckCircle,
      label: "Graduate Verification",
      emoji: "✅",
      color: "from-green-400 to-green-600",
      hoverEffect: "hover:shadow-green-300"
    },
    {
      id: 'messages',
      icon: FiMail,
      label: "Messages",
      emoji: "✉️",
      color: "from-cyan-400 to-cyan-600",
      hoverEffect: "hover:shadow-cyan-300",
      isDropdown: true,
      submenu: [
        {
          path: "/company-dashboard/messages/inbox",
          icon: FiInbox,
          label: "Inbox"
        },
        {
          path: "/company-dashboard/messages/sent",
          icon: FiSend,
          label: "Sent Messages"
        }
      ]
    },
    {
      path: "/company-dashboard/settings",
      icon: FiSettings,
      label: "Settings",
      emoji: "⚙️",
      color: "from-gray-400 to-gray-600",
      hoverEffect: "hover:shadow-gray-300"
    }
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
                 backgroundColor: ['#ff0000', '#00ff00', '#0000ff', '#ffff00', '#ff00ff', '#00ffff', '#ff8800'][Math.floor(Math.random() * 7)],
                 left: `${Math.random() * 100}%`, top: `${Math.random() * 100}%`,
               }}
               initial={{ y: -20, opacity: 1 }}
               animate={{ y: [0, typeof window !== 'undefined' ? window.innerHeight * 0.8 : 500], x: [0, (Math.random() - 0.5) * 200], opacity: [1, 0], rotate: [0, Math.random() * 360] }}
               transition={{ duration: 1.5, ease: "linear" }}
               exit={{ opacity: 0 }}
             />
           ))}
         </div>
      )}
    </AnimatePresence>
  );

  const submenuVariants = {
    enter: {
      opacity: 1,
      height: "auto",
      transition: { duration: 0.3, ease: "easeOut" }
    },
    exit: {
      opacity: 0,
      height: 0,
      transition: { duration: 0.2, ease: "easeIn" }
    }
  };

  return (
    <div className="flex h-screen font-sans bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 overflow-hidden">
      <Confetti />

      {/* Sidebar */}
      <motion.div
        className={`relative z-20 shadow-2xl flex flex-col
          bg-gradient-to-b from-blue-600 to-blue-800 text-white`}
        initial={{ width: 256 }}
        animate={{ width: isSidebarOpen ? 256 : 80 }}
        transition={{ type: "spring", stiffness: 300, damping: 30 }}
      >
        <motion.div
          className="p-4 flex justify-between items-center border-b border-blue-700/50 relative"
          whileHover={{ scale: 1.02 }}
        >
          {isSidebarOpen && (
             <motion.div>
                <motion.span>{getTimeEmoji()}</motion.span>
                <h1 className="text-xl font-bold truncate bg-clip-text text-transparent bg-gradient-to-r from-yellow-300 to-white" title={companyName}>
                 {companyName}
                </h1>
             </motion.div>
          )}

          <div className="flex items-center">
            <motion.button
              onClick={toggleSidebar} className="p-2 rounded-full hover:bg-blue-700 focus:outline-none relative"
              whileTap={{ scale: 0.9 }} whileHover={{ scale: 1.1 }} title={isSidebarOpen ? "Collapse Sidebar" : "Expand Sidebar"}
            >
              <FiMenu className="h-5 w-5" />
              {!isSidebarOpen && (<motion.span className="absolute -right-1 -top-1 bg-red-500 text-xs rounded-full h-5 w-5 flex items-center justify-center" initial={{ scale: 0 }} animate={{ scale: 1 }} exit={{ scale: 0 }}>👋</motion.span>)}
            </motion.button>
          </div>
        </motion.div>

        <nav className="mt-4 flex-1 overflow-y-auto px-2 space-y-1">
            {menuItems.map((item, index) => {
                const isSubmenuActive = item.isDropdown && item.submenu.some(subItem => location.pathname.startsWith(subItem.path));
                const isActive = location.pathname.startsWith(item.path || item.submenu?.[0]?.path || 'impossible') || isSubmenuActive;

                if (item.isDropdown) {
                 return (
                    <div key={item.id || index}>
                        <motion.button
                           onClick={toggleMessagesSubmenu}
                           onHoverStart={() => !isSidebarOpen && setActiveHover(index)}
                           onHoverEnd={() => setActiveHover(null)}
                           className={`flex items-center justify-between w-full p-3 rounded-xl text-sm font-medium group transition-all duration-300 mb-1
                               ${isActive ? `bg-gradient-to-r ${item.color} text-white shadow-lg` : `bg-blue-700/10 text-blue-100 hover:bg-blue-700/30 ${item.hoverEffect}`}
                               ${!isSidebarOpen ? "justify-center" : ""}`}
                           title={item.label}
                        >
                             <div className="flex items-center">
                                <motion.div
                                    className={`relative ${isSidebarOpen ? "mr-3" : ""}`}
                                    animate={{ y: activeHover === index ? [0, -5, 0] : 0, rotate: activeHover === index ? [0, 10, -10, 0] : 0 }}
                                    transition={{ duration: 0.5 }}
                                >
                                   <item.icon className={`h-6 w-6 ${item.color.includes('cyan') ? 'text-cyan-300' : 'text-gray-300'}`} />
                                   {activeHover === index && !isSidebarOpen && (
                                        <motion.span className="absolute -top-2 -right-2 text-xs" initial={{ scale: 0 }} animate={{ scale: 1 }} exit={{ scale: 0 }}>{item.emoji}</motion.span>
                                   )}
                                </motion.div>
                                {isSidebarOpen && (
                                    <motion.span className="whitespace-nowrap" initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -10 }}>
                                       {item.label}
                                    </motion.span>
                                )}
                             </div>
                              {isSidebarOpen && (
                                 <motion.span animate={{ rotate: isMessagesSubmenuOpen ? 180 : 0 }}>
                                     <FiChevronDown className="h-4 w-4 transition-transform" />
                                 </motion.span>
                              )}
                        </motion.button>

                         <AnimatePresence>
                            {isSidebarOpen && isMessagesSubmenuOpen && (
                                <motion.div
                                    variants={submenuVariants}
                                    initial="exit"
                                    animate="enter"
                                    exit="exit"
                                    className="ml-6 pl-3 border-l-2 border-blue-500/30 space-y-1 mt-1 overflow-hidden"
                                >
                                    {item.submenu.map(subItem => (
                                        <Link
                                            key={subItem.path}
                                            to={subItem.path}
                                            className={`flex items-center py-2 px-3 rounded-md text-xs font-medium group transition-colors duration-200
                                                ${location.pathname === subItem.path ? 'bg-blue-500/20 text-white' : 'text-blue-200 hover:bg-blue-700/40 hover:text-white'}`}
                                        >
                                            {subItem.icon && <subItem.icon className="mr-2 h-4 w-4" />}
                                            {subItem.label}
                                        </Link>
                                    ))}
                                </motion.div>
                             )}
                         </AnimatePresence>
                    </div>
                 );
                } else {
                 return (
                    <motion.div
                        key={item.path} whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}
                        onHoverStart={() => setActiveHover(index)} onHoverEnd={() => setActiveHover(null)}
                    >
                       <Link
                        to={item.path}
                        className={`flex items-center p-3 rounded-xl text-sm font-medium group transition-all duration-300 mb-1
                          ${isActive ? `bg-gradient-to-r ${item.color} text-white shadow-lg` : `bg-blue-700/10 text-blue-100 hover:bg-blue-700/30 ${item.hoverEffect}`}
                          ${!isSidebarOpen ? "justify-center" : ""}`}
                        title={item.label}
                      >
                           <motion.div
                            className={`relative ${isSidebarOpen ? "mr-3" : ""}`}
                            animate={{ y: activeHover === index ? [0, -5, 0] : 0, rotate: activeHover === index ? [0, 10, -10, 0] : 0 }}
                            transition={{ duration: 0.5 }}
                           >
                              <item.icon className={`h-6 w-6 ${item.color?.includes('green') ? 'text-green-300' : item.color?.includes('gray') ? 'text-gray-300' : 'text-blue-300'}`} />
                              {activeHover === index && (<motion.span className="absolute -top-2 -right-2 text-xs" initial={{ scale: 0 }} animate={{ scale: 1 }} exit={{ scale: 0 }}>{item.emoji}</motion.span>)}
                           </motion.div>
                           {isSidebarOpen && (
                               <motion.span className="whitespace-nowrap" initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -10 }}>
                                  {item.label}
                               </motion.span>
                           )}
                        </Link>
                    </motion.div>
                 );
                }
            })}
        </nav>

        <motion.div className="mt-auto p-3 border-t border-blue-700/50" whileHover={{ scale: 1.01 }}>
            <motion.button onClick={handleLogout}
             className={`flex items-center w-full py-3 rounded-xl text-sm font-medium bg-gradient-to-r from-red-500 to-pink-600 text-white shadow-md hover:shadow-lg hover:shadow-red-300/50 ${!isSidebarOpen ? "px-3 justify-center" : "px-4"}`}
             whileHover={{ scale: 1.05, transition: { yoyo: Infinity, duration: 0.4 } }} whileTap={{ scale: 0.95 }} title="Logout"
            >
                <FiLogOut className={`h-5 w-5 ${isSidebarOpen ? "mr-2" : ""}`} />
                {isSidebarOpen && "Logout"}
            </motion.button>
        </motion.div>
      </motion.div>

      <div className="flex-1 flex flex-col overflow-hidden relative">
        <motion.main
          className="flex-1 p-6 md:p-8 lg:p-10 overflow-y-auto relative z-10"
          initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.2 }}
        >
          <Outlet />
        </motion.main>
      </div>
    </div>
  );
};

export default CompanyDashboard;