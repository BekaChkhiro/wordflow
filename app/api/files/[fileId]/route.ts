import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import prisma from '@/lib/prisma'

// GET - Get file details with text content and words
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ fileId: string }> }
) {
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

    const { fileId } = await params

    const file = await prisma.userFile.findUnique({
      where: { id: fileId },
      include: {
        words: {
          orderBy: { createdAt: 'asc' },
          select: {
            id: true,
            english: true,
            georgian: true,
            context: true,
            learned: true,
            correctCount: true,
            wrongCount: true,
            createdAt: true,
          },
        },
      },
    })

    if (!file) {
      return NextResponse.json({ error: 'File not found' }, { status: 404 })
    }

    if (file.userId !== user.id) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    return NextResponse.json({
      file: {
        id: file.id,
        name: file.name,
        mimeType: file.mimeType,
        size: file.size,
        textContent: file.textContent,
        createdAt: file.createdAt,
        words: file.words,
      },
    })
  } catch (error) {
    console.error('Get file error:', error)
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}
