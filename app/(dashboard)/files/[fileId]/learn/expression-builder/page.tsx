import { getServerSession } from 'next-auth'
import { redirect, notFound } from 'next/navigation'
import Link from 'next/link'
import { authOptions } from '@/lib/auth'
import prisma from '@/lib/prisma'
import { ArrowLeft } from 'lucide-react'
import { ExpressionBuilder } from '@/components/files/learn/ExpressionBuilder'
import {
  getHardcodedExpressions,
  extractExpressions,
} from '@/lib/expression-extractor'

interface PageProps {
  params: Promise<{ fileId: string }>
}

export default async function ExpressionBuilderPage({ params }: PageProps) {
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

  // Try to extract expressions from file content
  let expressions = file.textContent
    ? extractExpressions(file.textContent)
    : []

  // If no expressions found, use hardcoded ones
  if (expressions.length === 0) {
    expressions = getHardcodedExpressions()
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
          <h1 className="text-2xl font-bold text-gray-900">Expression Builder</h1>
          <p className="text-gray-600">
            შეავსე გამოთქმები და იდიომები • {expressions.length} გამოთქმა
          </p>
        </div>
      </div>

      {/* Learning Component */}
      <ExpressionBuilder expressions={expressions} />
    </div>
  )
}
