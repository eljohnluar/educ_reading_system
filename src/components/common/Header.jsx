// src/components/common/Header.jsx

import React from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import toast from 'react-hot-toast'

export default function Header() {
  const navigate = useNavigate()
  const { user, profile, isAdmin, signOut } = useAuth()

  const handleLogout = async () => {
    try {
      await signOut()
      toast.success('Logged out successfully')
      navigate('/login')
    } catch (error) {
      toast.error('Failed to logout')
    }
  }

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-[#1A2634]/90 backdrop-blur-xl border-b border-white/10">
      <div className="flex items-center justify-between px-6 py-3.5">
        <div className="flex items-center space-x-3">
          <Link to={isAdmin ? "/admin" : "/dashboard"} className="flex items-center space-x-2.5">
            <img 
              src="/assets/images/icons/logo.png" 
              alt="Read Well" 
              className="h-8 w-8"
              onError={(e) => {
                e.target.src = 'https://placehold.co/32x32/E9D2A9/1A2634?text=RW'
              }}
            />
            <h1 className="text-base font-bold text-white tracking-tight">
              Read Well <span className="text-[#E9D2A9] font-medium">English Zone</span>
            </h1>
          </Link>
          {isAdmin && (
            <span className="text-[11px] bg-[#E9D2A9]/20 text-[#E9D2A9] border border-[#E9D2A9]/40 px-2.5 py-0.5 rounded-full font-semibold tracking-wide">
              Admin
            </span>
          )}
        </div>

        <div className="flex items-center space-x-4">
          {user && (
            <>
              {/* Only show profile link for regular users */}
              {!isAdmin && (
                <Link to="/profile" className="flex items-center space-x-2 hover:opacity-80 transition-opacity">
                  <img 
                    src={profile?.avatar_url || '/assets/images/avatars/default.jpg'}
                    alt="Avatar"
                    className="w-7 h-7 rounded-full object-cover border border-[#E9D2A9]"
                    onError={(e) => {
                      e.target.src = '/assets/images/avatars/default.jpg'
                    }}
                  />
                  <span className="text-xs text-gray-200 font-medium hidden md:block">
                    {profile?.username || user.email}
                  </span>
                </Link>
              )}
              
              {/* Show admin label in header */}
              {isAdmin && (
                <div className="flex items-center space-x-2">
                  <span className="text-xs font-medium text-gray-300 hidden md:block">
                    {profile?.username || 'Admin'}
                  </span>
                </div>
              )}
              
              <button
                onClick={handleLogout}
                className="text-xs font-medium text-gray-300 hover:text-[#E9D2A9] transition-colors px-2 py-1"
              >
                Logout
              </button>
            </>
          )}
        </div>
      </div>
    </header>
  )
}