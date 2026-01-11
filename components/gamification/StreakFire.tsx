'use client'

import { motion } from 'framer-motion'
import { Flame } from 'lucide-react'

interface StreakFireProps {
  streak: number
  size?: 'sm' | 'md' | 'lg'
}

export default function StreakFire({ streak, size = 'md' }: StreakFireProps) {
  const sizeClasses = {
    sm: 'w-8 h-8 text-xs',
    md: 'w-12 h-12 text-sm',
    lg: 'w-20 h-20 text-lg',
  }

  const iconSizes = {
    sm: 16,
    md: 24,
    lg: 40,
  }

  const isActive = streak > 0

  return (
    <div className="flex items-center gap-2">
      <motion.div
        animate={isActive ? { scale: [1, 1.1, 1] } : {}}
        transition={{ duration: 0.5, repeat: Infinity, repeatDelay: 1 }}
        className={`
          ${sizeClasses[size]}
          rounded-full flex items-center justify-center
          ${isActive ? 'bg-orange-100' : 'bg-gray-100'}
        `}
      >
        <Flame
          size={iconSizes[size]}
          className={isActive ? 'text-orange-500 fill-orange-500' : 'text-gray-400'}
        />
      </motion.div>
      <div>
        <p className={`font-bold ${isActive ? 'text-orange-600' : 'text-gray-400'} ${size === 'lg' ? 'text-2xl' : 'text-base'}`}>
          {streak}
        </p>
        <p className={`${isActive ? 'text-orange-500' : 'text-gray-400'} ${size === 'lg' ? 'text-sm' : 'text-xs'}`}>
          {streak === 1 ? 'დღე' : 'დღე'}
        </p>
      </div>
    </div>
  )
}
