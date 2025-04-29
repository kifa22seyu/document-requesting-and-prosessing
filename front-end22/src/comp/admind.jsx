import React, { useState, useEffect, useCallback } from "react";
import { Link, Outlet, useLocation, useNavigate } from "react-router-dom";
import {
    FiMenu, FiCheckCircle, FiLogOut, FiBell, FiUser, FiHome,
    FiSettings, FiUsers, FiMail, FiFileText, FiX, // Added FiX for close button
    FiUserPlus, FiMessageSquare,
    FiClipboard // Added for Requests link
} from "react-icons/fi";
import { motion, AnimatePresence } from "framer-motion";

const RegistrarAdmin = () => {
    // --- STATE ---
    const [isSidebarOpen, setIsSidebarOpen] = useState(true);
    const [notifications, setNotifications] = useState([]); // TODO: Replace with API fetch
    const [unreadCount, setUnreadCount] = useState(0); // TODO: Update based on fetched notifications
    const [showNotifications, setShowNotifications] = useState(false);
    const [profileImage, setProfileImage] = useState(null); // TODO: Replace with fetched data or default
    const [isCelebrating, setIsCelebrating] = useState(false); // For confetti
    const [activeHover, setActiveHover] = useState(null);
    const defaultUserData = {
        name: "Registrar Admin",
        email: "registrar@university.edu",
        role: "Registrar Administrator"
    };
    const [userData, setUserData] = useState(defaultUserData); // TODO: Replace with fetched user data

    // --- HOOKS ---
    const navigate = useNavigate();
    const location = useLocation();

    // --- FUNCTIONS ---
    const getPageTitle = useCallback((pathname) => {
        const titles = {
            "/registraradmin": "Dashboard",
            "/registraradmin/requests": "Alumni Requests",
            "/registraradmin/users": "Manage Users",
            "/registraradmin/admins": "Manage Admins",
            "/registraradmin/announcements": "Announcements",
            "/registraradmin/messages": "Messages", // Base title for messages section
            "/registraradmin/messages/inbox": "Inbox",
            "/registraradmin/messages/chat": "Chat",
            "/registraradmin/settings": "Settings"
        };
        // Find the most specific matching path
        const matchingPath = Object.keys(titles)
            .filter(key => pathname.startsWith(key))
            .sort((a, b) => b.length - a.length)[0];

        return titles[matchingPath] || "Registrar Admin";
    }, []);

    // Confetti component
    const Confetti = () => (
        <AnimatePresence>
            {isCelebrating && (
                <div className="fixed inset-0 pointer-events-none z-[9999] overflow-hidden"> {/* High z-index */}
                    {[...Array(60)].map((_, i) => ( // Increased count
                        <motion.div
                            key={i}
                            className="absolute w-2 h-3 rounded-full" // Slightly rectangular
                            style={{
                                backgroundColor: ['#3B82F6', '#10B981', '#EF4444', '#F59E0B', '#8B5CF6', '#EC4899', '#ffffff'][Math.floor(Math.random() * 7)], // Theme colors + white
                                left: `${Math.random() * 100}%`,
                                top: `${Math.random() * -20}%`, // Start above screen
                            }}
                            initial={{ y: -20, opacity: 1, rotate: Math.random() * 360 }}
                            animate={{
                                y: window.innerHeight * 1.1, // Fall past bottom
                                x: [0, (Math.random() - 0.5) * 300, (Math.random() - 0.5) * 150], // Wider x drift
                                opacity: [1, 1, 0],
                                rotate: [0, Math.random() * 720 - 360], // More rotation
                                scale: [1, 0.8, 1.2, 0.7], // Add scale variation
                            }}
                            transition={{
                                duration: Math.random() * 2 + 1.5, // Variable duration
                                ease: "linear", // Consistent fall speed
                                delay: Math.random() * 0.5 // Stagger start times
                            }}
                            exit={{ opacity: 0 }}
                        />
                    ))}
                </div>
            )}
        </AnimatePresence>
    );

    // --- EFFECTS ---
    useEffect(() => {
        // TODO: Fetch real notifications from API
        const mockNotificationsData = [
            { id: 1, text: "New graduation verification request", time: "5m ago", read: false, type: "request" },
            { id: 2, text: "Academic record request needs review", time: "1h ago", read: true, type: "request" },
            { id: 3, text: "Server maintenance scheduled for tonight.", time: "3h ago", read: false, type: "system" },
        ];
        setNotifications(mockNotificationsData);
        setUnreadCount(mockNotificationsData.filter(n => !n.read).length);

        // Load profile image from local storage (good fallback)
        const savedImage = localStorage.getItem('profileImage');
        if (savedImage) setProfileImage(savedImage);

        // TODO: Fetch real user data from API (e.g., /api/admin/me) using stored token
        const savedUserDataString = localStorage.getItem('userData'); // Could be set after login
        if (savedUserDataString) {
            try {
                const savedUserData = JSON.parse(savedUserDataString);
                setUserData(savedUserData);
            } catch (error) {
                console.error("Error parsing saved user data:", error);
                localStorage.removeItem('userData'); // Clear corrupted data
                setUserData(defaultUserData);
            }
        } else {
            setUserData(defaultUserData);
        }
    }, []);

    // --- HANDLERS ---
    const toggleSidebar = () => {
        setIsSidebarOpen(!isSidebarOpen);
    };

    const handleLogout = () => {
        setIsCelebrating(true); // Trigger confetti on logout
        setTimeout(() => {
            // Clear auth token and any related user data
            localStorage.removeItem('adminToken');
            localStorage.removeItem('userData');
            localStorage.removeItem('profileImage');
            // Reset state
            setUserData(defaultUserData);
            setProfileImage(null);
            // Redirect to login page
            navigate("/admin/login"); // Adjust if your admin login path is different
        }, 800);
    };

    // TODO: Integrate with API to mark notifications as read
    const markAsRead = (id) => {
        // Simulating API call success
        setNotifications(prevNotifications => {
            const updatedNotifications = prevNotifications.map(n =>
                n.id === id ? { ...n, read: true } : n
            );
            setUnreadCount(updatedNotifications.filter(n => !n.read).length);
            return updatedNotifications;
        });
        // Optimistically remove if you want instant feedback, or wait for API confirmation
    };

    // TODO: Integrate with API to mark all as read
    const markAllAsRead = () => {
        // Simulating API call success
        setNotifications(prevNotifications =>
            prevNotifications.map(n => ({ ...n, read: true }))
        );
        setUnreadCount(0);
    };

    // Context functions for child components (passed via Outlet)
    const updateUserData = (newUserData) => {
        const updatedData = { ...userData, ...newUserData };
        setUserData(updatedData);
        localStorage.setItem('userData', JSON.stringify(updatedData));
    };

    const handleImageUpload = (imageDataUrl) => {
        setProfileImage(imageDataUrl);
        localStorage.setItem('profileImage', imageDataUrl);
    };

    // --- DATA ---
    // TODO: Fetch real counts for the 'value' fields from API
    const stats = [
        { title: "Total Users", value: "1,500+", icon: FiUsers, color: "blue", path: "/registraradmin/users" },
        { title: "Pending Requests", value: "12+", icon: FiClipboard, color: "orange", path: "/registraradmin/requests" }, // Linked correctly
        { title: "Unread Notifications", value: unreadCount > 0 ? unreadCount.toString() : "0", icon: FiBell, color: "red", path: "#" }, // Dynamic count
        { title: "Settings", value: "Configure", icon: FiSettings, color: "purple", path: "/registraradmin/settings" },
    ];

    const menuItems = [
        { path: "/registraradmin", icon: FiHome, label: "Dashboard", emoji: "🏠" },
        { path: "/registraradmin/requests", icon: FiClipboard, label: "Alumni Requests", emoji: "📋" },
        { path: "/registraradmin/users", icon: FiUsers, label: "Users", emoji: "👥" },
        { path: "/registraradmin/admins", icon: FiUserPlus, label: "Admins", emoji: "👔" },
        { path: "/registraradmin/announcements", icon: FiMail, label: "Announcements", emoji: "📢" },
        { path: "/registraradmin/messages", icon: FiMessageSquare, label: "Messages", emoji: "💬" },
        { path: "/registraradmin/settings", icon: FiSettings, label: "Settings", emoji: "⚙️" }
    ];

    const getNavLinkClass = (path) => {
        const isActive = path === "/registraradmin"
            ? location.pathname === path
            : location.pathname.startsWith(path);

        return `
            flex items-center py-2.5 rounded-md text-sm font-medium group
            transition-all duration-300 ease-in-out focus:outline-none focus:ring-2 focus:ring-blue-400 focus:ring-opacity-50
            ${isActive ? 'bg-blue-900 text-white shadow-inner' : 'text-blue-100 hover:bg-blue-700 hover:text-white'}
            ${!isSidebarOpen ? 'px-3 justify-center' : 'px-3'}
        `;
    };

    // --- JSX ---
    return (
        <div className="flex h-screen font-sans bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 overflow-hidden">
            <Confetti />

            {/* Animated Sidebar */}
            <motion.aside
                className="relative z-30 shadow-2xl flex flex-col bg-gradient-to-b from-blue-800 to-blue-900 text-white"
                initial={false} // Don't animate initial width
                animate={{ width: isSidebarOpen ? 256 : 80 }}
                transition={{ type: "spring", stiffness: 300, damping: 30 }}
            >
                {/* Sidebar Header */}
                <motion.div className="p-4 flex items-center justify-between border-b border-blue-700/50 h-16 sticky top-0 bg-blue-800 z-10 flex-shrink-0">
                    {isSidebarOpen && (
                        <motion.h1
                            className="text-xl font-bold truncate tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-yellow-300 to-white"
                            initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} transition={{ duration: 0.2 }}
                            title="Registrar Admin Dashboard"
                        > Registrar Admin </motion.h1>
                    )}
                    <motion.button onClick={toggleSidebar} aria-label={isSidebarOpen ? "Collapse sidebar" : "Expand sidebar"} className="..." whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}>
                        <FiMenu className="h-5 w-5" />
                    </motion.button>
                </motion.div>

                {/* User Profile */}
                <motion.div className={`p-4 flex items-center border-b border-blue-700/50 min-h-[73px] flex-shrink-0 ${!isSidebarOpen ? 'justify-center' : ''}`}>
                    <motion.div className="relative flex-shrink-0" whileHover={{ rotate: 5 }} whileTap={{ scale: 0.95 }}>
                        <Link to="/registraradmin/settings" title="Go to Settings">
                            {profileImage ? ( <motion.img src={profileImage} alt="Admin profile picture" className="..." whileHover={{ scale: 1.1 }} /> )
                            : ( <div className="..."> <FiUser className="h-5 w-5" /> </div> )}
                            <motion.span className="absolute bottom-0 right-0 ..." title="Online" animate={{ scale: [1, 1.2, 1], opacity: [0.8, 1, 0.8] }} transition={{ duration: 2, repeat: Infinity }} />
                        </Link>
                    </motion.div>
                    {isSidebarOpen && (
                        <motion.div className="ml-3 overflow-hidden" initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -10, transition: { duration: 0.1 } }}>
                            <p className="font-semibold text-sm truncate" title={userData.name}>{userData.name}</p>
                            <p className="text-xs text-blue-200 truncate" title={userData.role}>{userData.role}</p>
                        </motion.div>
                    )}
                </motion.div>

                {/* Navigation */}
                <nav className="flex-1 overflow-y-auto px-2 py-3 space-y-1 scrollbar-thin scrollbar-thumb-blue-700 scrollbar-track-blue-800/50">
                    {menuItems.map((item, index) => (
                        <motion.div key={item.path} whileHover={{ scale: isSidebarOpen ? 1.03 : 1.1 }} whileTap={{ scale: 0.97 }} onHoverStart={() => setActiveHover(index)} onHoverEnd={() => setActiveHover(null)} title={isSidebarOpen ? "" : item.label} >
                            <Link to={item.path} className={getNavLinkClass(item.path)} >
                                <motion.div className={`relative flex-shrink-0 ${isSidebarOpen ? "mr-3" : ""}`} animate={{ y: activeHover === index ? [0, -5, 0] : 0, rotate: activeHover === index ? [0, 10, -10, 0] : 0 }} >
                                    <item.icon className="h-5 w-5 text-blue-300 group-hover:text-white transition-colors" />
                                    {isSidebarOpen && activeHover === index && ( <motion.span className="absolute -top-2 -right-2 text-xs" initial={{ scale: 0 }} animate={{ scale: 1 }} exit={{ scale: 0 }} > {item.emoji} </motion.span> )}
                                </motion.div>
                                {isSidebarOpen && ( <motion.span className="whitespace-nowrap" initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -10, transition: { duration: 0.1 } }} > {item.label} </motion.span> )}
                            </Link>
                        </motion.div>
                    ))}
                </nav>

                {/* Logout Button */}
                <motion.div className="mt-auto p-3 border-t border-blue-700/50 flex-shrink-0">
                    <motion.button onClick={handleLogout} aria-label="Logout" title={isSidebarOpen ? "Logout" : ""} className={`... ${!isSidebarOpen ? "px-3 justify-center" : "px-3"}`} whileHover={{ scale: 1.05, transition: { yoyo: Infinity, duration: 0.4 } }} whileTap={{ scale: 0.95 }} >
                        <FiLogOut className={`h-5 w-5 ${isSidebarOpen ? "mr-2" : ""}`} /> {isSidebarOpen && "Logout"}
                    </motion.button>
                </motion.div>
            </motion.aside>

            {/* Main Content Area */}
            <div className="flex-1 flex flex-col overflow-hidden relative">
                {/* Floating background elements */}
                <div className="absolute inset-0 overflow-hidden pointer-events-none -z-10">
                     {[...Array(10)].map((_, i) => ( // Reduced count for performance
                        <motion.div key={i} className="absolute rounded-full opacity-[0.07]" style={{ width: Math.random() * 150 + 50, height: Math.random() * 150 + 50, left: `${Math.random() * 100}%`, top: `${Math.random() * 100}%`, backgroundColor: ['#3B82F6', '#10B981', '#EF4444', '#F59E0B', '#8B5CF6'][Math.floor(Math.random() * 5)], }} animate={{ y: [0, Math.random() * 50 - 25, 0], x: [0, Math.random() * 50 - 25, 0], rotate: [0, Math.random() * 180 - 90], scale: [1, 1.05, 1] }} transition={{ duration: Math.random() * 20 + 15, repeat: Infinity, repeatType: "mirror", ease: "easeInOut", }} />
                     ))}
                </div>

                {/* Top Bar */}
                <motion.header className="..." initial={{ y: -20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ duration: 0.3 }}>
                    <motion.h2 className="..." key={location.pathname} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.2, delay: 0.1 }} > {getPageTitle(location.pathname)} </motion.h2>
                    <div className="flex items-center space-x-3 md:space-x-4">
                        {/* Notification Bell */}
                        <motion.div className="relative" whileHover={{ scale: 1.1 }}>
                            <button onClick={() => setShowNotifications(!showNotifications)} aria-label={`Notifications (${unreadCount} unread)`} className="..." >
                                <FiBell className="h-5 w-5" />
                                {unreadCount > 0 && ( <motion.span className="..." > <span className="absolute ... animate-ping"></span> <span className="relative ... bg-red-500"></span> </motion.span> )}
                            </button>
                            {/* Notification Dropdown */}
                            <AnimatePresence> {showNotifications && ( <motion.div className="..." initial={{ opacity: 0, y: -10, scale: 0.95 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: -10, scale: 0.95 }} transition={{ duration: 0.15 }} >
                                <div className="p-2 border-b ..."> {/* Header */} </div>
                                <div className="py-1 max-h-64 overflow-y-auto scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100"> {/* Content */} </div>
                                <div className="p-2 border-t ..."> {/* Footer */} </div>
                            </motion.div> )} </AnimatePresence>
                        </motion.div>
                        {/* Profile Link/Icon */}
                         <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }} >
                             <Link to="/registraradmin/settings" className="block p-1.5 ..." title="Settings" >
                                 {profileImage ? ( <motion.img src={profileImage} alt="Admin profile" className="..." whileHover={{ rotate: 10 }} /> )
                                  : ( <motion.div className="..." whileHover={{ rotate: 10 }} > <FiUser className="h-4 w-4" /> </motion.div> )}
                             </Link>
                         </motion.div>
                    </div>
                </motion.header>

                {/* Main Content Area with Outlet */}
                <motion.main
                    className="flex-1 overflow-y-auto p-4 md:p-6 lg:p-8 scrollbar-thin scrollbar-thumb-gray-400 scrollbar-track-gray-100" // Added scrollbar styling
                    key={location.pathname} // Trigger animation on route change
                    initial={{ opacity: 0, y: 15 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3, ease: "easeInOut" }}
                >
                    {/* Renders the matched nested route component */}
                    <Outlet context={{ userData, updateUserData, profileImage, handleImageUpload }} />
                </motion.main>

            </div> {/* End Main Content Area Flex Container */}
        </div> // End Top Level Flex Container
    );
};

export default RegistrarAdmin;