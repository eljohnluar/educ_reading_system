import React, { useState, useEffect } from 'react'
import { useAuth } from '../../context/AuthContext'
import { adminService } from '../../services/adminService'
import { supabase } from '../../lib/supabase'
import toast from 'react-hot-toast'
import { Link } from 'react-router-dom'
import { Users, CheckCircle, Target, Star, LogIn, UserCog, BarChart3, RefreshCw, TrendingUp, Clock } from 'lucide-react'

export default function AdminDashboard() {
  const { profile } = useAuth()
  const [stats, setStats] = useState(null)
  const [recentActivity, setRecentActivity] = useState([])
  const [topPerformers, setTopPerformers] = useState([])
  const [loading, setLoading] = useState(true)
  const [isRefreshing, setIsRefreshing] = useState(false)

  useEffect(() => {
    fetchDashboardData()
  }, [])

  const fetchDashboardData = async (showToast = false) => {
    try {
      if (!showToast) setLoading(true)
      setIsRefreshing(true)

      const statsData = await adminService.getDashboardStats()
      setStats(statsData)

      const activity = await adminService.getActivityLogs(10)
      setRecentActivity(activity || [])

      const { data, error } = await supabase
        .from('leaderboard')
        .select('*')
        .limit(5)

      if (!error) {
        setTopPerformers(data || [])
      }

      if (showToast) {
        toast.success('Dashboard refreshed!')
      }
    } catch (error) {
      console.error('Error fetching dashboard data:', error)
      toast.error('Failed to load dashboard data')
    } finally {
      setLoading(false)
      setIsRefreshing(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-[400px]">
        <div className="animate-spin rounded-full h-10 w-10 border-2 border-gold border-t-transparent"></div>
      </div>
    )
  }

  const statCards = [
    { 
      label: 'Total Users', 
      value: stats?.total_users || 0, 
      icon: Users,
      color: '#6366f1'
    },
    { 
      label: 'Completions', 
      value: stats?.total_completions || 0, 
      icon: CheckCircle,
      color: '#22c55e'
    },
    { 
      label: 'Avg Score', 
      value: stats?.avg_score || 0, 
      icon: Target,
      color: '#f59e0b'
    },
    { 
      label: 'Perfect Scores', 
      value: stats?.perfect_scores || 0, 
      icon: Star,
      color: '#eab308'
    },
    { 
      label: "Today's Logins", 
      value: stats?.today_logins || 0, 
      icon: LogIn,
      color: '#3b82f6'
    },
  ]

  return (
    <div className="max-w-7xl mx-auto px-4 py-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-dark">
            Welcome back, {profile?.username || 'Admin'}
          </h1>
          <p className="text-sm text-light mt-1">
            Monitor your platform's performance
          </p>
        </div>
        <button
          onClick={() => fetchDashboardData(true)}
          disabled={isRefreshing}
          className="flex items-center gap-2 px-4 py-2 bg-white rounded-lg text-sm font-medium text-dark border border-gray-200 hover:bg-gray-50 transition-all disabled:opacity-50"
        >
          <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin' : ''}`} />
          {isRefreshing ? 'Refreshing...' : 'Refresh'}
        </button>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
        {statCards.map((stat) => (
          <div
            key={stat.label}
            className="bg-white rounded-xl p-5 text-center shadow-sm border border-gray-100"
          >
            <stat.icon className="w-6 h-6 mx-auto mb-2" style={{ color: stat.color }} />
            <p className="text-2xl font-bold text-dark">{stat.value}</p>
            <p className="text-xs text-light font-medium mt-0.5">{stat.label}</p>
          </div>
        ))}
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Activity */}
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-base font-bold text-dark">Recent Activity</h2>
              <p className="text-xs text-light">Latest actions on the platform</p>
            </div>
            <Link
              to="/admin/activity"
              className="text-xs font-medium text-gold hover:underline"
            >
              View all →
            </Link>
          </div>
          <div className="space-y-3">
            {recentActivity.length === 0 ? (
              <p className="text-sm text-light text-center py-6">No recent activity</p>
            ) : (
              recentActivity.slice(0, 5).map((activity) => (
                <div
                  key={activity.id}
                  className="flex items-center justify-between py-2 border-b border-gray-50 last:border-0"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <span className="text-base">
                      {activity.action_type === 'login' ? '🔑' :
                       activity.action_type === 'register' ? '📝' :
                       activity.action_type === 'level_complete' ? '🏆' :
                       '📌'}
                    </span>
                    <div className="min-w-0">
                      <p className="text-sm font-medium text-dark truncate">
                        {activity.profiles?.username || 'Unknown'}
                      </p>
                      <p className="text-xs text-light truncate">
                        {activity.action}
                      </p>
                    </div>
                  </div>
                  <span className="text-xs text-light whitespace-nowrap ml-4">
                    {new Date(activity.created_at).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                  </span>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Top Performers */}
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-base font-bold text-dark">Top Performers</h2>
              <p className="text-xs text-light">Highest scores on the leaderboard</p>
            </div>
            <Link
              to="/leadership"
              className="text-xs font-medium text-gold hover:underline"
            >
              View all →
            </Link>
          </div>
          <div className="space-y-3">
            {topPerformers.length === 0 ? (
              <p className="text-sm text-light text-center py-6">No data yet</p>
            ) : (
              topPerformers.slice(0, 5).map((user, index) => (
                <div
                  key={user.user_id}
                  className="flex items-center justify-between py-2 border-b border-gray-50 last:border-0"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <span className={`text-sm font-bold w-6 text-center ${
                      index === 0 ? 'text-yellow-500' :
                      index === 1 ? 'text-gray-400' :
                      index === 2 ? 'text-amber-600' :
                      'text-gray-400'
                    }`}>
                      #{index + 1}
                    </span>
                    <div className="min-w-0">
                      <p className="text-sm font-medium text-dark truncate">
                        {user.username}
                      </p>
                      <p className="text-xs text-light">
                        {user.completed_levels || 0} levels
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-bold text-gold">
                      {user.total_score || 0}
                    </p>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
        <h3 className="text-sm font-bold text-dark mb-4">Quick Actions</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <Link
            to="/admin/users"
            className="flex items-center gap-3 px-4 py-3 bg-gray-50 hover:bg-cream rounded-lg transition-all"
          >
            <UserCog className="w-5 h-5 text-gold" />
            <span className="text-sm font-medium text-dark">Manage Users</span>
          </Link>
          <Link
            to="/admin/statistics"
            className="flex items-center gap-3 px-4 py-3 bg-gray-50 hover:bg-cream rounded-lg transition-all"
          >
            <BarChart3 className="w-5 h-5 text-gold" />
            <span className="text-sm font-medium text-dark">View Statistics</span>
          </Link>
        </div>
      </div>

      {/* Footer Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="bg-white rounded-xl px-4 py-3 text-center shadow-sm border border-gray-100">
          <p className="text-xl font-bold text-dark">{stats?.admin_count || 0}</p>
          <p className="text-xs text-light">Admins</p>
        </div>
        <div className="bg-white rounded-xl px-4 py-3 text-center shadow-sm border border-gray-100">
          <p className="text-xl font-bold text-dark">{stats?.user_count || 0}</p>
          <p className="text-xs text-light">Users</p>
        </div>
        <div className="bg-white rounded-xl px-4 py-3 text-center shadow-sm border border-gray-100">
          <p className="text-xl font-bold text-dark">{stats?.passing_scores || 0}</p>
          <p className="text-xs text-light">Passing Scores</p>
        </div>
        <div className="bg-white rounded-xl px-4 py-3 text-center shadow-sm border border-gray-100">
          <p className="text-xl font-bold text-dark">{stats?.today_feedback || 0}</p>
          <p className="text-xs text-light">Feedback Today</p>
        </div>
      </div>
    </div>
  )
}