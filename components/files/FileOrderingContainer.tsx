'use client'

import { useState, useMemo } from 'react'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { Trophy, RotateCcw, Check, X, Volume2 } from 'lucide-react'
import Button from '@/components/ui/Button'
import { useSpeech } from '@/hooks/useSpeech'

interface FileWord {
  id: string
  english: string
  georgian: string
}

interface FileOrderingContainerProps {
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

interface Question {
  word: FileWord
  correctOrder: string[]
  shuffledWords: string[]
}

export default function FileOrderingContainer({ words, fileId }: FileOrderingContainerProps) {
  const router = useRouter()
  const { speak } = useSpeech()

  // Filter words with multiple words
  const eligibleWords = useMemo(() => {
    return words.filter((w) => {
      const wordCount = w.english.split(' ').length
      return wordCount >= 2 && wordCount <= 6
    })
  }, [words])

  const questions = useMemo(() => {
    return shuffleArray(eligibleWords)
      .slice(0, Math.min(10, eligibleWords.length))
      .map((word) => {
        const correctOrder = word.english.split(' ')
        return {
          word,
          correctOrder,
          shuffledWords: shuffleArray([...correctOrder]),
        } as Question
      })
  }, [eligibleWords])

  const [currentIndex, setCurrentIndex] = useState(0)
  const [selectedWords, setSelectedWords] = useState<string[]>([])
  const [isAnswered, setIsAnswered] = useState(false)
  const [correctCount, setCorrectCount] = useState(0)
  const [wrongCount, setWrongCount] = useState(0)
  const [xpEarned, setXpEarned] = useState(0)
  const [isComplete, setIsComplete] = useState(false)

  const currentQuestion = questions[currentIndex]
  const isCorrect =
    currentQuestion && selectedWords.join(' ') === currentQuestion.correctOrder.join(' ')

  const handleWordClick = (word: string, index: number) => {
    if (isAnswered) return

    // Check if this word instance is already selected
    const wordWithIndex = `${word}-${index}`
    const selectedIndex = selectedWords.findIndex(
      (w, i) => w === word && currentQuestion.shuffledWords.indexOf(word) === index
    )

    if (selectedIndex !== -1) {
      // Remove from selected
      setSelectedWords((prev) => prev.filter((_, i) => i !== selectedIndex))
    } else {
      // Add to selected
      setSelectedWords((prev) => [...prev, word])
    }
  }

  const handleCheck = async () => {
    if (selectedWords.length !== currentQuestion.correctOrder.length) return

    setIsAnswered(true)
    const correct = selectedWords.join(' ') === currentQuestion.correctOrder.join(' ')

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
          mistakeType: correct ? undefined : 'ordering',
          userAnswer: correct ? undefined : selectedWords.join(' '),
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
      setSelectedWords([])
      setIsAnswered(false)
    }
  }

  const restart = () => {
    setCurrentIndex(0)
    setSelectedWords([])
    setIsAnswered(false)
    setCorrectCount(0)
    setWrongCount(0)
    setXpEarned(0)
    setIsComplete(false)
  }

  if (questions.length === 0) {
    return (
      <div className="text-center py-12">
        <h2 className="text-xl font-semibold text-gray-900 mb-2">
          საჭიროა მრავალსიტყვიანი ფრაზები
        </h2>
        <p className="text-gray-600 mb-4">
          თანმიმდევრობის რეჟიმისთვის საჭიროა 2-6 სიტყვიანი ფრაზები.
        </p>
        <Button onClick={() => router.push(`/files/${fileId}`)}>
          ფაილის გახსნა
        </Button>
      </div>
    )
  }

  if (isComplete) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="text-center py-12"
      >
        <div className="w-20 h-20 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-6">
          <Trophy className="text-yellow-500" size={40} />
        </div>

        <h2 className="text-2xl font-bold text-gray-900 mb-2">თანმიმდევრობა დასრულდა!</h2>
        <p className="text-gray-600 mb-6">{questions.length} ფრაზა</p>

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
          <span>ფრაზა {currentIndex + 1}/{questions.length}</span>
          <span>+{xpEarned} XP</span>
        </div>
        <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
          <motion.div
            className="h-full bg-blue-500"
            animate={{ width: `${progress}%` }}
            transition={{ duration: 0.3 }}
          />
        </div>
      </div>

      {/* Question */}
      <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
        <div className="flex items-start justify-between">
          <div>
            <p className="text-sm text-gray-500 mb-2">დაალაგე სწორი თანმიმდევრობით:</p>
            <p className="text-xl font-bold text-gray-900">{currentQuestion.word.georgian}</p>
          </div>
          <button
            onClick={() => speak(currentQuestion.word.english)}
            className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
            title="მოსმენა"
          >
            <Volume2 size={24} />
          </button>
        </div>
      </div>

      {/* Selected Words */}
      <div className="min-h-[60px] p-4 bg-gray-50 rounded-xl border-2 border-dashed border-gray-300">
        {selectedWords.length === 0 ? (
          <p className="text-gray-400 text-center">აირჩიე სიტყვები სწორი თანმიმდევრობით</p>
        ) : (
          <div className="flex flex-wrap gap-2">
            {selectedWords.map((word, index) => (
              <motion.span
                key={`selected-${index}`}
                initial={{ scale: 0.8 }}
                animate={{ scale: 1 }}
                className={`px-3 py-1.5 rounded-lg font-medium ${
                  isAnswered
                    ? isCorrect
                      ? 'bg-green-100 text-green-700'
                      : 'bg-red-100 text-red-700'
                    : 'bg-blue-100 text-blue-700'
                }`}
              >
                {word}
              </motion.span>
            ))}
          </div>
        )}
      </div>

      {/* Correct Answer (if wrong) */}
      {isAnswered && !isCorrect && (
        <div className="p-3 bg-gray-100 rounded-lg">
          <p className="text-sm text-gray-600">სწორი პასუხი:</p>
          <p className="font-medium text-gray-900">{currentQuestion.correctOrder.join(' ')}</p>
        </div>
      )}

      {/* Available Words */}
      {!isAnswered && (
        <div className="flex flex-wrap gap-2 justify-center">
          {currentQuestion.shuffledWords.map((word, index) => {
            const isSelected = selectedWords.filter((w) => w === word).length >
              currentQuestion.shuffledWords.slice(0, index).filter((w) => w === word).length
              ? selectedWords.indexOf(word) <= index
              : false

            // Count how many times this word appears in selected
            const selectedCount = selectedWords.filter((w) => w === word).length
            const totalCount = currentQuestion.shuffledWords.filter((w) => w === word).length
            const thisWordSelectedCount = currentQuestion.shuffledWords
              .slice(0, index + 1)
              .filter((w) => w === word).length
            const isThisSelected = thisWordSelectedCount <= selectedCount

            return (
              <motion.button
                key={`word-${index}`}
                onClick={() => handleWordClick(word, index)}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                  isThisSelected
                    ? 'bg-gray-200 text-gray-400'
                    : 'bg-white border-2 border-gray-200 hover:border-blue-500 text-gray-900'
                }`}
                disabled={isThisSelected}
              >
                {word}
              </motion.button>
            )
          })}
        </div>
      )}

      {/* Actions */}
      {!isAnswered ? (
        <Button
          onClick={handleCheck}
          className="w-full"
          disabled={selectedWords.length !== currentQuestion.correctOrder.length}
        >
          შემოწმება
        </Button>
      ) : (
        <Button onClick={handleNext} className="w-full">
          {currentIndex >= questions.length - 1 ? 'დასრულება' : 'შემდეგი'}
        </Button>
      )}
    </div>
  )
}
