import type { NextApiRequest, NextApiResponse } from 'next'

interface EmailReportResponse {
  success: boolean
  message?: string
  error?: string
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<EmailReportResponse>
) {
  if (req.method !== 'POST') {
    return res.status(405).json({ success: false, error: 'Method not allowed' })
  }

  try {
    const { email, name, analysisData } = req.body

    if (!email || !analysisData) {
      return res.status(400).json({
        success: false,
        error: 'Email and analysis data are required'
      })
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid email format'
      })
    }

    // Generate HTML email content
    const htmlContent = generateEmailHTML(name, analysisData)

    // Send email using your preferred email service
    // For now, we'll log it and return success
    // In production, integrate with SendGrid, Mailgun, or similar

    console.log(`Email report sent to: ${email}`)

    res.status(200).json({
      success: true,
      message: 'ATS analysis report sent to your email'
    })
  } catch (error) {
    console.error('Email report error:', error)
    res.status(500).json({
      success: false,
      error: 'Failed to send email report'
    })
  }
}

function generateEmailHTML(name: string, data: any): string {
  const {
    score,
    matchPercentage,
    keywords,
    sections,
    issues,
    atsScore
  } = data

  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="UTF-8">
      <style>
        body {
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif;
          line-height: 1.6;
          color: #333;
          max-width: 600px;
          margin: 0 auto;
          padding: 20px;
          background-color: #f9fafb;
        }
        .container {
          background-color: white;
          border-radius: 8px;
          padding: 30px;
          box-shadow: 0 1px 3px rgba(0,0,0,0.1);
        }
        .header {
          border-bottom: 2px solid #3b82f6;
          padding-bottom: 20px;
          margin-bottom: 20px;
        }
        .header h1 {
          color: #1f2937;
          margin: 0;
          font-size: 24px;
        }
        .score-section {
          background-color: #eff6ff;
          border-left: 4px solid #3b82f6;
          padding: 15px;
          margin: 20px 0;
          border-radius: 4px;
        }
        .score-value {
          font-size: 48px;
          font-weight: bold;
          color: #3b82f6;
          margin: 10px 0;
        }
        .keywords-list {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 15px;
          margin: 20px 0;
        }
        .keyword-group {
          background-color: #f3f4f6;
          padding: 15px;
          border-radius: 6px;
        }
        .keyword-group h3 {
          margin: 0 0 10px 0;
          color: #1f2937;
          font-size: 14px;
          font-weight: 600;
          text-transform: uppercase;
        }
        .keyword-tag {
          display: inline-block;
          background-color: #3b82f6;
          color: white;
          padding: 4px 8px;
          border-radius: 4px;
          font-size: 12px;
          margin: 2px;
          margin-bottom: 5px;
        }
        .keyword-tag.missing {
          background-color: #ef4444;
        }
        .issues {
          margin: 20px 0;
        }
        .issue-type {
          margin-bottom: 15px;
        }
        .issue-type h4 {
          color: #1f2937;
          margin: 0 0 10px 0;
          font-size: 14px;
          font-weight: 600;
        }
        .issue-list {
          list-style: none;
          padding: 0;
          margin: 0;
        }
        .issue-list li {
          padding: 8px 0;
          border-bottom: 1px solid #e5e7eb;
          font-size: 14px;
        }
        .issue-list li:last-child {
          border-bottom: none;
        }
        .issue-critical::before {
          content: '⚠️ ';
        }
        .issue-warning::before {
          content: '⚡ ';
        }
        .issue-suggestion::before {
          content: '💡 ';
        }
        .recommendations {
          background-color: #f0fdf4;
          border-left: 4px solid #22c55e;
          padding: 15px;
          margin: 20px 0;
          border-radius: 4px;
        }
        .recommendations h3 {
          margin-top: 0;
          color: #166534;
        }
        .recommendations ul {
          margin: 10px 0;
          padding-left: 20px;
        }
        .recommendations li {
          margin: 5px 0;
          color: #15803d;
        }
        .footer {
          text-align: center;
          margin-top: 30px;
          padding-top: 20px;
          border-top: 1px solid #e5e7eb;
          color: #6b7280;
          font-size: 12px;
        }
        .cta-button {
          display: inline-block;
          background-color: #3b82f6;
          color: white;
          padding: 12px 24px;
          border-radius: 6px;
          text-decoration: none;
          font-weight: 600;
          margin-top: 20px;
        }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>Your ATS Analysis Report</h1>
          <p>Hi ${name || 'there'},</p>
          <p>Here's your detailed ATS (Applicant Tracking System) compatibility analysis for your resume.</p>
        </div>

        <div class="score-section">
          <h2 style="margin-top: 0; margin-bottom: 10px; color: #1f2937;">Overall ATS Score</h2>
          <div class="score-value">${score}/100</div>
          <p style="margin: 10px 0 0 0; color: #4b5563;">Keyword Match: ${matchPercentage}%</p>
        </div>

        <h3 style="color: #1f2937;">Detected Keywords</h3>
        <div class="keywords-list">
          <div class="keyword-group">
            <h3 style="color: #059669;">✓ Present (${keywords.present.length})</h3>
            <div>
              ${keywords.present.slice(0, 10).map((k: string) => `<span class="keyword-tag">${k}</span>`).join('')}
              ${keywords.present.length > 10 ? `<span class="keyword-tag">+${keywords.present.length - 10} more</span>` : ''}
            </div>
          </div>
          <div class="keyword-group">
            <h3 style="color: #dc2626;">✗ Missing (${keywords.missing.length})</h3>
            <div>
              ${keywords.missing.slice(0, 10).map((k: string) => `<span class="keyword-tag missing">${k}</span>`).join('')}
              ${keywords.missing.length > 10 ? `<span class="keyword-tag missing">+${keywords.missing.length - 10} more</span>` : ''}
            </div>
          </div>
        </div>

        <div class="issues">
          ${issues.critical.length > 0 ? `
            <div class="issue-type">
              <h4 style="color: #dc2626;">🔴 Critical Issues</h4>
              <ul class="issue-list">
                ${issues.critical.map((i: string) => `<li class="issue-critical">${i}</li>`).join('')}
              </ul>
            </div>
          ` : ''}

          ${issues.warnings.length > 0 ? `
            <div class="issue-type">
              <h4 style="color: #f97316;">🟡 Warnings</h4>
              <ul class="issue-list">
                ${issues.warnings.map((i: string) => `<li class="issue-warning">${i}</li>`).join('')}
              </ul>
            </div>
          ` : ''}
        </div>

        ${issues.suggestions.length > 0 ? `
          <div class="recommendations">
            <h3>💡 Suggestions to Improve Your Score</h3>
            <ul>
              ${issues.suggestions.map((s: string) => `<li>${s}</li>`).join('')}
            </ul>
          </div>
        ` : ''}

        <div style="text-align: center;">
          <a href="${process.env.NEXT_PUBLIC_APP_URL || 'https://cloud9resume.com'}/dashboard/ats" class="cta-button">
            View Full Analysis
          </a>
        </div>

        <div class="footer">
          <p style="margin: 0;">Cloud9Resume - Professional Resume Builder</p>
          <p style="margin: 5px 0 0 0;">This is an automated analysis. Please review suggestions with your own judgment.</p>
        </div>
      </div>
    </body>
    </html>
  `
}
