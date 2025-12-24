const LOGO_URL = "https://cloud9profile.com/logo.png";
const APP_URL = process.env.NEXT_PUBLIC_APP_URL || "https://cloud9profile.com";

const BASE_STYLE = `
  body { font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #1e293b; background-color: #f8fafc; margin: 0; padding: 0; }
  .container { max-width: 600px; margin: 0 auto; padding: 40px 20px; }
  .card { background-color: #ffffff; border-radius: 16px; padding: 40px; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06); }
  .logo { display: block; height: 40px; margin-bottom: 32px; }
  h1 { font-size: 24px; font-weight: 700; color: #0f172a; margin-top: 0; margin-bottom: 16px; }
  p { font-size: 16px; color: #475569; margin-bottom: 24px; }
  .button { display: inline-block; background-color: #2563eb; color: #ffffff !important; padding: 12px 24px; border-radius: 8px; text-decoration: none; font-weight: 600; font-size: 16px; }
  .footer { margin-top: 32px; text-align: center; font-size: 14px; color: #94a3b8; }
  .divider { height: 1px; background-color: #e2e8f0; margin: 32px 0; }
  .highlight { color: #2563eb; font-weight: 600; }
`;

export function welcomeTemplate(name: string) {
  return `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8">
        <style>${BASE_STYLE}</style>
      </head>
      <body>
        <div class="container">
          <div class="card">
            <img src="${LOGO_URL}" alt="Cloud9Profile" class="logo">
            <h1>Welcome to Cloud9Profile, ${name}! 🚀</h1>
            <p>We're thrilled to have you on board! You're now ready to build ATS-friendly resumes and professional portfolios that stand out.</p>
            <p>With Cloud9Profile, you can:</p>
            <ul style="color: #475569; margin-bottom: 24px;">
              <li>Create text-selectable, ATS-readable resumes</li>
              <li>Build a stunning professional portfolio in seconds</li>
              <li>Get real-time ATS feedback on your PDF</li>
            </ul>
            <a href="${APP_URL}/dashboard" class="button">Go to Dashboard</a>
            <div class="divider"></div>
            <p style="font-size: 14px;">Need help? Reply to this email or visit our <a href="${APP_URL}/help" style="color: #2563eb;">help center</a>.</p>
          </div>
          <div class="footer">
            &copy; ${new Date().getFullYear()} Cloud9Profile. All rights reserved.
          </div>
        </div>
      </body>
    </html>
  `;
}

export function forgotPasswordTemplate(resetUrl: string) {
  return `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8">
        <style>${BASE_STYLE}</style>
      </head>
      <body>
        <div class="container">
          <div class="card">
            <img src="${LOGO_URL}" alt="Cloud9Profile" class="logo">
            <h1>Reset Your Password</h1>
            <p>You requested to reset your password. Click the button below to choose a new one:</p>
            <a href="${resetUrl}" class="button">Reset Password</a>
            <p style="margin-top: 24px; font-size: 14px; color: #64748b;">If you didn't request this, you can safely ignore this email. This link will expire in 1 hour.</p>
            <div class="divider"></div>
            <p style="font-size: 14px; color: #94a3b8;">If you're having trouble clicking the button, copy and paste this URL into your browser:</p>
            <p style="font-size: 12px; color: #94a3b8; word-break: break-all;">${resetUrl}</p>
          </div>
          <div class="footer">
            &copy; ${new Date().getFullYear()} Cloud9Profile. All rights reserved.
          </div>
        </div>
      </body>
    </html>
  `;
}

export function planUpgradeTemplate(
  name: string,
  planName: string,
  credits: number
) {
  return `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8">
        <style>${BASE_STYLE}</style>
      </head>
      <body>
        <div class="container">
          <div class="card">
            <img src="${LOGO_URL}" alt="Cloud9Profile" class="logo">
            <h1>Plan Upgraded Successfully! 🎉</h1>
            <p>Hi ${name}, your account has been upgraded to the <span class="highlight">${planName}</span> plan.</p>
            <p>We've added <span class="highlight">${credits} credits</span> to your account. You can now use these to download resumes, update your portfolio, and more.</p>
            <a href="${APP_URL}/dashboard/credits" class="button">View My Credits</a>
            <div class="divider"></div>
            <p style="font-size: 14px;">Thank you for choosing Cloud9Profile for your career growth!</p>
          </div>
          <div class="footer">
            &copy; ${new Date().getFullYear()} Cloud9Profile. All rights reserved.
          </div>
        </div>
      </body>
    </html>
  `;
}

