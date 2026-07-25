// src/config/levels.js

export const LEVELS = [
  {
    id: 'easy',
    name: 'Easy',
    displayOrder: 1,
    unlockRequirement: 0, // Always unlocked
    icon: '🟢',
    colorCode: '#8BC34A',
    description: 'Perfect for beginners. Build your confidence with simple stories.',
    folderPath: 'stories/easy/',
    storyCount: 1 // Number of stories available
  },
  {
    id: 'average',
    name: 'Average',
    displayOrder: 2,
    unlockRequirement: 3, // Need 3+ score to unlock
    icon: '🟠',
    colorCode: '#FFB74D',
    description: 'Intermediate level. Challenge yourself with longer stories.',
    folderPath: 'stories/average/',
    storyCount: 1
  },
  {
    id: 'difficult',
    name: 'Difficult',
    displayOrder: 3,
    unlockRequirement: 3, // Need 3+ score to unlock
    icon: '🟣',
    colorCode: '#CE93D8',
    description: 'Advanced level. Test your comprehensive reading skills.',
    folderPath: 'stories/difficult/',
    storyCount: 1
  }
]

export const getLevelById = (id) => LEVELS.find(l => l.id === id)

export const getLevelByOrder = (order) => LEVELS.find(l => l.displayOrder === order)

export const getNextLevel = (currentLevelId) => {
  const current = getLevelById(currentLevelId)
  if (!current) return null
  return LEVELS.find(l => l.displayOrder === current.displayOrder + 1) || null
}

export const getPreviousLevel = (currentLevelId) => {
  const current = getLevelById(currentLevelId)
  if (!current) return null
  return LEVELS.find(l => l.displayOrder === current.displayOrder - 1) || null
}

export const isLevelUnlocked = (levelId, userProgress) => {
  const level = getLevelById(levelId)
  if (!level) return false
  
  // Easy is always unlocked
  if (levelId === 'easy') return true
  
  // Check if previous level is completed with passing score
  const previousLevel = getPreviousLevel(levelId)
  if (!previousLevel) return false
  
  const previousProgress = userProgress?.[previousLevel.id]
  return previousProgress?.is_completed && previousProgress?.score >= 3
}