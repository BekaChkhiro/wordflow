import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import prisma from '@/lib/prisma'
import { uploadToR2, generateFileKey } from '@/lib/r2'
import {
  parseFileContent,
  isValidFileType,
  isValidFileSize,
  MAX_FILE_SIZE,
} from '@/lib/file-parser'

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

    const formData = await request.formData()
    const file = formData.get('file') as File | null

    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 })
    }

    // Validate file type
    if (!isValidFileType(file.type)) {
      return NextResponse.json(
        { error: 'Invalid file type. Supported: DOCX, TXT' },
        { status: 400 }
      )
    }

    // Validate file size
    if (!isValidFileSize(file.size)) {
      return NextResponse.json(
        { error: `File too large. Max size: ${MAX_FILE_SIZE / 1024 / 1024}MB` },
        { status: 400 }
      )
    }

    // Convert file to buffer
    const buffer = Buffer.from(await file.arrayBuffer())

    // Parse text content from file
    let textContent: string
    try {
      textContent = await parseFileContent(buffer, file.type)
    } catch (parseError) {
      console.error('File parsing error:', parseError)
      return NextResponse.json(
        { error: 'Failed to parse file content' },
        { status: 400 }
      )
    }

    if (!textContent || textContent.length === 0) {
      return NextResponse.json(
        { error: 'File appears to be empty or unreadable' },
        { status: 400 }
      )
    }

    // Generate R2 key and upload
    const r2Key = generateFileKey(user.id, file.name)
    await uploadToR2(r2Key, buffer, file.type)

    // Save to database
    const userFile = await prisma.userFile.create({
      data: {
        userId: user.id,
        name: file.name,
        r2Key,
        mimeType: file.type,
        size: file.size,
        textContent,
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
    console.error('File upload error:', error)
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}
