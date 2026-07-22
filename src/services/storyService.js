import { supabase, STORAGE_BUCKET } from '../lib/supabase'

export const storyService = {
  // Get story metadata from database
  async getStoryMetadata(levelId, storyId) {
    const { data, error } = await supabase
      .from('story_metadata')
      .select('*')
      .eq('level_id', levelId)
      .eq('story_id', storyId)
      .single()
    
    if (error) throw error
    return data
  },

  // Get story content from Supabase Storage
  async getStoryContent(level, storyId) {
    const { data, error } = await supabase
      .storage
      .from(STORAGE_BUCKET)
      .download(`${level}/story_${storyId}.txt`)
    
    if (error) throw error
    return await data.text()
  },

  // Get story audio URL
  async getStoryAudioUrl(level, storyId) {
    const { data } = supabase
      .storage
      .from(STORAGE_BUCKET)
      .getPublicUrl(`${level}/story_${storyId}.mp3`)
    
    return data.publicUrl
  },

  // Get story image URL
  async getStoryImageUrl(level, storyId) {
    const { data } = supabase
      .storage
      .from(STORAGE_BUCKET)
      .getPublicUrl(`${level}/story_${storyId}.jpg`)
    
    return data.publicUrl
  },

  // Get timing data
  async getStoryTiming(level, storyId) {
    const { data, error } = await supabase
      .storage
      .from(STORAGE_BUCKET)
      .download(`${level}/story_${storyId}.json`)
    
    if (error) throw error
    return await data.json()
  },

  // Get all stories for a level
  async getStoriesByLevel(levelId) {
    const { data, error } = await supabase
      .from('story_metadata')
      .select('*')
      .eq('level_id', levelId)
      .eq('is_active', true)
      .order('story_id', { ascending: true })
    
    if (error) throw error
    return data
  }
}