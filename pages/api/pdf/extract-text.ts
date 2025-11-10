import type { NextApiRequest, NextApiResponse } from 'next'
import { createWorker } from 'tesseract.js'
import vision from '@google-cloud/vision'

interface ExtractTextResponse {
  success: boolean
  text?: string
  error?: string
  usedOCR?: boolean
  ocrMethod?: 'tesseract' | 'google-vision' | 'none'
}

// Parse multipart form data manually
const parseMultipartForm = async (req: NextApiRequest): Promise<{ file: Buffer, mimetype: string } | null> => {
  return new Promise((resolve, reject) => {
    const chunks: Buffer[] = []
    
    req.on('data', (chunk: Buffer) => {
      chunks.push(chunk)
    })
    
    req.on('end', () => {
      try {
        const buffer = Buffer.concat(chunks)
        const boundary = req.headers['content-type']?.split('boundary=')[1]
        
        if (!boundary) {
          return resolve(null)
        }
        
        // Extract file data from multipart
        const parts = buffer.toString('binary').split(`--${boundary}`)
        
        for (const part of parts) {
          if (part.includes('Content-Type:')) {
            const mimetypeMatch = part.match(/Content-Type:\s*([^\r\n]+)/)
            const mimetype = mimetypeMatch ? mimetypeMatch[1].trim() : 'application/octet-stream'
            
            // Extract binary data after headers
            const dataStart = part.indexOf('\r\n\r\n') + 4
            const dataEnd = part.lastIndexOf('\r\n')
            
            if (dataStart > 3 && dataEnd > dataStart) {
              const fileData = part.substring(dataStart, dataEnd)
              const fileBuffer = Buffer.from(fileData, 'binary')
              
              return resolve({ file: fileBuffer, mimetype })
            }
          }
        }
        
        resolve(null)
      } catch (error) {
        reject(error)
      }
    })
    
    req.on('error', reject)
  })
}

// Simple PDF text extraction
const extractPDFText = (buffer: Buffer): string => {
  try {
    const text = buffer.toString('utf-8')
    
    // Extract text between PDF text operators
    const matches: string[] = []
    const regex = /BT\s+(.*?)\s+ET/g
    let match
    
    while ((match = regex.exec(text)) !== null) {
      // Extract content within parentheses
      const content = match[1]
      const textMatches = content.match(/\((.*?)\)/g)
      if (textMatches) {
        textMatches.forEach(tm => {
          const cleanText = tm
            .slice(1, -1)
            .replace(/\\[rn]/g, '\n')
            .replace(/\\\(/g, '(')
            .replace(/\\\)/g, ')')
            .replace(/\\\\/g, '\\')
          matches.push(cleanText)
        })
      }
    }
    
    let result = matches.join(' ')
    
    // If no structured text, extract readable characters
    if (!result.trim() || result.length < 50) {
      result = text
        .replace(/[^\x20-\x7E\s]/g, ' ')
        .replace(/\s+/g, ' ')
        .trim()
    }
    
    return result
  } catch (error) {
    throw new Error('Failed to extract text from PDF')
  }
}

// Extract text from DOCX (Word document)
const extractDOCXText = (buffer: Buffer): string => {
  try {
    const text = buffer.toString('utf-8')
    
    // Extract text from XML tags
    const matches = text.match(/<w:t[^>]*>([^<]*)<\/w:t>/g) || []
    const extracted = matches
      .map(m => m.replace(/<[^>]*>/g, ''))
      .filter(t => t.trim())
      .join(' ')
    
    if (extracted.trim() && extracted.length > 20) {
      return extracted
    }
    
    // Fallback: extract readable text
    return text
      .replace(/[^\x20-\x7E\s]/g, ' ')
      .replace(/\s+/g, ' ')
      .trim()
  } catch (error) {
    throw new Error('Failed to extract text from DOCX')
  }
}

