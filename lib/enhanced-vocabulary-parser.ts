/**
 * Enhanced Vocabulary Parser
 * Extracts words, expressions, examples, definitions, and categories
 */

export interface EnhancedExtractedWord {
  english: string
  georgian: string
  context?: string
  expressionPattern?: string  // "blow one's ___"
  exampleSentence?: string    // Full example sentence
  definition?: string         // English definition
  synonyms?: string           // Comma-separated synonyms
  category?: string           // mind_expression, eye_expression, phrasal_verb, etc.
}

// Georgian Unicode range
const GEORGIAN_REGEX = /[\u10A0-\u10FF]/

/**
 * Detect category based on content
 */
function detectCategory(text: string, english: string): string | undefined {
  const lowerText = text.toLowerCase()
  const lowerEnglish = english.toLowerCase()

  // Mind expressions
  if (lowerEnglish.includes('mind') || lowerText.includes("mind's") || lowerText.includes('mind to')) {
    return 'mind_expression'
  }

  // Eye expressions
  if (lowerEnglish.includes('eye') || lowerText.includes('eyes')) {
    return 'eye_expression'
  }

  // Phrasal verbs (verb + preposition)
  const phrasalPattern = /^(go|get|put|take|come|turn|bring|keep|make|give|set|break|call|pull|pick|drop|look|work|carry|hold|run|cut|blow|push|pop|dream|bring|drop)\s+(up|down|off|on|in|out|away|back|over|through|into|about|around|together|apart)$/i
  if (phrasalPattern.test(lowerEnglish)) {
    return 'phrasal_verb'
  }

  // Idioms (contain smth, sb, one's, or common idiom markers)
  if (/smth|s\.o\.|sb|one's|smb/i.test(text) || /tie the|keep a|blow|strike a|push|pull a/i.test(lowerEnglish)) {
    return 'idiom'
  }

  return undefined
}

/**
 * Extract expression pattern with blank
 * Converts "blow one's mind" to "blow one's ___"
 */
