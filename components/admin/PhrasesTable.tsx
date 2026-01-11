'use client'

import { useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { Search, ChevronLeft, ChevronRight, Plus, Pencil, Trash2, X, Save } from 'lucide-react'
import Button from '@/components/ui/Button'
import Input from '@/components/ui/Input'
import toast from 'react-hot-toast'

interface Phrase {
  id: number
  english: string
  georgian: string
  level: string
  category: string
}

interface PhrasesTableProps {
  phrases: Phrase[]
  totalPages: number
  currentPage: number
  categories: string[]
  filters: {
    level?: string
    category?: string
    search?: string
  }
}

const levels = ['A1', 'A2', 'B1', 'B2', 'C1', 'C2']

export default function PhrasesTable({
  phrases,
  totalPages,
  currentPage,
  categories,
  filters,
}: PhrasesTableProps) {
  const router = useRouter()
  const searchParams = useSearchParams()

  const [search, setSearch] = useState(filters.search || '')
  const [editingId, setEditingId] = useState<number | null>(null)
  const [editForm, setEditForm] = useState<Partial<Phrase>>({})
  const [showAddModal, setShowAddModal] = useState(false)
  const [newPhrase, setNewPhrase] = useState({
    english: '',
    georgian: '',
    level: 'A1',
    category: '',
  })

  const updateFilters = (updates: Record<string, string | undefined>) => {
    const params = new URLSearchParams(searchParams.toString())
    Object.entries(updates).forEach(([key, value]) => {
      if (value) {
        params.set(key, value)
      } else {
        params.delete(key)
      }
    })
    params.set('page', '1')
    router.push(`/admin/phrases?${params.toString()}`)
  }

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    updateFilters({ search: search || undefined })
  }

  const handlePageChange = (page: number) => {
    const params = new URLSearchParams(searchParams.toString())
    params.set('page', page.toString())
    router.push(`/admin/phrases?${params.toString()}`)
  }

  const startEdit = (phrase: Phrase) => {
    setEditingId(phrase.id)
    setEditForm(phrase)
  }

  const cancelEdit = () => {
    setEditingId(null)
    setEditForm({})
  }

  const saveEdit = async () => {
    try {
      const res = await fetch(`/api/admin/phrases/${editingId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(editForm),
      })

      if (!res.ok) throw new Error('Failed to update')

      toast.success('ფრაზა განახლდა')
      setEditingId(null)
      router.refresh()
    } catch {
      toast.error('შეცდომა განახლებისას')
    }
  }

  const deletePhrase = async (id: number) => {
    if (!confirm('დარწმუნებული ხარ რომ გინდა წაშლა?')) return

    try {
      const res = await fetch(`/api/admin/phrases/${id}`, {
        method: 'DELETE',
      })

      if (!res.ok) throw new Error('Failed to delete')

      toast.success('ფრაზა წაიშალა')
      router.refresh()
    } catch {
      toast.error('შეცდომა წაშლისას')
    }
  }

  const addPhrase = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      const res = await fetch('/api/admin/phrases', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newPhrase),
      })

      if (!res.ok) throw new Error('Failed to add')

      toast.success('ფრაზა დაემატა')
      setShowAddModal(false)
      setNewPhrase({ english: '', georgian: '', level: 'A1', category: '' })
      router.refresh()
    } catch {
      toast.error('შეცდომა დამატებისას')
    }
  }

  return (
    <div className="space-y-4">
      {/* Filters */}
      <div className="bg-white rounded-xl p-4 shadow-sm flex flex-wrap gap-4">
        <form onSubmit={handleSearch} className="flex-1 min-w-[200px]">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="ძიება..."
              className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:border-blue-500 text-gray-900"
            />
          </div>
        </form>

        <select
          value={filters.level || ''}
          onChange={(e) => updateFilters({ level: e.target.value || undefined })}
          className="px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:border-blue-500 text-gray-900"
        >
          <option value="">ყველა დონე</option>
          {levels.map((l) => (
            <option key={l} value={l}>{l}</option>
          ))}
        </select>

        <select
          value={filters.category || ''}
          onChange={(e) => updateFilters({ category: e.target.value || undefined })}
          className="px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:border-blue-500 text-gray-900"
        >
          <option value="">ყველა კატეგორია</option>
          {categories.map((c) => (
            <option key={c} value={c}>{c}</option>
          ))}
        </select>

        <Button onClick={() => setShowAddModal(true)}>
          <Plus size={18} className="mr-2" />
          დამატება
        </Button>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl shadow-sm overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              <th className="px-4 py-3 text-left text-sm font-medium text-gray-600">ID</th>
              <th className="px-4 py-3 text-left text-sm font-medium text-gray-600">English</th>
              <th className="px-4 py-3 text-left text-sm font-medium text-gray-600">ქართული</th>
              <th className="px-4 py-3 text-left text-sm font-medium text-gray-600">დონე</th>
              <th className="px-4 py-3 text-left text-sm font-medium text-gray-600">კატეგორია</th>
              <th className="px-4 py-3 text-right text-sm font-medium text-gray-600">მოქმედება</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {phrases.map((phrase) => (
              <tr key={phrase.id} className="hover:bg-gray-50">
                {editingId === phrase.id ? (
                  <>
                    <td className="px-4 py-3 text-sm text-gray-500">{phrase.id}</td>
                    <td className="px-4 py-3">
                      <input
                        type="text"
                        value={editForm.english || ''}
                        onChange={(e) => setEditForm({ ...editForm, english: e.target.value })}
                        className="w-full px-2 py-1 border rounded text-gray-900"
                      />
                    </td>
                    <td className="px-4 py-3">
                      <input
                        type="text"
                        value={editForm.georgian || ''}
                        onChange={(e) => setEditForm({ ...editForm, georgian: e.target.value })}
                        className="w-full px-2 py-1 border rounded text-gray-900"
                      />
                    </td>
                    <td className="px-4 py-3">
                      <select
                        value={editForm.level || ''}
                        onChange={(e) => setEditForm({ ...editForm, level: e.target.value })}
                        className="px-2 py-1 border rounded text-gray-900"
                      >
                        {levels.map((l) => (
                          <option key={l} value={l}>{l}</option>
                        ))}
                      </select>
                    </td>
                    <td className="px-4 py-3">
                      <input
                        type="text"
                        value={editForm.category || ''}
                        onChange={(e) => setEditForm({ ...editForm, category: e.target.value })}
                        className="w-full px-2 py-1 border rounded text-gray-900"
                      />
                    </td>
                    <td className="px-4 py-3 text-right">
                      <button onClick={saveEdit} className="text-green-600 hover:text-green-800 mr-2">
                        <Save size={18} />
                      </button>
                      <button onClick={cancelEdit} className="text-gray-600 hover:text-gray-800">
                        <X size={18} />
                      </button>
                    </td>
                  </>
                ) : (
                  <>
                    <td className="px-4 py-3 text-sm text-gray-500">{phrase.id}</td>
                    <td className="px-4 py-3 text-sm text-gray-900">{phrase.english}</td>
                    <td className="px-4 py-3 text-sm text-gray-900">{phrase.georgian}</td>
                    <td className="px-4 py-3">
                      <span className="px-2 py-1 text-xs font-medium bg-blue-100 text-blue-700 rounded">
                        {phrase.level}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-600">{phrase.category}</td>
                    <td className="px-4 py-3 text-right">
                      <button onClick={() => startEdit(phrase)} className="text-blue-600 hover:text-blue-800 mr-2">
                        <Pencil size={18} />
                      </button>
                      <button onClick={() => deletePhrase(phrase.id)} className="text-red-600 hover:text-red-800">
                        <Trash2 size={18} />
                      </button>
                    </td>
                  </>
                )}
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

      {/* Add Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 w-full max-w-md">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-bold text-gray-900">ახალი ფრაზა</h2>
              <button onClick={() => setShowAddModal(false)} className="text-gray-400 hover:text-gray-600">
                <X size={24} />
              </button>
            </div>
            <form onSubmit={addPhrase} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">English</label>
                <Input
                  type="text"
                  value={newPhrase.english}
                  onChange={(e) => setNewPhrase({ ...newPhrase, english: e.target.value })}
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">ქართული</label>
                <Input
                  type="text"
                  value={newPhrase.georgian}
                  onChange={(e) => setNewPhrase({ ...newPhrase, georgian: e.target.value })}
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">დონე</label>
                <select
                  value={newPhrase.level}
                  onChange={(e) => setNewPhrase({ ...newPhrase, level: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-200 rounded-lg text-gray-900"
                >
                  {levels.map((l) => (
                    <option key={l} value={l}>{l}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">კატეგორია</label>
                <Input
                  type="text"
                  value={newPhrase.category}
                  onChange={(e) => setNewPhrase({ ...newPhrase, category: e.target.value })}
                  required
                  list="categories"
                />
                <datalist id="categories">
                  {categories.map((c) => (
                    <option key={c} value={c} />
                  ))}
                </datalist>
              </div>
              <div className="flex gap-3">
                <Button type="button" variant="outline" onClick={() => setShowAddModal(false)} className="flex-1">
                  გაუქმება
                </Button>
                <Button type="submit" className="flex-1">
                  დამატება
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
