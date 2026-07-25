import React, { useState, useEffect } from 'react'
import { useAuth } from '../../context/AuthContext'
import { supabase } from '../../lib/supabase'
import toast from 'react-hot-toast'
import { motion } from 'framer-motion'

export default function Profile() {
  const { user, profile, updateProfile } = useAuth()
  const [loading, setLoading] = useState(false)
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
  const [isEditing, setIsEditing] = useState(false)

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
    try {
      setLoading(true)
      const file = event.target.files[0]
      if (!file) return

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
      setLoading(false)
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

    if (passwordData.newPassword.length < 8) {
      toast.error('Password must be at least 8 characters')
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
        <div className="flex items-start space-x-6">
          <div className="flex-shrink-0">
            <img
              src={(isEditing ? formData.avatar_url : profile.avatar_url) || '/assets/images/avatars/default.jpg'}
              alt="Avatar"
              className="w-24 h-24 rounded-full object-cover border-4 border-gold"
              onError={(e) => {
                e.target.src = '/assets/images/avatars/default.jpg'
              }}
            />
          </div>
          <div className="flex-1">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-bold text-dark">{profile.username}</h2>
                <p className="text-gray-500">{profile.email}</p>
                <p className="text-sm text-gray-400 mt-1">
                  Member since {new Date(profile.created_at).toLocaleDateString()}
                </p>
              </div>
              <button
                onClick={() => setIsEditing(!isEditing)}
                className="px-4 py-2 bg-gold text-white rounded-lg hover:bg-amber-500 transition-all"
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
                  type="file"
                  accept="image/*"
                  onChange={uploadAvatar}
                  disabled={loading}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gold focus:border-transparent outline-none"
                />
                <p className="text-xs text-gray-500 mt-1">Select an image to upload it to your profile.</p>
              </div>
              <button
                type="submit"
                disabled={loading}
                className="px-6 py-2 bg-gold text-white rounded-lg hover:bg-amber-500 transition-all disabled:opacity-50"
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
            <input
              type="password"
              value={passwordData.currentPassword}
              onChange={(e) => setPasswordData({ ...passwordData, currentPassword: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gold focus:border-transparent outline-none"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              New Password
            </label>
            <input
              type="password"
              value={passwordData.newPassword}
              onChange={(e) => setPasswordData({ ...passwordData, newPassword: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gold focus:border-transparent outline-none"
              required
              minLength={8}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Confirm New Password
            </label>
            <input
              type="password"
              value={passwordData.confirmPassword}
              onChange={(e) => setPasswordData({ ...passwordData, confirmPassword: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gold focus:border-transparent outline-none"
              required
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className="px-6 py-2 bg-gold text-white rounded-lg hover:bg-amber-500 transition-all disabled:opacity-50"
          >
            {loading ? 'Updating...' : 'Update Password'}
          </button>
        </form>
      </motion.div>
    </div>
  )
}