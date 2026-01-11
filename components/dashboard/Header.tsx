'use client'

import { useSession } from 'next-auth/react'
import { Flame, Zap } from 'lucide-react'

interface HeaderProps {
  title?: string
}

export default function Header({ title = 'მთავარი' }: HeaderProps) {
  const { data: session } = useSession()

  return (
    <header className="bg-white border-b border-gray-200 px-6 py-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">{title}</h1>

        <div className="flex items-center gap-6">
          {/* Streak */}
          <div className="flex items-center gap-2 text-orange-500">
            <Flame size={24} fill="currentColor" />
            <span className="font-bold text-lg">0</span>
          </div>

          {/* XP */}
          <div className="flex items-center gap-2 text-yellow-500">
            <Zap size={24} fill="currentColor" />
            <span className="font-bold text-lg">0 XP</span>
          </div>

          {/* User Avatar */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
              {session?.user?.image ? (
                <img
                  src={session.user.image}
                  alt={session.user.name || 'User'}
                  className="w-10 h-10 rounded-full"
                />
              ) : (
                <span className="text-blue-600 font-bold">
                  {session?.user?.name?.[0]?.toUpperCase() || 'U'}
                </span>
              )}
            </div>
            <div className="hidden md:block">
              <p className="font-medium text-gray-900">{session?.user?.name || 'მომხმარებელი'}</p>
              <p className="text-sm text-gray-500">A1 დონე</p>
            </div>
          </div>
        </div>
      </div>
    </header>
  )
}
