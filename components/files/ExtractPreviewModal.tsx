'use client'

import { useState } from 'react'
import { X, Check, Trash2, Loader2, AlertCircle } from 'lucide-react'

interface ExtractedWordWithStatus {
  english: string
  georgian: string
  context?: string
  exists: boolean
}

interface ExtractPreviewModalProps {
  isOpen: boolean
  onClose: () => void
  fileName: string
  words: ExtractedWordWithStatus[]
  stats: {
    totalLines: number
    extractedCount: number
    skippedCount: number
    existingCount: number
    newCount: number
  }
  onSave: (words: ExtractedWordWithStatus[]) => Promise<void>
}

export function ExtractPreviewModal({
  isOpen,
  onClose,
  fileName,
  words: initialWords,
  stats,
  onSave,
}: ExtractPreviewModalProps) {
  const [words, setWords] = useState(initialWords)
  const [saving, setSaving] = useState(false)
  const [showExisting, setShowExisting] = useState(false)

  if (!isOpen) return null

  const filteredWords = showExisting ? words : words.filter((w) => !w.exists)
  const newWordsCount = words.filter((w) => !w.exists).length

  const handleRemoveWord = (english: string) => {
    setWords(words.filter((w) => w.english !== english))
  }

  const handleSave = async () => {
    setSaving(true)
    try {
      const wordsToSave = words.filter((w) => !w.exists)
      await onSave(wordsToSave)
      onClose()
    } catch (error) {
      console.error('Failed to save:', error)
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-xl w-full max-w-4xl max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b dark:border-gray-700">
          <div>
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
              ვოკაბულარის ამოღება
            </h2>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              {fileName}
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
          >
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        {/* Stats */}
        <div className="p-4 bg-gray-50 dark:bg-gray-900 border-b dark:border-gray-700">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-center">
            <div>
              <div className="text-2xl font-bold text-blue-600">
                {stats.extractedCount}
              </div>
              <div className="text-xs text-gray-500">ნაპოვნი</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-green-600">
                {newWordsCount}
              </div>
              <div className="text-xs text-gray-500">ახალი</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-amber-600">
                {stats.existingCount}
              </div>
              <div className="text-xs text-gray-500">უკვე არსებული</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-gray-400">
                {stats.skippedCount}
              </div>
              <div className="text-xs text-gray-500">გამოტოვებული</div>
            </div>
          </div>
        </div>

        {/* Filter toggle */}
        <div className="p-3 border-b dark:border-gray-700 flex items-center justify-between">
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={showExisting}
              onChange={(e) => setShowExisting(e.target.checked)}
              className="w-4 h-4 rounded border-gray-300"
            />
            <span className="text-sm text-gray-600 dark:text-gray-400">
              არსებულების ჩვენება ({stats.existingCount})
            </span>
          </label>
          <span className="text-sm text-gray-500">
            {filteredWords.length} სიტყვა
          </span>
        </div>

        {/* Words list */}
        <div className="flex-1 overflow-y-auto p-4">
          {filteredWords.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-gray-500">
              <AlertCircle className="w-12 h-12 mb-4 text-gray-300" />
              <p>ახალი სიტყვები არ მოიძებნა</p>
            </div>
          ) : (
            <div className="space-y-2">
              {filteredWords.map((word, index) => (
                <div
                  key={`${word.english}-${index}`}
                  className={`flex items-center gap-3 p-3 rounded-lg border transition-colors ${
                    word.exists
                      ? 'bg-amber-50 border-amber-200 dark:bg-amber-900/20 dark:border-amber-800'
                      : 'bg-white border-gray-200 dark:bg-gray-800 dark:border-gray-700'
                  }`}
                >
                  {/* Status indicator */}
                  <div
                    className={`w-2 h-2 rounded-full flex-shrink-0 ${
                      word.exists ? 'bg-amber-500' : 'bg-green-500'
                    }`}
                  />

                  {/* Word content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-baseline gap-2 flex-wrap">
                      <span className="font-medium text-gray-900 dark:text-white">
                        {word.english}
                      </span>
                      <span className="text-gray-400">→</span>
                      <span className="text-blue-600 dark:text-blue-400">
                        {word.georgian}
                      </span>
                    </div>
                    {word.context && (
                      <p className="text-xs text-gray-500 mt-1 truncate">
                        {word.context}
                      </p>
                    )}
                  </div>

                  {/* Existing badge */}
                  {word.exists && (
                    <span className="text-xs px-2 py-1 bg-amber-100 text-amber-700 dark:bg-amber-900 dark:text-amber-300 rounded">
                      არსებობს
                    </span>
                  )}

                  {/* Remove button */}
                  {!word.exists && (
                    <button
                      onClick={() => handleRemoveWord(word.english)}
                      className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded transition-colors"
                      title="წაშლა"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t dark:border-gray-700 flex items-center justify-between gap-4">
          <p className="text-sm text-gray-500">
            {newWordsCount > 0
              ? `${newWordsCount} ახალი სიტყვა დაემატება`
              : 'დასამატებელი სიტყვები არ არის'}
          </p>
          <div className="flex gap-3">
            <button
              onClick={onClose}
              className="px-4 py-2 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
            >
              გაუქმება
            </button>
            <button
              onClick={handleSave}
              disabled={saving || newWordsCount === 0}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center gap-2"
            >
              {saving ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  ინახება...
                </>
              ) : (
                <>
                  <Check className="w-4 h-4" />
                  დამატება ({newWordsCount})
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
