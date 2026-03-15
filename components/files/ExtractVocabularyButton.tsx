'use client'

import { useState } from 'react'
import { Sparkles, Loader2 } from 'lucide-react'
import { ExtractPreviewModal } from './ExtractPreviewModal'

interface ExtractedWordWithStatus {
  english: string
  georgian: string
  context?: string
  exists: boolean
}

interface ExtractResponse {
  fileName: string
  words: ExtractedWordWithStatus[]
  stats: {
    totalLines: number
    extractedCount: number
    skippedCount: number
    existingCount: number
    newCount: number
  }
}

interface ExtractVocabularyButtonProps {
  fileId: string
  onWordsAdded?: () => void | Promise<void>
}

export function ExtractVocabularyButton({
  fileId,
  onWordsAdded,
}: ExtractVocabularyButtonProps) {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [modalOpen, setModalOpen] = useState(false)
  const [extractedData, setExtractedData] = useState<ExtractResponse | null>(
    null
  )

  const handleExtract = async () => {
    setLoading(true)
    setError(null)

    try {
      const response = await fetch(`/api/files/${fileId}/extract`)

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || 'Failed to extract vocabulary')
      }

      const data: ExtractResponse = await response.json()
      setExtractedData(data)
      setModalOpen(true)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error')
    } finally {
      setLoading(false)
    }
  }

  const handleSave = async (words: ExtractedWordWithStatus[]) => {
    const response = await fetch(`/api/files/${fileId}/extract`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        words: words.map(({ english, georgian, context }) => ({
          english,
          georgian,
          context,
        })),
        skipExisting: true,
      }),
    })

    if (!response.ok) {
      const data = await response.json()
      throw new Error(data.error || 'Failed to save words')
    }

    // Callback to refresh parent component - await if it's a promise
    if (onWordsAdded) {
      await onWordsAdded()
    }
  }

  return (
    <>
      <button
        onClick={handleExtract}
        disabled={loading}
        className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-lg hover:from-purple-700 hover:to-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-md hover:shadow-lg"
        title="ავტომატურად ამოიღე სიტყვები და თარგმანები ფაილიდან"
      >
        {loading ? (
          <>
            <Loader2 className="w-4 h-4 animate-spin" />
            <span>მიმდინარეობს...</span>
          </>
        ) : (
          <>
            <Sparkles className="w-4 h-4" />
            <span>სიტყვების ამოღება</span>
          </>
        )}
      </button>

      {error && (
        <p className="text-sm text-red-500 mt-2">{error}</p>
      )}

      {extractedData && (
        <ExtractPreviewModal
          isOpen={modalOpen}
          onClose={() => {
            setModalOpen(false)
            setExtractedData(null)
          }}
          fileName={extractedData.fileName}
          words={extractedData.words}
          stats={extractedData.stats}
          onSave={handleSave}
        />
      )}
    </>
  )
}
