import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import prisma from '@/lib/prisma'

// Get user progress
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const level = searchParams.get('level')
    const category = searchParams.get('category')

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      select: {
        progress: {
          where: {
            ...(level && { phrase: { level } }),
            ...(category && { phrase: { category } }),
          },
          include: {
            phrase: true,
          },
        },
      },
    })

    return NextResponse.json({ progress: user?.progress || [] })
  } catch (error) {
    console.error('Get progress error:', error)
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}
