import * as mammoth from 'mammoth'
import { createWorker } from 'tesseract.js'

/**
 * Extract text from Image buffer using Tesseract OCR
 */
export const extractImageText = async (buffer: Buffer): Promise<string> => {
  try {
    const worker = await createWorker('eng')
    const ret = await worker.recognize(buffer)
    const text = ret.data.text
    await worker.terminate()
    
    return text
      .replace(/\s+/g, ' ')
      .trim()
  } catch (error) {
    console.error('OCR error:', error)
    throw new Error('Failed to extract text from image')
  }
}

/**
 * Extract text from PDF buffer using pdfjs-dist
 * Includes timeout protection
 */
export const extractPdfText = async (buffer: Buffer): Promise<string> => {
  const TIMEOUT_MS = 8000 // 8 second timeout to avoid Vercel limit
  
  const extractPromise = async () => {
    // Import pdfjs-dist (legacy build for Node.js CJS support)
    const pdfjsLib = require('pdfjs-dist/legacy/build/pdf.js')
    
    // Convert Buffer to Uint8Array
    const uint8Array = new Uint8Array(buffer)
    
    // Load document
    const loadingTask = pdfjsLib.getDocument({
      data: uint8Array,
      disableFontFace: true,
    })

    const pdfDocument = await loadingTask.promise
    const numPages = pdfDocument.numPages
    let fullText = ''

    // Iterate over all pages
    for (let i = 1; i <= numPages; i++) {
        const page = await pdfDocument.getPage(i)
        const content = await page.getTextContent()
        const strings = content.items.map((item: any) => item.str)
        fullText += strings.join(' ') + ' '
    }
    return fullText
  }

  try {
     const result = await Promise.race([
        extractPromise(),
        new Promise<string>((_, reject) => 
           setTimeout(() => reject(new Error('PDF extraction timed out')), TIMEOUT_MS)
        )
     ])

    let text = result
      .replace(/\s+/g, ' ') // Remove excessive whitespace
      .trim()

    return text
  } catch (error) {
    console.error('PDF parsing error:', error)
    // Fallback or re-throw
    throw new Error(`Failed to extract text from PDF: ${(error as Error).message}`)
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
    .replace(/[^\w\s\+\#\.\-\&]/g, ' ') // Keep alphanumeric, +, #, ., -, &
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
    'job', 'role', 'position', 'team', 'member', 'candidate', 'summary',
    'objective', 'references', 'available', 'request', 'cv', 'resume',
    'profile', 'contact', 'phone', 'email', 'address', 'total', 'year',
    'month', 'date', 'current', 'present', 'january', 'february', 'march',
    'april', 'may', 'june', 'july', 'august', 'september', 'october',
    'november', 'december', 'description', 'requirements', 'responsibilities'
  ])

  // Allow specific short tech keywords and legitimate acronyms
  const allowedShortWords = new Set([
    // Programming & Languages
    'c', 'c#', 'f#', 'r', 'go', 'js', 'ts', 'vb', 'py', 'rb', 'pl', 'sh', 'sql', 'php',
    'net', 'xml', 'css', 'html', 'sass', 'less', 'json', 'yaml', 'bash', 'zsh', 'vim',
    
    // Cloud, DevOps & Infrastructure
    'aws', 'gcp', 'az', 'k8s', 'ci', 'cd', 'vm', 'os', 'io', 'ec2', 's3', 'rds', 
    'vpc', 'iam', 'sns', 'sqs', 'lambda', 'blob', 'aks', 'gke', 'eks', 'acr',
    'docker', 'pod', 'node', 'npm', 'yarn', 'pip', 'git', 'svn', 'ssh', 'ftp',
    'saas', 'paas', 'iaas', 'faas',
    
    // Web & Networking
    'api', 'rest', 'soap', 'graphql', 'grpc', 'http', 'https', 'tcp', 'udp', 
    'dns', 'ip', 'lan', 'wan', 'vpn', 'ssl', 'tls', 'ui', 'ux', 'seo', 'sem',
    'dom', 'spa', 'pwa', 'ssr', 'csr', 'cors', 'jwt', 'sso',
    
    // Data & AI
    'ai', 'ml', 'dl', 'nlp', 'llm', 'ocr', 'etl', 'bi', 'dw', 'db', 'nosql',
    'sas', 'sps', 'spss', 'matlab', 'pandas', 'numpy',
    
    // Methods & Standards
    'agile', 'scrum', 'lean', 'kanban', 'safe', 'iso', 'ieee', 'gdpr', 
    'sre', 'tdd', 'bdd', 'ddd', 'mvc', 'mvvm', 'oop', 'fp', 'solid', 'dry',
    
    // Business, Roles & Certs
    'qa', 'qc', 'ba', 'pm', 'po', 'hr', 'ceo', 'cto', 'cfo', 'cio', 'ciso', 'vp', 'md',
    'mba', 'phd', 'bba', 'bsc', 'msc', 'bca', 'mca', 'btech', 'mtech', 'ma', 'jd',
    'cpa', 'cfa', 'pmp', 'aws', 'gCP', 'pci', 'soc', 'sox', 'roi', 'kpi', 'okr', 'b2b', 'b2c',
    'm&a', 'r&d', 'p&l', 'crm', 'erp', 'sap', 'seo', 'sem', 'pr', 'ad', 'ops', 'fin',
    'avg', 'max', 'min', 'std', 'k', 'm', 'b'
  ])

  return words
    .map(w => w.replace(/\.$/, '')) // Remove trailing dot (C#. -> C#)
    .filter(
      word =>
        // Must not be a stop word
        !stopWords.has(word) && 
        // Must either be long enough OR in the allowed short list
        (word.length > 2 || allowedShortWords.has(word)) &&
        // Must contain at least one letter (filters "3-4", "2024", etc.)
        /[a-zA-Z]/.test(word) &&
        // Extra check to ensure it's not just a bunch of special chars
        !/^[^a-z0-9]+$/.test(word)
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
