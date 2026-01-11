'use client'

import { useState, useMemo } from 'react'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { Check, X, Trophy, RotateCcw, Volume2 } from 'lucide-react'
import Button from '@/components/ui/Button'
import { useSpeech } from '@/hooks/useSpeech'

interface FileWord {
  id: string
  english: string
  georgian: string
}

interface FileTypingContainerProps {
  words: FileWord[]
  fileId: string
}

function shuffleArray<T>(array: T[]): T[] {
  const shuffled = [...array]
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]]
  }
  return shuffled
}

export default function FileTypingContainer({ words, fileId }: FileTypingContainerProps) {
  const router = useRouter()
  const { speak } = useSpeech()

  const questions = useMemo(() => {
    return shuffleArray(words).slice(0, Math.min(10, words.length))
  }, [words])

  const [currentIndex, setCurrentIndex] = useState(0)
  const [userInput, setUserInput] = useState('')
  const [isAnswered, setIsAnswered] = useState(false)
  const [correctCount, setCorrectCount] = useState(0)
  const [wrongCount, setWrongCount] = useState(0)
  const [xpEarned, setXpEarned] = useState(0)
  const [isComplete, setIsComplete] = useState(false)

  const currentWord = questions[currentIndex]
  const isCorrect = userInput.toLowerCase().trim() === currentWord?.english.toLowerCase().trim()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (isAnswered || !userInput.trim()) return

    setIsAnswered(true)
    const correct = userInput.toLowerCase().trim() === currentWord.english.toLowerCase().trim()

    if (correct) {
      setCorrectCount((prev) => prev + 1)
    } else {
      setWrongCount((prev) => prev + 1)
    }

    try {
      const res = await fetch('/api/files/words/progress', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          fileWordId: currentWord.id,
          correct,
          mistakeType: correct ? undefined : 'typing',
          userAnswer: correct ? undefined : userInput,
        }),
      })
      const data = await res.json()
      if (data.xpGained) {
        setXpEarned((prev) => prev + data.xpGained)
      }
    } catch (error) {
      console.error('Error updating progress:', error)
    }
  }

  const handleNext = () => {
    if (currentIndex >= questions.length - 1) {
      setIsComplete(true)
    } else {
      setCurrentIndex((prev) => prev + 1)
      setUserInput('')
      setIsAnswered(false)
    }
  }

  const restart = () => {
    setCurrentIndex(0)
    setUserInput('')
    setIsAnswered(false)
    setCorrectCount(0)
    setWrongCount(0)
    setXpEarned(0)
    setIsComplete(false)
  }

  if (isComplete) {
    const accuracy = Math.round((correctCount / questions.length) * 100)

    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="text-center py-12"
      >
        <div className="w-20 h-20 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-6">
          <Trophy className="text-yellow-500" size={40} />
        </div>

        <h2 className="text-2xl font-bold text-gray-900 mb-2">აკრეფა დასრულდა!</h2>
        <p className="text-gray-600 mb-6">{questions.length} სიტყვა</p>

        <div className="grid grid-cols-2 gap-4 max-w-sm mx-auto mb-6">
          <div className="bg-green-50 rounded-xl p-4">
            <p className="text-2xl font-bold text-green-600">{correctCount}</p>
            <p className="text-sm text-green-600">სწორი</p>
          </div>
          <div className="bg-red-50 rounded-xl p-4">
            <p className="text-2xl font-bold text-red-600">{wrongCount}</p>
            <p className="text-sm text-red-600">შეცდომა</p>
          </div>
        </div>

        <div className="bg-blue-50 rounded-xl p-4 max-w-sm mx-auto mb-8">
          <p className="text-2xl font-bold text-blue-600">+{xpEarned} XP</p>
        </div>

        <div className="flex gap-4 justify-center">
          <Button variant="outline" onClick={restart}>
            <RotateCcw size={18} className="mr-2" />
            თავიდან
          </Button>
          <Button onClick={() => router.push(`/files/${fileId}`)}>
            დასრულება
          </Button>
        </div>
      </motion.div>
    )
  }

  const progress = ((currentIndex + 1) / questions.length) * 100

  return (
    <div className="space-y-6">
      {/* Progress */}
      <div className="space-y-2">
        <div className="flex justify-between text-sm text-gray-600">
          <span>სიტყვა {currentIndex + 1}/{questions.length}</span>
          <span>+{xpEarned} XP</span>
        </div>
        <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
          <motion.div
            className="h-full bg-blue-500"
            initial={{ width: 0 }}
            animate={{ width: `${progress}%` }}
            transition={{ duration: 0.3 }}
          />
        </div>
      </div>

      {/* Question */}
      <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
        <div className="flex items-start justify-between">
          <div>
            <p className="text-sm text-gray-500 mb-2">დაწერე ინგლისურად:</p>
            <p className="text-2xl font-bold text-gray-900">{currentWord.georgian}</p>
          </div>
          <button
            onClick={() => speak(currentWord.english)}
            className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
            title="მოსმენა"
          >
            <Volume2 size={24} />
          </button>
        </div>
      </div>

      {/* Input */}
      <form onSubmit={handleSubmit}>
        <input
          type="text"
          value={userInput}
          onChange={(e) => setUserInput(e.target.value)}
          disabled={isAnswered}
          placeholder="დაწერე პასუხი..."
          className={`w-full p-4 text-lg border-2 rounded-xl outline-none transition-colors text-gray-900 placeholder:text-gray-400 ${
            isAnswered
              ? isCorrect
                ? 'border-green-500 bg-green-50'
                : 'border-red-500 bg-red-50'
              : 'border-gray-200 focus:border-blue-500'
          }`}
          autoFocus
        />

        {isAnswered && !isCorrect && (
          <div className="mt-2 p-3 bg-gray-100 rounded-lg">
            <p className="text-sm text-gray-600">სწორი პასუხი:</p>
            <p className="font-medium text-gray-900">{currentWord.english}</p>
          </div>
        )}

        {!isAnswered ? (
          <Button type="submit" className="w-full mt-4" disabled={!userInput.trim()}>
            შემოწმება
          </Button>
        ) : (
          <Button onClick={handleNext} className="w-full mt-4">
            {currentIndex >= questions.length - 1 ? 'დასრულება' : 'შემდეგი'}
          </Button>
        )}
      </form>
    </div>
  )
}
