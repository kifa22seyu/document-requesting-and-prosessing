// components/UserCrud.jsx
import React, { useState, useEffect, useCallback, useRef } from 'react';
import axios from 'axios';
import PropTypes from 'prop-types';

// --- Constants ---
const API_BASE_URL = 'http://localhost:8000/api/users';
const USER_TYPES = {
    ALUMNI: 'alumni',
    COMPANY: 'company',
};
const SUCCESS_MESSAGE_DURATION = 4000;

// --- API Client Setup ---
const apiClient = axios.create({
    baseURL: API_BASE_URL,
});

// Axios Interceptors
// Response interceptor
apiClient.interceptors.response.use(
    (response) => response,
    (error) => {
        console.error("API Error:", { /* ... TMI removed for brevity ... */ });
        const structuredError = {
            // Prioritize backend message if available in expected format
            message: error.response?.data?.message || error.message || 'An unknown network error occurred.',
            status: error.response?.status,
            data: error.response?.data,
            isNetworkError: !error.response,
        };
        // Backend userController might not send fieldErrors, but keep check just in case
        if (error.response?.data?.errors && typeof error.response.data.errors === 'object') {
            structuredError.fieldErrors = error.response.data.errors;
        }
        return Promise.reject(structuredError); // Reject with structured error
    }
);

