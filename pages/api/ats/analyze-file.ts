import type { NextApiRequest, NextApiResponse } from 'next'
import { IncomingForm, Fields, Files } from 'formidable'
import fs from 'fs'
import { extractPdfText, extractDocxText, extractImageText, extractKeywords, extractPhrases } from '@/lib/backend/textExtraction'
import {
  analyzeKeywordMatch,
  detectSections,
  generateInsights,
  calculateATSScore,
  type ATSAnalysisResult
} from '@/lib/backend/atsAnalysis'
import { createClient } from '@supabase/supabase-js'

// Initialize Supabase only if env vars are present
const getSupabaseAdmin = () => {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY
  
  if (!supabaseUrl || !supabaseServiceKey) {
    console.warn('Missing Supabase environment variables. DB saving will be skipped.')
    return null
  }
  return createClient(supabaseUrl, supabaseServiceKey)
}

export type ATSAnalysisResponse = {
  success: boolean
  data?: ATSAnalysisResult
  error?: string
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<ATSAnalysisResponse>
) {
  console.log('ATS Analysis: Request received')
  
  if (req.method !== 'POST') {
    return res.status(405).json({ success: false, error: 'Method not allowed' })
  }

  try {
    console.log('ATS Analysis: Parsing form data...')
    const data = await new Promise<{ fields: Fields; files: Files }>((resolve, reject) => {
      const form = new IncomingForm()
      form.parse(req, (err, fields, files) => {
        if (err) return reject(err)
        resolve({ fields, files })
      })
    })

    const { fields, files } = data
    console.log('ATS Analysis: Form parsed.')

    const jobDescription = Array.isArray(fields.jobDescription)
      ? fields.jobDescription[0]
      : fields.jobDescription || ''
    
    // Check if file exists
    const uploadedFile = Array.isArray(files.file) ? files.file[0] : files.file
    
    if (!uploadedFile) {
      console.error('ATS Analysis: No file uploaded')
      return res.status(400).json({ success: false, error: 'No file uploaded' })
    }

    if (!jobDescription) {
       console.error('ATS Analysis: No job description')
       return res.status(400).json({ success: false, error: 'Job description is required' })
    }

    // Read and extract text
    console.log(`ATS Analysis: Reading file ${uploadedFile.filepath} (${uploadedFile.mimetype})`)
    const fileBuffer = fs.readFileSync(uploadedFile.filepath)
    let resumeText = ''

    try {
      if (uploadedFile.mimetype === 'application/pdf') {
        resumeText = await extractPdfText(fileBuffer)
         console.log('ATS Analysis: Text extracted from DOCX file')
        console.log(resumeText) 
      } else if (
        uploadedFile.mimetype === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' ||
        uploadedFile.mimetype === 'application/msword'
      ) {
        resumeText = await extractDocxText(fileBuffer)
        console.log('ATS Analysis: Text extracted from DOCX file')
        console.log(resumeText) 
      } else {
        console.error('ATS Analysis: Unsupported mime type:', uploadedFile.mimetype)
        return res.status(400).json({ success: false, error: 'Unsupported file type' })
      }
    } catch (extractError) {
      console.error('ATS Analysis: Text extraction failed:', extractError)
      return res.status(400).json({ success: false, error: 'Could not extract text from file' })
    }

    if (!resumeText.trim()) {
      return res.status(400).json({ success: false, error: 'Extracted text is empty' })
    }
    console.log('ATS Analysis: Text extraction successful. Length:', resumeText.length)
    console.log('--- Extracted Text Preview ---')
    console.log(resumeText.substring(0, 1500) + '...')
    console.log('------------------------------')

    // Perform Analysis
    console.log('ATS Analysis: Running analysis...')
    const resumeKeywords = extractKeywords(resumeText)
    const resumePhrases = extractPhrases(resumeText)
    const allResumeKeywords = [...resumeKeywords, ...resumePhrases]

    const jdKeywords = extractKeywords(jobDescription)
    const jdPhrases = extractPhrases(jobDescription)
    const allJDKeywords = [...jdKeywords, ...jdPhrases]

    const matchAnalysis = analyzeKeywordMatch(allResumeKeywords, allJDKeywords)

    const analysis: ATSAnalysisResult = {
      score: matchAnalysis.score,
      matchPercentage: matchAnalysis.matchPercentage,
      matchedKeywords: matchAnalysis.matched,
      missingKeywords: matchAnalysis.missing,
      keywordStats: {
        totalJDKeywords: allJDKeywords.length,
        matchedCount: matchAnalysis.matched.length,
        matchPercentage: matchAnalysis.matchPercentage,
      },
      sections: detectSections(resumeText),
      insights: [],
      strengths: [],
      weaknesses: [],
      recommendations: [],
    }

    const insightsResult = generateInsights(analysis, resumeText, jobDescription)
    analysis.insights = insightsResult.insights
    analysis.strengths = insightsResult.strengths
    analysis.weaknesses = insightsResult.weaknesses
    analysis.recommendations = insightsResult.recommendations

    analysis.score = calculateATSScore(analysis)
    console.log('ATS Analysis: Analysis complete. Score:', analysis.score)

    // Save to Database
    try {
      const supabaseAdmin = getSupabaseAdmin()
      if (supabaseAdmin) {
        console.log('ATS Analysis: Saving to database...')
        const { error: dbError } = await supabaseAdmin
          .from('ats_analyses')
          .insert({
            resume_text: resumeText,
            job_description: jobDescription,
            score: analysis.score,
            match_percentage: analysis.matchPercentage,
            keywords_found: analysis.matchedKeywords,
            keywords_missing: analysis.missingKeywords,
          })
        
        if (dbError) {
          console.error('Failed to save analysis to DB:', dbError)
        } else {
          console.log('ATS Analysis: Saved to database successfully.')
        }
      }
    } catch (saveError) {
       console.error('Error saving to DB:', saveError)
    }

    res.status(200).json({
      success: true,
      data: analysis
    })

  } catch (error) {
    console.error('ATS File Analysis Critical Error:', error)
    res.status(500).json({ success: false, error: 'Analysis failed: ' + (error as Error).message })
  }
}

export const config = {
  api: {
    bodyParser: false,
  },
}
