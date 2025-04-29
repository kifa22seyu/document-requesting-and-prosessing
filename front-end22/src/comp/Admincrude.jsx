import React, { useState, useEffect } from 'react';
import axios from 'axios';

// Ensure this matches the backend route we set up
const API_URL = 'http://localhost:8000/api/admins';

const AdminCrud = () => {
  const [users, setUsers] = useState([]); // Consider renaming to admins for clarity
  const [formData, setFormData] = useState({
    fullName: "",
    role: "Finance", // Default role
    email: "",
    password: "",
  });
  const [editingUser, setEditingUser] = useState(null); // Consider renaming editingAdmin
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  // Role options
  const roleOptions = [
    { value: "Finance", label: "Finance" },
    { value: "Team Association", label: "Team Association" }
  ];

  // Fetch users (admins) on component mount
  useEffect(() => {
    const fetchUsers = async () => {
      setIsLoading(true);
      setError(null); // Clear previous errors
      try {
        // GET /api/admins
        const { data } = await axios.get(API_URL);
        setUsers(data); // Backend sends the array directly now
      } catch (err) {
        setError(err.response?.data?.error || 'Failed to fetch users');
        console.error("Fetch error:", err.response || err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchUsers();
  }, []); // Empty dependency array means run once on mount

  // Handle form input changes
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  // Reset form to initial state
  const resetForm = () => {
    setFormData({
      fullName: "",
      role: "Finance",
      email: "",
      password: "",
    });
    setEditingUser(null);
    setError(null);
    // Keep success message visible briefly if desired, or clear it here too
    // setSuccess(null);
  };

  // Handle form submission (create or update)
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);
    setIsLoading(true); // Set loading at the beginning

    try {
      if (editingUser) {
        // PUT /api/admins/:id
        const { data } = await axios.put(`${API_URL}/${editingUser._id}`, formData);
        setUsers(prev => prev.map(user =>
          user._id === editingUser._id ? data : user // Backend sends the updated admin
        ));
        setSuccess('User updated successfully');
      } else {
        // POST /api/admins
        const { data } = await axios.post(API_URL, formData);
        setUsers(prev => [...prev, data]); // Backend sends the created admin
        setSuccess('User created successfully');
      }
      resetForm(); // Reset form on success
    } catch (err) {
       setError(err.response?.data?.error || 'An error occurred during submission');
       console.error("Submit error:", err.response || err);
    } finally {
      setIsLoading(false); // Ensure loading is turned off
    }
  };

  // Delete user (admin)
  const deleteUser = async (id) => {
    if (!window.confirm('Are you sure you want to delete this user?')) return;

    setIsLoading(true);
    setError(null);
    setSuccess(null);
    try {
      // DELETE /api/admins/:id
      await axios.delete(`${API_URL}/${id}`);
      setUsers(prev => prev.filter(user => user._id !== id));
      if (editingUser?._id === id) resetForm(); // Reset form if editing the deleted user
      setSuccess('User deleted successfully');
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to delete user');
       console.error("Delete error:", err.response || err);
    } finally {
      setIsLoading(false);
    }
  };

  // Set form to edit mode
  const handleEdit = (user) => {
    window.scrollTo({ top: 0, behavior: 'smooth' }); // Scroll to top for better UX
    setEditingUser(user);
    setFormData({
      fullName: user.fullName,
      role: user.role,
      email: user.email,
      password: '' // Clear password field for editing - user needs to re-enter if changing
    });
    setError(null); // Clear errors when starting edit
    setSuccess(null); // Clear success messages when starting edit
  };

  return (
    <div className="container mx-auto p-4 max-w-6xl">
      <h1 className="text-3xl font-bold mb-6 text-gray-800">Admin Management</h1>

      {/* Error message display */}
      {error && (
        <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 mb-6 rounded shadow">
          <p className="font-bold">Error</p>
          <p>{error}</p>
        </div>
      )}

      {/* Success message display */}
      {success && (
        <div className="bg-green-100 border-l-4 border-green-500 text-green-700 p-4 mb-6 rounded shadow">
           <p className="font-bold">Success</p>
          <p>{success}</p>
        </div>
      )}

      {/* User form */}
      <div className="bg-white rounded-lg shadow-md p-6 mb-8">
        <h2 className="text-xl font-semibold mb-4 text-gray-700">
          {editingUser ? 'Edit Admin User' : 'Create New Admin User'}
        </h2>
        <form onSubmit={handleSubmit}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Full Name */}
            <div>
              <label htmlFor="fullName" className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
              <input
                id="fullName"
                type="text"
                name="fullName"
                value={formData.fullName}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition duration-150 ease-in-out"
                required
                aria-required="true"
              />
            </div>

            {/* Role */}
            <div>
              <label htmlFor="role" className="block text-sm font-medium text-gray-700 mb-1">Role</label>
              <select
                id="role"
                name="role"
                value={formData.role}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition duration-150 ease-in-out bg-white"
                required
                aria-required="true"
              >
                {roleOptions.map(option => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>

             {/* Email */}
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">Email</label>
              <input
                id="email"
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition duration-150 ease-in-out"
                required
                aria-required="true"
              />
            </div>

            {/* Password */}
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
                Password {!editingUser && <span className="text-red-500">*</span>}
                {editingUser && <span className="text-xs text-gray-500 ml-1">(Leave blank to keep current)</span>}
              </label>
              <input
                id="password"
                type="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition duration-150 ease-in-out"
                placeholder={editingUser ? "Enter new password to change" : "Minimum 6 characters"}
                required={!editingUser} // Required only when creating
                minLength={editingUser ? undefined : 6} // Enforce minLength only when creating or changing
                aria-required={!editingUser}
              />
            </div>

            {/* Action Buttons */}
            <div className="md:col-span-2 flex items-center space-x-3 mt-4">
              <button
                type="submit"
                className={`px-6 py-2 rounded-lg text-white font-medium transition duration-150 ease-in-out ${
                  editingUser ? 'bg-green-600 hover:bg-green-700 focus:ring-green-500' : 'bg-blue-600 hover:bg-blue-700 focus:ring-blue-500'
                } ${isLoading ? 'opacity-70 cursor-not-allowed' : ''} focus:outline-none focus:ring-2 focus:ring-offset-2`}
                disabled={isLoading}
              >
                {isLoading ? (
                   <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white inline" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                ) : null}
                {isLoading ? 'Processing...' : editingUser ? 'Update Admin' : 'Add Admin'}
              </button>
              {editingUser && (
                <button
                  type="button"
                  onClick={resetForm}
                  className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 font-medium hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition duration-150 ease-in-out"
                  disabled={isLoading}
                >
                  Cancel Edit
                </button>
              )}
            </div>
          </div>
        </form>
      </div>

      {/* User list table */}
      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <div className="p-6 border-b border-gray-200 flex justify-between items-center">
            <div>
                 <h2 className="text-xl font-semibold text-gray-700">Admin List</h2>
                 <p className="text-sm text-gray-500 mt-1">
                   {isLoading && !users.length ? 'Loading...' : `Showing ${users.length} admin user${users.length !== 1 ? 's' : ''}`}
                 </p>
            </div>
             {/* Optional: Add a refresh button */}
             {/* <button onClick={fetchUsers} disabled={isLoading} className="...">Refresh</button> */}
        </div>

        {users.length === 0 && !isLoading ? (
          <div className="p-6 text-center text-gray-500">
             No admin users found. Create one using the form above.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-12">#</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Full Name</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Role</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
                  <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {users.map((user, index) => (
                  <tr key={user._id} className={`hover:bg-gray-50 ${editingUser?._id === user._id ? 'bg-yellow-50' : ''}`}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{index + 1}</td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">{user.fullName}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                       <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${user.role === 'Finance' ? 'bg-blue-100 text-blue-800' : 'bg-purple-100 text-purple-800'}`}>
                           {user.role}
                       </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-500">{user.email}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <button
                        onClick={() => handleEdit(user)}
                        className="text-indigo-600 hover:text-indigo-900 mr-4 disabled:opacity-50"
                        disabled={isLoading}
                        aria-label={`Edit ${user.fullName}`}
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => deleteUser(user._id)}
                        className="text-red-600 hover:text-red-900 disabled:opacity-50"
                        disabled={isLoading}
                         aria-label={`Delete ${user.fullName}`}
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
                 {/* Loading Skeleton Rows (Optional) */}
                 {isLoading && users.length === 0 && [...Array(3)].map((_, i) => (
                     <tr key={`skel-${i}`}>
                         <td className="px-6 py-4"><div className="h-4 bg-gray-200 rounded animate-pulse w-6"></div></td>
                         <td className="px-6 py-4"><div className="h-4 bg-gray-200 rounded animate-pulse w-32"></div></td>
                         <td className="px-6 py-4"><div className="h-4 bg-gray-200 rounded animate-pulse w-24"></div></td>
                         <td className="px-6 py-4"><div className="h-4 bg-gray-200 rounded animate-pulse w-40"></div></td>
                         <td className="px-6 py-4"><div className="h-4 bg-gray-200 rounded animate-pulse w-20 float-right"></div></td>
                     </tr>
                 ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminCrud;