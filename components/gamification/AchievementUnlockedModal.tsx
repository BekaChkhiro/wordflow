'use client'

import { motion, AnimatePresence } from 'framer-motion'
import { Trophy, X, Star } from 'lucide-react'
import Button from '@/components/ui/Button'

interface Achievement {
  id: string
  name: string
  description: string
  icon: string
}

interface AchievementUnlockedModalProps {
  isOpen: boolean
  achievement: Achievement | null
  onClose: () => void
}

const iconMap: Record<string, React.ReactNode> = {
  '🏆': <Trophy className="text-yellow-500" size={40} />,
  '⭐': <Star className="text-yellow-500 fill-yellow-500" size={40} />,
  '🔥': <span className="text-4xl">🔥</span>,
  '📚': <span className="text-4xl">📚</span>,
  '🎯': <span className="text-4xl">🎯</span>,
  '💪': <span className="text-4xl">💪</span>,
  '🚀': <span className="text-4xl">🚀</span>,
  '💎': <span className="text-4xl">💎</span>,
  '👑': <span className="text-4xl">👑</span>,
  '🌟': <span className="text-4xl">🌟</span>,
}

export default function AchievementUnlockedModal({
  isOpen,
  achievement,
  onClose,
}: AchievementUnlockedModalProps) {
  if (!achievement) return null

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
            initial={{ scale: 0.5, opacity: 0, y: 50 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.5, opacity: 0, y: 50 }}
            transition={{ type: 'spring', duration: 0.5 }}
            className="bg-white rounded-2xl p-8 max-w-sm w-full text-center relative overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Background confetti effect */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
              {[...Array(20)].map((_, i) => (
                <motion.div
                  key={i}
                  initial={{
                    x: Math.random() * 300 - 150,
                    y: -20,
                    rotate: 0,
                  }}
                  animate={{
                    y: 400,
                    rotate: 360,
                  }}
                  transition={{
                    duration: 2 + Math.random() * 2,
                    delay: Math.random() * 0.5,
                    repeat: Infinity,
                    repeatDelay: 3,
                  }}
                  className={`absolute w-2 h-2 rounded-full ${
                    ['bg-yellow-400', 'bg-blue-400', 'bg-green-400', 'bg-pink-400'][i % 4]
                  }`}
                  style={{ left: `${Math.random() * 100}%` }}
                />
              ))}
            </div>

            <button
              onClick={onClose}
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 z-10"
            >
              <X size={24} />
            </button>

            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.2 }}
              className="text-sm font-medium text-yellow-600 mb-4"
            >
              მიღწევა განბლოკილია!
            </motion.p>

            {/* Achievement icon */}
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.3, type: 'spring' }}
              className="w-20 h-20 mx-auto bg-yellow-100 rounded-full flex items-center justify-center mb-4"
            >
              {iconMap[achievement.icon] || <span className="text-4xl">{achievement.icon}</span>}
            </motion.div>

            <motion.h2
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="text-xl font-bold text-gray-900 mb-2"
            >
              {achievement.name}
            </motion.h2>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
              className="text-gray-600 mb-6"
            >
              {achievement.description}
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6 }}
            >
              <Button onClick={onClose} className="w-full">
                გასაგებია
              </Button>
            </motion.div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
