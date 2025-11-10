import { NextPage } from 'next'
import { useState, useRef } from 'react'
import Head from 'next/head'
import Link from 'next/link'

interface ATSResult {
  score: number
  matchPercentage: number
  keywords: {
    present: string[]
    missing: string[]
    frequency: Record<string, number>
  }
  sections: Record<string, boolean>
  issues: {
    critical: string[]
    warnings: string[]
    suggestions: string[]
  }
  atsScore: {
    formatting: number
    keywords: number
    sections: number
    overall: number
  }
}

const PublicATSChecker: NextPage = () => {
  const [resumeText, setResumeText] = useState('')
  const [jobDescription, setJobDescription] = useState('')
  const [results, setResults] = useState<ATSResult | null>(null)
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [error, setError] = useState('')
  const [activeTab, setActiveTab] = useState<'upload' | 'analyze'>('upload')
  const [showEmailForm, setShowEmailForm] = useState(false)
  const [emailData, setEmailData] = useState({ name: '', email: '' })
  const [emailSending, setEmailSending] = useState(false)
  const [emailSuccess, setEmailSuccess] = useState(false)
  const [fileName, setFileName] = useState('')
  const [isDragging, setIsDragging] = useState(false)
  const [isUploading, setIsUploading] = useState(false)
  const resumeInputRef = useRef<HTMLTextAreaElement>(null)
  const jobInputRef = useRef<HTMLTextAreaElement>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  // Handle file upload - send to backend for text extraction
  const handleFileUpload = async (file: File) => {
    if (!file) return

    const allowedTypes = [
      'application/pdf',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'application/msword'
    ]

    if (!allowedTypes.includes(file.type)) {
      setError('Please upload a PDF or DOC/DOCX file')
      return
    }

    try {
      setError('')
      setIsUploading(true)
      setFileName(file.name)
      
      // Create FormData to send file to backend
      const formData = new FormData()
      formData.append('file', file)

      // Send to backend API for extraction
      const response = await fetch('/api/pdf/extract-text', {
        method: 'POST',
        body: formData
      })

      const data = await response.json()

      if (data.success && data.text) {
        setResumeText(data.text)
        setError('')
        
        // Show OCR notification if used
        if (data.usedOCR && data.ocrMethod) {
          const methodName = data.ocrMethod === 'google-vision' ? 'Google Vision API' : 'Tesseract.js'
          console.log(`OCR extraction successful using ${methodName}`)
        }
      } else {
        setError(data.error || 'Failed to extract text from file')
        setFileName('')
      }
    } catch (err) {
      setError(`Error processing file: ${err instanceof Error ? err.message : 'Unknown error'}`)
      setFileName('')
    } finally {
      setIsUploading(false)
    }
  }

  // Handle drag and drop
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(true)
  }

  const handleDragLeave = () => {
    setIsDragging(false)
  }

  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
    const files = e.dataTransfer.files
    if (files.length > 0) {
      await handleFileUpload(files[0])
    }
  }

  const handleAnalyze = async () => {
    if (!resumeText.trim()) {
      setError('Please enter your resume text')
      return
    }
    if (!jobDescription.trim()) {
      setError('Please enter the job description')
      return
    }

    setIsAnalyzing(true)
    setError('')

    try {
      const response = await fetch('/api/ats/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ resumeText, jobDescription })
      })

      if (!response.ok) {
        throw new Error('Failed to analyze')
      }

      const data = await response.json()
      if (data.success) {
        setResults(data.data)
        setActiveTab('analyze')
      } else {
        setError(data.error || 'Analysis failed')
      }
    } catch (err) {
      setError('An error occurred. Please try again.')
      console.error(err)
    } finally {
      setIsAnalyzing(false)
    }
  }

  const handleSendEmail = async () => {
    if (!emailData.email || !emailData.name) {
      setError('Please fill in all fields')
      return
    }

    if (!results) {
      setError('No analysis results to send')
      return
    }

    setEmailSending(true)
    setError('')

    try {
      const response = await fetch('/api/ats/email-report', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: emailData.name,
          email: emailData.email,
          analysisData: results
        })
      })

      if (!response.ok) {
        throw new Error('Failed to send email')
      }

      const data = await response.json()
      if (data.success) {
        setEmailSuccess(true)
        setShowEmailForm(false)
        setTimeout(() => setEmailSuccess(false), 5000)
      } else {
        setError(data.error || 'Failed to send email')
      }
    } catch (err) {
      setError('Failed to send email. Please try again.')
      console.error(err)
    } finally {
      setEmailSending(false)
    }
  }

  const getScoreColor = (score: number) => {
    if (score >= 80) return '#22c55e'
    if (score >= 60) return '#f59e0b'
    return '#ef4444'
  }

  const getScoreLabel = (score: number) => {
    if (score >= 80) return 'Excellent'
    if (score >= 60) return 'Good'
    if (score >= 40) return 'Fair'
    return 'Needs Improvement'
  }

  return (
    <>
      <Head>
        <title>Free ATS Resume Checker - Cloud9 Resume</title>
        <meta name="description" content="Check your resume's ATS compatibility for free. Get keyword analysis, formatting score, and recommendations to improve your resume." />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </Head>

      <div className="min-h-screen bg-gray-50">
        {/* Header */}
        <div className="bg-white border-b border-gray-200">
          <div className="max-w-7xl mx-auto px-4 py-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between">
              <Link href="/" className="text-xl font-bold text-blue-600">
                Cloud9 Resume
              </Link>
              <Link
                href="/login"
                className="text-sm font-medium text-blue-600 hover:text-blue-700 px-3 py-2 rounded-lg hover:bg-blue-50 transition"
              >
                Sign In
              </Link>
            </div>
            <div className="mt-3">
              <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">
                Free ATS Resume Checker
              </h1>
              <p className="text-sm text-gray-600 mt-1">
                Analyze how your resume performs with Applicant Tracking Systems
              </p>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="max-w-7xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Input Section */}
            <div className="lg:col-span-2 space-y-4">
              {/* File Upload */}
              <div className="bg-white rounded-lg shadow-sm p-5 border border-gray-200">
                <h2 className="text-lg font-semibold text-gray-900 mb-3">Upload Resume</h2>
                <div
                  onDragOver={handleDragOver}
                  onDragLeave={handleDragLeave}
                  onDrop={handleDrop}
                  className={`border-2 border-dashed rounded-lg p-6 text-center transition cursor-pointer ${
                    isDragging
                      ? 'border-blue-500 bg-blue-50'
                      : 'border-gray-300 hover:border-gray-400'
                  } ${isUploading ? 'opacity-50 cursor-not-allowed' : ''}`}
                >
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept=".pdf,.doc,.docx"
                    onChange={(e) => {
                      const file = e.target.files?.[0]
                      if (file) handleFileUpload(file)
                    }}
                    className="hidden"
                    disabled={isUploading}
                  />
                  <div
                    onClick={() => !isUploading && fileInputRef.current?.click()}
                    className="space-y-2"
                  >
                    {isUploading ? (
                      <>
                        <div className="flex items-center justify-center space-x-2">
                          <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-600"></div>
                          <span className="text-blue-600 font-medium text-sm">Processing...</span>
                        </div>
                        <div className="text-xs text-gray-600">Extracting text from your document</div>
                      </>
                    ) : (
                      <>
                        <div className="text-3xl">📄</div>
                        <div className="text-sm font-medium text-gray-900">
                          Click to upload or drag and drop
                        </div>
                        <div className="text-xs text-gray-600">
                          Supported: PDF, DOC, DOCX files
                        </div>
                      </>
                    )}
                    {fileName && (
                      <div className="text-xs text-green-600 font-medium mt-2">
                        ✓ {fileName}
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Resume Text Area */}
              <div className="bg-white rounded-lg shadow-sm p-5 border border-gray-200">
                <div className="flex items-center justify-between mb-3">
                  <h2 className="text-lg font-semibold text-gray-900">
                    Or Paste Resume
                    {fileName && <span className="text-green-600 text-sm ml-2">(✓ {fileName})</span>}
                  </h2>
                  {resumeText.length > 0 && (
                    <span className="text-xs text-gray-600">
                      {resumeText.length} characters
                    </span>
                  )}
                </div>
                <textarea
                  ref={resumeInputRef}
                  value={resumeText}
                  onChange={(e) => setResumeText(e.target.value)}
                  placeholder="Paste your resume text here or upload a PDF/DOC/DOCX file above..."
                  className="w-full h-52 p-3 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                  disabled={isUploading}
                />
              </div>

              {/* Job Description Input */}
              <div className="bg-white rounded-lg shadow-sm p-5 border border-gray-200">
                <div className="flex items-center justify-between mb-3">
                  <h2 className="text-lg font-semibold text-gray-900">Job Description</h2>
                  {jobDescription.length > 0 && (
                    <span className="text-xs text-gray-600">
                      {jobDescription.length} characters
                    </span>
                  )}
                </div>
                <textarea
                  ref={jobInputRef}
                  value={jobDescription}
                  onChange={(e) => setJobDescription(e.target.value)}
                  placeholder="Paste the job description here..."
                  className="w-full h-40 p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none text-sm"
                />
              </div>

              {/* Error Message */}
              {error && (
                <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
                  ⚠️ {error}
                </div>
              )}

              {/* Success Message */}
              {emailSuccess && (
                <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg text-sm">
                  ✓ Report sent successfully! Check your email.
                </div>
              )}

              {/* Analyze Button */}
              <button
                onClick={handleAnalyze}
                disabled={isAnalyzing || !resumeText.trim() || !jobDescription.trim()}
                className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white font-semibold py-3 rounded-lg transition-colors text-sm"
              >
                {isAnalyzing ? '⏳ Analyzing...' : '✨ Analyze My Resume'}
              </button>
            </div>

            {/* Results Section */}
            <div className="lg:col-span-1">
              {results ? (
                <div className="space-y-4">
                  {/* Overall Score */}
                  <div className="bg-white rounded-lg shadow-sm p-5 border border-gray-200">
                    <h3 className="text-sm font-medium text-gray-700 mb-3">Overall Score</h3>
                    <div className="text-center">
                      <div
                        className="w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-3"
                        style={{
                          backgroundColor: `${getScoreColor(results.atsScore.overall)}20`,
                          border: `3px solid ${getScoreColor(results.atsScore.overall)}`
                        }}
                      >
                        <div className="text-center">
                          <div
                            className="text-2xl font-bold"
                            style={{ color: getScoreColor(results.atsScore.overall) }}
                          >
                            {results.atsScore.overall}
                          </div>
                          <div className="text-xs text-gray-600">/100</div>
                        </div>
                      </div>
                      <p className="text-base font-semibold text-gray-900">
                        {getScoreLabel(results.atsScore.overall)}
                      </p>
                      <p className="text-xs text-gray-600 mt-1">
                        {results.matchPercentage}% keyword match
                      </p>
                    </div>
                  </div>

                  {/* Score Breakdown */}
                  <div className="bg-white rounded-lg shadow-sm p-5 border border-gray-200">
                    <h3 className="text-sm font-medium text-gray-700 mb-3">Breakdown</h3>
                    <div className="space-y-2">
                      {[
                        { label: 'Formatting', value: results.atsScore.formatting },
                        { label: 'Keywords', value: results.atsScore.keywords },
                        { label: 'Sections', value: results.atsScore.sections }
                      ].map((item, idx) => (
                        <div key={idx}>
                          <div className="flex justify-between text-xs mb-1">
                            <span className="text-gray-700 font-medium">{item.label}</span>
                            <span className="text-gray-900 font-semibold">{item.value}%</span>
                          </div>
                          <div className="w-full bg-gray-200 rounded-full h-1.5">
                            <div
                              className="bg-blue-600 h-1.5 rounded-full transition-all"
                              style={{ width: `${item.value}%` }}
                            />
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Send Email Button */}
                  <button
                    onClick={() => setShowEmailForm(!showEmailForm)}
                    className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-2 rounded-lg transition-colors text-sm"
                  >
                    📧 Email Report
                  </button>

                  {showEmailForm && (
                    <div className="bg-white rounded-lg shadow-sm p-4 border border-gray-200 space-y-2">
                      <input
                        type="text"
                        value={emailData.name}
                        onChange={(e) => setEmailData({ ...emailData, name: e.target.value })}
                        placeholder="Your name"
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                      />
                      <input
                        type="email"
                        value={emailData.email}
                        onChange={(e) => setEmailData({ ...emailData, email: e.target.value })}
                        placeholder="Your email"
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                      />
                      <button
                        onClick={handleSendEmail}
                        disabled={emailSending}
                        className="w-full bg-indigo-600 hover:bg-indigo-700 disabled:bg-gray-400 text-white font-medium py-2 rounded-lg text-sm transition-colors"
                      >
                        {emailSending ? 'Sending...' : 'Send Report'}
                      </button>
                    </div>
                  )}
                </div>
              ) : (
                <div className="bg-white rounded-lg shadow-sm p-5 border border-gray-200 text-center">
                  <p className="text-sm text-gray-600">
                    💡 Results will appear here
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Detailed Results */}
          {results && (
            <div className="mt-10 space-y-6">
              {/* Keywords Analysis */}
              <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
                <h2 className="text-xl font-bold text-gray-900 mb-4">Keywords Analysis</h2>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Present Keywords */}
                  <div>
                    <h3 className="text-sm font-semibold text-green-700 mb-3">✓ Present Keywords ({results.keywords.present.length})</h3>
                    <div className="flex flex-wrap gap-2">
                      {results.keywords.present.map((keyword, idx) => (
                        <span
                          key={idx}
                          className="bg-green-100 text-green-700 px-3 py-1 rounded-full text-xs font-medium"
                        >
                          {keyword}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Missing Keywords */}
                  <div>
                    <h3 className="text-sm font-semibold text-red-700 mb-3">✗ Missing Keywords ({results.keywords.missing.length})</h3>
                    <div className="flex flex-wrap gap-2">
                      {results.keywords.missing.map((keyword, idx) => (
                        <span
                          key={idx}
                          className="bg-red-100 text-red-700 px-3 py-1 rounded-full text-xs font-medium"
                        >
                          {keyword}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              {/* Issues & Recommendations */}
              {(results.issues.critical.length > 0 ||
                results.issues.warnings.length > 0 ||
                results.issues.suggestions.length > 0) && (
                <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
                  <h2 className="text-xl font-bold text-gray-900 mb-4">Issues & Recommendations</h2>

                  {results.issues.critical.length > 0 && (
                    <div className="mb-5 pb-5 border-b">
                      <h3 className="text-sm font-semibold text-red-700 mb-2">🔴 Critical Issues</h3>
                      <ul className="space-y-1">
                        {results.issues.critical.map((issue, idx) => (
                          <li key={idx} className="flex items-start">
                            <span className="text-red-600 mr-2 text-sm">•</span>
                            <span className="text-gray-700 text-sm">{issue}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {results.issues.warnings.length > 0 && (
                    <div className="mb-5 pb-5 border-b">
                      <h3 className="text-sm font-semibold text-amber-700 mb-2">⚠️ Warnings</h3>
                      <ul className="space-y-1">
                        {results.issues.warnings.map((warning, idx) => (
                          <li key={idx} className="flex items-start">
                            <span className="text-amber-600 mr-2 text-sm">•</span>
                            <span className="text-gray-700 text-sm">{warning}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {results.issues.suggestions.length > 0 && (
                    <div>
                      <h3 className="text-sm font-semibold text-blue-700 mb-2">💡 Suggestions</h3>
                      <ul className="space-y-1">
                        {results.issues.suggestions.map((suggestion, idx) => (
                          <li key={idx} className="flex items-start">
                            <span className="text-blue-600 mr-2 text-sm">•</span>
                            <span className="text-gray-700 text-sm">{suggestion}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              )}

              {/* Sections Detected */}
              <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
                <h2 className="text-xl font-bold text-gray-900 mb-4">Resume Sections Detected</h2>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                  {Object.entries(results.sections).map(([section, detected]) => (
                    <div key={section} className="flex items-center">
                      <span className={`w-5 h-5 rounded-full flex items-center justify-center mr-2 text-xs font-bold ${detected ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-400'}`}>
                        {detected ? '✓' : '-'}
                      </span>
                      <span className="text-gray-700 text-sm capitalize">
                        {section.replace('has', '')}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Info Section */}
          <div className="mt-10 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg border border-blue-200 p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-3">How It Works</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <h3 className="font-semibold text-gray-900 text-sm mb-1">✨ Keyword Matching</h3>
                <p className="text-gray-600 text-xs">
                  Compares your resume against job description to find matching keywords.
                </p>
              </div>
              <div>
                <h3 className="font-semibold text-gray-900 text-sm mb-1">📋 ATS Formatting</h3>
                <p className="text-gray-600 text-xs">
                  Checks for ATS parsing issues and proper structure.
                </p>
              </div>
              <div>
                <h3 className="font-semibold text-gray-900 text-sm mb-1">💡 Insights</h3>
                <p className="text-gray-600 text-xs">
                  Get actionable recommendations to improve compatibility.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="bg-gray-900 text-gray-400 py-6 mt-12">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <p className="text-sm">© 2025 Cloud9 Resume. All rights reserved.</p>
          </div>
        </div>
      </div>
    </>
  )
}

export default PublicATSChecker
