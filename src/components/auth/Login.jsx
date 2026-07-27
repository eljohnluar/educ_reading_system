import React, { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import { supabase } from '../../lib/supabase'
import toast from 'react-hot-toast'
import '../landing/LandingPage.css'

export default function Login() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [token, setToken] = useState('')
  const [step, setStep] = useState(1) // 1: Email & Password, 2: OTP
  const [loading, setLoading] = useState(false)
  const [rememberMe, setRememberMe] = useState(false)
  const navigate = useNavigate()
  const { sendOtp, verifyOtp } = useAuth()

  // ✅ Load saved email from localStorage on mount
  useEffect(() => {
    const savedEmail = localStorage.getItem('rememberedEmail')
    if (savedEmail) {
      setEmail(savedEmail)
      setRememberMe(true)
    }
  }, [])

  const handleVerifyPassword = async (e) => {
    e.preventDefault()
    if (loading) return
    setLoading(true)

    try {
      // 1. Verify credentials using standard login
      const { data, error } = await supabase.auth.signInWithPassword({ email, password })
      if (error) throw error

      // 2. We verified they know the password. Immediately sign out to prevent session access until OTP.
      await supabase.auth.signOut()

      // 3. Send the OTP code
      await sendOtp(email)
      
      toast.success('Login code sent to your email!')
      setStep(2)
    } catch (error) {
      console.error('Password verification error:', error)
      toast.error(error.message || 'Invalid email or password.')
    } finally {
      setLoading(false)
    }
  }

  const handleVerifyOtp = async (e) => {
    e.preventDefault()
    if (loading) return
    setLoading(true)

    try {
      const response = await verifyOtp(email, token)
      
      if (!response || !response.user) {
        throw new Error('Verification failed. Please try again.')
      }

      // ✅ If "Remember Me" is checked, save email
      if (rememberMe) {
        localStorage.setItem('rememberedEmail', email)
      } else {
        localStorage.removeItem('rememberedEmail')
      }

      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', response.user.id)
        .maybeSingle()

      if (profileError) {
        console.warn('Profile fetch error:', profileError)
        toast.success('Welcome back!')
        navigate('/loading', { state: { redirectTo: '/dashboard' } })
        return
      }

      if (profile?.role === 'admin') {
        toast.success('Welcome Admin!')
        navigate('/loading', { state: { redirectTo: '/admin' } })
      } else {
        toast.success('Welcome back!')
        navigate('/loading', { state: { redirectTo: '/dashboard' } })
      }

    } catch (error) {
      console.error('Verification error:', error)
      toast.error(error.message || 'Invalid or expired code. Please try again.')
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
      <span className="floating-book">📚</span>
      <span className="floating-book">📖</span>
      <span className="floating-book">✏️</span>
      <span className="floating-book">🎓</span>
      <span className="floating-book">📕</span>

      <div className="bg-white/95 backdrop-blur-md rounded-2xl shadow-2xl p-8 max-w-md w-full border border-white/20 relative z-10">
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
          <h2 className="text-3xl font-bold text-dark">Welcome Back</h2>
          <p className="text-gray-500 mt-2">
            {step === 1 ? 'Sign in to continue your learning journey' : 'Enter the code sent to your email'}
          </p>
        </div>

        {step === 1 ? (
          <form onSubmit={handleVerifyPassword} className="space-y-6">
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
                disabled={loading}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Password
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gold focus:border-transparent outline-none transition-all"
                placeholder="••••••••"
                required
                disabled={loading}
              />
            </div>

            <div className="flex items-center justify-between">
              <label className="flex items-center cursor-pointer">
                <input 
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="rounded border-gray-300 text-gold focus:ring-gold h-4 w-4"
                  disabled={loading}
                />
                <span className="ml-2 text-sm text-gray-600">Remember me</span>
              </label>
              <Link to="/forgot-password" className="text-sm text-gold hover:underline">
                Forgot password?
              </Link>
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
              {loading ? 'Verifying...' : 'Sign In'}
            </button>
          </form>
        ) : (
          <form onSubmit={handleVerifyOtp} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Login Code (OTP)
              </label>
              <input
                type="text"
                value={token}
                onChange={(e) => setToken(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gold focus:border-transparent outline-none transition-all text-center tracking-widest text-lg"
                placeholder="00000000"
                required
                disabled={loading}
                maxLength={8}
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
              {loading ? 'Verifying...' : 'Verify Code & Login'}
            </button>

            <div className="text-center mt-4">
              <button
                type="button"
                onClick={() => {
                  setStep(1)
                  setPassword('')
                }}
                className="text-sm text-gold hover:underline"
                disabled={loading}
              >
                Back to Login
              </button>
            </div>
          </form>
        )}

        {step === 1 && (
          <p className="text-center text-sm text-gray-600 mt-6">
            Don't have an account?{' '}
            <Link to="/register" className="text-gold font-semibold hover:underline">
              Create one
            </Link>
          </p>
        )}
      </div>
    </div>
  )
}