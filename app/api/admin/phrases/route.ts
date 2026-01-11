import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import prisma from '@/lib/prisma'

async function isAdmin() {
  const session = await getServerSession(authOptions)
  if (!session?.user) return false

  const user = await prisma.user.findUnique({
    where: { email: session.user.email! },
    select: { isAdmin: true },
  })

  return user?.isAdmin === true
}

export async function POST(request: Request) {
  try {
    if (!(await isAdmin())) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { english, georgian, level, category } = await request.json()

    if (!english || !georgian || !level || !category) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    const phrase = await prisma.phrase.create({
      data: { english, georgian, level, category },
    })

    return NextResponse.json({ phrase })
  } catch (error) {
    console.error('Create phrase error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
