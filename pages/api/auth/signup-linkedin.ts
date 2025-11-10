import { NextApiRequest, NextApiResponse } from 'next'
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
const linkedinClientId = process.env.NEXT_PUBLIC_LINKEDIN_CLIENT_ID!
const linkedinClientSecret = process.env.LINKEDIN_CLIENT_SECRET!
const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'

const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey)

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  try {
    const { code } = req.body

    if (!code) {
      return res.status(400).json({
        error: 'Missing authorization code',
        message: 'Authorization code is required'
      })
    }

    // Exchange code for access token
    const tokenResponse = await fetch(
      'https://www.linkedin.com/oauth/v2/accessToken',
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: new URLSearchParams({
          grant_type: 'authorization_code',
          code,
          client_id: linkedinClientId || '',
          client_secret: linkedinClientSecret || '',
          redirect_uri: `${appUrl}/api/auth/callback/linkedin`,
        }).toString(),
      }
    )

    if (!tokenResponse.ok) {
      const errorData = await tokenResponse.json()
      console.error('LinkedIn token exchange error:', errorData)
      return res.status(400).json({
        error: 'Token exchange failed',
        message: 'Failed to exchange authorization code for access token'
      })
    }

    const tokenData = await tokenResponse.json()
    const accessToken = tokenData.access_token

    if (!accessToken) {
      return res.status(400).json({
        error: 'No access token',
        message: 'Failed to obtain access token from LinkedIn'
      })
    }

    // Get user profile using OpenID Connect /v2/userinfo endpoint
    const userInfoResponse = await fetch(
      'https://api.linkedin.com/v2/userinfo',
      {
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Accept': 'application/json',
        },
      }
    )

    if (!userInfoResponse.ok) {
      const errorData = await userInfoResponse.json()
      console.error('LinkedIn userinfo error:', errorData)
      return res.status(400).json({
        error: 'Failed to fetch user info',
        message: 'Could not retrieve LinkedIn profile information'
      })
    }

    const userInfo = await userInfoResponse.json()
    
    // Extract user data from OpenID Connect response
    const email = userInfo.email
    const linkedinId = userInfo.sub // subject claim contains user ID
    const givenName = userInfo.given_name || ''
    const familyName = userInfo.family_name || ''
    const firstName = givenName
    const lastName = familyName
    const name = userInfo.name || `${givenName} ${familyName}`.trim()
    const picture = userInfo.picture || ''

    if (!email) {
      return res.status(400).json({
        error: 'Email not accessible',
        message: 'Could not retrieve email from LinkedIn profile'
      })
    }

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
      console.error('Profile search error:', searchError)
      return res.status(500).json({
        error: 'Database error',
        message: 'Failed to check existing user'
      })
    }

    // Create new user in Supabase Auth
    const { data: authData, error: authError } = await supabaseAdmin.auth.admin.createUser({
      email,
      password: Math.random().toString(36).slice(-16),
      email_confirm: true,
      user_metadata: {
        auth_method: 'linkedin',
        provider: 'linkedin',
        provider_id: linkedinId,
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
        provider: 'linkedin',
        provider_id: linkedinId,
        auth_method: 'linkedin',
        oauth_data: {
          name,
          picture,
          email,
        },
        credits: 5,
        last_login_at: new Date().toISOString(),
        login_count: 1,
        created_at: new Date().toISOString(),
      })

    if (profileError) {
      console.error('Profile creation error:', profileError)
      await supabaseAdmin.auth.admin.deleteUser(authData.user.id)
      return res.status(400).json({
        error: 'Registration failed',
        message: 'Failed to create user profile'
      })
    }

    return res.status(201).json({
      id: authData.user.id,
      email: authData.user.email,
      name: name,
      picture: picture || null,
      provider: 'linkedin',
      message: 'Registration successful',
    })
  } catch (error) {
    console.error('LinkedIn signup error:', error)
    return res.status(500).json({
      error: 'Internal server error',
      message: 'LinkedIn signup failed'
    })
  }
}
