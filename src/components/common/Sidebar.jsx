import React from 'react'
import { NavLink } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'

// User links - only for regular users
const userLinks = [
  { to: '/dashboard', label: 'Dashboard', icon: '📊' },
  { to: '/profile', label: 'Profile', icon: '👤' },
  { to: '/leadership', label: 'Leadership Board', icon: '🏆' },
]

// Admin links - only for admins
const adminLinks = [
  { to: '/admin', label: 'Admin Dashboard', icon: '⚙️' },
  { to: '/admin/users', label: 'Users', icon: '👥' },
  { to: '/admin/statistics', label: 'Statistics', icon: '📈' },
  { to: '/admin/activity', label: 'Activity Log', icon: '📋' },
]

export default function Sidebar() {
  const { profile, isAdmin } = useAuth()

  // If admin, only show admin links
  if (isAdmin) {
    return (
      <aside className="fixed left-0 top-16 bottom-0 w-64 bg-white shadow-lg overflow-y-auto">
        <nav className="p-4 space-y-1">
          <div className="pb-4 mb-4 border-b border-gray-200">
            <p className="text-xs uppercase text-gold font-semibold px-4">
              👑 Admin Panel
            </p>
          </div>
          {adminLinks.map((link) => (
            <NavLink
              key={link.to}
              to={link.to}
              className={({ isActive }) =>
                `flex items-center space-x-3 px-4 py-3 rounded-lg transition-all duration-200 ${
                  isActive
                    ? 'bg-gold text-dark font-semibold shadow-md'
                    : 'text-gray-600 hover:bg-cream hover:text-dark'
                }`
              }
            >
              <span className="text-xl">{link.icon}</span>
              <span>{link.label}</span>
            </NavLink>
          ))}
        </nav>
      </aside>
    )
  }

  // Regular user - show user links
  return (
    <aside className="fixed left-0 top-16 bottom-0 w-64 bg-white shadow-lg overflow-y-auto">
      <nav className="p-4 space-y-1">
        {userLinks.map((link) => (
          <NavLink
            key={link.to}
            to={link.to}
            className={({ isActive }) =>
              `flex items-center space-x-3 px-4 py-3 rounded-lg transition-all duration-200 ${
                isActive
                  ? 'bg-gold text-dark font-semibold shadow-md'
                  : 'text-gray-600 hover:bg-cream hover:text-dark'
              }`
            }
          >
            <span className="text-xl">{link.icon}</span>
            <span>{link.label}</span>
          </NavLink>
        ))}
      </nav>
    </aside>
  )
}