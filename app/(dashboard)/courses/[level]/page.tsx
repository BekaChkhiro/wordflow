import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { redirect, notFound } from 'next/navigation'
import Link from 'next/link'
import prisma from '@/lib/prisma'
import { ArrowLeft, BookOpen, CheckCircle } from 'lucide-react'

const levelNames: Record<string, string> = {
  A1: 'A1 - დამწყები',
  A2: 'A2 - ელემენტარული',
  B1: 'B1 - საშუალო',
  B2: 'B2 - საშუალოზე მაღალი',
  C1: 'C1 - მაღალი',
  C2: 'C2 - პროფესიონალური',
}

const categoryIcons: Record<string, string> = {
  'Greetings': '👋',
  'Politeness': '🙏',
  'Questions': '❓',
  'Time': '⏰',
  'Numbers': '🔢',
  'Family': '👨‍👩‍👧‍👦',
  'Work': '💼',
  'Travel': '✈️',
  'Food': '🍽️',
  'Shopping': '🛒',
  'Health': '🏥',
  'Weather': '🌤️',
  'Emotions': '😊',
  'Hobbies': '🎨',
  'Technology': '💻',
  'Education': '📚',
  'Business': '📊',
  'Communication': '💬',
  'Directions': '🧭',
  'Emergency': '🚨',
  'General': '📝',
}

interface PageProps {
  params: Promise<{ level: string }>
}

export default async function LevelPage({ params }: PageProps) {
  const { level } = await params

  if (!levelNames[level]) {
    notFound()
  }

  const session = await getServerSession(authOptions)

  if (!session?.user) {
    redirect('/login')
  }

  // Get categories for this level
  const phrases = await prisma.phrase.findMany({
    where: { level },
    select: { category: true, id: true },
  })

  // Get user progress
  const user = await prisma.user.findUnique({
    where: { email: session.user.email! },
    select: {
      progress: {
        where: {
          learned: true,
          phrase: { level },
        },
        select: {
          phrase: {
            select: { category: true },
          },
        },
      },
    },
  })

  // Group by category
  const categories: Record<string, { total: number; learned: number }> = {}

  phrases.forEach((phrase) => {
    if (!categories[phrase.category]) {
      categories[phrase.category] = { total: 0, learned: 0 }
    }
    categories[phrase.category].total++
  })

  user?.progress.forEach((p) => {
    if (categories[p.phrase.category]) {
      categories[p.phrase.category].learned++
    }
  })

  const categoryList = Object.entries(categories).map(([name, data]) => ({
    name,
    ...data,
    percentage: Math.round((data.learned / data.total) * 100),
  }))

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Link
          href="/courses"
          className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
        >
          <ArrowLeft size={24} className="text-gray-600" />
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">{levelNames[level]}</h1>
          <p className="text-gray-600">აირჩიე კატეგორია</p>
        </div>
      </div>

      {/* Categories Grid */}
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
        {categoryList.map((category) => {
          const isComplete = category.percentage === 100

          return (
            <Link
              key={category.name}
              href={`/courses/${level}/${encodeURIComponent(category.name)}`}
              className="bg-white rounded-xl p-5 border-2 border-gray-100 hover:border-blue-200 hover:shadow-md transition-all"
            >
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 bg-gray-100 rounded-xl flex items-center justify-center text-2xl">
                  {categoryIcons[category.name] || '📝'}
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <h3 className="font-semibold text-gray-900">{category.name}</h3>
                    {isComplete && (
                      <CheckCircle size={16} className="text-green-500" />
                    )}
                  </div>
                  <p className="text-sm text-gray-500">
                    {category.learned}/{category.total} ფრაზა
                  </p>
                </div>
              </div>

              {/* Progress Bar */}
              <div className="mt-4">
                <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                  <div
                    className={`h-full transition-all duration-500 ${
                      isComplete ? 'bg-green-500' : 'bg-blue-500'
                    }`}
                    style={{ width: `${category.percentage}%` }}
                  />
                </div>
              </div>
            </Link>
          )
        })}
      </div>

      {categoryList.length === 0 && (
        <div className="text-center py-12 text-gray-500">
          ამ დონეზე კატეგორიები ვერ მოიძებნა
        </div>
      )}
    </div>
  )
}
