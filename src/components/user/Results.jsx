import React, { useState, useEffect, useMemo } from 'react'
import { useParams, useNavigate, useLocation } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import { supabase } from '../../lib/supabase'
import { motion, AnimatePresence } from 'framer-motion'
import toast from 'react-hot-toast'

export default function Results() {
  const { level } = useParams()
  const location = useLocation()
  const navigate = useNavigate()
  const { user } = useAuth()

  const [score, setScore] = useState(0)
  const [totalQuestions, setTotalQuestions] = useState(6)
  const [progress, setProgress] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // If score was passed from Quiz via navigation state, use it directly
    if (location.state?.score !== undefined) {
      setScore(location.state.score)
      setTotalQuestions(location.state.totalQuestions || 6)
      setLoading(false)
      return
    }

    // Otherwise fetch from DB (e.g. when navigating directly to /results/:level)
    if (user?.id && level) {
      fetchResults()
    } else {
      setLoading(false)
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.id, level])

  useEffect(() => {
    if (!loading && totalQuestions > 0) {
      try {
        const isPassed = score >= 3
        const audio = new Audio(
          isPassed 
            ? '/soundeffects/scoreresult/pass.mp3'
            : '/soundeffects/scoreresult/fail.mp3'
        )
        audio.play().catch(() => {})
      } catch (e) {}
    }
  }, [loading, score, totalQuestions])

  const fetchResults = async () => {
    try {
      setLoading(true)

      const { data, error } = await supabase
        .from('user_progress')
        .select('*')
        .eq('user_id', user.id)
        .eq('level_name', level)
        .maybeSingle()

      if (error) throw error

      if (data) {
        setProgress(data)
        setScore(data.score || 0)
        setTotalQuestions(data.total_questions || 6)
      }
    } catch (error) {
      console.error('Error fetching results:', error)
    } finally {
      setLoading(false)
    }
  }

  const isPassed = score >= 3
  const percentage = Math.round((score / totalQuestions) * 100)

  const getMessage = () => {
    if (score === totalQuestions) return { emoji: '⭐', text: 'Perfect Score!', sub: 'You nailed every single question!' }
    if (score >= 4) return { emoji: '🎉', text: 'Excellent!', sub: 'You really know your stuff!' }
    if (score >= 3) return { emoji: '💪', text: 'Good Job!', sub: 'You passed this level!' }
    return { emoji: '📚', text: 'Keep Practicing!', sub: 'Read the story again and try once more.' }
  }

  const message = getMessage()

  // Pre-generate confetti data so it doesn't change on re-renders
  const confettiPieces = useMemo(() => {
    return [...Array(60)].map((_, i) => ({
      id: i,
      emoji: ['🎉', '⭐', '🎊', '✨', '🌟'][Math.floor(Math.random() * 5)],
      startX: Math.random() * 100,
      endX: Math.random() * 100,
      duration: 2 + Math.random() * 3,
      delay: Math.random() * 2,
      rotateMultiplier: 360 * (Math.random() * 2 + 1),
    }))
  }, [])

  // SVG circle props for score ring
  const radius = 70
  const circumference = 2 * Math.PI * radius
  const strokeDashoffset = circumference - (percentage / 100) * circumference

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="spinner mx-auto border-gold"></div>
          <p className="text-medium mt-4 font-medium">Loading results...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-xl mx-auto px-4 flex flex-col items-center justify-center overflow-hidden" style={{ height: 'calc(100vh - 5rem)' }}>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="w-full bg-white rounded-3xl shadow-sm border-2 border-cream p-6 md:p-8 text-center"
      >
        {/* Level badge */}
        <span className="inline-block px-3 py-1 bg-cream text-medium rounded-full text-xs font-bold tracking-wide uppercase mb-4">
          {level?.charAt(0).toUpperCase() + level?.slice(1)} Level
        </span>

        {/* Score Ring */}
        <motion.div
          initial={{ opacity: 0, scale: 0.5 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
          className="relative mx-auto w-32 h-32 mb-4"
        >
          <svg className="w-full h-full -rotate-90" viewBox="0 0 160 160">
            <circle cx="80" cy="80" r={radius} fill="none" stroke="#E5DCCD" strokeWidth="12" />
            <motion.circle
              cx="80" cy="80" r={radius}
              fill="none"
              stroke={isPassed ? '#27AE60' : '#E74C3C'}
              strokeWidth="12"
              strokeLinecap="round"
              strokeDasharray={circumference}
              initial={{ strokeDashoffset: circumference }}
              animate={{ strokeDashoffset }}
              transition={{ duration: 1, delay: 0.4, ease: "easeOut" }}
            />
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className="text-4xl font-bold text-dark">{score}</span>
            <span className="text-sm font-bold text-medium">/ {totalQuestions}</span>
          </div>
        </motion.div>

        {/* Message */}
        <h1 className="text-2xl font-bold text-dark mb-1">
          {message.emoji} {message.text}
        </h1>
        <p className="text-sm text-medium font-medium mb-1">{message.sub}</p>
        <p className="text-xs font-bold text-medium opacity-60 mb-4">{percentage}% Correct</p>

        {/* Stars */}
        <div className="flex justify-center gap-2 mb-4">
          {[...Array(totalQuestions)].map((_, i) => (
            <motion.span
              key={i}
              initial={{ opacity: 0, scale: 0 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.6 + i * 0.08, type: "spring", stiffness: 300 }}
              className="text-2xl"
            >
              {i < score ? '⭐' : '☆'}
            </motion.span>
          ))}
        </div>

        {/* Pass/Fail inline text */}
        <p className={`text-sm font-bold mb-6 ${isPassed ? 'text-success' : 'text-error'}`}>
          {isPassed ? '✅ Level Passed!' : '❌ Need 3+ correct to pass'}
        </p>

        {/* Action Buttons — horizontal row */}
        <div className="flex gap-3">
          <button
            onClick={() => navigate(`/quiz/${level}`)}
            className="flex-1 py-3 bg-cream text-dark rounded-xl font-bold text-sm hover:bg-gold/30 transition-all active:scale-[0.97]"
          >
            Retry Quiz
          </button>
          <button
            onClick={() => navigate(`/story/${level}/1`)}
            className="flex-1 py-3 bg-info/10 text-info rounded-xl font-bold text-sm hover:bg-info/20 transition-all active:scale-[0.97]"
          >
            Read Again
          </button>
          <button
            onClick={() => navigate('/dashboard')}
            className={`flex-1 py-3 rounded-xl font-bold text-sm transition-all active:scale-[0.97] ${
              isPassed
                ? 'bg-gold text-dark'
                : 'bg-white border-2 border-cream text-medium hover:border-gold'
            }`}
          >
            Dashboard
          </button>
        </div>
      </motion.div>

      {/* Confetti Animation for Perfect Score */}
      <AnimatePresence>
        {score === totalQuestions && (
          <div className="fixed inset-0 pointer-events-none overflow-hidden">
            {confettiPieces.map((piece) => (
              <motion.div
                key={piece.id}
                initial={{ x: `${piece.startX}vw`, y: -20, rotate: 0, opacity: 1 }}
                animate={{ y: '110vh', rotate: piece.rotateMultiplier, x: `${piece.endX}vw`, opacity: 0 }}
                transition={{ duration: piece.duration, delay: piece.delay, ease: "easeOut" }}
                className="absolute text-2xl"
              >
                {piece.emoji}
              </motion.div>
            ))}
          </div>
        )}
      </AnimatePresence>
    </div>
  )
}