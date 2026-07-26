import React, { useState, useEffect } from 'react'
import { useAuth } from '../../context/AuthContext'
import { adminService } from '../../services/adminService'
import { supabase } from '../../lib/supabase'
import toast from 'react-hot-toast'
import { Link } from 'react-router-dom'
import { Users, CheckCircle, Target, Star, LogIn, UserCog, BarChart3, RefreshCw } from 'lucide-react'

export default function AdminDashboard() {
  const { profile } = useAuth()
  const [stats, setStats] = useState(null)
  const [recentActivity, setRecentActivity] = useState([])
  const [topPerformers, setTopPerformers] = useState([])
  const [loading, setLoading] = useState(true)
  const [isRefreshing, setIsRefreshing] = useState(false)

  useEffect(() => {
    fetchDashboardData(false)
  }, [])

  const fetchDashboardData = async (showToast = false) => {
    try {
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
        toast.success('Refreshing dashboard...')
        setTimeout(() => {
          window.location.reload()
        }, 600)
      }
    } catch (error) {
      console.error('Error fetching dashboard data:', error)
      toast.error('Failed to load dashboard data')
    } finally {
      if (!showToast) {
        setLoading(false)
        setIsRefreshing(false)
      }
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-[400px]">
        <div className="animate-spin rounded-full h-10 w-10 border-2 border-[#d4b988] border-t-transparent"></div>
      </div>
    )
  }

  const statCards = [
    { label: 'Total Users', value: stats?.total_users || 0, IconComponent: Users, color: 'text-indigo-600', bg: 'bg-indigo-50 border-indigo-100/50' },
    { label: 'Levels Completed', value: stats?.total_completions || 0, IconComponent: CheckCircle, color: 'text-emerald-600', bg: 'bg-emerald-50 border-emerald-100/50' },
    { label: 'Average Score', value: stats?.avg_score || 0, IconComponent: Target, color: 'text-amber-600', bg: 'bg-amber-50 border-amber-100/50' },
    { label: 'Perfect Scores', value: stats?.perfect_scores || 0, IconComponent: Star, color: 'text-yellow-600', bg: 'bg-yellow-50 border-yellow-100/50' },
    { label: "Today's Logins", value: stats?.today_logins || 0, IconComponent: LogIn, color: 'text-blue-600', bg: 'bg-blue-50 border-blue-100/50' },
  ]

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 space-y-8">
      {/* Premium Welcome Banner */}
      <div className="relative overflow-hidden bg-gradient-to-r from-[#1A2634] to-[#2C3E50] text-white rounded-3xl p-8 shadow-xl border border-white/5">
        <div className="absolute right-0 bottom-0 top-0 w-1/3 opacity-10 pointer-events-none">
          <svg className="w-full h-full" viewBox="0 0 100 100" preserveAspectRatio="none">
            <path d="M0 100 C 20 40, 40 60, 100 0 L 100 100 Z" fill="#E9D2A9" />
          </svg>
        </div>
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-[#E9D2A9]/10 text-[#E9D2A9] border border-[#E9D2A9]/20 mb-3">
              ⚡ System Administrator Panel
            </span>
            <h1 className="text-3xl font-extrabold tracking-tight text-white mb-2">
              Welcome back, <span className="text-[#E9D2A9]">{profile?.username || 'Admin'}</span>
            </h1>
            <p className="text-gray-300 text-sm max-w-xl">
              Monitor system performance
            </p>
          </div>
          <button
            onClick={() => fetchDashboardData(true)}
            disabled={isRefreshing}
            className="self-start md:self-auto flex items-center gap-2 px-5 py-2.5 rounded-xl bg-white/10 hover:bg-white/15 active:scale-95 text-white text-sm font-semibold border border-white/10 transition-all disabled:opacity-50"
          >
            <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin' : ''}`} />
            {isRefreshing ? 'Refreshing...' : 'Refresh Data'}
          </button>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        {statCards.map((stat) => (
          <div
            key={stat.label}
            className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm hover:shadow-md hover:-translate-y-0.5 active:translate-y-0 active:scale-[0.98] transition-all duration-300 text-center flex flex-col items-center justify-between group"
          >
            <div className={`w-12 h-12 rounded-xl ${stat.bg} border flex items-center justify-center mb-4 transition-transform duration-300 group-hover:scale-110`}>
              <stat.IconComponent className={`w-6 h-6 ${stat.color}`} />
            </div>
            <div>
              <p className="text-3xl font-extrabold text-gray-900 mb-1">
                {stat.value}
              </p>
              <p className="text-[11px] font-bold text-gray-400 uppercase tracking-wider">
                {stat.label}
              </p>
            </div>
          </div>
        ))}
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Recent Activity */}
        <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm hover:shadow-md transition-all duration-300">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-lg font-bold text-gray-900">Recent Activity</h2>
              <p className="text-xs text-gray-400">Latest actions performed on the platform</p>
            </div>
            <Link
              to="/admin/activity"
              className="text-xs font-bold text-[#d4b988] hover:text-[#c4a978] transition-colors"
            >
              View all →
            </Link>
          </div>
          <div className="space-y-4">
            {recentActivity.length === 0 ? (
              <p className="text-sm text-gray-400 text-center py-8">No recent activity recorded</p>
            ) : (
              recentActivity.slice(0, 5).map((activity) => (
                <div
                  key={activity.id}
                  className="flex items-center justify-between p-3 rounded-xl hover:bg-gray-50 transition-colors"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <span className="text-lg p-2 bg-gray-100 rounded-lg">
                      {activity.action_type === 'login' ? '🚪' :
                       activity.action_type === 'register' ? '👤' :
                       activity.action_type === 'level_complete' ? '🏆' :
                       '📌'}
                    </span>
                    <div className="min-w-0">
                      <p className="text-sm font-bold text-gray-800 truncate">
                        {activity.profiles?.username || 'Unknown'}
                      </p>
                      <p className="text-xs text-gray-500 truncate">
                        {activity.action}
                      </p>
                    </div>
                  </div>
                  <span className="text-xs text-gray-400 font-medium whitespace-nowrap ml-4">
                    {new Date(activity.created_at).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                  </span>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Top Performers */}
        <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm hover:shadow-md transition-all duration-300">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-lg font-bold text-gray-900">Top Performers</h2>
              <p className="text-xs text-gray-400">Top student achievements on the leaderboard</p>
            </div>
            <Link
              to="/leadership"
              className="text-xs font-bold text-[#d4b988] hover:text-[#c4a978] transition-colors"
            >
              View all →
            </Link>
          </div>
          <div className="space-y-4">
            {topPerformers.length === 0 ? (
              <p className="text-sm text-gray-400 text-center py-8">No performance records found</p>
            ) : (
              topPerformers.slice(0, 5).map((user, index) => (
                <div
                  key={user.user_id}
                  className="flex items-center justify-between p-3 rounded-xl hover:bg-gray-50 transition-colors"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <span className={`text-sm font-extrabold w-6 h-6 rounded-full flex items-center justify-center ${
                      index === 0 ? 'bg-amber-100 text-amber-700' :
                      index === 1 ? 'bg-slate-100 text-slate-700' :
                      index === 2 ? 'bg-orange-100 text-orange-700' :
                      'bg-gray-100 text-gray-500'
                    }`}>
                      {index + 1}
                    </span>
                    <div className="min-w-0">
                      <p className="text-sm font-bold text-gray-800 truncate">
                        {user.username}
                      </p>
                      <p className="text-xs text-gray-500">
                        {user.completed_levels || 0} levels completed
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-black text-[#d4b988]">
                      {user.total_score || 0}
                    </p>
                    <p className="text-[10px] text-gray-400 uppercase font-semibold">Points</p>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Quick Actions Panel */}
      <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm">
        <h3 className="text-sm font-bold text-gray-900 mb-4">Quick Management Links</h3>
        <div className="grid grid-cols-2 gap-4">
          <Link
            to="/admin/users"
            className="flex items-center justify-between p-4 bg-gray-50 hover:bg-[#E9D8A9]/10 border border-transparent hover:border-[#E9D8A9]/40 rounded-xl transition-all duration-200 active:scale-[0.99] group"
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-indigo-50 flex items-center justify-center group-hover:scale-105 transition-transform">
                <UserCog className="w-5 h-5 text-indigo-600" />
              </div>
              <span className="text-sm font-bold text-gray-700">Manage Users</span>
            </div>
            <span className="text-gray-400 group-hover:text-gray-600 transition-colors">→</span>
          </Link>
          <Link
            to="/admin/statistics"
            className="flex items-center justify-between p-4 bg-gray-50 hover:bg-[#E9D8A9]/10 border border-transparent hover:border-[#E9D8A9]/40 rounded-xl transition-all duration-200 active:scale-[0.99] group"
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-amber-50 flex items-center justify-center group-hover:scale-105 transition-transform">
                <BarChart3 className="w-5 h-5 text-amber-600" />
              </div>
              <span className="text-sm font-bold text-gray-700">View Statistics</span>
            </div>
            <span className="text-gray-400 group-hover:text-gray-600 transition-colors">→</span>
          </Link>
        </div>
      </div>
    </div>
  )
}