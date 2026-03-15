/**
 * Vocabulary Parser - Extract English-Georgian word pairs from text
 * Supports various formats commonly found in vocabulary documents
 */

export interface ExtractedWord {
  english: string
  georgian: string
  context?: string
}

// Georgian Unicode range: \u10A0-\u10FF (ა-ჰ)
const GEORGIAN_REGEX = /[\u10A0-\u10FF]/

/**
 * Check if text contains Georgian characters
 */
function containsGeorgian(text: string): boolean {
  return GEORGIAN_REGEX.test(text)
}

/**
 * Extract the first Georgian phrase from text
 * Stops at English letters, numbers followed by ), or common ending patterns
 */
function extractGeorgianPhrase(text: string): string | null {
  // Find start of Georgian text
  const startMatch = text.match(/[\u10A0-\u10FF]/)
  if (!startMatch || startMatch.index === undefined) return null

  const startIdx = startMatch.index
  let endIdx = startIdx

  // Find where Georgian text ends
  // Stop when we encounter: Latin letters, digits, or certain punctuation patterns
  for (let i = startIdx; i < text.length; i++) {
    const char = text[i]
    const charCode = char.charCodeAt(0)

    // Georgian letter range
    if (charCode >= 0x10a0 && charCode <= 0x10ff) {
      endIdx = i + 1
      continue
    }

    // Allow these characters within Georgian text
    if (/[\s,;:.\-–()!?]/.test(char)) {
      // Check if next non-space char is Georgian
      const restOfText = text.slice(i + 1)
      const nextGeorgian = restOfText.match(/^\s*[\u10A0-\u10FF]/)
      if (nextGeorgian) {
        continue
      }
      // End of Georgian phrase
      break
    }

    // Latin letter or digit - stop
    if (/[A-Za-z0-9]/.test(char)) {
      break
    }
  }

  let georgian = text.slice(startIdx, endIdx).trim()

  // Clean up: remove trailing punctuation
  georgian = georgian.replace(/[,;:.!?\s\-–]+$/, '').trim()

  // Return null if too short or just punctuation
  if (georgian.length < 2) return null

  return georgian
}

/**
 * Clean and normalize English word/phrase
 */
function cleanEnglishWord(text: string): string {
  return text
    // Remove phonetic transcription [...] or (...)
    .replace(/\[[^\]]*\]/g, '')
    .replace(/\([^)]*\)/g, '')
    // Remove leading/trailing special chars
    .replace(/^[\s\-–=:*•→]+/, '')
    .replace(/[\s\-–=:*•→]+$/, '')
    // Remove trailing numbers or special markers
    .replace(/\s*\d+\s*$/, '')
    // Normalize whitespace
    .replace(/\s+/g, ' ')
    .trim()
    .toLowerCase()
}

/**
 * Check if English phrase is valid
 */
