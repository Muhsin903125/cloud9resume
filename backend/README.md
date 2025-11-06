# Cloud9 Resume Backend

A comprehensive backend API for Cloud9 Resume, an AI-powered resume and portfolio builder SaaS application.

## 🚀 Overview

This backend provides serverless API endpoints for authentication, resume/portfolio management, ATS checking, credit system, and more. Built with TypeScript, Supabase, and designed for Vercel deployment.

## 🏗️ Architecture

```
backend/
├── api/                    # Serverless function endpoints
│   ├── auth/              # Authentication endpoints
│   │   ├── login.ts       # User login
│   │   ├── signup.ts      # User registration
│   │   └── oauth.ts       # OAuth (Google, LinkedIn, GitHub)
│   ├── plans/             # Subscription plans
│   │   └── list.ts        # Get available plans
│   ├── credits/           # Credit management
│   │   ├── useCredit.ts   # Deduct credits for actions
│   │   ├── addCredits.ts  # Add credits via purchase
│   │   └── refillHistory.ts # Credit transaction history
│   ├── resumes/           # Resume CRUD operations
│   │   ├── create.ts      # Create new resume
│   │   ├── update.ts      # Update existing resume
│   │   ├── delete.ts      # Delete resume
│   │   ├── list.ts        # List user resumes
│   │   └── export.ts      # Export to PDF/Word
│   ├── portfolio/         # Portfolio CRUD operations
│   │   ├── create.ts      # Create portfolio
│   │   ├── update.ts      # Update portfolio
│   │   └── preview.ts     # Generate preview
│   └── ats/               # ATS optimization
│       ├── check.ts       # Analyze resume against job
│       └── emailReport.ts # Send ATS report via email
├── middleware/            # Request middleware
│   └── authMiddleware.ts  # Authentication verification
├── utils/                 # Utility functions
│   ├── emailSender.ts     # Email service for ATS reports
│   ├── pdfGenerator.ts    # PDF generation for exports
│   └── validator.ts       # Input validation helpers
├── supabaseClient.ts      # Supabase database client
├── package.json           # Dependencies and scripts
├── tsconfig.json          # TypeScript configuration
└── README.md             # This documentation
```

## 🛠️ Tech Stack

- **Runtime**: Node.js 18+
- **Language**: TypeScript
- **Database**: Supabase (PostgreSQL)
- **Authentication**: Supabase Auth
- **Deployment**: Vercel (Serverless Functions)
- **Email**: Nodemailer with SMTP
- **PDF Generation**: PDFKit
- **Validation**: Zod
- **Payments**: Stripe
- **Security**: Helmet, CORS

## 📋 Prerequisites

- Node.js 18 or higher
- npm or yarn
- Supabase project
- SMTP email service
- Stripe account (for payments)

## 🚀 Getting Started

1. **Clone and Install**
   ```bash
   cd backend
   npm install
   ```

2. **Environment Variables**
   Create a `.env.local` file:
   ```env
   # Supabase
   SUPABASE_URL=your_supabase_url
   SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
   SUPABASE_ANON_KEY=your_anon_key

   # Email
   SMTP_HOST=smtp.gmail.com
   SMTP_PORT=587
   SMTP_SECURE=false
   SMTP_USER=your_email@gmail.com
   SMTP_PASS=your_app_password
   FROM_EMAIL=noreply@cloud9resume.com

   # Stripe
   STRIPE_SECRET_KEY=sk_test_...
   STRIPE_WEBHOOK_SECRET=whsec_...

   # Other
   JWT_SECRET=your_jwt_secret
   ```

3. **Database Setup**
   Run the SQL migrations in your Supabase dashboard:

   ```sql
   -- Users profile table
   CREATE TABLE profiles (
     id UUID REFERENCES auth.users(id) PRIMARY KEY,
     email TEXT,
     first_name TEXT,
     last_name TEXT,
     credits INTEGER DEFAULT 5,
     plan TEXT DEFAULT 'free',
     created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
     updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
   );

   -- Resumes table
   CREATE TABLE resumes (
     id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
     user_id UUID REFERENCES profiles(id),
     title TEXT NOT NULL,
     template TEXT NOT NULL,
     data JSONB NOT NULL,
     created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
     updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
   );

   -- Portfolios table
   CREATE TABLE portfolios (
     id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
     user_id UUID REFERENCES profiles(id),
     title TEXT NOT NULL,
     template TEXT NOT NULL,
     data JSONB NOT NULL,
     created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
     updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
   );

   -- ATS results table
   CREATE TABLE ats_results (
     id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
     user_id UUID REFERENCES profiles(id),
     resume_id UUID REFERENCES resumes(id),
     job_description TEXT NOT NULL,
     score INTEGER NOT NULL,
     analysis JSONB NOT NULL,
     created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
   );

   -- Credit usage table
   CREATE TABLE credit_usage (
     id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
     user_id UUID REFERENCES profiles(id),
     action TEXT NOT NULL,
     credits_used INTEGER NOT NULL,
     resume_id UUID REFERENCES resumes(id),
     portfolio_id UUID REFERENCES portfolios(id),
     created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
   );
   ```

