import { NextApiRequest, NextApiResponse } from 'next'

/**
 * Google OAuth Callback Handler
 * Google redirects here after user authentication
 * URL receives: /api/auth/callback/google#id_token=...
 * 
 * This is an API route that handles the OAuth callback
 * and redirects to the appropriate page with the token
 */
export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  // This is a redirect endpoint - Google sends the user here with the token in the URL hash
  // Since this is an API route, we need to redirect to a page that can handle client-side token extraction
  
  console.log('Google callback received')
  console.log('URL:', req.url)
  console.log('Query:', req.query)

  // Redirect to the auth callback page which will handle the token
  // The hash parameters are preserved during redirect
  res.redirect(307, '/auth/google/callback')
}
