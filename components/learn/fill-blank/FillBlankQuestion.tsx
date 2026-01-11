'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { Check, X, Volume2 } from 'lucide-react'

interface FillBlankQuestionProps {
  sentence: string
  missingWord: string
  options: string[]
  onAnswer: (isCorrect: boolean, selectedAnswer: string) => void
}

export default function FillBlankQuestion({
  sentence,
  missingWord,
  options,
  onAnswer,
}: FillBlankQuestionProps) {
  const [selectedWord, setSelectedWord] = useState<string | null>(null)
  const [showResult, setShowResult] = useState(false)

  const speak = (text: string) => {
    if ('speechSynthesis' in window) {
      speechSynthesis.cancel()
      const utterance = new SpeechSynthesisUtterance(text)
      utterance.lang = 'en-US'
      speechSynthesis.speak(utterance)
    }
  }

  const handleSelect = (word: string) => {
    if (showResult) return

    setSelectedWord(word)
    setShowResult(true)

    const isCorrect = word === missingWord

    setTimeout(() => {
      onAnswer(isCorrect, word)
      setSelectedWord(null)
      setShowResult(false)
    }, 1500)
  }

  // Replace the missing word with blank
  const parts = sentence.split(missingWord)
  const displaySentence = parts.length > 1
    ? parts.join('_____')
    : sentence.replace(/\b\w+\b/, '_____') // fallback

  const getWordStyle = (word: string) => {
    if (!showResult) {
      return 'bg-white border-gray-200 text-gray-900 hover:border-blue-400 hover:bg-blue-50'
    }

    if (word === missingWord) {
      return 'bg-green-100 border-green-500 text-green-700'
    }

    if (word === selectedWord && word !== missingWord) {
      return 'bg-red-100 border-red-500 text-red-700'
    }

    return 'bg-gray-50 border-gray-200 text-gray-400'
  }

  return (
    <div className="space-y-6">
      {/* Sentence */}
      <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-2xl p-6 text-center">
        <p className="text-green-200 text-sm mb-2">შეავსე გამოტოვებული</p>
        <p className="text-xl md:text-2xl font-bold text-white leading-relaxed">
          {showResult ? (
            <>
              {parts[0]}
              <span className={`px-2 py-1 rounded ${selectedWord === missingWord ? 'bg-green-400/50' : 'bg-red-400/50'}`}>
                {selectedWord}
              </span>
              {parts[1]}
            </>
          ) : (
            displaySentence
          )}
        </p>
        <button
          onClick={() => speak(sentence)}
          className="mt-4 p-2 bg-white/20 rounded-full hover:bg-white/30 transition-colors"
        >
          <Volume2 className="text-white" size={24} />
        </button>
      </div>

      {/* Word Options */}
      <div className="grid grid-cols-2 gap-3">
        {options.map((word, index) => (
          <motion.button
            key={index}
            whileHover={!showResult ? { scale: 1.02 } : {}}
            whileTap={!showResult ? { scale: 0.98 } : {}}
            onClick={() => handleSelect(word)}
            disabled={showResult}
            className={`
              relative p-4 rounded-xl border-2 font-medium transition-all
              ${getWordStyle(word)}
            `}
          >
            <div className="flex items-center justify-center gap-2">
              <span>{word}</span>
              {showResult && word === missingWord && (
                <Check className="text-green-500" size={20} />
              )}
              {showResult && word === selectedWord && word !== missingWord && (
                <X className="text-red-500" size={20} />
              )}
            </div>
          </motion.button>
        ))}
      </div>

      {/* Show correct answer if wrong */}
      {showResult && selectedWord !== missingWord && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center text-green-600 font-medium"
        >
          სწორი პასუხი: {missingWord}
        </motion.div>
      )}
    </div>
  )
}
