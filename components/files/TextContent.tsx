'use client'

import { useCallback, useMemo } from 'react'

interface TextContentProps {
  text: string
  learnedWords: string[]
  savedWords: string[]
  onTextSelect: (text: string, context: string) => void
}

export default function TextContent({
  text,
  learnedWords,
  savedWords,
  onTextSelect,
}: TextContentProps) {
  // Extract sentence containing the selected text
  const extractSentence = useCallback(
    (selectionStart: number, selectionEnd: number): string => {
      const sentenceEnders = /[.!?\n]/g
      let sentenceStart = 0
      let match

      // Find sentence start
      const textBeforeSelection = text.slice(0, selectionStart)
      const lastEnderIndex = Math.max(
        textBeforeSelection.lastIndexOf('.'),
        textBeforeSelection.lastIndexOf('!'),
        textBeforeSelection.lastIndexOf('?'),
        textBeforeSelection.lastIndexOf('\n')
      )
      sentenceStart = lastEnderIndex >= 0 ? lastEnderIndex + 1 : 0

      // Find sentence end
      sentenceEnders.lastIndex = selectionEnd
      match = sentenceEnders.exec(text)
      const sentenceEnd = match ? match.index + 1 : text.length

      return text.slice(sentenceStart, sentenceEnd).trim()
    },
    [text]
  )

  const handleMouseUp = useCallback(() => {
    const selection = window.getSelection()
    if (!selection || selection.isCollapsed) return

    const selectedText = selection.toString().trim()
    if (!selectedText || selectedText.length === 0) return

    // Get selection range
    const range = selection.getRangeAt(0)
    const preSelectionRange = range.cloneRange()
    const textContainer = document.getElementById('text-content')

    if (!textContainer) return

    preSelectionRange.selectNodeContents(textContainer)
    preSelectionRange.setEnd(range.startContainer, range.startOffset)
    const selectionStart = preSelectionRange.toString().length
    const selectionEnd = selectionStart + selectedText.length

    // Extract context sentence
    const context = extractSentence(selectionStart, selectionEnd)

    // Clear selection
    selection.removeAllRanges()

    // Trigger callback
    onTextSelect(selectedText, context)
  }, [extractSentence, onTextSelect])

  // Highlight saved and learned words in text
  const highlightedContent = useMemo(() => {
    const allWords = [...learnedWords, ...savedWords]
    if (allWords.length === 0) {
      return <span>{text}</span>
    }

    // Create regex pattern for all marked words
    const pattern = new RegExp(
      `\\b(${allWords.map((w) => w.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')).join('|')})\\b`,
      'gi'
    )

    const parts = text.split(pattern)

    return parts.map((part, index) => {
      const isLearned = learnedWords.some(
        (w) => w.toLowerCase() === part.toLowerCase()
      )
      const isSaved = savedWords.some(
        (w) => w.toLowerCase() === part.toLowerCase()
      )

      if (isLearned) {
        return (
          <mark
            key={index}
            className="bg-green-200 text-green-800 rounded px-0.5"
            title="ნასწავლი"
          >
            {part}
          </mark>
        )
      }
      if (isSaved) {
        return (
          <mark
            key={index}
            className="bg-amber-200 text-amber-800 rounded px-0.5"
            title="შენახული"
          >
            {part}
          </mark>
        )
      }
      return <span key={index}>{part}</span>
    })
  }, [text, learnedWords, savedWords])

  return (
    <div className="max-w-3xl mx-auto">
      <div className="bg-white rounded-lg shadow-sm p-6">
        <div className="mb-4 text-sm text-gray-500">
          მონიშნე ტექსტი სიტყვის დასამატებლად
        </div>
        <div
          id="text-content"
          className="prose prose-gray max-w-none whitespace-pre-wrap leading-relaxed text-gray-800 select-text cursor-text"
          onMouseUp={handleMouseUp}
        >
          {highlightedContent}
        </div>
      </div>
    </div>
  )
}
