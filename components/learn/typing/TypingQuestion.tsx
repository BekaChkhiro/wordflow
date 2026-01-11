'use client'

import { useState, useRef, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Check, X, Volume2 } from 'lucide-react'

interface TypingQuestionProps {
  georgian: string
  correctAnswer: string
  onAnswer: (isCorrect: boolean, userAnswer: string) => void
}

export default function TypingQuestion({
  georgian,
  correctAnswer,
  onAnswer,
}: TypingQuestionProps) {
  const [userInput, setUserInput] = useState('')
  const [showResult, setShowResult] = useState(false)
  const [isCorrect, setIsCorrect] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    inputRef.current?.focus()
  }, [])

  const speak = (text: string) => {
    if ('speechSynthesis' in window) {
      speechSynthesis.cancel()
      const utterance = new SpeechSynthesisUtterance(text)
      utterance.lang = 'en-US'
      speechSynthesis.speak(utterance)
    }
  }

  const normalizeString = (str: string) => {
    return str
      .toLowerCase()
      .trim()
      .replace(/[.,!?;:'"]/g, '') // Remove punctuation
      .replace(/\s+/g, ' ') // Normalize whitespace
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (showResult || !userInput.trim()) return

    const normalized = normalizeString(userInput)
    const normalizedCorrect = normalizeString(correctAnswer)
    const correct = normalized === normalizedCorrect

    setIsCorrect(correct)
    setShowResult(true)

    setTimeout(() => {
      onAnswer(correct, userInput)
    }, 2000)
  }

  const getCharacterComparison = () => {
    const userChars = userInput.toLowerCase().split('')
    const correctChars = correctAnswer.toLowerCase().split('')

    return userChars.map((char, index) => {
      const isMatch = char === correctChars[index]
      return { char, isMatch }
    })
  }

  return (
    <div className="space-y-6">
      {/* Georgian text to translate */}
      <div className="bg-gradient-to-br from-cyan-500 to-cyan-600 rounded-2xl p-6 text-center">
        <p className="text-cyan-200 text-sm mb-2">თარგმნე ინგლისურად</p>
        <p className="text-xl md:text-2xl font-bold text-white leading-relaxed">
          {georgian}
        </p>
      </div>

      {/* Input form */}
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="relative">
          <input
            ref={inputRef}
            type="text"
            value={userInput}
            onChange={(e) => setUserInput(e.target.value)}
            disabled={showResult}
            placeholder="აკრიფე ინგლისურად..."
            className={`
              w-full p-4 text-lg rounded-xl border-2 outline-none transition-all
              text-gray-900 placeholder:text-gray-400
              ${showResult
                ? isCorrect
                  ? 'border-green-500 bg-green-50'
                  : 'border-red-500 bg-red-50'
                : 'border-gray-200 focus:border-cyan-500 bg-white'
              }
            `}
            autoComplete="off"
            autoCorrect="off"
            autoCapitalize="off"
            spellCheck="false"
          />
          {showResult && (
            <div className="absolute right-4 top-1/2 -translate-y-1/2">
              {isCorrect ? (
                <Check className="text-green-500" size={24} />
              ) : (
                <X className="text-red-500" size={24} />
              )}
            </div>
          )}
        </div>

        {/* Character-by-character comparison when wrong */}
        {showResult && !isCorrect && (
          <div className="space-y-2">
            <p className="text-sm text-gray-500">შენი პასუხი:</p>
            <div className="flex flex-wrap gap-1 p-3 bg-gray-50 rounded-lg">
              {getCharacterComparison().map((item, index) => (
                <span
                  key={index}
                  className={`
                    px-1 font-mono text-lg
                    ${item.isMatch ? 'text-green-600' : 'text-red-600 bg-red-100 rounded'}
                  `}
                >
                  {item.char === ' ' ? '\u00A0' : item.char}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Submit button */}
        {!showResult && (
          <motion.button
            type="submit"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            disabled={!userInput.trim()}
            className={`
              w-full py-4 rounded-xl font-bold text-lg transition-all
              ${userInput.trim()
                ? 'bg-cyan-500 text-white hover:bg-cyan-600'
                : 'bg-gray-200 text-gray-400 cursor-not-allowed'
              }
            `}
          >
            შემოწმება
          </motion.button>
        )}
      </form>

      {/* Result feedback */}
      {showResult && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className={`p-4 rounded-xl ${isCorrect ? 'bg-green-100' : 'bg-red-100'}`}
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
          <div className="flex items-center justify-center gap-2">
            <p className={`font-medium ${isCorrect ? 'text-green-600' : 'text-green-600'}`}>
              სწორი პასუხი: {correctAnswer}
            </p>
            <button
              onClick={() => speak(correctAnswer)}
              className="p-1 hover:bg-white/50 rounded"
            >
              <Volume2 size={18} className="text-green-600" />
            </button>
          </div>
        </motion.div>
      )}
    </div>
  )
}
