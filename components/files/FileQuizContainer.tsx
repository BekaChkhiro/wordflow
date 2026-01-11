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

interface FileQuizContainerProps {
  words: FileWord[]
  fileId: string
}

interface QuizQuestion {
  word: FileWord
  options: string[]
  correctAnswer: string
}

function shuffleArray<T>(array: T[]): T[] {
  const shuffled = [...array]
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]]
  }
  return shuffled
}

export default function FileQuizContainer({ words, fileId }: FileQuizContainerProps) {
  const router = useRouter()
  const { speak } = useSpeech()

  const questions = useMemo(() => {
    return shuffleArray(words).slice(0, Math.min(10, words.length)).map((word) => {
      const wrongAnswers = shuffleArray(
        words.filter((w) => w.id !== word.id).map((w) => w.english)
      ).slice(0, 3)

      const options = shuffleArray([word.english, ...wrongAnswers])

      return {
        word,
        options,
        correctAnswer: word.english,
      } as QuizQuestion
    })
  }, [words])

  const [currentIndex, setCurrentIndex] = useState(0)
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null)
  const [isAnswered, setIsAnswered] = useState(false)
  const [correctCount, setCorrectCount] = useState(0)
  const [wrongCount, setWrongCount] = useState(0)
  const [xpEarned, setXpEarned] = useState(0)
  const [isComplete, setIsComplete] = useState(false)

  const currentQuestion = questions[currentIndex]
  const isCorrect = selectedAnswer === currentQuestion?.correctAnswer

  const handleAnswer = async (answer: string) => {
    if (isAnswered) return

    setSelectedAnswer(answer)
    setIsAnswered(true)

    const correct = answer === currentQuestion.correctAnswer

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
          fileWordId: currentQuestion.word.id,
          correct,
          mistakeType: correct ? undefined : 'quiz',
          userAnswer: correct ? undefined : answer,
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
      setSelectedAnswer(null)
      setIsAnswered(false)
    }
  }

  const restart = () => {
    setCurrentIndex(0)
    setSelectedAnswer(null)
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

        <h2 className="text-2xl font-bold text-gray-900 mb-2">ქვიზი დასრულდა!</h2>
        <p className="text-gray-600 mb-6">{questions.length} კითხვა</p>

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

        <div className="grid grid-cols-2 gap-4 max-w-sm mx-auto mb-8">
          <div className="bg-blue-50 rounded-xl p-4">
            <p className="text-2xl font-bold text-blue-600">+{xpEarned}</p>
            <p className="text-sm text-blue-600">XP</p>
          </div>
          <div className="bg-purple-50 rounded-xl p-4">
            <p
              className={`text-2xl font-bold ${
                accuracy >= 80
                  ? 'text-green-600'
                  : accuracy >= 50
                    ? 'text-yellow-600'
                    : 'text-red-600'
              }`}
            >
              {accuracy}%
            </p>
            <p className="text-sm text-purple-600">სიზუსტე</p>
          </div>
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
          <span>
            კითხვა {currentIndex + 1}/{questions.length}
          </span>
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
            <p className="text-sm text-gray-500 mb-2">რა არის ამის თარგმანი?</p>
            <p className="text-2xl font-bold text-gray-900">
              {currentQuestion.word.georgian}
            </p>
          </div>
          <button
            onClick={() => speak(currentQuestion.correctAnswer)}
            className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
            title="მოსმენა"
          >
            <Volume2 size={24} />
          </button>
        </div>
      </div>

      {/* Options */}
      <div className="space-y-3">
        {currentQuestion.options.map((option) => {
          const isSelected = selectedAnswer === option
          const isCorrectOption = option === currentQuestion.correctAnswer

          let buttonClass = 'bg-white border-gray-200 hover:border-blue-500 text-gray-900'
          if (isAnswered) {
            if (isCorrectOption) {
              buttonClass = 'bg-green-50 border-green-500 text-green-900'
            } else if (isSelected) {
              buttonClass = 'bg-red-50 border-red-500 text-red-900'
            }
          } else if (isSelected) {
            buttonClass = 'bg-blue-50 border-blue-500 text-blue-900'
          }

          return (
            <motion.button
              key={option}
              onClick={() => handleAnswer(option)}
              disabled={isAnswered}
              whileHover={!isAnswered ? { scale: 1.02 } : undefined}
              whileTap={!isAnswered ? { scale: 0.98 } : undefined}
              className={`w-full p-4 rounded-xl border-2 text-left font-medium transition-colors ${buttonClass} disabled:cursor-default`}
            >
              <div className="flex items-center justify-between">
                <span>{option}</span>
                {isAnswered && isCorrectOption && (
                  <Check size={20} className="text-green-600" />
                )}
                {isAnswered && isSelected && !isCorrectOption && (
                  <X size={20} className="text-red-600" />
                )}
              </div>
            </motion.button>
          )
        })}
      </div>

      {/* Next Button */}
      {isAnswered && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <Button onClick={handleNext} className="w-full">
            {currentIndex >= questions.length - 1 ? 'დასრულება' : 'შემდეგი'}
          </Button>
        </motion.div>
      )}
    </div>
  )
}
