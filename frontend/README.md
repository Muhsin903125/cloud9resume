# Cloud9 Resume - Frontend

This is the frontend application for Cloud9 Resume, built with Next.js using the Pages Router architecture.

## Project Structure

```
frontend/
├─ pages/
│  ├─ index.tsx          # Landing/Home page
│  ├─ login.tsx          # Login page
│  ├─ signup.tsx         # Signup page
│  ├─ plans.tsx          # Plan selection page
│  ├─ profile.tsx        # Profile & settings page
│  ├─ dashboard/
│  │  ├─ index.tsx       # Dashboard overview
│  │  ├─ resume.tsx      # Resume Builder
│  │  ├─ portfolio.tsx   # Portfolio Builder
│  │  ├─ ats.tsx         # ATS Checker
│  │  └─ credits.tsx     # Credit usage and refill
│  └─ _app.tsx           # App wrapper with Tailwind, providers
│
├─ components/           # Reusable components
│  ├─ Navbar.tsx
│  ├─ Footer.tsx
│  ├─ Button.tsx
│  ├─ Card.tsx
│  └─ Modal.tsx
│
├─ lib/                  # Utility functions, API clients, auth hooks
│  ├─ supabaseClient.ts  # Supabase connection
│  ├─ api.ts             # API helper functions
│  └─ auth.ts            # Authentication helpers
│
├─ styles/               # Tailwind CSS globals and overrides
│  └─ globals.css
│
├─ public/               # Static assets (images, icons, fonts)
│
├─ tsconfig.json         # TypeScript configuration
├─ package.json
├─ tailwind.config.ts
└─ postcss.config.js
```

## Features

- **Landing Page**: Marketing page with features, pricing, and call-to-actions
- **Authentication**: Login/signup pages with form validation
- **Dashboard**: Protected area with navigation sidebar for authenticated users
- **Resume Builder**: Create and manage professional resumes
- **Portfolio Builder**: Showcase projects and work
- **ATS Checker**: Optimize resumes for Applicant Tracking Systems
- **Credit System**: Manage usage and purchase additional credits
- **Profile Settings**: User account management

## Getting Started

1. Install dependencies:
```bash
npm install
```

2. Run the development server:
```bash
npm run dev
```

3. Open [http://localhost:3000](http://localhost:3000) in your browser.

## Tech Stack

- **Framework**: Next.js 16 (Pages Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **Authentication**: Supabase (placeholder implementation)
- **Components**: Custom React components
- **State Management**: React hooks
- **API**: Custom API client wrapper

## Pages Overview

### Public Pages
- `/` - Landing page with marketing content
- `/login` - User authentication
- `/signup` - User registration
- `/plans` - Pricing and plan selection

### Protected Pages (Dashboard)
- `/dashboard` - Overview with stats and quick actions
- `/dashboard/resume` - Resume builder and management
- `/dashboard/portfolio` - Portfolio creation and management
- `/dashboard/ats` - ATS optimization checker
- `/dashboard/credits` - Credit usage and purchase
- `/profile` - User profile and account settings

## Key Components

- **Navbar**: Main navigation with responsive design
- **Footer**: Site-wide footer with links and information
- **Button**: Reusable button component with variants
- **Card**: Container component for content sections
- **Modal**: Overlay component for dialogs and forms

## Development Notes

- Uses TypeScript for type safety
- Tailwind CSS for utility-first styling
- Pages Router for file-based routing
- Custom authentication helpers (Supabase ready)
- Responsive design with mobile-first approach
- Component composition for reusability

## TODO

- [ ] Implement actual Supabase authentication
- [ ] Add API endpoints and backend integration
- [ ] Implement resume editor functionality
- [ ] Add portfolio builder features
- [ ] Integrate ATS checking service
- [ ] Add payment processing for credits
- [ ] Implement file upload and management
- [ ] Add tests for components and pages
- [ ] Add error boundaries and better error handling
- [ ] Optimize for SEO and performance
