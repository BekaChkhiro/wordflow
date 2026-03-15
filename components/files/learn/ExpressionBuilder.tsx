'use client'

import { useState, useEffect, useCallback } from 'react'
import { Check, X, ArrowRight, RotateCcw, Trophy, Lightbulb } from 'lucide-react'
import type { Expression } from '@/lib/expression-extractor'

interface ExpressionBuilderProps {
  expressions: Expression[]
  onComplete?: (score: number, total: number) => void
}

type Category = 'all' | 'mind' | 'eye' | 'phrasal' | 'idiom'

export function ExpressionBuilder({ expressions, onComplete }: ExpressionBuilderProps) {
  const [category, setCategory] = useState<Category>('all')
  const [currentIndex, setCurrentIndex] = useState(0)
  const [userAnswer, setUserAnswer] = useState('')
  const [showResult, setShowResult] = useState(false)
  const [isCorrect, setIsCorrect] = useState(false)
  const [score, setScore] = useState(0)
  const [showHint, setShowHint] = useState(false)
  const [completed, setCompleted] = useState(false)

  // Filter expressions by category
  const filteredExpressions = category === 'all'
    ? expressions
    : expressions.filter((e) => e.category === category)

  const currentExpression = filteredExpressions[currentIndex]

  // Shuffle on mount or category change
  const [shuffledExpressions, setShuffledExpressions] = useState<Expression[]>([])

  useEffect(() => {
    const shuffled = [...filteredExpressions].sort(() => Math.random() - 0.5)
    setShuffledExpressions(shuffled)
    setCurrentIndex(0)
    setScore(0)
    setCompleted(false)
  }, [category, expressions.length])

  const current = shuffledExpressions[currentIndex]

  const checkAnswer = useCallback(() => {
    if (!current || showResult) return

    const correct = userAnswer.toLowerCase().trim() === current.answer.toLowerCase()
    setIsCorrect(correct)
    setShowResult(true)

    if (correct) {
      setScore((s) => s + 1)
    }
  }, [current, userAnswer, showResult])

  const nextExpression = useCallback(() => {
    if (currentIndex < shuffledExpressions.length - 1) {
      setCurrentIndex((i) => i + 1)
      setUserAnswer('')
      setShowResult(false)
      setShowHint(false)
    } else {
      setCompleted(true)
      onComplete?.(score + (isCorrect ? 1 : 0), shuffledExpressions.length)
    }
  }, [currentIndex, shuffledExpressions.length, score, isCorrect, onComplete])

  const restart = () => {
    const shuffled = [...filteredExpressions].sort(() => Math.random() - 0.5)
    setShuffledExpressions(shuffled)
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
          nextExpression()
        } else if (userAnswer.trim()) {
          checkAnswer()
        }
      }
    }

    window.addEventListener('keypress', handleKeyPress)
    return () => window.removeEventListener('keypress', handleKeyPress)
  }, [showResult, userAnswer, checkAnswer, nextExpression])

  if (shuffledExpressions.length === 0) {
    return (
      <div className="flex items-center justify-center h-64 text-gray-500">
        ამ კატეგორიაში გამოთქმები არ მოიძებნა
      </div>
    )
  }

  if (completed) {
    const percentage = Math.round((score / shuffledExpressions.length) * 100)
    return (
      <div className="flex flex-col items-center justify-center py-12">
        <div className="w-24 h-24 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-full flex items-center justify-center mb-6">
          <Trophy className="w-12 h-12 text-white" />
        </div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">დასრულდა!</h2>
        <p className="text-lg text-gray-600 mb-6">
          შედეგი: <span className="font-bold text-blue-600">{score}</span> / {shuffledExpressions.length}
          <span className="ml-2 text-gray-500">({percentage}%)</span>
        </p>
        <button
          onClick={restart}
          className="flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          <RotateCcw className="w-5 h-5" />
          თავიდან დაწყება
        </button>
      </div>
    )
  }

  return (
    <div className="max-w-2xl mx-auto">
      {/* Category selector */}
      <div className="flex gap-2 mb-6 flex-wrap">
        {(['all', 'mind', 'eye', 'phrasal'] as Category[]).map((cat) => (
          <button
            key={cat}
            onClick={() => setCategory(cat)}
            className={`px-4 py-2 rounded-lg transition-colors ${
              category === cat
                ? 'bg-blue-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            {cat === 'all' && 'ყველა'}
            {cat === 'mind' && '🧠 Mind'}
            {cat === 'eye' && '👁️ Eye'}
            {cat === 'phrasal' && '🔗 Phrasal'}
          </button>
        ))}
      </div>

      {/* Progress */}
      <div className="flex items-center justify-between mb-4">
        <span className="text-sm text-gray-500">
          {currentIndex + 1} / {shuffledExpressions.length}
        </span>
        <span className="text-sm text-green-600 font-medium">
          ✓ {score} სწორი
        </span>
      </div>

      {/* Progress bar */}
      <div className="w-full h-2 bg-gray-200 rounded-full mb-8">
        <div
          className="h-full bg-blue-600 rounded-full transition-all"
          style={{ width: `${((currentIndex + 1) / shuffledExpressions.length) * 100}%` }}
        />
      </div>

      {current && (
        <div className="bg-white rounded-xl shadow-lg p-8">
          {/* Georgian translation hint */}
          <div className="text-center mb-6">
            <span className="text-sm text-gray-500">ქართულად:</span>
            <p className="text-lg text-blue-600 font-medium">{current.georgian}</p>
          </div>

          {/* Expression pattern */}
          <div className="text-center mb-8">
            <p className="text-2xl font-medium text-gray-800">
              {current.pattern.split('___').map((part, i, arr) => (
                <span key={i}>
                  {part}
                  {i < arr.length - 1 && (
                    <span className="inline-block min-w-[80px] mx-1 border-b-2 border-blue-400">
                      {showResult ? (
                        <span className={isCorrect ? 'text-green-600' : 'text-red-600'}>
                          {current.answer}
                        </span>
                      ) : (
                        ''
                      )}
                    </span>
                  )}
                </span>
              ))}
            </p>
          </div>

          {/* Hint */}
          {showHint && !showResult && current.definition && (
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6 text-center">
              <p className="text-sm text-yellow-800">{current.definition}</p>
            </div>
          )}

          {/* Input */}
          {!showResult && (
            <div className="flex gap-3">
              <input
                type="text"
                value={userAnswer}
                onChange={(e) => setUserAnswer(e.target.value)}
                placeholder="შეავსე გამოტოვებული..."
                className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-center text-lg placeholder:text-gray-900"
                autoFocus
              />
              <button
                onClick={() => setShowHint(true)}
                disabled={showHint}
                className="px-4 py-3 bg-yellow-100 text-yellow-700 rounded-lg hover:bg-yellow-200 disabled:opacity-50 transition-colors"
                title="მინიშნება"
              >
                <Lightbulb className="w-5 h-5" />
              </button>
              <button
                onClick={checkAnswer}
                disabled={!userAnswer.trim()}
                className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors"
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

              {/* Full expression */}
              <p className="text-lg text-gray-700 mb-6">
                <strong>{current.english}</strong>
              </p>

              {/* Example if available */}
              {current.example && (
                <p className="text-sm text-gray-500 italic mb-6">"{current.example}"</p>
              )}

              <button
                onClick={nextExpression}
                className="flex items-center gap-2 mx-auto px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                {currentIndex < shuffledExpressions.length - 1 ? (
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
