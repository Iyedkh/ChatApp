import { useEffect, useState } from "react";
import { useAuthStore } from "../store/useAuthStore";
import { FiUser, FiMail, FiCalendar, FiShield, FiEdit, FiCheck, FiX, FiChevronLeft, FiChevronRight } from "react-icons/fi";
import { toast } from "react-toastify";

const UsersDashboard = () => {
  const { users, totalUsers, isFetchingUsers, getUsers, authUser, updateUserRole } = useAuthStore();
  const [currentPage, setCurrentPage] = useState(1);
  const [usersPerPage] = useState(8);
  const [editingRole, setEditingRole] = useState(null);
  const [selectedRole, setSelectedRole] = useState('');
  const [updatingRole, setUpdatingRole] = useState(null);

  useEffect(() => {
    getUsers(currentPage, usersPerPage);
  }, [currentPage, usersPerPage]);

  const onPageChange = (page) => {
    setCurrentPage(page);
  };

  const startEditing = (userId, currentRole) => {
    setEditingRole(userId);
    setSelectedRole(currentRole);
  };

  const cancelEditing = () => {
    setEditingRole(null);
    setSelectedRole('');
  };

  const handleRoleChange = async (userId) => {
    if (selectedRole === users.find(u => u._id === userId)?.role) {
      cancelEditing();
      return;
    }

    setUpdatingRole(userId);
    try {
      await updateUserRole(userId, selectedRole);
      toast.success('User role updated successfully');
      setEditingRole(null);
      getUsers(currentPage, usersPerPage);
    } catch (error) {
      toast.error('Failed to update user role');
      console.error('Error updating role:', error);
    } finally {
      setUpdatingRole(null);
    }
  };

  if (!authUser || authUser.role !== 'admin') {
    return (
      <div className="flex justify-center items-center h-screen bg-gray-50">
        <div className="text-center p-8 max-w-md mx-auto bg-white rounded-xl shadow-lg">
          <div className="flex justify-center text-red-500 mb-4">
            <FiShield className="w-12 h-12" />
          </div>
          <h2 className="text-2xl font-bold text-gray-800 mb-4">Access Denied</h2>
          <p className="text-gray-600">You don't have permission to access this page.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6
    mt-12 min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-gray-800">User Management</h1>
          <div className="flex items-center space-x-2 bg-gradient-to-r  bg-black px-4 py-3 rounded-lg shadow-lg">
            <div className="p-2 bg-white bg-opacity-20 rounded-full">
              <FiUser className="w-5 h-5 text-black" />
            </div>
            <div className="text-right">
              <p className="text-xs font-medium text-white opacity-80">Total Users</p>
              <p className="text-xl font-bold text-white">{totalUsers.toLocaleString()}</p>
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-xl shadow-md overflow-hidden">
          {isFetchingUsers ? (
            <div className="flex justify-center items-center py-20">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
            </div>
          ) : (
            <>
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-100">
                    <tr>
                      <th scope="col" className="px-6 py-4 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                        User
                      </th>
                      <th scope="col" className="px-6 py-4 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                        Email
                      </th>
                      <th scope="col" className="px-6 py-4 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                        Joined Date
                      </th>
                      <th scope="col" className="px-6 py-4 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                        Role
                      </th>
                      <th scope="col" className="px-6 py-4 text-right text-xs font-medium text-gray-700 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {users.map((user) => (
                      <tr key={user._id} className="hover:bg-gray-50 transition-colors">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <div className="flex-shrink-0 h-10 w-10">
                              <img
                                src={user.profilePic || "/avatar.png"}
                                alt={user.fullName}
                                className="h-10 w-10 rounded-full object-cover border border-gray-200"
                              />
                            </div>
                            <div className="ml-4">
                              <div className="text-sm font-semibold text-gray-900">{user.fullName}</div>
                              <div className="text-xs text-gray-500">ID: {user._id.substring(0, 6)}...</div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">{user.email}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-500">
                            {new Date(user.createdAt).toLocaleDateString('en-US', {
                              year: 'numeric',
                              month: 'short',
                              day: 'numeric'
                            })}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          {editingRole === user._id ? (
                            <select
                              value={selectedRole}
                              onChange={(e) => setSelectedRole(e.target.value)}
                              className="block w-full pl-3 pr-8 py-2 text-sm text-black border-gray-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 rounded-md shadow-sm"
                            >
                              <option value="user">User</option>
                              <option value="admin">Admin</option>
                            </select>
                          ) : (
                            <span className={`px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full 
                              ${user.role === 'admin' ? 'bg-indigo-100 text-indigo-800' : 'bg-gray-100 text-gray-800'}`}>
                              {user.role.charAt(0).toUpperCase() + user.role.slice(1)}
                            </span>
                          )}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-black text-right text-sm font-medium">
                          {editingRole === user._id ? (
                            <div className="flex justify-end space-x-2">
                              <button
                                onClick={() => handleRoleChange(user._id)}
                                disabled={updatingRole === user._id || selectedRole === user.role}
                                className={`p-2 rounded-md ${updatingRole === user._id ? 'bg-gray-100 text-black cursor-not-allowed' : 'bg-green-100 text-black hover:bg-green-200'}`}
                                title="Save"
                              >
                                {updatingRole === user._id ? (
                                  <div className="animate-spin h-4 w-4 border-t-2 border-b-2 border-green-500 rounded-full"></div>
                                ) : (
                                  <FiCheck className="h-4 w-4" />
                                )}
                              </button>
                              <button
                                onClick={cancelEditing}
                                disabled={updatingRole === user._id}
                                className="p-2 rounded-md bg-red-100 text-red-700 hover:bg-red-200"
                                title="Cancel"
                              >
                                <FiX className="h-4 w-4" />
                              </button>
                            </div>
                          ) : (
                            <button
                              onClick={() => startEditing(user._id, user.role)}
                              className="p-2 rounded-md bg-blue-100 text-blue-700 hover:bg-blue-200"
                              title="Edit Role"
                            >
                              <FiEdit className="h-4 w-4" />
                            </button>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div className="flex items-center justify-between px-6 py-4 bg-gray-50 border-t border-gray-200">
                <div className="text-sm text-gray-600">
                  Showing <span className="font-medium">{(currentPage - 1) * usersPerPage + 1}</span> to{' '}
                  <span className="font-medium">{Math.min(currentPage * usersPerPage, totalUsers)}</span> of{' '}
                  <span className="font-medium">{totalUsers}</span> users
                </div>
                <div className="flex space-x-2">
                  <button
                    onClick={() => onPageChange(currentPage - 1)}
                    disabled={currentPage === 1}
                    className={`flex items-center px-3 py-1 rounded-md ${currentPage === 1 ? 'bg-gray-200 text-gray-400 cursor-not-allowed' : 'bg-white text-indigo-600 hover:bg-indigo-50 border border-gray-300'}`}
                  >
                    <FiChevronLeft className="mr-1" /> Previous
                  </button>
                  <button
                    onClick={() => onPageChange(currentPage + 1)}
                    disabled={currentPage * usersPerPage >= totalUsers}
                    className={`flex items-center px-3 py-1 rounded-md ${currentPage * usersPerPage >= totalUsers ? 'bg-gray-200 text-gray-400 cursor-not-allowed' : 'bg-white text-indigo-600 hover:bg-indigo-50 border border-gray-300'}`}
                  >
                    Next <FiChevronRight className="ml-1" />
                  </button>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default UsersDashboard;