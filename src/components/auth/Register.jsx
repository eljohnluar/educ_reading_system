import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { supabase } from '../../lib/supabase'
import toast from 'react-hot-toast'

export default function Register() {
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    confirmPassword: '',
    privacyAgreed: false,
    adminCode: ''
  })
  const [loading, setLoading] = useState(false)
  const [showAdminField, setShowAdminField] = useState(false)
  const navigate = useNavigate()

  // Admin code (change this)
  const ADMIN_CODE = 'ADMIN2026'

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)

    // Validations
    if (formData.password !== formData.confirmPassword) {
      toast.error('Passwords do not match')
      setLoading(false)
      return
    }

    if (formData.password.length < 8) {
      toast.error('Password must be at least 8 characters')
      setLoading(false)
      return
    }

    if (!formData.privacyAgreed) {
      toast.error('You must agree to the Privacy Policy')
      setLoading(false)
      return
    }

    // Check admin code
    const isAdmin = formData.adminCode.trim() === ADMIN_CODE
    const role = isAdmin ? 'admin' : 'user'

    try {
      const { data, error } = await supabase.auth.signUp({
        email: formData.email,
        password: formData.password,
        options: {
          data: {
            username: formData.username,
            privacy_agreed: formData.privacyAgreed,
            role: role  // This will set the role in profiles table
          }
        }
      })

      if (error) throw error

      toast.success(
        isAdmin 
          ? '🎉 Admin account created! Please verify your email.'
          : 'Account created! Please verify your email.'
      )
      navigate('/login')
    } catch (error) {
      toast.error(error.message || 'Registration failed. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-cream p-4">
      <div className="bg-white rounded-2xl shadow-xl p-8 max-w-md w-full">
        <Link
          to="/"
          className="inline-flex items-center text-sm text-gray-500 hover:text-dark transition-colors mb-6 group"
        >
          <span className="mr-1 transition-transform group-hover:-translate-x-1">←</span>
          Back to Home
        </Link>
        <div className="text-center mb-8">
          <img 
            src="/assets/images/icons/logo.png" 
            alt="Read Well English Zone" 
            className="h-16 mx-auto mb-4"
            onError={(e) => {
              e.target.src = 'https://placehold.co/64x64/8BC34A/FFFFFF?text=RW'
            }}
          />
          <h2 className="text-3xl font-bold text-dark">Create Account</h2>
          <p className="text-gray-500 mt-2">Start your English reading journey today</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Username */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Username
            </label>
            <input
              type="text"
              name="username"
              value={formData.username}
              onChange={handleChange}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gold focus:border-transparent outline-none transition-all"
              placeholder="Choose a username"
              required
              minLength={3}
              maxLength={50}
            />
          </div>

          {/* Email */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Email Address
            </label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gold focus:border-transparent outline-none transition-all"
              placeholder="you@example.com"
              required
            />
          </div>

          {/* Password */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Password
            </label>
            <input
              type="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gold focus:border-transparent outline-none transition-all"
              placeholder="Min 8 characters"
              required
              minLength={8}
            />
          </div>

          {/* Confirm Password */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Confirm Password
            </label>
            <input
              type="password"
              name="confirmPassword"
              value={formData.confirmPassword}
              onChange={handleChange}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gold focus:border-transparent outline-none transition-all"
              placeholder="Confirm your password"
              required
            />
          </div>

          {/* Toggle Admin Registration */}
          <div className="text-center">
            <button
              type="button"
              onClick={() => setShowAdminField(!showAdminField)}
              className="text-sm text-gold hover:underline"
            >
              {showAdminField ? 'Hide admin registration' : 'Register as admin'}
            </button>
          </div>

          {/* Admin Code Field */}
          {showAdminField && (
            <div className="border-t border-gray-200 pt-4">
              <p className="text-sm text-gray-500 mb-2">Admin Registration</p>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Admin Code
                </label>
                <input
                  type="password"
                  name="adminCode"
                  value={formData.adminCode}
                  onChange={handleChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gold focus:border-transparent outline-none transition-all"
                  placeholder="Enter admin code"
                />
                <p className="text-xs text-gray-400 mt-1">
                  Contact the system administrator for the code
                </p>
              </div>
            </div>
          )}

          {/* Privacy Policy */}
          <div className="flex items-start">
            <input
              type="checkbox"
              name="privacyAgreed"
              checked={formData.privacyAgreed}
              onChange={handleChange}
              className="mt-1 rounded border-gray-300 text-gold focus:ring-gold"
              required
            />
            <label className="ml-2 text-sm text-gray-600">
              I agree to the{' '}
              <Link to="/privacy" className="text-gold hover:underline">
                Privacy Policy
              </Link>
            </label>
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
            {loading ? 'Creating account...' : 'Create Account'}
          </button>
        </form>

        <p className="text-center text-sm text-gray-600 mt-6">
          Already have an account?{' '}
          <Link to="/login" className="text-gold font-semibold hover:underline">
            Sign in
          </Link>
        </p>
      </div>
    </div>
  )
}