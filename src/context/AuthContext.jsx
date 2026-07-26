import React, { createContext, useContext, useState, useEffect } from 'react'
import supabase from '../lib/supabase'

const AuthContext = createContext()

export const useAuth = () => useContext(AuthContext)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [profile, setProfile] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) {
        setUser(session.user)
        fetchProfile(session.user.id)
      }
      setLoading(false)
    })

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (session) {
          setUser(session.user)
          await fetchProfile(session.user.id)
        } else {
          setUser(null)
          setProfile(null)
        }
        setLoading(false)
      }
    )

    return () => subscription.unsubscribe()
  }, [])

  const fetchProfile = async (userId) => {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .maybeSingle()

    if (!error && data) {
      setProfile(data)
      return
    }

    // No profile row found — the signup trigger may have failed.
    // Get the auth user and INSERT a real profile row so FK constraints work.
    const { data: { user: authUser } } = await supabase.auth.getUser()
    if (!authUser) return

    const newProfile = {
      id: authUser.id,
      email: authUser.email,
      username: authUser.user_metadata?.username || authUser.email.split('@')[0],
      avatar_url: authUser.user_metadata?.avatar_url || 'default-avatar.png',
      privacy_agreed: authUser.user_metadata?.privacy_agreed || false,
      role: authUser.user_metadata?.role || 'user',
    }

    const { data: inserted, error: insertError } = await supabase
      .from('profiles')
      .insert(newProfile)
      .select()
      .maybeSingle()

    if (!insertError && inserted) {
      setProfile(inserted)
    } else {
      // Insert failed (e.g. RLS or duplicate) — still set in-memory so UI doesn't hang
      console.warn('Could not create profile row:', insertError)
      setProfile({ ...newProfile, created_at: authUser.created_at })
    }
  }

  const signIn = async (email, password) => {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password
    })
    if (error) throw error
    return data
  }

  const sendOtp = async (email) => {
    const { data, error } = await supabase.auth.signInWithOtp({ email })
    if (error) throw error
    return data
  }

  const verifyOtp = async (email, token) => {
    const { data, error } = await supabase.auth.verifyOtp({ email, token, type: 'email' })
    if (error) throw error
    return data
  }

  const resetPassword = async (email) => {
    const { data, error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/reset-password`,
    })
    if (error) throw error
    return data
  }

  const updatePassword = async (newPassword) => {
    const { data, error } = await supabase.auth.updateUser({ password: newPassword })
    if (error) throw error
    return data
  }

  const signUp = async (email, password, username, privacyAgreed) => {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          username,
          privacy_agreed: privacyAgreed
        }
      }
    })
    if (error) throw error
    return data
  }

  const signOut = async () => {
    const { error } = await supabase.auth.signOut()
    if (error) throw error
  }

  const updateProfile = async (updates) => {
    const { data, error } = await supabase
      .from('profiles')
      .update(updates)
      .eq('id', user.id)
      .select()
      .maybeSingle()

    if (error) throw error
    if (data) setProfile(data)
    return data
  }

  const value = {
    user,
    profile,
    loading,
    signIn,
    sendOtp,
    verifyOtp,
    resetPassword,
    updatePassword,
    signUp,
    signOut,
    updateProfile,
    isAdmin: profile?.role === 'admin'
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}