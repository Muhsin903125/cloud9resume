# Vercel Deployment Guide

## Automatic API Deployment

This project is configured to automatically deploy on Vercel with full API support. The Next.js API routes are automatically converted to Vercel Serverless Functions.

### Environment Variables Required

Before deploying, set these environment variables in your Vercel project settings:

```
NEXT_PUBLIC_API_URL = https://your-project.vercel.app
SUPABASE_URL = your_supabase_project_url
SUPABASE_ANON_KEY = your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY = your_supabase_service_role_key
```

### Available API Endpoints

#### Authentication APIs
- `POST /api/auth/signin` - User login
- `POST /api/auth/signout` - User logout
- `GET /api/auth/session` - Get current session (requires Bearer token)
- `POST /api/auth/reset-password` - Password reset
- `POST /api/auth/verify-email` - Email verification

#### Plans APIs
- `GET /api/plans/list` - Get all available plans

#### Credits APIs
- `POST /api/credits/useCredit` - Deduct credits from user
- `POST /api/credits/addCredits` - Add credits to user account

### How It Works

1. **Automatic Conversion**: Next.js API routes in `frontend/pages/api/*` are automatically converted to Vercel Serverless Functions
2. **Zero Configuration**: No additional setup needed - just deploy to Vercel
3. **Environment Injection**: All environment variables are automatically injected into the functions
4. **Request Routing**: All API requests are routed to the appropriate handlers

### Deployment Steps

1. Push your code to GitHub
2. Connect your GitHub repository to Vercel
3. Set the root directory to `frontend`
4. Add environment variables in Vercel project settings
5. Deploy! The APIs will be automatically available at `https://your-domain.vercel.app/api/*`

### Testing Deployed APIs

```bash
# Test signin endpoint
curl -X POST https://your-domain.vercel.app/api/auth/signin \
  -H "Content-Type: application/json" \
  -d '{"email":"user@example.com","password":"password"}'

# Test plans endpoint
curl https://your-domain.vercel.app/api/plans/list

# Test session endpoint with Bearer token
curl https://your-domain.vercel.app/api/auth/session \
  -H "Authorization: Bearer YOUR_TOKEN"
```

### Monitoring & Debugging

- Check deployment logs in Vercel dashboard
- Use Vercel's built-in monitoring for performance metrics
- View function logs in real-time during API calls
- Check error reports in Vercel analytics

### Cold Start Optimization

The configuration includes `maxLambdaSize": "50mb"` to handle larger dependencies. If functions still timeout:

1. Reduce dependencies
2. Use dynamic imports for heavy modules
3. Consider splitting functions

### API Documentation

See individual API files in `frontend/pages/api/` for detailed request/response documentation.
