import React, { useState, useEffect } from 'react'
import { adminService } from '../../services/adminService'
import { motion } from 'framer-motion'
import toast from 'react-hot-toast'

export default function ActivityLog() {
  const [activities, setActivities] = useState([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState('all')
  const [searchTerm, setSearchTerm] = useState('')

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
      'login': 'text-blue-500',
      'logout': 'text-gray-500',
      'register': 'text-green-500',
      'verify': 'text-purple-500',
      'reset': 'text-yellow-500',
      'profile_update': 'text-indigo-500',
      'quiz_start': 'text-orange-500',
      'quiz_complete': 'text-green-500',
      'level_start': 'text-cyan-500',
      'level_complete': 'text-gold',
      'story_read': 'text-pink-500'
    }
    return colors[actionType] || 'text-gray-500'
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
        <h1 className="text-3xl font-bold text-dark">📋 Activity Log</h1>
        <span className="text-sm text-gray-500">{activities.length} total entries</span>
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
                    No activities found
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
                    {/* ✅ Removed image, just showing username */}
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
                      <span className={`text-xs font-medium px-2 py-1 rounded-full capitalize ${getActionColor(activity.action_type)} bg-gray-100`}>
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
    </div>
  )
}