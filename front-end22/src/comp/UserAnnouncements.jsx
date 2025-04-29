// frontend/src/comp/UserAnnouncements.js
import React, { useState, useEffect } from 'react';
import { FiAlertTriangle, FiRefreshCw } from 'react-icons/fi';
import axios from 'axios'; // <-- Import Axios

// Define API URL (Adjust port if necessary)
const API_URL = 'http://localhost:5001/api/announcements';

const UserAnnouncements = () => {
  const [announcements, setAnnouncements] = useState([]);
  const [selectedAnnouncement, setSelectedAnnouncement] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  // Function to fetch and update announcements state using API
  const fetchAndSetAnnouncements = async () => { // Make async
    console.log("UserAnnouncements: Fetching from API...");
    setIsLoading(true);
    setError('');
    try {
      // Use axios GET request
      const { data } = await axios.get(API_URL); // GET is usually public, no config needed

      // Backend already sorts, but we can ensure date conversion if needed
      const sortedAnnouncements = data.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)); // Use createdAt from backend

      setAnnouncements(sortedAnnouncements);
      console.log("UserAnnouncements: Loaded", sortedAnnouncements.length, "items from API.");

      // Reselect or select first item
      if (sortedAnnouncements.length > 0) {
        // Use '_id' from MongoDB
        const previouslySelectedExists = sortedAnnouncements.find(a => a._id === selectedAnnouncement?._id);
        setSelectedAnnouncement(previouslySelectedExists || sortedAnnouncements[0]);
      } else {
        setSelectedAnnouncement(null);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load announcements.');
      console.error("API Fetch error:", err.response || err);
    } finally {
      setIsLoading(false);
    }
  };

  // Initial fetch on component mount
  useEffect(() => {
    fetchAndSetAnnouncements();
  }, []); // Run only once on mount

  // --- REMOVED Custom Event Listener ---
  // Data updates will happen on component mount/refresh

  // Handler to update the selected announcement
  const handleSelectAnnouncement = (announcement) => {
    setSelectedAnnouncement(announcement);
  };


  // --- JSX (Mostly Unchanged, uses _id and createdAt) ---
  return (
    <div className="flex flex-col md:flex-row gap-4 md:gap-6 h-full max-h-[calc(100vh-10rem)]">

      {/* Left Side: Announcement Detail */}
      <div className="flex-1 bg-white rounded-lg shadow p-4 sm:p-6 overflow-y-auto order-2 md:order-1 border border-gray-200">
        {isLoading && !selectedAnnouncement ? (
          <div className="flex justify-center items-center h-full text-gray-500">
             <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-blue-500 mr-3"></div>
             Loading Announcement...
          </div>
        ) : error ? (
          <div className="text-center text-red-600 p-4 flex items-center justify-center h-full">
              <FiAlertTriangle className="h-6 w-6 mr-2"/> {error}
          </div>
        ) : selectedAnnouncement ? (
          <article>
            <header>
                <h2 className="text-xl sm:text-2xl font-bold text-gray-800 mb-2 flex items-center">
                {selectedAnnouncement.title}
                {selectedAnnouncement.isImportant && (
                    <FiAlertTriangle className="ml-2 text-yellow-500 flex-shrink-0 h-5 w-5" title="Important" />
                )}
                </h2>
                <p className="text-xs sm:text-sm text-gray-500 mb-4 border-b pb-2">
                {/* Use createdAt from backend */}
                Posted by <span className="font-medium">{selectedAnnouncement.author}</span> on {new Date(selectedAnnouncement.createdAt).toLocaleDateString()}
                </p>
            </header>
            <div className="prose prose-sm sm:prose-base max-w-none text-gray-700 whitespace-pre-line leading-relaxed">
              {selectedAnnouncement.content}
            </div>
          </article>
        ) : (
           !isLoading && announcements.length > 0 && <div className="flex justify-center items-center h-full text-center text-gray-500 p-4">Please select an announcement from the list on the right to view its details.</div>
        )}
        { !isLoading && !error && announcements.length === 0 && <div className="flex justify-center items-center h-full text-center text-gray-500 p-4">No announcements are available at this time.</div>}
      </div>

      {/* Right Side: Announcement List */}
      <div className="w-full md:w-64 lg:w-72 flex-shrink-0 bg-white rounded-lg shadow overflow-y-auto order-1 md:order-2 border border-gray-200 flex flex-col">
        <div className="flex justify-between items-center p-3 sm:p-4 border-b sticky top-0 bg-gray-50 z-10 flex-shrink-0">
            <h3 className="text-base sm:text-lg font-semibold text-gray-700">
                Announcements
            </h3>
             {/* Manual Refresh Button */}
             <button
                onClick={fetchAndSetAnnouncements} // Re-fetch data
                disabled={isLoading}
                className="p-1 text-gray-500 hover:text-blue-600 disabled:opacity-50 disabled:cursor-wait"
                title="Refresh List"
             >
                <FiRefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
             </button>
        </div>
        <div className="flex-1 overflow-y-auto">
            {isLoading ? (
            <div className="p-4 text-gray-500 text-center">Loading...</div>
            ) : error ? (
            <div className="p-4 text-red-500 text-center text-sm">Error loading list.</div>
            ) : announcements.length === 0 ? (
                <div className="p-4 text-gray-500 text-sm text-center">No announcements found.</div>
            ): (
            <ul className="divide-y divide-gray-100">
                {/* Use _id from backend as key */}
                {announcements.map((ann) => (
                <li key={ann._id}>
                    <button
                    onClick={() => handleSelectAnnouncement(ann)}
                    className={`w-full text-left p-3 sm:p-4 hover:bg-gray-100 focus:outline-none focus:bg-blue-50 transition duration-150 ease-in-out ${
                        // Use _id for comparison
                        selectedAnnouncement?._id === ann._id ? 'bg-blue-50 border-l-4 border-blue-500 pl-2 sm:pl-3' : 'border-l-4 border-transparent'
                    }`}
                    aria-current={selectedAnnouncement?._id === ann._id ? 'page' : undefined}
                    >
                    <h4 className={`text-sm font-medium mb-1 truncate flex items-center ${selectedAnnouncement?._id === ann._id ? 'text-blue-700' : 'text-gray-800'}`}>
                        {ann.isImportant && (
                            <FiAlertTriangle className="mr-1.5 text-yellow-500 flex-shrink-0 h-3.5 w-3.5" title="Important"/>
                        )}
                        {ann.title}
                    </h4>
                     {/* Use createdAt from backend */}
                    <p className="text-xs text-gray-500">{new Date(ann.createdAt).toLocaleDateString()}</p>
                    </button>
                </li>
                ))}
            </ul>
            )}
        </div>
      </div>
    </div>
  );
};

export default UserAnnouncements;