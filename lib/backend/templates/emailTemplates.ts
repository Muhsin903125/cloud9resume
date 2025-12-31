const LOGO_URL = "https://cloud9profile.com/logo.png";
const APP_URL = process.env.NEXT_PUBLIC_APP_URL || "https://cloud9profile.com";

const BASE_STYLE = `
  body { font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #1e293b; background-color: #f8fafc; margin: 0; padding: 0; }
  .container { max-width: 600px; margin: 0 auto; padding: 40px 20px; }
  .card { background-color: #ffffff; border-radius: 16px; padding: 40px; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06); }
  .logo { display: block; height: 40px; margin-bottom: 32px; }
  h1 { font-size: 24px; font-weight: 700; color: #0f172a; margin-top: 0; margin-bottom: 16px; }
  h2 { font-size: 18px; font-weight: 600; color: #1e293b; margin-top: 24px; margin-bottom: 12px; }
  p { font-size: 16px; color: #475569; margin-bottom: 16px; }
  .button { display: inline-block; background-color: #2563eb; color: #ffffff !important; padding: 12px 24px; border-radius: 8px; text-decoration: none; font-weight: 600; font-size: 16px; }
  .footer { margin-top: 32px; text-align: center; font-size: 14px; color: #94a3b8; }
  .divider { height: 1px; background-color: #e2e8f0; margin: 24px 0; }
  .highlight { color: #2563eb; font-weight: 600; }
  .info-box { background: #f1f5f9; border-radius: 8px; padding: 16px; margin: 16px 0; }
  .info-row { display: flex; justify-content: space-between; padding: 8px 0; border-bottom: 1px solid #e2e8f0; }
  .info-row:last-child { border-bottom: none; }
  .info-label { color: #64748b; font-size: 14px; }
  .info-value { color: #0f172a; font-weight: 600; font-size: 14px; }
  ul { padding-left: 20px; margin: 16px 0; }
  li { color: #475569; padding: 4px 0; }
`;

interface PlanDetails {
  name: string;
  credits: number;
  resumeLimit: number;
  features: string[];
}

const PLAN_DETAILS: Record<string, PlanDetails> = {
  free: {
    name: "Free",
    credits: 10,
    resumeLimit: 1,
    features: [
      "1 Resume",
      "Basic templates",
      "PDF export",
      "ATS score analysis",
    ],
  },
  starter: {
    name: "Starter",
    credits: 50,
    resumeLimit: 3,
    features: [
      "3 Resumes",
      "All templates",
      "PDF and DOCX export",
      "ATS optimization suggestions",
      "Portfolio page",
    ],
  },
  pro: {
    name: "Pro",
    credits: 200,
    resumeLimit: 10,
    features: [
      "10 Resumes",
      "Premium templates",
      "Unlimited exports",
      "Priority ATS analysis",
      "Custom portfolio domain",
      "Priority support",
    ],
  },
};

