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

    const user = await prisma.user.findUnique({
      where: { email: session.user.email! },
      select: { id: true },
    })

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    // Get user's mistakes grouped by phrase
    const mistakes = await prisma.userMistake.findMany({
      where: { userId: user.id },
      include: {
        phrase: {
          select: {
            id: true,
            english: true,
            georgian: true,
            level: true,
            category: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    })

    // Group mistakes by phrase
    const mistakesByPhrase = mistakes.reduce((acc, mistake) => {
      const phraseId = mistake.phraseId
      if (!acc[phraseId]) {
        acc[phraseId] = {
          phrase: mistake.phrase,
          count: 0,
          types: new Set<string>(),
          lastMistake: mistake.createdAt,
        }
      }
      acc[phraseId].count++
      acc[phraseId].types.add(mistake.mistakeType)
      return acc
    }, {} as Record<number, { phrase: typeof mistakes[0]['phrase']; count: number; types: Set<string>; lastMistake: Date }>)

    // Convert to array and sort by count
    const groupedMistakes = Object.values(mistakesByPhrase)
      .map((m) => ({
        ...m,
        types: Array.from(m.types),
      }))
      .sort((a, b) => b.count - a.count)

    return NextResponse.json({ mistakes: groupedMistakes })
  } catch (error) {
    console.error('Mistakes error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
