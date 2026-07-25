import React, { useState, useEffect } from 'react'
import { useAuth } from '../../context/AuthContext'
import { adminService } from '../../services/adminService'
import { supabase } from '../../lib/supabase'
import { motion } from 'framer-motion'
import toast from 'react-hot-toast'
import { Link } from 'react-router-dom'

export default function AdminDashboard() {
  const { profile } = useAuth()
  const [stats, setStats] = useState(null)
  const [recentActivity, setRecentActivity] = useState([])
  const [topPerformers, setTopPerformers] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchDashboardData()
  }, [])

  const fetchDashboardData = async () => {
    try {
      setLoading(true)
      
      // Fetch dashboard stats
      const statsData = await adminService.getDashboardStats()
      setStats(statsData)

      // Fetch recent activity
      const activity = await adminService.getActivityLogs(10)
      setRecentActivity(activity || [])

      // Fetch top performers from leaderboard
      const { data, error } = await supabase
        .from('leaderboard')
        .select('*')
        .limit(5)
      
      if (!error) {
        setTopPerformers(data || [])
      }

    } catch (error) {
      console.error('Error fetching dashboard data:', error)
      toast.error('Failed to load dashboard data')
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gold"></div>
      </div>
    )
  }

  // ✅ Fixed: Complete statCards array
  const statCards = [
    { 
      label: 'Total Users', 
      value: stats?.total_users || 0, 
      icon: '👥', 
      color: 'bg-blue-100 text-blue-600' 
    },
    { 
      label: 'Levels Completed', 
      value: stats?.total_completions || 0, 
      icon: '🏆', 
      color: 'bg-green-100 text-green-600' 
    },
    { 
      label: 'Average Score', 
      value: stats?.avg_score || 0, 
      icon: '📊', 
      color: 'bg-purple-100 text-purple-600' 
    },
    { 
      label: 'Perfect Scores', 
      value: stats?.perfect_scores || 0, 
      icon: '⭐', 
      color: 'bg-yellow-100 text-yellow-600' 
    },
    { 
      label: 'Today\'s Logins', 
      value: stats?.today_logins || 0, 
      icon: '🔑', 
      color: 'bg-indigo-100 text-indigo-600' 
    }
    // ✅ Added closing bracket
  ]

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-dark">Admin Dashboard</h1>
          <p className="text-gray-500 mt-1">
            Welcome back, {profile?.username || 'Admin'}! Here's your overview.
          </p>
        </div>
        <button
          onClick={fetchDashboardData}
          className="px-4 py-2 bg-gold text-white rounded-lg hover:bg-amber-500 transition-all"
        >
          🔄 Refresh
        </button>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
        {statCards.map((stat, index) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.05 }}
            className="bg-white rounded-xl shadow-md p-4 text-center hover:shadow-lg transition-all"
          >
            <div className={`w-12 h-12 rounded-full ${stat.color} flex items-center justify-center mx-auto mb-2 text-2xl`}>
              {stat.icon}
            </div>
            <p className="text-2xl font-bold text-dark">{stat.value}</p>
            <p className="text-xs text-gray-500">{stat.label}</p>
          </motion.div>
        ))}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Recent Activity */}
        <div className="bg-white rounded-xl shadow-md p-6">
          <h2 className="text-lg font-bold text-dark mb-4">Recent Activity</h2>
          <div className="space-y-3 max-h-80 overflow-y-auto">
            {recentActivity.length === 0 ? (
              <p className="text-gray-500 text-center py-4">No recent activity</p>
            ) : (
              recentActivity.map((activity) => (
                <div key={activity.id} className="flex items-center space-x-3 p-2 hover:bg-cream rounded-lg transition-colors">
                  <div className="flex-shrink-0 w-8 h-8 rounded-full bg-gold bg-opacity-20 flex items-center justify-center text-sm">
                    {activity.action_type === 'login' ? '🔑' :
                     activity.action_type === 'register' ? '📝' :
                     activity.action_type === 'level_complete' ? '🏆' :
                     '📌'}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-dark truncate">
                      {activity.profiles?.username || 'Unknown User'}
                    </p>
                    <p className="text-xs text-gray-500 truncate">{activity.action}</p>
                  </div>
                  <span className="text-xs text-gray-400 whitespace-nowrap">
                    {new Date(activity.created_at).toLocaleDateString()}
                  </span>
                </div>
              ))
            )}
          </div>
          <Link
            to="/admin/activity"
            className="block mt-4 text-center text-sm text-gold hover:underline"
          >
            View all activity →
          </Link>
        </div>

        {/* Top Performers */}
        <div className="bg-white rounded-xl shadow-md p-6">
          <h2 className="text-lg font-bold text-dark mb-4">🏆 Top Performers</h2>
          <div className="space-y-3 max-h-80 overflow-y-auto">
            {topPerformers.length === 0 ? (
              <p className="text-gray-500 text-center py-4">No data yet</p>
            ) : (
              topPerformers.map((user, index) => (
                <div key={user.user_id} className="flex items-center space-x-3 p-2 hover:bg-cream rounded-lg transition-colors">
                  <span className={`font-bold w-6 ${
                    index === 0 ? 'text-yellow-500' :
                    index === 1 ? 'text-gray-400' :
                    index === 2 ? 'text-amber-600' :
                    'text-gray-500'
                  }`}>
                    #{index + 1}
                  </span>
                  <img
                    src={user.avatar_url || '/assets/images/avatars/default.jpg'}
                    alt={user.username}
                    className="w-8 h-8 rounded-full object-cover"
                    onError={(e) => {
                      e.target.src = '/assets/images/avatars/default.jpg'
                    }}
                  />
                  <div className="flex-1">
                    <p className="text-sm font-medium text-dark">{user.username}</p>
                    <p className="text-xs text-gray-500">
                      {user.completed_levels || 0} levels • {user.total_score || 0} pts
                    </p>
                  </div>
                  <span className="text-sm font-bold text-gold">{user.total_score || 0}</span>
                </div>
              ))
            )}
          </div>
          <Link
            to="/leadership"
            className="block mt-4 text-center text-sm text-gold hover:underline"
          >
            View full leaderboard →
          </Link>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-2 md:grid-cols-2 gap-4">
        <Link
          to="/admin/users"
          className="bg-white rounded-xl shadow-md p-4 text-center hover:shadow-lg transition-all hover:bg-cream"
        >
          <div className="text-3xl mb-2">👥</div>
          <p className="text-sm font-medium text-dark">Manage Users</p>
        </Link>
        <Link
          to="/admin/statistics"
          className="bg-white rounded-xl shadow-md p-4 text-center hover:shadow-lg transition-all hover:bg-cream"
        >
          <div className="text-3xl mb-2">📈</div>
          <p className="text-sm font-medium text-dark">Statistics</p>
        </Link>
      </div>
    </div>
  )
}