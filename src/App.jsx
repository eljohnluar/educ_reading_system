import React from 'react'
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import { Toaster } from 'react-hot-toast'
import { AuthProvider } from './context/AuthContext'
import { ProgressProvider } from './context/ProgressContext'
import ProtectedRoute from './components/common/ProtectedRoute'

// Auth Pages
import Login from './components/auth/Login'
import Register from './components/auth/Register'
import ForgotPassword from './components/auth/ForgotPassword'
import ResetPassword from './components/auth/ResetPassword'

// User Pages
import Dashboard from './components/user/Dashboard'
import Profile from './components/user/Profile'
import Leadership from './components/user/Leadership'
import StoryReader from './components/user/StoryReader'
import Quiz from './components/user/Quiz'
import Results from './components/user/Results'

// Admin Pages
import AdminDashboard from './components/admin/AdminDashboard'
import UserManagement from './components/admin/UserManagement'
import LevelManagement from './components/admin/LevelManagement'
import FeedbackView from './components/admin/FeedbackView'
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
            {/* Auth Routes (Public) */}
            <Route path="/" element={<Login />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/forgot-password" element={<ForgotPassword />} />
            <Route path="/reset-password" element={<ResetPassword />} />

            {/* Protected Routes */}
            <Route element={<ProtectedRoute />}>
              <Route element={<Layout />}>
                {/* User Routes */}
                <Route path="/dashboard" element={<Dashboard />} />
                <Route path="/profile" element={<Profile />} />
                <Route path="/leadership" element={<Leadership />} />
                <Route path="/story/:level/:storyId" element={<StoryReader />} />
                <Route path="/quiz/:level" element={<Quiz />} />
                <Route path="/results/:level" element={<Results />} />

                {/* Admin Routes */}
                <Route path="/admin" element={<AdminDashboard />} />
                <Route path="/admin/users" element={<UserManagement />} />
                <Route path="/admin/levels" element={<LevelManagement />} />
                <Route path="/admin/feedback" element={<FeedbackView />} />
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