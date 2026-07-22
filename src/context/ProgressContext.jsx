import React, { createContext, useContext, useState, useEffect } from 'react'
import { useAuth } from './AuthContext'
import { progressService } from '../services/progressService'

const ProgressContext = createContext()

export const useProgress = () => useContext(ProgressContext)

export function ProgressProvider({ children }) {
  const { user } = useAuth()
  const [progress, setProgress] = useState(null)
  const [stats, setStats] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (user) {
      fetchProgress()
    } else {
      setProgress(null)
      setStats(null)
      setLoading(false)
    }
  }, [user])

  const fetchProgress = async () => {
    try {
      setLoading(true)
      const [progressData, statsData] = await Promise.all([
        progressService.getUserProgressSummary(user.id),
        progressService.getUserStats(user.id)
      ])
      setProgress(progressData)
      setStats(statsData)
    } catch (error) {
      console.error('Error fetching progress:', error)
    } finally {
      setLoading(false)
    }
  }

  const refreshProgress = () => {
    fetchProgress()
  }

  const value = {
    progress,
    stats,
    loading,
    refreshProgress
  }

  return (
    <ProgressContext.Provider value={value}>
      {children}
    </ProgressContext.Provider>
  )
}