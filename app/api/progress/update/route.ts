import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import prisma from '@/lib/prisma'
import { calculateSessionXp, getLevelFromXp } from '@/lib/gamification/xp'
import { calculateNewStreak } from '@/lib/gamification/streak'

interface UpdateProgressBody {
  phraseId: number
  correct: boolean
  mistakeType?: string
  userAnswer?: string
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body: UpdateProgressBody = await request.json()
    const { phraseId, correct, mistakeType, userAnswer } = body

    // Get user
    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
    })

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    // Update or create progress
    const existingProgress = await prisma.userProgress.findUnique({
      where: {
        userId_phraseId: {
          userId: user.id,
          phraseId,
        },
      },
    })

    let xpGained = 0

    if (correct) {
      xpGained = 10 // Base XP for correct answer

      if (existingProgress) {
        const newCorrectCount = existingProgress.correctCount + 1
        // Mark as learned if 3+ correct answers
        const isNowLearned = newCorrectCount >= 3

        await prisma.userProgress.update({
          where: { id: existingProgress.id },
          data: {
            correctCount: newCorrectCount,
            learned: isNowLearned,
            lastPracticed: new Date(),
          },
        })
      } else {
        await prisma.userProgress.create({
          data: {
            userId: user.id,
            phraseId,
            correctCount: 1,
            learned: false,
            lastPracticed: new Date(),
          },
        })
      }
    } else {
      // Wrong answer
      if (existingProgress) {
        await prisma.userProgress.update({
          where: { id: existingProgress.id },
          data: {
            wrongCount: existingProgress.wrongCount + 1,
            lastPracticed: new Date(),
          },
        })
      } else {
        await prisma.userProgress.create({
          data: {
            userId: user.id,
            phraseId,
            wrongCount: 1,
            lastPracticed: new Date(),
          },
        })
      }

      // Record mistake
      if (mistakeType) {
        await prisma.userMistake.create({
          data: {
            userId: user.id,
            phraseId,
            mistakeType,
            userAnswer,
          },
        })
      }
    }

    // Update user XP and streak
    const { streak: newStreak } = calculateNewStreak(user.streak, user.lastActiveAt)
    const newTotalXp = user.totalXp + xpGained
    const newLevel = getLevelFromXp(newTotalXp)

    await prisma.user.update({
      where: { id: user.id },
      data: {
        totalXp: newTotalXp,
        streak: newStreak,
        longestStreak: Math.max(user.longestStreak, newStreak),
        lastActiveAt: new Date(),
        dailyProgress: user.dailyProgress + (correct ? 1 : 0),
        currentLevel: newLevel,
      },
    })

    return NextResponse.json({
      success: true,
      xpGained,
      newTotalXp,
      newStreak,
      newLevel,
    })
  } catch (error) {
    console.error('Update progress error:', error)
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}
