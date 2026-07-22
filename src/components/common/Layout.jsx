import React from 'react'
import { Outlet } from 'react-router-dom'
import Header from './Header'
import Footer from './Footer'
import Sidebar from './Sidebar'
import { useAuth } from '../../context/AuthContext'

export default function Layout() {
  const { user, profile } = useAuth()

  return (
    <div className="min-h-screen bg-cream">
      <Header user={user} profile={profile} />
      <div className="flex">
        <Sidebar profile={profile} />
        <main className="flex-1 p-6 ml-64 mt-16">
          <Outlet />
        </main>
      </div>
      <Footer />
    </div>
  )
}