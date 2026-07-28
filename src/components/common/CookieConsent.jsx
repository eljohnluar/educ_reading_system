// src/components/common/CookieConsent.jsx
import React, { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'

export default function CookieConsent() {
  const [visible, setVisible] = useState(false)
  const [showDetails, setShowDetails] = useState(false)

  useEffect(() => {
    // Check if user already made a choice
    const consent = localStorage.getItem('cookieConsent')
    if (!consent) {
      // Show banner after a short delay for better UX
      const timer = setTimeout(() => setVisible(true), 1000)
      return () => clearTimeout(timer)
    }
  }, [])

  const acceptAll = () => {
    localStorage.setItem('cookieConsent', 'all')
    setVisible(false)
    // You can enable analytics here if you have them
  }

  const acceptEssential = () => {
    localStorage.setItem('cookieConsent', 'essential')
    setVisible(false)
  }

  const declineAll = () => {
    localStorage.setItem('cookieConsent', 'declined')
    setVisible(false)
  }

  if (!visible) return null

  return (
    <div className="fixed bottom-6 left-4 right-4 md:left-auto md:right-6 md:max-w-md z-50 animate-in slide-in-from-bottom-4 fade-in duration-300">
      <div className="bg-[#1A2634]/95 backdrop-blur-xl rounded-2xl border border-white/10 shadow-2xl p-5">
        <div className="space-y-4">
          {/* Header */}
          <div className="flex items-start gap-3">
            <span className="text-2xl flex-shrink-0">🍪</span>
            <div className="flex-1 min-w-0">
              <h3 className="text-sm font-bold text-white">Cookie Consent</h3>
              <p className="text-xs text-gray-400 mt-0.5">
                We use cookies to improve your experience. By continuing, you agree to our{' '}
                <Link to="/privacy" className="text-[#E9D2A9] hover:underline transition-colors">
                  Privacy Policy
                </Link>
                .
              </p>
            </div>
          </div>

          {/* Details Toggle */}
          <button
            onClick={() => setShowDetails(!showDetails)}
            className="text-xs text-gray-500 hover:text-[#E9D2A9] transition-colors flex items-center gap-1"
          >
            {showDetails ? 'Hide details' : 'Show details'}
            <svg className={`w-3 h-3 transition-transform ${showDetails ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </button>

          {/* Details */}
          {showDetails && (
            <div className="space-y-1.5 p-3 bg-white/5 rounded-xl text-xs text-gray-400 border border-white/5">
              <p className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-[#8BC34A]"></span>
                <span className="text-white">Essential cookies</span> - Required for login and core features
              </p>
              <p className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-[#E9D2A9]"></span>
                <span className="text-white">Functionality cookies</span> - Remember your preferences
              </p>
              <p className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-[#64B5F6]"></span>
                <span className="text-white">Analytics cookies</span> - Help us improve the platform
              </p>
              <p className="mt-2 text-gray-500 text-[10px]">
                You can change your preferences anytime in your browser settings.
              </p>
            </div>
          )}

          {/* Buttons */}
          <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-white/5">
            <button
              onClick={declineAll}
              className="px-3 py-1.5 text-xs text-gray-400 hover:text-white transition-colors"
            >
              Decline
            </button>
            <button
              onClick={acceptEssential}
              className="px-4 py-1.5 text-xs font-medium text-gray-300 border border-white/10 rounded-xl hover:bg-white/5 transition-colors"
            >
              Essential Only
            </button>
            <button
              onClick={acceptAll}
              className="px-5 py-1.5 text-xs font-semibold bg-[#E9D2A9] text-[#1A2634] rounded-xl hover:bg-[#d4b988] transition-colors shadow-lg shadow-[#E9D2A9]/20 ml-auto"
            >
              Accept All
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}