import React, { useState, useEffect } from 'react'
import { adminService } from '../../services/adminService'
import { supabase } from '../../lib/supabase'
import { motion, AnimatePresence } from 'framer-motion'
import toast from 'react-hot-toast'
import { Users, CheckCircle, Target, Star, Award, LogIn, Leaf, Gauge, Flame, RefreshCw, Trash2 } from 'lucide-react'

export default function Statistics() {
  const [stats, setStats] = useState(null)
  const [levelStats, setLevelStats] = useState([])
  const [userGrowth, setUserGrowth] = useState([])
  const [loading, setLoading] = useState(true)
  const [isResetting, setIsResetting] = useState(false)
  const [showResetModal, setShowResetModal] = useState(false)

  useEffect(() => {
    fetchAllStats()
  }, [])

  const fetchAllStats = async () => {
    try {
      setLoading(true)

      // Dashboard stats
      const statsData = await adminService.getDashboardStats()
      setStats(statsData)

      // Level statistics
      const baseLevels = [
        { id: 'easy', level_name: 'easy', IconComponent: Leaf, color_code: '#4CAF50' },
        { id: 'average', level_name: 'average', IconComponent: Gauge, color_code: '#FFC107' },
        { id: 'difficult', level_name: 'difficult', IconComponent: Flame, color_code: '#F44336' }
      ]
      
      const { data: progressData } = await supabase.from('user_progress').select('level_name, is_completed, score')
      
      const levelStatsData = baseLevels.map(level => {
        const pData = (progressData || []).filter(p => p.level_name === level.level_name)
        return {
          ...level,
          user_progress: pData
        }
      })
      setLevelStats(levelStatsData)

      // User growth (last 7 days)
      const { data: growthData, error: growthError } = await supabase
        .from('profiles')
        .select('created_at')
        .gte('created_at', new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString())

      if (!growthError) {
        const growthMap = {}
        growthData?.forEach(item => {
          const date = new Date(item.created_at).toLocaleDateString()
          growthMap[date] = (growthMap[date] || 0) + 1
        })
        setUserGrowth(Object.entries(growthMap).map(([date, count]) => ({ date, count })))
      }

    } catch (error) {
      console.error('Error fetching statistics:', error)
      toast.error('Failed to load statistics')
    } finally {
      setLoading(false)
    }
  }

  // ✅ Reset All Data Except Users
  const resetAllDataExceptUsers = async () => {
    setIsResetting(true)
    setShowResetModal(false)

    try {
      // 1. Reset user_progress table
      const { error: progressError } = await supabase
        .from('user_progress')
        .delete()
        .neq('id', '00000000-0000-0000-0000-000000000000')

      if (progressError) throw progressError

      // 2. Reset user_activity_log table
      const { error: activityError } = await supabase
        .from('user_activity_log')
        .delete()
        .neq('id', '00000000-0000-0000-0000-000000000000')

      if (activityError) throw activityError

      // 3. Reset feedback table
      const { error: feedbackError } = await supabase
        .from('feedback')
        .delete()
        .neq('id', '00000000-0000-0000-0000-000000000000')

      if (feedbackError) throw feedbackError

      // 4. Reset login_attempts table
      const { error: loginError } = await supabase
        .from('login_attempts')
        .delete()
        .neq('id', '00000000-0000-0000-0000-000000000000')

      if (loginError) throw loginError

      // 5. Reset password_resets table
      const { error: resetError } = await supabase
        .from('password_resets')
        .delete()
        .neq('id', '00000000-0000-0000-0000-000000000000')

      if (resetError) throw resetError

      toast.success('🗑️ All data (except users) has been reset successfully!')
      
      // ✅ Refresh statistics
      await fetchAllStats()
      
    } catch (error) {
      console.error('Error resetting data:', error)
      toast.error('Failed to reset data. Please try again.')
    } finally {
      setIsResetting(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gold"></div>
      </div>
    )
  }

  const statCards = [
    { label: 'Total Users', value: stats?.total_users || 0, IconComponent: Users, color: '#6366f1' },
    { label: 'Total Completions', value: stats?.total_completions || 0, IconComponent: CheckCircle, color: '#22c55e' },
    { label: 'Average Score', value: stats?.avg_score || 0, IconComponent: Target, color: '#f59e0b' },
    { label: 'Perfect Scores', value: stats?.perfect_scores || 0, IconComponent: Star, color: '#eab308' },
    { label: 'Passing Scores', value: stats?.passing_scores || 0, IconComponent: Award, color: '#8b5cf6' },
    { label: 'Today\'s Logins', value: stats?.today_logins || 0, IconComponent: LogIn, color: '#3b82f6' },
  ]

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-dark"> Statistics</h1>
        <div className="flex items-center gap-3">
          <button
            onClick={fetchAllStats}
            className="px-4 py-2 bg-gold text-dark rounded-lg font-semibold hover:bg-amber-500 transition-all flex items-center gap-2"
          >
            <RefreshCw className="w-4 h-4" />
            Refresh
          </button>
          <button
            onClick={() => setShowResetModal(true)}
            disabled={isResetting}
            className={`px-4 py-2 rounded-lg font-semibold transition-all flex items-center gap-2 ${
              isResetting
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
              <>
                <Trash2 className="w-4 h-4" />
                Reset All Data
              </>
            )}
          </button>
        </div>
      </div>

      {/* Overview Cards */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        {statCards.map((stat, index) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.05 }}
            className="bg-white rounded-xl shadow-md p-4 text-center hover:shadow-lg transition-all"
          >
            <div className="flex justify-center mb-2">
              <stat.IconComponent className="w-7 h-7" style={{ color: stat.color }} />
            </div>
            <p className="text-2xl font-bold text-dark">{stat.value}</p>
            <p className="text-xs text-gray-500">{stat.label}</p>
          </motion.div>
        ))}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Level Performance */}
        <div className="bg-white rounded-xl shadow-md p-6">
          <h2 className="text-lg font-bold text-dark mb-4">📚 Level Performance</h2>
          <div className="space-y-4">
            {levelStats.length === 0 ? (
              <p className="text-gray-500 text-center py-4">No data available</p>
            ) : (
              levelStats.map((level) => {
                const progressData = level.user_progress || []
                const total = progressData.length
                const completed = progressData.filter(p => p.is_completed).length
                const avgScore = progressData.length > 0 
                  ? progressData.reduce((sum, p) => sum + (p.score || 0), 0) / progressData.length 
                  : 0

                return (
                  <div key={level.id} className="border-b border-gray-100 pb-3 last:border-0">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        {level.IconComponent && <level.IconComponent className="w-5 h-5" style={{ color: level.color_code }} />}
                        <span className="font-medium text-dark capitalize">{level.level_name}</span>
                      </div>
                      <div className="flex items-center space-x-4 text-sm">
                        <span className="text-gray-500">{completed} completed</span>
                        <span className="text-gold font-medium">{avgScore.toFixed(1)} avg</span>
                      </div>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
                      <div
                        className="h-2 rounded-full transition-all"
                        style={{
                          width: total > 0 ? `${(completed / total) * 100}%` : '0%',
                          backgroundColor: level.color_code || '#E9D2A9'
                        }}
                      />
                    </div>
                    <div className="flex justify-between text-xs text-gray-400 mt-1">
                      <span>{total} attempts</span>
                      <span>{total > 0 ? `${Math.round((completed / total) * 100)}%` : '0%'} completion</span>
                    </div>
                  </div>
                )
              })
            )}
          </div>
        </div>

        {/* User Growth */}
        <div className="bg-white rounded-xl shadow-md p-6">
          <h2 className="text-lg font-bold text-dark mb-4">📈 User Growth (Last 7 Days)</h2>
          {userGrowth.length === 0 ? (
            <p className="text-gray-500 text-center py-8">No new users in the last 7 days</p>
          ) : (
            <div className="space-y-2">
              {userGrowth.map((item) => (
                <div key={item.date} className="flex items-center space-x-4">
                  <span className="text-sm text-gray-500 w-24">{item.date}</span>
                  <div className="flex-1">
                    <div
                      className="h-6 rounded-lg bg-gold transition-all flex items-center px-2 text-white text-xs font-medium"
                      style={{
                        width: `${Math.min((item.count / Math.max(...userGrowth.map(g => g.count))) * 100, 100)}%`
                      }}
                    >
                      {item.count > 0 && `${item.count} new user${item.count > 1 ? 's' : ''}`}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Additional Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white rounded-xl shadow-md p-6 text-center">
          <p className="text-2xl font-bold text-purple-500">{stats?.admin_count || 0}</p>
          <p className="text-sm text-gray-500">Admin Users</p>
        </div>
        <div className="bg-white rounded-xl shadow-md p-6 text-center">
          <p className="text-2xl font-bold text-blue-500">{stats?.user_count || 0}</p>
          <p className="text-sm text-gray-500">Regular Users</p>
        </div>
        <div className="bg-white rounded-xl shadow-md p-6 text-center">
          <p className="text-2xl font-bold text-green-500">{stats?.today_feedback || 0}</p>
          <p className="text-sm text-gray-500">Today's Feedback</p>
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
                  <h2 className="text-xl font-bold text-dark">Reset All Data</h2>
                  <p className="text-sm text-gray-500">This action cannot be undone</p>
                </div>
              </div>

              {/* Modal Body */}
              <div className="mb-6">
                <p className="text-gray-600">
                  Are you sure you want to reset all data?
                </p>
                <div className="mt-3 space-y-2">
                  <div className="p-3 bg-yellow-50 rounded-lg border border-yellow-200">
                    <p className="text-sm text-yellow-700 flex items-center gap-2">
                      <span>🟡</span>
                      <strong>Will be reset:</strong> Progress, Activity Logs, Feedback, Login Attempts, Password Resets
                    </p>
                  </div>
                  <div className="p-3 bg-green-50 rounded-lg border border-green-200">
                    <p className="text-sm text-green-700 flex items-center gap-2">
                      <span>🟢</span>
                      <strong>Will be kept:</strong> User Accounts (Profiles)
                    </p>
                  </div>
                </div>
                <div className="mt-3 p-3 bg-red-50 rounded-lg border border-red-200">
                  <p className="text-sm text-red-600 flex items-center gap-2">
                    <span>🚨</span>
                    This will permanently remove all activity records and progress data.
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
                  onClick={resetAllDataExceptUsers}
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