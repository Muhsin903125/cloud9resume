const LOGO_URL = "https://cloud9profile.com/logo.png";
const APP_URL = process.env.NEXT_PUBLIC_APP_URL || "https://cloud9profile.com";

const BASE_STYLE = `
  body { font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.5; color: #1e293b; background-color: #f1f5f9; margin: 0; padding: 0; -webkit-text-size-adjust: 100%; -ms-text-size-adjust: 100%; }
  .container { width: 100%; max-width: 600px; margin: 0 auto; -webkit-font-smoothing: antialiased; }
  .wrapper { padding: 16px 8px; }
  .card { background-color: #ffffff; border-radius: 12px; padding: 24px; box-shadow: 0 1px 3px 0 rgba(0, 0, 0, 0.1); }
  @media only screen and (max-width: 480px) {
    .wrapper { padding: 12px 6px !important; }
    .card { padding: 20px 16px !important; }
    .logo { height: 28px !important; margin-bottom: 20px !important; }
    h1 { font-size: 18px !important; }
    p { font-size: 14px !important; }
    .button { width: 100% !important; text-align: center !important; box-sizing: border-box !important; }
    .info-value { font-size: 12px !important; }
  }
  .logo { display: block; height: 32px; margin-bottom: 24px; }
  h1 { font-size: 22px; font-weight: 700; color: #0f172a; margin-top: 0; margin-bottom: 12px; line-height: 1.25; }
  h2 { font-size: 16px; font-weight: 600; color: #1e293b; margin-top: 20px; margin-bottom: 8px; }
  p { font-size: 15px; color: #475569; margin-bottom: 12px; }
  .button { display: inline-block; background-color: #2563eb; color: #ffffff !important; padding: 12px 24px; border-radius: 8px; text-decoration: none; font-weight: 600; font-size: 14px; }
  .footer { margin-top: 24px; text-align: center; font-size: 12px; color: #94a3b8; }
  .divider { height: 1px; background-color: #e2e8f0; margin: 20px 0; }
  .info-box { background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 12px; margin: 12px 0; }
  .info-table { width: 100%; border-collapse: collapse; }
  .info-table td { padding: 8px 0; border-bottom: 1px solid #f1f5f9; font-size: 13px; vertical-align: top; }
  .info-table tr:last-child td { border-bottom: none; }
  .info-label { color: #64748b; width: 40%; }
  .info-value { color: #0f172a; font-weight: 600; text-align: right; width: 60%; word-break: break-all; }
  ul { padding-left: 18px; margin: 12px 0; }
  li { color: #475569; padding: 2px 0; font-size: 14px; }
`;

interface PlanDetails {
  name: string;
  credits: number;
  resumeLimit: number | string;
  features: string[];
}

const PLAN_DETAILS: Record<string, PlanDetails> = {
  free: {
    name: "Free",
    credits: 25,
    resumeLimit: 3,
    features: [
      "3 Resumes",
      "Basic templates",
      "PDF export",
      "ATS score analysis",
    ],
  },
  starter: {
    name: "Starter",
    credits: 50,
    resumeLimit: 5,
    features: [
      "5 Resumes",
      "All templates",
      "PDF and DOCX export",
      "Portfolio page",
    ],
  },
  pro: {
    name: "Professional",
    credits: 200,
    resumeLimit: "Unlimited",
    features: [
      "Unlimited Resumes",
      "Premium templates",
      "Unlimited exports",
      "Custom portfolio domain",
      "Priority support",
    ],
  },
  pro_plus: {
    name: "Premium",
    credits: 500,
    resumeLimit: "Unlimited",
    features: [
      "Everything in Professional",
      "Custom Domain for Portfolio",
      "Interview Prep AI",
      "LinkedIn Optimization",
    ],
  },
};

