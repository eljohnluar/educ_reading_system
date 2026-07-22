import React, { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import { supabase } from '../../lib/supabase'
import { motion, AnimatePresence } from 'framer-motion'
import toast from 'react-hot-toast'

export default function Quiz() {
  const { level } = useParams()
  const { user } = useAuth()
  const navigate = useNavigate()

  const [questions, setQuestions] = useState([])
  const [currentQuestion, setCurrentQuestion] = useState(0)
  const [selectedAnswer, setSelectedAnswer] = useState(null)
  const [isAnswered, setIsAnswered] = useState(false)
  const [score, setScore] = useState(0)
  const [loading, setLoading] = useState(true)
  const [levelData, setLevelData] = useState(null)
  const [quizComplete, setQuizComplete] = useState(false)

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
        toast.error('Failed to load quiz')
      }
    }
    fetchLevelData()
  }, [level])

  useEffect(() => {
    const fetchQuestions = async () => {
      if (!levelData) return

      try {
        setLoading(true)
        const { data, error } = await supabase
          .from('quiz_questions')
          .select('*')
          .eq('level_id', levelData.id)
          .order('display_order')

        if (error) throw error
        setQuestions(data || [])
      } catch (error) {
        console.error('Error fetching questions:', error)
        toast.error('Failed to load quiz questions')
      } finally {
        setLoading(false)
      }
    }

    fetchQuestions()
  }, [levelData])

  const handleAnswerSelect = (answer) => {
    if (isAnswered) return
    setSelectedAnswer(answer)
  }

  const handleSubmitAnswer = async () => {
    if (!selectedAnswer) return

    const currentQ = questions[currentQuestion]
    const isCorrect = selectedAnswer === currentQ.correct_answer

    setIsAnswered(true)
    if (isCorrect) {
      setScore(prev => prev + 1)
    }

    // Play sound effect
    try {
      const audio = new Audio(
        isCorrect 
          ? '/assets/audio/effects/correct.mp3' 
          : '/assets/audio/effects/wrong.mp3'
      )
      audio.play().catch(() => {})
    } catch (e) {}

    // Auto advance after delay
    setTimeout(() => {
      if (currentQuestion < questions.length - 1) {
        setCurrentQuestion(prev => prev + 1)
        setSelectedAnswer(null)
        setIsAnswered(false)
      } else {
        // Quiz complete
        setQuizComplete(true)
        saveProgress()
      }
    }, 1500)
  }

  const saveProgress = async () => {
    try {
      const { error } = await supabase
        .from('user_progress')
        .upsert({
          user_id: user.id,
          level_id: levelData.id,
          score: score,
          total_questions: questions.length,
          correct_answers: score,
          is_completed: true,
          completed_at: new Date().toISOString()
        })

      if (error) throw error

      // ✅ FIXED: Use backticks for template literal
      const shouldUnlock = score >= 3
      if (shouldUnlock) {
        toast.success(`🎉 Level completed! Score: ${score}/${questions.length}`)
      } else {
        toast.info(`Score: ${score}/${questions.length}. Need 3+ to pass.`)
      }

      // Play level up sound if passed
      if (shouldUnlock) {
        try {
          const audio = new Audio('/assets/audio/effects/level_up.mp3')
          audio.play().catch(() => {})
        } catch (e) {}
      }

      navigate(`/results/${level}`, {
        state: { score, totalQuestions: questions.length }
      })
    } catch (error) {
      console.error('Error saving progress:', error)
      toast.error('Failed to save progress')
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gold"></div>
      </div>
    )
  }

  if (questions.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500">No quiz questions available for this level yet.</p>
        <button
          onClick={() => navigate('/dashboard')}
          className="mt-4 px-6 py-2 bg-gold text-white rounded-lg hover:bg-amber-500"
        >
          Back to Dashboard
        </button>
      </div>
    )
  }

  const currentQ = questions[currentQuestion]
  const options = [
    { key: 'a', label: 'A', text: currentQ?.option_a },
    { key: 'b', label: 'B', text: currentQ?.option_b },
    { key: 'c', label: 'C', text: currentQ?.option_c },
    { key: 'd', label: 'D', text: currentQ?.option_d },
  ]

  const progress = ((currentQuestion + 1) / questions.length) * 100

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-dark">
          Quiz: {level?.charAt(0).toUpperCase() + level?.slice(1)}
        </h1>
        <div className="text-sm text-gray-500">
          Question {currentQuestion + 1} of {questions.length}
        </div>
      </div>

      {/* Progress Bar */}
      <div className="bg-gray-200 rounded-full h-2">
        <div
          className="bg-gold h-2 rounded-full transition-all duration-500"
          style={{ width: `${progress}%` }}
        />
      </div>

      {/* Score Display */}
      <div className="text-right text-sm text-gray-500">
        Score: {score} / {questions.length}
      </div>

      {/* Question Card */}
      <AnimatePresence mode="wait">
        <motion.div
          key={currentQuestion}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -20 }}
          className="bg-white rounded-xl shadow-md p-6"
        >
          <h2 className="text-xl font-semibold text-dark mb-6">
            {currentQ?.question_text}
          </h2>

          <div className="space-y-3">
            {options.map((option) => {
              let bgColor = 'bg-white hover:bg-cream'
              if (isAnswered) {
                if (option.key === currentQ.correct_answer) {
                  bgColor = 'bg-green-100 border-green-500'
                } else if (option.key === selectedAnswer && option.key !== currentQ.correct_answer) {
                  bgColor = 'bg-red-100 border-red-500'
                }
              } else if (selectedAnswer === option.key) {
                bgColor = 'bg-gold bg-opacity-30 border-gold'
              }

              return (
                <button
                  key={option.key}
                  onClick={() => handleAnswerSelect(option.key)}
                  disabled={isAnswered}
                  className={`w-full text-left px-4 py-3 rounded-lg border-2 transition-all ${
                    bgColor
                  } ${
                    isAnswered ? 'cursor-default' : 'cursor-pointer hover:shadow-md'
                  }`}
                >
                  <span className="font-semibold mr-3">{option.label}.</span>
                  {option.text}
                </button>
              )
            })}
          </div>
        </motion.div>
      </AnimatePresence>

      {/* Submit Button */}
      {!isAnswered ? (
        <button
          onClick={handleSubmitAnswer}
          disabled={!selectedAnswer}
          className={`w-full py-3 rounded-lg font-semibold text-white transition-all ${
            selectedAnswer
              ? 'bg-gold hover:bg-amber-500 shadow-md hover:shadow-lg'
              : 'bg-gray-300 cursor-not-allowed'
          }`}
        >
          Submit Answer
        </button>
      ) : (
        <div className="text-center text-sm text-gray-500">
          {currentQuestion < questions.length - 1 
            ? 'Moving to next question...' 
            : 'Calculating results...'}
        </div>
      )}

      {/* Explanation */}
      {isAnswered && currentQ?.explanation && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-cream rounded-lg p-4 text-sm"
        >
          <span className="font-semibold">Explanation:</span> {currentQ.explanation}
        </motion.div>
      )}
    </div>
  )
}