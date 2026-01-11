'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { Check, X, RotateCcw, Trophy, RefreshCw } from 'lucide-react'
import Flashcard from './Flashcard'
import Button from '@/components/ui/Button'

interface Phrase {
  id: number
  english: string
  georgian: string
}

interface FlashcardDeckProps {
  phrases: Phrase[]
  level: string
  category: string
}

export default function FlashcardDeck({ phrases: initialPhrases, level, category }: FlashcardDeckProps) {
  const router = useRouter()

  // Current deck - cards that still need to be learned
  const [deck, setDeck] = useState<Phrase[]>([...initialPhrases])
  const [currentIndex, setCurrentIndex] = useState(0)

  // Stats
  const [knownOnFirstTry, setKnownOnFirstTry] = useState<number[]>([])
  const [totalKnown, setTotalKnown] = useState(0)
  const [totalUnknown, setTotalUnknown] = useState(0)
  const [roundNumber, setRoundNumber] = useState(1)

  const [isFlipped, setIsFlipped] = useState(false)
  const [isComplete, setIsComplete] = useState(false)
  const [xpEarned, setXpEarned] = useState(0)
  const [isRepeatRound, setIsRepeatRound] = useState(false)

  const currentCard = deck[currentIndex]
  const cardsRemaining = deck.length - currentIndex
  const totalOriginal = initialPhrases.length

  const handleKnow = async () => {
    // Track first-try success
    if (!isRepeatRound && !knownOnFirstTry.includes(currentCard.id)) {
      setKnownOnFirstTry((prev) => [...prev, currentCard.id])
    }
    setTotalKnown((prev) => prev + 1)

    // Update progress in database
    try {
      const res = await fetch('/api/progress/update', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          phraseId: currentCard.id,
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

    // Remove card from deck (known)
    const newDeck = deck.filter((_, i) => i !== currentIndex)

    if (newDeck.length === 0) {
      // All cards learned!
      setIsComplete(true)
    } else {
      setDeck(newDeck)
      // Adjust index if needed
      if (currentIndex >= newDeck.length) {
        setCurrentIndex(0)
        setRoundNumber((prev) => prev + 1)
        setIsRepeatRound(true)
      }
      setIsFlipped(false)
    }
  }

  const handleDontKnow = async () => {
    setTotalUnknown((prev) => prev + 1)

    // Record as wrong answer (only on first encounter)
    if (!isRepeatRound) {
      try {
        await fetch('/api/progress/update', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            phraseId: currentCard.id,
            correct: false,
            mistakeType: 'flashcard',
          }),
        })
      } catch (error) {
        console.error('Error updating progress:', error)
      }
    }

    // Move card to end of deck
    const cardToMove = deck[currentIndex]
    const newDeck = [...deck.filter((_, i) => i !== currentIndex), cardToMove]
    setDeck(newDeck)

    // Move to next card (or loop back)
    if (currentIndex >= newDeck.length - 1) {
      setCurrentIndex(0)
      setRoundNumber((prev) => prev + 1)
      setIsRepeatRound(true)
    }

    setIsFlipped(false)
  }

  const restart = () => {
    setDeck([...initialPhrases])
    setCurrentIndex(0)
    setKnownOnFirstTry([])
    setTotalKnown(0)
    setTotalUnknown(0)
    setRoundNumber(1)
    setIsComplete(false)
    setIsFlipped(false)
    setXpEarned(0)
    setIsRepeatRound(false)
  }

  if (isComplete) {
    const firstTryAccuracy = Math.round((knownOnFirstTry.length / totalOriginal) * 100)

    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="text-center py-12"
      >
        <div className="w-20 h-20 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-6">
          <Trophy className="text-yellow-500" size={40} />
        </div>

        <h2 className="text-2xl font-bold text-gray-900 mb-2">ყველა ბარათი ნასწავლია!</h2>
        <p className="text-gray-600 mb-6">შენ დაასრულე {totalOriginal} ბარათი</p>

        <div className="grid grid-cols-2 gap-4 max-w-sm mx-auto mb-6">
          <div className="bg-green-50 rounded-xl p-4">
            <p className="text-2xl font-bold text-green-600">{knownOnFirstTry.length}</p>
            <p className="text-sm text-green-600">პირველივე ცდით</p>
          </div>
          <div className="bg-orange-50 rounded-xl p-4">
            <p className="text-2xl font-bold text-orange-600">{totalOriginal - knownOnFirstTry.length}</p>
            <p className="text-sm text-orange-600">გამეორებით</p>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4 max-w-sm mx-auto mb-8">
          <div className="bg-blue-50 rounded-xl p-4">
            <p className="text-2xl font-bold text-blue-600">+{xpEarned}</p>
            <p className="text-sm text-blue-600">XP</p>
          </div>
          <div className="bg-purple-50 rounded-xl p-4">
            <p className="text-2xl font-bold text-purple-600">{roundNumber}</p>
            <p className="text-sm text-purple-600">რაუნდი</p>
          </div>
        </div>

        <div className="bg-gray-50 rounded-xl p-4 max-w-sm mx-auto mb-8">
          <p className="text-sm text-gray-500">პირველი ცდის სიზუსტე</p>
          <p className={`text-3xl font-bold ${firstTryAccuracy >= 80 ? 'text-green-600' : firstTryAccuracy >= 50 ? 'text-yellow-600' : 'text-orange-600'}`}>
            {firstTryAccuracy}%
          </p>
        </div>

        <div className="flex gap-4 justify-center">
          <Button variant="outline" onClick={restart}>
            <RotateCcw size={18} className="mr-2" />
            თავიდან
          </Button>
          <Button onClick={() => router.push(`/courses/${level}/${encodeURIComponent(category)}`)}>
            დასრულება
          </Button>
        </div>
      </motion.div>
    )
  }

  const progress = ((totalOriginal - deck.length) / totalOriginal) * 100

  return (
    <div className="space-y-6">
      {/* Progress */}
      <div className="space-y-2">
        <div className="flex justify-between text-sm text-gray-600">
          <span>
            {isRepeatRound && (
              <span className="inline-flex items-center gap-1 text-orange-600 mr-2">
                <RefreshCw size={14} />
                გამეორება
              </span>
            )}
            დარჩა: {cardsRemaining} ბარათი
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
        <div className="flex justify-between text-xs text-gray-400">
          <span>ნასწავლი: {totalOriginal - deck.length}/{totalOriginal}</span>
          <span>რაუნდი: {roundNumber}</span>
        </div>
      </div>

      {/* Card */}
      <AnimatePresence mode="wait">
        <motion.div
          key={`${currentCard.id}-${currentIndex}`}
          initial={{ opacity: 0, x: 50 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -50 }}
          transition={{ duration: 0.3 }}
        >
          <Flashcard
            english={currentCard.english}
            georgian={currentCard.georgian}
            onFlip={setIsFlipped}
          />
        </motion.div>
      </AnimatePresence>

      {/* Actions */}
      <div className="flex gap-4 justify-center pt-4">
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={handleDontKnow}
          className="flex items-center gap-2 px-6 py-3 bg-red-100 text-red-600 rounded-xl font-medium hover:bg-red-200 transition-colors"
        >
          <X size={20} />
          არ ვიცი
        </motion.button>
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={handleKnow}
          className="flex items-center gap-2 px-6 py-3 bg-green-100 text-green-600 rounded-xl font-medium hover:bg-green-200 transition-colors"
        >
          <Check size={20} />
          ვიცი
        </motion.button>
      </div>

      {/* Hint */}
      {!isFlipped && (
        <p className="text-center text-sm text-gray-400">
          დააკლიკე ბარათს თარგმანის სანახავად
        </p>
      )}
    </div>
  )
}
