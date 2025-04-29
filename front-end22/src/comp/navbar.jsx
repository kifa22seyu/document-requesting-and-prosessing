import { Link } from "react-router-dom";
import { useState } from "react";
import { GiHamburgerMenu } from "react-icons/gi";
import { AiOutlineClose } from "react-icons/ai";

const HomeIcon = () => (
  <svg width="32" height="32" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg" className="h-7 w-7 text-gray-300 hover:text-blue-200 transition-colors duration-200 ease-in-out">
    <path d="M16 2L3 11.5V26.6667H29L16 2Z" fill="url(#homeGradient)" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    <path d="M9.33333 26.6667V16H22.6667V26.6667" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    <defs>
      <linearGradient id="homeGradient" x1="0" y1="0" x2="32" y2="32" gradientUnits="userSpaceOnUse">
        <stop stopColor="#A0AEC0" />
        <stop offset="1" stopColor="#4A5568" />
      </linearGradient>
    </defs>
  </svg>
);

const AboutIcon = () => (
  <svg width="32" height="32" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg" className="h-7 w-7 text-gray-300 hover:text-blue-200 transition-colors duration-200 ease-in-out">
    <path d="M16 4C9.37258 4 4 9.37258 4 16C4 22.6274 9.37258 28 16 28C22.6274 28 28 22.6274 28 16C28 9.37258 22.6274 4 16 4ZM16 9.33333C13.2091 9.33333 11 11.5425 11 14.3333C11 17.1242 13.2091 19.3333 16 19.3333C18.7909 19.3333 21 17.1242 21 14.3333C21 11.5425 18.7909 9.33333 16 9.33333Z" fill="url(#aboutGradient)" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    <path d="M16 19.3333V22" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    <defs>
      <linearGradient id="aboutGradient" x1="0" y1="0" x2="32" y2="32" gradientUnits="userSpaceOnUse">
        <stop stopColor="#667EEA" />
        <stop offset="1" stopColor="#7439DB" />
      </linearGradient>
    </defs>
  </svg>
);

const ContactIcon = () => (
  <svg width="32" height="32" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg" className="h-7 w-7 text-gray-300 hover:text-blue-200 transition-colors duration-200 ease-in-out">
    <path d="M4 4H28C29.1046 4 30 4.89543 30 6V24C30 25.1046 29.1046 26 28 26H4C2.89543 26 2 25.1046 2 24V6C2 4.89543 2.89543 4 4 4Z" fill="url(#contactGradient)" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    <path d="M30 6L16 15L2 6" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    <path d="M20 20H12" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    <defs>
      <linearGradient id="contactGradient" x1="0" y1="0" x2="32" y2="32" gradientUnits="userSpaceOnUse">
        <stop stopColor="#4CAF50" />
        <stop offset="1" stopColor="#2E7D32" />
      </linearGradient>
    </defs>
  </svg>
);

const AnnouncementIcon = () => (
  <svg width="32" height="32" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg" className="h-7 w-7 text-gray-300 hover:text-blue-200 transition-colors duration-200 ease-in-out">
    <path d="M16 4C9.37258 4 4 9.37258 4 16C4 22.6274 9.37258 28 16 28C22.6274 28 28 22.6274 28 16C28 9.37258 22.6274 4 16 4Z" fill="url(#announcementGradient)" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    <path d="M16 10V16" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    <path d="M16 20H16.0133" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    <defs>
      <linearGradient id="announcementGradient" x1="0" y1="0" x2="32" y2="32" gradientUnits="userSpaceOnUse">
        <stop stopColor="#F6AD55" />
        <stop offset="1" stopColor="#DD6B20" />
      </linearGradient>
    </defs>
  </svg>
);

const Navbar = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const toggleMenu = () => setIsMenuOpen(!isMenuOpen);

  return (
    <nav className="flex items-center justify-between flex-wrap bg-gradient-to-r from-blue-900 to-blue-700 px-6 py-4 h-[90px] shadow-lg">
      <div className="flex items-center flex-shrink-0 text-white">
        <img
          src="src/image/AMU.jpg"
          alt="AMU Logo"
          className="h-[60px] w-[60px] rounded-full object-cover border-2 border-white shadow-md hover:scale-110 transition-transform duration-300 ease-in-out mt-1 mb-1"
        />

        <div className="flex items-center ml-4">
          <div className="h-12 w-[4px] bg-white mr-4"></div>
          <div className="flex flex-col items-start">
            <span className="font-bold text-white text-xl font-sans">Arba Minch University</span>
            <span className="font-bold text-yellow-400 text-lg font-sans">Arba Minch</span>
          </div>
        </div>
      </div>

      <div className="block lg:hidden">
        <button
          className="flex items-center px-3 py-2 text-white hover:text-blue-400 focus:outline-none transition-transform duration-300 ease-in-out hover:scale-110"
          onClick={toggleMenu}
        >
          {isMenuOpen ? (
            <AiOutlineClose className="h-6 w-6" />
          ) : (
            <GiHamburgerMenu className="h-6 w-6" />
          )}
        </button>
      </div>

      <div
        className={`lg:hidden w-full bg-blue-800 transition-all duration-300 ease-in-out overflow-hidden ${isMenuOpen ? "max-h-96" : "max-h-0"
          }`}
      >
        <div className="flex flex-col p-4">
          <Link to="/" className="text-white hover:bg-blue-700 hover:scale-105 px-4 py-2 rounded transition-all duration-300 ease-in-out flex items-center">
            <HomeIcon />
            <span className="ml-1">Home</span>
          </Link>
          <Link to="/about" className="text-white hover:bg-blue-700 hover:scale-105 px-4 py-2 rounded transition-all duration-300 ease-in-out flex items-center">
            <AboutIcon />
            <span className="ml-1">About Us</span>
          </Link>
          <Link to="/contact" className="text-white hover:bg-blue-700 hover:scale-105 px-4 py-2 rounded transition-all duration-300 ease-in-out flex items-center">
            <ContactIcon />
            <span className="ml-1">Contact Us</span>
          </Link>
          <Link to="/announcements" className="text-white hover:bg-blue-700 hover:scale-105 px-4 py-2 rounded transition-all duration-300 ease-in-out flex items-center">
            <AnnouncementIcon />
            <span className="ml-1">Announcements</span>
          </Link>
        </div>
      </div>

      <div className="hidden lg:flex lg:items-center lg:w-auto justify-end">
        <div className="flex items-center space-x-6 lg:space-x-10">
          <Link to="/" className="text-white hover:text-blue-400 hover:scale-110 transition-transform duration-300 ease-in-out flex items-center">
            <HomeIcon />
            <span className="ml-1">Home</span>
          </Link>
          <Link to="/about" className="text-white hover:text-blue-400 hover:scale-110 transition-transform duration-300 ease-in-out flex items-center">
            <AboutIcon />
            <span className="ml-1">About Us</span>
          </Link>
          <Link to="/contact" className="text-white hover:text-blue-400 hover:scale-110 transition-transform duration-300 ease-in-out flex items-center">
            <ContactIcon />
            <span className="ml-1">Contact Us</span>
          </Link>
          <Link to="/announcements" className="text-white hover:text-blue-400 hover:scale-110 transition-transform duration-300 ease-in-out flex items-center">
            <AnnouncementIcon />
            <span className="ml-1">Announcements</span>
          </Link>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;