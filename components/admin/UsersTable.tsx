'use client'

import { useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { Search, ChevronLeft, ChevronRight, Shield, ShieldOff, Zap, Flame } from 'lucide-react'
import toast from 'react-hot-toast'

interface User {
  id: string
  email: string | null
  name: string | null
  totalXp: number
  streak: number
  currentLevel: string
  isAdmin: boolean
  createdAt: Date
  lastActiveAt: Date | null
  _count: {
    progress: number
    mistakes: number
  }
}

interface UsersTableProps {
  users: User[]
  totalPages: number
  currentPage: number
  search?: string
}

export default function UsersTable({
  users,
  totalPages,
  currentPage,
  search: initialSearch,
}: UsersTableProps) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [search, setSearch] = useState(initialSearch || '')

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    const params = new URLSearchParams(searchParams.toString())
    if (search) {
      params.set('search', search)
    } else {
      params.delete('search')
    }
    params.set('page', '1')
    router.push(`/admin/users?${params.toString()}`)
  }

  const handlePageChange = (page: number) => {
    const params = new URLSearchParams(searchParams.toString())
    params.set('page', page.toString())
    router.push(`/admin/users?${params.toString()}`)
  }

  const toggleAdmin = async (userId: string, isCurrentlyAdmin: boolean) => {
    if (!confirm(isCurrentlyAdmin ? 'წაართვა ადმინის უფლება?' : 'მიანიჭო ადმინის უფლება?')) return

    try {
      const res = await fetch(`/api/admin/users/${userId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isAdmin: !isCurrentlyAdmin }),
      })

      if (!res.ok) throw new Error('Failed to update')

      toast.success(isCurrentlyAdmin ? 'ადმინის უფლება წაერთვა' : 'ადმინის უფლება მიენიჭა')
      router.refresh()
    } catch {
      toast.error('შეცდომა განახლებისას')
    }
  }

  const formatDate = (date: Date | null) => {
    if (!date) return '-'
    return new Date(date).toLocaleDateString('ka-GE', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    })
  }

  return (
    <div className="space-y-4">
      {/* Search */}
      <div className="bg-white rounded-xl p-4 shadow-sm">
        <form onSubmit={handleSearch} className="max-w-md">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="ძიება (ელ-ფოსტა ან სახელი)..."
              className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:border-blue-500 text-gray-900"
            />
          </div>
        </form>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl shadow-sm overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              <th className="px-4 py-3 text-left text-sm font-medium text-gray-600">მომხმარებელი</th>
              <th className="px-4 py-3 text-left text-sm font-medium text-gray-600">სტატისტიკა</th>
              <th className="px-4 py-3 text-left text-sm font-medium text-gray-600">პროგრესი</th>
              <th className="px-4 py-3 text-left text-sm font-medium text-gray-600">რეგისტრაცია</th>
              <th className="px-4 py-3 text-left text-sm font-medium text-gray-600">აქტივობა</th>
              <th className="px-4 py-3 text-right text-sm font-medium text-gray-600">ადმინი</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {users.map((user) => (
              <tr key={user.id} className="hover:bg-gray-50">
                <td className="px-4 py-3">
                  <div>
                    <p className="font-medium text-gray-900">
                      {user.name || user.email?.split('@')[0]}
                    </p>
                    <p className="text-sm text-gray-500">{user.email}</p>
                  </div>
                </td>
                <td className="px-4 py-3">
                  <div className="flex items-center gap-3">
                    <div className="flex items-center gap-1 text-yellow-600">
                      <Zap size={16} />
                      <span className="font-medium">{user.totalXp}</span>
                    </div>
                    <div className="flex items-center gap-1 text-orange-500">
                      <Flame size={16} />
                      <span className="font-medium">{user.streak}</span>
                    </div>
                    <span className="px-2 py-1 text-xs font-medium bg-blue-100 text-blue-700 rounded">
                      {user.currentLevel}
                    </span>
                  </div>
                </td>
                <td className="px-4 py-3">
                  <div className="text-sm">
                    <p className="text-green-600">{user._count.progress} ნასწავლი</p>
                    <p className="text-red-600">{user._count.mistakes} შეცდომა</p>
                  </div>
                </td>
                <td className="px-4 py-3 text-sm text-gray-600">
                  {formatDate(user.createdAt)}
                </td>
                <td className="px-4 py-3 text-sm text-gray-600">
                  {formatDate(user.lastActiveAt)}
                </td>
                <td className="px-4 py-3 text-right">
                  <button
                    onClick={() => toggleAdmin(user.id, user.isAdmin)}
                    className={`p-2 rounded-lg transition-colors ${
                      user.isAdmin
                        ? 'bg-blue-100 text-blue-600 hover:bg-blue-200'
                        : 'bg-gray-100 text-gray-400 hover:bg-gray-200'
                    }`}
                    title={user.isAdmin ? 'ადმინი' : 'არა ადმინი'}
                  >
                    {user.isAdmin ? <Shield size={18} /> : <ShieldOff size={18} />}
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-2">
          <button
            onClick={() => handlePageChange(currentPage - 1)}
            disabled={currentPage === 1}
            className="p-2 rounded-lg hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <ChevronLeft size={20} />
          </button>
          <span className="px-4 py-2 text-sm text-gray-600">
            {currentPage} / {totalPages}
          </span>
          <button
            onClick={() => handlePageChange(currentPage + 1)}
            disabled={currentPage === totalPages}
            className="p-2 rounded-lg hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <ChevronRight size={20} />
          </button>
        </div>
      )}
    </div>
  )
}
