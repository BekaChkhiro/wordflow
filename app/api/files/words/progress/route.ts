import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import prisma from '@/lib/prisma'
import { calculateNewStreak } from '@/lib/gamification/streak'
import { getLevelFromXp } from '@/lib/gamification/xp'
import { z } from 'zod'

const updateProgressSchema = z.object({
  fileWordId: z.string().min(1),
  correct: z.boolean(),
  mistakeType: z
    .enum(['flashcard', 'quiz', 'fill_blank', 'ordering', 'matching', 'typing'])
    .optional(),
  userAnswer: z.string().optional(),
})

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
    })

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    const body = await request.json()
    const validation = updateProgressSchema.safeParse(body)

    if (!validation.success) {
      return NextResponse.json(
        { error: validation.error.issues[0].message },
        { status: 400 }
      )
    }

    const { fileWordId, correct, mistakeType, userAnswer } = validation.data

    // Find word and verify ownership
    const word = await prisma.fileWord.findUnique({
      where: { id: fileWordId },
      include: { file: true },
    })

    if (!word) {
      return NextResponse.json({ error: 'Word not found' }, { status: 404 })
    }

    if (word.file.userId !== user.id) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    let xpGained = 0

    if (correct) {
      xpGained = 10 // Base XP for correct answer

      const newCorrectCount = word.correctCount + 1
      // Mark as learned if 3+ correct answers
      const isNowLearned = newCorrectCount >= 3

      await prisma.fileWord.update({
        where: { id: fileWordId },
        data: {
          correctCount: newCorrectCount,
          learned: isNowLearned,
          lastPracticed: new Date(),
        },
      })
    } else {
      // Wrong answer
      await prisma.fileWord.update({
        where: { id: fileWordId },
        data: {
          wrongCount: word.wrongCount + 1,
          lastPracticed: new Date(),
        },
      })

      // Record mistake
      if (mistakeType) {
        await prisma.fileWordMistake.create({
          data: {
            userId: user.id,
            fileWordId,
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
    console.error('Update file word progress error:', error)
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}
