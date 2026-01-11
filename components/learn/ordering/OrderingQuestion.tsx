'use client'

import { useState, useCallback } from 'react'
import { motion, Reorder } from 'framer-motion'
import { Check, X, Volume2 } from 'lucide-react'

interface OrderingQuestionProps {
  correctSentence: string
  georgian: string
  onAnswer: (isCorrect: boolean, userAnswer: string) => void
}

export default function OrderingQuestion({
  correctSentence,
  georgian,
  onAnswer,
}: OrderingQuestionProps) {
  // Shuffle words initially
  const correctWords = correctSentence.split(' ')
  const [words, setWords] = useState<string[]>(() => {
    const shuffled = [...correctWords]
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1))
      ;[shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]]
    }
    return shuffled
  })

  const [showResult, setShowResult] = useState(false)
  const [isCorrect, setIsCorrect] = useState(false)

  const speak = (text: string) => {
    if ('speechSynthesis' in window) {
      speechSynthesis.cancel()
      const utterance = new SpeechSynthesisUtterance(text)
      utterance.lang = 'en-US'
      speechSynthesis.speak(utterance)
    }
  }

  const handleCheck = useCallback(() => {
    if (showResult) return

    const userSentence = words.join(' ')
    const correct = userSentence === correctSentence

    setIsCorrect(correct)
    setShowResult(true)

    setTimeout(() => {
      onAnswer(correct, userSentence)
    }, 2000)
  }, [words, correctSentence, showResult, onAnswer])

  const getWordStyle = (word: string, index: number) => {
    if (!showResult) {
      return 'bg-white border-gray-200 text-gray-900 cursor-grab active:cursor-grabbing hover:border-blue-400 hover:bg-blue-50'
    }

    const correctIndex = correctWords.indexOf(word)
    const isInCorrectPosition = words[index] === correctWords[index]

    if (isInCorrectPosition) {
      return 'bg-green-100 border-green-500 text-green-700'
    }

    return 'bg-red-100 border-red-500 text-red-700'
  }

  return (
    <div className="space-y-6">
      {/* Georgian sentence to translate */}
      <div className="bg-gradient-to-br from-orange-500 to-orange-600 rounded-2xl p-6 text-center">
        <p className="text-orange-200 text-sm mb-2">დაალაგე სიტყვები</p>
        <p className="text-xl md:text-2xl font-bold text-white leading-relaxed">
          {georgian}
        </p>
        <button
          onClick={() => speak(correctSentence)}
          className="mt-4 p-2 bg-white/20 rounded-full hover:bg-white/30 transition-colors"
        >
          <Volume2 className="text-white" size={24} />
        </button>
      </div>

      {/* Word ordering area */}
      <div className="min-h-[120px] bg-gray-50 rounded-2xl p-4 border-2 border-dashed border-gray-300">
        <Reorder.Group
          axis="x"
          values={words}
          onReorder={showResult ? () => {} : setWords}
          className="flex flex-wrap gap-2 justify-center"
        >
          {words.map((word, index) => (
            <Reorder.Item
              key={`${word}-${index}`}
              value={word}
              drag={!showResult}
            >
              <motion.div
                whileHover={!showResult ? { scale: 1.05 } : {}}
                whileTap={!showResult ? { scale: 0.95 } : {}}
                className={`
                  px-4 py-2 rounded-xl border-2 font-medium transition-all select-none
                  ${getWordStyle(word, index)}
                `}
              >
                {word}
              </motion.div>
            </Reorder.Item>
          ))}
        </Reorder.Group>
      </div>

      {/* Check button */}
      {!showResult && (
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={handleCheck}
          className="w-full py-4 bg-orange-500 text-white rounded-xl font-bold text-lg hover:bg-orange-600 transition-colors"
        >
          შემოწმება
        </motion.button>
      )}

      {/* Result feedback */}
      {showResult && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className={`p-4 rounded-xl text-center ${
            isCorrect ? 'bg-green-100' : 'bg-red-100'
          }`}
        >
          <div className="flex items-center justify-center gap-2 mb-2">
            {isCorrect ? (
              <>
                <Check className="text-green-600" size={24} />
                <span className="text-green-700 font-bold">სწორია!</span>
              </>
            ) : (
              <>
                <X className="text-red-600" size={24} />
                <span className="text-red-700 font-bold">არასწორია</span>
              </>
            )}
          </div>
          {!isCorrect && (
            <p className="text-green-600 font-medium">
              სწორი პასუხი: {correctSentence}
            </p>
          )}
        </motion.div>
      )}
    </div>
  )
}
