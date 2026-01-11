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

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    if (!(await isAdmin())) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id } = await params
    const phraseId = parseInt(id)
    const { english, georgian, level, category } = await request.json()

    const phrase = await prisma.phrase.update({
      where: { id: phraseId },
      data: { english, georgian, level, category },
    })

    return NextResponse.json({ phrase })
  } catch (error) {
    console.error('Update phrase error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    if (!(await isAdmin())) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id } = await params
    const phraseId = parseInt(id)

    await prisma.phrase.delete({
      where: { id: phraseId },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Delete phrase error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
