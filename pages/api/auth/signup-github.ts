import { NextApiRequest, NextApiResponse } from 'next'
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!
const githubClientId = process.env.NEXT_PUBLIC_GITHUB_CLIENT_ID!
const githubClientSecret = process.env.GITHUB_CLIENT_SECRET!
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
      'https://github.com/login/oauth/access_token',
      {
        method: 'POST',
        headers: {
          Accept: 'application/json',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          client_id: githubClientId,
          client_secret: githubClientSecret,
          code,
          redirect_uri: `${appUrl}/api/auth/callback/github`,
        }),
      }
    )

    if (!tokenResponse.ok) {
      throw new Error('Failed to exchange code for token')
    }

    const tokenData = await tokenResponse.json()
    const accessToken = tokenData.access_token

    if (!accessToken) {
      throw new Error('No access token received from GitHub')
    }

    // Get user profile
    const profileResponse = await fetch(
      'https://api.github.com/user',
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
          Accept: 'application/vnd.github+json',
        },
      }
    )

    if (!profileResponse.ok) {
      throw new Error('Failed to fetch GitHub profile')
    }

    const profileData = await profileResponse.json()

    // Get user email (primary email)
    const emailResponse = await fetch(
      'https://api.github.com/user/emails',
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
          Accept: 'application/vnd.github+json',
        },
      }
    )

    if (!emailResponse.ok) {
      throw new Error('Failed to fetch GitHub emails')
    }

    const emailsData = await emailResponse.json()
    const primaryEmail = emailsData.find((e: any) => e.primary)?.email || emailsData[0]?.email

    if (!primaryEmail) {
      return res.status(400).json({
        error: 'Email not accessible',
        message: 'Could not retrieve email from GitHub profile. Please make your email public on GitHub.'
      })
    }

    // Check if user already exists
    const { data: existingUser, error: searchError } = await supabaseAdmin
      .from('profiles')
      .select('id, email')
      .eq('email', primaryEmail)
      .single()

    if (searchError && searchError.code !== 'PGRST116') {
      console.error('Profile search error:', searchError)
    }

    if (existingUser) {
      return res.status(409).json({
        error: 'User already exists',
        message: 'An account with this email already exists. Please sign in instead.'
      })
    }

    const githubId = profileData.id.toString()
    const nameArray = (profileData.name || profileData.login).split(' ')
    const firstName = nameArray[0]
    const lastName = nameArray.slice(1).join(' ') || ''
    const picture = profileData.avatar_url || ''

    // Create Supabase Auth user
    const { data: authData, error: authError } = await supabaseAdmin.auth.admin.createUser({
      email: primaryEmail,
      email_confirm: true,
      user_metadata: {
        provider: 'github',
        provider_id: githubId,
        full_name: profileData.name || profileData.login,
        avatar_url: picture,
      }
    })

    if (authError || !authData.user) {
      console.error('Auth user creation error:', authError)
      throw new Error('Failed to create user account')
    }

    // Create profile
    const { error: profileError } = await supabaseAdmin
      .from('profiles')
      .insert({
        id: authData.user.id,
        email: primaryEmail,
        first_name: firstName,
        last_name: lastName,
        provider: 'github',
        provider_id: githubId,
        auth_method: 'github',
        oauth_data: {
          name: profileData.name || profileData.login,
          picture: picture,
          email: primaryEmail,
        },
        credits: 5, // Free credits for new users
        last_login_at: new Date().toISOString(),
        login_count: 1,
        created_at: new Date().toISOString(),
      })

    if (profileError) {
      console.error('Profile creation error:', profileError)
      
      // Clean up the auth user if profile creation fails
      await supabaseAdmin.auth.admin.deleteUser(authData.user.id)
      throw new Error('Failed to create user profile')
    }

    return res.status(201).json({
      id: authData.user.id,
      email: primaryEmail,
      name: profileData.name || profileData.login,
      picture: picture || null,
      provider: 'github',
      message: 'Account created successfully',
    })
  } catch (error) {
    console.error('GitHub signup error:', error)
    return res.status(500).json({
      error: 'Internal server error',
      message: 'GitHub signup failed'
    })
  }
}
