# Cloud9Resume — Resume Builder + Portfolio + ATS Checker

## Overview
Cloud9Resume is a lightweight, responsive, and user-friendly platform to build resumes, portfolios, and check ATS compatibility. The platform supports Free, Starter, Pro, and Pro+ plans with a credit-based AI system. Phase 1 MVP focuses on resume building, portfolio preview, and public ATS checking.

## Tech Stack
- Frontend: Next.js (Page Router) + Tailwind CSS
- Backend: Node.js serverless API on Vercel
- Database: Supabase (Postgres + Auth + Storage)
- Hosting: Vercel for frontend and backend functions
- Authentication: Email + OAuth (Google, LinkedIn, GitHub)
- AI Integration: OpenAI API or similar token-based AI for resume generation, JD optimization, cover letters

## Authentication & Plans
- Multi-login: Google, LinkedIn, GitHub, Email/Password
- Plan types: Free, Starter (First-job seekers), Pro, Pro+
- Primary email locked for Free/Starter
- Plan features defined in the features chart (Word doc)
- Credit usage per AI action and add-on packs implemented

## Dashboard & UX
- ChatGPT-style, minimalistic, responsive, lightweight
- Sections: Resume overview, Portfolio preview, Credit usage, Plan upgrade CTA
- Light/dark theme optional
- Responsive across desktop and mobile

## Resume Builder
- Sections: Personal info, Education, Skills, Projects, Experience
- Templates: Basic (Free), 5 templates (Pro), 10 templates (Pro+)
- Drag & drop sections for Pro/Pro+
- Export: PDF (Free/Starter), PDF/Word/Markdown (Pro/Pro+)

## Portfolio Builder
- Preview only (Free), Full export (Starter/Pro), GitHub Pages export (Pro/Pro+)
- Controlled sections for Free/Starter
- Custom branding for Pro+

## AI / Credit System
- AI Resume Generation, Cover Letter, JD Optimization, Portfolio Suggestions
- Credits included per plan (Free 10, Starter 15, Pro 100/month, Pro+ 200/month)
- Add-on: 10 credits = ₹99
- Credit consumption per action detailed in Word doc

## Public ATS Checker
- Free keyword match + % score for all users
- AI-based scoring for Pro/Pro+
- Email report generation to capture leads

## Screens & Navigation
- Auth: Landing / Signup / Plan Confirmation
- Dashboard: Resume & Portfolio overview, Credit usage
- Resume Builder: Editor, Preview, JD Optimizer, Export
- Portfolio Builder: Editor, Preview + Export
- AI / Credit Management: Dashboard + Modals
- Plans / Pricing, Profile / Settings, Public ATS Checker, Notifications / Help modal

## Frontend Page Router Structure
- `pages/index.js`: Landing / Home
- `pages/login.js`: Login page
- `pages/signup.js`: Signup page
- `pages/dashboard/index.js`: Dashboard overview
- `pages/dashboard/resume.js`: Resume Builder
- `pages/dashboard/portfolio.js`: Portfolio Builder
- `pages/dashboard/ats.js`: Public ATS Checker
- `pages/dashboard/credits.js`: Credit usage and refill
- `pages/plans.js`: Plan selection & upgrade
- `pages/profile.js`: Profile & settings
- `_app.js`: Global Tailwind, providers, auth wrapper

## Phase 1 MVP Tasks
### Frontend
1. Implement auth system (Email + OAuth)
2. Dashboard with resume & portfolio overview
3. Resume Builder (editor + preview + PDF export)
4. Portfolio Builder (preview only for Free)
5. Public ATS Checker (keyword match + email report)
6. Credit preview, add-on prompts, plan upgrade modals

### Backend
1. User & Plan Management (Supabase)
2. Resume CRUD APIs
3. Portfolio CRUD APIs
4. ATS Checker API
5. Credit usage & refill APIs
6. Export PDF API

### DB Design (Supabase)
- Users, Plans, Resumes, Portfolio, Credits, ATS Reports
- Supabase Storage for PDF/Portfolio media
- Relationships and constraints implemented in Supabase

## MVP Phases
1. **Phase 1:** Free/Starter features (Resume Builder, Portfolio Preview, Public ATS Checker, Credit preview)
2. **Phase 2:** Paid features (Pro/Pro+, AI Resume Generator, Cover Letters, JD optimization, Portfolio Export, Multiple Resume Slots, Credit Refill System)
3. **Phase 3:** Global expansion (Multi-language support, Custom domain branding, Referral/Gamification, LinkedIn Auto-update, Advanced Analytics)

## Performance & Security
- Serverless backend on Vercel
- AI calls optimized to reduce token cost
- Duplicate account prevention for Free/Starter
- GDPR & global privacy compliant
- Secure file upload & export formatting

## Branding & Domain
- Brand Name: Cloud9Resume
- Domain: `cloud9resume.com` (or suitable TLD if unavailable)
- Global-friendly and SEO-optimized

## Future Recommendations
- Multi-language ATS scoring
- Referral rewards system
- Advanced analytics dashboard
- Marketing integration for lead capture via email

---
**End of README.md**

