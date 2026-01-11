import { getServerSession } from 'next-auth'
import { redirect } from 'next/navigation'
import { authOptions } from '@/lib/auth'
import prisma from '@/lib/prisma'
import FilesList from '@/components/files/FilesList'

export default async function FilesPage() {
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

  const filesWithProgress = files.map((file) => {
    const totalWords = file._count.words
    const learnedWords = file.words.filter((w) => w.learned).length
    const progress = totalWords > 0 ? Math.round((learnedWords / totalWords) * 100) : 0

    return {
      id: file.id,
      name: file.name,
      mimeType: file.mimeType,
      size: file.size,
      createdAt: file.createdAt.toISOString(),
      totalWords,
      learnedWords,
      progress,
    }
  })

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">ჩემი ფაილები</h1>
        <p className="text-gray-600 mt-1">
          ატვირთე PDF, Word ან TXT ფაილები და ისწავლე მათგან ახალი სიტყვები
        </p>
      </div>

      <FilesList initialFiles={filesWithProgress} />
    </div>
  )
}
