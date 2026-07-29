import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { supabase } from '../../lib/supabase'
import toast from 'react-hot-toast'
import { motion, AnimatePresence } from 'framer-motion'
import { Eye, EyeOff } from 'lucide-react'
import PasswordStrengthMeter from '../common/PasswordStrengthMeter'
import { validatePassword } from '../../utils/passwordUtils'
import '../landing/LandingPage.css'

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
  const [showPrivacyModal, setShowPrivacyModal] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
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

    const passwordValidation = validatePassword(formData.password)
    if (!passwordValidation.isValid) {
      toast.error(passwordValidation.error)
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
            role: role
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
    <div 
      className="min-h-screen flex items-center justify-center p-4 relative overflow-hidden"
      style={{
        background: 'linear-gradient(135deg, #2C3E50 0%, #3d566e 40%, #E9D2A9 100%)'
      }}
    >
      {/* Floating decorative elements matching Login page */}
      <span className="floating-book">📚</span>
      <span className="floating-book">📖</span>
      <span className="floating-book">✏️</span>
      <span className="floating-book">🎓</span>
      <span className="floating-book">📕</span>

      <div className="bg-white/95 backdrop-blur-md rounded-2xl shadow-2xl p-8 max-w-md w-full border border-white/20 relative z-10 my-8">
        <Link
          to="/"
          className="inline-flex items-center text-sm text-gray-500 hover:text-dark transition-colors mb-6 group"
        >
          <span className="mr-1 transition-transform group-hover:-translate-x-1">←</span>
          Back to Home
        </Link>
        <div className="text-center mb-8">
          <img 
            src="/assets/images/icons/logo.svg" 
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
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                name="password"
                value={formData.password}
                onChange={handleChange}
                className="w-full px-4 py-3 pr-10 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gold focus:border-transparent outline-none transition-all"
                placeholder="Min 8 characters, upper, lower, number, special"
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 p-1"
                tabIndex={-1}
              >
                {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
              </button>
            </div>
            <PasswordStrengthMeter password={formData.password} />
          </div>

          {/* Confirm Password */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Confirm Password
            </label>
            <div className="relative">
              <input
                type={showConfirmPassword ? 'text' : 'password'}
                name="confirmPassword"
                value={formData.confirmPassword}
                onChange={handleChange}
                className="w-full px-4 py-3 pr-10 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gold focus:border-transparent outline-none transition-all"
                placeholder="Confirm your password"
                required
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 p-1"
                tabIndex={-1}
              >
                {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
              </button>
            </div>
          </div>

          {/* Toggle Admin Registration */}
          <div className="text-center pt-2">
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
          <div className="flex items-start pt-2">
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
              <Link
                to="/privacy"
                target="_blank"
                className="text-gold hover:underline font-medium"
              >
                Privacy Policy
              </Link>
            </label>
          </div>

          <button
            type="submit"
            disabled={loading}
            className={`w-full py-3 rounded-lg font-semibold text-white transition-all mt-4 ${
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

      {/* Privacy Policy Modal */}
      <AnimatePresence>
        {showPrivacyModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto p-6 md:p-8"
            >
              {/* Modal Header */}
              <div className="flex items-center justify-between mb-6 pb-4 border-b border-gray-200">
                <h2 className="text-2xl font-bold text-dark flex items-center gap-2">
                  <span className="text-3xl">🔒</span> Privacy Policy
                </h2>
                <button
                  onClick={() => setShowPrivacyModal(false)}
                  className="text-gray-400 hover:text-gray-700 p-1 rounded-lg transition-colors"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              {/* Modal Body */}
              <div className="space-y-4 text-gray-700">
                <div className="bg-gold/10 rounded-xl p-4 border border-gold/20">
                  <p className="text-sm font-medium text-gold-dark">
                    📌 Last Updated: July 2026
                  </p>
                </div>

                <div>
                  <h3 className="text-lg font-semibold text-dark mb-2">1. Information We Collect</h3>
                  <p className="text-sm leading-relaxed">
                    We collect the following information when you create an account:
                  </p>
                  <ul className="list-disc list-inside text-sm leading-relaxed mt-2 space-y-1">
                    <li><strong>Username</strong> - Your chosen display name</li>
                    <li><strong>Email Address</strong> - For account verification and communication</li>
                    <li><strong>Profile Picture</strong> - Optional, uploaded by you</li>
                    <li><strong>Reading Progress</strong> - Stories read, quiz scores, and levels completed</li>
                  </ul>
                </div>

                <div>
                  <h3 className="text-lg font-semibold text-dark mb-2">2. How We Use Your Information</h3>
                  <ul className="list-disc list-inside text-sm leading-relaxed space-y-1">
                    <li>To create and manage your account</li>
                    <li>To track your reading progress and achievements</li>
                    <li>To personalize your learning experience</li>
                    <li>To send you account-related notifications</li>
                    <li>To improve our platform and content</li>
                  </ul>
                </div>

                <div>
                  <h3 className="text-lg font-semibold text-dark mb-2">3. Data Storage</h3>
                  <ul className="list-disc list-inside text-sm leading-relaxed space-y-1">
                    <li>Your data is stored securely on our servers</li>
                    <li>We use industry-standard encryption</li>
                    <li>Your password is never stored in plain text</li>
                    <li>You can request data deletion at any time</li>
                  </ul>
                </div>

                <div>
                  <h3 className="text-lg font-semibold text-dark mb-2">4. Your Rights</h3>
                  <ul className="list-disc list-inside text-sm leading-relaxed space-y-1">
                    <li>Access your personal data at any time</li>
                    <li>Update or correct your information</li>
                    <li>Delete your account and all associated data</li>
                    <li>Opt-out of non-essential communications</li>
                  </ul>
                </div>

                <div className="bg-cream rounded-xl p-4 border border-gray-200">
                  <p className="text-sm text-gray-600">
                    <strong>Questions?</strong> Contact us at{' '}
                    <a href="mailto:support@readwellzone.com" className="text-gold hover:underline">
                      support@readwellzone.com
                    </a>
                  </p>
                </div>
              </div>

              {/* Modal Footer */}
              <div className="mt-6 pt-4 border-t border-gray-200 flex justify-end">
                <button
                  onClick={() => setShowPrivacyModal(false)}
                  className="px-6 py-2.5 bg-gold text-dark font-semibold rounded-lg hover:bg-amber-500 transition-all"
                >
                  I Understand
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  )
}
