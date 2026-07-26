import React, { useState, useEffect } from 'react'
import { adminService } from '../../services/adminService'
import { supabase } from '../../lib/supabase'
import { motion } from 'framer-motion'
import toast from 'react-hot-toast'
import { Users, Search, Eye, Trash2, X, CheckCircle2, XCircle } from 'lucide-react'

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
        .rpc('delete_user_by_admin', { p_user_id: userId })
      
      if (error) throw error
      toast.success('User deleted successfully')
      fetchUsers()
    } catch (error) {
      console.error('Error deleting user:', error)
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
        <h1 className="text-3xl font-extrabold text-dark flex items-center gap-2">
          <Users className="w-8 h-8 text-[#C8A970]" /> User Management
        </h1>
        <span className="text-xs font-semibold bg-amber-50 text-amber-800 border border-amber-200 px-3 py-1 rounded-full">
          {users.length} total users
        </span>
      </div>

      {/* Search */}
      <div className="bg-white/95 backdrop-blur-md rounded-2xl shadow-xl p-4 border border-white/30 relative">
        <div className="relative">
          <Search className="w-5 h-5 text-gray-400 absolute left-4 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search by username or email..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-11 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#E9D2A9] focus:bg-white focus:border-transparent outline-none text-sm transition-all"
          />
        </div>
      </div>

      {/* User Table */}
      <div className="bg-white/95 backdrop-blur-md rounded-2xl shadow-xl overflow-hidden border border-white/30">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-[#1A2634] text-[#E9D2A9]">
              <tr>
                <th className="px-6 py-4 text-left text-xs font-bold uppercase tracking-wider">User</th>
                <th className="px-6 py-4 text-left text-xs font-bold uppercase tracking-wider">Email</th>
                <th className="px-6 py-4 text-left text-xs font-bold uppercase tracking-wider">Role</th>
                <th className="px-6 py-4 text-left text-xs font-bold uppercase tracking-wider">Joined</th>
                <th className="px-6 py-4 text-left text-xs font-bold uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filteredUsers.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center text-gray-400 font-medium">
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
                    className="hover:bg-[#E9D2A9]/10 transition-colors"
                  >
                    <td className="px-6 py-4">
                      <div className="flex items-center space-x-3">
                        <span className="font-semibold text-gray-900">{user.username}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-gray-600 text-sm">{user.email}</td>
                    <td className="px-6 py-4">
                      <span className={`px-2.5 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${
                        user.role === 'admin' 
                          ? 'bg-purple-100 text-purple-800 border border-purple-200' 
                          : 'bg-blue-100 text-blue-800 border border-blue-200'
                      }`}>
                        {user.role}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-500">
                      {new Date(user.created_at).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex space-x-2">
                        <button
                          onClick={() => handleViewUser(user.id)}
                          className="inline-flex items-center gap-1 px-3 py-1 text-xs font-semibold text-[#1A2634] bg-[#E9D2A9] hover:bg-[#d4b988] rounded-lg transition-all shadow-sm"
                        >
                          <Eye className="w-3.5 h-3.5" /> View
                        </button>
                        <button
                          onClick={() => handleDeleteUser(user.id)}
                          className="inline-flex items-center gap-1 px-3 py-1 text-xs font-semibold text-red-600 bg-red-50 hover:bg-red-600 hover:text-white rounded-lg transition-all"
                        >
                          <Trash2 className="w-3.5 h-3.5" /> Delete
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
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-90vh overflow-y-auto p-6 border border-gray-100">
            <div className="flex items-center justify-between mb-6 pb-3 border-b border-gray-100">
              <h2 className="text-xl font-bold text-gray-900">User Details</h2>
              <button
                onClick={() => setShowUserDetail(false)}
                className="text-gray-400 hover:text-gray-700 p-1 rounded-lg transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4">
              <div className="flex items-center space-x-4">
                <div>
                  <p className="text-xl font-bold text-gray-900">{selectedUser.username}</p>
                  <p className="text-gray-500 text-sm">{selectedUser.email}</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="bg-gray-50 rounded-xl p-3.5 border border-gray-100">
                  <p className="text-xs text-gray-400 uppercase font-semibold">Role</p>
                  <p className="font-semibold text-gray-800 capitalize mt-0.5">{selectedUser.role}</p>
                </div>
                <div className="bg-gray-50 rounded-xl p-3.5 border border-gray-100">
                  <p className="text-xs text-gray-400 uppercase font-semibold">Member Since</p>
                  <p className="font-semibold text-gray-800 mt-0.5">
                    {new Date(selectedUser.created_at).toLocaleDateString()}
                  </p>
                </div>
                <div className="bg-gray-50 rounded-xl p-3.5 border border-gray-100">
                  <p className="text-xs text-gray-400 uppercase font-semibold">Last Login</p>
                  <p className="font-semibold text-gray-800 mt-0.5">
                    {selectedUser.last_login 
                      ? new Date(selectedUser.last_login).toLocaleDateString()
                      : 'Never'}
                  </p>
                </div>
                <div className="bg-gray-50 rounded-xl p-3.5 border border-gray-100">
                  <p className="text-xs text-gray-400 uppercase font-semibold">Email Verified</p>
                  <p className="font-semibold text-gray-800 flex items-center gap-1 mt-0.5">
                    {selectedUser.email_verified ? (
                      <span className="text-emerald-600 flex items-center gap-1"><CheckCircle2 className="w-4 h-4" /> Yes</span>
                    ) : (
                      <span className="text-rose-500 flex items-center gap-1"><XCircle className="w-4 h-4" /> No</span>
                    )}
                  </p>
                </div>
              </div>

              <button
                onClick={() => setShowUserDetail(false)}
                className="w-full py-3 bg-[#1A2634] text-[#E9D2A9] font-bold rounded-xl hover:bg-[#2C3E50] transition-all shadow-md mt-4"
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