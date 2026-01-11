import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { redirect, notFound } from 'next/navigation'
import Link from 'next/link'
import prisma from '@/lib/prisma'
import { ArrowLeft, Layers } from 'lucide-react'
import FlashcardDeck from '@/components/learn/flashcards/FlashcardDeck'

const levelNames: Record<string, string> = {
  A1: 'A1', A2: 'A2', B1: 'B1', B2: 'B2', C1: 'C1', C2: 'C2',
}

interface PageProps {
  params: Promise<{ level: string }>
  searchParams: Promise<{ category?: string }>
}

export default async function FlashcardsPage({ params, searchParams }: PageProps) {
  const { level } = await params
  const { category } = await searchParams

  if (!levelNames[level]) {
    notFound()
  }

  const session = await getServerSession(authOptions)

  if (!session?.user) {
    redirect('/login')
  }

  // Get phrases
  const phrases = await prisma.phrase.findMany({
    where: {
      level,
      ...(category && { category }),
    },
    select: {
      id: true,
      english: true,
      georgian: true,
    },
    take: 20, // Limit to 20 cards per session
    orderBy: { id: 'asc' },
  })

  if (phrases.length === 0) {
    notFound()
  }

  const backUrl = category
    ? `/courses/${level}/${encodeURIComponent(category)}`
    : `/courses/${level}`

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Link
          href={backUrl}
          className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
        >
          <ArrowLeft size={24} className="text-gray-600" />
        </Link>
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-blue-500 rounded-lg flex items-center justify-center">
            <Layers className="text-white" size={20} />
          </div>
          <div>
            <h1 className="text-xl font-bold text-gray-900">Flashcards</h1>
            <p className="text-sm text-gray-500">
              {levelNames[level]} {category && `• ${category}`}
            </p>
          </div>
        </div>
      </div>

      {/* Flashcard Deck */}
      <FlashcardDeck
        phrases={phrases}
        level={level}
        category={category || 'General'}
      />
    </div>
  )
}
