'use client'

import { useState, useRef } from 'react'
import { Upload, X, FileText, Loader2 } from 'lucide-react'

interface FileUploadProps {
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

const ACCEPTED_TYPES = [
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'text/plain',
]

const ACCEPTED_EXTENSIONS = '.docx,.txt'

export default function FileUpload({ onSuccess, onCancel }: FileUploadProps) {
  const [dragActive, setDragActive] = useState(false)
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true)
    } else if (e.type === 'dragleave') {
      setDragActive(false)
    }
  }

  const validateFile = (file: File): string | null => {
    if (!ACCEPTED_TYPES.includes(file.type)) {
      return 'არასწორი ფაილის ტიპი. მხარდაჭერილია: DOCX, TXT'
    }
    if (file.size > 10 * 1024 * 1024) {
      return 'ფაილი ძალიან დიდია. მაქსიმუმ 10MB'
    }
    return null
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setDragActive(false)
    setError(null)

    const file = e.dataTransfer.files?.[0]
    if (file) {
      const validationError = validateFile(file)
      if (validationError) {
        setError(validationError)
        return
      }
      setSelectedFile(file)
    }
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setError(null)
    const file = e.target.files?.[0]
    if (file) {
      const validationError = validateFile(file)
      if (validationError) {
        setError(validationError)
        return
      }
      setSelectedFile(file)
    }
  }

  const handleUpload = async () => {
    if (!selectedFile) return

    setUploading(true)
    setError(null)

    try {
      const formData = new FormData()
      formData.append('file', selectedFile)

      const res = await fetch('/api/files/upload', {
        method: 'POST',
        body: formData,
      })

      const data = await res.json()

      if (!res.ok) {
        throw new Error(data.error || 'ატვირთვა ვერ მოხერხდა')
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
      setUploading(false)
    }
  }

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-6">
      {/* Drag & Drop Zone */}
      {!selectedFile && (
        <div
          className={`
            border-2 border-dashed rounded-lg p-8 text-center transition-colors
            ${dragActive ? 'border-blue-500 bg-blue-50' : 'border-gray-300'}
          `}
          onDragEnter={handleDrag}
          onDragLeave={handleDrag}
          onDragOver={handleDrag}
          onDrop={handleDrop}
        >
          <Upload
            size={48}
            className={`mx-auto mb-4 ${dragActive ? 'text-blue-500' : 'text-gray-400'}`}
          />
          <p className="text-gray-600 mb-2">
            ჩააგდე ფაილი აქ ან{' '}
            <button
              type="button"
              onClick={() => inputRef.current?.click()}
              className="text-blue-600 hover:underline"
            >
              აირჩიე
            </button>
          </p>
          <p className="text-sm text-gray-500">
            DOCX, TXT (მაქს. 10MB)
          </p>
          <input
            ref={inputRef}
            type="file"
            accept={ACCEPTED_EXTENSIONS}
            onChange={handleChange}
            className="hidden"
          />
        </div>
      )}

      {/* Selected File */}
      {selectedFile && (
        <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
          <div className="flex items-center gap-3">
            <FileText size={24} className="text-blue-600" />
            <div>
              <p className="font-medium text-gray-900">{selectedFile.name}</p>
              <p className="text-sm text-gray-500">
                {(selectedFile.size / 1024).toFixed(1)} KB
              </p>
            </div>
          </div>
          <button
            onClick={() => setSelectedFile(null)}
            className="p-1 text-gray-400 hover:text-gray-600"
          >
            <X size={20} />
          </button>
        </div>
      )}

      {/* Error */}
      {error && (
        <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-600 text-sm">
          {error}
        </div>
      )}

      {/* Actions */}
      <div className="mt-4 flex gap-3 justify-end">
        <button
          onClick={onCancel}
          disabled={uploading}
          className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors disabled:opacity-50"
        >
          გაუქმება
        </button>
        <button
          onClick={handleUpload}
          disabled={!selectedFile || uploading}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
        >
          {uploading && <Loader2 size={18} className="animate-spin" />}
          {uploading ? 'იტვირთება...' : 'ატვირთვა'}
        </button>
      </div>
    </div>
  )
}
