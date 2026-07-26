// src/components/common/Layout.jsx

import React, { useState } from 'react'
import { Outlet, useLocation } from 'react-router-dom'
import Header from './Header'
import Sidebar from './Sidebar'
import { useAuth } from '../../context/AuthContext'
import '../landing/LandingPage.css'

export default function Layout() {
  const { user, profile, isAdmin } = useAuth()
  const location = useLocation()
  const [sidebarOpen, setSidebarOpen] = useState(false)

  const hideSidebarRoutes = ['/story', '/quiz', '/results']
  const shouldHideSidebar = hideSidebarRoutes.some(route => location.pathname.startsWith(route))

  return (
    <div className="min-h-screen bg-cream flex flex-col">
      <Header onMenuToggle={() => setSidebarOpen(prev => !prev)} />
      <div className="flex flex-1">
        {!shouldHideSidebar && (
          <Sidebar 
            isOpen={sidebarOpen} 
            onClose={() => setSidebarOpen(false)} 
          />
        )}
        <main className={`flex-1 p-4 md:p-6 mt-16 ${shouldHideSidebar ? '' : 'md:ml-64'}`}>
          <Outlet />
        </main>
      </div>
    </div>
  )
}