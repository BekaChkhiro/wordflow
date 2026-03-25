'use client'

import { useState, useCallback, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, BookOpen, PenLine, Save, X, Loader2, Check, Cloud } from 'lucide-react'
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

  // Auto-save state
  const [lastSaved, setLastSaved] = useState<Date | null>(null)
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false)
  const autoSaveTimer = useRef<NodeJS.Timeout | null>(null)
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  // Track unsaved changes
  useEffect(() => {
    if (isEditing) {
      const nameChanged = editName !== currentName
      const contentChanged = editContent !== currentContent
      setHasUnsavedChanges(nameChanged || contentChanged)
    }
  }, [editName, editContent, currentName, currentContent, isEditing])

  // Auto-save with debounce (2 seconds after last change)
  useEffect(() => {
    if (!isEditing || !hasUnsavedChanges) return
    if (!editName.trim() || !editContent.trim()) return

    if (autoSaveTimer.current) {
      clearTimeout(autoSaveTimer.current)
    }

    autoSaveTimer.current = setTimeout(() => {
      saveContent(false)
    }, 2000)

    return () => {
      if (autoSaveTimer.current) {
        clearTimeout(autoSaveTimer.current)
      }
    }
  }, [editName, editContent, isEditing, hasUnsavedChanges])

  // Keyboard shortcut: Cmd/Ctrl+S to save
  useEffect(() => {
    if (!isEditing) return

    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 's') {
        e.preventDefault()
        if (editName.trim() && editContent.trim()) {
          saveContent(false)
        }
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [isEditing, editName, editContent])

  // Warn before leaving with unsaved changes
  useEffect(() => {
    if (!isEditing || !hasUnsavedChanges) return

    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      e.preventDefault()
    }

    window.addEventListener('beforeunload', handleBeforeUnload)
    return () => window.removeEventListener('beforeunload', handleBeforeUnload)
  }, [isEditing, hasUnsavedChanges])

  // Auto-resize textarea
  useEffect(() => {
    const textarea = textareaRef.current
    if (!textarea || !isEditing) return

    const adjustHeight = () => {
      textarea.style.height = 'auto'
      textarea.style.height = `${Math.max(500, textarea.scrollHeight)}px`
    }

    adjustHeight()
  }, [editContent, isEditing])

  const saveContent = async (exitEditMode: boolean) => {
    if (!editName.trim() || !editContent.trim() || saving) return

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
      setHasUnsavedChanges(false)
      setLastSaved(new Date())

      if (exitEditMode) {
        setIsEditing(false)
      }
    } catch (err) {
      setSaveError(err instanceof Error ? err.message : 'შეცდომა მოხდა')
    } finally {
      setSaving(false)
    }
  }

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
    setHasUnsavedChanges(false)
    setLastSaved(null)
    setSaveError(null)
  }

  const handleCancelEdit = () => {
    if (hasUnsavedChanges) {
      if (!confirm('შეუნახავი ცვლილებები დაიკარგება. გინდა გაგრძელება?')) return
    }
    if (autoSaveTimer.current) {
      clearTimeout(autoSaveTimer.current)
    }
    setIsEditing(false)
    setSaveError(null)
    setHasUnsavedChanges(false)
  }

  const handleFinishEdit = () => {
    if (hasUnsavedChanges) {
      saveContent(true)
    } else {
      setIsEditing(false)
    }
  }

  const formatLastSaved = () => {
    if (!lastSaved) return null
    const seconds = Math.floor((Date.now() - lastSaved.getTime()) / 1000)
    if (seconds < 5) return 'ახლახანს შეინახა'
    if (seconds < 60) return `${seconds} წამის წინ`
    const minutes = Math.floor(seconds / 60)
    return `${minutes} წუთის წინ`
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
            onClick={(e) => {
              if (isEditing && hasUnsavedChanges) {
                if (!confirm('შეუნახავი ცვლილებები დაიკარგება. გინდა გაგრძელება?')) {
                  e.preventDefault()
                }
              }
            }}
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

          {/* Save status indicator */}
          {isEditing && (
            <div className="flex items-center gap-1.5 text-sm">
              {saving ? (
                <span className="flex items-center gap-1.5 text-blue-500">
                  <Loader2 size={14} className="animate-spin" />
                  ინახება...
                </span>
              ) : hasUnsavedChanges ? (
                <span className="flex items-center gap-1.5 text-amber-500">
                  <span className="w-2 h-2 rounded-full bg-amber-500" />
                  შეუნახავი
                </span>
              ) : lastSaved ? (
                <span className="flex items-center gap-1.5 text-green-500">
                  <Check size={14} />
                  {formatLastSaved()}
                </span>
              ) : null}
            </div>
          )}
        </div>
        <div className="flex items-center gap-3">
          {isEditing ? (
            <>
              {saveError && (
                <span className="text-sm text-red-500">{saveError}</span>
              )}
              <span className="text-xs text-gray-400 hidden sm:block">
                Ctrl+S შენახვა
              </span>
              <button
                onClick={handleCancelEdit}
                disabled={saving}
                className="flex items-center gap-2 px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors disabled:opacity-50"
              >
                <X size={18} />
                გაუქმება
              </button>
              <button
                onClick={handleFinishEdit}
                disabled={saving || !editName.trim() || !editContent.trim()}
                className="flex items-center gap-2 px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors disabled:opacity-50"
              >
                {saving ? <Loader2 size={18} className="animate-spin" /> : <Check size={18} />}
                {saving ? 'ინახება...' : 'დასრულება'}
              </button>
            </>
          ) : (
            <>
              <button
                onClick={handleStartEdit}
                className="flex items-center gap-2 px-4 py-2 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
              >
                <PenLine size={18} />
                რედაქტირება
              </button>

              <ExtractVocabularyButton
                fileId={file.id}
                onWordsAdded={handleWordsExtracted}
              />

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
                  ref={textareaRef}
                  value={editContent}
                  onChange={(e) => setEditContent(e.target.value)}
                  onKeyDown={(e) => {
                    // Tab support
                    if (e.key === 'Tab') {
                      e.preventDefault()
                      const start = e.currentTarget.selectionStart
                      const end = e.currentTarget.selectionEnd
                      const newValue = editContent.substring(0, start) + '  ' + editContent.substring(end)
                      setEditContent(newValue)
                      requestAnimationFrame(() => {
                        e.currentTarget.selectionStart = e.currentTarget.selectionEnd = start + 2
                      })
                    }
                  }}
                  className="w-full min-h-[500px] border-0 focus:outline-none focus:ring-0 resize-none text-gray-900 leading-relaxed text-base"
                  placeholder="ჩაწერე ტექსტი..."
                  style={{ overflow: 'hidden' }}
                />
                <div className="flex items-center justify-between pt-3 border-t border-gray-100 mt-3">
                  <p className="text-sm text-gray-400">
                    {editContent.trim().split(/\s+/).filter(Boolean).length} სიტყვა
                  </p>
                  <p className="text-xs text-gray-400">
                    ავტომატურად ინახება ცვლილებისას
                  </p>
                </div>
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
