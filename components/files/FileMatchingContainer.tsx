'use client'

import { useState, useMemo } from 'react'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { Trophy, RotateCcw, Check, Volume2 } from 'lucide-react'
import Button from '@/components/ui/Button'
import { useSpeech } from '@/hooks/useSpeech'

interface FileWord {
  id: string
  english: string
  georgian: string
}

interface FileMatchingContainerProps {
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

export default function FileMatchingContainer({ words, fileId }: FileMatchingContainerProps) {
  const router = useRouter()
  const { speak } = useSpeech()

  const gameWords = useMemo(() => {
    return shuffleArray(words).slice(0, Math.min(6, words.length))
  }, [words])

  const [selectedEnglish, setSelectedEnglish] = useState<string | null>(null)
  const [matchedPairs, setMatchedPairs] = useState<string[]>([])
  const [wrongPair, setWrongPair] = useState<{ english: string; georgian: string } | null>(null)
  const [correctCount, setCorrectCount] = useState(0)
  const [wrongCount, setWrongCount] = useState(0)
  const [xpEarned, setXpEarned] = useState(0)
  const [isComplete, setIsComplete] = useState(false)

  const shuffledEnglish = useMemo(() => shuffleArray(gameWords.map((w) => w.english)), [gameWords])
  const shuffledGeorgian = useMemo(() => shuffleArray(gameWords.map((w) => w.georgian)), [gameWords])

  const handleEnglishClick = (english: string) => {
    if (matchedPairs.includes(english)) return
    setSelectedEnglish(english)
    setWrongPair(null)
  }

  const handleGeorgianClick = async (georgian: string) => {
    if (!selectedEnglish) return

    const word = gameWords.find((w) => w.english === selectedEnglish)
    if (!word) return

    const isCorrect = word.georgian === georgian

    if (isCorrect) {
      setCorrectCount((prev) => prev + 1)
      setMatchedPairs((prev) => [...prev, selectedEnglish])

      try {
        const res = await fetch('/api/files/words/progress', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            fileWordId: word.id,
            correct: true,
          }),
        })
        const data = await res.json()
        if (data.xpGained) {
          setXpEarned((prev) => prev + data.xpGained)
        }
      } catch (error) {
        console.error('Error updating progress:', error)
      }

      if (matchedPairs.length + 1 === gameWords.length) {
        setIsComplete(true)
      }
    } else {
      setWrongCount((prev) => prev + 1)
      setWrongPair({ english: selectedEnglish, georgian })

      try {
        await fetch('/api/files/words/progress', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            fileWordId: word.id,
            correct: false,
            mistakeType: 'matching',
          }),
        })
      } catch (error) {
        console.error('Error updating progress:', error)
      }

      setTimeout(() => {
        setWrongPair(null)
      }, 500)
    }

    setSelectedEnglish(null)
  }

  const restart = () => {
    setSelectedEnglish(null)
    setMatchedPairs([])
    setWrongPair(null)
    setCorrectCount(0)
    setWrongCount(0)
    setXpEarned(0)
    setIsComplete(false)
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

        <h2 className="text-2xl font-bold text-gray-900 mb-2">შესატყობი დასრულდა!</h2>
        <p className="text-gray-600 mb-6">{gameWords.length} წყვილი</p>

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

  const progress = (matchedPairs.length / gameWords.length) * 100

  return (
    <div className="space-y-6">
      {/* Progress */}
      <div className="space-y-2">
        <div className="flex justify-between text-sm text-gray-600">
          <span>დაკავშირებული: {matchedPairs.length}/{gameWords.length}</span>
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

      <p className="text-center text-gray-600">დააკავშირე ინგლისური სიტყვა ქართულ თარგმანთან</p>

      {/* Matching Grid */}
      <div className="grid grid-cols-2 gap-4">
        {/* English Column */}
        <div className="space-y-2">
          <p className="text-sm font-medium text-gray-500 mb-2">ინგლისური</p>
          {shuffledEnglish.map((english) => {
            const isMatched = matchedPairs.includes(english)
            const isSelected = selectedEnglish === english
            const isWrong = wrongPair?.english === english

            return (
              <motion.button
                key={english}
                onClick={() => handleEnglishClick(english)}
                disabled={isMatched}
                whileHover={!isMatched ? { scale: 1.02 } : undefined}
                whileTap={!isMatched ? { scale: 0.98 } : undefined}
                className={`w-full p-3 rounded-lg border-2 text-left font-medium transition-colors ${
                  isMatched
                    ? 'bg-green-50 border-green-300 text-green-700'
                    : isWrong
                      ? 'bg-red-50 border-red-500 text-red-900'
                      : isSelected
                        ? 'bg-blue-50 border-blue-500 text-blue-900'
                        : 'bg-white border-gray-200 hover:border-blue-300 text-gray-900'
                } disabled:cursor-default`}
              >
                <div className="flex items-center justify-between">
                  <span>{english}</span>
                  <div className="flex items-center gap-1">
                    <span
                      onClick={(e) => {
                        e.stopPropagation()
                        speak(english)
                      }}
                      className="p-1 text-blue-500 hover:text-blue-700 cursor-pointer"
                    >
                      <Volume2 size={16} />
                    </span>
                    {isMatched && <Check size={16} className="text-green-600" />}
                  </div>
                </div>
              </motion.button>
            )
          })}
        </div>

        {/* Georgian Column */}
        <div className="space-y-2">
          <p className="text-sm font-medium text-gray-500 mb-2">ქართული</p>
          {shuffledGeorgian.map((georgian) => {
            const word = gameWords.find((w) => w.georgian === georgian)
            const isMatched = word && matchedPairs.includes(word.english)
            const isWrong = wrongPair?.georgian === georgian

            return (
              <motion.button
                key={georgian}
                onClick={() => handleGeorgianClick(georgian)}
                disabled={isMatched || !selectedEnglish}
                whileHover={!isMatched && selectedEnglish ? { scale: 1.02 } : undefined}
                whileTap={!isMatched && selectedEnglish ? { scale: 0.98 } : undefined}
                className={`w-full p-3 rounded-lg border-2 text-left font-medium transition-colors ${
                  isMatched
                    ? 'bg-green-50 border-green-300 text-green-700'
                    : isWrong
                      ? 'bg-red-50 border-red-500 text-red-900'
                      : 'bg-white border-gray-200 hover:border-blue-300 text-gray-900'
                } disabled:cursor-default disabled:opacity-50`}
              >
                <div className="flex items-center justify-between">
                  <span>{georgian}</span>
                  {isMatched && <Check size={16} className="text-green-600" />}
                </div>
              </motion.button>
            )
          })}
        </div>
      </div>
    </div>
  )
}