// OCR extraction using Google Vision API
const extractTextWithGoogleVision = async (buffer: Buffer): Promise<string> => {
  try {
    // Check if Google Vision credentials are configured
    const hasCredentials = process.env.GOOGLE_APPLICATION_CREDENTIALS || process.env.GOOGLE_VISION_API_KEY
    
    if (!hasCredentials) {
      throw new Error('Google Vision API credentials not configured')
    }

    const client = new vision.ImageAnnotatorClient()
    
    const [result] = await client.textDetection({
      image: { content: buffer }
    })
    
    const detections = result.textAnnotations
    if (detections && detections.length > 0) {
      // First annotation contains full text
      return detections[0].description || ''
    }
    
    return ''
  } catch (error) {
    console.error('Google Vision OCR failed:', error)
    throw error
  }
}

// OCR extraction for scanned PDFs using Tesseract.js
const extractTextWithTesseract = async (buffer: Buffer): Promise<string> => {
  let worker
  try {
    worker = await createWorker('eng')
    const { data: { text } } = await worker.recognize(buffer)
    await worker.terminate()
    return text.trim()
  } catch (error) {
    if (worker) await worker.terminate()
    throw new Error('Tesseract OCR extraction failed')
  }
}

// Hybrid OCR: Try Google Vision first, fall back to Tesseract
const extractTextWithOCR = async (buffer: Buffer): Promise<{ text: string, method: 'tesseract' | 'google-vision' }> => {
  const strategy = process.env.OCR_STRATEGY || 'hybrid'
  
  // Try Google Vision first if available
  if (strategy === 'google-vision' || strategy === 'hybrid') {
    try {
      console.log('Attempting Google Vision OCR...')
      const text = await extractTextWithGoogleVision(buffer)
      if (text && text.length > 50) {
        console.log('Google Vision OCR successful')
        return { text, method: 'google-vision' }
      }
    } catch (error) {
      console.log('Google Vision OCR failed, falling back to Tesseract')
    }
  }
  
  // Fall back to Tesseract or use it directly
  if (strategy === 'tesseract' || strategy === 'hybrid') {
    console.log('Using Tesseract OCR...')
    const text = await extractTextWithTesseract(buffer)
    return { text, method: 'tesseract' }
  }
  
  throw new Error('No OCR method available')
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<ExtractTextResponse>
) {
  if (req.method !== 'POST') {
    return res.status(405).json({ success: false, error: 'Method not allowed' })
  }

  try {
    const result = await parseMultipartForm(req)

    if (!result) {
      return res.status(400).json({ success: false, error: 'No file uploaded' })
    }

    const { file, mimetype } = result
    let extractedText = ''
    let usedOCR = false
    let ocrMethod: 'tesseract' | 'google-vision' | 'none' = 'none'

    if (mimetype.includes('pdf')) {
      extractedText = extractPDFText(file)
      
      // If extraction yields very little text, try OCR for scanned PDFs
      if (!extractedText || extractedText.length < 100) {
        try {
          console.log('Attempting OCR extraction for scanned PDF...')
          const ocrResult = await extractTextWithOCR(file)
          extractedText = ocrResult.text
          ocrMethod = ocrResult.method
          usedOCR = true
        } catch (ocrError) {
          console.error('OCR failed:', ocrError)
          // Keep the original extracted text even if it's minimal
        }
      }
    } else if (
      mimetype.includes('wordprocessingml') ||
      mimetype.includes('msword')
    ) {
      extractedText = extractDOCXText(file)
    } else {
      return res.status(400).json({ 
        success: false, 
        error: 'Unsupported file type. Please upload PDF or DOC/DOCX files.' 
      })
    }

    if (!extractedText || extractedText.length < 10) {
      return res.status(400).json({ 
        success: false, 
        error: 'Unable to extract text from file. Please ensure the file contains readable text or try pasting the text directly.' 
      })
    }

    return res.status(200).json({ 
      success: true, 
      text: extractedText,
      usedOCR,
      ocrMethod
    })

  } catch (error) {
    console.error('Error extracting text:', error)
    return res.status(500).json({ 
      success: false, 
      error: 'Failed to extract text from file. Please try pasting the text directly.' 
    })
  }
}

// Disable body parser for file upload
export const config = {
  api: {
    bodyParser: false,
  },
}
