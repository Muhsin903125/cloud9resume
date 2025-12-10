import * as mammoth from 'mammoth'

/**
 * Extract text from PDF buffer using pdf-parse library
 */
export const extractPdfText = async (buffer: Buffer): Promise<string> => {
  try {
    const pdfParseModule = require('pdf-parse')
    const data = await pdfParseModule(buffer)
    let text = data.text || ''

    // Clean up extracted text
    text = text
      .replace(/\s+/g, ' ') // Remove excessive whitespace
      .trim()

    return text
  } catch (error) {
    console.error('PDF parsing error:', error)
    throw new Error('Failed to extract text from PDF')
  }
}

/**
 * Extract text from DOCX buffer using mammoth library
 */
export const extractDocxText = async (buffer: Buffer): Promise<string> => {
  try {
    const result = await mammoth.extractRawText({ buffer })
    let text = result.value || ''

    // Clean up extracted text
    text = text
      .replace(/\s+/g, ' ') // Remove excessive whitespace
      .trim()

    return text
  } catch (error) {
    console.error('DOCX parsing error:', error)
    throw new Error('Failed to extract text from DOCX')
  }
}

/**
 * Normalize and clean resume text
 */
export const normalizeText = (text: string): string => {
  return text
    .toLowerCase()
    .replace(/[^\w\s\+\#\.\-]/g, ' ') // Keep alphanumeric, +, #, ., -
    .replace(/\s+/g, ' ')
    .trim()
}

/**
 * Extract keywords from text
 */
export const extractKeywords = (text: string): string[] => {
  const normalized = normalizeText(text)
  const words = normalized.split(/\s+/)

  // Filter out common stop words
  const stopWords = new Set([
    'the', 'a', 'an', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for',
    'of', 'with', 'by', 'from', 'up', 'about', 'into', 'through', 'during',
    'is', 'are', 'was', 'were', 'be', 'been', 'being', 'have', 'has', 'had',
    'do', 'does', 'did', 'will', 'would', 'could', 'should', 'may', 'might',
    'must', 'can', 'this', 'that', 'these', 'those', 'i', 'you', 'he', 'she',
    'it', 'we', 'they', 'what', 'which', 'who', 'when', 'where', 'why', 'how',
    'as', 'if', 'because', 'while', 'than', 'so', 'such', 'no', 'not', 'only',
    'same', 'such', 'also', 'just', 'more', 'most', 'other', 'some', 'any',
    'all', 'each', 'every', 'both', 'either', 'neither', 'one', 'two', 'three',
    'experienced', 'skilled', 'proficient', 'knowledge', 'experience', 'years',
    'worked', 'work', 'working', 'job', 'role', 'position', 'team', 'member'
  ])

  return words.filter(
    word =>
      word.length > 2 &&
      !stopWords.has(word) &&
      !/^\d+$/.test(word) // Exclude pure numbers
  )
}

/**
 * Extract multi-word phrases (skills, tools, technologies)
 */
export const extractPhrases = (text: string): string[] => {
  const normalized = normalizeText(text)
  const phrases: string[] = []

  // Common tech phrases and patterns
  const techPatterns = [
    /react\s+native/g,
    /node\s+js/g,
    /\.net/g,
    /c\+\+/g,
    /c\#/g,
    /cloud\s+\w+/g,
    /machine\s+learning/g,
    /deep\s+learning/g,
    /natural\s+language/g,
    /data\s+science/g,
    /full\s+stack/g,
    /front\s+end/g,
    /back\s+end/g,
    /api\s+\w+/g,
  ]

  techPatterns.forEach(pattern => {
    const matches = normalized.match(pattern)
    if (matches) {
      phrases.push(...matches.map(m => m.replace(/\s+/g, ' ')))
    }
  })

  return Array.from(new Set(phrases)) // Remove duplicates
}