function extractExpressionPattern(english: string, text: string): string | undefined {
  const lowerEnglish = english.toLowerCase()

  // Common expression patterns
  const patterns: Array<{ match: RegExp; blank: string }> = [
    // Mind expressions
    { match: /blow\s+one's\s+mind/i, blank: "blow one's ___" },
    { match: /keep\s+an?\s+open\s+mind/i, blank: "keep an open ___" },
    { match: /bear\s+(in|on)\s+mind/i, blank: "bear in/on ___" },
    { match: /be\s+in\s+two\s+minds/i, blank: "be in two ___" },
    { match: /put\s+your\s+mind\s+to/i, blank: "put your ___ to smth" },
    { match: /in\s+.*mind's\s+eye/i, blank: "in one's mind's ___" },
    { match: /has?\s+smth\s+on\s+.*mind/i, blank: "have smth on one's ___" },

    // Eye expressions
    { match: /keep\s+an?\s+eye\s+on/i, blank: "keep an ___ on" },
    { match: /up\s+to\s+one's\s+eyes/i, blank: "up to one's ___" },
    { match: /naked\s+eye/i, blank: "with the naked ___" },
    { match: /open\s+.*eyes\s+to/i, blank: "open one's ___ to" },
    { match: /eye\s*catching/i, blank: "___ catching" },
    { match: /eyes\s+shut/i, blank: "with your ___ shut" },

    // Phrasal verbs - create pattern from the verb
    { match: /^(go|get|put|take|come|turn|bring|keep)\s+(off|on|up|down|out|in|away|about)$/i, blank: '$1 ___' },

    // Generic patterns with placeholders
    { match: /smth/i, blank: english.replace(/smth/gi, '___') },
    { match: /s\.o\./i, blank: english.replace(/s\.o\./gi, '___') },
    { match: /sb/i, blank: english.replace(/\bsb\b/gi, '___') },
  ]

  for (const { match, blank } of patterns) {
    if (match.test(text) || match.test(lowerEnglish)) {
      // Handle regex replacement
      if (blank.includes('$1')) {
        const m = lowerEnglish.match(match)
        if (m) {
          return blank.replace('$1', m[1])
        }
      }
      return blank
    }
  }

  return undefined
}

/**
 * Extract example sentence (E.g. ...)
 */
function extractExampleSentence(text: string): string | undefined {
  // Match "E.g." followed by a sentence
  const match = text.match(/E\.g\.?\s*([^.!?]+[.!?])/i)
  if (match) {
    return match[1].trim()
  }

  // Match sentences in quotes
  const quotedMatch = text.match(/"([^"]+)"/i)
  if (quotedMatch && quotedMatch[1].length > 20) {
    return quotedMatch[1].trim()
  }

  return undefined
}

/**
 * Extract English definition
 */
function extractDefinition(text: string, georgian: string): string | undefined {
  // Remove Georgian text to get English part
  const georgianStart = text.search(GEORGIAN_REGEX)
  if (georgianStart === -1) return undefined

  // Get text after Georgian (usually contains definition)
  const afterGeorgian = text.slice(georgianStart + georgian.length).trim()

  // Look for definition patterns
  // Remove phonetic, E.g., Syn: etc.
  let def = afterGeorgian
    .replace(/\[[^\]]+\]/g, '')  // Remove phonetic
    .replace(/E\.g\.[^.]+\./gi, '')  // Remove examples
    .replace(/Syn:\s*[^.]+/gi, '')  // Remove synonyms
    .replace(/Origin:[^.]+/gi, '')  // Remove origin
    .trim()

  // Take first meaningful sentence
  const firstSentence = def.match(/^[A-Za-z][^.!?]+[.!?]/)
  if (firstSentence && firstSentence[0].length > 10) {
    return firstSentence[0].trim()
  }

  return undefined
}

/**
 * Extract synonyms
 */
function extractSynonyms(text: string): string | undefined {
  const match = text.match(/Syn(?:onyms?)?:\s*([^.]+)/i)
  if (match) {
    // Clean up and return comma-separated
    return match[1]
      .replace(/[,;]/g, ', ')
      .replace(/\s+/g, ' ')
      .trim()
  }
  return undefined
}

/**
 * Extract Georgian translation
 */
function extractGeorgian(text: string): string | null {
  const startMatch = text.match(/[\u10A0-\u10FF]/)
  if (!startMatch || startMatch.index === undefined) return null

  const startIdx = startMatch.index
  let endIdx = startIdx

  for (let i = startIdx; i < text.length; i++) {
    const char = text[i]
    const charCode = char.charCodeAt(0)

    if (charCode >= 0x10a0 && charCode <= 0x10ff) {
      endIdx = i + 1
      continue
    }

    if (/[\s,;:.\-–()!?]/.test(char)) {
      const restOfText = text.slice(i + 1)
      const nextGeorgian = restOfText.match(/^\s*[\u10A0-\u10FF]/)
      if (nextGeorgian) continue
      break
    }

    if (/[A-Za-z0-9]/.test(char)) break
  }

  let georgian = text.slice(startIdx, endIdx).trim()
  georgian = georgian.replace(/[,;:.!?\s\-–]+$/, '').trim()

  if (georgian.length < 2) return null
  return georgian
}

/**
 * Clean English word
 */
function cleanEnglishWord(text: string): string {
  return text
    .replace(/\[[^\]]*\]/g, '')
    .replace(/\([^)]*\)/g, '')
    .replace(/^[\s\-–=:*•→]+/, '')
    .replace(/[\s\-–=:*•→]+$/, '')
    .replace(/\s*\d+\s*$/, '')
    .replace(/\s+/g, ' ')
    .trim()
    .toLowerCase()
}

/**
 * Validate English phrase
 */
