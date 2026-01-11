import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import prisma from '@/lib/prisma'

// Get phrases
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const level = searchParams.get('level')
    const category = searchParams.get('category')
    const limit = parseInt(searchParams.get('limit') || '10')

    const phrases = await prisma.phrase.findMany({
      where: {
        ...(level && { level }),
        ...(category && { category }),
      },
      take: limit,
      orderBy: { id: 'asc' },
    })

    return NextResponse.json({ phrases })
  } catch (error) {
    console.error('Get phrases error:', error)
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}
