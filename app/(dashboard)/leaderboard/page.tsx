import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { redirect } from 'next/navigation'
import prisma from '@/lib/prisma'
import { Trophy, Medal, Flame, Zap } from 'lucide-react'

type LeaderboardUser = {
  id: string
  name: string | null
  email: string | null
  image: string | null
  totalXp: number
  streak: number
  currentLevel: string
}

export default async function LeaderboardPage() {
  const session = await getServerSession(authOptions)

  if (!session?.user) {
    redirect('/login')
  }

  // Get top 50 users by XP
  const topUsers = await prisma.user.findMany({
    orderBy: { totalXp: 'desc' },
    take: 50,
    select: {
      id: true,
      name: true,
      email: true,
      image: true,
      totalXp: true,
      streak: true,
      currentLevel: true,
    },
  })

  // Get current user
  const currentUser = await prisma.user.findUnique({
    where: { email: session.user.email! },
    select: { id: true, totalXp: true },
  })

  // Calculate user's rank
  let currentUserRank = null
  if (currentUser) {
    const usersAhead = await prisma.user.count({
      where: { totalXp: { gt: currentUser.totalXp } },
    })
    currentUserRank = usersAhead + 1
  }

  const top3 = topUsers.slice(0, 3)
  const rest = topUsers.slice(3)

  const medalColors = [
    'bg-yellow-100 text-yellow-600 border-yellow-300',
    'bg-gray-100 text-gray-600 border-gray-300',
    'bg-orange-100 text-orange-600 border-orange-300',
  ]

  const medalIcons = [
    <Trophy key="gold" className="text-yellow-500" size={24} />,
    <Medal key="silver" className="text-gray-400" size={24} />,
    <Medal key="bronze" className="text-orange-400" size={24} />,
  ]

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">რეიტინგი</h1>
          <p className="text-gray-600">Top 50 მოსწავლე XP-ის მიხედვით</p>
        </div>
        {currentUserRank && (
          <div className="text-right bg-blue-50 px-4 py-2 rounded-lg">
            <p className="text-sm text-blue-600">შენი რანკი</p>
            <p className="text-2xl font-bold text-blue-700">#{currentUserRank}</p>
          </div>
        )}
      </div>

      {/* Top 3 Podium */}
      {top3.length > 0 && (
        <div className="bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl p-6">
          <h2 className="text-white font-semibold mb-6 text-center">Top 3</h2>
          <div className="flex items-end justify-center gap-4">
            {/* Second place */}
            {top3[1] && (
              <div className="flex flex-col items-center">
                <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center mb-2 border-4 border-gray-300">
                  {top3[1].image ? (
                    <img src={top3[1].image} alt="" className="w-full h-full rounded-full" />
                  ) : (
                    <span className="text-2xl font-bold text-gray-600">
                      {(top3[1].name || top3[1].email)?.[0]?.toUpperCase()}
                    </span>
                  )}
                </div>
                <div className="text-center">
                  <p className="text-white font-medium text-sm truncate max-w-[80px]">
                    {top3[1].name || top3[1].email?.split('@')[0]}
                  </p>
                  <p className="text-white/80 text-xs">{top3[1].totalXp} XP</p>
                </div>
                <div className="mt-2 w-16 h-20 bg-gray-300 rounded-t-lg flex items-center justify-center">
                  <span className="text-2xl font-bold text-gray-600">2</span>
                </div>
              </div>
            )}

            {/* First place */}
            {top3[0] && (
              <div className="flex flex-col items-center -mt-8">
                <div className="w-20 h-20 bg-white rounded-full flex items-center justify-center mb-2 border-4 border-yellow-400 relative">
                  {top3[0].image ? (
                    <img src={top3[0].image} alt="" className="w-full h-full rounded-full" />
                  ) : (
                    <span className="text-3xl font-bold text-gray-600">
                      {(top3[0].name || top3[0].email)?.[0]?.toUpperCase()}
                    </span>
                  )}
                  <div className="absolute -top-4">
                    <Trophy className="text-yellow-400 fill-yellow-400" size={24} />
                  </div>
                </div>
                <div className="text-center">
                  <p className="text-white font-bold truncate max-w-[100px]">
                    {top3[0].name || top3[0].email?.split('@')[0]}
                  </p>
                  <p className="text-white/80 text-sm">{top3[0].totalXp} XP</p>
                </div>
                <div className="mt-2 w-20 h-28 bg-yellow-400 rounded-t-lg flex items-center justify-center">
                  <span className="text-3xl font-bold text-yellow-800">1</span>
                </div>
              </div>
            )}

            {/* Third place */}
            {top3[2] && (
              <div className="flex flex-col items-center">
                <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center mb-2 border-4 border-orange-300">
                  {top3[2].image ? (
                    <img src={top3[2].image} alt="" className="w-full h-full rounded-full" />
                  ) : (
                    <span className="text-2xl font-bold text-gray-600">
                      {(top3[2].name || top3[2].email)?.[0]?.toUpperCase()}
                    </span>
                  )}
                </div>
                <div className="text-center">
                  <p className="text-white font-medium text-sm truncate max-w-[80px]">
                    {top3[2].name || top3[2].email?.split('@')[0]}
                  </p>
                  <p className="text-white/80 text-xs">{top3[2].totalXp} XP</p>
                </div>
                <div className="mt-2 w-16 h-16 bg-orange-400 rounded-t-lg flex items-center justify-center">
                  <span className="text-2xl font-bold text-orange-800">3</span>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Rest of leaderboard */}
      {rest.length > 0 && (
        <div className="bg-white rounded-xl border border-gray-100">
          <div className="divide-y divide-gray-100">
            {rest.map((user: LeaderboardUser, index: number) => {
              const rank = index + 4
              const isCurrentUser = user.id === currentUser?.id

              return (
                <div
                  key={user.id}
                  className={`p-4 flex items-center gap-4 ${isCurrentUser ? 'bg-blue-50' : ''}`}
                >
                  <div className="w-8 text-center">
                    <span className={`font-bold ${isCurrentUser ? 'text-blue-600' : 'text-gray-400'}`}>
                      {rank}
                    </span>
                  </div>

                  <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center flex-shrink-0">
                    {user.image ? (
                      <img src={user.image} alt="" className="w-full h-full rounded-full" />
                    ) : (
                      <span className="font-bold text-gray-500">
                        {(user.name || user.email)?.[0]?.toUpperCase()}
                      </span>
                    )}
                  </div>

                  <div className="flex-1 min-w-0">
                    <p className={`font-medium truncate ${isCurrentUser ? 'text-blue-900' : 'text-gray-900'}`}>
                      {user.name || user.email?.split('@')[0]}
                      {isCurrentUser && <span className="text-blue-600 ml-2">(შენ)</span>}
                    </p>
                    <div className="flex items-center gap-3 text-sm text-gray-500">
                      <span className="flex items-center gap-1">
                        <span className="text-xs px-1.5 py-0.5 bg-gray-100 rounded">
                          {user.currentLevel}
                        </span>
                      </span>
                      {user.streak > 0 && (
                        <span className="flex items-center gap-1 text-orange-500">
                          <Flame size={14} />
                          {user.streak}
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="text-right">
                    <p className={`font-bold flex items-center gap-1 ${isCurrentUser ? 'text-blue-600' : 'text-gray-900'}`}>
                      <Zap size={16} className="text-yellow-500" />
                      {user.totalXp}
                    </p>
                    <p className="text-xs text-gray-500">XP</p>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      )}

      {topUsers.length === 0 && (
        <div className="text-center py-12">
          <Trophy size={48} className="mx-auto text-gray-300 mb-4" />
          <p className="text-gray-500">ჯერ არავინ არ არის რეიტინგში</p>
        </div>
      )}
    </div>
  )
}
