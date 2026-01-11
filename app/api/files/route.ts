import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import prisma from '@/lib/prisma'
import { deleteFromR2 } from '@/lib/r2'

// GET - List user's files
export async function GET() {
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

    const files = await prisma.userFile.findMany({
      where: { userId: user.id },
      select: {
        id: true,
        name: true,
        mimeType: true,
        size: true,
        createdAt: true,
        _count: {
          select: { words: true },
        },
        words: {
          select: {
            learned: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    })

    // Calculate progress for each file
    const filesWithProgress = files.map((file) => {
      const totalWords = file._count.words
      const learnedWords = file.words.filter((w) => w.learned).length
      const progress = totalWords > 0 ? Math.round((learnedWords / totalWords) * 100) : 0

      return {
        id: file.id,
        name: file.name,
        mimeType: file.mimeType,
        size: file.size,
        createdAt: file.createdAt,
        totalWords,
        learnedWords,
        progress,
      }
    })

    return NextResponse.json({ files: filesWithProgress })
  } catch (error) {
    console.error('Get files error:', error)
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}

// DELETE - Delete a file
export async function DELETE(request: NextRequest) {
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

    const { searchParams } = new URL(request.url)
    const fileId = searchParams.get('fileId')

    if (!fileId) {
      return NextResponse.json({ error: 'File ID required' }, { status: 400 })
    }

    // Find file and verify ownership
    const file = await prisma.userFile.findUnique({
      where: { id: fileId },
    })

    if (!file) {
      return NextResponse.json({ error: 'File not found' }, { status: 404 })
    }

    if (file.userId !== user.id) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    // Delete from R2
    try {
      await deleteFromR2(file.r2Key)
    } catch (r2Error) {
      console.error('R2 deletion error:', r2Error)
      // Continue with database deletion even if R2 fails
    }

    // Delete from database (cascade will delete words and mistakes)
    await prisma.userFile.delete({
      where: { id: fileId },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Delete file error:', error)
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}
