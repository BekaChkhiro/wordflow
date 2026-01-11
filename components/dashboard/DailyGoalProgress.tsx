'use client'

interface DailyGoalProgressProps {
  current: number
  goal: number
}

export default function DailyGoalProgress({ current, goal }: DailyGoalProgressProps) {
  const percentage = Math.min((current / goal) * 100, 100)
  const isComplete = current >= goal

  return (
    <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-semibold text-gray-900">დღიური მიზანი</h3>
        <span className={`text-sm font-medium ${isComplete ? 'text-green-600' : 'text-gray-500'}`}>
          {current}/{goal} ფრაზა
        </span>
      </div>

      <div className="relative h-4 bg-gray-100 rounded-full overflow-hidden">
        <div
          className={`absolute left-0 top-0 h-full rounded-full transition-all duration-500 ${
            isComplete ? 'bg-green-500' : 'bg-blue-500'
          }`}
          style={{ width: `${percentage}%` }}
        />
      </div>

      <p className="text-sm text-gray-500 mt-3">
        {isComplete
          ? '🎉 დღიური მიზანი შესრულებულია!'
          : `კიდევ ${goal - current} ფრაზა დაგრჩა`}
      </p>
    </div>
  )
}
