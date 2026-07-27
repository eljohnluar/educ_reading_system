import React, { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import { supabase } from '../../lib/supabase'
import toast from 'react-hot-toast'
import '../landing/LandingPage.css'

export default function ResetPassword() {
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [isValid, setIsValid] = useState(false)
  const navigate = useNavigate()
  const { updatePassword } = useAuth()

  // ✅ Check if user came from reset link
  useEffect(() => {
    const checkSession = async () => {
      const { data: { session } } = await supabase.auth.getSession()
      
      if (session?.user) {
        setIsValid(true)
      } else {
        toast.error('Invalid or expired reset link. Please request a new one.')
        navigate('/forgot-password')
      }
    }

    checkSession()
  }, [navigate])

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (loading) return
    setLoading(true)

    if (password !== confirmPassword) {
      toast.error('Passwords do not match')
      setLoading(false)
      return
    }

    if (password.length < 8) {
      toast.error('Password must be at least 8 characters')
      setLoading(false)
      return
    }

    try {
      await updatePassword(password)
      toast.success('Password reset successfully! You can now log in with your new password.')
      
      // ✅ Sign out to clear the session and redirect to login
      await supabase.auth.signOut()
      navigate('/login')
    } catch (error) {
      console.error('Password update error:', error)
      toast.error(error.message || 'Failed to reset password')
    } finally {
      setLoading(false)
    }
  }

  // Loading state while checking session
  if (!isValid) {
    return (
      <div 
        className="min-h-screen flex items-center justify-center p-4 relative overflow-hidden"
        style={{
          background: 'linear-gradient(135deg, #2C3E50 0%, #3d566e 40%, #E9D2A9 100%)'
        }}
      >
        <div className="bg-white/95 backdrop-blur-md rounded-2xl shadow-2xl p-8 max-w-md w-full border border-white/20 relative z-10">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-4 border-gold border-t-transparent mx-auto mb-4"></div>
            <p className="text-gray-600">Verifying reset link...</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div 
      className="min-h-screen flex items-center justify-center p-4 relative overflow-hidden"
      style={{
        background: 'linear-gradient(135deg, #2C3E50 0%, #3d566e 40%, #E9D2A9 100%)'
      }}
    >
      {/* Floating decorative elements */}
      <span className="floating-book">📚</span>
      <span className="floating-book">📖</span>
      <span className="floating-book">✏️</span>
      <span className="floating-book">🎓</span>
      <span className="floating-book">📕</span>

      <div className="bg-white/95 backdrop-blur-md rounded-2xl shadow-2xl p-8 max-w-md w-full border border-white/20 relative z-10">
        {/* Back to Login */}
        <Link
          to="/login"
          className="inline-flex items-center text-sm text-gray-500 hover:text-dark transition-colors mb-6 group"
        >
          <span className="mr-1 transition-transform group-hover:-translate-x-1">←</span>
          Back to Login
        </Link>

        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold text-dark">Set New Password</h2>
          <p className="text-gray-500 mt-2">Create a new password for your account</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              New Password
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gold focus:border-transparent outline-none transition-all"
              placeholder="Min 8 characters"
              required
              minLength={8}
              disabled={loading}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Confirm New Password
            </label>
            <input
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gold focus:border-transparent outline-none transition-all"
              placeholder="Confirm your password"
              required
              disabled={loading}
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className={`w-full py-3 rounded-lg font-semibold text-white transition-all ${
              loading 
                ? 'bg-gray-400 cursor-not-allowed' 
                : 'bg-gold hover:bg-amber-500 shadow-lg hover:shadow-xl'
            }`}
          >
            {loading ? 'Resetting...' : 'Reset Password'}
          </button>
        </form>

        <p className="text-center text-sm text-gray-600 mt-6">
          Remember your password?{' '}
          <Link to="/login" className="text-gold font-semibold hover:underline">
            Sign in
          </Link>
        </p>
      </div>
    </div>
  )
}