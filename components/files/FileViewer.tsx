'use client'

import { useState } from 'react'
import Link from 'next/link'
import { ArrowLeft, BookOpen } from 'lucide-react'
import TextContent from './TextContent'
import WordsSidebar from './WordsSidebar'
import AddWordModal from './AddWordModal'

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
  const [words, setWords] = useState<Word[]>(file.words)
  const [selectedText, setSelectedText] = useState<{
    text: string
    context: string
  } | null>(null)

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
          <h1 className="text-lg font-semibold text-gray-900 truncate max-w-md">
            {file.name}
          </h1>
        </div>
        {words.length > 0 && (
          <Link
            href={`/files/${file.id}/learn`}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <BookOpen size={18} />
            სწავლა ({words.length} სიტყვა)
          </Link>
        )}
      </div>

      {/* Content */}
      <div className="flex-1 flex overflow-hidden">
        {/* Text Content - Left Side */}
        <div className="flex-1 overflow-auto p-6 bg-gray-50">
          <TextContent
            text={file.textContent}
            learnedWords={learnedWords}
            savedWords={savedWords}
            onTextSelect={handleTextSelect}
          />
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
