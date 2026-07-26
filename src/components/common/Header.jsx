import React from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import toast from 'react-hot-toast'
import { LogOut, Menu } from 'lucide-react'

export default function Header({ onMenuToggle }) {
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
          {/* Mobile Hamburguer Menu */}
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
            <h1 className="text-base font-bold text-white tracking-tight">
              Read Well <span className="text-[#E9D2A9] font-medium">English Zone</span>
            </h1>
          </Link>
        </div>

        <div className="flex items-center space-x-4">
          {user && (
            <>
              {/* Only show profile avatar for regular users */}
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
                </Link>
              )}
              
              <button
                onClick={handleLogout}
                className="flex items-center gap-1.5 text-xs font-medium text-gray-300 hover:text-white bg-white/10 hover:bg-red-500/80 border border-white/20 hover:border-red-400 rounded-lg px-3 py-1.5 transition-all duration-200"
              >
                <LogOut className="w-3.5 h-3.5" />
                Logout
              </button>
            </>
          )}
        </div>
      </div>
    </header>
  )
}