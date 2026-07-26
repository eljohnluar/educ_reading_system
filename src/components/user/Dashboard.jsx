import React, { useState, useEffect } from 'react'
import { Link, Navigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import { supabase } from '../../lib/supabase'
import { LEVELS, isLevelUnlocked } from '../../config/levels'
import { motion } from 'framer-motion'
import toast from 'react-hot-toast'

export default function Dashboard() {
  const { user, profile, isAdmin } = useAuth()
  const [progress, setProgress] = useState({})
  const [stats, setStats] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchDashboardData()
  }, [user])

  // Redirect admin to admin dashboard
  if (isAdmin) {
    return <Navigate to="/admin" replace />
  }

  const fetchDashboardData = async () => {
    try {
      setLoading(true)

      if (user) {
        // Fetch user progress using the new simplified RPC
        const { data: progressData, error: progressError } = await supabase
          .rpc('get_user_progress_summary', { p_user_id: user.id })

        if (progressError) throw progressError

        // Create progress map keyed by level_name
        const progressMap = {}
        progressData?.forEach(item => {
          progressMap[item.level_name] = item
        })
        setProgress(progressMap)

        // Fetch user stats
        const { data: statsData, error: statsError } = await supabase
          .rpc('get_user_stats', { p_user_id: user.id })

        if (statsError) throw statsError
        
        // Handle the new stats format (single row)
        if (statsData && Array.isArray(statsData) && statsData.length > 0) {
          setStats(statsData[0])
        } else {
          setStats(statsData)
        }
      }
    } catch (error) {
      console.error('Error fetching dashboard data:', error)
      toast.error('Failed to load dashboard data')
    } finally {
      setLoading(false)
    }
  }

  const getLevelStatus = (level) => {
    const p = progress[level.id]
    
    // Check if completed first
    if (p?.is_completed) {
      if (p.score >= 3) {
        return { status: 'completed', label: '🏆 Completed', color: 'bg-green-500' }
      }
      return { status: 'failed', label: '❌ Failed', color: 'bg-red-500' }
    }

    // Check if level is unlocked
    const unlocked = isLevelUnlocked(level.id, progress)

    if (unlocked || level.id === 'easy') {
      return { status: 'in_progress', label: '🔄 Ready to Start', color: 'bg-yellow-500' }
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

  const completedCount = LEVELS.filter(l => progress[l.id]?.is_completed).length
  const totalLevels = LEVELS.length

  return (
    <div className="max-w-6xl mx-auto space-y-8 pb-10 mt-4">
      {/* Welcome Section */}
      <motion.div 
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="pb-6 border-b border-cream"
      >
        <h1 className="text-3xl md:text-4xl font-bold text-dark mb-1">
          Welcome back, {profile?.username || 'Learner'}
        </h1>
        <p className="text-base text-medium/80 font-medium">
          You've completed {completedCount} of {totalLevels} reading levels. Keep it up!
        </p>
      </motion.div>

      {/* Stats Section */}
      {stats && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4">
          {[
            { label: 'Total Score', value: stats.total_score || 0 },
            { label: 'Levels Completed', value: stats.levels_completed || 0 },
            { label: 'Avg Score', value: stats.average_score || 0 },
            { label: 'Perfect Scores', value: stats.perfect_scores || 0 }
          ].map((stat, idx) => (
            <motion.div 
              key={idx}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.05 }}
              className="bg-white rounded-xl border border-cream p-4 flex flex-col items-start justify-center"
            >
              <p className="text-3xl font-bold text-dark mb-1">
                {stat.value}
              </p>
              <p className="text-sm font-semibold text-medium/70 uppercase tracking-wide">
                {stat.label}
              </p>
            </motion.div>
          ))}
        </div>
      )}

      {/* Levels Section */}
      <div>
        <h2 className="text-xl font-bold text-dark mb-4">Learning Path</h2>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {LEVELS.map((level, index) => {
            const status = getLevelStatus(level)
            const isUnlocked = status.status !== 'locked'
            const isCompleted = status.status === 'completed'

            return (
              <motion.div
                key={level.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 + index * 0.05 }}
                className={`bg-white rounded-xl border ${
                  isUnlocked ? 'border-cream hover:border-gold/60' : 'border-gray-100 bg-gray-50/50'
                } flex flex-col p-6 transition-colors ${!isUnlocked ? 'opacity-60' : ''}`}
              >
                <div className="flex justify-between items-start mb-4">
                  <span className="text-3xl grayscale-[0.2]">{level.icon}</span>
                  <span className={`text-[10px] font-bold px-2 py-1 rounded capitalize ${
                    status.status === 'completed' ? 'bg-success/10 text-success' :
                    status.status === 'in_progress' ? 'bg-gold/20 text-medium' :
                    status.status === 'failed' ? 'bg-error/10 text-error' :
                    'bg-gray-200 text-gray-500'
                  }`}>
                    {status.label.replace(/[^a-zA-Z\s]/g, '')}
                  </span>
                </div>
                
                <h3 className="text-xl font-bold text-dark capitalize mb-1">{level.name}</h3>
                <p className="text-sm font-medium text-medium/70 mb-5 flex-1">
                  {level.description}
                </p>

                {isCompleted && progress[level.id] && (
                  <div className="mb-4 text-xs font-semibold text-dark/70 flex items-center justify-between">
                    <span>Highest Score:</span>
                    <span>{progress[level.id].score} / 6</span>
                  </div>
                )}

                <div className="mt-auto pt-4 border-t border-cream/50">
                  {isUnlocked ? (
                    isCompleted ? (
                      <div className="flex gap-2">
                        <Link
                          to={`/results/${level.id}`}
                          className="flex-1 text-center py-2 bg-cream text-dark rounded-lg text-xs font-bold hover:bg-gold/30 transition-colors"
                        >
                          Results
                        </Link>
                        <Link
                          to={`/story/${level.id}/1`}
                          className="flex-[2] text-center py-2 bg-white border border-cream text-dark rounded-lg text-xs font-bold hover:border-gold transition-colors"
                        >
                          Read Again
                        </Link>
                      </div>
                    ) : (
                      <Link
                        to={`/story/${level.id}/1`}
                        className="block w-full text-center py-2 bg-dark text-white rounded-lg text-xs font-bold hover:bg-dark/90 transition-colors"
                      >
                        Start Reading
                      </Link>
                    )
                  ) : (
                    <button
                      disabled
                      className="w-full py-2 rounded-lg bg-gray-100 text-gray-400 text-xs font-bold cursor-not-allowed"
                    >
                      Locked
                    </button>
                  )}
                </div>
              </motion.div>
            )
          })}
        </div>
      </div>
    </div>
  )
}