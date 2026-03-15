import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { parseVocabularyWithStats, ExtractedWord } from '@/lib/vocabulary-parser'

/**
 * GET /api/files/[fileId]/extract
 * Extract vocabulary from file text content (preview mode)
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ fileId: string }> }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { fileId } = await params

    // Get file with text content
    const file = await prisma.userFile.findUnique({
      where: { id: fileId },
      select: {
        id: true,
        userId: true,
        name: true,
        textContent: true,
      },
    })

    if (!file) {
      return NextResponse.json({ error: 'File not found' }, { status: 404 })
    }

    if (file.userId !== session.user.id) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    if (!file.textContent) {
      return NextResponse.json(
        { error: 'File has no text content' },
        { status: 400 }
      )
    }

    // Parse vocabulary
    const { words, stats } = parseVocabularyWithStats(file.textContent)

    // Get existing words to mark duplicates
    const existingWords = await prisma.fileWord.findMany({
      where: {
        fileId: fileId,
        userId: session.user.id,
      },
      select: { english: true },
    })

    const existingSet = new Set(existingWords.map((w) => w.english.toLowerCase()))

    // Mark which words already exist
    const wordsWithStatus = words.map((word) => ({
      ...word,
      exists: existingSet.has(word.english.toLowerCase()),
    }))

    return NextResponse.json({
      fileName: file.name,
      words: wordsWithStatus,
      stats: {
        ...stats,
        existingCount: wordsWithStatus.filter((w) => w.exists).length,
        newCount: wordsWithStatus.filter((w) => !w.exists).length,
      },
    })
  } catch (error) {
    console.error('Extract vocabulary error:', error)
    return NextResponse.json(
      { error: 'Failed to extract vocabulary' },
      { status: 500 }
    )
  }
}

/**
 * POST /api/files/[fileId]/extract
 * Save extracted vocabulary to database
 */
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ fileId: string }> }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { fileId } = await params
    const body = await request.json()

    // Validate request body
    const { words, skipExisting = true } = body as {
      words: ExtractedWord[]
      skipExisting?: boolean
    }

    if (!Array.isArray(words) || words.length === 0) {
      return NextResponse.json(
        { error: 'No words provided' },
        { status: 400 }
      )
    }

    // Verify file ownership
    const file = await prisma.userFile.findUnique({
      where: { id: fileId },
      select: { id: true, userId: true },
    })

    if (!file) {
      return NextResponse.json({ error: 'File not found' }, { status: 404 })
    }

    if (file.userId !== session.user.id) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    // Get existing words if skipExisting is true
    let existingSet = new Set<string>()
    if (skipExisting) {
      const existingWords = await prisma.fileWord.findMany({
        where: {
          fileId: fileId,
          userId: session.user.id,
        },
        select: { english: true },
      })
      existingSet = new Set(existingWords.map((w) => w.english.toLowerCase()))
    }

    // Filter and prepare words for insertion
    const wordsToInsert = words
      .filter((word) => {
        // Validate word structure
        if (!word.english || !word.georgian) return false
        if (word.english.length < 1 || word.english.length > 500) return false
        if (word.georgian.length < 1 || word.georgian.length > 500) return false

        // Skip existing if requested
        if (skipExisting && existingSet.has(word.english.toLowerCase())) {
          return false
        }

        return true
      })
      .map((word) => ({
        fileId: fileId,
        userId: session.user.id,
        english: word.english.toLowerCase().trim(),
        georgian: word.georgian.trim(),
        context: word.context?.slice(0, 2000) || '',
        learned: false,
        correctCount: 0,
        wrongCount: 0,
      }))

    if (wordsToInsert.length === 0) {
      return NextResponse.json({
        message: 'No new words to add',
        added: 0,
        skipped: words.length,
      })
    }

    // Batch insert words (skipDuplicates handles race conditions)
    const result = await prisma.fileWord.createMany({
      data: wordsToInsert,
      skipDuplicates: true,
    })

    return NextResponse.json({
      message: `Successfully added ${result.count} words`,
      added: result.count,
      skipped: words.length - result.count,
    })
  } catch (error) {
    console.error('Save vocabulary error:', error)
    return NextResponse.json(
      { error: 'Failed to save vocabulary' },
      { status: 500 }
    )
  }
}
