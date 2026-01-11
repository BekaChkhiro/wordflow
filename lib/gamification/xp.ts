// XP System Constants
export const XP_REWARDS = {
  CORRECT_ANSWER: 10,
  STREAK_BONUS: 5,        // 7+ days streak
  LESSON_COMPLETE: 50,
  LEVEL_COMPLETE: 500,
  PERFECT_SESSION: 25,
} as const

// Calculate XP for a session
export function calculateSessionXp(
  correctAnswers: number,
  totalQuestions: number,
  currentStreak: number
): number {
  let xp = correctAnswers * XP_REWARDS.CORRECT_ANSWER

  // Streak bonus
  if (currentStreak >= 7) {
    xp += XP_REWARDS.STREAK_BONUS
  }

  // Perfect session bonus
  if (correctAnswers === totalQuestions && totalQuestions > 0) {
    xp += XP_REWARDS.PERFECT_SESSION
  }

  return xp
}

// Get level from XP
export function getLevelFromXp(totalXp: number): string {
  if (totalXp >= 10000) return 'C2'
  if (totalXp >= 7000) return 'C1'
  if (totalXp >= 4500) return 'B2'
  if (totalXp >= 2500) return 'B1'
  if (totalXp >= 1000) return 'A2'
  return 'A1'
}

// Get XP progress in current level
export function getLevelProgress(totalXp: number): { current: number; max: number; percent: number } {
  const levels = [
    { level: 'A1', min: 0, max: 1000 },
    { level: 'A2', min: 1000, max: 2500 },
    { level: 'B1', min: 2500, max: 4500 },
    { level: 'B2', min: 4500, max: 7000 },
    { level: 'C1', min: 7000, max: 10000 },
    { level: 'C2', min: 10000, max: 15000 },
  ]

  const currentLevel = levels.find((l) => totalXp >= l.min && totalXp < l.max) ?? levels[levels.length - 1]
  const current = totalXp - currentLevel.min
  const max = currentLevel.max - currentLevel.min
  const percent = Math.min((current / max) * 100, 100)

  return { current, max, percent }
}
