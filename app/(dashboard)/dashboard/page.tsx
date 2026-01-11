import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { redirect } from 'next/navigation'
import { Flame, Zap, Trophy, BookOpen } from 'lucide-react'
import StatsCard from '@/components/dashboard/StatsCard'
import DailyGoalProgress from '@/components/dashboard/DailyGoalProgress'
import LevelSelector from '@/components/dashboard/LevelSelector'
import QuickActions from '@/components/dashboard/QuickActions'
import prisma from '@/lib/prisma'

export default async function DashboardPage() {
  const session = await getServerSession(authOptions)

  if (!session?.user) {
    redirect('/login')
  }

  // Get user data
  const user = await prisma.user.findUnique({
    where: { email: session.user.email! },
    select: {
      currentLevel: true,
      totalXp: true,
      streak: true,
      longestStreak: true,
      dailyGoal: true,
      dailyProgress: true,
      _count: {
        select: {
          progress: {
            where: { learned: true },
          },
        },
      },
    },
  })

  const stats = {
    xp: user?.totalXp || 0,
    streak: user?.streak || 0,
    longestStreak: user?.longestStreak || 0,
    learnedPhrases: user?._count?.progress || 0,
    currentLevel: user?.currentLevel || 'A1',
    dailyGoal: user?.dailyGoal || 10,
    dailyProgress: user?.dailyProgress || 0,
  }

  return (
    <div className="space-y-6">
      {/* Welcome */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl p-6 text-white">
        <h2 className="text-2xl font-bold mb-2">
          გამარჯობა, {session.user.name?.split(' ')[0] || 'მოსწავლე'}! 👋
        </h2>
        <p className="text-blue-100">
          მზად ხარ დღევანდელი სწავლისთვის? გააგრძელე პროგრესი!
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatsCard
          title="სულ XP"
          value={stats.xp}
          icon={Zap}
          iconColor="text-yellow-600"
          iconBgColor="bg-yellow-100"
        />
        <StatsCard
          title="Streak"
          value={stats.streak}
          subtitle={`რეკორდი: ${stats.longestStreak}`}
          icon={Flame}
          iconColor="text-orange-600"
          iconBgColor="bg-orange-100"
        />
        <StatsCard
          title="ნასწავლი ფრაზა"
          value={stats.learnedPhrases}
          subtitle="897-დან"
          icon={BookOpen}
          iconColor="text-green-600"
          iconBgColor="bg-green-100"
        />
        <StatsCard
          title="მიღწევები"
          value="0/21"
          icon={Trophy}
          iconColor="text-purple-600"
          iconBgColor="bg-purple-100"
        />
      </div>

      {/* Daily Goal */}
      <DailyGoalProgress current={stats.dailyProgress} goal={stats.dailyGoal} />

      {/* Two columns */}
      <div className="grid md:grid-cols-2 gap-6">
        {/* Quick Actions */}
        <QuickActions />

        {/* Level Selector */}
        <LevelSelector currentLevel={stats.currentLevel} />
      </div>
    </div>
  )
}
