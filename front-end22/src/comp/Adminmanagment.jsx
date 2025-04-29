// src/components/AdminManagement.js
import React, { useState, useEffect } from 'react';
import { FiUsers, FiActivity, FiEdit, FiTrash2, FiSearch, FiUser, FiFileText } from 'react-icons/fi';

const AdminManagement = () => {
  const [users, setUsers] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Simulate API fetch
    const mockUsers = [
      { id: 1, name: 'John Doe', email: 'john@example.com', role: 'alumni', status: 'active', lastActivity: '2023-05-15' },
      { id: 2, name: 'Jane Smith', email: 'jane@example.com', role: 'alumni', status: 'pending', lastActivity: '2023-05-10' },
      { id: 3, name: 'Admin User', email: 'admin@example.com', role: 'admin', status: 'active', lastActivity: '2023-05-14' },
      { id: 4, name: 'Robert Johnson', email: 'robert@example.com', role: 'alumni', status: 'inactive', lastActivity: '2023-04-20' },
      { id: 5, name: 'Emily Davis', email: 'emily@example.com', role: 'alumni', status: 'active', lastActivity: '2023-05-12' },
    ];
    
    setTimeout(() => {
      setUsers(mockUsers);
      setLoading(false);
    }, 1000);
  }, []);

  const filteredUsers = users.filter(user => 
    user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleStatusChange = (userId, newStatus) => {
    setUsers(users.map(user => 
      user.id === userId ? { ...user, status: newStatus } : user
    ));
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-gray-800 flex items-center">
          <FiUsers className="mr-2" /> User Management
        </h2>
        <div className="relative">
          <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Search users..."
            className="pl-10 pr-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full bg-white rounded-lg overflow-hidden">
            <thead className="bg-gray-100">
              <tr>
                <th className="py-3 px-4 text-left">Name</th>
                <th className="py-3 px-4 text-left">Email</th>
                <th className="py-3 px-4 text-left">Role</th>
                <th className="py-3 px-4 text-left">Status</th>
                <th className="py-3 px-4 text-left">Last Activity</th>
                <th className="py-3 px-4 text-left">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {filteredUsers.map(user => (
                <tr key={user.id} className="hover:bg-gray-50">
                  <td className="py-4 px-4">{user.name}</td>
                  <td className="py-4 px-4">{user.email}</td>
                  <td className="py-4 px-4">
                    <span className={`px-2 py-1 rounded-full text-xs ${
                      user.role === 'admin' ? 'bg-purple-100 text-purple-800' : 'bg-blue-100 text-blue-800'
                    }`}>
                      {user.role}
                    </span>
                  </td>
                  <td className="py-4 px-4">
                    <select
                      value={user.status}
                      onChange={(e) => handleStatusChange(user.id, e.target.value)}
                      className={`px-2 py-1 rounded-full text-xs focus:outline-none ${
                        user.status === 'active' ? 'bg-green-100 text-green-800' : 
                        user.status === 'pending' ? 'bg-yellow-100 text-yellow-800' : 'bg-red-100 text-red-800'
                      }`}
                    >
                      <option value="active">Active</option>
                      <option value="pending">Pending</option>
                      <option value="inactive">Inactive</option>
                    </select>
                  </td>
                  <td className="py-4 px-4">{user.lastActivity}</td>
                  <td className="py-4 px-4 flex space-x-2">
                    <button className="text-blue-600 hover:text-blue-800 p-1 rounded hover:bg-blue-50">
                      <FiEdit />
                    </button>
                    <button className="text-red-600 hover:text-red-800 p-1 rounded hover:bg-red-50">
                      <FiTrash2 />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <div className="mt-8">
        <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center">
          <FiActivity className="mr-2" /> Recent Activities
        </h2>
        <div className="bg-gray-50 rounded-lg p-4">
          <div className="space-y-4">
            <div className="flex items-start">
              <div className="bg-blue-100 p-2 rounded-full mr-3">
                <FiUser className="text-blue-600" />
              </div>
              <div>
                <p className="font-medium">John Doe updated his profile</p>
                <p className="text-sm text-gray-500">2 hours ago</p>
              </div>
            </div>
            <div className="flex items-start">
              <div className="bg-green-100 p-2 rounded-full mr-3">
                <FiFileText className="text-green-600" />
              </div>
              <div>
                <p className="font-medium">Jane Smith submitted a request</p>
                <p className="text-sm text-gray-500">1 day ago</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminManagement;