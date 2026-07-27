import React, { useState, useRef, useEffect } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import toast from 'react-hot-toast'
import { LogOut, Menu, User } from 'lucide-react'

export default function Header({ onMenuToggle }) {
  const navigate = useNavigate()
  const location = useLocation()
  const { user, profile, isAdmin, signOut } = useAuth()
  const [dropdownOpen, setDropdownOpen] = useState(false)
  const dropdownRef = useRef(null)

  // ✅ Check if on Quiz or Results page
  const isQuizOrResults = location.pathname.startsWith('/quiz') || 
                          location.pathname.startsWith('/results')

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setDropdownOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const handleLogout = async () => {
    try {
      setDropdownOpen(false)
      await signOut()
      toast.success('Logged out successfully')
      navigate('/login')
    } catch (error) {
      toast.error('Failed to logout')
    }
  }

  // Get avatar URL with fallback placeholder
  const getAvatarUrl = () => {
    if (profile?.avatar_url && !profile.avatar_url.includes('default')) {
      return profile.avatar_url
    }
    // Use a data URI or SVG placeholder if default image doesn't exist
    return `data:image/svg+xml,${encodeURIComponent(`
      <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 32 32">
        <circle cx="16" cy="16" r="16" fill="#E9D2A9"/>
        <circle cx="16" cy="12" r="5" fill="#1A2634" opacity="0.6"/>
        <path d="M5 26 Q16 20 27 26" stroke="#1A2634" stroke-width="3" fill="none" opacity="0.6"/>
      </svg>
    `)}`
  }

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-[#1A2634]/90 backdrop-blur-xl border-b border-white/10">
      <div className="flex items-center justify-between px-4 sm:px-6 py-3.5">
        <div className="flex items-center space-x-3">
          {/* Mobile Hamburger Menu */}
          <button
            onClick={onMenuToggle}
            className="md:hidden p-1.5 -ml-1 text-gray-300 hover:text-white hover:bg-white/10 rounded-lg transition-colors focus:outline-none"
            aria-label="Toggle menu"
          >
            <Menu className="w-5 h-5" />
          </button>

          <Link to={isAdmin ? "/admin" : "/dashboard"} className="flex items-center space-x-2.5">
            <img 
              src="/assets/images/icons/logo.svg" 
              alt="Read Well" 
              className="h-8 w-8"
              onError={(e) => {
                e.target.src = 'https://placehold.co/32x32/E9D2A9/1A2634?text=RW'
              }}
            />
            <h1 className="text-sm sm:text-base font-bold text-white tracking-tight">
              Read Well <span className="text-[#E9D2A9] font-medium">English Zone</span>
            </h1>
          </Link>
        </div>

        <div className="flex items-center">
          {user && !isAdmin && (
            <div className="relative" ref={dropdownRef}>
              {/* Profile Avatar Button - Disabled on Quiz/Results */}
              <button
                onClick={() => {
                  if (!isQuizOrResults) {
                    setDropdownOpen((prev) => !prev)
                  }
                }}
                className={`flex items-center focus:outline-none ${
                  isQuizOrResults ? 'cursor-default opacity-70' : 'hover:opacity-80 transition-opacity cursor-pointer'
                }`}
                aria-label="User menu"
                disabled={isQuizOrResults}
              >
                <img 
                  src={getAvatarUrl()}
                  alt={profile?.username || 'User'}
                  className={`w-8 h-8 rounded-full object-cover border-2 border-[#E9D2A9]/60 transition-colors ${
                    isQuizOrResults ? '' : 'hover:border-[#E9D2A9]'
                  }`}
                  onError={(e) => {
                    // Fallback to initials if image fails
                    e.target.style.display = 'none'
                    const parent = e.target.parentElement
                    if (parent) {
                      const fallback = document.createElement('div')
                      fallback.className = 'w-8 h-8 rounded-full bg-[#E9D2A9]/20 border-2 border-[#E9D2A9]/60 flex items-center justify-center text-white text-sm font-bold'
                      fallback.textContent = profile?.username?.charAt(0).toUpperCase() || 'U'
                      parent.appendChild(fallback)
                    }
                  }}
                />
              </button>

              {/* Dropdown Modal - Only shown when not on Quiz/Results */}
              {!isQuizOrResults && dropdownOpen && (
                <div className="absolute right-0 top-full mt-2 w-48 bg-[#1A2634] backdrop-blur-xl border border-white/15 rounded-xl shadow-2xl overflow-hidden z-[60] animate-in fade-in slide-in-from-top-1">
                  <div className="py-1.5">
                    <Link
                      to="/profile"
                      onClick={() => setDropdownOpen(false)}
                      className="flex items-center gap-3 px-4 py-2.5 text-sm text-gray-300 hover:bg-white/10 hover:text-white transition-colors"
                    >
                      <User className="w-4 h-4" />
                      Profile
                    </Link>
                    <div className="mx-3 border-t border-white/10" />
                    <button
                      onClick={handleLogout}
                      className="flex items-center gap-3 w-full text-left px-4 py-2.5 text-sm text-gray-300 hover:bg-red-500/20 hover:text-red-300 transition-colors"
                    >
                      <LogOut className="w-4 h-4" />
                      Logout
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </header>
  )
}