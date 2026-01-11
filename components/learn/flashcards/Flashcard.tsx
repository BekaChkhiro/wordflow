'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { Volume2 } from 'lucide-react'

interface FlashcardProps {
  english: string
  georgian: string
  onFlip?: (isFlipped: boolean) => void
}

export default function Flashcard({ english, georgian, onFlip }: FlashcardProps) {
  const [isFlipped, setIsFlipped] = useState(false)

  const handleFlip = () => {
    setIsFlipped(!isFlipped)
    onFlip?.(!isFlipped)
  }

  const speak = (text: string, lang: string) => {
    if ('speechSynthesis' in window) {
      const utterance = new SpeechSynthesisUtterance(text)
      utterance.lang = lang
      speechSynthesis.speak(utterance)
    }
  }

  return (
    <div
      className="w-full max-w-md mx-auto perspective-1000 cursor-pointer"
      onClick={handleFlip}
    >
      <motion.div
        className="relative w-full h-64 preserve-3d"
        animate={{ rotateY: isFlipped ? 180 : 0 }}
        transition={{ duration: 0.6, type: 'spring', stiffness: 100 }}
        style={{ transformStyle: 'preserve-3d' }}
      >
        {/* Front - English */}
        <div
          className="absolute inset-0 w-full h-full backface-hidden"
          style={{ backfaceVisibility: 'hidden' }}
        >
          <div className="w-full h-full bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl shadow-xl flex flex-col items-center justify-center p-6">
            <p className="text-sm text-blue-200 mb-2">English</p>
            <p className="text-2xl md:text-3xl font-bold text-white text-center">
              {english}
            </p>
            <button
              onClick={(e) => {
                e.stopPropagation()
                speak(english, 'en-US')
              }}
              className="mt-4 p-2 bg-white/20 rounded-full hover:bg-white/30 transition-colors"
            >
              <Volume2 className="text-white" size={24} />
            </button>
            <p className="text-blue-200 text-sm mt-4">დააკლიკე გადასაბრუნებლად</p>
          </div>
        </div>

        {/* Back - Georgian */}
        <div
          className="absolute inset-0 w-full h-full backface-hidden"
          style={{ backfaceVisibility: 'hidden', transform: 'rotateY(180deg)' }}
        >
          <div className="w-full h-full bg-gradient-to-br from-purple-500 to-purple-600 rounded-2xl shadow-xl flex flex-col items-center justify-center p-6">
            <p className="text-sm text-purple-200 mb-2">ქართული</p>
            <p className="text-2xl md:text-3xl font-bold text-white text-center">
              {georgian}
            </p>
            <p className="text-purple-200 text-sm mt-4">დააკლიკე გადასაბრუნებლად</p>
          </div>
        </div>
      </motion.div>
    </div>
  )
}
