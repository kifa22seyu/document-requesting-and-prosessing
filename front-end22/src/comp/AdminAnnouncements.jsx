import React, { useState, useEffect, useCallback } from 'react';
import { FiPlus, FiSave } from 'react-icons/fi';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

const AdminAnnouncements = () => {
  const { id: editingIdParam } = useParams();
  const navigate = useNavigate();
  
  // State Management
  const [formData, setFormData] = useState({ 
    title: '', 
    content: '', 
    isImportant: false 
  });
  const [isLoading, setIsLoading] = useState(false);
  const [isFetching, setIsFetching] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const isEditing = Boolean(editingIdParam);

  // Fetch announcement data
  const fetchAnnouncement = useCallback(async (id) => {
    setIsFetching(true);
    setError('');
    try {
      const response = await axios.get(`${API_BASE_URL}/api/announcements/${id}`);
      setFormData({
        title: response.data.title,
        content: response.data.content,
        isImportant: response.data.isImportant || false
      });
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load announcement');
      console.error('Fetch error:', err.response?.data);
    } finally {
      setIsFetching(false);
    }
  }, []);

  // Initialize form
  useEffect(() => {
    if (isEditing) {
      fetchAnnouncement(editingIdParam);
    } else {
      setFormData({ title: '', content: '', isImportant: false });
    }
  }, [editingIdParam, isEditing, fetchAnnouncement]);

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    setSuccess('');

    try {
      const payload = {
        title: formData.title.trim(),
        content: formData.content.trim(),
        isImportant: formData.isImportant
      };

      const response = isEditing
        ? await axios.put(`${API_BASE_URL}/api/announcements/${editingIdParam}`, payload)
        : await axios.post(`${API_BASE_URL}/api/announcements`, payload);

      setSuccess(response.data.message || 
        `Announcement ${isEditing ? 'updated' : 'created'} successfully`);
      
      if (!isEditing) {
        setFormData({ title: '', content: '', isImportant: false });
      }
    } catch (err) {
      const errorMsg = err.response?.data?.message || 
                      err.message || 
                      'Operation failed. Please try again.';
      setError(errorMsg);
      console.error('Submission error:', err.response?.data || err);
    } finally {
      setIsLoading(false);
    }
  };

  // Handle input changes
  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
    if (error) setError('');
  };

  if (isEditing && isFetching) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto p-4 md:p-6">
      <h2 className="text-2xl font-bold text-gray-800 mb-6">
        {isEditing ? 'Edit Announcement' : 'Create Announcement'}
      </h2>

      {/* Status Messages */}
      {error && (
        <div className="mb-4 p-4 bg-red-100 border-l-4 border-red-500 text-red-700 rounded">
          <p className="font-semibold">Error</p>
          <p>{error}</p>
        </div>
      )}

      {success && !error && (
        <div className="mb-4 p-4 bg-green-100 border-l-4 border-green-500 text-green-700 rounded">
          <p className="font-semibold">Success</p>
          <p>{success}</p>
          <button
            onClick={() => navigate('/registraradmin/announcements')}
            className="mt-2 text-sm text-green-700 hover:underline"
          >
            ← Back to announcements
          </button>
        </div>
      )}

      {/* Announcement Form */}
      <form onSubmit={handleSubmit} className="bg-white p-6 rounded-lg shadow border border-gray-200">
        <div className="space-y-6">
          {/* Title Field */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Title <span className="text-red-500">*</span>
            </label>
            <input
              name="title"
              type="text"
              value={formData.title}
              onChange={handleChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              required
            />
          </div>

          {/* Content Field */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Content <span className="text-red-500">*</span>
            </label>
            <textarea
              name="content"
              rows={8}
              value={formData.content}
              onChange={handleChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              required
            />
          </div>

          {/* Importance Toggle */}
          <div className="flex items-center">
            <input
              name="isImportant"
              type="checkbox"
              checked={formData.isImportant}
              onChange={handleChange}
              className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
            />
            <label className="ml-2 text-sm text-gray-700">
              Mark as important
            </label>
          </div>

          {/* Form Actions */}
          <div className="flex flex-col sm:flex-row gap-3 pt-4 border-t border-gray-200 mt-4">
            <button
              type="submit"
              disabled={isLoading}
              className={`flex items-center justify-center px-5 py-2.5 rounded-lg text-white font-medium ${
                isEditing ? 'bg-green-600 hover:bg-green-700' : 'bg-blue-600 hover:bg-blue-700'
              } ${isLoading ? 'opacity-70 cursor-not-allowed' : ''}`}
            >
              {isLoading ? (
                <>
                  <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  {isEditing ? 'Saving...' : 'Creating...'}
                </>
              ) : (
                <>
                  {isEditing ? (
                    <FiSave className="-ml-1 mr-1.5 h-4 w-4" />
                  ) : (
                    <FiPlus className="-ml-1 mr-1.5 h-4 w-4" />
                  )}
                  {isEditing ? 'Save Changes' : 'Create Announcement'}
                </>
              )}
            </button>

            <button
              type="button"
              onClick={() => navigate('/registraradmin/announcements')}
              className="px-5 py-2.5 border border-gray-300 rounded-lg text-gray-700 font-medium hover:bg-gray-50"
            >
              Cancel
            </button>
          </div>
        </div>
      </form>
    </div>
  );
};

export default AdminAnnouncements;