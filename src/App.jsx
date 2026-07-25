import React from 'react'
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import { Toaster } from 'react-hot-toast'
import { AuthProvider } from './context/AuthContext'
import { ProgressProvider } from './context/ProgressContext'
import ProtectedRoute from './components/common/ProtectedRoute'

// Landing Page
import LandingPage from './components/landing/LandingPage'

// Auth Pages
import Login from './components/auth/Login'
import Register from './components/auth/Register'
import ForgotPassword from './components/auth/ForgotPassword'
import ResetPassword from './components/auth/ResetPassword'

// Loading Screen
import StudentEvolutionLoader from './components/common/StudentEvolutionLoader'

// User Pages
import Dashboard from './components/user/Dashboard'
import Profile from './components/user/Profile'
import Leadership from './components/user/Leadership'
import StoryReader from './components/user/StoryReader'
import Quiz from './components/user/Quiz'
import Results from './components/user/Results'

import AdminDashboard from './components/admin/AdminDashboard'
import UserManagement from './components/admin/UserManagement'
import Statistics from './components/admin/Statistics'
import ActivityLog from './components/admin/ActivityLog'

import Layout from './components/common/Layout'

function App() {
  return (
    <AuthProvider>
      <ProgressProvider>
        <Router>
          <Toaster position="top-right" />
          <Routes>
            {/* Landing Page (Public) */}
            <Route path="/" element={<LandingPage />} />

            {/* Auth Routes (Public) */}
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/forgot-password" element={<ForgotPassword />} />
            <Route path="/reset-password" element={<ResetPassword />} />

            {/* Loading Screen (Public - plays after login) */}
            <Route path="/loading" element={<StudentEvolutionLoader />} />

            {/* Protected User Routes */}
            <Route element={<ProtectedRoute />}>
              <Route element={<Layout />}>
                <Route path="/dashboard" element={<Dashboard />} />
                <Route path="/profile" element={<Profile />} />
                <Route path="/leadership" element={<Leadership />} />
                <Route path="/story/:level/:storyId" element={<StoryReader />} />
                <Route path="/quiz/:level" element={<Quiz />} />
                <Route path="/results/:level" element={<Results />} />
              </Route>
            </Route>

            {/* Protected Admin Routes - requireAdmin={true} */}
            <Route element={<ProtectedRoute requireAdmin={true} />}>
              <Route element={<Layout />}>
                <Route path="/admin" element={<AdminDashboard />} />
                <Route path="/admin/users" element={<UserManagement />} />
                <Route path="/admin/statistics" element={<Statistics />} />
                <Route path="/admin/activity" element={<ActivityLog />} />
              </Route>
            </Route>

            {/* Catch All */}
            <Route path="*" element={<Navigate to="/dashboard" />} />
          </Routes>
        </Router>
      </ProgressProvider>
    </AuthProvider>
  )
}

export default App