export function registrationSuccessTemplate(
  name: string,
  email: string,
  planId: string = "free"
) {
  const plan = PLAN_DETAILS[planId] || PLAN_DETAILS.free;

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
            <h1>Welcome to Cloud9Profile</h1>
            <p>Hi ${name},</p>
            <p>Your account has been successfully created. You are now ready to build professional, ATS-friendly resumes and portfolios.</p>
            
            <h2>Your Account Details</h2>
            <div class="info-box">
              <div class="info-row">
                <span class="info-label">Email</span>
                <span class="info-value">${email}</span>
              </div>
              <div class="info-row">
                <span class="info-label">Plan</span>
                <span class="info-value">${plan.name}</span>
              </div>
              <div class="info-row">
                <span class="info-label">Credits</span>
                <span class="info-value">${plan.credits} credits</span>
              </div>
              <div class="info-row">
                <span class="info-label">Resume Limit</span>
                <span class="info-value">${plan.resumeLimit} ${
    plan.resumeLimit === 1 ? "resume" : "resumes"
  }</span>
              </div>
            </div>

            <h2>What You Can Do</h2>
            <ul>
              ${plan.features.map((f) => `<li>${f}</li>`).join("")}
            </ul>

            <h2>Credit Usage Guide</h2>
            <div class="info-box">
              <div class="info-row">
                <span class="info-label">AI Resume Import</span>
                <span class="info-value">5 credits</span>
              </div>
              <div class="info-row">
                <span class="info-label">PDF Export</span>
                <span class="info-value">1 credit</span>
              </div>
              <div class="info-row">
                <span class="info-label">DOCX Export</span>
                <span class="info-value">2 credits</span>
              </div>
              <div class="info-row">
                <span class="info-label">ATS Analysis</span>
                <span class="info-value">3 credits</span>
              </div>
            </div>

            <div style="margin-top: 32px; text-align: center;">
              <a href="${APP_URL}/dashboard" class="button">Go to Dashboard</a>
            </div>
            
            <div class="divider"></div>
            <p style="font-size: 14px; color: #64748b;">If you have any questions, reply to this email or visit our <a href="${APP_URL}/help" style="color: #2563eb;">help center</a>.</p>
          </div>
          <div class="footer">
            &copy; ${new Date().getFullYear()} Cloud9Profile. All rights reserved.
          </div>
        </div>
      </body>
    </html>
  `;
}

export function welcomeTemplate(name: string) {
  return registrationSuccessTemplate(name, "", "free");
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
            <div style="text-align: center; margin: 32px 0;">
              <a href="${resetUrl}" class="button">Reset Password</a>
            </div>
            <p style="font-size: 14px; color: #64748b;">If you did not request this, you can safely ignore this email. This link will expire in 1 hour.</p>
            <div class="divider"></div>
            <p style="font-size: 14px; color: #94a3b8;">If the button does not work, copy and paste this URL into your browser:</p>
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
            <h1>Plan Upgraded Successfully</h1>
            <p>Hi ${name},</p>
            <p>Your account has been upgraded to the <span class="highlight">${planName}</span> plan.</p>
            
            <div class="info-box">
              <div class="info-row">
                <span class="info-label">New Plan</span>
                <span class="info-value">${planName}</span>
              </div>
              <div class="info-row">
                <span class="info-label">Credits Added</span>
                <span class="info-value">${credits} credits</span>
              </div>
            </div>
            
            <p>You can now use these credits to download resumes, run ATS analysis, and more.</p>
            
            <div style="text-align: center; margin: 32px 0;">
              <a href="${APP_URL}/dashboard/credits" class="button">View My Credits</a>
            </div>
            <div class="divider"></div>
            <p style="font-size: 14px; color: #64748b;">Thank you for choosing Cloud9Profile.</p>
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
            }, here is your resume analysis against Applicant Tracking Systems.</p>
            
            <div style="text-align: center;">
              <div class="score-badge">${score}/100</div>
              <p style="margin-top: 0; font-weight: 600; color: #64748b;">Match Strength: ${matchPercentage}%</p>
            </div>

            <div class="divider"></div>

            <div class="section-title">Matched Keywords (${
              matchedKeywords.length
            })</div>
            <div style="margin-bottom: 12px;">
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
            
            <div class="section-title">Missing Keywords (${
              missingKeywords.length
            })</div>
            <div>
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

            <div class="section-title">Recommendations</div>
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

            <div style="margin-top: 32px; text-align: center;">
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
            <h1>Your Resume is Ready</h1>
            <p>Your resume <strong>${resumeTitle}</strong> has been successfully exported as ${format.toUpperCase()}.</p>
            <p>You can download it using the button below. This link will remain active for 7 days.</p>
            <div style="text-align: center; margin: 32px 0;">
              <a href="${fileUrl}" class="button">Download Resume</a>
            </div>
            <div class="divider"></div>
            <p style="font-size: 14px; color: #64748b;">If you need to make changes, return to your dashboard to edit and re-export.</p>
          </div>
          <div class="footer">
            &copy; ${new Date().getFullYear()} Cloud9Profile. All rights reserved.
          </div>
        </div>
      </body>
    </html>
  `;
}
