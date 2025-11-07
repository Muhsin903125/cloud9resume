import { NextApiRequest, NextApiResponse } from 'next'
import { createClient } from '@supabase/supabase-js'
import { google } from 'googleapis'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
const googleClientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID!
const googleClientSecret = process.env.GOOGLE_CLIENT_SECRET!

const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey)
const supabase = createClient(supabaseUrl, supabaseAnonKey)

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
    const name = payload.name || 'User'
    const picture = payload.picture || ''

    // Parse name into first and last
    const nameParts = name.split(' ')
    const firstName = nameParts[0] || ''
    const lastName = nameParts.slice(1).join(' ') || ''

    // Check if user already exists
    const { data: existingUser, error: searchError } = await supabaseAdmin
      .from('profiles')
      .select('id, email')
      .eq('email', email)
      .single()

    if (!searchError && existingUser) {
      // User already exists
      return res.status(409).json({
        error: 'User already exists',
        message: 'An account with this email already exists. Please sign in instead.',
      })
    }

    if (searchError && searchError.code !== 'PGRST116') {
      // PGRST116 = no rows returned
      console.error('Profile search error:', searchError)
      return res.status(500).json({
        error: 'Database error',
        message: 'Failed to check existing user'
      })
    }

    // Create new user in Supabase Auth
    const { data: authData, error: authError } = await supabaseAdmin.auth.admin.createUser({
      email,
      password: Math.random().toString(36).slice(-16), // Random password (won't be used)
      email_confirm: true, // Skip email verification for OAuth
      user_metadata: {
        auth_method: 'google',
        provider: 'google',
        provider_id: googleId,
        full_name: name,
        avatar_url: picture,
      },
    })

    if (authError || !authData.user) {
      console.error('Auth creation error:', authError)
      return res.status(400).json({
        error: 'Registration failed',
        message: authError?.message || 'Failed to create auth user'
      })
    }

    // Create profile in profiles table
    const { error: profileError } = await supabaseAdmin
      .from('profiles')
      .insert({
        id: authData.user.id,
        email,
        first_name: firstName,
        last_name: lastName,
        provider: 'google',
        provider_id: googleId,
        auth_method: 'google',
        oauth_data: {
          name,
          picture,
          email,
        },
        credits: 5, // Free credits for new users
        last_login_at: new Date().toISOString(),
        login_count: 1,
        created_at: new Date().toISOString(),
      })

    if (profileError) {
      console.error('Profile creation error:', profileError)
      // Clean up auth user if profile creation fails
      await supabaseAdmin.auth.admin.deleteUser(authData.user.id)
      return res.status(400).json({
        error: 'Registration failed',
        message: 'Failed to create user profile'
      })
    }

    // Log OAuth signup
    await supabaseAdmin.from('oauth_audit_log').insert({
      user_id: authData.user.id,
      provider: 'google',
      provider_id: googleId,
      ip_address: req.headers['x-forwarded-for'] || req.socket.remoteAddress,
      user_agent: req.headers['user-agent'],
    })

    return res.status(201).json({
      user: {
        id: authData.user.id,
        email: authData.user.email,
        name: `${firstName} ${lastName}`.trim(),
      },
      message: 'Registration successful',
    })
  } catch (error) {
    console.error('Google signup error:', error)
    return res.status(500).json({
      error: 'Internal server error',
      message: 'Google signup failed'
    })
  }
}
