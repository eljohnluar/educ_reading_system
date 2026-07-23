// src/components/common/Layout.jsx

import React from 'react'
import { Outlet } from 'react-router-dom'
import Header from './Header'
import Footer from './Footer'
import Sidebar from './Sidebar'
import { useAuth } from '../../context/AuthContext'

export default function Layout() {
  const { user, profile, isAdmin } = useAuth()

  return (
    <div className="min-h-screen bg-cream">
      <Header user={user} profile={profile} isAdmin={isAdmin} />
      <div className="flex">
        <Sidebar isAdmin={isAdmin} />
        <main className="flex-1 p-6 ml-64 mt-16">
          <Outlet />
        </main>
      </div>
      <Footer />
    </div>
  )
}