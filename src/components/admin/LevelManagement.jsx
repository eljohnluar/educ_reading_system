import React, { useState, useEffect } from 'react'
import { supabase } from '../../lib/supabase'
import { adminService } from '../../services/adminService'
import { motion } from 'framer-motion'
import toast from 'react-hot-toast'

export default function LevelManagement() {
  const [levels, setLevels] = useState([])
  const [loading, setLoading] = useState(true)
  const [editingLevel, setEditingLevel] = useState(null)
  const [showAddForm, setShowAddForm] = useState(false)
  const [formData, setFormData] = useState({
    level_name: '',
    display_order: 1,
    unlock_requirement: 3,
    description: '',
    icon: '📚',
    color_code: '#E9D2A9'
  })

  useEffect(() => {
    fetchLevels()
  }, [])

  const fetchLevels = async () => {
    try {
      setLoading(true)
      const { data, error } = await supabase
        .from('levels')
        .select('*')
        .order('display_order', { ascending: true })

      if (error) throw error
      setLevels(data || [])
    } catch (error) {
      console.error('Error fetching levels:', error)
      toast.error('Failed to load levels')
    } finally {
      setLoading(false)
    }
  }

  const handleInputChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    try {
      if (editingLevel) {
        // Update existing level
        const { error } = await supabase
          .from('levels')
          .update(formData)
          .eq('id', editingLevel.id)

        if (error) throw error
        toast.success('Level updated successfully')
      } else {
        // Create new level
        const { error } = await supabase
          .from('levels')
          .insert([formData])

        if (error) throw error
        toast.success('Level created successfully')
      }

      setShowAddForm(false)
      setEditingLevel(null)
      setFormData({
        level_name: '',
        display_order: 1,
        unlock_requirement: 3,
        description: '',
        icon: '📚',
        color_code: '#E9D2A9'
      })
      fetchLevels()
    } catch (error) {
      console.error('Error saving level:', error)
      toast.error('Failed to save level')
    }
  }

  const handleEdit = (level) => {
    setEditingLevel(level)
    setFormData({
      level_name: level.level_name,
      display_order: level.display_order,
      unlock_requirement: level.unlock_requirement,
      description: level.description || '',
      icon: level.icon || '📚',
      color_code: level.color_code || '#E9D2A9'
    })
    setShowAddForm(true)
  }

  const handleDelete = async (levelId) => {
    if (!confirm('Are you sure you want to delete this level? This will also delete all associated stories and progress.')) {
      return
    }

    try {
      const { error } = await supabase
        .from('levels')
        .delete()
        .eq('id', levelId)

      if (error) throw error
      toast.success('Level deleted successfully')
      fetchLevels()
    } catch (error) {
      console.error('Error deleting level:', error)
      toast.error('Failed to delete level')
    }
  }

  const getLevelStats = (levelId) => {
    // This would need a separate query to get story and progress counts
    // For now, we'll show placeholder values
    return { stories: 0, completions: 0 }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gold"></div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-dark">📚 Level Management</h1>
        <button
          onClick={() => {
            setEditingLevel(null)
            setFormData({
              level_name: '',
              display_order: levels.length + 1,
              unlock_requirement: 3,
              description: '',
              icon: '📚',
              color_code: '#E9D2A9'
            })
            setShowAddForm(true)
          }}
          className="px-4 py-2 bg-gold text-white rounded-lg hover:bg-amber-500 transition-all"
        >
          + Add Level
        </button>
      </div>

      {/* Level Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {levels.map((level) => (
          <motion.div
            key={level.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-xl shadow-md overflow-hidden"
          >
            <div 
              className="h-2" 
              style={{ backgroundColor: level.color_code || '#E9D2A9' }}
            />
            <div className="p-6">
              <div className="flex items-center justify-between mb-2">
                <span className="text-4xl">{level.icon || '📚'}</span>
                <span className="text-sm text-gray-400">#{level.display_order}</span>
              </div>
              <h3 className="text-xl font-bold text-dark capitalize">{level.level_name}</h3>
              <p className="text-sm text-gray-500 mt-1">{level.description}</p>
              <div className="mt-3 flex items-center space-x-4">
                <span className="text-xs text-gray-400">
                  Unlock: {level.unlock_requirement} points
                </span>
              </div>
              <div className="mt-4 flex space-x-2">
                <button
                  onClick={() => handleEdit(level)}
                  className="flex-1 px-3 py-1 bg-cream text-dark rounded-lg hover:bg-gold hover:text-white transition-all text-sm"
                >
                  Edit
                </button>
                <button
                  onClick={() => handleDelete(level.id)}
                  className="flex-1 px-3 py-1 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 transition-all text-sm"
                >
                  Delete
                </button>
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Add/Edit Modal */}
      {showAddForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-md w-full p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-dark">
                {editingLevel ? 'Edit Level' : 'Add New Level'}
              </h2>
              <button
                onClick={() => {
                  setShowAddForm(false)
                  setEditingLevel(null)
                }}
                className="text-gray-500 hover:text-gray-700"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Level Name
                </label>
                <input
                  type="text"
                  name="level_name"
                  value={formData.level_name}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gold focus:border-transparent outline-none"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Display Order
                </label>
                <input
                  type="number"
                  name="display_order"
                  value={formData.display_order}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gold focus:border-transparent outline-none"
                  required
                  min="1"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Unlock Requirement (Score needed)
                </label>
                <input
                  type="number"
                  name="unlock_requirement"
                  value={formData.unlock_requirement}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gold focus:border-transparent outline-none"
                  required
                  min="0"
                  max="6"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Description
                </label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gold focus:border-transparent outline-none"
                  rows="3"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Icon
                  </label>
                  <input
                    type="text"
                    name="icon"
                    value={formData.icon}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gold focus:border-transparent outline-none"
                    placeholder="📚"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Color
                  </label>
                  <input
                    type="color"
                    name="color_code"
                    value={formData.color_code}
                    onChange={handleInputChange}
                    className="w-full h-10 border border-gray-300 rounded-lg cursor-pointer"
                  />
                </div>
              </div>

              <button
                type="submit"
                className="w-full py-2 bg-gold text-white rounded-lg hover:bg-amber-500 transition-all"
              >
                {editingLevel ? 'Update Level' : 'Create Level'}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}