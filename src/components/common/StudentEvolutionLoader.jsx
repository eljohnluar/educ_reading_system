import React, { useState, useEffect, useRef } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import './StudentEvolutionLoader.css'

const BOOKS = ['📚', '📖', '📕', '📗', '📘', '📙', '📓', '📔']

const STAGES = [
  { id: 'preschool', label: 'Pre-School', emoji: '🧒' },
  { id: 'highschool', label: 'High School', emoji: '👦' },
  { id: 'college', label: 'College', emoji: '🧑‍🎓' },
]

const TOTAL_DURATION = 1600 // ms (1.6 seconds - faster)

export default function StudentEvolutionLoader() {
  const navigate = useNavigate()
  const location = useLocation()
  const [progress, setProgress] = useState(0)
  const [currentStage, setCurrentStage] = useState(0)
  const [flash, setFlash] = useState(false)
  const startRef = useRef(null)
  const rafRef = useRef(null)
  const flashTimeoutRef = useRef(null)

  const destination = location.state?.redirectTo || '/dashboard'

  useEffect(() => {
    startRef.current = performance.now()

    const tick = (now) => {
      const elapsed = now - startRef.current
      const pct = Math.min((elapsed / TOTAL_DURATION) * 100, 100)
      setProgress(pct)

      const newStage = pct >= 66 ? 2 : pct >= 33 ? 1 : 0
      setCurrentStage((prev) => {
        if (newStage !== prev) {
          setFlash(true)
          if (flashTimeoutRef.current) clearTimeout(flashTimeoutRef.current)
          flashTimeoutRef.current = setTimeout(() => setFlash(false), 250)
          return newStage
        }
        return prev
      })

      if (pct < 100) {
        rafRef.current = requestAnimationFrame(tick)
      } else {
        rafRef.current = null
        setTimeout(() => navigate(destination, { replace: true }), 200)
      }
    }

    rafRef.current = requestAnimationFrame(tick)

    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current)
      if (flashTimeoutRef.current) clearTimeout(flashTimeoutRef.current)
    }
  }, [navigate, destination])

  const currentStageData = STAGES[currentStage] || STAGES[0]

  // Calculate which books should be active based on progress
  const activeBooksCount = Math.floor((progress / 100) * BOOKS.length)

  return (
    <div className="evolution-loader">
      <div className={`stage-flash ${flash ? 'active' : ''}`} />

      <div className="evolution-content">
        {/* Title */}
        <p className="evolution-title">
          {progress < 33 && '🌱 Starting your learning journey...'}
          {progress >= 33 && progress < 66 && '📚 Growing into a scholar...'}
          {progress >= 66 && progress < 100 && '🎓 Becoming a graduate...'}
          {progress === 100 && '🎉 Welcome!'}
        </p>

        {/* Circle of Books */}
        <div className="book-circle-container">
          <div className="book-circle-wrapper">
            <div className="book-circle">
              {BOOKS.map((book, index) => {
                const angle = (index / BOOKS.length) * 360
                const radius = 75
                const x = radius * Math.cos((angle - 90) * Math.PI / 180)
                const y = radius * Math.sin((angle - 90) * Math.PI / 180)
                const isActive = index < activeBooksCount
                
                return (
                  <div
                    key={index}
                    className={`book-item ${isActive ? 'active' : ''}`}
                    style={{
                      '--x': `${x}px`,
                      '--y': `${y}px`,
                      '--angle': `${angle}deg`,
                    }}
                  >
                    {book}
                  </div>
                )
              })}
            </div>

            {/* Center - Static, Evolving */}
            <div className="center-book">
              <span className="center-emoji">
                {currentStageData.emoji}
              </span>
              <span className="center-label">{currentStageData.label}</span>
            </div>
          </div>
        </div>

        {/* Stage Milestones */}
        <div className="stage-milestones">
          {STAGES.map((stage, index) => (
            <div
              key={stage.id}
              className={`milestone ${currentStage >= index ? 'active' : ''}`}
            >
              <div className="milestone-dot" />
              <span className="milestone-label">{stage.label}</span>
            </div>
          ))}
        </div>

        {/* Progress Bar */}
        <div className="evolution-progress-bar">
          <div className="progress-track">
            <div className="progress-fill" style={{ width: `${progress}%` }} />
          </div>
          <p className="progress-text">
            {progress < 33
              ? '🌟 Starting your journey...'
              : progress < 66
              ? '📖 Learning and growing...'
              : progress < 100
              ? '🎯 Almost there...'
              : '🎉 Welcome!'}
          </p>
        </div>
      </div>
    </div>
  )
}