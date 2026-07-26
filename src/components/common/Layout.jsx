import React, { useState } from 'react'
import { Outlet } from 'react-router-dom'
import Header from './Header'
import Footer from './Footer'
import Sidebar from './Sidebar'
import { useAuth } from '../../context/AuthContext'
import '../landing/LandingPage.css'

export default function Layout() {
  const { user, profile, isAdmin } = useAuth()
  const [isSidebarOpen, setIsSidebarOpen] = useState(false)

  return (
    <div className="min-h-screen bg-[#F8F7F4] text-gray-900 flex flex-col relative overflow-hidden">
      {/* Background Decorative Accents */}
      <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-gradient-to-b from-[#E9D2A9]/10 via-[#d4b988]/5 to-transparent rounded-full blur-[100px] pointer-events-none z-0"></div>
      <div className="absolute bottom-12 left-[280px] w-[400px] h-[400px] bg-gradient-to-tr from-[#8BC34A]/5 to-transparent rounded-full blur-[80px] pointer-events-none z-0"></div>

      <Header 
        user={user} 
        profile={profile} 
        isAdmin={isAdmin} 
        onMenuToggle={() => setIsSidebarOpen(!isSidebarOpen)} 
      />
      <div className="flex relative z-10 flex-1">
        <Sidebar 
          isOpen={isSidebarOpen} 
          onClose={() => setIsSidebarOpen(false)} 
        />
        <main className="flex-1 p-4 md:p-8 ml-0 md:ml-64 mt-16 relative z-10">
          <Outlet />
        </main>
      </div>
      <Footer />
    </div>
  )
}