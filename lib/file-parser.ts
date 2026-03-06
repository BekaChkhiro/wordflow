export type SupportedMimeType =
  | 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' // .docx
  | 'application/msword' // .doc
  | 'application/pdf' // .pdf
  | 'application/rtf' // .rtf
  | 'text/rtf' // .rtf (alternative)
  | 'application/vnd.oasis.opendocument.text' // .odt
  | 'text/plain' // .txt

export const SUPPORTED_MIME_TYPES: SupportedMimeType[] = [
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'application/msword',
  'application/pdf',
  'application/rtf',
  'text/rtf',
  'application/vnd.oasis.opendocument.text',
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

    case 'application/msword':
      return parseDoc(buffer)

    case 'application/pdf':
      return parsePdf(buffer)

    case 'application/rtf':
    case 'text/rtf':
      return parseRtf(buffer)

    case 'application/vnd.oasis.opendocument.text':
      return parseOdt(buffer)

    case 'text/plain':
      return parseTxt(buffer)

    default:
      throw new Error(
        `Unsupported file type: ${mimeType}. Supported: DOCX, DOC, PDF, RTF, ODT, TXT`
      )
  }
}

/**
 * Parse Word document (.docx)
 */
async function parseDocx(buffer: Buffer): Promise<string> {
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const mammoth = require('mammoth')

  const result = await mammoth.convertToHtml({ buffer })
  return htmlToText(result.value)
}

/**
 * Parse old Word document (.doc)
 */
async function parseDoc(buffer: Buffer): Promise<string> {
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const WordExtractor = require('word-extractor')
  const extractor = new WordExtractor()

  const doc = await extractor.extract(buffer)
  const text = doc.getBody() || ''

  // Clean up and preserve paragraphs
  return text
    .replace(/\r\n/g, '\n')
    .replace(/\n{3,}/g, '\n\n')
    .trim()
}

/**
 * Parse PDF document
 */
async function parsePdf(buffer: Buffer): Promise<string> {
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const PDFParser = require('pdf2json')

  return new Promise((resolve, reject) => {
    const pdfParser = new PDFParser()

    pdfParser.on('pdfParser_dataError', (errData: { parserError: Error }) => {
      reject(errData.parserError)
    })

    pdfParser.on('pdfParser_dataReady', (pdfData: { Pages?: Array<{ Texts?: Array<{ R?: Array<{ T?: string }> }> }> }) => {
      let text = ''

      if (pdfData.Pages) {
        for (const page of pdfData.Pages) {
          if (page.Texts) {
            for (const textItem of page.Texts) {
              if (textItem.R) {
                for (const r of textItem.R) {
                  if (r.T) {
                    text += decodeURIComponent(r.T) + ' '
                  }
                }
              }
            }
          }
          text += '\n\n'
        }
      }

      // Clean up PDF text
      resolve(
        text
          .replace(/\r\n/g, '\n')
          .replace(/\n{3,}/g, '\n\n')
          .trim()
      )
    })

    pdfParser.parseBuffer(buffer)
  })
}

/**
 * Parse RTF document
 */
async function parseRtf(buffer: Buffer): Promise<string> {
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const rtfToHtml = require('@iarna/rtf-to-html')

  return new Promise((resolve, reject) => {
    rtfToHtml.fromString(buffer.toString('binary'), (err: Error, html: string) => {
      if (err) {
        // Fallback: try to extract text directly from RTF
        const text = extractTextFromRtf(buffer.toString('binary'))
        resolve(text)
        return
      }
      resolve(htmlToText(html))
    })
  })
}

/**
 * Fallback RTF text extraction
 */
function extractTextFromRtf(rtf: string): string {
  // Remove RTF control words and groups
  let text = rtf
    .replace(/\\par[d]?/g, '\n') // Paragraph breaks
    .replace(/\\'([0-9a-f]{2})/gi, (_, hex) => String.fromCharCode(parseInt(hex, 16)))
    .replace(/\\[a-z]+(-?\d+)?[ ]?/gi, '') // Control words
    .replace(/[{}]/g, '') // Braces
    .replace(/\n{3,}/g, '\n\n')
    .trim()

  return text
}

/**
 * Parse ODT document (OpenDocument Text)
 */
async function parseOdt(buffer: Buffer): Promise<string> {
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const AdmZip = require('adm-zip')

  const zip = new AdmZip(buffer)
  const contentXml = zip.readAsText('content.xml')

  if (!contentXml) {
    throw new Error('Invalid ODT file: content.xml not found')
  }

  // Extract text from ODT XML
  let text = contentXml
    // Replace paragraph tags with newlines
    .replace(/<text:p[^>]*>/gi, '')
    .replace(/<\/text:p>/gi, '\n\n')
    // Replace line breaks
    .replace(/<text:line-break\/>/gi, '\n')
    // Replace tabs and spaces
    .replace(/<text:tab\/>/gi, '\t')
    .replace(/<text:s[^>]*\/>/gi, ' ')
    // Remove all other XML tags
    .replace(/<[^>]+>/g, '')
    // Decode XML entities
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&amp;/g, '&')
    .replace(/&quot;/g, '"')
    .replace(/&apos;/g, "'")
    // Clean up
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
 * Convert HTML to plain text with proper spacing
 */
function htmlToText(html: string): string {
  return html
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
    case 'application/msword':
      return 'doc'
    case 'application/pdf':
      return 'pdf'
    case 'application/rtf':
    case 'text/rtf':
      return 'rtf'
    case 'application/vnd.oasis.opendocument.text':
      return 'odt'
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
