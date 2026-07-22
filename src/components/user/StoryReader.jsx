import React, { useState, useEffect, useRef, useCallback } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import { storyService } from '../../services/storyService'
import { motion } from 'framer-motion'
import toast from 'react-hot-toast'

export default function StoryReader() {
  const { level, storyId } = useParams()
  const { user } = useAuth()
  const navigate = useNavigate()

  const [content, setContent] = useState('')
  const [timingData, setTimingData] = useState([])
  const [audioUrl, setAudioUrl] = useState('')
  const [imageUrl, setImageUrl] = useState('')
  const [metadata, setMetadata] = useState(null)
  const [isPlaying, setIsPlaying] = useState(false)
  const [currentWordIndex, setCurrentWordIndex] = useState(-1)
  const [progress, setProgress] = useState(0)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState(null)
  const [levelData, setLevelData] = useState(null)

  const audioRef = useRef(null)
  const wordRefs = useRef([])
  const containerRef = useRef(null)
  const animationFrameRef = useRef(null)

  // Load level data
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

  // Load story data
  useEffect(() => {
    async function loadStory() {
      if (!levelData) return

      try {
        setIsLoading(true)
        setError(null)

        const meta = await storyService.getStoryMetadata(levelData.id, parseInt(storyId))
        setMetadata(meta)

        const text = await storyService.getStoryContent(level, parseInt(storyId))
        setContent(text)

        const timing = await storyService.getStoryTiming(level, parseInt(storyId))
        setTimingData(timing.timing || timing)

        const audio = await storyService.getStoryAudioUrl(level, parseInt(storyId))
        setAudioUrl(audio)

        const image = await storyService.getStoryImageUrl(level, parseInt(storyId))
        setImageUrl(image)

      } catch (err) {
        console.error('Error loading story:', err)
        setError('Failed to load story. Please try again.')
      } finally {
        setIsLoading(false)
      }
    }

    loadStory()
  }, [levelData, level, storyId])

  // Audio controls
  const togglePlay = useCallback(() => {
    if (audioRef.current) {
      if (isPlaying) {
        audioRef.current.pause()
      } else {
        audioRef.current.play()
      }
      setIsPlaying(!isPlaying)
    }
  }, [isPlaying])

  const restartAudio = useCallback(() => {
    if (audioRef.current) {
      audioRef.current.currentTime = 0
      setCurrentWordIndex(-1)
      setProgress(0)
      if (!isPlaying) {
        audioRef.current.play()
        setIsPlaying(true)
      }
    }
  }, [isPlaying])

  // Word highlighting sync
  useEffect(() => {
    if (!audioRef.current || !timingData.length) return

    const audio = audioRef.current

    const updateHighlight = () => {
      const currentTime = audio.currentTime

      let foundIndex = -1
      for (let i = 0; i < timingData.length; i++) {
        const word = timingData[i]
        if (currentTime >= word.start && currentTime < word.end) {
          foundIndex = i
          break
        }
      }

      setCurrentWordIndex(foundIndex)

      const totalDuration = audio.duration || timingData[timingData.length - 1]?.end || 1
      setProgress((currentTime / totalDuration) * 100)

      if (foundIndex >= 0 && wordRefs.current[foundIndex]) {
        const wordElement = wordRefs.current[foundIndex]
        const container = containerRef.current
        if (container) {
          const wordRect = wordElement.getBoundingClientRect()
          const containerRect = container.getBoundingClientRect()
          
          if (wordRect.top < containerRect.top || wordRect.bottom > containerRect.bottom) {
            wordElement.scrollIntoView({
              behavior: 'smooth',
              block: 'center'
            })
          }
        }
      }

      animationFrameRef.current = requestAnimationFrame(updateHighlight)
    }

    animationFrameRef.current = requestAnimationFrame(updateHighlight)

    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current)
      }
    }
  }, [timingData])

  // Auto-advance on completion
  useEffect(() => {
    if (!audioRef.current) return

    const audio = audioRef.current

    const handleEnded = () => {
      setIsPlaying(false)
      setProgress(100)
      setTimeout(() => {
        navigate(`/quiz/${level}`)
      }, 2000)
    }

    audio.addEventListener('ended', handleEnded)

    return () => {
      audio.removeEventListener('ended', handleEnded)
    }
  }, [navigate, level])

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === ' ' || e.key === 'Space') {
        e.preventDefault()
        togglePlay()
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [togglePlay])

  // Render content with highlighting
  const renderContentWithHighlight = useCallback(() => {
    if (!content || !timingData.length) return null

    const paragraphs = content.split('\n\n')
    let wordCounter = 0

    return paragraphs.map((paragraph, pIndex) => (
      <p key={pIndex} className="mb-4 leading-relaxed text-lg">
        {paragraph.split(' ').map((word, wIndex) => {
          const currentIndex = wordCounter
          const isActive = currentIndex === currentWordIndex
          const isPast = currentIndex < currentWordIndex

          const cleanWord = word.replace(/[.,!?;:()"]/g, '')
          const punctuation = word.replace(/[a-zA-Z0-9']/g, '')

          wordCounter++

          return (
            <span
              key={currentIndex}
              ref={(el) => (wordRefs.current[currentIndex] = el)}
              className={`
                inline-block transition-all duration-150 cursor-pointer
                ${isActive ? 'scale-110' : ''}
                ${isPast ? 'text-green-600' : ''}
                ${isActive ? 'text-white bg-gold px-1 rounded-md shadow-lg' : ''}
                ${!isPast && !isActive ? 'text-gray-700' : ''}
              `}
            >
              {cleanWord}
              <span className="text-inherit">{punctuation}</span>
              <span className="inline-block w-1"> </span>
            </span>
          )
        })}
      </p>
    ))
  }, [content, timingData, currentWordIndex])

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gold mx-auto mb-4"></div>
          <p className="text-gray-600">Loading story...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center text-red-600">
          <p className="text-xl mb-2">⚠️ {error}</p>
          <button 
            onClick={() => window.location.reload()}
            className="mt-4 px-4 py-2 bg-gold text-white rounded-lg hover:bg-amber-500"
          >
            Retry
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-dark">{metadata?.title || 'Story'}</h1>
          <p className="text-sm text-gray-500 mt-1">
            Level: {level?.charAt(0).toUpperCase() + level?.slice(1)}
          </p>
        </div>
        <button
          onClick={() => navigate('/dashboard')}
          className="text-gray-500 hover:text-dark transition-colors"
        >
          ← Back
        </button>
      </div>

      {/* Image */}
      {imageUrl && (
        <div className="rounded-xl overflow-hidden shadow-lg">
          <img 
            src={imageUrl} 
            alt={metadata?.title || 'Story illustration'}
            className="w-full h-64 object-cover"
            loading="lazy"
            onError={(e) => {
              e.target.style.display = 'none'
            }}
          />
        </div>
      )}

      {/* Audio Player */}
      <div className="bg-white rounded-xl shadow-md p-4">
        <audio
          ref={audioRef}
          src={audioUrl}
          className="hidden"
          preload="auto"
        />
        
        <div className="flex items-center gap-4">
          <button
            onClick={togglePlay}
            className="w-12 h-12 rounded-full bg-gold hover:bg-amber-500 text-white flex items-center justify-center transition-all hover:scale-105"
          >
            {isPlaying ? (
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 9v6m4-6v6m7-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            ) : (
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            )}
          </button>

          <div className="flex-1">
            <div className="relative">
              <input
                type="range"
                min="0"
                max="100"
                value={progress}
                onChange={(e) => {
                  const value = parseFloat(e.target.value)
                  setProgress(value)
                  if (audioRef.current) {
                    const duration = audioRef.current.duration || 1
                    audioRef.current.currentTime = (value / 100) * duration
                  }
                }}
                className="w-full h-2 bg-gray-300 rounded-lg appearance-none cursor-pointer"
                style={{
                  background: `linear-gradient(to right, #E9D2A9 ${progress}%, #d1d5db ${progress}%)`
                }}
              />
            </div>
            <div className="flex justify-between text-xs text-gray-500 mt-1">
              <span>
                {audioRef.current ? formatTime(audioRef.current.currentTime) : '0:00'}
              </span>
              <span>
                {audioRef.current ? formatTime(audioRef.current.duration) : '0:00'}
              </span>
            </div>
          </div>

          <button
            onClick={restartAudio}
            className="p-2 text-gray-600 hover:text-gray-800 transition-colors"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
          </button>
        </div>
      </div>

      {/* Story Content */}
      <div 
        ref={containerRef}
        className="bg-white rounded-xl shadow-md p-6 max-h-96 overflow-y-auto prose max-w-none"
      >
        {renderContentWithHighlight()}
      </div>

      {/* Progress and Navigation */}
      <div className="flex items-center justify-between">
        <div className="text-sm text-gray-500">
          Progress: {Math.round(progress)}%
        </div>
        <button
          onClick={() => navigate(`/quiz/${level}`)}
          className={`px-6 py-2 rounded-lg transition-all ${
            progress >= 50
              ? 'bg-gold hover:bg-amber-500 text-white shadow-md hover:shadow-lg'
              : 'bg-gray-200 text-gray-500 cursor-not-allowed'
          }`}
          disabled={progress < 50}
        >
          {progress >= 50 ? 'Continue to Quiz →' : 'Read more to continue'}
        </button>
      </div>

      {/* Keyboard Shortcut Hint */}
      <div className="text-center text-xs text-gray-400">
        Press <kbd className="px-2 py-1 bg-gray-200 rounded">Space</kbd> to play/pause
      </div>
    </div>
  )
}

function formatTime(seconds) {
  if (!seconds || isNaN(seconds)) return '0:00'
  const mins = Math.floor(seconds / 60)
  const secs = Math.floor(seconds % 60)
  return `${mins}:${secs.toString().padStart(2, '0')}`
}