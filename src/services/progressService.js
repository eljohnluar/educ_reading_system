import { supabase } from '../lib/supabase'

export const progressService = {
  // Get user progress summary
  async getUserProgressSummary(userId) {
    const { data, error } = await supabase
      .rpc('get_user_progress_summary', { p_user_id: userId })
    
    if (error) throw error
    return data
  },

  // Get user statistics
  async getUserStats(userId) {
    const { data, error } = await supabase
      .rpc('get_user_stats', { p_user_id: userId })
    
    if (error) throw error
    return data
  },

  // Save user progress
  async saveProgress(userId, levelName, score, isCompleted, totalQuestions) {
    // Check if record exists first to avoid 409 conflict
    const { data: existing } = await supabase
      .from('user_progress')
      .select('id')
      .eq('user_id', userId)
      .eq('level_name', levelName)
      .maybeSingle()

    if (existing) {
      const { data, error } = await supabase
        .from('user_progress')
        .update({
          score,
          total_questions: totalQuestions || 6,
          correct_answers: score,
          is_completed: isCompleted,
          completed_at: isCompleted ? new Date().toISOString() : null
        })
        .eq('id', existing.id)
      if (error) throw error
      return data
    } else {
      const { data, error } = await supabase
        .from('user_progress')
        .insert({
          user_id: userId,
          level_name: levelName,
          score,
          total_questions: totalQuestions || 6,
          correct_answers: score,
          is_completed: isCompleted,
          completed_at: isCompleted ? new Date().toISOString() : null,
          unlocked_at: new Date().toISOString()
        })
      if (error) throw error
      return data
    }
  },

  // Get level progress for user
  async getLevelProgress(userId, levelName) {
    const { data, error } = await supabase
      .from('user_progress')
      .select('*')
      .eq('user_id', userId)
      .eq('level_name', levelName)
      .maybeSingle()
    
    if (error) throw error
    return data
  },

  // Unlock a level for user
  async unlockLevel(userId, levelName) {
    const { data: existing } = await supabase
      .from('user_progress')
      .select('id')
      .eq('user_id', userId)
      .eq('level_name', levelName)
      .maybeSingle()

    if (existing) {
      const { data, error } = await supabase
        .from('user_progress')
        .update({ unlocked_at: new Date().toISOString() })
        .eq('id', existing.id)
      if (error) throw error
      return data
    } else {
      const { data, error } = await supabase
        .from('user_progress')
        .insert({ user_id: userId, level_name: levelName, unlocked_at: new Date().toISOString() })
      if (error) throw error
      return data
    }
  }
}