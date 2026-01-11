import { getServerSession } from 'next-auth'
import { redirect, notFound } from 'next/navigation'
import Link from 'next/link'
import { authOptions } from '@/lib/auth'
import prisma from '@/lib/prisma'
import {
  Layers,
  HelpCircle,
  PenTool,
  ArrowUpDown,
  Link2,
  Keyboard,
  ArrowLeft,
} from 'lucide-react'

interface LearnPageProps {
  params: Promise<{ fileId: string }>
}

const learningModes = [
  {
    id: 'flashcards',
    name: 'ბარათები',
    description: 'ისწავლე სიტყვები ბარათებით',
    icon: Layers,
    color: 'bg-blue-500',
  },
  {
    id: 'quiz',
    name: 'ქვიზი',
    description: 'აირჩიე სწორი პასუხი',
    icon: HelpCircle,
    color: 'bg-green-500',
  },
  {
    id: 'fill-blank',
    name: 'შეავსე',
    description: 'შეავსე გამოტოვებული სიტყვა',
    icon: PenTool,
    color: 'bg-purple-500',
  },
  {
    id: 'ordering',
    name: 'თანმიმდევრობა',
    description: 'დაალაგე სიტყვები სწორად',
    icon: ArrowUpDown,
    color: 'bg-orange-500',
  },
  {
    id: 'matching',
    name: 'შესატყობი',
    description: 'დააკავშირე სიტყვები თარგმანთან',
    icon: Link2,
    color: 'bg-pink-500',
  },
  {
    id: 'typing',
    name: 'აკრეფა',
    description: 'დაწერე სიტყვა კლავიატურით',
    icon: Keyboard,
    color: 'bg-teal-500',
  },
]

export default async function FileLearnPage({ params }: LearnPageProps) {
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
      _count: {
        select: { words: true },
      },
      words: {
        select: { learned: true },
      },
    },
  })

  if (!file) {
    notFound()
  }

  if (file.userId !== user.id) {
    notFound()
  }

  const totalWords = file._count.words
  const learnedWords = file.words.filter((w) => w.learned).length
  const progress = totalWords > 0 ? Math.round((learnedWords / totalWords) * 100) : 0

  if (totalWords === 0) {
    return (
      <div className="-m-6 min-h-[calc(100%+3rem)] bg-white flex items-center justify-center">
        <div className="text-center py-12">
          <h2 className="text-xl font-semibold text-gray-900 mb-2">
            ჯერ არ გაქვს შენახული სიტყვები
          </h2>
          <p className="text-gray-600 mb-4">
            გახსენი ფაილი და მონიშნე სიტყვები სწავლის დასაწყებად
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
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center gap-4 mb-2">
          <Link
            href={`/files/${fileId}`}
            className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <ArrowLeft size={20} />
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">{file.name}</h1>
            <p className="text-gray-600">აირჩიე სწავლის რეჟიმი</p>
          </div>
        </div>

        {/* Progress */}
        <div className="mt-4 p-4 bg-white rounded-lg border border-gray-200">
          <div className="flex justify-between text-sm mb-2">
            <span className="text-gray-600">{totalWords} სიტყვა</span>
            <span className="text-gray-600">{learnedWords} ნასწავლი ({progress}%)</span>
          </div>
          <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
            <div
              className="h-full bg-green-500 transition-all"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>
      </div>

      {/* Learning Modes Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {learningModes.map((mode) => {
          const Icon = mode.icon
          return (
            <Link
              key={mode.id}
              href={`/files/${fileId}/learn/${mode.id}`}
              className="block p-6 bg-white rounded-lg border border-gray-200 hover:shadow-md transition-shadow"
            >
              <div
                className={`w-12 h-12 ${mode.color} rounded-lg flex items-center justify-center mb-4`}
              >
                <Icon size={24} className="text-white" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-1">
                {mode.name}
              </h3>
              <p className="text-gray-600 text-sm">{mode.description}</p>
            </Link>
          )
        })}
      </div>
    </div>
  )
}