function isValidEnglishPhrase(text: string): boolean {
  if (text.length < 2 || text.length > 60) return false
  if (!/^[a-z]/i.test(text)) return false

  const letterCount = (text.match(/[a-z]/gi) || []).length
  if (letterCount < text.length * 0.4) return false

  if (/^(p\.|page|unit|book|workbook|text|key\s*words)/i.test(text)) return false

  const wordCount = text.split(/\s+/).length
  if (wordCount > 6) return false

  if (/\b(i|you|he|she|we|they)\s+(am|are|is|was|were|have|had|will|would|could|should|saw|see|think)\b/i.test(text)) return false

  return true
}

/**
 * Parse single line
 */
function parseEnhancedLine(line: string): EnhancedExtractedWord | null {
  if (!line.trim()) return null
  if (/^p\.\d+$/i.test(line.trim())) return null
  if (/^(BOOK|WORKBOOK|Unit|KEY WORDS|TEXT:|TED\s*TALK|\+\s*Listening)/i.test(line.trim())) return null
  if (!GEORGIAN_REGEX.test(line)) return null

  const separators = [
    /^(\*{0,3}[^[\-–=*]+)\s*\[[^\]]+\]\s*(.+)$/,
    /^(\*{0,3}[^–\-=*]+)\s*[–\-]\s*(.+)$/,
    /^(\*{0,3}[^=*]+)\s*=\s*(.+)$/,
    /^(\*{0,3}[A-Za-z][A-Za-z\s'']+)\s+(.+)$/,
  ]

  for (const pattern of separators) {
    const match = line.match(pattern)
    if (match) {
      const possibleEnglish = match[1].replace(/^\*+/, '').trim()
      const rest = match[2]

      if (GEORGIAN_REGEX.test(rest)) {
        const english = cleanEnglishWord(possibleEnglish)

        if (!isValidEnglishPhrase(english)) continue

        const georgian = extractGeorgian(rest)
        if (!georgian) continue

        // Extract enhanced data
        const fullText = line
        const exampleSentence = extractExampleSentence(fullText)
        const definition = extractDefinition(fullText, georgian)
        const synonyms = extractSynonyms(fullText)
        const category = detectCategory(fullText, english)
        const expressionPattern = extractExpressionPattern(english, fullText)

        return {
          english,
          georgian,
          context: exampleSentence || undefined,
          expressionPattern,
          exampleSentence,
          definition,
          synonyms,
          category,
        }
      }
    }
  }

  return null
}

/**
 * Main parsing function
 */
export function parseEnhancedVocabulary(textContent: string): EnhancedExtractedWord[] {
  const results: EnhancedExtractedWord[] = []
  const seen = new Set<string>()

  const lines = textContent.split(/\n+/)

  for (const line of lines) {
    const extracted = parseEnhancedLine(line)

    if (extracted && !seen.has(extracted.english)) {
      seen.add(extracted.english)
      results.push(extracted)
    }
  }

  return results
}

/**
 * Parse with statistics
 */
export function parseEnhancedVocabularyWithStats(textContent: string): {
  words: EnhancedExtractedWord[]
  stats: {
    total: number
    withExpressions: number
    withExamples: number
    withDefinitions: number
    withSynonyms: number
    byCategory: Record<string, number>
  }
} {
  const words = parseEnhancedVocabulary(textContent)

  const stats = {
    total: words.length,
    withExpressions: words.filter((w) => w.expressionPattern).length,
    withExamples: words.filter((w) => w.exampleSentence).length,
    withDefinitions: words.filter((w) => w.definition).length,
    withSynonyms: words.filter((w) => w.synonyms).length,
    byCategory: {} as Record<string, number>,
  }

  words.forEach((w) => {
    if (w.category) {
      stats.byCategory[w.category] = (stats.byCategory[w.category] || 0) + 1
    }
  })

  return { words, stats }
}
