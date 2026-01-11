'use client'

import Link from 'next/link'
import { Layers, HelpCircle, PenTool, GripHorizontal, Link2, Keyboard } from 'lucide-react'

const actions = [
  {
    href: '/learn/flashcards/A1',
    label: 'Flashcards',
    description: 'ბარათებით სწავლა',
    icon: Layers,
    color: 'bg-blue-500',
  },
  {
    href: '/learn/quiz/A1',
    label: 'Quiz',
    description: 'ტესტირება',
    icon: HelpCircle,
    color: 'bg-purple-500',
  },
  {
    href: '/learn/fill-blank/A1',
    label: 'Fill Blank',
    description: 'შეავსე გამოტოვებული',
    icon: PenTool,
    color: 'bg-green-500',
  },
  {
    href: '/learn/ordering/A1',
    label: 'Ordering',
    description: 'სიტყვების დალაგება',
    icon: GripHorizontal,
    color: 'bg-orange-500',
  },
  {
    href: '/learn/matching/A1',
    label: 'Matching',
    description: 'დაკავშირება',
    icon: Link2,
    color: 'bg-pink-500',
  },
  {
    href: '/learn/typing/A1',
    label: 'Typing',
    description: 'აკრეფა',
    icon: Keyboard,
    color: 'bg-teal-500',
  },
]

export default function QuickActions() {
  return (
    <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
      <h3 className="font-semibold text-gray-900 mb-4">სწრაფი დაწყება</h3>

      <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
        {actions.map((action) => {
          const Icon = action.icon

          return (
            <Link
              key={action.href}
              href={action.href}
              className="p-4 rounded-xl border border-gray-100 hover:border-gray-200 hover:bg-gray-50 transition-all group"
            >
              <div className={`w-10 h-10 ${action.color} rounded-lg flex items-center justify-center mb-2 group-hover:scale-110 transition-transform`}>
                <Icon className="text-white" size={20} />
              </div>
              <p className="font-medium text-gray-900">{action.label}</p>
              <p className="text-xs text-gray-500">{action.description}</p>
            </Link>
          )
        })}
      </div>
    </div>
  )
}
