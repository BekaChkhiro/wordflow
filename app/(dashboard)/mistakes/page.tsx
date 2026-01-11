import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { redirect } from 'next/navigation'
import prisma from '@/lib/prisma'
import Link from 'next/link'
import { AlertCircle, BookOpen, RefreshCw, Layers, HelpCircle, PenTool, GripHorizontal, Link2, Keyboard } from 'lucide-react'

const mistakeTypeLabels: Record<string, { label: string; icon: typeof Layers }> = {
  flashcard: { label: 'Flashcard', icon: Layers },
  quiz: { label: 'Quiz', icon: HelpCircle },
  fill_blank: { label: 'Fill Blank', icon: PenTool },
  ordering: { label: 'Ordering', icon: GripHorizontal },
  matching: { label: 'Matching', icon: Link2 },
  typing: { label: 'Typing', icon: Keyboard },
}

export default async function MistakesPage() {
  const session = await getServerSession(authOptions)

  if (!session?.user) {
    redirect('/login')
  }

  const user = await prisma.user.findUnique({
    where: { email: session.user.email! },
    select: { id: true },
  })

  if (!user) {
    redirect('/login')
  }

  // Get user's mistakes grouped by phrase
  const mistakes = await prisma.userMistake.findMany({
    where: { userId: user.id },
    include: {
      phrase: {
        select: {
          id: true,
          english: true,
          georgian: true,
          level: true,
          category: true,
        },
      },
    },
    orderBy: { createdAt: 'desc' },
  })

  // Group mistakes by phrase
  type MistakeAccumulator = Record<number, {
    phrase: typeof mistakes[0]['phrase']
    count: number
    types: Set<string>
    lastMistake: Date
  }>

  const mistakesByPhrase = mistakes.reduce<MistakeAccumulator>((acc, mistake) => {
    const phraseId = mistake.phraseId
    if (!acc[phraseId]) {
      acc[phraseId] = {
        phrase: mistake.phrase,
        count: 0,
        types: new Set<string>(),
        lastMistake: mistake.createdAt,
      }
    }
    acc[phraseId].count++
    acc[phraseId].types.add(mistake.mistakeType)
    return acc
  }, {})

  // Convert to array and sort by count
  const groupedMistakes = Object.values(mistakesByPhrase)
    .map((m) => ({
      ...m,
      types: Array.from(m.types),
    }))
    .sort((a, b) => b.count - a.count)

  const totalMistakes = mistakes.length
  const uniquePhrases = groupedMistakes.length

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">შეცდომები</h1>
          <p className="text-gray-600">გაიმეორე შენი შეცდომები</p>
        </div>
        <div className="text-right">
          <p className="text-3xl font-bold text-red-500">{uniquePhrases}</p>
          <p className="text-sm text-gray-500">ფრაზა გასამეორებლად</p>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 gap-4">
        <div className="bg-white rounded-xl p-4 border border-gray-100">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-red-100 rounded-lg flex items-center justify-center">
              <AlertCircle className="text-red-500" size={20} />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">{totalMistakes}</p>
              <p className="text-sm text-gray-500">სულ შეცდომა</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl p-4 border border-gray-100">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center">
              <RefreshCw className="text-orange-500" size={20} />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">{uniquePhrases}</p>
              <p className="text-sm text-gray-500">უნიკალური ფრაზა</p>
            </div>
          </div>
        </div>
      </div>

      {/* Practice button */}
      {groupedMistakes.length > 0 && (
        <Link
          href={`/learn/flashcards/${groupedMistakes[0]?.phrase.level}?mistakes=true`}
          className="block w-full bg-gradient-to-r from-red-500 to-orange-500 text-white rounded-xl p-4 text-center font-bold hover:from-red-600 hover:to-orange-600 transition-all"
        >
          <RefreshCw className="inline mr-2" size={20} />
          გაიმეორე ყველა შეცდომა
        </Link>
      )}

      {/* Mistakes list */}
      {groupedMistakes.length > 0 ? (
        <div className="bg-white rounded-xl border border-gray-100">
          <div className="p-4 border-b border-gray-100">
            <h2 className="font-semibold text-gray-900">შეცდომების სია</h2>
          </div>
          <div className="divide-y divide-gray-100">
            {groupedMistakes.map((item) => (
              <div
                key={item.phrase.id}
                className="p-4 hover:bg-gray-50 transition-colors"
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-gray-900">{item.phrase.english}</p>
                    <p className="text-sm text-gray-500">{item.phrase.georgian}</p>
                    <div className="flex flex-wrap items-center gap-2 mt-2">
                      <span className="text-xs px-2 py-1 bg-gray-100 text-gray-600 rounded">
                        {item.phrase.level}
                      </span>
                      <span className="text-xs px-2 py-1 bg-gray-100 text-gray-600 rounded">
                        {item.phrase.category}
                      </span>
                      {item.types.map((type) => {
                        const typeInfo = mistakeTypeLabels[type]
                        if (!typeInfo) return null
                        const Icon = typeInfo.icon
                        return (
                          <span
                            key={type}
                            className="text-xs px-2 py-1 bg-red-50 text-red-600 rounded flex items-center gap-1"
                          >
                            <Icon size={12} />
                            {typeInfo.label}
                          </span>
                        )
                      })}
                    </div>
                  </div>
                  <div className="text-right flex-shrink-0">
                    <p className="text-lg font-bold text-red-500">{item.count}x</p>
                    <p className="text-xs text-gray-400">შეცდომა</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      ) : (
        <div className="text-center py-12 bg-white rounded-xl border border-gray-100">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <BookOpen className="text-green-500" size={32} />
          </div>
          <h2 className="text-xl font-bold text-gray-900 mb-2">შეცდომები არ არის!</h2>
          <p className="text-gray-500">შენ კარგად სწავლობ. გააგრძელე!</p>
        </div>
      )}
    </div>
  )
}
