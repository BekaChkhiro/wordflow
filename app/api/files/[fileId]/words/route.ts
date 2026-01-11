import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import prisma from '@/lib/prisma'
import { z } from 'zod'

const addWordSchema = z.object({
  english: z.string().min(1, 'Word is required').max(500),
  georgian: z.string().min(1, 'Translation is required').max(500),
  context: z.string().min(1, 'Context is required').max(2000),
})

// POST - Add a word from file
export async function POST(
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

    // Verify file ownership
    const file = await prisma.userFile.findUnique({
      where: { id: fileId },
    })

    if (!file) {
      return NextResponse.json({ error: 'File not found' }, { status: 404 })
    }

    if (file.userId !== user.id) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const body = await request.json()
    const validation = addWordSchema.safeParse(body)

    if (!validation.success) {
      return NextResponse.json(
        { error: validation.error.issues[0].message },
        { status: 400 }
      )
    }

    const { english, georgian, context } = validation.data

    // Check if word already exists in this file
    const existingWord = await prisma.fileWord.findUnique({
      where: {
        fileId_english: {
          fileId,
          english: english.toLowerCase().trim(),
        },
      },
    })

    if (existingWord) {
      return NextResponse.json(
        { error: 'This word already exists in the file' },
        { status: 400 }
      )
    }

    const word = await prisma.fileWord.create({
      data: {
        fileId,
        userId: user.id,
        english: english.toLowerCase().trim(),
        georgian: georgian.trim(),
        context: context.trim(),
      },
    })

    return NextResponse.json({
      success: true,
      word: {
        id: word.id,
        english: word.english,
        georgian: word.georgian,
        context: word.context,
        learned: word.learned,
        createdAt: word.createdAt,
      },
    })
  } catch (error) {
    console.error('Add word error:', error)
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}

// DELETE - Remove a word
export async function DELETE(
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
    const { searchParams } = new URL(request.url)
    const wordId = searchParams.get('wordId')

    if (!wordId) {
      return NextResponse.json({ error: 'Word ID required' }, { status: 400 })
    }

    // Find word and verify ownership
    const word = await prisma.fileWord.findUnique({
      where: { id: wordId },
      include: { file: true },
    })

    if (!word) {
      return NextResponse.json({ error: 'Word not found' }, { status: 404 })
    }

    if (word.file.userId !== user.id || word.fileId !== fileId) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    await prisma.fileWord.delete({
      where: { id: wordId },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Delete word error:', error)
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}
