// Streak System

// Check if user was active today
export function wasActiveToday(lastActiveAt: Date | null): boolean {
  if (!lastActiveAt) return false

  const today = new Date()
  today.setHours(0, 0, 0, 0)

  const lastActive = new Date(lastActiveAt)
  lastActive.setHours(0, 0, 0, 0)

  return today.getTime() === lastActive.getTime()
}

// Check if user was active yesterday
export function wasActiveYesterday(lastActiveAt: Date | null): boolean {
  if (!lastActiveAt) return false

  const yesterday = new Date()
  yesterday.setDate(yesterday.getDate() - 1)
  yesterday.setHours(0, 0, 0, 0)

  const lastActive = new Date(lastActiveAt)
  lastActive.setHours(0, 0, 0, 0)

  return yesterday.getTime() === lastActive.getTime()
}

// Calculate new streak
export function calculateNewStreak(
  currentStreak: number,
  lastActiveAt: Date | null
): { streak: number; streakBroken: boolean } {
  // If already active today, keep streak
  if (wasActiveToday(lastActiveAt)) {
    return { streak: currentStreak, streakBroken: false }
  }

  // If active yesterday, increment streak
  if (wasActiveYesterday(lastActiveAt)) {
    return { streak: currentStreak + 1, streakBroken: false }
  }

  // If never active or streak broken, start fresh
  return { streak: 1, streakBroken: currentStreak > 0 }
}

// Get streak milestone message
export function getStreakMilestone(streak: number): string | null {
  const milestones: Record<number, string> = {
    7: 'Week Warrior',
    14: 'Two Week Champion',
    30: 'Month Master',
    50: 'Fifty Day Legend',
    100: 'Century Unstoppable',
    365: 'Year of Dedication',
  }

  return milestones[streak] ?? null
}