function isValidEnglishPhrase(text: string): boolean {
  // Too short or too long (max 50 chars for a word/phrase)
  if (text.length < 2 || text.length > 50) return false

  // Should start with a letter
  if (!/^[a-z]/i.test(text)) return false

  // Should not be mostly special characters
  const letterCount = (text.match(/[a-z]/gi) || []).length
  if (letterCount < text.length * 0.5) return false

  // Skip page references and headers
  if (/^(p\.|page|unit|book|workbook|text|key\s*words)/i.test(text)) return false

  // Skip names/proper nouns that look like places/people with dates or parentheses
  if (/^[A-Z][a-z]+\s+[A-Z]/.test(text) && /[\(\d]/.test(text)) return false

  // Skip sentences (contain too many words - more than 5)
  const wordCount = text.split(/\s+/).length
  if (wordCount > 5) return false

  // Skip if it looks like a sentence
  if (/[.?!]$/.test(text)) return false
  if (/\b(i|you|he|she|we|they)\s+(am|are|is|was|were|have|had|will|would|could|should|saw|see|think)\b/i.test(text)) return false

  // Skip incomplete phrases (ending with preposition/article or starting with them alone)
  if (/^(the|a|an|in|on|at|to|for|of|if|or)\s*$/i.test(text)) return false
  if (/\s(the|a|an|in|on|at|to|for|of|if)$/i.test(text)) return false

  // Skip entries that look like proper nouns with titles (Club, Athletic, etc.)
  if (/\b(club|athletic|william|james|john)\b/i.test(text) && wordCount > 2) return false

  return true
}

/**
 * Parse a single line and extract word pair if valid
 */
function parseLine(line: string): ExtractedWord | null {
  // Skip empty lines or page numbers
  if (!line.trim()) return null
  if (/^p\.\d+$/i.test(line.trim())) return null
  if (/^(BOOK|WORKBOOK|Unit|KEY WORDS|TEXT:|TED\s*TALK|\+\s*Listening)/i.test(line.trim())) return null

  // Skip lines without Georgian text
  if (!containsGeorgian(line)) return null

  // Try to find separator patterns
  // Pattern 1: "word [phonetic] ქართული..."
  // Pattern 2: "word - ქართული"
  // Pattern 3: "word – ქართული" (en-dash)
  // Pattern 4: "word = definition ქართული"

  let english = ''
  let georgian = ''
  let context = ''

  // Try different separator patterns
  const separators = [
    /^(\*{0,3}[^[\-–=*]+)\s*\[[^\]]+\]\s*(.+)$/,     // ***word [phonetic] rest
    /^(\*{0,3}[^–\-=*]+)\s*[–\-]\s*(.+)$/,           // word - rest or word – rest
    /^(\*{0,3}[^=*]+)\s*=\s*(.+)$/,                   // word = rest
    /^(\*{0,3}[A-Za-z][A-Za-z\s'']+)\s+(.+)$/,       // word(s) followed by anything with Georgian
  ]

  for (const pattern of separators) {
    const match = line.match(pattern)
    if (match) {
      const possibleEnglish = match[1].replace(/^\*+/, '').trim() // Remove leading asterisks
      const rest = match[2]

      // Check if rest contains Georgian
      if (containsGeorgian(rest)) {
        english = cleanEnglishWord(possibleEnglish)

        // Validate English phrase
        if (!isValidEnglishPhrase(english)) continue

        const extractedGeorgian = extractGeorgianPhrase(rest)

        if (extractedGeorgian) {
          georgian = extractedGeorgian

          // Try to extract context (E.g. sentences)
          const contextMatch = rest.match(/E\.g\.\s*(.+?)(?:\.|$)/i)
          if (contextMatch) {
            context = contextMatch[1].trim()
          }

          return { english, georgian, context: context || undefined }
        }
      }
    }
  }

  return null
}

/**
 * Main function: Parse text content and extract vocabulary pairs
 */
export function parseVocabulary(textContent: string): ExtractedWord[] {
  const results: ExtractedWord[] = []
  const seen = new Set<string>() // Track duplicates by English word

  // Split by newlines and process each line
  const lines = textContent.split(/\n+/)

  for (const line of lines) {
    // Some lines have multiple entries concatenated, try to split them
    // Look for patterns like "word1 - trans1word2 - trans2" (missing space)
    const subLines = splitConcatenatedEntries(line)

    for (const subLine of subLines) {
      const extracted = parseLine(subLine)

      if (extracted && !seen.has(extracted.english)) {
        seen.add(extracted.english)
        results.push(extracted)
      }
    }
  }

  return results
}

/**
 * Try to split concatenated entries (common in copy-pasted vocabulary docs)
 * Example: "word1 - ქართული1word2 - ქართული2"
 */
function splitConcatenatedEntries(line: string): string[] {
  // If line is short, return as-is
  if (line.length < 50) return [line]

  // Look for pattern where Georgian is immediately followed by uppercase English
  // This indicates concatenated entries
  const parts: string[] = []
  let remaining = line

  // Pattern: Georgian chars followed by capital letter (new word start)
  const splitPattern = /([\u10A0-\u10FF][^A-Z]*?)([A-Z][a-z]+)/g

  let lastIndex = 0
  let match

  // Reset regex
  splitPattern.lastIndex = 0

  while ((match = splitPattern.exec(line)) !== null) {
    // Check if there's meaningful content before this match
    if (match.index > lastIndex) {
      const segment = line.slice(lastIndex, match.index + match[1].length)
      if (segment.trim()) {
        parts.push(segment.trim())
      }
    }
    lastIndex = match.index + match[1].length
  }

  // Add remaining content
  if (lastIndex < line.length) {
    const remaining = line.slice(lastIndex)
    if (remaining.trim()) {
      parts.push(remaining.trim())
    }
  }

  // If splitting didn't work, return original
  return parts.length > 0 ? parts : [line]
}

/**
 * Parse vocabulary with statistics
 */
export function parseVocabularyWithStats(textContent: string): {
  words: ExtractedWord[]
  stats: {
    totalLines: number
    extractedCount: number
    skippedCount: number
  }
} {
  const lines = textContent.split(/\n+/).filter((l) => l.trim())
  const words = parseVocabulary(textContent)

  return {
    words,
    stats: {
      totalLines: lines.length,
      extractedCount: words.length,
      skippedCount: lines.length - words.length,
    },
  }
}
