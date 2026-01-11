'use client'

import { useState } from 'react'
import { Trash2, CheckCircle, Circle } from 'lucide-react'

interface Word {
  id: string
  english: string
  georgian: string
  context: string
  learned: boolean
  correctCount: number
  wrongCount: number
  createdAt: string
}

interface WordsSidebarProps {
  fileId: string
  words: Word[]
  onWordDeleted: (wordId: string) => void
}

export default function WordsSidebar({
  fileId,
  words,
  onWordDeleted,
}: WordsSidebarProps) {
  const [deleting, setDeleting] = useState<string | null>(null)

  const handleDelete = async (wordId: string) => {
    if (!confirm('დარწმუნებული ხარ რომ გინდა სიტყვის წაშლა?')) return

    setDeleting(wordId)
    try {
      const res = await fetch(`/api/files/${fileId}/words?wordId=${wordId}`, {
        method: 'DELETE',
      })

      if (res.ok) {
        onWordDeleted(wordId)
      } else {
        alert('სიტყვის წაშლა ვერ მოხერხდა')
      }
    } catch {
      alert('შეცდომა მოხდა')
    } finally {
      setDeleting(null)
    }
  }

  const learnedCount = words.filter((w) => w.learned).length
  const progress = words.length > 0 ? Math.round((learnedCount / words.length) * 100) : 0

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="p-4 border-b border-gray-200">
        <h2 className="font-semibold text-gray-900 mb-2">
          შენახული სიტყვები ({words.length})
        </h2>
        {words.length > 0 && (
          <div>
            <div className="flex justify-between text-xs text-gray-500 mb-1">
              <span>{learnedCount} ნასწავლი</span>
              <span>{progress}%</span>
            </div>
            <div className="h-1.5 bg-gray-200 rounded-full overflow-hidden">
              <div
                className="h-full bg-green-500 transition-all"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>
        )}
      </div>

      {/* Words List */}
      <div className="flex-1 overflow-auto">
        {words.length === 0 ? (
          <div className="p-4 text-center text-gray-500 text-sm">
            მონიშნე ტექსტი ფაილში სიტყვის დასამატებლად
          </div>
        ) : (
          <div className="divide-y divide-gray-100">
            {words.map((word) => (
              <div
                key={word.id}
                className={`p-3 hover:bg-gray-50 transition-colors ${
                  word.learned ? 'bg-green-50' : ''
                }`}
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-start gap-2 min-w-0">
                    {word.learned ? (
                      <CheckCircle
                        size={16}
                        className="text-green-500 mt-0.5 flex-shrink-0"
                      />
                    ) : (
                      <Circle
                        size={16}
                        className="text-gray-300 mt-0.5 flex-shrink-0"
                      />
                    )}
                    <div className="min-w-0">
                      <p className="font-medium text-gray-900 truncate">
                        {word.english}
                      </p>
                      <p className="text-sm text-gray-600 truncate">
                        {word.georgian}
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() => handleDelete(word.id)}
                    disabled={deleting === word.id}
                    className="p-1 text-gray-400 hover:text-red-500 transition-colors flex-shrink-0 disabled:opacity-50"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
                {word.context && (
                  <p className="mt-1 text-xs text-gray-400 line-clamp-2 ml-6">
                    "{word.context}"
                  </p>
                )}
                {(word.correctCount > 0 || word.wrongCount > 0) && (
                  <div className="mt-1 ml-6 text-xs text-gray-400">
                    <span className="text-green-600">{word.correctCount} სწორი</span>
                    {' / '}
                    <span className="text-red-600">{word.wrongCount} შეცდომა</span>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
