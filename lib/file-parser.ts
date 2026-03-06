export type SupportedMimeType =
  | 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
  | 'text/plain'

export const SUPPORTED_MIME_TYPES: SupportedMimeType[] = [
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'text/plain',
]

export const MAX_FILE_SIZE = 10 * 1024 * 1024 // 10MB

/**
 * Parse file content based on MIME type
 */
export async function parseFileContent(
  buffer: Buffer,
  mimeType: string
): Promise<string> {
  switch (mimeType) {
    case 'application/vnd.openxmlformats-officedocument.wordprocessingml.document':
      return parseDocx(buffer)

    case 'text/plain':
      return parseTxt(buffer)

    default:
      throw new Error(`Unsupported file type: ${mimeType}. Supported: DOCX, TXT`)
  }
}

/**
 * Parse Word document (.docx)
 */
async function parseDocx(buffer: Buffer): Promise<string> {
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const mammoth = require('mammoth')

  // Use convertToHtml to preserve paragraph structure
  const result = await mammoth.convertToHtml({ buffer })
  const html = result.value

  // Convert HTML to plain text with proper spacing
  let text = html
    // Replace paragraph and heading tags with double newlines
    .replace(/<\/p>/gi, '\n\n')
    .replace(/<\/h[1-6]>/gi, '\n\n')
    // Replace line breaks with single newline
    .replace(/<br\s*\/?>/gi, '\n')
    // Replace list items with newline and bullet
    .replace(/<li>/gi, '\n• ')
    .replace(/<\/li>/gi, '')
    // Remove all other HTML tags
    .replace(/<[^>]+>/g, '')
    // Decode HTML entities
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    // Clean up excessive newlines (more than 2)
    .replace(/\n{3,}/g, '\n\n')
    .trim()

  return text
}

/**
 * Parse plain text file
 */
function parseTxt(buffer: Buffer): Promise<string> {
  return Promise.resolve(buffer.toString('utf-8').trim())
}

/**
 * Validate file type
 */
export function isValidFileType(mimeType: string): mimeType is SupportedMimeType {
  return SUPPORTED_MIME_TYPES.includes(mimeType as SupportedMimeType)
}

/**
 * Validate file size
 */
export function isValidFileSize(size: number): boolean {
  return size <= MAX_FILE_SIZE
}

/**
 * Get file extension from MIME type
 */
export function getExtensionFromMimeType(mimeType: string): string {
  switch (mimeType) {
    case 'application/vnd.openxmlformats-officedocument.wordprocessingml.document':
      return 'docx'
    case 'text/plain':
      return 'txt'
    default:
      return 'unknown'
  }
}

/**
 * Extract sentence containing the selected text
 */
export function extractSentence(
  text: string,
  selectionStart: number,
  selectionEnd: number
): string {
  // Find sentence boundaries (., !, ?, newlines)
  const sentenceEnders = /[.!?\n]/g

  // Find the start of the sentence
  let sentenceStart = 0
  let match
  while ((match = sentenceEnders.exec(text)) !== null) {
    if (match.index < selectionStart) {
      sentenceStart = match.index + 1
    } else {
      break
    }
  }

  // Find the end of the sentence
  sentenceEnders.lastIndex = selectionEnd
  const endMatch = sentenceEnders.exec(text)
  const sentenceEnd = endMatch ? endMatch.index + 1 : text.length

  return text.slice(sentenceStart, sentenceEnd).trim()
}
