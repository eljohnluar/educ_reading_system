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

    try {
      const audio = new Audio(
        isCorrect 
          ? '/soundeffects/quiz/right.mp3' 
          : '/soundeffects/quiz/wrong.mp3'
      )
      audio.play().catch(() => {})
    } catch (e) {}

    setTimeout(() => {
      if (currentQuestion < questions.length - 1) {
        setCurrentQuestion(prev => prev + 1)
        setSelectedAnswer(null)
        setIsAnswered(false)
      } else {
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

      const shouldUnlock = finalScore >= 3
      if (shouldUnlock) {
        const nextLevel = getNextLevel(level)
        
        if (nextLevel) {
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
        toast(`Score: ${finalScore}/${questions.length}. Need 3+ to pass.`, { icon: 'ℹ️' })
      }

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
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="spinner mx-auto"></div>
          <p className="text-light mt-4 font-medium">Loading quiz...</p>
        </div>
      </div>
    )
  }

  if (questions.length === 0) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <p className="text-light text-lg mb-4">No quiz questions available for this level yet.</p>
          <button
            onClick={() => navigate('/dashboard')}
            className="btn-primary"
          >
            Back to Dashboard
          </button>
        </div>
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
    <div className="max-w-3xl mx-auto px-4 py-6 flex flex-col">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl md:text-3xl font-bold text-dark tracking-tight">
          Quiz: {level?.charAt(0).toUpperCase() + level?.slice(1)}
        </h1>
        <p className="text-medium font-medium opacity-80 mt-1">
          Question {currentQuestion + 1} of {questions.length}
        </p>
      </div>

      {/* Progress Bar */}
      <div className="mb-6">
        <div className="flex justify-between items-center mb-1.5">
          <span className="text-xs font-bold text-medium">Progress</span>
          <span className="text-xs font-bold text-dark bg-gold px-2.5 py-0.5 rounded-full shadow-sm">
            Score: {score} / {questions.length}
          </span>
        </div>
        <div className="w-full h-2 bg-white rounded-full shadow-inner overflow-hidden">
          <motion.div
            className="h-full bg-success"
            initial={{ width: 0 }}
            animate={{ width: `${progress}%` }}
            transition={{ duration: 0.5, ease: "easeOut" }}
          />
        </div>
      </div>

      {/* Question Card */}
      <AnimatePresence mode="wait">
        <motion.div
          key={currentQuestion}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -20 }}
        >
          <div className="bg-white rounded-2xl p-5 md:p-7 shadow-sm border-2 border-cream">
            <h2 className="text-xl md:text-2xl font-bold text-dark mb-6 leading-tight">
              {currentQ?.question_text}
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {options.map((option) => {
                const isSelected = selectedAnswer === option.key
                const isCorrectOption = option.key === currentQ.correct_answer

                let btnClass = "w-full text-left p-3 md:p-4 rounded-xl border-2 transition-all duration-200 relative overflow-hidden group flex items-start gap-3 "
                
                if (isAnswered) {
                  if (isCorrectOption) {
                    btnClass += "bg-green-50 border-success text-success shadow-sm"
                  } else if (isSelected && !isCorrectOption) {
                    btnClass += "bg-red-50 border-error text-error opacity-75"
                  } else {
                    btnClass += "border-cream bg-white opacity-50"
                  }
                } else {
                  if (isSelected) {
                    btnClass += "border-gold bg-gold/10 text-dark shadow-md transform scale-[1.02]"
                  } else {
                    btnClass += "border-cream bg-white hover:border-gold hover:shadow-md text-dark hover:-translate-y-1"
                  }
                }

                return (
                  <button
                    key={option.key}
                    onClick={() => handleAnswerSelect(option.key)}
                    disabled={isAnswered}
                    className={btnClass}
                  >
                    <span className={`w-7 h-7 flex-shrink-0 flex items-center justify-center rounded-full font-bold text-sm 
                      ${isAnswered && isCorrectOption ? 'bg-success text-white' : 
                        isAnswered && isSelected && !isCorrectOption ? 'bg-error text-white' :
                        isSelected ? 'bg-gold text-dark' : 'bg-cream text-medium'}`}
                    >
                      {option.label}
                    </span>
                    <span className="font-semibold text-base pt-0.5">{option.text}</span>
                  </button>
                )
              })}
            </div>
          </div>
        </motion.div>
      </AnimatePresence>

      {/* Explanation */}
      <AnimatePresence>
        {isAnswered && currentQ?.explanation && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-4 bg-info/10 border-2 border-info/20 rounded-xl p-4 text-dark flex items-start gap-3"
          >
            <span className="text-xl mt-0.5">💡</span>
            <div>
              <h4 className="font-bold text-sm text-info">Explanation</h4>
              <p className="font-medium text-sm">{currentQ.explanation}</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Submit Button - Moved UP (no mt-auto) */}
      <div className="mt-6 flex justify-end">
        {!isAnswered ? (
          <button
            onClick={handleSubmitAnswer}
            disabled={!selectedAnswer}
            className={`px-6 py-3 rounded-full font-bold text-base transition-all ${
              selectedAnswer
                ? 'bg-gold text-dark active:scale-95 shadow-md hover:shadow-lg hover:-translate-y-1'
                : 'bg-cream text-medium opacity-50 cursor-not-allowed'
            }`}
          >
            Submit Answer
          </button>
        ) : (
          <div className="px-6 py-3 rounded-full font-bold text-base bg-cream text-medium flex items-center gap-3">
            <div className="spinner w-4 h-4 border-medium"></div>
            {currentQuestion < questions.length - 1 
              ? 'Moving to next question...' 
              : 'Calculating results...'}
          </div>
        )}
      </div>
    </div>
  )
}