'use client'

import { useState } from 'react'
import { X, Loader2 } from 'lucide-react'

interface AddWordModalProps {
  fileId: string
  selectedText: string
  context: string
  onClose: () => void
  onWordAdded: (word: {
    id: string
    english: string
    georgian: string
    context: string
    learned: boolean
    correctCount: number
    wrongCount: number
    createdAt: string
  }) => void
}

export default function AddWordModal({
  fileId,
  selectedText,
  context,
  onClose,
  onWordAdded,
}: AddWordModalProps) {
  const [georgian, setGeorgian] = useState('')
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!georgian.trim()) {
      setError('შეიყვანე თარგმანი')
      return
    }

    setSaving(true)
    setError(null)

    try {
      const res = await fetch(`/api/files/${fileId}/words`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          english: selectedText,
          georgian: georgian.trim(),
          context,
        }),
      })

      const data = await res.json()

      if (!res.ok) {
        throw new Error(data.error || 'შენახვა ვერ მოხერხდა')
      }

      onWordAdded({
        ...data.word,
        correctCount: 0,
        wrongCount: 0,
      })
    } catch (err) {
      setError(err instanceof Error ? err.message : 'შეცდომა მოხდა')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/50"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="relative bg-white rounded-lg shadow-xl w-full max-w-md mx-4">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">
            სიტყვის დამატება
          </h2>
          <button
            onClick={onClose}
            className="p-1 text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        {/* Content */}
        <form onSubmit={handleSubmit} className="p-6">
          {/* Selected Word */}
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              მონიშნული სიტყვა
            </label>
            <div className="px-3 py-2 bg-gray-100 rounded-lg text-gray-900 font-medium">
              {selectedText}
            </div>
          </div>

          {/* Context */}
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              კონტექსტი
            </label>
            <div className="px-3 py-2 bg-gray-50 rounded-lg text-gray-600 text-sm italic">
              "{context}"
            </div>
          </div>

          {/* Georgian Translation */}
          <div className="mb-4">
            <label
              htmlFor="georgian"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              ქართული თარგმანი
            </label>
            <input
              id="georgian"
              type="text"
              value={georgian}
              onChange={(e) => setGeorgian(e.target.value)}
              placeholder="შეიყვანე თარგმანი..."
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none text-gray-900 placeholder:text-gray-400"
              autoFocus
            />
          </div>

          {/* Error */}
          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-600 text-sm">
              {error}
            </div>
          )}

          {/* Actions */}
          <div className="flex gap-3 justify-end">
            <button
              type="button"
              onClick={onClose}
              disabled={saving}
              className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors disabled:opacity-50"
            >
              გაუქმება
            </button>
            <button
              type="submit"
              disabled={saving}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 flex items-center gap-2"
            >
              {saving && <Loader2 size={18} className="animate-spin" />}
              {saving ? 'ინახება...' : 'შენახვა'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
