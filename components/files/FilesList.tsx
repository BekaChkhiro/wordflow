'use client'

import { useState } from 'react'
import Link from 'next/link'
import { FileText, Trash2, BookOpen, Upload, File } from 'lucide-react'
import FileUpload from './FileUpload'

interface FileItem {
  id: string
  name: string
  mimeType: string
  size: number
  createdAt: string
  totalWords: number
  learnedWords: number
  progress: number
}

interface FilesListProps {
  initialFiles: FileItem[]
}

export default function FilesList({ initialFiles }: FilesListProps) {
  const [files, setFiles] = useState<FileItem[]>(initialFiles)
  const [showUpload, setShowUpload] = useState(false)
  const [deleting, setDeleting] = useState<string | null>(null)

  const handleUploadSuccess = (newFile: FileItem) => {
    setFiles((prev) => [newFile, ...prev])
    setShowUpload(false)
  }

  const handleDelete = async (fileId: string) => {
    if (!confirm('დარწმუნებული ხარ რომ გინდა ფაილის წაშლა?')) return

    setDeleting(fileId)
    try {
      const res = await fetch(`/api/files?fileId=${fileId}`, {
        method: 'DELETE',
      })

      if (res.ok) {
        setFiles((prev) => prev.filter((f) => f.id !== fileId))
      } else {
        alert('ფაილის წაშლა ვერ მოხერხდა')
      }
    } catch {
      alert('შეცდომა მოხდა')
    } finally {
      setDeleting(null)
    }
  }

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
  }

  const getFileIcon = (mimeType: string) => {
    if (mimeType === 'application/pdf') return '📄'
    if (mimeType.includes('wordprocessingml')) return '📝'
    return '📃'
  }

  return (
    <div>
      {/* Upload Button */}
      <div className="mb-6">
        <button
          onClick={() => setShowUpload(!showUpload)}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          <Upload size={20} />
          ფაილის ატვირთვა
        </button>
      </div>

      {/* Upload Component */}
      {showUpload && (
        <div className="mb-6">
          <FileUpload
            onSuccess={handleUploadSuccess}
            onCancel={() => setShowUpload(false)}
          />
        </div>
      )}

      {/* Files Grid */}
      {files.length === 0 ? (
        <div className="text-center py-12 bg-gray-50 rounded-lg">
          <File size={48} className="mx-auto text-gray-400 mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            ჯერ არ გაქვს ატვირთული ფაილი
          </h3>
          <p className="text-gray-600 mb-4">
            ატვირთე PDF, Word ან TXT ფაილი სწავლის დასაწყებად
          </p>
          <button
            onClick={() => setShowUpload(true)}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            ფაილის ატვირთვა
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {files.map((file) => (
            <div
              key={file.id}
              className="bg-white rounded-lg border border-gray-200 p-4 hover:shadow-md transition-shadow"
            >
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-3">
                  <span className="text-2xl">{getFileIcon(file.mimeType)}</span>
                  <div>
                    <h3 className="font-medium text-gray-900 line-clamp-1">
                      {file.name}
                    </h3>
                    <p className="text-sm text-gray-500">
                      {formatFileSize(file.size)}
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => handleDelete(file.id)}
                  disabled={deleting === file.id}
                  className="p-1 text-gray-400 hover:text-red-500 transition-colors disabled:opacity-50"
                >
                  <Trash2 size={18} />
                </button>
              </div>

              {/* Progress */}
              <div className="mb-3">
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-gray-600">
                    {file.totalWords} სიტყვა
                  </span>
                  <span className="text-gray-600">
                    {file.learnedWords} ნასწავლი
                  </span>
                </div>
                <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-green-500 transition-all"
                    style={{ width: `${file.progress}%` }}
                  />
                </div>
              </div>

              {/* Actions */}
              <div className="flex gap-2">
                <Link
                  href={`/files/${file.id}`}
                  className="flex-1 flex items-center justify-center gap-2 px-3 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors text-sm"
                >
                  <FileText size={16} />
                  გახსნა
                </Link>
                {file.totalWords > 0 && (
                  <Link
                    href={`/files/${file.id}/learn`}
                    className="flex-1 flex items-center justify-center gap-2 px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm"
                  >
                    <BookOpen size={16} />
                    სწავლა
                  </Link>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
