import React, { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import { supabase } from '../../lib/supabase'
import { LEVELS, getNextLevel } from '../../config/levels'
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
  const [quizComplete, setQuizComplete] = useState(false)

  // Get current level config
  const currentLevelConfig = LEVELS.find(l => l.id === level)

  useEffect(() => {
    const fetchQuestions = async () => {
      try {
        setLoading(true)
        const { data, error } = await supabase
          .from('quiz_questions')
          .select('*')
          .eq('level_name', level)
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
  }, [level])

  const handleAnswerSelect = (answer) => {
    if (isAnswered) return
    setSelectedAnswer(answer)
  }

  const handleSubmitAnswer = async () => {
    if (!selectedAnswer) return

    const currentQ = questions[currentQuestion]
    const isCorrect = selectedAnswer === currentQ.correct_answer
    const nextScore = score + (isCorrect ? 1 : 0)

    setIsAnswered(true)
    setScore(nextScore)

    // Play sound effect
    try {
      const audio = new Audio(
        isCorrect 
          ? '/soundeffects/quiz/right.mp3' 
          : '/soundeffects/quiz/wrong.mp3'
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
        saveProgress(nextScore)
      }
    }, 1500)
  }

  const saveProgress = async (finalScore) => {
    try {
      if (!user?.id) {
        throw new Error('Missing user information')
      }

      // ✅ Step 2: Upsert progress (atomic — no 409 race condition)
      const { error: upsertError } = await supabase
        .from('user_progress')
        .upsert(
          {
            user_id: user.id,
            level_name: level,
            score: finalScore,
            total_questions: questions.length,
            correct_answers: finalScore,
            is_completed: true,
            completed_at: new Date().toISOString(),
            unlocked_at: new Date().toISOString()
          },
          { onConflict: 'user_id,level_name' }
        )

      if (upsertError) throw upsertError

      // ✅ Step 3: Unlock next level if passed
      const shouldUnlock = finalScore >= 3
      if (shouldUnlock) {
        const nextLevel = getNextLevel(level)
        
        if (nextLevel) {
          // Upsert next level progress (atomic unlock)
          const { error: unlockError } = await supabase
            .from('user_progress')
            .upsert(
              {
                user_id: user.id,
                level_name: nextLevel.id,
                unlocked_at: new Date().toISOString()
              },
              { onConflict: 'user_id,level_name' }
            )

          if (unlockError) throw unlockError
        }

        toast.success(`🎉 Level completed! Score: ${finalScore}/${questions.length}`)
      } else {
        toast.info(`Score: ${finalScore}/${questions.length}. Need 3+ to pass.`)
      }

      // ✅ Step 4: Navigate to results
      navigate(`/results/${level}`, {
        state: { 
          score: finalScore, 
          totalQuestions: questions.length,
          refresh: true 
        }
      })
    } catch (error) {
      console.error('Error saving progress:', error)
      toast.error('Unable to save progress right now, but you can still view your result.')
      navigate(`/results/${level}`, {
        state: { 
          score: finalScore, 
          totalQuestions: questions.length,
          refresh: true 
        }
      })
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