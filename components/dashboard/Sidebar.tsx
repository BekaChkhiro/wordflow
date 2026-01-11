'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  Home,
  BookOpen,
  Trophy,
  Users,
  User,
  Settings,
  AlertCircle,
  LogOut,
} from 'lucide-react'
import { signOut } from 'next-auth/react'

const menuItems = [
  { href: '/dashboard', label: 'მთავარი', icon: Home },
  { href: '/courses', label: 'კურსები', icon: BookOpen },
  { href: '/achievements', label: 'მიღწევები', icon: Trophy },
  { href: '/leaderboard', label: 'რეიტინგი', icon: Users },
  { href: '/mistakes', label: 'შეცდომები', icon: AlertCircle },
  { href: '/profile', label: 'პროფილი', icon: User },
  { href: '/settings', label: 'პარამეტრები', icon: Settings },
]

export default function Sidebar() {
  const pathname = usePathname()

  return (
    <aside className="w-64 bg-white border-r border-gray-200 h-full flex flex-col flex-shrink-0">
      <div className="p-6">
        <Link href="/dashboard" className="text-2xl font-bold text-blue-600">
          WordFlow
        </Link>
      </div>

      <nav className="flex-1 px-4">
        <ul className="space-y-1">
          {menuItems.map((item) => {
            const isActive = pathname === item.href
            const Icon = item.icon

            return (
              <li key={item.href}>
                <Link
                  href={item.href}
                  className={`
                    flex items-center gap-3 px-4 py-3 rounded-lg transition-colors
                    ${isActive
                      ? 'bg-blue-50 text-blue-600'
                      : 'text-gray-600 hover:bg-gray-50'
                    }
                  `}
                >
                  <Icon size={20} />
                  <span className="font-medium">{item.label}</span>
                </Link>
              </li>
            )
          })}
        </ul>
      </nav>

      <div className="p-4 border-t border-gray-200">
        <button
          onClick={() => signOut({ callbackUrl: '/login' })}
          className="flex items-center gap-3 px-4 py-3 w-full text-gray-600 hover:bg-gray-50 rounded-lg transition-colors"
        >
          <LogOut size={20} />
          <span className="font-medium">გასვლა</span>
        </button>
      </div>
    </aside>
  )
}
