'use client'

import { useState, useEffect, useCallback } from 'react'
import { Check, X, ArrowRight, RotateCcw, Trophy, Eye, EyeOff } from 'lucide-react'
import type { ContextSentence } from '@/lib/expression-extractor'

interface ContextModeProps {
  sentences: ContextSentence[]
  onComplete?: (score: number, total: number) => void
}

export function ContextMode({ sentences, onComplete }: ContextModeProps) {
  const [currentIndex, setCurrentIndex] = useState(0)
  const [userAnswer, setUserAnswer] = useState('')
  const [showResult, setShowResult] = useState(false)
  const [isCorrect, setIsCorrect] = useState(false)
  const [score, setScore] = useState(0)
  const [showHint, setShowHint] = useState(false)
  const [completed, setCompleted] = useState(false)
  const [shuffledSentences, setShuffledSentences] = useState<ContextSentence[]>([])

  // Shuffle on mount
  useEffect(() => {
    const shuffled = [...sentences].sort(() => Math.random() - 0.5)
    setShuffledSentences(shuffled)
  }, [sentences])

  const current = shuffledSentences[currentIndex]

  const checkAnswer = useCallback(() => {
    if (!current || showResult) return

    // Check if answer matches (case insensitive, allow small variations)
    const userAns = userAnswer.toLowerCase().trim()
    const correctAns = current.answer.toLowerCase()

    // Accept exact match or close match
    const correct = userAns === correctAns ||
      correctAns.includes(userAns) ||
      userAns.includes(correctAns)

    setIsCorrect(correct)
    setShowResult(true)

    if (correct) {
      setScore((s) => s + 1)
    }
  }, [current, userAnswer, showResult])

  const nextSentence = useCallback(() => {
    if (currentIndex < shuffledSentences.length - 1) {
      setCurrentIndex((i) => i + 1)
      setUserAnswer('')
      setShowResult(false)
      setShowHint(false)
    } else {
      setCompleted(true)
      onComplete?.(score + (isCorrect ? 1 : 0), shuffledSentences.length)
    }
  }, [currentIndex, shuffledSentences.length, score, isCorrect, onComplete])

  const restart = () => {
    const shuffled = [...sentences].sort(() => Math.random() - 0.5)
    setShuffledSentences(shuffled)
    setCurrentIndex(0)
    setScore(0)
    setUserAnswer('')
    setShowResult(false)
    setShowHint(false)
    setCompleted(false)
  }

  // Handle Enter key
  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      if (e.key === 'Enter') {
        if (showResult) {
          nextSentence()
        } else if (userAnswer.trim()) {
          checkAnswer()
        }
      }
    }

    window.addEventListener('keypress', handleKeyPress)
    return () => window.removeEventListener('keypress', handleKeyPress)
  }, [showResult, userAnswer, checkAnswer, nextSentence])

  if (shuffledSentences.length === 0) {
    return (
      <div className="flex items-center justify-center h-64 text-gray-500">
        წინადადებები არ მოიძებნა
      </div>
    )
  }

  if (completed) {
    const percentage = Math.round((score / shuffledSentences.length) * 100)
    return (
      <div className="flex flex-col items-center justify-center py-12">
        <div className="w-24 h-24 bg-gradient-to-br from-green-400 to-emerald-500 rounded-full flex items-center justify-center mb-6">
          <Trophy className="w-12 h-12 text-white" />
        </div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">შესანიშნავია!</h2>
        <p className="text-lg text-gray-600 mb-6">
          შედეგი: <span className="font-bold text-green-600">{score}</span> / {shuffledSentences.length}
          <span className="ml-2 text-gray-500">({percentage}%)</span>
        </p>
        <button
          onClick={restart}
          className="flex items-center gap-2 px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
        >
          <RotateCcw className="w-5 h-5" />
          თავიდან დაწყება
        </button>
      </div>
    )
  }

  return (
    <div className="max-w-2xl mx-auto">
      {/* Progress */}
      <div className="flex items-center justify-between mb-4">
        <span className="text-sm text-gray-500">
          {currentIndex + 1} / {shuffledSentences.length}
        </span>
        <span className="text-sm text-green-600 font-medium">
          ✓ {score} სწორი
        </span>
      </div>

      {/* Progress bar */}
      <div className="w-full h-2 bg-gray-200 rounded-full mb-8">
        <div
          className="h-full bg-green-600 rounded-full transition-all"
          style={{ width: `${((currentIndex + 1) / shuffledSentences.length) * 100}%` }}
        />
      </div>

      {current && (
        <div className="bg-white rounded-xl shadow-lg p-8">
          {/* Instructions */}
          <div className="text-center mb-6">
            <span className="inline-block px-3 py-1 bg-green-100 text-green-700 rounded-full text-sm">
              შეავსე გამოტოვებული სიტყვა
            </span>
          </div>

          {/* Sentence with blank */}
          <div className="text-center mb-8">
            <p className="text-xl leading-relaxed text-gray-800">
              {current.sentenceWithBlank.split('___').map((part, i, arr) => (
                <span key={i}>
                  {part}
                  {i < arr.length - 1 && (
                    <span className="inline-block min-w-[100px] mx-1 px-2 py-1 bg-yellow-100 border-b-2 border-yellow-400 rounded">
                      {showResult ? (
                        <span className={`font-bold ${isCorrect ? 'text-green-600' : 'text-red-600'}`}>
                          {current.answer}
                        </span>
                      ) : (
                        <span className="text-yellow-600">?</span>
                      )}
                    </span>
                  )}
                </span>
              ))}
            </p>
          </div>

          {/* Hint (Georgian translation) */}
          <div className="flex justify-center mb-6">
            <button
              onClick={() => setShowHint(!showHint)}
              className="flex items-center gap-2 px-4 py-2 text-sm text-gray-600 hover:text-gray-800 transition-colors"
            >
              {showHint ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              {showHint ? 'დამალე მინიშნება' : 'მინიშნება (ქართულად)'}
            </button>
          </div>

          {showHint && !showResult && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6 text-center">
              <p className="text-blue-700 font-medium">{current.georgian}</p>
              <p className="text-sm text-blue-500 mt-1">სიტყვა: {current.word}</p>
            </div>
          )}

          {/* Input */}
          {!showResult && (
            <div className="flex gap-3 max-w-md mx-auto">
              <input
                type="text"
                value={userAnswer}
                onChange={(e) => setUserAnswer(e.target.value)}
                placeholder="ჩაწერე სიტყვა..."
                className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent text-center text-lg placeholder:text-gray-900"
                autoFocus
              />
              <button
                onClick={checkAnswer}
                disabled={!userAnswer.trim()}
                className="px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 transition-colors"
              >
                <Check className="w-5 h-5" />
              </button>
            </div>
          )}

          {/* Result */}
          {showResult && (
            <div className="text-center">
              <div
                className={`inline-flex items-center gap-2 px-6 py-3 rounded-full mb-6 ${
                  isCorrect ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                }`}
              >
                {isCorrect ? (
                  <>
                    <Check className="w-5 h-5" />
                    სწორია!
                  </>
                ) : (
                  <>
                    <X className="w-5 h-5" />
                    არასწორია. პასუხი: <strong>{current.answer}</strong>
                  </>
                )}
              </div>

              {/* Full sentence */}
              <div className="bg-gray-50 rounded-lg p-4 mb-6">
                <p className="text-gray-700">{current.sentence}</p>
              </div>

              {/* Translation */}
              <p className="text-sm text-blue-600 mb-6">
                <strong>{current.word}</strong> — {current.georgian}
              </p>

              <button
                onClick={nextSentence}
                className="flex items-center gap-2 mx-auto px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
              >
                {currentIndex < shuffledSentences.length - 1 ? (
                  <>
                    შემდეგი
                    <ArrowRight className="w-5 h-5" />
                  </>
                ) : (
                  <>
                    დასრულება
                    <Trophy className="w-5 h-5" />
                  </>
                )}
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
