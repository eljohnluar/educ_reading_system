import React, { useState, useEffect } from 'react'
import { adminService } from '../../services/adminService'
import { supabase } from '../../lib/supabase'
import { motion, AnimatePresence } from 'framer-motion'
import toast from 'react-hot-toast'

export default function ActivityLog() {
  const [activities, setActivities] = useState([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState('all')
  const [searchTerm, setSearchTerm] = useState('')
  const [isResetting, setIsResetting] = useState(false)
  const [showResetModal, setShowResetModal] = useState(false)

  useEffect(() => {
    fetchActivities()
  }, [])

  const fetchActivities = async () => {
    try {
      setLoading(true)
      const data = await adminService.getActivityLogs(200)
      setActivities(data || [])
    } catch (error) {
      console.error('Error fetching activities:', error)
      toast.error('Failed to load activity logs')
    } finally {
      setLoading(false)
    }
  }

  // ✅ Reset Activity Log
  const resetActivityLog = async () => {
    setIsResetting(true)
    setShowResetModal(false)

    try {
      // ✅ Delete all records from user_activity_log table
      const { error } = await supabase
        .from('user_activity_log')
        .delete()
        .neq('id', '00000000-0000-0000-0000-000000000000')

      if (error) throw error

      toast.success('🗑️ Activity log has been reset successfully!')
      
      // ✅ Refresh the activity list
      await fetchActivities()
      
    } catch (error) {
      console.error('Error resetting activity log:', error)
      toast.error('Failed to reset activity log. Please try again.')
    } finally {
      setIsResetting(false)
    }
  }

  const getActionIcon = (actionType) => {
    const icons = {
      'login': '🔑',
      'logout': '🚪',
      'register': '📝',
      'verify': '✅',
      'reset': '🔄',
      'profile_update': '✏️',
      'quiz_start': '📝',
      'quiz_complete': '📊',
      'level_start': '🚀',
      'level_complete': '🏆',
      'story_read': '📖'
    }
    return icons[actionType] || '📌'
  }

  const getActionColor = (actionType) => {
    const colors = {
      'login': 'text-blue-700 bg-blue-100',
      'logout': 'text-blue-700 bg-blue-100',
      'register': 'text-green-700 bg-green-100',
      'verify': 'text-purple-700 bg-purple-100',
      'reset': 'text-yellow-700 bg-yellow-100',
      'profile_update': 'text-indigo-700 bg-indigo-100',
      'quiz_start': 'text-orange-700 bg-orange-100',
      'quiz_complete': 'text-emerald-700 bg-emerald-100',
      'level_start': 'text-cyan-700 bg-cyan-100',
      'level_complete': 'text-amber-700 bg-amber-100',
      'story_read': 'text-pink-700 bg-pink-100'
    }
    return colors[actionType] || 'text-gray-700 bg-gray-100'
  }

  const filteredActivities = activities.filter(activity => {
    const matchesFilter = filter === 'all' || activity.action_type === filter
    const matchesSearch = 
      activity.profiles?.username?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      activity.action?.toLowerCase().includes(searchTerm.toLowerCase())
    return matchesFilter && matchesSearch
  })

  const actionTypes = [...new Set(activities.map(a => a.action_type).filter(Boolean))]

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
        <h1 className="text-3xl font-bold text-dark"> Activity Log</h1>
        <div className="flex items-center gap-3">
          <span className="text-sm text-gray-500">{activities.length} total entries</span>
          {/* ✅ Reset Button */}
          <button
            onClick={() => setShowResetModal(true)}
            disabled={isResetting || activities.length === 0}
            className={`px-4 py-2 rounded-lg font-semibold text-sm transition-all ${
              isResetting || activities.length === 0
                ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                : 'bg-red-500 text-white hover:bg-red-600 shadow-md hover:shadow-lg'
            }`}
          >
            {isResetting ? (
              <span className="flex items-center gap-2">
                <svg className="animate-spin h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Resetting...
              </span>
            ) : (
              ' Reset Log'
            )}
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl shadow-md p-4">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1">
            <input
              type="text"
              placeholder="Search by username or action..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gold focus:border-transparent outline-none"
            />
          </div>
          <div className="flex gap-2 flex-wrap">
            <button
              onClick={() => setFilter('all')}
              className={`px-3 py-1 rounded-lg text-sm transition-all ${
                filter === 'all'
                  ? 'bg-gold text-white shadow-md'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              All
            </button>
            {actionTypes.map((type) => (
              <button
                key={type}
                onClick={() => setFilter(type)}
                className={`px-3 py-1 rounded-lg text-sm transition-all capitalize ${
                  filter === type
                    ? 'bg-gold text-white shadow-md'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                {(type || '').replace('_', ' ')}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Activity Table */}
      <div className="bg-white rounded-xl shadow-md overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-cream">
              <tr>
                <th className="px-6 py-3 text-left text-sm font-semibold text-dark">User</th>
                <th className="px-6 py-3 text-left text-sm font-semibold text-dark">Action</th>
                <th className="px-6 py-3 text-left text-sm font-semibold text-dark">Type</th>
                <th className="px-6 py-3 text-left text-sm font-semibold text-dark">Time</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filteredActivities.length === 0 ? (
                <tr>
                  <td colSpan={4} className="px-6 py-8 text-center text-gray-500">
                    {activities.length === 0 && !loading ? (
                      <div className="flex flex-col items-center gap-2">
                        <span className="text-4xl">📭</span>
                        <span>Activity log is empty</span>
                      </div>
                    ) : (
                      'No activities found'
                    )}
                  </td>
                </tr>
              ) : (
                filteredActivities.map((activity, index) => (
                  <motion.tr
                    key={activity.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.01 }}
                    className="hover:bg-cream transition-colors"
                  >
                    <td className="px-6 py-4">
                      <span className="font-medium text-dark">
                        {activity.profiles?.username || 'Unknown User'}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center space-x-2">
                        <span className="text-lg">{getActionIcon(activity.action_type)}</span>
                        <span className="text-sm text-gray-700">{activity.action}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`text-xs font-medium px-2 py-1 rounded-full capitalize ${getActionColor(activity.action_type)}`}>
                        {(activity.action_type || 'unknown').replace('_', ' ')}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-500">
                      {new Date(activity.created_at).toLocaleString()}
                    </td>
                  </motion.tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
        <div className="bg-white rounded-xl shadow-md p-3">
          <p className="text-xl font-bold text-gold">{filteredActivities.length}</p>
          <p className="text-xs text-gray-500">Filtered Entries</p>
        </div>
        <div className="bg-white rounded-xl shadow-md p-3">
          <p className="text-xl font-bold text-blue-500">
            {activities.filter(a => a.action_type === 'login').length}
          </p>
          <p className="text-xs text-gray-500">Logins</p>
        </div>
        <div className="bg-white rounded-xl shadow-md p-3">
          <p className="text-xl font-bold text-green-500">
            {activities.filter(a => a.action_type === 'level_complete').length}
          </p>
          <p className="text-xs text-gray-500">Level Completions</p>
        </div>
        <div className="bg-white rounded-xl shadow-md p-3">
          <p className="text-xl font-bold text-purple-500">
            {activities.filter(a => a.action_type === 'register').length}
          </p>
          <p className="text-xs text-gray-500">Registrations</p>
        </div>
      </div>

      {/* ✅ Reset Confirmation Modal */}
      <AnimatePresence>
        {showResetModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6"
            >
              {/* Modal Header */}
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 rounded-full bg-red-100 flex items-center justify-center text-2xl">
                  ⚠️
                </div>
                <div>
                  <h2 className="text-xl font-bold text-dark">Reset Activity Log</h2>
                  <p className="text-sm text-gray-500">This action cannot be undone</p>
                </div>
              </div>

              {/* Modal Body */}
              <div className="mb-6">
                <p className="text-gray-600">
                  Are you sure you want to delete all <strong>{activities.length}</strong> activity log entries?
                </p>
                <div className="mt-3 p-3 bg-red-50 rounded-lg border border-red-200">
                  <p className="text-sm text-red-600 flex items-center gap-2">
                    <span>🚨</span>
                    This will permanently remove all activity records.
                  </p>
                </div>
              </div>

              {/* Modal Actions */}
              <div className="flex gap-3">
                <button
                  onClick={() => setShowResetModal(false)}
                  className="flex-1 px-4 py-2.5 bg-gray-100 text-gray-700 rounded-lg font-semibold hover:bg-gray-200 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={resetActivityLog}
                  disabled={isResetting}
                  className={`flex-1 px-4 py-2.5 rounded-lg font-semibold text-white transition-colors ${
                    isResetting
                      ? 'bg-gray-400 cursor-not-allowed'
                      : 'bg-red-500 hover:bg-red-600'
                  }`}
                >
                  {isResetting ? (
                    <span className="flex items-center justify-center gap-2">
                      <svg className="animate-spin h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Resetting...
                    </span>
                  ) : (
                    'Yes, Reset Everything'
                  )}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  )
}