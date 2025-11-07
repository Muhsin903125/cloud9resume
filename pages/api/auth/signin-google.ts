import { NextApiRequest, NextApiResponse } from 'next'
import { createClient } from '@supabase/supabase-js'
import { google } from 'googleapis'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!
const googleClientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID!
const googleClientSecret = process.env.GOOGLE_CLIENT_SECRET!

const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey)

// Initialize Google OAuth2
const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'
const oauth2Client = new google.auth.OAuth2(
  googleClientId,
  googleClientSecret,
  `${appUrl}/api/auth/callback/google`
)

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  try {
    const { idToken } = req.body

    // Verify the ID token with Google
    const ticket = await oauth2Client.verifyIdToken({
      idToken,
      audience: googleClientId,
    })

    const payload = ticket.getPayload()

    if (!payload || !payload.email) {
      return res.status(400).json({
        error: 'Invalid token',
        message: 'Could not verify Google token'
      })
    }

    const googleId = payload.sub
    const email = payload.email
    const name = payload.name || ''
    const picture = payload.picture || ''

    // Check if user already exists
    const { data: existingUser, error: searchError } = await supabaseAdmin
      .from('profiles')
      .select('id, email, auth_method')
      .eq('email', email)
      .single()

    if (searchError && searchError.code !== 'PGRST116') {
      // PGRST116 = no rows returned
      console.error('Profile search error:', searchError)
    }

    // If user exists and is email auth, update to use Google
    if (existingUser) {
      if (existingUser.auth_method === 'email') {
        // User signed up with email, now logging in with Google
        const { error: updateError } = await supabaseAdmin
          .from('profiles')
          .update({
            auth_method: 'google',
            provider: 'google',
            provider_id: googleId,
            oauth_data: {
              name,
              picture,
              email,
            },
            last_login_at: new Date().toISOString(),
            login_count: (existingUser as any).login_count ? (existingUser as any).login_count + 1 : 1,
          })
          .eq('id', existingUser.id)

        if (updateError) {
          console.error('Profile update error:', updateError)
        }
      } else if (existingUser.auth_method === 'google') {
        // User already has Google auth, just update login info
        const { error: updateError } = await supabaseAdmin
          .from('profiles')
          .update({
            last_login_at: new Date().toISOString(),
            login_count: (existingUser as any).login_count ? (existingUser as any).login_count + 1 : 1,
          })
          .eq('id', existingUser.id)

        if (updateError) {
          console.error('Login count update error:', updateError)
        }
      }

      // Create auth session
      const { data: authUser, error: authError } = await supabaseAdmin.auth.admin.getUserById(
        existingUser.id
      )

      if (authError || !authUser.user) {
        return res.status(400).json({
          error: 'Authentication failed',
          message: 'Could not create session'
        })
      }

      // Log OAuth login
      await supabaseAdmin.from('oauth_audit_log').insert({
        user_id: existingUser.id,
        provider: 'google',
        provider_id: googleId,
        ip_address: req.headers['x-forwarded-for'] || req.socket.remoteAddress,
        user_agent: req.headers['user-agent'],
      })

      return res.status(200).json({
        user: {
          id: existingUser.id,
          email: existingUser.email,
        },
        message: 'Login successful',
      })
    }

    // User doesn't exist
    return res.status(404).json({
      error: 'User not found',
      message: 'No account found with this email. Please sign up first.',
    })
  } catch (error) {
    console.error('Google signin error:', error)
    return res.status(500).json({
      error: 'Internal server error',
      message: 'Google login failed'
    })
  }
}
