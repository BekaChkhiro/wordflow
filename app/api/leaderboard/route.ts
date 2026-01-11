import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import prisma from '@/lib/prisma'

export async function GET() {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Get top 50 users by XP
    const topUsers = await prisma.user.findMany({
      orderBy: { totalXp: 'desc' },
      take: 50,
      select: {
        id: true,
        name: true,
        image: true,
        totalXp: true,
        streak: true,
        currentLevel: true,
      },
    })

    // Get current user's rank
    const currentUser = await prisma.user.findUnique({
      where: { email: session.user.email! },
      select: { id: true, totalXp: true },
    })

    let currentUserRank = null
    if (currentUser) {
      const usersAhead = await prisma.user.count({
        where: { totalXp: { gt: currentUser.totalXp } },
      })
      currentUserRank = usersAhead + 1
    }

    return NextResponse.json({
      topUsers,
      currentUserId: currentUser?.id,
      currentUserRank,
    })
  } catch (error) {
    console.error('Leaderboard error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
