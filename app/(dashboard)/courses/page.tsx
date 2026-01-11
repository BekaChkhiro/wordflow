import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import prisma from '@/lib/prisma'
import { BookOpen, CheckCircle, Lock } from 'lucide-react'

const levels = [
  { id: 'A1', name: 'A1 - დამწყები', description: 'საბაზისო ფრაზები და მისალმებები', color: 'from-green-400 to-green-600', phrases: 150 },
  { id: 'A2', name: 'A2 - ელემენტარული', description: 'ყოველდღიური კომუნიკაცია', color: 'from-green-500 to-green-700', phrases: 150 },
  { id: 'B1', name: 'B1 - საშუალო', description: 'თავისუფალი საუბარი', color: 'from-yellow-400 to-yellow-600', phrases: 150 },
  { id: 'B2', name: 'B2 - საშუალოზე მაღალი', description: 'კომპლექსური თემები', color: 'from-orange-400 to-orange-600', phrases: 150 },
  { id: 'C1', name: 'C1 - მაღალი', description: 'პროფესიონალური დონე', color: 'from-red-400 to-red-600', phrases: 150 },
  { id: 'C2', name: 'C2 - პროფესიონალური', description: 'მშობლიური დონე', color: 'from-purple-400 to-purple-600', phrases: 147 },
]

export default async function CoursesPage() {
  const session = await getServerSession(authOptions)

  if (!session?.user) {
    redirect('/login')
  }

  // Get user progress
  const user = await prisma.user.findUnique({
    where: { email: session.user.email! },
    select: {
      currentLevel: true,
      progress: {
        where: { learned: true },
        select: {
          phrase: {
            select: { level: true },
          },
        },
      },
    },
  })

  // Count learned phrases per level
  const progressByLevel: Record<string, number> = {}
  user?.progress.forEach((p: { phrase: { level: string } }) => {
    const level = p.phrase.level
    progressByLevel[level] = (progressByLevel[level] || 0) + 1
  })

  const levelOrder = ['A1', 'A2', 'B1', 'B2', 'C1', 'C2']
  const currentLevelIndex = levelOrder.indexOf(user?.currentLevel || 'A1')

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">კურსები</h1>
        <p className="text-gray-600">აირჩიე დონე და დაიწყე სწავლა</p>
      </div>

      <div className="grid gap-4">
        {levels.map((level, index) => {
          const learned = progressByLevel[level.id] || 0
          const percentage = Math.round((learned / level.phrases) * 100)
          const isUnlocked = index <= currentLevelIndex
          const isComplete = percentage === 100

          return (
            <Link
              key={level.id}
              href={isUnlocked ? `/courses/${level.id}` : '#'}
              className={`
                relative bg-white rounded-xl p-6 border-2 transition-all
                ${isUnlocked
                  ? 'border-gray-100 hover:border-gray-200 hover:shadow-md cursor-pointer'
                  : 'border-gray-100 opacity-60 cursor-not-allowed'
                }
              `}
            >
              <div className="flex items-center gap-4">
                {/* Level Badge */}
                <div className={`w-16 h-16 rounded-xl bg-gradient-to-br ${level.color} flex items-center justify-center flex-shrink-0`}>
                  {isComplete ? (
                    <CheckCircle className="text-white" size={32} />
                  ) : isUnlocked ? (
                    <BookOpen className="text-white" size={32} />
                  ) : (
                    <Lock className="text-white" size={32} />
                  )}
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <h3 className="text-lg font-semibold text-gray-900">{level.name}</h3>
                    {isComplete && (
                      <span className="px-2 py-0.5 bg-green-100 text-green-700 text-xs font-medium rounded-full">
                        დასრულებული
                      </span>
                    )}
                  </div>
                  <p className="text-gray-500 text-sm">{level.description}</p>

                  {/* Progress Bar */}
                  <div className="mt-3">
                    <div className="flex items-center justify-between text-sm mb-1">
                      <span className="text-gray-500">{learned}/{level.phrases} ფრაზა</span>
                      <span className="font-medium text-gray-700">{percentage}%</span>
                    </div>
                    <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                      <div
                        className={`h-full bg-gradient-to-r ${level.color} transition-all duration-500`}
                        style={{ width: `${percentage}%` }}
                      />
                    </div>
                  </div>
                </div>

                {/* Arrow */}
                {isUnlocked && (
                  <svg className="w-6 h-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                )}
              </div>
            </Link>
          )
        })}
      </div>
    </div>
  )
}
