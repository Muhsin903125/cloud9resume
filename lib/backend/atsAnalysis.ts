/**
 * Comprehensive ATS Analysis Engine
 */

export interface ATSAnalysisResult {
  score: number
  matchPercentage: number
  matchedKeywords: string[]
  missingKeywords: string[]
  keywordStats: {
    totalJDKeywords: number
    matchedCount: number
    matchPercentage: number
  }
  sections: {
    hasContactInfo: boolean
    hasEducation: boolean
    hasExperience: boolean
    hasSkills: boolean
    hasProjects: boolean
  }
  insights: string[]
  strengths: string[]
  weaknesses: string[]
  recommendations: string[]
}

/**
 * Detect resume sections
 */
export const detectSections = (text: string): {
  hasContactInfo: boolean
  hasEducation: boolean
  hasExperience: boolean
  hasSkills: boolean
  hasProjects: boolean
} => {
  const lowerText = text.toLowerCase()

  return {
    hasContactInfo: /(\d{10}|phone|email|@|contact|linkedin|github)/.test(lowerText),
    hasEducation: /(bachelor|master|phd|degree|university|college|education)/.test(lowerText),
    hasExperience: /(experience|worked|worked at|employment|position|role)/.test(lowerText),
    hasSkills: /(skill|proficient|expertise|technical|tools|framework)/.test(lowerText),
    hasProjects: /(project|developed|created|built|github|portfolio|deployed)/.test(lowerText),
  }
}

/**
 * Analyze keyword match between resume and job description
 */
export const analyzeKeywordMatch = (
  resumeKeywords: string[],
  jdKeywords: string[]
): {
  matched: string[]
  missing: string[]
  matchPercentage: number
  score: number
} => {
  const resumeSet = new Set(resumeKeywords.map(k => k.toLowerCase()))
  const jdSet = new Set(jdKeywords.map(k => k.toLowerCase()))

  const matched = Array.from(jdSet).filter(keyword => resumeSet.has(keyword))
  const missing = Array.from(jdSet).filter(keyword => !resumeSet.has(keyword))

  const matchPercentage = jdSet.size > 0 ? (matched.length / jdSet.size) * 100 : 0

  // Calculate score (0-100)
  let score = matchPercentage
  if (matched.length > 0) score += 5 // Bonus if any keywords match
  score = Math.min(100, Math.max(0, score))

  return {
    matched,
    missing,
    matchPercentage: Math.round(matchPercentage),
    score: Math.round(score),
  }
}

/**
 * Generate insights based on analysis
 */
export const generateInsights = (
  analysis: ATSAnalysisResult,
  resumeText: string,
  jdText: string
): {
  insights: string[]
  strengths: string[]
  weaknesses: string[]
  recommendations: string[]
} => {
  const insights: string[] = []
  const strengths: string[] = []
  const weaknesses: string[] = []
  const recommendations: string[] = []

  // Keyword match insights
  if (analysis.keywordStats.matchPercentage >= 80) {
    insights.push('Excellent keyword alignment with the job description')
    strengths.push('Strong match in required keywords and technologies')
  } else if (analysis.keywordStats.matchPercentage >= 60) {
    insights.push('Good keyword alignment, but some gaps exist')
    recommendations.push(`Add ${analysis.missingKeywords.slice(0, 3).join(', ')} to strengthen your resume`)
  } else {
    insights.push('Limited keyword alignment with job requirements')
    weaknesses.push('Many required keywords are missing from your resume')
  }

  // Section insights
  if (!analysis.sections.hasContactInfo) {
    weaknesses.push('Missing or unclear contact information')
    recommendations.push('Add clear contact information at the top of your resume')
  }

  if (!analysis.sections.hasSkills) {
    weaknesses.push('No dedicated skills section')
    recommendations.push('Include a clear skills section with relevant technologies')
  }

  if (!analysis.sections.hasExperience) {
    weaknesses.push('No work experience details found')
    recommendations.push('Add detailed work experience with accomplishments')
  }

  // Formatting insights
  if (resumeText.length < 200) {
    weaknesses.push('Resume appears too short')
    recommendations.push('Expand your resume with more details and accomplishments')
  } else if (resumeText.length > 3000) {
    insights.push('Resume has good detail level')
  }

  // Missing keywords analysis
  if (analysis.missingKeywords.length > 0) {
    const topMissing = analysis.missingKeywords.slice(0, 5)
    recommendations.push(`Consider adding these keywords: ${topMissing.join(', ')}`)
  }

  return {
    insights,
    strengths: strengths.length > 0 ? strengths : ['Resume has relevant content'],
    weaknesses,
    recommendations,
  }
}

/**
 * Calculate comprehensive ATS score
 */
export const calculateATSScore = (analysis: ATSAnalysisResult): number => {
  let score = analysis.score

  // Section bonus
  const sectionCount = Object.values(analysis.sections).filter(Boolean).length
  score += (sectionCount / 5) * 15

  // Keyword coverage bonus
  if (analysis.matchPercentage >= 75) score += 10
  else if (analysis.matchPercentage >= 50) score += 5

  // Cap at 100
  return Math.min(100, Math.round(score))
}

