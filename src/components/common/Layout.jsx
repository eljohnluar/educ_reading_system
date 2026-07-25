import React from 'react'
import { Outlet } from 'react-router-dom'
import Header from './Header'
import Footer from './Footer'
import Sidebar from './Sidebar'
import { useAuth } from '../../context/AuthContext'
import '../landing/LandingPage.css'

export default function Layout() {
  const { user, profile, isAdmin } = useAuth()

  return (
    <div 
      className="min-h-screen relative overflow-hidden text-gray-900"
      style={{
        background: 'linear-gradient(135deg, #2C3E50 0%, #3d566e 40%, #E9D2A9 100%)'
      }}
    >
      {/* Floating decorative elements matching landing page */}
      <span className="floating-book" style={{ top: '10%', left: '18%', zIndex: 0 }}>📚</span>
      <span className="floating-book" style={{ top: '25%', right: '5%', zIndex: 0 }}>📖</span>
      <span className="floating-book" style={{ bottom: '15%', left: '20%', zIndex: 0 }}>✏️</span>
      <span className="floating-book" style={{ bottom: '30%', right: '12%', zIndex: 0 }}>🎓</span>
      <span className="floating-book" style={{ top: '50%', left: '17%', zIndex: 0 }}>📕</span>

      <Header user={user} profile={profile} isAdmin={isAdmin} />
      <div className="flex relative z-10">
        <Sidebar isAdmin={isAdmin} />
        <main className="flex-1 p-8 ml-64 mt-16">
          <Outlet />
        </main>
      </div>
      <Footer />
    </div>
  )
}