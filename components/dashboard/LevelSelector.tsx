'use client'

import Link from 'next/link'

const levels = [
  { id: 'A1', name: 'A1', description: 'დამწყები', color: 'bg-green-500', phrases: 150 },
  { id: 'A2', name: 'A2', description: 'ელემენტარული', color: 'bg-green-600', phrases: 150 },
  { id: 'B1', name: 'B1', description: 'საშუალო', color: 'bg-yellow-500', phrases: 150 },
  { id: 'B2', name: 'B2', description: 'საშუალოზე მაღალი', color: 'bg-orange-500', phrases: 150 },
  { id: 'C1', name: 'C1', description: 'მაღალი', color: 'bg-red-500', phrases: 150 },
  { id: 'C2', name: 'C2', description: 'პროფესიონალური', color: 'bg-purple-500', phrases: 147 },
]

interface LevelSelectorProps {
  currentLevel: string
  progress?: Record<string, number>
}

export default function LevelSelector({ currentLevel, progress = {} }: LevelSelectorProps) {
  return (
    <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
      <h3 className="font-semibold text-gray-900 mb-4">დონეები</h3>

      <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
        {levels.map((level) => {
          const isActive = level.id === currentLevel
          const learned = progress[level.id] || 0
          const percentage = Math.round((learned / level.phrases) * 100)

          return (
            <Link
              key={level.id}
              href={`/courses/${level.id}`}
              className={`
                relative p-4 rounded-xl border-2 transition-all
                ${isActive
                  ? 'border-blue-500 bg-blue-50'
                  : 'border-gray-100 hover:border-gray-200 hover:bg-gray-50'
                }
              `}
            >
              <div className={`w-10 h-10 ${level.color} rounded-lg flex items-center justify-center mb-2`}>
                <span className="text-white font-bold text-sm">{level.name}</span>
              </div>
              <p className="font-medium text-gray-900">{level.description}</p>
              <p className="text-xs text-gray-500">{percentage}% დასრულებული</p>

              {isActive && (
                <div className="absolute top-2 right-2 w-2 h-2 bg-blue-500 rounded-full" />
              )}
            </Link>
          )
        })}
      </div>
    </div>
  )
}