/**
 * Generate HTML report for email
 */
export const generateHTMLReport = (
  analysis: ATSAnalysisResult,
  userEmail: string,
  jobTitle?: string
): string => {
  const scoreColor = analysis.score >= 80 ? '#22c55e' : analysis.score >= 60 ? '#f59e0b' : '#ef4444'

  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="UTF-8">
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: #f3f4f6; padding: 20px; border-radius: 8px; margin-bottom: 20px; }
        .score-card { 
          background: ${scoreColor}; 
          color: white; 
          padding: 30px; 
          border-radius: 8px; 
          text-align: center; 
          margin-bottom: 20px;
        }
        .score-value { font-size: 48px; font-weight: bold; }
        .section { margin-bottom: 20px; }
        .section-title { font-size: 18px; font-weight: bold; margin-bottom: 10px; color: #1f2937; }
        .keyword-list { display: flex; flex-wrap: wrap; gap: 8px; }
        .keyword-tag { 
          background: #e5e7eb; 
          padding: 6px 12px; 
          border-radius: 20px; 
          font-size: 14px;
        }
        .keyword-tag.matched { background: #d1fae5; color: #065f46; }
        .keyword-tag.missing { background: #fee2e2; color: #991b1b; }
        .insight { background: #f0f9ff; padding: 10px; border-left: 4px solid #3b82f6; margin: 8px 0; }
        .strength { background: #f0fdf4; padding: 10px; border-left: 4px solid #22c55e; margin: 8px 0; }
        .weakness { background: #fef2f2; padding: 10px; border-left: 4px solid #ef4444; margin: 8px 0; }
        .recommendation { background: #fffbeb; padding: 10px; border-left: 4px solid #f59e0b; margin: 8px 0; }
        .button {
          display: inline-block;
          background: #2563eb;
          color: white;
          padding: 12px 24px;
          border-radius: 8px;
          text-decoration: none;
          margin-top: 20px;
        }
        .footer { text-align: center; color: #6b7280; font-size: 12px; margin-top: 30px; border-top: 1px solid #e5e7eb; padding-top: 20px; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>🎯 ATS Resume Analysis Report</h1>
          <p>${jobTitle ? `Position: ${jobTitle}` : 'Resume Analysis'}</p>
          <p>Generated for: ${userEmail}</p>
        </div>

        <div class="score-card">
          <div>Overall ATS Score</div>
          <div class="score-value">${analysis.score}/100</div>
          <div>${analysis.score >= 80 ? '✅ Excellent' : analysis.score >= 60 ? '⚠️ Good' : '❌ Needs Improvement'}</div>
        </div>

        <div class="section">
          <div class="section-title">📊 Keyword Analysis</div>
          <p>Match Rate: <strong>${analysis.keywordStats.matchPercentage}%</strong> (${analysis.keywordStats.matchedCount}/${analysis.keywordStats.totalJDKeywords} keywords)</p>
        </div>

        ${analysis.matchedKeywords.length > 0 ? `
          <div class="section">
            <div class="section-title">✅ Matched Keywords</div>
            <div class="keyword-list">
              ${analysis.matchedKeywords.slice(0, 15).map(k => `<span class="keyword-tag matched">${k}</span>`).join('')}
            </div>
          </div>
        ` : ''}

        ${analysis.missingKeywords.length > 0 ? `
          <div class="section">
            <div class="section-title">❌ Missing Keywords</div>
            <div class="keyword-list">
              ${analysis.missingKeywords.slice(0, 15).map(k => `<span class="keyword-tag missing">${k}</span>`).join('')}
            </div>
          </div>
        ` : ''}

        ${analysis.insights.length > 0 ? `
          <div class="section">
            <div class="section-title">💡 Key Insights</div>
            ${analysis.insights.map(i => `<div class="insight">${i}</div>`).join('')}
          </div>
        ` : ''}

        ${analysis.strengths.length > 0 ? `
          <div class="section">
            <div class="section-title">💪 Strengths</div>
            ${analysis.strengths.map(s => `<div class="strength">✓ ${s}</div>`).join('')}
          </div>
        ` : ''}

        ${analysis.weaknesses.length > 0 ? `
          <div class="section">
            <div class="section-title">⚠️ Areas for Improvement</div>
            ${analysis.weaknesses.map(w => `<div class="weakness">• ${w}</div>`).join('')}
          </div>
        ` : ''}

        ${analysis.recommendations.length > 0 ? `
          <div class="section">
            <div class="section-title">🔧 Recommendations</div>
            ${analysis.recommendations.map(r => `<div class="recommendation">→ ${r}</div>`).join('')}
          </div>
        ` : ''}

        <center>
          <a href="http://localhost:3000/ats-checker" class="button">View Detailed Report</a>
        </center>

        <div class="footer">
          <p>Cloud9 Resume - ATS Compatibility Checker</p>
          <p>This report was automatically generated and may vary based on your resume formatting.</p>
        </div>
      </div>
    </body>
    </html>
  `
}
