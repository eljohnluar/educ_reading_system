import React from 'react'
import { NavLink, useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import toast from 'react-hot-toast'
import { 
  LayoutDashboard, 
  Users, 
  BarChart3, 
  ClipboardList, 
  User, 
  Trophy, 
  Shield,
  LogOut 
} from 'lucide-react'

// User links - only for regular users
const userLinks = [
  { to: '/dashboard', label: 'Dashboard', Icon: LayoutDashboard },
  { to: '/profile', label: 'Profile', Icon: User },
  { to: '/leadership', label: 'Leaderboard', Icon: Trophy },
]

// Admin links - only for admins
const adminLinks = [
  { to: '/admin', label: 'Admin Dashboard', Icon: LayoutDashboard },
  { to: '/admin/users', label: 'Users', Icon: Users },
  { to: '/admin/statistics', label: 'Statistics', Icon: BarChart3 },
  { to: '/admin/activity', label: 'Activity Log', Icon: ClipboardList },
]

export default function Sidebar({ isOpen, onClose }) {
  const { profile, isAdmin, signOut } = useAuth()
  const navigate = useNavigate()

  const handleLogout = async () => {
    try {
      if (onClose) onClose()
      await signOut()
      toast.success('Logged out successfully')
      navigate('/login')
    } catch (error) {
      toast.error('Failed to logout')
    }
  }

  // If admin, show admin links
  if (isAdmin) {
    return (
      <>
        {/* Mobile Backdrop */}
        {isOpen && (
          <div 
            className="fixed inset-0 bg-black/55 backdrop-blur-sm z-30 md:hidden"
            onClick={onClose}
          />
        )}
        <aside className={`fixed left-0 top-16 bottom-0 w-64 bg-[#1A2634]/95 md:bg-[#1A2634]/90 backdrop-blur-xl border-r border-white/10 z-40 transition-transform duration-300 md:translate-x-0 ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}>
          <div className="flex flex-col h-full">
            <nav className="p-4 space-y-1.5 flex-1 overflow-y-auto">
              <div className="pb-3 mb-3 px-3 border-b border-white/10">
                <p className="text-[11px] uppercase tracking-wider text-[#E9D2A9] font-semibold flex items-center gap-2">
                  <Shield className="w-3.5 h-3.5 text-[#E9D2A9]" />
                  Admin Panel
                </p>
              </div>
              {adminLinks.map(({ to, label, Icon }) => (
                <NavLink
                  key={to}
                  to={to}
                  onClick={onClose}
                  className="flex items-center space-x-3 px-4 py-3 rounded-xl text-sm text-gray-300 font-medium transition-all duration-200 active:scale-[0.98] hover:bg-gradient-to-r hover:from-[#E9D2A9] hover:to-[#d4b988] hover:text-[#1A2634] hover:font-bold hover:shadow-lg hover:shadow-[#E9D2A9]/30 active:shadow-[#E9D2A9]/50"
                >
                  <Icon className="w-4 h-4 shrink-0" />
                  <span>{label}</span>
                </NavLink>
              ))}
            </nav>

            {/* Logout Button at Bottom */}
            <div className="p-4 border-t border-white/10">
              <button
                onClick={handleLogout}
                className="flex items-center space-x-3 w-full px-4 py-3 rounded-xl text-sm text-gray-400 font-medium transition-all duration-200 hover:bg-red-500/15 hover:text-red-400 active:scale-[0.98]"
              >
                <LogOut className="w-4 h-4 shrink-0" />
                <span>Logout</span>
              </button>
            </div>
          </div>
        </aside>
      </>
    )
  }

  // Regular user - show user links
  return (
    <>
      {/* Mobile Backdrop */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black/55 backdrop-blur-sm z-30 md:hidden"
          onClick={onClose}
        />
      )}
      <aside className={`fixed left-0 top-16 bottom-0 w-64 bg-[#1A2634]/95 md:bg-[#1A2634]/90 backdrop-blur-xl border-r border-white/10 overflow-y-auto z-40 transition-transform duration-300 md:translate-x-0 ${
        isOpen ? 'translate-x-0' : '-translate-x-full'
      }`}>
        <nav className="p-4 space-y-1.5">
          {userLinks.map(({ to, label, Icon }) => (
            <NavLink
              key={to}
              to={to}
              onClick={onClose}
              className="flex items-center space-x-3 px-4 py-3 rounded-xl text-sm text-gray-300 font-medium transition-all duration-200 active:scale-[0.98] hover:bg-gradient-to-r hover:from-[#E9D2A9] hover:to-[#d4b988] hover:text-[#1A2634] hover:font-bold hover:shadow-lg hover:shadow-[#E9D2A9]/30 active:shadow-[#E9D2A9]/50"
            >
              <Icon className="w-4 h-4 shrink-0" />
              <span>{label}</span>
            </NavLink>
          ))}
        </nav>
      </aside>
    </>
  )
}