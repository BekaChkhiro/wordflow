'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { Trophy, RotateCcw } from 'lucide-react'
import MatchingGame from './MatchingGame'
import Button from '@/components/ui/Button'

interface Phrase {
  id: number
  english: string
  georgian: string
}

interface MatchingContainerProps {
  phrases: Phrase[]
  level: string
  category: string
}

export default function MatchingContainer({ phrases, level, category }: MatchingContainerProps) {
  const router = useRouter()

  const [isComplete, setIsComplete] = useState(false)
  const [correctCount, setCorrectCount] = useState(0)
  const [wrongCount, setWrongCount] = useState(0)
  const [xpEarned, setXpEarned] = useState(0)
  const [key, setKey] = useState(0) // For restart

  const handleComplete = async (
    correct: number,
    wrong: number,
    phraseResults: { id: number; correct: boolean }[]
  ) => {
    setCorrectCount(correct)
    setWrongCount(wrong)

    // Update progress for each phrase
    let totalXp = 0
    for (const result of phraseResults) {
      try {
        const res = await fetch('/api/progress/update', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            phraseId: result.id,
            correct: result.correct,
            mistakeType: result.correct ? undefined : 'matching',
          }),
        })
        const data = await res.json()
        if (data.xpGained) {
          totalXp += data.xpGained
        }
      } catch (error) {
        console.error('Error updating progress:', error)
      }
    }

    setXpEarned(totalXp)
    setIsComplete(true)
  }

  const restart = () => {
    setIsComplete(false)
    setCorrectCount(0)
    setWrongCount(0)
    setXpEarned(0)
    setKey(prev => prev + 1) // Force re-render to reshuffle
  }

  if (isComplete) {
    const accuracy = Math.round((correctCount / (correctCount + wrongCount)) * 100)

    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="text-center py-12"
      >
        <div className="w-20 h-20 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-6">
          <Trophy className="text-yellow-500" size={40} />
        </div>

        <h2 className="text-2xl font-bold text-gray-900 mb-2">სესია დასრულდა!</h2>
        <p className="text-gray-600 mb-6">{phrases.length} წყვილი დაკავშირებულია</p>

        <div className="grid grid-cols-3 gap-4 max-w-sm mx-auto mb-8">
          <div className="bg-green-50 rounded-xl p-4">
            <p className="text-2xl font-bold text-green-600">{correctCount}</p>
            <p className="text-sm text-green-600">სწორი</p>
          </div>
          <div className="bg-red-50 rounded-xl p-4">
            <p className="text-2xl font-bold text-red-600">{wrongCount}</p>
            <p className="text-sm text-red-600">არასწორი</p>
          </div>
          <div className="bg-blue-50 rounded-xl p-4">
            <p className="text-2xl font-bold text-blue-600">+{xpEarned}</p>
            <p className="text-sm text-blue-600">XP</p>
          </div>
        </div>

        <div className="bg-gray-50 rounded-xl p-4 max-w-sm mx-auto mb-8">
          <p className="text-sm text-gray-500">სიზუსტე</p>
          <p className={`text-3xl font-bold ${accuracy >= 80 ? 'text-green-600' : accuracy >= 50 ? 'text-yellow-600' : 'text-red-600'}`}>
            {accuracy}%
          </p>
        </div>

        <div className="flex gap-4 justify-center">
          <Button variant="outline" onClick={restart}>
            <RotateCcw size={18} className="mr-2" />
            თავიდან
          </Button>
          <Button onClick={() => router.push(`/courses/${level}/${encodeURIComponent(category)}`)}>
            დასრულება
          </Button>
        </div>
      </motion.div>
    )
  }

  return (
    <MatchingGame
      key={key}
      phrases={phrases}
      onComplete={handleComplete}
    />
  )
}
