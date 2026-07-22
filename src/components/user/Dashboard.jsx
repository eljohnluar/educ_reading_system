import React, { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import { supabase } from '../../lib/supabase'
import { motion } from 'framer-motion'
import toast from 'react-hot-toast'

export default function Dashboard() {
  const { user, profile } = useAuth()
  const [levels, setLevels] = useState([])
  const [progress, setProgress] = useState({})
  const [loading, setLoading] = useState(true)
  const [stats, setStats] = useState(null)

  useEffect(() => {
    fetchDashboardData()
  }, [user])

  const fetchDashboardData = async () => {
    try {
      setLoading(true)

      // Fetch levels
      const { data: levelsData, error: levelsError } = await supabase
        .from('levels')
        .select('*')
        .order('display_order', { ascending: true })

      if (levelsError) throw levelsError

      // Fetch user progress
      if (user) {
        const { data: progressData, error: progressError } = await supabase
          .rpc('get_user_progress_summary', { user_id_param: user.id })

        if (progressError) throw progressError

        // Create progress map
        const progressMap = {}
        progressData?.forEach(item => {
          progressMap[item.level_id] = item
        })
        setProgress(progressMap)

        // Fetch user stats
        const { data: statsData, error: statsError } = await supabase
          .rpc('get_user_stats', { user_id_param: user.id })

        if (statsError) throw statsError
        setStats(statsData)
      }

      setLevels(levelsData || [])
    } catch (error) {
      console.error('Error fetching dashboard data:', error)
      toast.error('Failed to load dashboard data')
    } finally {
      setLoading(false)
    }
  }

  const getLevelStatus = (levelId) => {
    const p = progress[levelId]
    if (!p) return { status: 'locked', label: '🔒 Locked', color: 'bg-gray-200' }
    if (p.is_completed) {
      if (p.score >= 3) {
        return { status: 'completed', label: '🏆 Completed', color: 'bg-green-500' }
      }
      return { status: 'failed', label: '❌ Failed', color: 'bg-red-500' }
    }
    if (p.unlocked_at) {
      return { status: 'in_progress', label: '🔄 In Progress', color: 'bg-yellow-500' }
    }
    return { status: 'locked', label: '🔒 Locked', color: 'bg-gray-200' }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gold"></div>
      </div>
    )
  }

  const completedCount = levels.filter(l => progress[l.id]?.is_completed).length
  const totalLevels = levels.length

  return (
    <div className="space-y-6">
      {/* Welcome Section */}
      <div className="bg-white rounded-xl shadow-md p-6">
        <h1 className="text-3xl font-bold text-dark">
          Welcome back, {profile?.username || 'Learner'}! 👋
        </h1>
        <p className="text-gray-600 mt-2">
          Continue your English reading journey. You've completed {completedCount} out of {totalLevels} levels.
        </p>
      </div>

      {/* Stats Section */}
      {stats && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-white rounded-xl shadow-md p-4 text-center">
            <p className="text-2xl font-bold text-gold">{stats.total_score || 0}</p>
            <p className="text-sm text-gray-500">Total Score</p>
          </div>
          <div className="bg-white rounded-xl shadow-md p-4 text-center">
            <p className="text-2xl font-bold text-green-500">{stats.levels_completed || 0}</p>
            <p className="text-sm text-gray-500">Levels Completed</p>
          </div>
          <div className="bg-white rounded-xl shadow-md p-4 text-center">
            <p className="text-2xl font-bold text-blue-500">{stats.average_score || 0}</p>
            <p className="text-sm text-gray-500">Average Score</p>
          </div>
          <div className="bg-white rounded-xl shadow-md p-4 text-center">
            <p className="text-2xl font-bold text-purple-500">{stats.perfect_scores || 0}</p>
            <p className="text-sm text-gray-500">Perfect Scores</p>
          </div>
        </div>
      )}

      {/* Levels Section */}
      <h2 className="text-2xl font-bold text-dark">Your Learning Path</h2>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {levels.map((level, index) => {
          const status = getLevelStatus(level.id)
          const isUnlocked = status.status !== 'locked'
          const isCompleted = status.status === 'completed'

          return (
            <motion.div
              key={level.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className={`bg-white rounded-xl shadow-md overflow-hidden transition-all hover:shadow-xl ${
                !isUnlocked ? 'opacity-75' : ''
              }`}
            >
              <div className={`h-2 ${status.color}`}></div>
              <div className="p-6">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-4xl">{level.icon}</span>
                  <span className={`text-sm font-medium px-3 py-1 rounded-full ${
                    status.status === 'completed' ? 'bg-green-100 text-green-700' :
                    status.status === 'in_progress' ? 'bg-yellow-100 text-yellow-700' :
                    status.status === 'failed' ? 'bg-red-100 text-red-700' :
                    'bg-gray-100 text-gray-500'
                  }`}>
                    {status.label}
                  </span>
                </div>
                <h3 className="text-xl font-bold text-dark capitalize">{level.level_name}</h3>
                <p className="text-sm text-gray-500 mt-1">{level.description}</p>

                {isCompleted && progress[level.id] && (
                  <div className="mt-3">
                    <div className="flex items-center space-x-2">
                      <span className="text-sm font-medium">Score: </span>
                      <span className="text-lg font-bold text-gold">{progress[level.id].score}/6</span>
                    </div>
                  </div>
                )}

                {isUnlocked ? (
                  <Link
                    to={isCompleted ? `/results/${level.level_name}` : `/story/${level.level_name}/1`}
                    className={`mt-4 inline-block w-full text-center py-2 rounded-lg font-semibold transition-all ${
                      isCompleted
                        ? 'bg-green-500 hover:bg-green-600 text-white'
                        : 'bg-gold hover:bg-amber-500 text-white shadow-md hover:shadow-lg'
                    }`}
                  >
                    {isCompleted ? '📊 View Results' : '📖 Start Reading'}
                  </Link>
                ) : (
                  <button
                    disabled
                    className="mt-4 w-full py-2 rounded-lg bg-gray-200 text-gray-500 cursor-not-allowed"
                  >
                    🔒 Locked
                  </button>
                )}
              </div>
            </motion.div>
          )
        })}
      </div>
    </div>
  )
}