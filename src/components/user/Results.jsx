import React, { useState, useEffect } from 'react'
import { useParams, useNavigate, useLocation } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import { supabase } from '../../lib/supabase'
import { motion } from 'framer-motion'
import toast from 'react-hot-toast'

export default function Results() {
  const { level } = useParams()
  const location = useLocation()
  const navigate = useNavigate()
  const { user } = useAuth()

  const [score, setScore] = useState(0)
  const [totalQuestions, setTotalQuestions] = useState(6)
  const [levelData, setLevelData] = useState(null)
  const [progress, setProgress] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Get score from location state or fetch from database
    if (location.state) {
      setScore(location.state.score || 0)
      setTotalQuestions(location.state.totalQuestions || 6)
      setLoading(false)
    } else {
      fetchResults()
    }
  }, [location])

  useEffect(() => {
    const fetchLevelData = async () => {
      try {
        const { data, error } = await supabase
          .from('levels')
          .select('*')
          .eq('level_name', level)
          .single()
        
        if (error) throw error
        setLevelData(data)
      } catch (error) {
        console.error('Error fetching level:', error)
      }
    }
    fetchLevelData()
  }, [level])

  const fetchResults = async () => {
    try {
      setLoading(true)
      const { data, error } = await supabase
        .from('user_progress')
        .select('*')
        .eq('user_id', user.id)
        .eq('level_id', levelData?.id)
        .single()

      if (error) throw error
      setProgress(data)
      setScore(data.score || 0)
      setTotalQuestions(data.total_questions || 6)
    } catch (error) {
      console.error('Error fetching results:', error)
      toast.error('Failed to load results')
    } finally {
      setLoading(false)
    }
  }

  const isPassed = score >= 3
  const percentage = Math.round((score / totalQuestions) * 100)

  const getMessage = () => {
    if (score === totalQuestions) return { emoji: '⭐', text: 'Perfect!', color: 'text-yellow-500' }
    if (score >= 4) return { emoji: '🎉', text: 'Very Good!', color: 'text-green-500' }
    if (score >= 3) return { emoji: '💪', text: 'Good Job!', color: 'text-blue-500' }
    return { emoji: '📚', text: 'Keep Practicing!', color: 'text-gray-500' }
  }

  const message = getMessage()

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gold"></div>
      </div>
    )
  }

  return (
    <div className="max-w-2xl mx-auto">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white rounded-xl shadow-md p-8 text-center"
      >
        {/* Header */}
        <h1 className="text-3xl font-bold text-dark mb-2">
          {message.emoji} {message.text}
        </h1>
        <p className="text-gray-500">
          {level?.charAt(0).toUpperCase() + level?.slice(1)} Level Results
        </p>

        {/* Score Display */}
        <div className="my-8">
          <div className="text-6xl font-bold text-gold">
            {score} <span className="text-3xl text-gray-400">/ {totalQuestions}</span>
          </div>
          <div className="mt-2 text-sm text-gray-500">{percentage}% Correct</div>
        </div>

        {/* Stars */}
        <div className="flex justify-center space-x-2 mb-8">
          {[...Array(6)].map((_, i) => (
            <motion.span
              key={i}
              initial={{ opacity: 0, scale: 0 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: i * 0.1 }}
              className="text-3xl"
            >
              {i < score ? '⭐' : '☆'}
            </motion.span>
          ))}
        </div>

        {/* Result Message */}
        <div className={`text-lg font-semibold ${message.color} mb-6`}>
          {isPassed 
            ? '✅ You passed this level!'
            : '❌ You need 3 correct answers to pass'}
        </div>

        {/* Action Buttons */}
        <div className="space-y-3">
          <button
            onClick={() => navigate(`/quiz/${level}`)}
            className="w-full py-3 bg-cream text-dark rounded-lg font-semibold hover:bg-gold hover:text-white transition-all"
          >
            🔄 Retry Quiz
          </button>

          {isPassed && (
            <button
              onClick={() => navigate('/dashboard')}
              className="w-full py-3 bg-gold text-white rounded-lg font-semibold hover:bg-amber-500 shadow-md hover:shadow-lg transition-all"
            >
              🏠 Go to Dashboard
            </button>
          )}

          {!isPassed && (
            <button
              onClick={() => navigate('/dashboard')}
              className="w-full py-3 bg-gray-200 text-gray-600 rounded-lg font-semibold hover:bg-gray-300 transition-all"
            >
              📚 Back to Dashboard
            </button>
          )}

          <button
            onClick={() => navigate('/leadership')}
            className="w-full py-3 text-gold font-semibold hover:underline transition-all"
          >
            🏆 View Leaderboard
          </button>
        </div>
      </motion.div>

      {/* Confetti Animation for Perfect Score */}
      {score === totalQuestions && (
        <div className="fixed inset-0 pointer-events-none">
          {[...Array(50)].map((_, i) => (
            <motion.div
              key={i}
              initial={{ 
                x: Math.random() * window.innerWidth,
                y: -20,
                rotate: 0
              }}
              animate={{
                y: window.innerHeight + 100,
                rotate: 360 * (Math.random() * 2 + 1),
                x: Math.random() * window.innerWidth
              }}
              transition={{
                duration: 2 + Math.random() * 3,
                delay: Math.random() * 2,
                ease: "easeOut"
              }}
              className="absolute text-2xl"
            >
              {['🎉', '⭐', '🎊', '✨', '🌟'][Math.floor(Math.random() * 5)]}
            </motion.div>
          ))}
        </div>
      )}
    </div>
  )
}