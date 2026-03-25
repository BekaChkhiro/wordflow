import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import prisma from '@/lib/prisma'

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
    const { name, textContent } = body

    if (!name || typeof name !== 'string' || name.trim().length === 0) {
      return NextResponse.json(
        { error: 'დოკუმენტის სახელი აუცილებელია' },
        { status: 400 }
      )
    }

    if (!textContent || typeof textContent !== 'string' || textContent.trim().length === 0) {
      return NextResponse.json(
        { error: 'ტექსტი არ შეიძლება იყოს ცარიელი' },
        { status: 400 }
      )
    }

    const trimmedName = name.trim()
    const trimmedContent = textContent.trim()

    // Generate a unique r2Key for user-created documents (not stored in R2)
    const r2Key = `user-created/${user.id}/${Date.now()}-${trimmedName}`

    const userFile = await prisma.userFile.create({
      data: {
        userId: user.id,
        name: trimmedName,
        r2Key,
        mimeType: 'text/plain',
        size: Buffer.byteLength(trimmedContent, 'utf-8'),
        textContent: trimmedContent,
      },
    })

    return NextResponse.json({
      success: true,
      file: {
        id: userFile.id,
        name: userFile.name,
        mimeType: userFile.mimeType,
        size: userFile.size,
        createdAt: userFile.createdAt,
      },
    })
  } catch (error) {
    console.error('File create error:', error)
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}
