'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { Check, X, Volume2 } from 'lucide-react'

interface QuizQuestionProps {
  question: string
  correctAnswer: string
  options: string[]
  onAnswer: (isCorrect: boolean, selectedAnswer: string) => void
}

export default function QuizQuestion({
  question,
  correctAnswer,
  options,
  onAnswer,
}: QuizQuestionProps) {
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null)
  const [showResult, setShowResult] = useState(false)

  const speak = (text: string) => {
    if ('speechSynthesis' in window) {
      speechSynthesis.cancel()
      const utterance = new SpeechSynthesisUtterance(text)
      utterance.lang = 'en-US'
      speechSynthesis.speak(utterance)
    }
  }

  const handleSelect = (answer: string) => {
    if (showResult) return

    setSelectedAnswer(answer)
    setShowResult(true)

    const isCorrect = answer === correctAnswer

    // Delay before moving to next question
    setTimeout(() => {
      onAnswer(isCorrect, answer)
      setSelectedAnswer(null)
      setShowResult(false)
    }, 1500)
  }

  const getOptionStyle = (option: string) => {
    if (!showResult) {
      return 'bg-white border-gray-200 text-gray-900 hover:border-blue-400 hover:bg-blue-50'
    }

    if (option === correctAnswer) {
      return 'bg-green-50 border-green-500 text-green-700'
    }

    if (option === selectedAnswer && option !== correctAnswer) {
      return 'bg-red-50 border-red-500 text-red-700'
    }

    return 'bg-gray-50 border-gray-200 text-gray-400'
  }

  return (
    <div className="space-y-6">
      {/* Question */}
      <div className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-2xl p-6 text-center">
        <p className="text-purple-200 text-sm mb-2">თარგმნე ქართულად</p>
        <p className="text-2xl md:text-3xl font-bold text-white">{question}</p>
        <button
          onClick={() => speak(question)}
          className="mt-4 p-2 bg-white/20 rounded-full hover:bg-white/30 transition-colors"
        >
          <Volume2 className="text-white" size={24} />
        </button>
      </div>

      {/* Options */}
      <div className="grid grid-cols-1 gap-3">
        {options.map((option, index) => (
          <motion.button
            key={index}
            whileHover={!showResult ? { scale: 1.02 } : {}}
            whileTap={!showResult ? { scale: 0.98 } : {}}
            onClick={() => handleSelect(option)}
            disabled={showResult}
            className={`
              relative p-4 rounded-xl border-2 text-left font-medium transition-all
              ${getOptionStyle(option)}
            `}
          >
            <div className="flex items-center justify-between">
              <span>{option}</span>
              {showResult && option === correctAnswer && (
                <Check className="text-green-500" size={24} />
              )}
              {showResult && option === selectedAnswer && option !== correctAnswer && (
                <X className="text-red-500" size={24} />
              )}
            </div>
          </motion.button>
        ))}
      </div>
    </div>
  )
}
