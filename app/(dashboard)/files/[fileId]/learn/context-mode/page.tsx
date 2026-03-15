import { getServerSession } from 'next-auth'
import { redirect, notFound } from 'next/navigation'
import Link from 'next/link'
import { authOptions } from '@/lib/auth'
import prisma from '@/lib/prisma'
import { ArrowLeft } from 'lucide-react'
import { ContextMode } from '@/components/files/learn/ContextMode'
import {
  getHardcodedContextSentences,
  extractContextSentences,
} from '@/lib/expression-extractor'

interface PageProps {
  params: Promise<{ fileId: string }>
}

export default async function ContextModePage({ params }: PageProps) {
  const session = await getServerSession(authOptions)

  if (!session?.user?.email) {
    redirect('/login')
  }

  const user = await prisma.user.findUnique({
    where: { email: session.user.email },
  })

  if (!user) {
    redirect('/login')
  }

  const { fileId } = await params

  const file = await prisma.userFile.findUnique({
    where: { id: fileId },
    select: {
      id: true,
      name: true,
      userId: true,
      textContent: true,
    },
  })

  if (!file) {
    notFound()
  }

  if (file.userId !== user.id) {
    notFound()
  }

  // Try to extract context sentences from file content
  let sentences = file.textContent
    ? extractContextSentences(file.textContent)
    : []

  // If no sentences found, use hardcoded ones
  if (sentences.length === 0) {
    sentences = getHardcodedContextSentences()
  }

  return (
    <div className="-m-6 min-h-[calc(100%+3rem)] bg-gray-50 p-6">
      {/* Header */}
      <div className="flex items-center gap-4 mb-6">
        <Link
          href={`/files/${fileId}/learn`}
          className="p-2 text-gray-600 hover:bg-white rounded-lg transition-colors"
        >
          <ArrowLeft size={20} />
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Context Mode</h1>
          <p className="text-gray-600">
            გამოიცანი სიტყვა კონტექსტიდან • {sentences.length} წინადადება
          </p>
        </div>
      </div>

      {/* Learning Component */}
      <ContextMode sentences={sentences} />
    </div>
  )
}