export function atsReportTemplate(name: string, data: any) {
  const {
    score,
    matchPercentage,
    matchedKeywords = [],
    missingKeywords = [],
    recommendations = [],
  } = data;

  return `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8">
        <style>
          ${BASE_STYLE}
          .score-badge { display: inline-block; font-size: 32px; font-weight: 800; color: #2563eb; background: #eff6ff; padding: 12px 24px; border-radius: 12px; margin: 16px 0; }
          .keyword-tag { display: inline-block; padding: 4px 10px; border-radius: 6px; font-size: 12px; font-weight: 600; margin: 2px; }
          .tag-matched { background: #dcfce7; color: #166534; }
          .tag-missing { background: #fee2e2; color: #991b1b; }
          .section-title { font-size: 14px; font-weight: 700; color: #64748b; text-transform: uppercase; margin-top: 24px; margin-bottom: 12px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="card">
            <img src="${LOGO_URL}" alt="Cloud9Profile" class="logo">
            <h1>Your ATS Analysis Report</h1>
            <p>Hi ${
              name || "there"
            }, here's how your resume stacks up against the Applicant Tracking Systems.</p>
            
            <div style="text-align: center;">
              <div class="score-badge">${score}/100</div>
              <p style="margin-top: 0; font-weight: 600; color: #64748b;">Match Strength: ${matchPercentage}%</p>
            </div>

            <div class="divider"></div>

            <div class="section-title">Keyword Analysis</div>
            <div style="margin-bottom: 12px;">
              <p style="font-size: 14px; margin-bottom: 8px;">Matched (${
                matchedKeywords.length
              }):</p>
              ${matchedKeywords
                .slice(0, 8)
                .map(
                  (k: string) =>
                    `<span class="keyword-tag tag-matched">${k}</span>`
                )
                .join("")}
              ${
                matchedKeywords.length > 8
                  ? `<span class="keyword-tag tag-matched">+${
                      matchedKeywords.length - 8
                    } more</span>`
                  : ""
              }
            </div>
            <div>
              <p style="font-size: 14px; margin-bottom: 8px;">Missing (${
                missingKeywords.length
              }):</p>
              ${missingKeywords
                .slice(0, 8)
                .map(
                  (k: string) =>
                    `<span class="keyword-tag tag-missing">${k}</span>`
                )
                .join("")}
              ${
                missingKeywords.length > 8
                  ? `<span class="keyword-tag tag-missing">+${
                      missingKeywords.length - 8
                    } more</span>`
                  : ""
              }
            </div>

            <div class="section-title">Top Recommendations</div>
            <ul style="color: #475569; padding-left: 20px;">
              ${recommendations
                .slice(0, 3)
                .map(
                  (r: any) =>
                    `<li>${
                      typeof r === "string" ? r : r.message || r.recommendation
                    }</li>`
                )
                .join("")}
            </ul>

            <div style="margin-top: 32px;">
              <a href="${APP_URL}/dashboard/ats" class="button">View Full Analysis</a>
            </div>
          </div>
          <div class="footer">
             &copy; ${new Date().getFullYear()} Cloud9Profile. All rights reserved.
          </div>
        </div>
      </body>
    </html>
  `;
}

export function exportConfirmationTemplate(
  resumeTitle: string,
  fileUrl: string,
  format: string
) {
  return `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8">
        <style>${BASE_STYLE}</style>
      </head>
      <body>
        <div class="container">
          <div class="card">
            <img src="${LOGO_URL}" alt="Cloud9Profile" class="logo">
            <h1>Your Resume is Ready! 📄</h1>
            <p>Great news! Your resume <strong>${resumeTitle}</strong> has been successfully exported as ${format.toUpperCase()}.</p>
            <p>You can download it using the button below. This link will remain active for 7 days.</p>
            <a href="${fileUrl}" class="button">Download Resume</a>
            <div class="divider"></div>
            <p style="font-size: 14px; color: #64748b;">If you need to make changes, head back to your dashboard to edit and re-export.</p>
          </div>
          <div class="footer">
            &copy; ${new Date().getFullYear()} Cloud9Profile. All rights reserved.
          </div>
        </div>
      </body>
    </html>
  `;
}