export function registrationSuccessTemplate(
  name: string,
  email: string,
  planId: string = "free",
  customCredits?: number,
) {
  const plan = PLAN_DETAILS[planId] || PLAN_DETAILS.free;
  const creditsToShow =
    customCredits !== undefined ? customCredits : plan.credits;

  return `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <style>${BASE_STYLE}</style>
      </head>
      <body>
        <div class="container">
          <div class="wrapper">
            <div class="card">
              <img src="${LOGO_URL}" alt="Cloud9Profile" class="logo">
              <h1>Welcome to Cloud9Profile</h1>
              <p>Hi ${name},</p>
              <p>Your account is ready! Start building professional, ATS-friendly resumes and portfolios in minutes.</p>
              
              <h2>Your Account Details</h2>
              <div class="info-box">
                <table class="info-table">
                  <tr>
                    <td class="info-label">Email</td>
                    <td class="info-value">${email}</td>
                  </tr>
                  <tr>
                    <td class="info-label">Plan</td>
                    <td class="info-value">${plan.name}</td>
                  </tr>
                  <tr>
                    <td class="info-label">Initial Credits</td>
                    <td class="info-value">${creditsToShow} credits</td>
                  </tr>
                  <tr>
                    <td class="info-label">Resume Limit</td>
                    <td class="info-value">${plan.resumeLimit}</td>
                  </tr>
                </table>
              </div>

              <h2>Included in Your Plan</h2>
              <ul>
                ${plan.features.map((f) => `<li>${f}</li>`).join("")}
              </ul>

              <h2>Credit Usage</h2>
              <div class="info-box">
                <table class="info-table">
                  <tr>
                    <td class="info-label">AI Import</td>
                    <td class="info-value">5 credits</td>
                  </tr>
                  <tr>
                    <td class="info-label">PDF Export</td>
                    <td class="info-value">1 credit</td>
                  </tr>
                  <tr>
                    <td class="info-label">DOCX Export</td>
                    <td class="info-value">2 credits</td>
                  </tr>
                  <tr>
                    <td class="info-label">ATS Analysis</td>
                    <td class="info-value">3 credits</td>
                  </tr>
                </table>
              </div>

              <div style="margin-top: 24px; text-align: center;">
                <a href="${APP_URL}/dashboard" class="button">Go to Dashboard</a>
              </div>
              
              <div class="divider"></div>
              <p style="font-size: 13px; color: #64748b; margin-bottom: 0;">Questions? Reply to this email or visit our <a href="${APP_URL}/help" style="color: #2563eb;">help center</a>.</p>
            </div>
            <div class="footer">
              &copy; ${new Date().getFullYear()} Cloud9Profile. All rights reserved.
            </div>
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
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <style>${BASE_STYLE}</style>
      </head>
      <body>
        <div class="container">
          <div class="wrapper">
            <div class="card">
              <img src="${LOGO_URL}" alt="Cloud9Profile" class="logo">
              <h1>Reset Your Password</h1>
              <p>Click the button below to choose a new password for your account:</p>
              <div style="text-align: center; margin: 24px 0;">
                <a href="${resetUrl}" class="button">Reset Password</a>
              </div>
              <p style="font-size: 13px; color: #64748b;">If you didn't request this, you can safely ignore this email. Link expires in 1 hour.</p>
              <div class="divider"></div>
              <p style="font-size: 12px; color: #94a3b8; margin-bottom: 8px;">Button not working? Copy this URL:</p>
              <p style="font-size: 11px; color: #94a3b8; word-break: break-all;">${resetUrl}</p>
            </div>
            <div class="footer">
              &copy; ${new Date().getFullYear()} Cloud9Profile. All rights reserved.
            </div>
          </div>
        </div>
      </body>
    </html>
  `;
}

