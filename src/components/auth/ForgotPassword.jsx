import React, { useState } from 'react'
import { Link } from 'react-router-dom'
import toast from 'react-hot-toast'

export default function ForgotPassword() {
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)

    // TODO: Implement password reset when feature is ready
    toast.info('Password reset feature is currently under development. Please check back soon.')
    
    // Placeholder - will be implemented in future
    // try {
    //   await supabase.auth.resetPasswordForEmail(email)
    //   toast.success('Password reset email sent!')
    // } catch (error) {
    //   toast.error(error.message || 'Failed to send reset email')
    // } finally {
    //   setLoading(false)
    // }
    
    setLoading(false)
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-cream p-4">
      <div className="bg-white rounded-2xl shadow-xl p-8 max-w-md w-full">
        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold text-dark">Reset Password</h2>
          <p className="text-gray-500 mt-2">
            Enter your email and we'll send you a link to reset your password
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Email Address
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gold focus:border-transparent outline-none transition-all"
              placeholder="you@example.com"
              required
            />
          </div>

          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
            <p className="text-sm text-yellow-700">
              🚧 This feature is currently under development. It will be available in a future update.
            </p>
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
            {loading ? 'Sending...' : 'Send Reset Link'}
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