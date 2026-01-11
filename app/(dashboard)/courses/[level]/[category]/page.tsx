import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { redirect, notFound } from 'next/navigation'
import Link from 'next/link'
import prisma from '@/lib/prisma'
import { ArrowLeft, Layers, HelpCircle, PenTool, GripHorizontal, Link2, Keyboard, CheckCircle } from 'lucide-react'

const levelNames: Record<string, string> = {
  A1: 'A1', A2: 'A2', B1: 'B1', B2: 'B2', C1: 'C1', C2: 'C2',
}

const learningModes = [
  { id: 'flashcards', label: 'Flashcards', description: 'ბარათებით სწავლა', icon: Layers, color: 'bg-blue-500' },
  { id: 'quiz', label: 'Quiz', description: '4 ვარიანტიანი ტესტი', icon: HelpCircle, color: 'bg-purple-500' },
  { id: 'fill-blank', label: 'Fill Blank', description: 'შეავსე გამოტოვებული', icon: PenTool, color: 'bg-green-500' },
  { id: 'ordering', label: 'Ordering', description: 'სიტყვების დალაგება', icon: GripHorizontal, color: 'bg-orange-500' },
  { id: 'matching', label: 'Matching', description: 'დაკავშირება', icon: Link2, color: 'bg-pink-500' },
  { id: 'typing', label: 'Typing', description: 'აკრეფა', icon: Keyboard, color: 'bg-teal-500' },
]

interface PageProps {
  params: Promise<{ level: string; category: string }>
}

export default async function CategoryPage({ params }: PageProps) {
  const { level, category: encodedCategory } = await params
  const category = decodeURIComponent(encodedCategory)

  if (!levelNames[level]) {
    notFound()
  }

  const session = await getServerSession(authOptions)

  if (!session?.user) {
    redirect('/login')
  }

  // Get phrases for this category
  const phrases = await prisma.phrase.findMany({
    where: { level, category },
    select: { id: true, english: true, georgian: true },
    orderBy: { id: 'asc' },
  })

  if (phrases.length === 0) {
    notFound()
  }

  // Get user progress
  const user = await prisma.user.findUnique({
    where: { email: session.user.email! },
    select: {
      progress: {
        where: {
          phrase: { level, category },
        },
        select: {
          phraseId: true,
          learned: true,
        },
      },
    },
  })

  const progressMap = new Map(user?.progress.map((p) => [p.phraseId, p.learned]))
  const learnedCount = user?.progress.filter((p) => p.learned).length || 0
  const percentage = Math.round((learnedCount / phrases.length) * 100)

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Link
          href={`/courses/${level}`}
          className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
        >
          <ArrowLeft size={24} className="text-gray-600" />
        </Link>
        <div className="flex-1">
          <h1 className="text-2xl font-bold text-gray-900">{category}</h1>
          <p className="text-gray-600">{levelNames[level]} • {phrases.length} ფრაზა</p>
        </div>
        <div className="text-right">
          <p className="text-2xl font-bold text-gray-900">{percentage}%</p>
          <p className="text-sm text-gray-500">{learnedCount}/{phrases.length} ნასწავლი</p>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="h-3 bg-gray-100 rounded-full overflow-hidden">
        <div
          className={`h-full transition-all duration-500 ${percentage === 100 ? 'bg-green-500' : 'bg-blue-500'}`}
          style={{ width: `${percentage}%` }}
        />
      </div>

      {/* Learning Modes */}
      <div className="bg-white rounded-xl p-6 border border-gray-100">
        <h2 className="font-semibold text-gray-900 mb-4">სწავლის რეჟიმები</h2>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
          {learningModes.map((mode) => {
            const Icon = mode.icon
            return (
              <Link
                key={mode.id}
                href={`/learn/${mode.id}/${level}?category=${encodeURIComponent(category)}`}
                className="p-4 rounded-xl border border-gray-100 hover:border-blue-200 hover:bg-blue-50 transition-all group"
              >
                <div className={`w-10 h-10 ${mode.color} rounded-lg flex items-center justify-center mb-2 group-hover:scale-110 transition-transform`}>
                  <Icon className="text-white" size={20} />
                </div>
                <p className="font-medium text-gray-900">{mode.label}</p>
                <p className="text-xs text-gray-500">{mode.description}</p>
              </Link>
            )
          })}
        </div>
      </div>

      {/* Phrases List */}
      <div className="bg-white rounded-xl border border-gray-100">
        <div className="p-4 border-b border-gray-100">
          <h2 className="font-semibold text-gray-900">ფრაზების სია</h2>
        </div>
        <div className="divide-y divide-gray-100">
          {phrases.map((phrase, index) => {
            const isLearned = progressMap.get(phrase.id)

            return (
              <div
                key={phrase.id}
                className={`p-4 flex items-center gap-4 ${isLearned ? 'bg-green-50' : ''}`}
              >
                <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
                  isLearned ? 'bg-green-500 text-white' : 'bg-gray-100 text-gray-500'
                }`}>
                  {isLearned ? <CheckCircle size={16} /> : index + 1}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-gray-900">{phrase.english}</p>
                  <p className="text-sm text-gray-500">{phrase.georgian}</p>
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
