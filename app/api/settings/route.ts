import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import prisma from '@/lib/prisma'

export async function PUT(request: Request) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { name, dailyGoal, currentLevel } = await request.json()

    // Validate inputs
    const validLevels = ['A1', 'A2', 'B1', 'B2', 'C1', 'C2']
    if (currentLevel && !validLevels.includes(currentLevel)) {
      return NextResponse.json({ error: 'Invalid level' }, { status: 400 })
    }

    if (dailyGoal && (dailyGoal < 1 || dailyGoal > 100)) {
      return NextResponse.json({ error: 'Invalid daily goal' }, { status: 400 })
    }

    // Update user
    const updatedUser = await prisma.user.update({
      where: { email: session.user.email! },
      data: {
        ...(name !== undefined && { name }),
        ...(dailyGoal !== undefined && { dailyGoal }),
        ...(currentLevel !== undefined && { currentLevel }),
      },
      select: {
        id: true,
        name: true,
        dailyGoal: true,
        currentLevel: true,
      },
    })

    return NextResponse.json({ user: updatedUser })
  } catch (error) {
    console.error('Settings update error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function GET() {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email! },
      select: {
        id: true,
        name: true,
        email: true,
        dailyGoal: true,
        currentLevel: true,
      },
    })

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    return NextResponse.json({ user })
  } catch (error) {
    console.error('Settings fetch error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
