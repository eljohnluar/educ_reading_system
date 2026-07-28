import React, { useState, useEffect, useRef } from 'react'
import { useAuth } from '../../context/AuthContext'
import { supabase } from '../../lib/supabase'
import toast from 'react-hot-toast'
import { motion } from 'framer-motion'
import { Camera, User, Loader2, Eye, EyeOff } from 'lucide-react'
import PasswordStrengthMeter from '../common/PasswordStrengthMeter'
import { validatePassword } from '../../utils/passwordUtils'

export default function Profile() {
  const { user, profile, updateProfile } = useAuth()
  const [loading, setLoading] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [stats, setStats] = useState(null)
  const [formData, setFormData] = useState({
    username: '',
    avatar_url: ''
  })
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  })
  const [showCurrentPassword, setShowCurrentPassword] = useState(false)
  const [showNewPassword, setShowNewPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [isEditing, setIsEditing] = useState(false)
  const fileInputRef = useRef(null)

  useEffect(() => {
    if (profile) {
      setFormData({
        username: profile.username || '',
        avatar_url: profile.avatar_url || ''
      })
      fetchUserStats()
    }
  }, [profile])

  const fetchUserStats = async () => {
    try {
      const { data, error } = await supabase
        .rpc('get_user_stats', { p_user_id: user.id })
      
      if (error) throw error
      setStats(Array.isArray(data) ? data[0] : data)
    } catch (error) {
      console.error('Error fetching stats:', error)
    }
  }

  const handleProfileUpdate = async (e) => {
    e.preventDefault()
    setLoading(true)

    try {
      await updateProfile({
        username: formData.username,
        avatar_url: formData.avatar_url
      })
      toast.success('Profile updated successfully!')
      setIsEditing(false)
    } catch (error) {
      toast.error(error.message || 'Failed to update profile')
    } finally {
      setLoading(false)
    }
  }

  const uploadAvatar = async (event) => {
    const file = event.target.files[0]
    if (!file) return

    // Validate file type
    if (!file.type.startsWith('image/')) {
      toast.error('Please select an image file')
      return
    }

    // Validate file size (2MB max)
    if (file.size > 2 * 1024 * 1024) {
      toast.error('Image must be less than 2MB')
      return
    }

    setUploading(true)

    try {
      const fileExt = file.name.split('.').pop()
      const fileName = `${Math.random().toString(36).substring(7)}.${fileExt}`
      const filePath = `${user.id}/${fileName}`

      const { error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(filePath, file)

      if (uploadError) {
        throw uploadError
      }

      const { data } = supabase.storage
        .from('avatars')
        .getPublicUrl(filePath)

      setFormData(prev => ({ ...prev, avatar_url: data.publicUrl }))
      toast.success('Image uploaded! Click Save Changes to update your profile.')
    } catch (error) {
      toast.error(error.message || 'Error uploading image')
    } finally {
      setUploading(false)
    }
  }

  const handlePasswordChange = async (e) => {
    e.preventDefault()
    setLoading(true)

    if (passwordData.newPassword !== passwordData.confirmPassword) {
      toast.error('Passwords do not match')
      setLoading(false)
      return
    }

    const passwordValidation = validatePassword(passwordData.newPassword)
    if (!passwordValidation.isValid) {
      toast.error(passwordValidation.error)
      setLoading(false)
      return
    }

    try {
      const { error } = await supabase.auth.updateUser({
        password: passwordData.newPassword
      })

      if (error) throw error

      toast.success('Password updated successfully!')
      setPasswordData({
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
      })
    } catch (error) {
      toast.error(error.message || 'Failed to update password')
    } finally {
      setLoading(false)
    }
  }

  // Get avatar URL with proper fallback
  const getAvatarUrl = () => {
    const avatar = (isEditing ? formData.avatar_url : profile?.avatar_url)
    if (avatar && !avatar.includes('default') && !avatar.includes('null')) {
      return avatar
    }
    return '/assets/images/avatars/default.jpg'
  }

  // Get initials for fallback
  const getInitials = () => {
    const name = profile?.username || 'U'
    return name.charAt(0).toUpperCase()
  }

  if (!profile) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gold"></div>
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <h1 className="text-3xl font-bold text-dark">My Profile</h1>

      {/* Profile Card */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white rounded-xl shadow-md p-6"
      >
        <div className="flex flex-col sm:flex-row items-center sm:items-start space-y-4 sm:space-y-0 sm:space-x-6">
          {/* Avatar with placeholder fallback */}
          <div className="flex-shrink-0 relative">
            <div className="w-24 h-24 rounded-full border-4 border-gold overflow-hidden bg-cream flex items-center justify-center">
              {isEditing && uploading ? (
                <Loader2 className="w-8 h-8 text-gold animate-spin" />
              ) : (
                <img
                  src={getAvatarUrl()}
                  alt={profile.username}
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    // If image fails to load, show initials
                    e.target.style.display = 'none'
                    const parent = e.target.parentElement
                    if (parent) {
                      const fallback = document.createElement('div')
                      fallback.className = 'w-full h-full flex items-center justify-center text-3xl font-bold text-dark bg-cream'
                      fallback.textContent = getInitials()
                      parent.appendChild(fallback)
                    }
                  }}
                />
              )}
            </div>
            {isEditing && (
              <button
                onClick={() => fileInputRef.current?.click()}
                className="absolute bottom-0 right-0 p-1.5 bg-gold rounded-full shadow-md hover:bg-amber-500 transition-colors"
                disabled={uploading}
              >
                <Camera className="w-4 h-4 text-dark" />
              </button>
            )}
          </div>

          <div className="flex-1">
            <div className="flex flex-col sm:flex-row items-center sm:items-start gap-3 sm:justify-between">
              <div className="text-center sm:text-left">
                <h2 className="text-2xl font-bold text-dark">{profile.username}</h2>
                <p className="text-gray-500">{profile.email}</p>
                <p className="text-sm text-gray-400 mt-1">
                  Member since {new Date(profile.created_at).toLocaleDateString()}
                </p>
              </div>
              <button
                onClick={() => setIsEditing(!isEditing)}
                className="px-4 py-2 bg-gold text-dark rounded-lg hover:bg-amber-500 transition-all font-medium"
              >
                {isEditing ? 'Cancel' : 'Edit Profile'}
              </button>
            </div>
          </div>
        </div>

        {isEditing && (
          <form onSubmit={handleProfileUpdate} className="mt-6 border-t pt-6">
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Username
                </label>
                <input
                  type="text"
                  value={formData.username}
                  onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gold focus:border-transparent outline-none"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Avatar Image
                </label>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={uploadAvatar}
                  disabled={uploading}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gold focus:border-transparent outline-none"
                />
                <p className="text-xs text-gray-500 mt-1">
                  JPG, PNG, or WEBP • Max 2MB
                </p>
              </div>
              <button
                type="submit"
                disabled={loading || uploading}
                className="px-6 py-2 bg-gold text-dark rounded-lg hover:bg-amber-500 transition-all disabled:opacity-50 font-medium"
              >
                {loading ? 'Saving...' : 'Save Changes'}
              </button>
            </div>
          </form>
        )}
      </motion.div>

      {/* Statistics Card */}
      {stats && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white rounded-xl shadow-md p-6"
        >
          <h3 className="text-xl font-bold text-dark mb-4">Learning Statistics</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center p-4 bg-cream rounded-lg">
              <p className="text-3xl font-bold text-gold">{stats.total_score || 0}</p>
              <p className="text-sm text-gray-500">Total Score</p>
            </div>
            <div className="text-center p-4 bg-cream rounded-lg">
              <p className="text-3xl font-bold text-green-500">{stats.levels_completed || 0}</p>
              <p className="text-sm text-gray-500">Levels Completed</p>
            </div>
            <div className="text-center p-4 bg-cream rounded-lg">
              <p className="text-3xl font-bold text-blue-500">{stats.average_score || 0}</p>
              <p className="text-sm text-gray-500">Average Score</p>
            </div>
            <div className="text-center p-4 bg-cream rounded-lg">
              <p className="text-3xl font-bold text-purple-500">{stats.perfect_scores || 0}</p>
              <p className="text-sm text-gray-500">Perfect Scores</p>
            </div>
          </div>
        </motion.div>
      )}

      {/* Change Password Card */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="bg-white rounded-xl shadow-md p-6"
      >
        <h3 className="text-xl font-bold text-dark mb-4">Change Password</h3>
        <form onSubmit={handlePasswordChange} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Current Password
            </label>
            <div className="relative">
              <input
                type={showCurrentPassword ? 'text' : 'password'}
                value={passwordData.currentPassword}
                onChange={(e) => setPasswordData({ ...passwordData, currentPassword: e.target.value })}
                className="w-full px-4 py-2 pr-10 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gold focus:border-transparent outline-none"
                required
              />
              <button
                type="button"
                onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 p-1"
                tabIndex={-1}
              >
                {showCurrentPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
              </button>
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              New Password
            </label>
            <div className="relative">
              <input
                type={showNewPassword ? 'text' : 'password'}
                value={passwordData.newPassword}
                onChange={(e) => setPasswordData({ ...passwordData, newPassword: e.target.value })}
                className="w-full px-4 py-2 pr-10 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gold focus:border-transparent outline-none"
                placeholder="Min 8 characters, upper, lower, number, special"
                required
              />
              <button
                type="button"
                onClick={() => setShowNewPassword(!showNewPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 p-1"
                tabIndex={-1}
              >
                {showNewPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
              </button>
            </div>
            <PasswordStrengthMeter password={passwordData.newPassword} />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Confirm New Password
            </label>
            <div className="relative">
              <input
                type={showConfirmPassword ? 'text' : 'password'}
                value={passwordData.confirmPassword}
                onChange={(e) => setPasswordData({ ...passwordData, confirmPassword: e.target.value })}
                className="w-full px-4 py-2 pr-10 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gold focus:border-transparent outline-none"
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
          <button
            type="submit"
            disabled={loading}
            className="px-6 py-2 bg-gold text-dark rounded-lg hover:bg-amber-500 transition-all disabled:opacity-50 font-medium"
          >
            {loading ? 'Updating...' : 'Update Password'}
          </button>
        </form>
      </motion.div>
    </div>
  )
}