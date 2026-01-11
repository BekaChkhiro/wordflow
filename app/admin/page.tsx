import prisma from '@/lib/prisma'
import { Users, BookOpen, Zap, TrendingUp, Activity } from 'lucide-react'

export default async function AdminDashboard() {
  // Get stats
  const [
    totalUsers,
    totalPhrases,
    totalProgress,
    totalMistakes,
    recentUsers,
    phrasesByLevel,
  ] = await Promise.all([
    prisma.user.count(),
    prisma.phrase.count(),
    prisma.userProgress.count({ where: { learned: true } }),
    prisma.userMistake.count(),
    prisma.user.findMany({
      orderBy: { createdAt: 'desc' },
      take: 5,
      select: {
        id: true,
        name: true,
        email: true,
        totalXp: true,
        createdAt: true,
      },
    }),
    prisma.phrase.groupBy({
      by: ['level'],
      _count: { id: true },
    }),
  ])

  // Calculate active users (last 7 days)
  const sevenDaysAgo = new Date()
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7)
  const activeUsers = await prisma.user.count({
    where: { lastActiveAt: { gte: sevenDaysAgo } },
  })

  const levelCounts = phrasesByLevel.reduce((acc: Record<string, number>, item: { level: string; _count: { id: number } }) => {
    acc[item.level] = item._count.id
    return acc
  }, {} as Record<string, number>)

  const stats = [
    { label: 'მომხმარებლები', value: totalUsers, icon: Users, color: 'bg-blue-500' },
    { label: 'ფრაზები', value: totalPhrases, icon: BookOpen, color: 'bg-green-500' },
    { label: 'ნასწავლი', value: totalProgress, icon: Zap, color: 'bg-yellow-500' },
    { label: 'აქტიური (7 დღე)', value: activeUsers, icon: Activity, color: 'bg-purple-500' },
  ]

  return (
    <div className="space-y-6">
      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat) => {
          const Icon = stat.icon
          return (
            <div key={stat.label} className="bg-white rounded-xl p-6 shadow-sm">
              <div className="flex items-center gap-4">
                <div className={`w-12 h-12 ${stat.color} rounded-lg flex items-center justify-center`}>
                  <Icon className="text-white" size={24} />
                </div>
                <div>
                  <p className="text-3xl font-bold text-gray-900">{stat.value}</p>
                  <p className="text-sm text-gray-500">{stat.label}</p>
                </div>
              </div>
            </div>
          )
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Phrases by Level */}
        <div className="bg-white rounded-xl p-6 shadow-sm">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">ფრაზები დონის მიხედვით</h2>
          <div className="space-y-3">
            {['A1', 'A2', 'B1', 'B2', 'C1', 'C2'].map((level) => {
              const count = levelCounts[level] || 0
              const percentage = totalPhrases > 0 ? (count / totalPhrases) * 100 : 0

              return (
                <div key={level} className="flex items-center gap-4">
                  <div className="w-10 font-bold text-gray-700">{level}</div>
                  <div className="flex-1 h-6 bg-gray-100 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-blue-500 transition-all"
                      style={{ width: `${percentage}%` }}
                    />
                  </div>
                  <div className="w-16 text-right text-sm text-gray-600">{count}</div>
                </div>
              )
            })}
          </div>
        </div>

        {/* Recent Users */}
        <div className="bg-white rounded-xl p-6 shadow-sm">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">ბოლო რეგისტრაციები</h2>
          <div className="space-y-3">
            {recentUsers.map((user: { id: string; name: string | null; email: string | null; totalXp: number; createdAt: Date }) => (
              <div key={user.id} className="flex items-center justify-between py-2 border-b border-gray-100 last:border-0">
                <div>
                  <p className="font-medium text-gray-900">
                    {user.name || user.email?.split('@')[0]}
                  </p>
                  <p className="text-sm text-gray-500">{user.email}</p>
                </div>
                <div className="text-right">
                  <p className="font-medium text-yellow-600">{user.totalXp} XP</p>
                  <p className="text-xs text-gray-400">
                    {user.createdAt.toLocaleDateString('ka-GE')}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="bg-white rounded-xl p-6 shadow-sm">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">სტატისტიკა</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="text-center p-4 bg-gray-50 rounded-lg">
            <p className="text-2xl font-bold text-gray-900">{totalMistakes}</p>
            <p className="text-sm text-gray-500">სულ შეცდომა</p>
          </div>
          <div className="text-center p-4 bg-gray-50 rounded-lg">
            <p className="text-2xl font-bold text-gray-900">
              {totalUsers > 0 ? Math.round(totalProgress / totalUsers) : 0}
            </p>
            <p className="text-sm text-gray-500">საშუალო ნასწავლი</p>
          </div>
          <div className="text-center p-4 bg-gray-50 rounded-lg">
            <p className="text-2xl font-bold text-gray-900">
              {totalProgress > 0 && totalMistakes > 0
                ? Math.round((totalProgress / (totalProgress + totalMistakes)) * 100)
                : 0}%
            </p>
            <p className="text-sm text-gray-500">სიზუსტე</p>
          </div>
          <div className="text-center p-4 bg-gray-50 rounded-lg">
            <p className="text-2xl font-bold text-gray-900">
              {Math.round((activeUsers / (totalUsers || 1)) * 100)}%
            </p>
            <p className="text-sm text-gray-500">აქტიურობა</p>
          </div>
        </div>
      </div>
    </div>
  )
}
