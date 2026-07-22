import React, { useState, useEffect } from 'react'
import { adminService } from '../../services/adminService'
import { motion } from 'framer-motion'
import toast from 'react-hot-toast'

export default function FeedbackView() {
  const [feedback, setFeedback] = useState([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState('all')

  useEffect(() => {
    fetchFeedback()
  }, [])

  const fetchFeedback = async () => {
    try {
      setLoading(true)
      const data = await adminService.getFeedback(100)
      setFeedback(data || [])
    } catch (error) {
      console.error('Error fetching feedback:', error)
      toast.error('Failed to load feedback')
    } finally {
      setLoading(false)
    }
  }

  const filteredFeedback = feedback.filter(item => {
    if (filter === 'all') return true
    if (filter === 'high') return item.rating >= 4
    if (filter === 'medium') return item.rating === 3
    if (filter === 'low') return item.rating <= 2
    return true
  })

  const getRatingColor = (rating) => {
    if (rating >= 4) return 'text-green-500'
    if (rating === 3) return 'text-yellow-500'
    return 'text-red-500'
  }

  const getStarLabel = (rating) => {
    return '⭐'.repeat(rating) + '☆'.repeat(5 - rating)
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gold"></div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-dark">💬 Feedback</h1>
        <span className="text-sm text-gray-500">{feedback.length} total</span>
      </div>

      {/* Filters */}
      <div className="flex gap-2 flex-wrap">
        <button
          onClick={() => setFilter('all')}
          className={`px-4 py-2 rounded-lg transition-all ${
            filter === 'all'
              ? 'bg-gold text-white shadow-md'
              : 'bg-white text-gray-600 hover:bg-cream'
          }`}
        >
          All
        </button>
        <button
          onClick={() => setFilter('high')}
          className={`px-4 py-2 rounded-lg transition-all ${
            filter === 'high'
              ? 'bg-green-500 text-white shadow-md'
              : 'bg-white text-gray-600 hover:bg-cream'
          }`}
        >
          High Rating (4-5)
        </button>
        <button
          onClick={() => setFilter('medium')}
          className={`px-4 py-2 rounded-lg transition-all ${
            filter === 'medium'
              ? 'bg-yellow-500 text-white shadow-md'
              : 'bg-white text-gray-600 hover:bg-cream'
          }`}
        >
          Medium Rating (3)
        </button>
        <button
          onClick={() => setFilter('low')}
          className={`px-4 py-2 rounded-lg transition-all ${
            filter === 'low'
              ? 'bg-red-500 text-white shadow-md'
              : 'bg-white text-gray-600 hover:bg-cream'
          }`}
        >
          Low Rating (1-2)
        </button>
      </div>

      {/* Feedback List */}
      <div className="space-y-4">
        {filteredFeedback.length === 0 ? (
          <div className="bg-white rounded-xl shadow-md p-8 text-center text-gray-500">
            No feedback found
          </div>
        ) : (
          filteredFeedback.map((item) => (
            <motion.div
              key={item.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white rounded-xl shadow-md p-6 hover:shadow-lg transition-all"
            >
              <div className="flex items-start justify-between">
                <div className="flex items-center space-x-3">
                  <div className="flex-shrink-0">
                    {item.is_anonymous ? (
                      <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center text-gray-500">
                        👤
                      </div>
                    ) : (
                      <img
                        src={item.profiles?.avatar_url || '/assets/images/avatars/default.jpg'}
                        alt={item.profiles?.username || 'Anonymous'}
                        className="w-10 h-10 rounded-full object-cover"
                        onError={(e) => {
                          e.target.src = '/assets/images/avatars/default.jpg'
                        }}
                      />
                    )}
                  </div>
                  <div>
                    <p className="font-medium text-dark">
                      {item.is_anonymous ? 'Anonymous' : item.profiles?.username || 'Unknown User'}
                    </p>
                    <p className="text-xs text-gray-400">
                      {item.levels?.level_name || 'Unknown Level'} • 
                      {new Date(item.created_at).toLocaleDateString()}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <p className={`text-lg font-bold ${getRatingColor(item.rating)}`}>
                    {getStarLabel(item.rating)}
                  </p>
                  <p className="text-sm text-gray-500">{item.rating}/5</p>
                </div>
              </div>

              {item.comment && (
                <div className="mt-3 p-3 bg-cream rounded-lg">
                  <p className="text-gray-700">{item.comment}</p>
                </div>
              )}

              <div className="mt-3 flex items-center space-x-4 text-xs text-gray-400">
                <span>Story ID: {item.story_id || 'N/A'}</span>
                {item.is_anonymous && <span>🔒 Anonymous</span>}
              </div>
            </motion.div>
          ))
        )}
      </div>
    </div>
  )
}