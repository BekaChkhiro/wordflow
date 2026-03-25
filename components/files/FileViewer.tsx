'use client'

import { useState, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, BookOpen, PenLine, Save, X, Loader2 } from 'lucide-react'
import TextContent from './TextContent'
import WordsSidebar from './WordsSidebar'
import AddWordModal from './AddWordModal'
import { ExtractVocabularyButton } from './ExtractVocabularyButton'

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

interface FileViewerProps {
  file: {
    id: string
    name: string
    textContent: string
    words: Word[]
  }
}

export default function FileViewer({ file }: FileViewerProps) {
  const router = useRouter()
  const [words, setWords] = useState<Word[]>(file.words)
  const [selectedText, setSelectedText] = useState<{
    text: string
    context: string
  } | null>(null)

  // Edit mode state
  const [isEditing, setIsEditing] = useState(false)
  const [editName, setEditName] = useState(file.name)
  const [editContent, setEditContent] = useState(file.textContent)
  const [currentName, setCurrentName] = useState(file.name)
  const [currentContent, setCurrentContent] = useState(file.textContent)
  const [saving, setSaving] = useState(false)
  const [saveError, setSaveError] = useState<string | null>(null)

  const handleTextSelect = (text: string, context: string) => {
    setSelectedText({ text, context })
  }

  const handleWordAdded = (newWord: Word) => {
    setWords((prev) => [...prev, newWord])
    setSelectedText(null)
  }

  const handleWordDeleted = (wordId: string) => {
    setWords((prev) => prev.filter((w) => w.id !== wordId))
  }

  // Fetch and update words when bulk extraction is done
  const handleWordsExtracted = useCallback(async () => {
    try {
      const response = await fetch(`/api/files/${file.id}`)
      if (response.ok) {
        const data = await response.json()
        setWords(data.file?.words || [])
      }
    } catch (error) {
      console.error('Failed to refresh words:', error)
      router.refresh()
    }
  }, [file.id, router])

  const handleStartEdit = () => {
    setEditName(currentName)
    setEditContent(currentContent)
    setIsEditing(true)
    setSaveError(null)
  }

  const handleCancelEdit = () => {
    setIsEditing(false)
    setSaveError(null)
  }

  const handleSaveEdit = async () => {
    if (!editName.trim() || !editContent.trim()) return

    setSaving(true)
    setSaveError(null)

    try {
      const res = await fetch(`/api/files/${file.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: editName.trim(),
          textContent: editContent.trim(),
        }),
      })

      const data = await res.json()

      if (!res.ok) {
        throw new Error(data.error || 'შენახვა ვერ მოხერხდა')
      }

      setCurrentName(data.file.name)
      setCurrentContent(data.file.textContent)
      setIsEditing(false)
    } catch (err) {
      setSaveError(err instanceof Error ? err.message : 'შეცდომა მოხდა')
    } finally {
      setSaving(false)
    }
  }

  const learnedWords = words.filter((w) => w.learned).map((w) => w.english)
  const savedWords = words.filter((w) => !w.learned).map((w) => w.english)

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 bg-white">
        <div className="flex items-center gap-4">
          <Link
            href="/files"
            className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <ArrowLeft size={20} />
          </Link>
          {isEditing ? (
            <input
              type="text"
              value={editName}
              onChange={(e) => setEditName(e.target.value)}
              className="text-lg font-semibold text-gray-900 border border-gray-300 rounded-lg px-3 py-1 focus:outline-none focus:ring-2 focus:ring-blue-500 max-w-md"
            />
          ) : (
            <h1 className="text-lg font-semibold text-gray-900 truncate max-w-md">
              {currentName}
            </h1>
          )}
        </div>
        <div className="flex items-center gap-3">
          {isEditing ? (
            <>
              {saveError && (
                <span className="text-sm text-red-500">{saveError}</span>
              )}
              <button
                onClick={handleCancelEdit}
                disabled={saving}
                className="flex items-center gap-2 px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors disabled:opacity-50"
              >
                <X size={18} />
                გაუქმება
              </button>
              <button
                onClick={handleSaveEdit}
                disabled={saving || !editName.trim() || !editContent.trim()}
                className="flex items-center gap-2 px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors disabled:opacity-50"
              >
                {saving ? <Loader2 size={18} className="animate-spin" /> : <Save size={18} />}
                {saving ? 'ინახება...' : 'შენახვა'}
              </button>
            </>
          ) : (
            <>
              {/* Edit Button */}
              <button
                onClick={handleStartEdit}
                className="flex items-center gap-2 px-4 py-2 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
              >
                <PenLine size={18} />
                რედაქტირება
              </button>

              {/* Extract Vocabulary Button */}
              <ExtractVocabularyButton
                fileId={file.id}
                onWordsAdded={handleWordsExtracted}
              />

              {/* Learn Button */}
              {words.length > 0 && (
                <Link
                  href={`/files/${file.id}/learn`}
                  className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  <BookOpen size={18} />
                  სწავლა ({words.length} სიტყვა)
                </Link>
              )}
            </>
          )}
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 flex overflow-hidden">
        {/* Text Content - Left Side */}
        <div className="flex-1 overflow-auto p-6 bg-gray-50">
          {isEditing ? (
            <div className="max-w-3xl mx-auto">
              <div className="bg-white rounded-lg shadow-sm p-6">
                <textarea
                  value={editContent}
                  onChange={(e) => setEditContent(e.target.value)}
                  className="w-full min-h-[500px] border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 resize-y text-gray-900 leading-relaxed"
                  placeholder="ჩაწერე ტექსტი..."
                />
                <p className="text-sm text-gray-500 mt-2">
                  {editContent.trim().split(/\s+/).filter(Boolean).length} სიტყვა
                </p>
              </div>
            </div>
          ) : (
            <TextContent
              text={currentContent}
              learnedWords={learnedWords}
              savedWords={savedWords}
              onTextSelect={handleTextSelect}
            />
          )}
        </div>

        {/* Words Sidebar - Right Side */}
        <div className="w-80 border-l border-gray-200 bg-white overflow-auto">
          <WordsSidebar
            fileId={file.id}
            words={words}
            onWordDeleted={handleWordDeleted}
          />
        </div>
      </div>

      {/* Add Word Modal */}
      {selectedText && (
        <AddWordModal
          fileId={file.id}
          selectedText={selectedText.text}
          context={selectedText.context}
          onClose={() => setSelectedText(null)}
          onWordAdded={handleWordAdded}
        />
      )}
    </div>
  )
}
