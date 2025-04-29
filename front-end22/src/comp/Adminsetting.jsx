import React, { useState, useEffect, useCallback } from "react";
import { FiUser, FiCamera, FiSave } from "react-icons/fi";

const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:8000";

const SettingsPage = () => {
  const [profileImage, setProfileImage] = useState(null);
  const [userData, setUserData] = useState({
    _id: "1", // Hardcoded ID since no auth
    name: "Admin User",
    email: "admin@example.com",
    role: "Administrator"
  });
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState(null);
  const [successMessage, setSuccessMessage] = useState(null);

  // Mock data fetch - no authentication needed
  const fetchSettings = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    setSuccessMessage(null);

    try {
      // Simulate API call with timeout
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // Return mock data
      setUserData({
        _id: "1",
        name: "Admin User",
        email: "admin@example.com",
        role: "Administrator"
      });
      setProfileImage(null);
    } catch (err) {
      console.error("Failed to fetch settings:", err);
      setError("Could not load settings.");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchSettings();
  }, [fetchSettings]);

  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setError(null);
    setSuccessMessage(null);

    if (!file.type.startsWith('image/')) {
      alert('Please select an image file (JPG, PNG, GIF, etc.).');
      e.target.value = null; 
      return;
    }
    if (file.size > 2 * 1024 * 1024) {
      alert('Please select an image smaller than 2MB.');
      e.target.value = null; 
      return;
    }

    setIsUploading(true);
    try {
      // Simulate upload with timeout
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const reader = new FileReader();
      reader.onload = (event) => {
        setProfileImage(event.target.result);
        setSuccessMessage('Profile image updated successfully!');
      };
      reader.readAsDataURL(file);
    } catch (err) {
      console.error("Failed to upload image:", err);
      setError('Image upload failed.');
    } finally {
      setIsUploading(false);
      e.target.value = null;
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setUserData(prev => ({ ...prev, [name]: value }));
    setError(null);
    setSuccessMessage(null);
  };

  const handleSave = async () => {
    setError(null);
    setSuccessMessage(null);

    if (!userData.name.trim() || !userData.email.trim()) {
      setError("Name and Email cannot be empty."); 
      return;
    }
    if (!/\S+@\S+\.\S+/.test(userData.email)) {
      setError("Please enter a valid email address."); 
      return;
    }

    setIsSaving(true);
    try {
      // Simulate save with timeout
      await new Promise(resolve => setTimeout(resolve, 800));
      
      setSuccessMessage('Settings saved successfully!');
    } catch (err) {
      console.error("Failed to save settings:", err);
      setError('Failed to save settings.');
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading && !userData._id) {
    return <div className="text-center p-10">Loading settings...</div>;
  }

  return (
    <div className="space-y-6 p-4 md:p-6">
      <h2 className="text-2xl font-bold text-gray-800">Profile Settings</h2>

      {error && (
        <div className="bg-red-100 border-l-4 border-red-500 text-red-700 px-4 py-3 rounded relative" role="alert">
          <strong className="font-bold">Error: </strong>
          <span className="block sm:inline">{error}</span>
        </div>
      )}

      {successMessage && (
        <div className="bg-green-100 border-l-4 border-green-500 text-green-700 px-4 py-3 rounded relative" role="alert">
          <strong className="font-bold">Success: </strong>
          <span className="block sm:inline">{successMessage}</span>
        </div>
      )}

      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-semibold text-gray-700 mb-4">Profile Picture</h3>
        <div className="flex items-center space-x-6">
          <div className="relative flex-shrink-0">
            {profileImage ? (
              <img
                src={profileImage}
                alt="Profile"
                className="h-24 w-24 rounded-full object-cover border-2 border-blue-200 shadow-sm"
              />
            ) : (
              <div className="h-24 w-24 rounded-full bg-blue-100 flex items-center justify-center border-2 border-blue-200">
                <FiUser className="h-12 w-12 text-blue-500" />
              </div>
            )}
            <label
              htmlFor="profile-upload"
              className={`absolute bottom-0 right-0 bg-blue-600 text-white p-2 rounded-full cursor-pointer hover:bg-blue-700 transition-colors duration-200 ${isUploading ? 'opacity-50 cursor-not-allowed' : ''}`}
              title="Upload new picture"
            >
              {isUploading ? (
                <svg className="animate-spin h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
              ) : (
                <FiCamera className="h-4 w-4" />
              )}
              <input
                id="profile-upload"
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleImageUpload}
                disabled={isUploading}
              />
            </label>
          </div>
          <div className="text-sm">
            <p className="text-gray-600 mb-1">Upload a new profile picture.</p>
            <p className="text-xs text-gray-400">JPG, PNG, GIF. Max size 2MB.</p>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-semibold text-gray-700 mb-4">Personal Information</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label htmlFor="nameInput" className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
            <input
              id="nameInput"
              type="text"
              name="name"
              value={userData.name}
              onChange={handleInputChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition duration-150 ease-in-out"
              disabled={isSaving}
              placeholder="Enter your full name"
            />
          </div>
          <div>
            <label htmlFor="emailInput" className="block text-sm font-medium text-gray-700 mb-1">Email Address</label>
            <input
              id="emailInput"
              type="email"
              name="email"
              value={userData.email}
              onChange={handleInputChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition duration-150 ease-in-out"
              disabled={isSaving}
              placeholder="Enter your email address"
            />
          </div>
          <div>
            <label htmlFor="roleInput" className="block text-sm font-medium text-gray-700 mb-1">Role</label>
            <input
              id="roleInput"
              type="text"
              name="role"
              value={userData.role}
              className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-100 cursor-not-allowed text-gray-600"
              disabled
              readOnly
            />
          </div>
        </div>
      </div>

      <div className="flex justify-end pt-4">
        <button
          onClick={handleSave}
          disabled={isSaving || isUploading}
          className={`flex items-center justify-center px-6 py-2 bg-blue-600 text-white font-semibold rounded-md shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition duration-150 ease-in-out`}
        >
          {isSaving ? (
            <>
              <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Saving...
            </>
          ) : (
            <>
              <FiSave className="mr-2 h-5 w-5" />
              Save Changes
            </>
          )}
        </button>
      </div>
    </div>
  );
};

export default SettingsPage;