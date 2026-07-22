import React from 'react'
import { NavLink } from 'react-router-dom'

const userLinks = [
  { to: '/dashboard', label: 'Dashboard', icon: '📊' },
  { to: '/profile', label: 'Profile', icon: '👤' },
  { to: '/leadership', label: 'Leadership Board', icon: '🏆' },
]

const adminLinks = [
  { to: '/admin', label: 'Admin Dashboard', icon: '⚙️' },
  { to: '/admin/users', label: 'Users', icon: '👥' },
  { to: '/admin/levels', label: 'Levels', icon: '📚' },
  { to: '/admin/feedback', label: 'Feedback', icon: '💬' },
  { to: '/admin/statistics', label: 'Statistics', icon: '📈' },
  { to: '/admin/activity', label: 'Activity Log', icon: '📋' },
]

export default function Sidebar({ profile }) {
  const isAdmin = profile?.role === 'admin'

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

        {isAdmin && (
          <>
            <div className="border-t border-gray-200 my-4 pt-4">
              <p className="text-xs uppercase text-gray-400 font-semibold px-4 mb-2">
                Admin Panel
              </p>
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
            </div>
          </>
        )}
      </nav>
    </aside>
  )
}