// Request interceptor - Essential for sending the token
apiClient.interceptors.request.use(
    (config) => {
        // *** CRITICAL: Ensure token is stored with this key after login ***
        const token = localStorage.getItem('authToken');
        if (token) {
            config.headers['Authorization'] = `Bearer ${token}`;
            console.log("Attaching token to request:", `Bearer ${token.substring(0, 10)}...`); // Debug log
        } else {
            console.warn("No auth token found in localStorage for request to", config.url); // Warning if token missing
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

// --- Validation Functions ---
const validateEmail = (email) => /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/.test(email);
const validatePassword = (password) => password.length >= 6;

// --- Default Form State ---
const initialFormData = {
    name: '',
    email: '',
    password: '',
    userType: USER_TYPES.ALUMNI,
};

/**
 * UserCrud Component
 */
const UserCrud = () => {
    const [users, setUsers] = useState([]);
    const [formData, setFormData] = useState(initialFormData);
    const [editingUser, setEditingUser] = useState(null);
    const [isTableLoading, setIsTableLoading] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [formErrors, setFormErrors] = useState({}); // For client-side errors
    const [serverError, setServerError] = useState(null); // For general server errors
    const [successMessage, setSuccessMessage] = useState(null);
    const successTimeoutRef = useRef(null);

    // --- Fetch Users ---
    const fetchUsers = useCallback(async () => {
        setIsTableLoading(true);
        setServerError(null);
        setSuccessMessage(null); // Clear messages on new fetch
        console.log("Fetching users..."); // Debug log
        try {
            const response = await apiClient.get('/');
            // Controller now returns array directly
            const fetchedUsers = response.data || [];
             console.log("Users fetched:", fetchedUsers.length); // Debug log
            setUsers(Array.isArray(fetchedUsers) ? fetchedUsers : []);
        } catch (err) {
            console.error("Fetch error:", err);
            // Use the message processed by the interceptor
            setServerError(err.message || 'Failed to fetch users.');
            setUsers([]); // Clear users on error
        } finally {
            setIsTableLoading(false);
        }
    }, []); // Empty dependency array is correct here

    useEffect(() => {
        fetchUsers();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []); // Fetch on mount

    // --- Auto-clear Success Message ---
    useEffect(() => {
        if (successTimeoutRef.current) clearTimeout(successTimeoutRef.current);
        if (successMessage) {
            successTimeoutRef.current = setTimeout(() => setSuccessMessage(null), SUCCESS_MESSAGE_DURATION);
        }
        return () => { if (successTimeoutRef.current) clearTimeout(successTimeoutRef.current); };
    }, [successMessage]);

    // --- Form Handling ---
    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
        // Clear client-side error for this field on change
        if (formErrors[name]) {
            setFormErrors(prev => ({ ...prev, [name]: undefined }));
        }
        // Clear general server error on any change
        if (serverError) setServerError(null);
    };

    const resetForm = useCallback(() => {
        setFormData(initialFormData);
        setEditingUser(null);
        setFormErrors({});
        setServerError(null);
        setSuccessMessage(null); // Clear success message on reset
        if (successTimeoutRef.current) clearTimeout(successTimeoutRef.current);
        // Optional: Scroll to top
        // if (window.scrollY > 100) window.scrollTo({ top: 0, behavior: 'smooth' });
    }, []);

    // --- Client-side Validation ---
    const validateForm = useCallback(() => {
        const errors = {};
        const { name, email, password, userType } = formData;

        if (!name.trim()) errors.name = 'Name is required.';
        if (!email.trim()) errors.email = 'Email is required.';
        else if (!validateEmail(email)) errors.email = 'Please enter a valid email address.';

        if (!editingUser && !password.trim()) errors.password = 'Password is required for new users.';
        else if (password && !validatePassword(password)) errors.password = 'Password must be at least 6 characters long.';

        if (!userType || !Object.values(USER_TYPES).includes(userType)) errors.userType = 'User type is required and must be valid.';

        setFormErrors(errors); // Set client-side errors
        return Object.keys(errors).length === 0;
    }, [formData, editingUser]);

    // --- API Interaction ---
    const handleSubmit = async (e) => {
        e.preventDefault();
        setServerError(null); // Clear previous server errors
        setSuccessMessage(null); // Clear previous success messages

        if (!validateForm()) { // Run client-side validation first
             console.log("Client-side validation failed:", formErrors); // Debug log
             return;
        }

        setIsSubmitting(true);
        setFormErrors({}); // Clear client errors before submit attempt

        try {
            const payload = { ...formData };
            if (editingUser && !payload.password) delete payload.password;

            let response;
            let successMsgText = ''; // Static text for success

            if (editingUser) {
                // --- Update User ---
                console.log(`Updating user ${editingUser._id} with payload:`, payload); // Debug log
                response = await apiClient.put(`/${editingUser._id}`, payload);
                const updatedUser = response.data; // Controller returns updated user directly
                console.log("User updated successfully (API):", updatedUser); // Debug log
                setUsers(prevUsers =>
                    prevUsers.map(user => (user._id === editingUser._id ? updatedUser : user))
                );
                successMsgText = 'User updated successfully!';

            } else {
                // --- Create User ---
                console.log("Creating user with payload:", payload); // Debug log
                response = await apiClient.post('/', payload);
                const newUser = response.data; // Controller returns new user directly
                 console.log("User created successfully (API):", newUser); // Debug log
                setUsers(prevUsers => [...prevUsers, newUser]);
                successMsgText = 'User created successfully!';
            }

            setSuccessMessage(successMsgText); // Set frontend success message
            resetForm();

        } catch (err) {
            console.error("Submit Error:", err);
            // Use the message processed by the interceptor
            setServerError(err.message || 'An error occurred during submission.');
            // Since backend might not send structured field errors, clear client errors
            // and rely on the single serverError message display.
            setFormErrors({});
        } finally {
            setIsSubmitting(false);
        }
    };

    const deleteUser = async (userId, userName) => {
        if (!window.confirm(`Are you sure you want to delete user "${userName}"? This action cannot be undone.`)) return;

        // Use submitting state to disable buttons during delete
        setIsSubmitting(true);
        setServerError(null);
        setSuccessMessage(null);
        console.log(`Attempting to delete user ${userId}`); // Debug log
        try {
            // Backend returns { success: true, message: '...' } for delete
            const response = await apiClient.delete(`/${userId}`);
             console.log("User deleted successfully (API):", response.data); // Debug log
            setUsers(prevUsers => prevUsers.filter(user => user._id !== userId));
            if (editingUser?._id === userId) resetForm(); // Clear form if deleted user was being edited
            setSuccessMessage(response.data?.message || 'User deleted successfully!'); // Use backend message

        } catch (err) {
            console.error("Delete error:", err);
            // Use message from interceptor
            setServerError(err.message || 'Failed to delete user.');
        } finally {
            setIsSubmitting(false); // Re-enable buttons
        }
    };

    const handleEdit = useCallback((user) => {
        console.log("Editing user:", user); // Debug log
        setEditingUser(user);
        setFormData({
            name: user.name || '',
            email: user.email || '',
            password: '', // Clear password for edit form
            userType: user.userType || USER_TYPES.ALUMNI,
        });
        setFormErrors({}); // Clear validation errors
        setServerError(null); // Clear server errors
        setSuccessMessage(null); // Clear success message
        if (successTimeoutRef.current) clearTimeout(successTimeoutRef.current);
        window.scrollTo({ top: 0, behavior: 'smooth' }); // Scroll to form
    }, []); // resetForm is not a dependency here

    // --- Render JSX --- (No functional changes, just using state)
    return (
        <div className="container mx-auto p-4 max-w-6xl space-y-8">
             <h1 className="text-3xl font-bold text-gray-800">User Management</h1>

             {/* Global Messages Area */}
             <div className="space-y-4 min-h-[70px]"> {/* Added min-height to prevent layout jumps */}
                {serverError && (
                    <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 rounded shadow-md" role="alert">
                        <p className="font-bold">Error</p>
                        <p>{serverError}</p>
                    </div>
                )}
                {successMessage && (
                    <div className="bg-green-100 border-l-4 border-green-500 text-green-700 p-4 rounded shadow-md transition-opacity duration-300" role="status">
                        <p className="font-bold">Success</p>
                        <p>{successMessage}</p>
                    </div>
                )}
             </div>

            {/* Form Section */}
            <div className="bg-white rounded-lg shadow-xl p-6 md:p-8">
                <h2 className="text-2xl font-semibold mb-5 text-gray-700 border-b pb-3">
                    {editingUser ? `Edit User: ${editingUser.name}` : 'Create New User'}
                </h2>
                <form onSubmit={handleSubmit} noValidate>
                    <fieldset disabled={isSubmitting} className="space-y-5">
                        <legend className="sr-only">{editingUser ? 'Edit user form' : 'Create user form'}</legend>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-5">
                            {/* Name Input */}
                            <div>
                                <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">Name <span className="text-red-500">*</span></label>
                                <input
                                    id="name" type="text" name="name" value={formData.name} onChange={handleChange} required
                                    className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:border-transparent ${formErrors.name ? 'border-red-500 focus:ring-red-500' : 'border-gray-300 focus:ring-blue-500'} ${isSubmitting ? 'bg-gray-100 cursor-not-allowed' : ''}`}
                                    aria-invalid={!!formErrors.name}
                                    aria-describedby={formErrors.name ? "name-error" : undefined}
                                />
                                {/* Display CLIENT-SIDE validation error */}
                                {formErrors.name && <p id="name-error" className="text-red-600 text-xs mt-1" role="alert">{formErrors.name}</p>}
                            </div>

                            {/* Email Input */}
                            <div>
                                <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">Email <span className="text-red-500">*</span></label>
                                <input
                                    id="email" type="email" name="email" value={formData.email} onChange={handleChange} required
                                    className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:border-transparent ${formErrors.email ? 'border-red-500 focus:ring-red-500' : 'border-gray-300 focus:ring-blue-500'} ${isSubmitting ? 'bg-gray-100 cursor-not-allowed' : ''}`}
                                    aria-invalid={!!formErrors.email}
                                    aria-describedby={formErrors.email ? "email-error" : undefined}
                                />
                                {formErrors.email && <p id="email-error" className="text-red-600 text-xs mt-1" role="alert">{formErrors.email}</p>}
                            </div>

                            {/* User Type Select */}
                            <div>
                                <label htmlFor="userType" className="block text-sm font-medium text-gray-700 mb-1">User Type <span className="text-red-500">*</span></label>
                                <select
                                    id="userType" name="userType" value={formData.userType} onChange={handleChange} required
                                    className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:border-transparent bg-white ${formErrors.userType ? 'border-red-500 focus:ring-red-500' : 'border-gray-300 focus:ring-blue-500'} ${isSubmitting ? 'bg-gray-100 cursor-not-allowed' : ''}`}
                                    aria-invalid={!!formErrors.userType}
                                    aria-describedby={formErrors.userType ? "userType-error" : undefined}>
                                    <option value={USER_TYPES.ALUMNI}>Alumni</option>
                                    <option value={USER_TYPES.COMPANY}>Company</option>
                                </select>
                                {formErrors.userType && <p id="userType-error" className="text-red-600 text-xs mt-1" role="alert">{formErrors.userType}</p>}
                            </div>

                            {/* Password Input */}
                            <div>
                                <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
                                    Password {!editingUser && <span className="text-red-500">*</span>}
                                    {editingUser && <span className="text-xs text-gray-500 ml-1">(Leave blank to keep current)</span>}
                                </label>
                                <input
                                    id="password" type="password" name="password" value={formData.password} onChange={handleChange}
                                    className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:border-transparent ${formErrors.password ? 'border-red-500 focus:ring-red-500' : 'border-gray-300 focus:ring-blue-500'} ${isSubmitting ? 'bg-gray-100 cursor-not-allowed' : ''}`}
                                    placeholder={editingUser ? "Leave blank if no change" : "Min. 6 characters"}
                                    aria-invalid={!!formErrors.password}
                                    aria-describedby={formErrors.password ? "password-error" : undefined}
                                    autoComplete="new-password"
                                />
                                {formErrors.password && <p id="password-error" className="text-red-600 text-xs mt-1" role="alert">{formErrors.password}</p>}
                            </div>
                        </div>

                        {/* Buttons */}
                        <div className="md:col-span-2 flex flex-col sm:flex-row items-center gap-3 pt-4 border-t border-gray-200 mt-4">
                             <button
                                type="submit"
                                className={`w-full sm:w-auto inline-flex items-center justify-center px-6 py-2.5 rounded-lg text-white font-medium transition duration-150 ease-in-out focus:outline-none focus:ring-2 focus:ring-offset-2 shadow-sm ${
                                    editingUser ? 'bg-green-600 hover:bg-green-700 focus:ring-green-500' : 'bg-blue-600 hover:bg-blue-700 focus:ring-blue-500'
                                } ${isSubmitting ? 'opacity-70 cursor-not-allowed' : ''}`}
                                disabled={isSubmitting}>
                                {isSubmitting && ( /* Spinner Icon */
                                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                    </svg>
                                )}
                                {isSubmitting ? 'Processing...' : editingUser ? 'Update User' : 'Create User'}
                            </button>
                            {editingUser && (
                                <button
                                    type="button"
                                    onClick={resetForm}
                                    className="w-full sm:w-auto px-6 py-2.5 border border-gray-300 rounded-lg text-gray-700 font-medium hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition duration-150 ease-in-out disabled:opacity-70 disabled:cursor-not-allowed"
                                    disabled={isSubmitting}>
                                    Cancel Edit
                                </button>
                            )}
                        </div>
                    </fieldset>
                </form>
            </div>

            {/* User List Table */}
            <div className="bg-white rounded-lg shadow-xl overflow-hidden">
                 <div className="p-5 md:p-6 border-b border-gray-200">
                    <h2 className="text-xl font-semibold text-gray-700" id="user-list-title">Registered Users</h2>
                    {!isTableLoading && (
                         <p className="text-sm text-gray-500 mt-1">
                            {users.length > 0 ? `Showing ${users.length} user${users.length !== 1 ? 's' : ''}.` : 'No users found.'}
                        </p>
                    )}
                </div>
                 {isTableLoading ? (
                    <div className="p-10 text-center text-gray-500 flex items-center justify-center space-x-2">
                         {/* Spinner SVG */}
                         <svg className="animate-spin h-5 w-5 text-blue-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                           <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                           <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                         </svg>
                         <span>Loading users...</span>
                    </div>
                 ) : users.length === 0 ? (
                     <div className="p-10 text-center text-gray-500">No users found. Use the form above to create one.</div>
                 ) : (
                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-200" aria-labelledby="user-list-title">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider hidden sm:table-cell">Email</th>
                                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Type</th>
                                     {/* You could add Role here if needed & returned by API */}
                                    {/* <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Role</th> */}
                                    <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                                {users.map((user) => (
                                <tr key={user._id} className={`hover:bg-gray-50 ${ editingUser?._id === user._id ? 'bg-blue-50' : '' }`}>
                                    {/* Name */}
                                    <td scope="row" className="px-6 py-4 whitespace-nowrap">
                                        <div className="text-sm font-medium text-gray-900">{user.name}</div>
                                        <div className="text-sm text-gray-500 sm:hidden">{user.email}</div>
                                    </td>
                                    {/* Email */}
                                    <td className="px-6 py-4 whitespace-nowrap hidden sm:table-cell">
                                        <div className="text-sm text-gray-500">{user.email}</div>
                                    </td>
                                    {/* Type Badge */}
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <span className={`px-2.5 py-0.5 inline-flex text-xs leading-5 font-semibold rounded-full capitalize ${
                                            user.userType === USER_TYPES.ALUMNI ? 'bg-blue-100 text-blue-800' :
                                            user.userType === USER_TYPES.COMPANY ? 'bg-green-100 text-green-800' :
                                            'bg-gray-100 text-gray-800'
                                        }`}>
                                            {user.userType}
                                        </span>
                                    </td>
                                     {/* Role (Optional) */}
                                     {/* <td className="px-6 py-4 whitespace-nowrap">
                                        <span className="text-sm text-gray-500 capitalize">{user.role || 'N/A'}</span>
                                    </td> */}
                                    {/* Actions */}
                                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                         <div className="flex justify-end items-center gap-x-4">
                                            <button
                                                type="button"
                                                onClick={() => handleEdit(user)}
                                                className="text-indigo-600 hover:text-indigo-800 transition duration-150 ease-in-out disabled:opacity-50 disabled:cursor-not-allowed"
                                                disabled={isSubmitting || isTableLoading}
                                                aria-label={`Edit user ${user.name}`}>
                                                Edit
                                            </button>
                                            <button
                                                type="button"
                                                onClick={() => deleteUser(user._id, user.name)}
                                                className="text-red-600 hover:text-red-800 transition duration-150 ease-in-out disabled:opacity-50 disabled:cursor-not-allowed"
                                                disabled={isSubmitting || isTableLoading}
                                                aria-label={`Delete user ${user.name}`}>
                                                Delete
                                            </button>
                                         </div>
                                    </td>
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

UserCrud.propTypes = {
 // No props currently defined
};

export default UserCrud;