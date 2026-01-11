import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { redirect } from 'next/navigation'
import prisma from '@/lib/prisma'
import { User, Zap, Flame, Trophy, BookOpen, Calendar, Target } from 'lucide-react'

type UserAchievement = {
  id: string
  achievement: {
    icon: string
    name: string
  }
}

export default async function ProfilePage() {
  const session = await getServerSession(authOptions)

  if (!session?.user) {
    redirect('/login')
  }

  const user = await prisma.user.findUnique({
    where: { email: session.user.email! },
    include: {
      achievements: {
        include: {
          achievement: true,
        },
        orderBy: { earnedAt: 'desc' },
        take: 6,
      },
      progress: {
        where: { learned: true },
      },
    },
  })

  if (!user) {
    redirect('/login')
  }

  // Calculate stats
  const totalPhrases = await prisma.phrase.count()
  const learnedPhrases = user.progress.length
  const learnedPercentage = Math.round((learnedPhrases / totalPhrases) * 100)

  // Get activity for last 30 days
  const thirtyDaysAgo = new Date()
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)

  const recentProgress = await prisma.userProgress.findMany({
    where: {
      userId: user.id,
      lastPracticed: {
        gte: thirtyDaysAgo,
      },
    },
    select: {
      lastPracticed: true,
    },
  })

  // Group by date
  const activityByDate: Record<string, number> = {}
  for (const p of recentProgress) {
    if (p.lastPracticed) {
      const dateKey = p.lastPracticed.toISOString().split('T')[0]
      activityByDate[dateKey] = (activityByDate[dateKey] || 0) + 1
    }
  }

  // Generate last 30 days
  const last30Days = []
  for (let i = 29; i >= 0; i--) {
    const date = new Date()
    date.setDate(date.getDate() - i)
    const dateKey = date.toISOString().split('T')[0]
    last30Days.push({
      date: dateKey,
      count: activityByDate[dateKey] || 0,
    })
  }

  const memberSince = user.createdAt.toLocaleDateString('ka-GE', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })

  return (
    <div className="space-y-6">
      {/* Profile Header */}
      <div className="bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl p-6 text-white">
        <div className="flex items-center gap-4">
          <div className="w-20 h-20 bg-white rounded-full flex items-center justify-center">
            {user.image ? (
              <img src={user.image} alt="" className="w-full h-full rounded-full" />
            ) : (
              <User className="text-gray-400" size={40} />
            )}
          </div>
          <div>
            <h1 className="text-2xl font-bold">{user.name || user.email?.split('@')[0]}</h1>
            <p className="text-blue-100">{user.email}</p>
            <p className="text-sm text-blue-200 mt-1">წევრი {memberSince}-დან</p>
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl p-4 border border-gray-100">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-yellow-100 rounded-lg flex items-center justify-center">
              <Zap className="text-yellow-500" size={20} />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">{user.totalXp}</p>
              <p className="text-sm text-gray-500">XP</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl p-4 border border-gray-100">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center">
              <Flame className="text-orange-500" size={20} />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">{user.streak}</p>
              <p className="text-sm text-gray-500">Streak</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl p-4 border border-gray-100">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
              <BookOpen className="text-green-500" size={20} />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">{learnedPhrases}</p>
              <p className="text-sm text-gray-500">ნასწავლი</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl p-4 border border-gray-100">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
              <Trophy className="text-purple-500" size={20} />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">{user.achievements.length}</p>
              <p className="text-sm text-gray-500">მიღწევა</p>
            </div>
          </div>
        </div>
      </div>

      {/* Current Level */}
      <div className="bg-white rounded-xl p-6 border border-gray-100">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-blue-500 rounded-xl flex items-center justify-center">
              <span className="text-xl font-bold text-white">{user.currentLevel}</span>
            </div>
            <div>
              <p className="font-semibold text-gray-900">მიმდინარე დონე</p>
              <p className="text-sm text-gray-500">{learnedPercentage}% დასრულებული</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Target className="text-blue-500" size={20} />
            <span className="font-medium text-gray-900">{user.dailyGoal} ფრაზა/დღე</span>
          </div>
        </div>
        <div className="h-3 bg-gray-100 rounded-full overflow-hidden">
          <div
            className="h-full bg-blue-500 transition-all duration-500"
            style={{ width: `${learnedPercentage}%` }}
          />
        </div>
        <p className="text-sm text-gray-500 mt-2">
          {learnedPhrases} / {totalPhrases} ფრაზა ნასწავლია
        </p>
      </div>

      {/* Activity Calendar */}
      <div className="bg-white rounded-xl p-6 border border-gray-100">
        <div className="flex items-center gap-2 mb-4">
          <Calendar className="text-gray-500" size={20} />
          <h2 className="font-semibold text-gray-900">აქტივობა (ბოლო 30 დღე)</h2>
        </div>
        <div className="grid grid-cols-10 gap-1">
          {last30Days.map((day) => {
            const intensity = day.count === 0 ? 'bg-gray-100' :
              day.count < 5 ? 'bg-green-200' :
              day.count < 10 ? 'bg-green-400' :
              'bg-green-600'

            return (
              <div
                key={day.date}
                className={`w-full aspect-square rounded ${intensity}`}
                title={`${day.date}: ${day.count} ფრაზა`}
              />
            )
          })}
        </div>
        <div className="flex items-center justify-end gap-2 mt-2 text-xs text-gray-500">
          <span>ნაკლები</span>
          <div className="w-3 h-3 bg-gray-100 rounded" />
          <div className="w-3 h-3 bg-green-200 rounded" />
          <div className="w-3 h-3 bg-green-400 rounded" />
          <div className="w-3 h-3 bg-green-600 rounded" />
          <span>მეტი</span>
        </div>
      </div>

      {/* Recent Achievements */}
      {user.achievements.length > 0 && (
        <div className="bg-white rounded-xl p-6 border border-gray-100">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Trophy className="text-yellow-500" size={20} />
              <h2 className="font-semibold text-gray-900">ბოლო მიღწევები</h2>
            </div>
            <a href="/achievements" className="text-blue-500 text-sm hover:underline">
              ყველას ნახვა
            </a>
          </div>
          <div className="grid grid-cols-3 md:grid-cols-6 gap-3">
            {user.achievements.map((ua: UserAchievement) => (
              <div
                key={ua.id}
                className="text-center"
              >
                <div className="w-12 h-12 mx-auto bg-yellow-100 rounded-full flex items-center justify-center mb-1">
                  <span className="text-2xl">{ua.achievement.icon}</span>
                </div>
                <p className="text-xs text-gray-600 truncate">{ua.achievement.name}</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
