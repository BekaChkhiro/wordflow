'use client'

import { motion, AnimatePresence } from 'framer-motion'
import { Star, X } from 'lucide-react'
import Button from '@/components/ui/Button'

interface LevelUpModalProps {
  isOpen: boolean
  newLevel: string
  onClose: () => void
}

const levelColors: Record<string, string> = {
  A1: 'from-green-400 to-green-600',
  A2: 'from-blue-400 to-blue-600',
  B1: 'from-purple-400 to-purple-600',
  B2: 'from-orange-400 to-orange-600',
  C1: 'from-red-400 to-red-600',
  C2: 'from-yellow-400 to-yellow-600',
}

export default function LevelUpModal({ isOpen, newLevel, onClose }: LevelUpModalProps) {
  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
          onClick={onClose}
        >
          <motion.div
            initial={{ scale: 0.5, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.5, opacity: 0 }}
            transition={{ type: 'spring', duration: 0.5 }}
            className="bg-white rounded-2xl p-8 max-w-sm w-full text-center relative"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={onClose}
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-600"
            >
              <X size={24} />
            </button>

            {/* Stars animation */}
            <div className="relative">
              <motion.div
                initial={{ rotate: 0 }}
                animate={{ rotate: 360 }}
                transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
                className="absolute -top-8 left-1/2 -translate-x-1/2"
              >
                <Star className="text-yellow-400 fill-yellow-400" size={24} />
              </motion.div>
            </div>

            {/* Level badge */}
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.2, type: 'spring' }}
              className={`w-24 h-24 mx-auto rounded-full bg-gradient-to-br ${levelColors[newLevel] || 'from-gray-400 to-gray-600'} flex items-center justify-center mb-6`}
            >
              <span className="text-4xl font-bold text-white">{newLevel}</span>
            </motion.div>

            <motion.h2
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="text-2xl font-bold text-gray-900 mb-2"
            >
              გილოცავთ!
            </motion.h2>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="text-gray-600 mb-6"
            >
              შენ მიაღწიე <span className="font-bold text-gray-900">{newLevel}</span> დონეს!
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
            >
              <Button onClick={onClose} className="w-full">
                გაგრძელება
              </Button>
            </motion.div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