4. **Development**
   ```bash
   npm run dev
   ```

5. **Build**
   ```bash
   npm run build
   ```

6. **Deploy**
   ```bash
   npm run deploy
   ```

## 📚 API Documentation

### Authentication Endpoints

#### POST `/api/auth/login`
Login with email and password.

**Request:**
```json
{
  "email": "user@example.com",
  "password": "password123"
}
```

**Response:**
```json
{
  "user": {
    "id": "uuid",
    "email": "user@example.com",
    "profile": {...}
  },
  "session": {
    "access_token": "jwt_token",
    "refresh_token": "refresh_token",
    "expires_at": 1638360000
  }
}
```

#### POST `/api/auth/signup`
Register a new user account.

#### POST `/api/auth/oauth`
OAuth authentication with Google, LinkedIn, or GitHub.

### Resume Endpoints

#### POST `/api/resumes/create`
Create a new resume.

**Request:**
```json
{
  "title": "Software Engineer Resume",
  "template": "modern",
  "data": {
    "personalInfo": {...},
    "summary": "...",
    "experience": [...],
    "education": [...],
    "skills": [...]
  }
}
```

#### GET `/api/resumes/list`
List user's resumes.

#### PUT `/api/resumes/update`
Update an existing resume.

#### DELETE `/api/resumes/delete`
Delete a resume.

#### POST `/api/resumes/export`
Export resume to PDF or Word format.

### ATS Endpoints

#### POST `/api/ats/check`
Analyze resume against job description.

**Request:**
```json
{
  "resumeId": "uuid",
  "jobDescription": "Job description text..."
}
```

**Response:**
```json
{
  "success": true,
  "analysis": {
    "score": 85,
    "keywords": {
      "present": ["javascript", "react", "node"],
      "missing": ["typescript", "aws"]
    },
    "issues": ["Missing email"],
    "recommendations": ["Add TypeScript skill"]
  }
}
```

### Credit System

#### POST `/api/credits/useCredit`
Deduct credits for an action.

**Request:**
```json
{
  "action": "ats_check",
  "resumeId": "uuid"
}
```

#### POST `/api/credits/addCredits`
Add credits via purchase.

#### GET `/api/credits/refillHistory`
Get credit transaction history.

## 💰 Credit System

| Action | Credits Required |
|--------|------------------|
| Resume Creation | 2 |
| Resume Export | 1 |
| ATS Check | 3 |
| Portfolio Creation | 5 |

### Subscription Plans

- **Free**: 5 credits, basic features
- **Starter**: $9.99/month, 50 credits
- **Professional**: $19.99/month, 150 credits

## 🧪 Testing

```bash
npm test
```

## 🔒 Security

- JWT token authentication
- Input validation with Zod
- Rate limiting (implement via Vercel)
- CORS protection
- Helmet security headers
- SQL injection prevention via parameterized queries

## 📊 Monitoring

- Vercel Analytics for performance monitoring
- Supabase logs for database queries
- Error tracking with Sentry (recommended)

## 🚀 Deployment

### Vercel Deployment

1. Connect your GitHub repository to Vercel
2. Set environment variables in Vercel dashboard
3. Deploy automatically on push to main branch

### Environment Variables for Production

Ensure all environment variables are set in your deployment platform.

## 🗺️ Roadmap

### Phase 1 (Current)
- ✅ Basic authentication (email/password)
- ✅ Resume CRUD operations
- ✅ ATS analysis
- ✅ Credit system
- ✅ PDF export

### Phase 2 (Next)
- 🔄 OAuth integration (Google, LinkedIn, GitHub)
- 🔄 Portfolio builder
- 🔄 Advanced ATS analysis with AI
- 🔄 Payment integration (Stripe)
- 🔄 Email notifications

### Phase 3 (Future)
- 🔄 Team collaboration features
- 🔄 Advanced analytics dashboard
- 🔄 API for third-party integrations
- 🔄 White-label solutions
- 🔄 Mobile app API

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests
5. Submit a pull request

## 📝 License

MIT License - see LICENSE file for details.

## 📞 Support

For support, email support@cloud9resume.com or create an issue in this repository.

---

**Cloud9 Resume** - Build better resumes, land better jobs.