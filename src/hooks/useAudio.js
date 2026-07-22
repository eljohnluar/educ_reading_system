import { useState, useEffect, useRef } from 'react'

export function useAudio(url) {
  const [isPlaying, setIsPlaying] = useState(false)
  const [progress, setProgress] = useState(0)
  const [duration, setDuration] = useState(0)
  const [currentTime, setCurrentTime] = useState(0)
  const audioRef = useRef(null)

  useEffect(() => {
    audioRef.current = new Audio(url)
    audioRef.current.addEventListener('loadedmetadata', () => {
      setDuration(audioRef.current.duration)
    })
    audioRef.current.addEventListener('timeupdate', () => {
      setCurrentTime(audioRef.current.currentTime)
      setProgress((audioRef.current.currentTime / audioRef.current.duration) * 100)
    })
    audioRef.current.addEventListener('ended', () => {
      setIsPlaying(false)
      setProgress(100)
    })

    return () => {
      if (audioRef.current) {
        audioRef.current.pause()
        audioRef.current.removeEventListener('loadedmetadata', () => {})
        audioRef.current.removeEventListener('timeupdate', () => {})
        audioRef.current.removeEventListener('ended', () => {})
      }
    }
  }, [url])

  const play = () => {
    if (audioRef.current) {
      audioRef.current.play()
      setIsPlaying(true)
    }
  }

  const pause = () => {
    if (audioRef.current) {
      audioRef.current.pause()
      setIsPlaying(false)
    }
  }

  const toggle = () => {
    if (isPlaying) {
      pause()
    } else {
      play()
    }
  }

  const seek = (value) => {
    if (audioRef.current) {
      const time = (value / 100) * audioRef.current.duration
      audioRef.current.currentTime = time
      setCurrentTime(time)
      setProgress(value)
    }
  }

  const restart = () => {
    if (audioRef.current) {
      audioRef.current.currentTime = 0
      setCurrentTime(0)
      setProgress(0)
      if (!isPlaying) {
        play()
      }
    }
  }

  return {
    isPlaying,
    progress,
    duration,
    currentTime,
    play,
    pause,
    toggle,
    seek,
    restart,
    audioRef
  }
}