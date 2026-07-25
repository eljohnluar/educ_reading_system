import { supabase } from '../lib/supabase'

export const adminService = {
  // Get dashboard statistics
  async getDashboardStats() {
    const { data, error } = await supabase
      .rpc('get_dashboard_stats')
    
    if (error) throw error
    return Array.isArray(data) && data.length > 0 ? data[0] : (data || {})
  },

  // Get all users
  async getUsers(limit = 100, offset = 0) {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1)
    
    if (error) throw error
    return data
  },

  // Update user role
  async updateUserRole(userId, role) {
    const { data, error } = await supabase
      .from('profiles')
      .update({ role })
      .eq('id', userId)
      .select()
      .single()
    
    if (error) throw error
    return data
  },

  // Get user activity logs
  async getActivityLogs(limit = 50) {
    const { data, error } = await supabase
      .from('user_activity_log')
      .select('*, profiles(username, email)')
      .order('created_at', { ascending: false })
      .limit(limit)
    
    if (error) throw error
    return data
  },

  // Get user progress for admin
  async getUserProgress(userId) {
    const { data, error } = await supabase
      .from('user_progress')
      .select('*, profiles(username)')
      .eq('user_id', userId)
      .order('completed_at', { ascending: false })
    
    if (error) throw error
    return data
  },

  // Update story metadata
  async updateStoryMetadata(storyId, updates) {
    const { data, error } = await supabase
      .from('story_metadata')
      .update(updates)
      .eq('id', storyId)
      .select()
      .single()
    
    if (error) throw error
    return data
  },



  // Get user count
  async getUserCount() {
    const { count, error } = await supabase
      .from('profiles')
      .select('*', { count: 'exact', head: true })
    
    if (error) throw error
    return count
  }
}