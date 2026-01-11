'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { Trophy, RotateCcw } from 'lucide-react'
import OrderingQuestion from './OrderingQuestion'
import Button from '@/components/ui/Button'

interface Phrase {
  id: number
  english: string
  georgian: string
}

interface OrderingContainerProps {
  phrases: Phrase[]
  level: string
  category: string
}

export default function OrderingContainer({ phrases, level, category }: OrderingContainerProps) {
  const router = useRouter()

  const [currentIndex, setCurrentIndex] = useState(0)
  const [correctCount, setCorrectCount] = useState(0)
  const [wrongCount, setWrongCount] = useState(0)
  const [isComplete, setIsComplete] = useState(false)
  const [xpEarned, setXpEarned] = useState(0)

  const currentPhrase = phrases[currentIndex]
  const progress = (currentIndex / phrases.length) * 100

  const handleAnswer = async (isCorrect: boolean, userAnswer: string) => {
    if (isCorrect) {
      setCorrectCount(prev => prev + 1)
    } else {
      setWrongCount(prev => prev + 1)
    }

    // Update progress
    try {
      const res = await fetch('/api/progress/update', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          phraseId: currentPhrase.id,
          correct: isCorrect,
          mistakeType: isCorrect ? undefined : 'ordering',
          userAnswer,
        }),
      })
      const data = await res.json()
      if (data.xpGained) {
        setXpEarned(prev => prev + data.xpGained)
      }
    } catch (error) {
      console.error('Error updating progress:', error)
    }

    if (currentIndex + 1 >= phrases.length) {
      setIsComplete(true)
    } else {
      setCurrentIndex(prev => prev + 1)
    }
  }

  const restart = () => {
    setCurrentIndex(0)
    setCorrectCount(0)
    setWrongCount(0)
    setIsComplete(false)
    setXpEarned(0)
  }

  if (isComplete) {
    const accuracy = Math.round((correctCount / phrases.length) * 100)

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
        <p className="text-gray-600 mb-6">{phrases.length} წინადადება დასრულებულია</p>

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
    <div className="space-y-6">
      {/* Progress */}
      <div className="space-y-2">
        <div className="flex justify-between text-sm text-gray-600">
          <span>{currentIndex + 1} / {phrases.length}</span>
          <span>+{xpEarned} XP</span>
        </div>
        <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
          <motion.div
            className="h-full bg-orange-500"
            initial={{ width: 0 }}
            animate={{ width: `${progress}%` }}
            transition={{ duration: 0.3 }}
          />
        </div>
      </div>

      {/* Question */}
      <OrderingQuestion
        key={currentPhrase.id}
        correctSentence={currentPhrase.english}
        georgian={currentPhrase.georgian}
        onAnswer={handleAnswer}
      />
    </div>
  )
}
