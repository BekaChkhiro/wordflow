import { getServerSession } from 'next-auth'
import { redirect, notFound } from 'next/navigation'
import { authOptions } from '@/lib/auth'
import prisma from '@/lib/prisma'
import FileViewer from '@/components/files/FileViewer'

interface FilePageProps {
  params: Promise<{ fileId: string }>
}

export default async function FilePage({ params }: FilePageProps) {
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
    notFound()
  }

  if (file.userId !== user.id) {
    notFound()
  }

  return (
    <div className="-m-6 h-[calc(100%+3rem)]">
      <FileViewer
        file={{
          id: file.id,
          name: file.name,
          textContent: file.textContent,
          words: file.words.map((w) => ({
            ...w,
            createdAt: w.createdAt.toISOString(),
          })),
        }}
      />
    </div>
  )
}
