# Vercel Deployment - Working Configuration

## Problem
- Vercel couldn't find output directory
- Monorepo structure confusion (frontend/ vs backend/)

## Solution
**Simplified `vercel.json`:**
```json
{
  "buildCommand": "cd frontend && npm run build",
  "outputDirectory": "frontend/.next",
  "installCommand": "cd frontend && npm install"
}
```

## How It Works

1. **Install Command**: Installs dependencies from `frontend/package.json`
2. **Build Command**: Builds Next.js from the `frontend/` folder
3. **Output Directory**: Tells Vercel to serve from `frontend/.next`

Vercel automatically:
- ✅ Detects Next.js
- ✅ Routes `/api/*` to `frontend/pages/api/*` (serverless functions)
- ✅ Serves pages from `frontend/pages/`

## What To Do

### Step 1: Push Code
```bash
git add vercel.json
git commit -m "Simplify Vercel config - build from frontend only"
git push origin main
```

### Step 2: Vercel Auto-Deploys
Go to: https://vercel.com/dashboard → cloud9resume → Deployments

Wait for status: **"Ready"** ✅

### Step 3: Verify Environment Variables
Still need to set in Vercel Dashboard:
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`

Go to: Settings → Environment Variables

### Step 4: Test
```bash
curl https://cloud9resume.vercel.app/
curl https://cloud9resume.vercel.app/api/auth/session
```

Both should work! ✅

---

## API Routes Working

Your `frontend/pages/api/` routes are now deployed as serverless functions:
- `POST /api/auth/signup` → `frontend/pages/api/auth/signup.ts`
- `POST /api/auth/signin` → `frontend/pages/api/auth/signin.ts`
- `GET /api/auth/session` → `frontend/pages/api/auth/session.ts`
- `GET /api/credits` → `frontend/pages/api/credits/...`
- etc.

All automatic! 🚀

---

## What Changed

**Before:** Complex monorepo routing between `backend/` and `frontend/`

**After:** Simple - just deploy `frontend/` which has everything:
- ✅ Next.js pages
- ✅ API routes in `pages/api/`
- ✅ All dependencies

The `backend/` folder is just for local reference now.

---

Done! Your app should now deploy correctly. 🎉
