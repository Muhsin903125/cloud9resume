import { NextPage } from 'next'
import { useState } from 'react'
import Head from 'next/head'
import Link from 'next/link'
import Button from '../../components/Button'
import Card from '../../components/Card'

interface ATSAnalysis {
  score: number;
  keywords: {
    present: string[];
    missing: string[];
  };
  issues: string[];
  recommendations: string[];
}

const ATSCheckerPage: NextPage = () => {
  const [uploadedFile, setUploadedFile] = useState<File | null>(null)
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [results, setResults] = useState<ATSAnalysis | null>(null)

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      setUploadedFile(file)
    }
  }

  const handleAnalyze = async () => {
    if (!uploadedFile) return
    
    setIsAnalyzing(true)
    // Simulate analysis
    setTimeout(() => {
      setResults({
        score: 85,
        keywords: {
          present: ['javascript', 'react', 'node.js', 'typescript'],
          missing: ['python', 'aws', 'docker', 'kubernetes']
        },
        issues: [
          'Missing contact information section',
          'Skills section could be more detailed',
          'Consider adding more action verbs'
        ],
        recommendations: [
          'Add phone number to contact section',
          'Include technical skills with proficiency levels',
          'Use more industry-specific keywords'
        ]
      })
      setIsAnalyzing(false)
    }, 3000)
  }

  return (
    <>
      <Head>
        <title>ATS Checker - Cloud9 Resume</title>
        <meta name="description" content="Check how well your resume performs with Applicant Tracking Systems" />
      </Head>

      <div className="min-h-screen bg-gray-50">
        <div className="bg-white shadow">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="py-6">
              <nav className="flex space-x-2 text-sm text-gray-600 mb-2">
                <Link href="/dashboard" className="hover:text-gray-900">Dashboard</Link>
                <span>/</span>
                <span className="text-gray-900">ATS Checker</span>
              </nav>
              <h1 className="text-2xl font-bold text-gray-900">ATS Checker</h1>
              <p className="text-gray-600">Optimize your resume for Applicant Tracking Systems</p>
            </div>
          </div>
        </div>

        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {!results ? (
            <Card className="p-8 text-center">
              <div className="text-4xl mb-4">🎯</div>
              <h2 className="text-xl font-semibold text-gray-900 mb-4">
                Upload Your Resume for ATS Analysis
              </h2>
              <p className="text-gray-600 mb-8">
                Get detailed feedback on how well your resume performs with Applicant Tracking Systems
              </p>
              
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 mb-6">
                <input
                  type="file"
                  accept=".pdf,.doc,.docx"
                  onChange={handleFileUpload}
                  className="hidden"
                  id="resume-upload"
                />
                <label htmlFor="resume-upload" className="cursor-pointer">
                  <div className="text-gray-600">
                    <svg className="w-12 h-12 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                    </svg>
                    <p className="text-lg font-medium">Drop your resume here or click to upload</p>
                    <p className="text-sm">Supports PDF, DOC, DOCX files</p>
                  </div>
                </label>
              </div>

              {uploadedFile && (
                <div className="mb-6">
                  <p className="text-sm text-gray-600 mb-4">
                    Selected: {uploadedFile.name}
                  </p>
                  <Button
                    onClick={handleAnalyze}
                    variant="primary"
                    disabled={isAnalyzing}
                  >
                    {isAnalyzing ? 'Analyzing...' : 'Analyze Resume'}
                  </Button>
                </div>
              )}
            </Card>
          ) : (
            <div className="space-y-6">
              <Card className="p-6">
                <div className="text-center">
                  <div className="text-4xl font-bold text-green-600 mb-2">{results.score}%</div>
                  <h2 className="text-xl font-semibold text-gray-900">ATS Compatibility Score</h2>
                  <p className="text-gray-600">Your resume is well-optimized for most ATS systems</p>
                </div>
              </Card>

              <div className="grid md:grid-cols-2 gap-6">
                <Card className="p-6">
                  <h3 className="text-lg font-semibold text-red-600 mb-4">Issues Found</h3>
                  <ul className="space-y-2">
                    {results.issues.map((issue: string, index: number) => (
                      <li key={index} className="flex items-start">
                        <span className="text-red-500 mr-2">•</span>
                        <span className="text-gray-700">{issue}</span>
                      </li>
                    ))}
                  </ul>
                </Card>

                <Card className="p-6">
                  <h3 className="text-lg font-semibold text-green-600 mb-4">Recommendations</h3>
                  <ul className="space-y-2">
                    {results.recommendations.map((rec: string, index: number) => (
                      <li key={index} className="flex items-start">
                        <span className="text-green-500 mr-2">•</span>
                        <span className="text-gray-700">{rec}</span>
                      </li>
                    ))}
                  </ul>
                </Card>
              </div>

              <div className="flex justify-center space-x-4">
                <Button
                  onClick={() => {
                    setResults(null)
                    setUploadedFile(null)
                  }}
                  variant="secondary"
                >
                  Check Another Resume
                </Button>
                <Button variant="primary">
                  Download Detailed Report
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  )
}

export default ATSCheckerPage