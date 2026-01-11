'use client'

import { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Zap } from 'lucide-react'

interface XpGainAnimationProps {
  xp: number
  show: boolean
  onComplete?: () => void
}

export default function XpGainAnimation({ xp, show, onComplete }: XpGainAnimationProps) {
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    if (show && xp > 0) {
      setIsVisible(true)
      const timer = setTimeout(() => {
        setIsVisible(false)
        onComplete?.()
      }, 1500)
      return () => clearTimeout(timer)
    }
  }, [show, xp, onComplete])

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0, scale: 0.5, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.5, y: -20 }}
          className="fixed top-20 right-4 z-50"
        >
          <div className="bg-yellow-400 text-yellow-900 px-4 py-2 rounded-full font-bold flex items-center gap-2 shadow-lg">
            <Zap size={20} className="text-yellow-600" />
            <span>+{xp} XP</span>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
