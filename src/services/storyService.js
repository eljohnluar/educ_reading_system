import { supabase, STORAGE_BUCKET } from '../lib/supabase'

export const storyService = {
  // Get story metadata from database - NOW USES level_name (string) instead of level_id (UUID)
  async getStoryMetadata(levelName, storyId) {
    const { data, error } = await supabase
      .from('story_metadata')
      .select('*')
      .eq('level_name', levelName)  // ✅ Changed: level_id → level_name
      .eq('story_id', storyId)
      .maybeSingle()
    
    if (error) throw error
    return data
  },

  // Storage objects use `story_1.*`. We still accept the older space-based
  // convention when it is present, but never fall back to a stale metadata
  // path that has not been verified against Storage.
  async getStoryAssetPaths(level, storyId, metadata = {}) {
    const defaults = {
      filePath: `${level}/story_${storyId}.txt`,
      audioPath: `${level}/story_${storyId}.mp3`,
      imagePath: `${level}/story_${storyId}.jpg`,
      jsonPath: `${level}/story_${storyId}.json`
    }

    const configuredPaths = {
      filePath: normalizeStoragePath(metadata.file_path),
      audioPath: normalizeStoragePath(metadata.audio_url),
      imagePath: normalizeStoragePath(metadata.image_url),
      jsonPath: normalizeStoragePath(metadata.json_path)
    }

    const { data, error } = await supabase.storage.from(STORAGE_BUCKET).list(level)
    if (error) {
      console.warn('Could not list story assets; using canonical filenames.', error)
      return {
        ...defaults,
        ...externalAssetPaths(configuredPaths)
      }
    }

    const fileNames = new Set(data.map(file => file.name))
    const resolvePath = (configuredPath, defaultPath) => {
      if (isExternalUrl(configuredPath)) return configuredPath

      const alternatePath = defaultPath.replace('/story_', '/story ')
      return [configuredPath, defaultPath, alternatePath]
        .filter(Boolean)
        .find(path => fileNames.has(path.split('/').pop())) || defaultPath
    }

    return {
      filePath: resolvePath(configuredPaths.filePath, defaults.filePath),
      audioPath: resolvePath(configuredPaths.audioPath, defaults.audioPath),
      imagePath: resolvePath(configuredPaths.imagePath, defaults.imagePath),
      jsonPath: resolvePath(configuredPaths.jsonPath, defaults.jsonPath)
    }
  },

  // Get story content from Supabase Storage
  async getStoryContent(level, storyId, filePath) {
    const resolvedPath = normalizeStoragePath(filePath || `${level}/story_${storyId}.txt`)
    const { data, error } = await supabase
      .storage
      .from(STORAGE_BUCKET)
      .download(resolvedPath)
    
    if (error) throw error
    return await data.text()
  },

  // Get story audio URL
  async getStoryAudioUrl(level, storyId, audioPath) {
    const resolvedPath = normalizeStoragePath(audioPath || `${level}/story_${storyId}.mp3`)
    if (isExternalUrl(resolvedPath)) return resolvedPath

    const { data } = supabase
      .storage
      .from(STORAGE_BUCKET)
      .getPublicUrl(resolvedPath)
    
    return data.publicUrl
  },

  // Get story image URL
  async getStoryImageUrl(level, storyId, imagePath) {
    const resolvedPath = normalizeStoragePath(imagePath || `${level}/story_${storyId}.jpg`)
    if (isExternalUrl(resolvedPath)) return resolvedPath

    const { data } = supabase
      .storage
      .from(STORAGE_BUCKET)
      .getPublicUrl(resolvedPath)
    
    return data.publicUrl
  },

  // Get timing data
  async getStoryTiming(level, storyId, jsonPath) {
    const resolvedPath = normalizeStoragePath(jsonPath || `${level}/story_${storyId}.json`)
    const { data, error } = await supabase
      .storage
      .from(STORAGE_BUCKET)
      .download(resolvedPath)
    
    if (error) throw error
    return JSON.parse(await data.text())
  },

  // Get all stories for a level - NOW USES level_name (string)
  async getStoriesByLevel(levelName) {
    const { data, error } = await supabase
      .from('story_metadata')
      .select('*')
      .eq('level_name', levelName)  // ✅ Changed: level_id → level_name
      .eq('is_active', true)
      .order('story_id', { ascending: true })
    
    if (error) throw error
    return data
  }
}

function isExternalUrl(value) {
  return typeof value === 'string' && /^https?:\/\//i.test(value)
}

function normalizeStoragePath(value) {
  if (typeof value !== 'string' || isExternalUrl(value)) return value

  const path = value.trim().replaceAll('\\', '/').replace(/^\/+/, '')
  const bucketPrefix = `${STORAGE_BUCKET}/`

  return path.startsWith(bucketPrefix) ? path.slice(bucketPrefix.length) : path
}

function externalAssetPaths(values) {
  return Object.fromEntries(
    Object.entries(values).filter(([, value]) => isExternalUrl(value))
  )
}