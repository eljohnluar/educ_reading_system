import React, { useState, useEffect, useRef } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import './StudentEvolutionLoader.css'

const STAGES = [
  { id: 'preschool', emoji: '🧒🎒', label: 'Pre-School', threshold: 0 },
  { id: 'highschool', emoji: '👦📚', label: 'High School', threshold: 33 },
  { id: 'college', emoji: '🧑‍🎓', label: 'College', threshold: 66 },
]

const TOTAL_DURATION = 4500 // ms

export default function StudentEvolutionLoader() {
  const navigate = useNavigate()
  const location = useLocation()
  const [progress, setProgress] = useState(0)
  const [currentStage, setCurrentStage] = useState(0)
  const [flash, setFlash] = useState(false)
  const startRef = useRef(null)
  const rafRef = useRef(null)

  // Determine redirect destination from location state, default to /dashboard
  const destination = location.state?.redirectTo || '/dashboard'

  useEffect(() => {
    startRef.current = performance.now()

    const tick = (now) => {
      const elapsed = now - startRef.current
      const pct = Math.min((elapsed / TOTAL_DURATION) * 100, 100)
      setProgress(pct)

      // Update stage
      if (pct >= 66) {
        setCurrentStage((prev) => {
          if (prev !== 2) {
            setFlash(true)
            setTimeout(() => setFlash(false), 400)
          }
          return 2
        })
      } else if (pct >= 33) {
        setCurrentStage((prev) => {
          if (prev !== 1) {
            setFlash(true)
            setTimeout(() => setFlash(false), 400)
          }
          return 1
        })
      }

      if (pct < 100) {
        rafRef.current = requestAnimationFrame(tick)
      } else {
        // Animation complete — navigate to destination
        setTimeout(() => {
          navigate(destination, { replace: true })
        }, 400)
      }
    }

    rafRef.current = requestAnimationFrame(tick)

    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current)
    }
  }, [navigate, destination])

  // Calculate walker position (5% to 90% of path width)
  const walkerLeft = 5 + (progress / 100) * 85

  return (
    <div className="evolution-loader">
      {/* Stage transition flash */}
      <div className={`stage-flash ${flash ? 'active' : ''}`} />

      <div className="evolution-content">
        <p className="evolution-title">
          Your learning journey is loading...
        </p>

        {/* Path with walker */}
        <div className="evolution-path">
          {/* Road */}
          <div className="road">
            <div
              className="road-progress"
              style={{ width: `${progress}%` }}
            />
          </div>

          {/* Walking character */}
          <div
            className="walker-container"
            style={{ left: `${walkerLeft}%` }}
          >
            <div className="walker">
              <div className="character-glow" />
              {STAGES.map((stage, index) => (
                <div
                  key={stage.id}
                  className={`character-stage ${
                    currentStage === index ? 'visible' : 'hidden'
                  }`}
                >
                  <span className="character-emoji">{stage.emoji}</span>
                  <span className="character-label">{stage.label}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Stage milestones */}
          <div className="stage-milestones">
            {STAGES.map((stage, index) => (
              <div
                key={stage.id}
                className={`milestone ${
                  currentStage === index
                    ? 'active'
                    : currentStage > index
                    ? 'completed'
                    : ''
                }`}
              >
                <div className="milestone-dot" />
                <span className="milestone-label">{stage.label}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Progress bar */}
        <div className="evolution-progress-bar">
          <div className="progress-track">
            <div
              className="progress-fill"
              style={{ width: `${progress}%` }}
            />
          </div>
          <p className="progress-text">
            {progress < 33
              ? 'Starting your journey...'
              : progress < 66
              ? 'Growing stronger...'
              : progress < 100
              ? 'Almost there...'
              : 'Welcome!'}
          </p>
        </div>
      </div>
    </div>
  )
}
