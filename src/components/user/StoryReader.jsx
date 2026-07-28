import React, { useState, useEffect, useRef, useCallback } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { storyService } from '../../services/storyService'
import toast from 'react-hot-toast'

export default function StoryReader() {
  const { level, storyId } = useParams()
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

  const audioRef = useRef(null)
  const wordRefs = useRef([])
  const containerRef = useRef(null)

  const VALID_LEVELS = ['easy', 'average', 'difficult']

  // Validate level
  useEffect(() => {
    if (!VALID_LEVELS.includes(level)) {
      setError(`The "${level}" reading level was not found.`)
      setIsLoading(false)
    }
  }, [level])

  // Load story data
  useEffect(() => {
    async function loadStory() {
      if (!VALID_LEVELS.includes(level)) return

      try {
        setIsLoading(true)
        setError(null)

        const parsedStoryId = Number.parseInt(storyId, 10)
        if (!Number.isInteger(parsedStoryId) || parsedStoryId < 1) {
          throw new Error('The story number is invalid.')
        }

        const meta = await storyService.getStoryMetadata(level, parsedStoryId)
        setMetadata(meta)

        const assetPaths = await storyService.getStoryAssetPaths(level, parsedStoryId, meta || {})

        const text = await storyService.getStoryContent(level, parsedStoryId, assetPaths.filePath)
        setContent(text)

        const timing = await storyService.getStoryTiming(level, parsedStoryId, assetPaths.jsonPath)
        setTimingData(getTimingEntries(timing))

        const audio = await storyService.getStoryAudioUrl(level, parsedStoryId, assetPaths.audioPath)
        setAudioUrl(audio)

        const image = await storyService.getStoryImageUrl(level, parsedStoryId, assetPaths.imagePath)
        setImageUrl(image)

      } catch (err) {
        console.error('Error loading story:', err)
        setError('Failed to load story. Please try again.')
      } finally {
        setIsLoading(false)
      }
    }

    loadStory()
  }, [level, storyId])

  // Audio controls
  const togglePlay = useCallback(() => {
    const audio = audioRef.current
    if (!audio) return

    if (audio.paused) {
      audio.play().catch(() => {})
    } else {
      audio.pause()
    }
  }, [])

  const restartAudio = useCallback(() => {
    const audio = audioRef.current
    if (audio) {
      audio.currentTime = 0
      setCurrentWordIndex(-1)
      setProgress(0)
      if (audio.paused) {
        audio.play().catch(() => {})
      }
    }
  }, [])

  const handleAudioTimeUpdate = useCallback((event) => {
    const audio = event.currentTarget
    const currentTime = audio.currentTime
    const foundIndex = timingData.findIndex(({ start, end }) =>
      Number.isFinite(start) && Number.isFinite(end) && currentTime >= start && currentTime < end
    )

    setCurrentWordIndex(foundIndex)

    const timingDuration = timingData.reduce(
      (latestEnd, { end }) => Number.isFinite(end) ? Math.max(latestEnd, end) : latestEnd,
      0
    )
    const totalDuration = Number.isFinite(audio.duration) && audio.duration > 0
      ? audio.duration
      : timingDuration
    setProgress(totalDuration ? (currentTime / totalDuration) * 100 : 0)

    const wordElement = foundIndex >= 0 ? wordRefs.current[foundIndex] : null
    const container = containerRef.current
    if (wordElement && container) {
      const wordRect = wordElement.getBoundingClientRect()
      const containerRect = container.getBoundingClientRect()
      if (wordRect.top < containerRect.top || wordRect.bottom > containerRect.bottom) {
        wordElement.scrollIntoView({ behavior: 'smooth', block: 'center' })
      }
    }
  }, [timingData])

  const handleAudioEnded = useCallback(() => {
    setIsPlaying(false)
    setProgress(100)
    setTimeout(() => {
      navigate(`/quiz/${level}`)
    }, 2000)
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
    if (!content) return null

    const paragraphs = content.split('\n\n')
    let wordCounter = 0

    return paragraphs.map((paragraph, pIndex) => (
      <p key={pIndex} className="mb-6 last:mb-0 text-xl leading-loose text-dark">
        {paragraph.split(' ').map((word) => {
          const currentIndex = wordCounter
          const isActive = currentIndex === currentWordIndex
          const isPast = currentIndex < currentWordIndex

          const cleanWord = word.replace(/[.,!?;:()"]/g, '')
          const punctuation = word.replace(/[a-zA-Z0-9']/g, '')

          wordCounter++

          return (
            <React.Fragment key={currentIndex}>
              <span
                ref={(el) => (wordRefs.current[currentIndex] = el)}
                className={`transition-colors duration-75 px-1 py-0.5 rounded-lg ${
                  isActive ? 'bg-emerald-500 text-white font-bold shadow-sm' : 
                  isPast ? 'font-bold text-dark' : 'text-dark font-normal'
                }`}
              >
                {cleanWord}
                <span className="text-inherit">{punctuation}</span>
              </span>
              <span> </span>
            </React.Fragment>
          )
        })}
      </p>
    ))
  }, [content, currentWordIndex])

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="spinner mx-auto border-gold"></div>
          <p className="text-medium mt-4 font-medium">Loading story...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <p className="text-error text-xl mb-4 font-bold">⚠️ {error}</p>
          <button onClick={() => window.location.reload()} className="px-6 py-2 bg-gold text-dark font-bold rounded-full active:scale-95 transition-transform">
            Try Again
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-2 flex flex-col" style={{ height: 'calc(100vh - 5rem)' }}>
      {/* Navigation */}
      <div className="mb-2">
        <button 
          onClick={() => navigate('/dashboard')} 
          className="flex items-center gap-2 text-medium font-bold active:opacity-70 transition-opacity text-sm"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M15 19l-7-7 7-7" /></svg>
          Back
        </button>
      </div>

      {/* Media Header (Image + Title + Controls) */}
      <div className="flex flex-col md:flex-row items-center md:items-end justify-center gap-3 mb-3 max-w-3xl mx-auto">
        {/* Image */}
        {imageUrl && (
          <img 
            src={imageUrl} 
            alt={metadata?.title || 'Story illustration'}
            className="w-24 h-24 md:w-28 md:h-28 rounded-2xl object-cover shadow-sm border-3 border-white flex-shrink-0"
            loading="lazy"
            onError={(e) => {
              e.target.style.display = 'none'
            }}
          />
        )}

        {/* Info & Controls */}
        <div className="flex-1 flex flex-col justify-center w-full max-w-lg">
          {/* Title */}
          <div className="text-center md:text-left mb-2">
            <h1 className="text-xl md:text-2xl font-bold text-dark">{metadata?.title || 'Story'}</h1>
            <p className="text-xs font-bold text-medium opacity-80 mt-0.5">
              Level: {level?.charAt(0).toUpperCase() + level?.slice(1)}
            </p>
          </div>

          {/* Audio Player */}
          <div className="bg-white rounded-full p-2 flex items-center gap-4 shadow-sm w-full">
            <audio
              ref={audioRef}
              src={audioUrl}
              className="hidden"
              preload="auto"
              onPlay={() => setIsPlaying(true)}
              onPause={() => setIsPlaying(false)}
              onTimeUpdate={handleAudioTimeUpdate}
              onEnded={handleAudioEnded}
            />
            
            <button 
              onClick={togglePlay} 
              className="w-12 h-12 rounded-full bg-gold text-dark flex items-center justify-center flex-shrink-0 active:scale-95 transition-transform shadow-sm"
            >
              {isPlaying ? (
                <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zM7 8a1 1 0 012 0v4a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v4a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
              ) : (
                <svg className="w-6 h-6 ml-1" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" clipRule="evenodd" />
                </svg>
              )}
            </button>

            <div className="flex-1 px-2 flex items-center">
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
                className="w-full h-2 bg-cream rounded-full appearance-none accent-medium"
              />
            </div>

            <span className="text-sm text-dark font-bold font-mono min-w-[3rem]">
              {audioRef.current ? formatTime(audioRef.current.currentTime) : '0:00'}
            </span>

            <button 
              onClick={restartAudio} 
              className="w-10 h-10 rounded-full text-dark flex items-center justify-center active:bg-gold active:scale-95 transition-all mr-1"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
            </button>
          </div>
        </div>
      </div>

      {/* Story Content */}
      <div 
        ref={containerRef} 
        className="bg-white rounded-2xl p-4 md:p-6 overflow-y-auto shadow-sm border-2 border-cream flex-1 min-h-0 mb-2"
      >
        {renderContentWithHighlight()}
      </div>

      {/* Progress and Navigation */}
      <div className="flex items-center justify-between py-2 flex-shrink-0">
        <span className="text-sm font-bold text-medium">
          {Math.round(progress)}% read
        </span>
        <button
          onClick={() => navigate(`/quiz/${level}`)}
          className={`px-6 py-2 rounded-full font-bold text-base transition-transform ${
            progress >= 50
              ? 'bg-gold text-dark active:scale-95 shadow-sm'
              : 'bg-cream text-medium opacity-50 cursor-not-allowed'
          }`}
          disabled={progress < 50}
        >
          {progress >= 50 ? 'Quiz Time! →' : 'Read more to unlock'}
        </button>
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

function getTimingEntries(timing) {
  if (Array.isArray(timing)) return timing
  const entries = timing?.karaoke || timing?.timing || timing?.words
  return Array.isArray(entries) ? entries : []
}