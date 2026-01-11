'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { User, Target, BookOpen, Save, Loader2 } from 'lucide-react'
import Button from '@/components/ui/Button'
import Input from '@/components/ui/Input'
import toast from 'react-hot-toast'

interface SettingsFormProps {
  user: {
    id: string
    name: string | null
    email: string | null
    dailyGoal: number
    currentLevel: string
  }
}

const levels = ['A1', 'A2', 'B1', 'B2', 'C1', 'C2']
const dailyGoalOptions = [5, 10, 15, 20, 30, 50]

export default function SettingsForm({ user }: SettingsFormProps) {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [name, setName] = useState(user.name || '')
  const [dailyGoal, setDailyGoal] = useState(user.dailyGoal)
  const [currentLevel, setCurrentLevel] = useState(user.currentLevel)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      const res = await fetch('/api/settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, dailyGoal, currentLevel }),
      })

      if (!res.ok) {
        throw new Error('Failed to update settings')
      }

      toast.success('პარამეტრები შენახულია')
      router.refresh()
    } catch (error) {
      toast.error('შეცდომა პარამეტრების შენახვისას')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Account Settings */}
      <div className="bg-white rounded-xl p-6 border border-gray-100">
        <div className="flex items-center gap-2 mb-6">
          <User className="text-gray-500" size={20} />
          <h2 className="font-semibold text-gray-900">ანგარიშის პარამეტრები</h2>
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              სახელი
            </label>
            <Input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="შენი სახელი"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              ელ-ფოსტა
            </label>
            <Input
              type="email"
              value={user.email || ''}
              disabled
              className="bg-gray-50"
            />
            <p className="text-xs text-gray-500 mt-1">ელ-ფოსტის შეცვლა შეუძლებელია</p>
          </div>
        </div>
      </div>

      {/* Learning Settings */}
      <div className="bg-white rounded-xl p-6 border border-gray-100">
        <div className="flex items-center gap-2 mb-6">
          <BookOpen className="text-gray-500" size={20} />
          <h2 className="font-semibold text-gray-900">სწავლის პარამეტრები</h2>
        </div>

        <div className="space-y-6">
          {/* Current Level */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">
              მიმდინარე დონე
            </label>
            <div className="grid grid-cols-6 gap-2">
              {levels.map((level) => (
                <button
                  key={level}
                  type="button"
                  onClick={() => setCurrentLevel(level)}
                  className={`
                    py-3 rounded-lg font-bold transition-all
                    ${currentLevel === level
                      ? 'bg-blue-500 text-white'
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                    }
                  `}
                >
                  {level}
                </button>
              ))}
            </div>
          </div>

          {/* Daily Goal */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">
              <div className="flex items-center gap-2">
                <Target className="text-gray-500" size={16} />
                დღიური მიზანი
              </div>
            </label>
            <div className="grid grid-cols-3 md:grid-cols-6 gap-2">
              {dailyGoalOptions.map((goal) => (
                <button
                  key={goal}
                  type="button"
                  onClick={() => setDailyGoal(goal)}
                  className={`
                    py-3 rounded-lg font-medium transition-all
                    ${dailyGoal === goal
                      ? 'bg-green-500 text-white'
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                    }
                  `}
                >
                  {goal} ფრაზა
                </button>
              ))}
            </div>
            <p className="text-sm text-gray-500 mt-2">
              რამდენი ფრაზის სწავლა გინდა დღეში
            </p>
          </div>
        </div>
      </div>

      {/* Save Button */}
      <div className="flex justify-end">
        <Button type="submit" disabled={isLoading}>
          {isLoading ? (
            <>
              <Loader2 size={18} className="mr-2 animate-spin" />
              ინახება...
            </>
          ) : (
            <>
              <Save size={18} className="mr-2" />
              შენახვა
            </>
          )}
        </Button>
      </div>
    </form>
  )
}
