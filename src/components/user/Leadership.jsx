import React, { useState, useEffect } from 'react'
import { useAuth } from '../../context/AuthContext'
import { supabase } from '../../lib/supabase'
import { motion } from 'framer-motion'
import toast from 'react-hot-toast'

export default function Leadership() {
  const { user } = useAuth()
  const [leaderboard, setLeaderboard] = useState([])
  const [levelLeaderboard, setLevelLeaderboard] = useState({})
  const [selectedLevel, setSelectedLevel] = useState('overall')
  const [loading, setLoading] = useState(true)
  const [levels] = useState([
    { level_name: 'easy' },
    { level_name: 'average' },
    { level_name: 'difficult' }
  ])

  useEffect(() => {
    fetchLeaderboardData()
  }, [])

  useEffect(() => {
    if (selectedLevel !== 'overall') {
      fetchLevelLeaderboard(selectedLevel)
    }
  }, [selectedLevel])

  const fetchLeaderboardData = async () => {
    try {
      setLoading(true)
      const { data, error } = await supabase
        .from('leaderboard')
        .select('*')
        .limit(50)

      if (error) throw error
      setLeaderboard(data || [])
    } catch (error) {
      console.error('Error fetching leaderboard:', error)
      toast.error('Failed to load leaderboard')
    } finally {
      setLoading(false)
    }
  }

  const fetchLevelLeaderboard = async (levelName) => {
    try {
      const { data, error } = await supabase
        .rpc('get_level_leaderboard', { level_name_param: levelName })

      if (error) throw error
      setLevelLeaderboard(prev => ({
        ...prev,
        [levelName]: data || []
      }))
    } catch (error) {
      console.error('Error fetching level leaderboard:', error)
    }
  }

  const getCurrentData = () => {
    if (selectedLevel === 'overall') {
      return leaderboard
    }
    return levelLeaderboard[selectedLevel] || []
  }

  const getUserRank = (data) => {
    const index = data.findIndex(item => item.user_id === user?.id)
    return index >= 0 ? index + 1 : null
  }

  // Get avatar URL with fallback
  const getAvatarUrl = (avatarUrl) => {
    if (avatarUrl && !avatarUrl.includes('default') && !avatarUrl.includes('null')) {
      return avatarUrl
    }
    return '/assets/images/avatars/default.jpg'
  }

  // Get initials for fallback
  const getInitials = (username) => {
    return username?.charAt(0).toUpperCase() || 'U'
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gold"></div>
      </div>
    )
  }

  const currentData = getCurrentData()
  const userRank = getUserRank(currentData)

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <h1 className="text-2xl sm:text-3xl font-bold text-dark"> Leadership Board</h1>
        {userRank && (
          <div className="bg-gold text-dark px-4 py-2 rounded-lg font-semibold">
            Your Rank: #{userRank}
          </div>
        )}
      </div>

      {/* Level Filter */}
      <div className="flex flex-wrap gap-2">
        <button
          onClick={() => setSelectedLevel('overall')}
          className={`px-4 py-2 rounded-lg transition-all ${
            selectedLevel === 'overall'
              ? 'bg-gold text-dark font-semibold'
              : 'bg-white text-gray-600'
          }`}
        >
          Overall
        </button>
        {levels.map((level) => (
          <button
            key={level.level_name}
            onClick={() => setSelectedLevel(level.level_name)}
            className={`px-4 py-2 rounded-lg transition-all capitalize ${
              selectedLevel === level.level_name
                ? 'bg-gold text-dark font-semibold'
                : 'bg-white text-gray-600'
            }`}
          >
            {level.level_name}
          </button>
        ))}
      </div>

      {/* Leaderboard Table - White header */}
      <div className="bg-white rounded-xl shadow-md overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-white">
              <tr>
                <th className="px-6 py-3 text-left text-sm font-semibold text-dark border-b border-gray-200">#</th>
                <th className="px-6 py-3 text-left text-sm font-semibold text-dark border-b border-gray-200">User</th>
                <th className="px-6 py-3 text-left text-sm font-semibold text-dark border-b border-gray-200">Score</th>
                <th className="px-6 py-3 text-left text-sm font-semibold text-dark border-b border-gray-200">Levels Completed</th>
                <th className="px-6 py-3 text-left text-sm font-semibold text-dark border-b border-gray-200">Avg Score</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {currentData.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-8 text-center text-gray-500">
                    No data available yet. Complete a level to appear on the leaderboard!
                  </td>
                </tr>
              ) : (
                currentData.map((item, index) => {
                  const isCurrentUser = item.user_id === user?.id
                  return (
                    <motion.tr
                      key={item.user_id || index}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.05 }}
                      className="bg-white"
                    >
                      <td className="px-6 py-4">
                        <span className={`font-bold ${
                          index === 0 ? 'text-yellow-500' :
                          index === 1 ? 'text-gray-400' :
                          index === 2 ? 'text-amber-600' :
                          'text-gray-500'
                        }`}>
                          #{index + 1}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center space-x-3">
                          <div className="relative w-8 h-8 flex-shrink-0">
                            <img
                              src={getAvatarUrl(item.avatar_url)}
                              alt={item.username}
                              className="w-8 h-8 rounded-full object-cover"
                              onError={(e) => {
                                e.target.style.display = 'none'
                                const parent = e.target.parentElement
                                if (parent) {
                                  const fallback = document.createElement('div')
                                  fallback.className = 'w-8 h-8 rounded-full bg-gold/30 flex items-center justify-center text-dark text-sm font-bold'
                                  fallback.textContent = getInitials(item.username)
                                  parent.appendChild(fallback)
                                }
                              }}
                            />
                          </div>
                          <span className={`font-medium ${isCurrentUser ? 'text-gold' : 'text-dark'}`}>
                            {item.username}
                            {isCurrentUser && ' (You)'}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4 font-bold text-gold">{item.total_score || item.score || 0}</td>
                      <td className="px-6 py-4">{item.completed_levels || 0}</td>
                      <td className="px-6 py-4">{item.avg_score || 0}</td>
                    </motion.tr>
                  )
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {userRank && (
        <div className="text-sm text-gray-500 text-center">
          You are ranked #{userRank} out of {currentData.length} learners
        </div>
      )}
    </div>
  )
}