import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { redirect } from 'next/navigation'
import prisma from '@/lib/prisma'
import { Trophy, Lock } from 'lucide-react'
import { Achievement } from '@prisma/client'

export default async function AchievementsPage() {
  const session = await getServerSession(authOptions)

  if (!session?.user) {
    redirect('/login')
  }

  // Get all achievements and user's earned achievements
  const [allAchievements, user] = await Promise.all([
    prisma.achievement.findMany({
      orderBy: { requirement: 'asc' },
    }),
    prisma.user.findUnique({
      where: { email: session.user.email! },
      select: {
        totalXp: true,
        streak: true,
        achievements: {
          include: {
            achievement: true,
          },
        },
      },
    }),
  ])

  const earnedIds = new Set(user?.achievements.map((a: { achievementId: string }) => a.achievementId))

  // Group achievements by type
  const achievementsByType: Record<string, Achievement[]> = {}
  for (const achievement of allAchievements) {
    if (!achievementsByType[achievement.type]) {
      achievementsByType[achievement.type] = []
    }
    achievementsByType[achievement.type].push(achievement)
  }

  const typeLabels: Record<string, string> = {
    xp: 'XP მიღწევები',
    streak: 'Streak მიღწევები',
    phrases: 'ფრაზების მიღწევები',
    level: 'დონის მიღწევები',
  }

  const earnedCount = user?.achievements.length || 0
  const totalCount = allAchievements.length

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">მიღწევები</h1>
          <p className="text-gray-600">შეაგროვე ბეჯები სწავლისას</p>
        </div>
        <div className="text-right">
          <p className="text-3xl font-bold text-yellow-500">{earnedCount}/{totalCount}</p>
          <p className="text-sm text-gray-500">განბლოკილი</p>
        </div>
      </div>

      {/* Progress */}
      <div className="bg-white rounded-xl p-6 border border-gray-100">
        <div className="flex items-center gap-4 mb-4">
          <div className="w-12 h-12 bg-yellow-100 rounded-full flex items-center justify-center">
            <Trophy className="text-yellow-500" size={24} />
          </div>
          <div className="flex-1">
            <p className="font-medium text-gray-900">მიღწევების პროგრესი</p>
            <p className="text-sm text-gray-500">
              {Math.round((earnedCount / totalCount) * 100)}% დასრულებული
            </p>
          </div>
        </div>
        <div className="h-3 bg-gray-100 rounded-full overflow-hidden">
          <div
            className="h-full bg-yellow-500 transition-all duration-500"
            style={{ width: `${(earnedCount / totalCount) * 100}%` }}
          />
        </div>
      </div>

      {/* Achievements by type */}
      {Object.entries(achievementsByType).map(([type, achievements]) => (
        <div key={type} className="bg-white rounded-xl border border-gray-100">
          <div className="p-4 border-b border-gray-100">
            <h2 className="font-semibold text-gray-900">{typeLabels[type] || type}</h2>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 p-4">
            {achievements.map((achievement) => {
              const isEarned = earnedIds.has(achievement.id)

              return (
                <div
                  key={achievement.id}
                  className={`
                    relative p-4 rounded-xl text-center transition-all
                    ${isEarned ? 'bg-yellow-50 border-2 border-yellow-200' : 'bg-gray-50 border-2 border-gray-100'}
                  `}
                >
                  {!isEarned && (
                    <div className="absolute top-2 right-2">
                      <Lock size={16} className="text-gray-400" />
                    </div>
                  )}
                  <div
                    className={`
                      w-16 h-16 mx-auto rounded-full flex items-center justify-center mb-3
                      ${isEarned ? 'bg-yellow-100' : 'bg-gray-200'}
                    `}
                  >
                    <span className={`text-3xl ${!isEarned && 'grayscale opacity-50'}`}>
                      {achievement.icon}
                    </span>
                  </div>
                  <p className={`font-medium ${isEarned ? 'text-gray-900' : 'text-gray-400'}`}>
                    {achievement.name}
                  </p>
                  <p className={`text-xs mt-1 ${isEarned ? 'text-gray-600' : 'text-gray-400'}`}>
                    {achievement.description}
                  </p>
                  {!isEarned && (
                    <p className="text-xs mt-2 text-gray-400">
                      საჭირო: {achievement.requirement} {type === 'xp' ? 'XP' : type === 'streak' ? 'დღე' : ''}
                    </p>
                  )}
                </div>
              )
            })}
          </div>
        </div>
      ))}
    </div>
  )
}