export function planUpgradeTemplate(
  name: string,
  planName: string,
  credits: number,
) {
  return `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <style>${BASE_STYLE}</style>
      </head>
      <body>
        <div class="container">
          <div class="wrapper">
            <div class="card">
              <img src="${LOGO_URL}" alt="Cloud9Profile" class="logo">
              <h1>Plan Upgraded!</h1>
              <p>Hi ${name},</p>
              <p>Your account has been successfully upgraded to the <span style="color: #2563eb; font-weight: 700;">${planName}</span> plan.</p>
              
              <div class="info-box">
                <table class="info-table">
                  <tr>
                    <td class="info-label">New Plan</td>
                    <td class="info-value">${planName}</td>
                  </tr>
                  <tr>
                    <td class="info-label">Credits Added</td>
                    <td class="info-value">${credits} credits</td>
                  </tr>
                </table>
              </div>
              
              <p>Use your new credits to optimize your resume and build your professional portfolio.</p>
              
              <div style="text-align: center; margin: 24px 0;">
                <a href="${APP_URL}/dashboard/credits" class="button">View My Credits</a>
              </div>
              <div class="divider"></div>
              <p style="margin-bottom: 0;">Thank you for choosing Cloud9Profile.</p>
            </div>
            <div class="footer">
              &copy; ${new Date().getFullYear()} Cloud9Profile. All rights reserved.
            </div>
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
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <style>
          ${BASE_STYLE}
          .score-badge { display: inline-block; font-size: 28px; font-weight: 800; color: #2563eb; background: #eff6ff; padding: 10px 20px; border-radius: 12px; margin: 12px 0; }
          .keyword-tag { display: inline-block; padding: 3px 8px; border-radius: 6px; font-size: 11px; font-weight: 600; margin: 2px; }
          .tag-matched { background: #dcfce7; color: #166534; }
          .tag-missing { background: #fee2e2; color: #991b1b; }
          .section-title { font-size: 13px; font-weight: 700; color: #64748b; text-transform: uppercase; margin-top: 20px; margin-bottom: 8px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="wrapper">
            <div class="card">
              <img src="${LOGO_URL}" alt="Cloud9Profile" class="logo">
              <h1>ATS Analysis Report</h1>
              <p>Hi ${
                name || "there"
              }, here is the compatibility score for your resume.</p>
              
              <div style="text-align: center;">
                <div class="score-badge">${score}/100</div>
                <p style="margin-top: 0; font-weight: 600; color: #64748b; font-size: 14px;">Match Strength: ${matchPercentage}%</p>
              </div>

              <div class="divider"></div>

              <div class="section-title">Matched Keywords (${
                matchedKeywords.length
              })</div>
              <div style="margin-bottom: 12px;">
                ${matchedKeywords
                  .slice(0, 10)
                  .map(
                    (k: string) =>
                      `<span class="keyword-tag tag-matched">${k}</span>`,
                  )
                  .join("")}
                ${
                  matchedKeywords.length > 10
                    ? `<span class="keyword-tag tag-matched">+${
                        matchedKeywords.length - 10
                      } more</span>`
                    : ""
                }
              </div>
              
              <div class="section-title">Missing Keywords (${
                missingKeywords.length
              })</div>
              <div>
                ${missingKeywords
                  .slice(0, 10)
                  .map(
                    (k: string) =>
                      `<span class="keyword-tag tag-missing">${k}</span>`,
                  )
                  .join("")}
                ${
                  missingKeywords.length > 10
                    ? `<span class="keyword-tag tag-missing">+${
                        missingKeywords.length - 10
                      } more</span>`
                    : ""
                }
              </div>

              <div class="section-title">Top Recommendations</div>
              <ul style="margin-bottom: 0;">
                ${recommendations
                  .slice(0, 3)
                  .map(
                    (r: any) =>
                      `<li>${
                        typeof r === "string"
                          ? r
                          : r.message || r.recommendation
                      }</li>`,
                  )
                  .join("")}
              </ul>

              <div style="margin-top: 24px; text-align: center;">
                <a href="${APP_URL}/dashboard/ats" class="button">View Full Analysis</a>
              </div>
            </div>
            <div class="footer">
               &copy; ${new Date().getFullYear()} Cloud9Profile. All rights reserved.
            </div>
          </div>
        </div>
      </body>
    </html>
  `;
}

export function exportConfirmationTemplate(
  resumeTitle: string,
  fileUrl: string,
  format: string,
) {
  return `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <style>${BASE_STYLE}</style>
      </head>
      <body>
        <div class="container">
          <div class="wrapper">
            <div class="card">
              <img src="${LOGO_URL}" alt="Cloud9Profile" class="logo">
              <h1>Resume Ready</h1>
              <p>Your resume <strong>${resumeTitle}</strong> has been successfully exported as ${format.toUpperCase()}.</p>
              <div style="text-align: center; margin: 24px 0;">
                <a href="${fileUrl}" class="button">Download Now</a>
              </div>
              <div class="divider"></div>
              <p style="font-size: 13px; color: #64748b; margin-bottom: 0;">Link active for 7 days. Return to your dashboard to edit or re-export at any time.</p>
            </div>
            <div class="footer">
              &copy; ${new Date().getFullYear()} Cloud9Profile. All rights reserved.
            </div>
          </div>
        </div>
      </body>
    </html>
  `;
}

export function creditAdditionTemplate(
  name: string,
  creditsAdded: number,
  totalCredits: number,
) {
  return `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <style>${BASE_STYLE}</style>
      </head>
      <body>
        <div class="container">
          <div class="wrapper">
            <div class="card">
              <img src="${LOGO_URL}" alt="Cloud9Profile" class="logo">
              <h1>Credits Added!</h1>
              <p>Hi ${name},</p>
              <p>Great news! <strong>${creditsAdded} credits</strong> have been added to your account.</p>
              
              <div class="info-box" style="text-align: center;">
                <p style="margin: 0; color: #64748b; font-size: 13px; text-transform: uppercase; letter-spacing: 1px; font-weight: 700;">New Balance</p>
                <p style="margin: 8px 0 0 0; font-size: 32px; font-weight: 800; color: #2563eb;">${totalCredits}</p>
              </div>

              <div style="margin-top: 24px; text-align: center;">
                <a href="${APP_URL}/dashboard" class="button">Use Credits</a>
              </div>
              
              <div class="divider"></div>
              <p style="font-size: 13px; color: #64748b; margin-bottom: 0;">You can use credits for AI generation, ATS checks, and premium exports.</p>
            </div>
            <div class="footer">
              &copy; ${new Date().getFullYear()} Cloud9Profile. All rights reserved.
            </div>
          </div>
        </div>
      </body>
    </html>
  `;
}
