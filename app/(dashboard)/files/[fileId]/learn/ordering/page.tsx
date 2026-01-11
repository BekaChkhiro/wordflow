import { getServerSession } from 'next-auth'
import { redirect, notFound } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'
import { authOptions } from '@/lib/auth'
import prisma from '@/lib/prisma'
import FileOrderingContainer from '@/components/files/FileOrderingContainer'

interface OrderingPageProps {
  params: Promise<{ fileId: string }>
}

export default async function FileOrderingPage({ params }: OrderingPageProps) {
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
    include: {
      words: {
        select: {
          id: true,
          english: true,
          georgian: true,
        },
      },
    },
  })

  if (!file) {
    notFound()
  }

  if (file.userId !== user.id) {
    notFound()
  }

  // Check if there are any multi-word phrases
  const multiWordPhrases = file.words.filter((w) => {
    const wordCount = w.english.split(' ').length
    return wordCount >= 2 && wordCount <= 6
  })

  if (multiWordPhrases.length === 0) {
    return (
      <div className="-m-6 min-h-[calc(100%+3rem)] bg-white flex items-center justify-center">
        <div className="text-center py-12">
          <h2 className="text-xl font-semibold text-gray-900 mb-2">
            საჭიროა მრავალსიტყვიანი ფრაზები
          </h2>
          <p className="text-gray-600 mb-4">
            თანმიმდევრობის რეჟიმისთვის საჭიროა 2-6 სიტყვიანი ფრაზები.
          </p>
          <Link
            href={`/files/${fileId}`}
            className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            <ArrowLeft size={18} />
            ფაილის გახსნა
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="-m-6 min-h-[calc(100%+3rem)] bg-white p-6">
      <div className="mb-6">
        <div className="flex items-center gap-4 mb-2">
          <Link
            href={`/files/${fileId}/learn`}
            className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <ArrowLeft size={20} />
          </Link>
          <div>
            <h1 className="text-xl font-bold text-gray-900">თანმიმდევრობა</h1>
            <p className="text-gray-600 text-sm">{file.name}</p>
          </div>
        </div>
      </div>

      <div className="max-w-xl mx-auto">
        <FileOrderingContainer words={file.words} fileId={fileId} />
      </div>
    </div>
  )
}
