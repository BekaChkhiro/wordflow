'use client'

import { useState } from 'react'
import { FileText, Loader2, X } from 'lucide-react'

interface TextEditorProps {
  onSuccess: (file: {
    id: string
    name: string
    mimeType: string
    size: number
    createdAt: string
    totalWords: number
    learnedWords: number
    progress: number
  }) => void
  onCancel: () => void
}

export default function TextEditor({ onSuccess, onCancel }: TextEditorProps) {
  const [name, setName] = useState('')
  const [textContent, setTextContent] = useState('')
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleSave = async () => {
    if (!name.trim() || !textContent.trim()) return

    setSaving(true)
    setError(null)

    try {
      const res = await fetch('/api/files/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: name.trim(),
          textContent: textContent.trim(),
        }),
      })

      const data = await res.json()

      if (!res.ok) {
        throw new Error(data.error || 'შენახვა ვერ მოხერხდა')
      }

      onSuccess({
        ...data.file,
        createdAt: data.file.createdAt,
        totalWords: 0,
        learnedWords: 0,
        progress: 0,
      })
    } catch (err) {
      setError(err instanceof Error ? err.message : 'შეცდომა მოხდა')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-6">
      {/* Document Name */}
      <div className="mb-4">
        <label
          htmlFor="doc-name"
          className="block text-sm font-medium text-gray-700 mb-1"
        >
          დოკუმენტის სახელი
        </label>
        <input
          id="doc-name"
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="მაგ: Chapter 1 - Introduction"
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900"
        />
      </div>

      {/* Text Content */}
      <div className="mb-4">
        <label
          htmlFor="doc-content"
          className="block text-sm font-medium text-gray-700 mb-1"
        >
          ტექსტი
        </label>
        <textarea
          id="doc-content"
          value={textContent}
          onChange={(e) => setTextContent(e.target.value)}
          placeholder="ჩაწერე ან ჩასვი ინგლისური ტექსტი აქ..."
          rows={12}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-y text-gray-900 leading-relaxed"
        />
        <p className="text-sm text-gray-500 mt-1">
          {textContent.length > 0
            ? `${textContent.trim().split(/\s+/).filter(Boolean).length} სიტყვა`
            : 'ჩაწერე ან ჩაპეისტე ტექსტი'}
        </p>
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
          onClick={onCancel}
          disabled={saving}
          className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors disabled:opacity-50"
        >
          გაუქმება
        </button>
        <button
          onClick={handleSave}
          disabled={!name.trim() || !textContent.trim() || saving}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
        >
          {saving && <Loader2 size={18} className="animate-spin" />}
          {saving ? 'ინახება...' : 'შენახვა'}
        </button>
      </div>
    </div>
  )
}
