import { supabase } from '../lib/supabase'

export const leaderboardService = {
  // Get overall leaderboard
  async getOverallLeaderboard(limit = 50) {
    const { data, error } = await supabase
      .from('leaderboard')
      .select('*')
      .limit(limit)
    
    if (error) throw error
    return data
  },

  // Get level-specific leaderboard
  async getLevelLeaderboard(levelName, limit = 20) {
    const { data, error } = await supabase
      .rpc('get_level_leaderboard', { 
        level_name_param: levelName 
      })
    
    if (error) throw error
    return data
  },

  // Get user rank
  async getUserRank(userId) {
    const { data, error } = await supabase
      .from('leaderboard')
      .select('rank_position')
      .eq('user_id', userId)
      .single()
    
    if (error && error.code !== 'PGRST116') throw error
    return data?.rank_position || null
  }
}