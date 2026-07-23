import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import { supabase } from '../../lib/supabase'
import toast from 'react-hot-toast'

export default function Login() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()
  const { signIn } = useAuth()

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    if (loading) return
    
    setLoading(true)

    try {
      // Sign in
      const response = await signIn(email, password)
      
      // Check response
      if (!response || !response.user) {
        throw new Error('Login failed. Please try again.')
      }

      // Get user profile
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', response.user.id)
        .single()

      if (profileError) {
        console.warn('Profile fetch error:', profileError)
        toast.success('Welcome back!')
        navigate('/dashboard')
        return
      }

      // Redirect based on role
      if (profile?.role === 'admin') {
        toast.success('Welcome Admin!')
        navigate('/admin')
      } else {
        toast.success('Welcome back!')
        navigate('/dashboard')
      }

    } catch (error) {
      console.error('Login error:', error)
      toast.error(error.message || 'Login failed. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-cream p-4">
      <div className="bg-white rounded-2xl shadow-xl p-8 max-w-md w-full">
        <div className="text-center mb-8">
          <img 
            src="/assets/images/icons/logo.png" 
            alt="Read Well English Zone" 
            className="h-16 mx-auto mb-4"
            onError={(e) => {
              e.target.src = 'https://placehold.co/64x64/8BC34A/FFFFFF?text=RW'
            }}
          />
          <h2 className="text-3xl font-bold text-dark">Welcome Back</h2>
          <p className="text-gray-500 mt-2">Sign in to continue your learning journey</p>
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
            <label className="flex items-center">
              <input 
                type="checkbox" 
                className="rounded border-gray-300 text-gold focus:ring-gold"
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
            {loading ? 'Signing in...' : 'Sign In'}
          </button>
        </form>

        <p className="text-center text-sm text-gray-600 mt-6">
          Don't have an account?{' '}
          <Link to="/register" className="text-gold font-semibold hover:underline">
            Create one
          </Link>
        </p>
      </div>
    </div>
  )
}