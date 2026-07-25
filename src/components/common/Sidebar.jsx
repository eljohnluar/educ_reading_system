import React from 'react'
import { NavLink } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import { 
  LayoutDashboard, 
  Users, 
  BarChart3, 
  ClipboardList, 
  User, 
  Trophy, 
  Shield 
} from 'lucide-react'

// User links - only for regular users
const userLinks = [
  { to: '/dashboard', label: 'Dashboard', Icon: LayoutDashboard },
  { to: '/profile', label: 'Profile', Icon: User },
  { to: '/leadership', label: 'Leadership Board', Icon: Trophy },
]

// Admin links - only for admins
const adminLinks = [
  { to: '/admin', label: 'Admin Dashboard', Icon: LayoutDashboard },
  { to: '/admin/users', label: 'Users', Icon: Users },
  { to: '/admin/statistics', label: 'Statistics', Icon: BarChart3 },
  { to: '/admin/activity', label: 'Activity Log', Icon: ClipboardList },
]

export default function Sidebar() {
  const { profile, isAdmin } = useAuth()

  // If admin, show admin links
  if (isAdmin) {
    return (
      <aside className="fixed left-0 top-16 bottom-0 w-64 bg-[#1A2634]/90 backdrop-blur-xl border-r border-white/10 overflow-y-auto z-20">
        <nav className="p-4 space-y-1.5">
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
              className={({ isActive }) =>
                `flex items-center space-x-3 px-4 py-3 rounded-xl text-sm transition-all duration-200 ${
                  isActive
                    ? 'bg-gradient-to-r from-[#E9D2A9] to-[#d4b988] text-[#1A2634] font-bold shadow-lg shadow-[#E9D2A9]/20 scale-[1.02]'
                    : 'text-gray-300 hover:bg-white/10 hover:text-white'
                }`
              }
            >
              <Icon className="w-4 h-4 shrink-0" />
              <span>{label}</span>
            </NavLink>
          ))}
        </nav>
      </aside>
    )
  }

  // Regular user - show user links
  return (
    <aside className="fixed left-0 top-16 bottom-0 w-64 bg-[#1A2634]/90 backdrop-blur-xl border-r border-white/10 overflow-y-auto z-20">
      <nav className="p-4 space-y-1.5">
        {userLinks.map(({ to, label, Icon }) => (
          <NavLink
            key={to}
            to={to}
            className={({ isActive }) =>
              `flex items-center space-x-3 px-4 py-3 rounded-xl text-sm transition-all duration-200 ${
                isActive
                  ? 'bg-gradient-to-r from-[#E9D2A9] to-[#d4b988] text-[#1A2634] font-bold shadow-lg shadow-[#E9D2A9]/20 scale-[1.02]'
                  : 'text-gray-300 hover:bg-white/10 hover:text-white'
              }`
            }
          >
            <Icon className="w-4 h-4 shrink-0" />
            <span>{label}</span>
          </NavLink>
        ))}
      </nav>
    </aside>
  )
}