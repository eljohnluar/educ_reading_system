import React from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import toast from 'react-hot-toast'

export default function Header({ user, profile }) {
  const navigate = useNavigate()
  const { signOut } = useAuth()

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
    <header className="fixed top-0 left-0 right-0 z-50 bg-white shadow-md">
      <div className="flex items-center justify-between px-6 py-3">
        <div className="flex items-center space-x-4">
          <Link to="/dashboard" className="flex items-center space-x-3">
            <img 
              src="/assets/images/icons/logo.png" 
              alt="Read Well" 
              className="h-10 w-10"
              onError={(e) => {
                e.target.src = 'https://placehold.co/40x40/8BC34A/FFFFFF?text=RW'
              }}
            />
            <h1 className="text-xl font-bold text-dark">
              Read Well <span className="text-gold">English Zone</span>
            </h1>
          </Link>
        </div>

        <div className="flex items-center space-x-4">
          {user && (
            <>
              <Link to="/profile" className="flex items-center space-x-2 hover:opacity-75">
                <img 
                  src={profile?.avatar_url || '/assets/images/avatars/default.jpg'}
                  alt="Avatar"
                  className="w-8 h-8 rounded-full object-cover border-2 border-gold"
                  onError={(e) => {
                    e.target.src = '/assets/images/avatars/default.jpg'
                  }}
                />
                <span className="text-sm text-gray-700 hidden md:block">
                  {profile?.username || user.email}
                </span>
              </Link>
              <button
                onClick={handleLogout}
                className="text-sm text-gray-600 hover:text-red-600 transition-colors"
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