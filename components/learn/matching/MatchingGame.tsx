'use client'

import { useState, useMemo } from 'react'
import { motion } from 'framer-motion'
import { Check, X, Volume2 } from 'lucide-react'

interface Phrase {
  id: number
  english: string
  georgian: string
}

interface MatchingGameProps {
  phrases: Phrase[]
  onComplete: (correctCount: number, wrongCount: number, phraseResults: { id: number; correct: boolean }[]) => void
}

function shuffleArray<T>(array: T[]): T[] {
  const shuffled = [...array]
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]]
  }
  return shuffled
}

export default function MatchingGame({ phrases, onComplete }: MatchingGameProps) {
  // Shuffle both columns independently
  const englishItems = useMemo(() => shuffleArray(phrases.map(p => ({ id: p.id, text: p.english }))), [phrases])
  const georgianItems = useMemo(() => shuffleArray(phrases.map(p => ({ id: p.id, text: p.georgian }))), [phrases])

  const [selectedEnglish, setSelectedEnglish] = useState<number | null>(null)
  const [selectedGeorgian, setSelectedGeorgian] = useState<number | null>(null)
  const [matchedPairs, setMatchedPairs] = useState<number[]>([])
  const [wrongPairs, setWrongPairs] = useState<{ english: number; georgian: number }[]>([])
  const [showingResult, setShowingResult] = useState<{ english: number; georgian: number; correct: boolean } | null>(null)
  const [correctCount, setCorrectCount] = useState(0)
  const [wrongCount, setWrongCount] = useState(0)
  const [phraseResults, setPhraseResults] = useState<{ id: number; correct: boolean }[]>([])

  const speak = (text: string) => {
    if ('speechSynthesis' in window) {
      speechSynthesis.cancel()
      const utterance = new SpeechSynthesisUtterance(text)
      utterance.lang = 'en-US'
      speechSynthesis.speak(utterance)
    }
  }

  const handleEnglishClick = (id: number) => {
    if (matchedPairs.includes(id) || showingResult) return
    setSelectedEnglish(id)

    // If Georgian already selected, check match
    if (selectedGeorgian !== null) {
      checkMatch(id, selectedGeorgian)
    }
  }

  const handleGeorgianClick = (id: number) => {
    if (matchedPairs.includes(id) || showingResult) return
    setSelectedGeorgian(id)

    // If English already selected, check match
    if (selectedEnglish !== null) {
      checkMatch(selectedEnglish, id)
    }
  }

  const checkMatch = (englishId: number, georgianId: number) => {
    const isMatch = englishId === georgianId

    setShowingResult({ english: englishId, georgian: georgianId, correct: isMatch })

    if (isMatch) {
      setCorrectCount(prev => prev + 1)
      setPhraseResults(prev => [...prev, { id: englishId, correct: true }])

      setTimeout(() => {
        setMatchedPairs(prev => [...prev, englishId])
        setSelectedEnglish(null)
        setSelectedGeorgian(null)
        setShowingResult(null)

        // Check if complete
        if (matchedPairs.length + 1 === phrases.length) {
          onComplete(correctCount + 1, wrongCount, [...phraseResults, { id: englishId, correct: true }])
        }
      }, 800)
    } else {
      setWrongCount(prev => prev + 1)
      // First wrong attempt for this phrase
      if (!phraseResults.find(r => r.id === englishId)) {
        setPhraseResults(prev => [...prev, { id: englishId, correct: false }])
      }
      setWrongPairs(prev => [...prev, { english: englishId, georgian: georgianId }])

      setTimeout(() => {
        setSelectedEnglish(null)
        setSelectedGeorgian(null)
        setShowingResult(null)
        setWrongPairs([])
      }, 800)
    }
  }

  const getEnglishStyle = (id: number) => {
    if (matchedPairs.includes(id)) {
      return 'bg-green-100 border-green-500 text-green-700 opacity-50'
    }
    if (showingResult?.english === id) {
      return showingResult.correct
        ? 'bg-green-100 border-green-500 text-green-700'
        : 'bg-red-100 border-red-500 text-red-700'
    }
    if (selectedEnglish === id) {
      return 'bg-blue-100 border-blue-500 text-blue-700'
    }
    return 'bg-white border-gray-200 text-gray-900 hover:border-blue-400 hover:bg-blue-50'
  }

  const getGeorgianStyle = (id: number) => {
    if (matchedPairs.includes(id)) {
      return 'bg-green-100 border-green-500 text-green-700 opacity-50'
    }
    if (showingResult?.georgian === id) {
      return showingResult.correct
        ? 'bg-green-100 border-green-500 text-green-700'
        : 'bg-red-100 border-red-500 text-red-700'
    }
    if (selectedGeorgian === id) {
      return 'bg-pink-100 border-pink-500 text-pink-700'
    }
    return 'bg-white border-gray-200 text-gray-900 hover:border-pink-400 hover:bg-pink-50'
  }

  const progress = (matchedPairs.length / phrases.length) * 100

  return (
    <div className="space-y-6">
      {/* Progress */}
      <div className="space-y-2">
        <div className="flex justify-between text-sm text-gray-600">
          <span>{matchedPairs.length} / {phrases.length} დაკავშირებული</span>
          <span className="flex gap-4">
            <span className="text-green-600">✓ {correctCount}</span>
            <span className="text-red-600">✗ {wrongCount}</span>
          </span>
        </div>
        <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
          <motion.div
            className="h-full bg-pink-500"
            initial={{ width: 0 }}
            animate={{ width: `${progress}%` }}
            transition={{ duration: 0.3 }}
          />
        </div>
      </div>

      {/* Instructions */}
      <div className="text-center text-gray-500 text-sm">
        აირჩიე ინგლისური და შემდეგ შესაბამისი ქართული
      </div>

      {/* Matching columns */}
      <div className="grid grid-cols-2 gap-4">
        {/* English column */}
        <div className="space-y-2">
          <p className="text-sm font-medium text-gray-500 text-center mb-3">English</p>
          {englishItems.map((item) => (
            <motion.button
              key={`en-${item.id}`}
              whileHover={!matchedPairs.includes(item.id) && !showingResult ? { scale: 1.02 } : {}}
              whileTap={!matchedPairs.includes(item.id) && !showingResult ? { scale: 0.98 } : {}}
              onClick={() => handleEnglishClick(item.id)}
              disabled={matchedPairs.includes(item.id) || showingResult !== null}
              className={`
                w-full p-3 rounded-xl border-2 font-medium transition-all text-left
                flex items-center justify-between gap-2
                ${getEnglishStyle(item.id)}
              `}
            >
              <span className="truncate">{item.text}</span>
              <div className="flex items-center gap-1 shrink-0">
                {matchedPairs.includes(item.id) && <Check className="text-green-500" size={18} />}
                {showingResult?.english === item.id && !showingResult.correct && <X className="text-red-500" size={18} />}
                <span
                  role="button"
                  onClick={(e) => {
                    e.stopPropagation()
                    speak(item.text)
                  }}
                  className="p-1 hover:bg-gray-200 rounded cursor-pointer"
                >
                  <Volume2 size={16} className="text-gray-400" />
                </span>
              </div>
            </motion.button>
          ))}
        </div>

        {/* Georgian column */}
        <div className="space-y-2">
          <p className="text-sm font-medium text-gray-500 text-center mb-3">ქართული</p>
          {georgianItems.map((item) => (
            <motion.button
              key={`ge-${item.id}`}
              whileHover={!matchedPairs.includes(item.id) && !showingResult ? { scale: 1.02 } : {}}
              whileTap={!matchedPairs.includes(item.id) && !showingResult ? { scale: 0.98 } : {}}
              onClick={() => handleGeorgianClick(item.id)}
              disabled={matchedPairs.includes(item.id) || showingResult !== null}
              className={`
                w-full p-3 rounded-xl border-2 font-medium transition-all text-left
                flex items-center justify-between gap-2
                ${getGeorgianStyle(item.id)}
              `}
            >
              <span className="truncate">{item.text}</span>
              {matchedPairs.includes(item.id) && <Check className="text-green-500" size={18} />}
              {showingResult?.georgian === item.id && !showingResult.correct && <X className="text-red-500" size={18} />}
            </motion.button>
          ))}
        </div>
      </div>
    </div>
  )
}
