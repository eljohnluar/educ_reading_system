import React, { useState, useEffect } from 'react'
import { adminService } from '../../services/adminService'
import { supabase } from '../../lib/supabase'
import { motion } from 'framer-motion'
import toast from 'react-hot-toast'

export default function UserManagement() {
  const [users, setUsers] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedUser, setSelectedUser] = useState(null)
  const [showUserDetail, setShowUserDetail] = useState(false)

  useEffect(() => {
    fetchUsers()
  }, [])

  const fetchUsers = async () => {
    try {
      setLoading(true)
      const data = await adminService.getUsers(100)
      setUsers(data || [])
    } catch (error) {
      console.error('Error fetching users:', error)
      toast.error('Failed to load users')
    } finally {
      setLoading(false)
    }
  }

  const filteredUsers = users.filter(user =>
    user.username?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.email?.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const handleRoleUpdate = async (userId, newRole) => {
    try {
      await adminService.updateUserRole(userId, newRole)
      toast.success(`User role updated to ${newRole}`)
      fetchUsers()
    } catch (error) {
      toast.error('Failed to update user role')
    }
  }

  const handleViewUser = async (userId) => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single()
      
      if (error) throw error
      setSelectedUser(data)
      setShowUserDetail(true)
    } catch (error) {
      console.error('Error fetching user:', error)
      toast.error('Failed to load user details')
    }
  }

  const handleDeleteUser = async (userId) => {
    if (!confirm('Are you sure you want to delete this user? This action cannot be undone.')) {
      return
    }

    try {
      const { error } = await supabase
        .from('profiles')
        .delete()
        .eq('id', userId)
      
      if (error) throw error
      toast.success('User deleted successfully')
      fetchUsers()
    } catch (error) {
      toast.error('Failed to delete user')
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gold"></div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-dark">👥 User Management</h1>
        <span className="text-sm text-gray-500">{users.length} total users</span>
      </div>

      {/* Search */}
      <div className="bg-white rounded-xl shadow-md p-4">
        <input
          type="text"
          placeholder="Search by username or email..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gold focus:border-transparent outline-none"
        />
      </div>

      {/* User Table */}
      <div className="bg-white rounded-xl shadow-md overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-cream">
              <tr>
                <th className="px-6 py-3 text-left text-sm font-semibold text-dark">User</th>
                <th className="px-6 py-3 text-left text-sm font-semibold text-dark">Email</th>
                <th className="px-6 py-3 text-left text-sm font-semibold text-dark">Role</th>
                <th className="px-6 py-3 text-left text-sm font-semibold text-dark">Joined</th>
                <th className="px-6 py-3 text-left text-sm font-semibold text-dark">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filteredUsers.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-8 text-center text-gray-500">
                    No users found
                  </td>
                </tr>
              ) : (
                filteredUsers.map((user, index) => (
                  <motion.tr
                    key={user.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.02 }}
                    className="hover:bg-cream transition-colors"
                  >
                    <td className="px-6 py-4">
                      <div className="flex items-center space-x-3">
                        <img
                          src={user.avatar_url || '/assets/images/avatars/default.jpg'}
                          alt={user.username}
                          className="w-8 h-8 rounded-full object-cover"
                          onError={(e) => {
                            e.target.src = '/assets/images/avatars/default.jpg'
                          }}
                        />
                        <span className="font-medium text-dark">{user.username}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-gray-600">{user.email}</td>
                    <td className="px-6 py-4">
                      <select
                        value={user.role}
                        onChange={(e) => handleRoleUpdate(user.id, e.target.value)}
                        className={`px-2 py-1 rounded text-sm font-medium border-0 focus:ring-2 focus:ring-gold ${
                          user.role === 'admin' 
                            ? 'bg-purple-100 text-purple-700' 
                            : 'bg-blue-100 text-blue-700'
                        }`}
                      >
                        <option value="user">User</option>
                        <option value="admin">Admin</option>
                      </select>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-500">
                      {new Date(user.created_at).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex space-x-2">
                        <button
                          onClick={() => handleViewUser(user.id)}
                          className="text-blue-600 hover:text-blue-800 text-sm"
                        >
                          View
                        </button>
                        <button
                          onClick={() => handleDeleteUser(user.id)}
                          className="text-red-600 hover:text-red-800 text-sm"
                        >
                          Delete
                        </button>
                      </div>
                    </td>
                  </motion.tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* User Detail Modal */}
      {showUserDetail && selectedUser && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-2xl w-full max-h-90vh overflow-y-auto p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-dark">User Details</h2>
              <button
                onClick={() => setShowUserDetail(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                ✕
              </button>
            </div>

            <div className="space-y-4">
              <div className="flex items-center space-x-4">
                <img
                  src={selectedUser.avatar_url || '/assets/images/avatars/default.jpg'}
                  alt={selectedUser.username}
                  className="w-16 h-16 rounded-full object-cover border-2 border-gold"
                  onError={(e) => {
                    e.target.src = '/assets/images/avatars/default.jpg'
                  }}
                />
                <div>
                  <p className="text-xl font-bold text-dark">{selectedUser.username}</p>
                  <p className="text-gray-500">{selectedUser.email}</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="bg-cream rounded-lg p-3">
                  <p className="text-sm text-gray-500">Role</p>
                  <p className="font-medium capitalize">{selectedUser.role}</p>
                </div>
                <div className="bg-cream rounded-lg p-3">
                  <p className="text-sm text-gray-500">Member Since</p>
                  <p className="font-medium">
                    {new Date(selectedUser.created_at).toLocaleDateString()}
                  </p>
                </div>
                <div className="bg-cream rounded-lg p-3">
                  <p className="text-sm text-gray-500">Last Login</p>
                  <p className="font-medium">
                    {selectedUser.last_login 
                      ? new Date(selectedUser.last_login).toLocaleDateString()
                      : 'Never'}
                  </p>
                </div>
                <div className="bg-cream rounded-lg p-3">
                  <p className="text-sm text-gray-500">Email Verified</p>
                  <p className="font-medium">
                    {selectedUser.email_verified ? '✅ Yes' : '❌ No'}
                  </p>
                </div>
              </div>

              <button
                onClick={() => setShowUserDetail(false)}
                className="w-full py-2 bg-gold text-white rounded-lg hover:bg-amber-500 transition-all"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}