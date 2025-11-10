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

    const githubId = profileData.id.toString()
    const name = profileData.name || profileData.login
    const picture = profileData.avatar_url || ''

    // Check if user already exists
    const { data: existingUser, error: searchError } = await supabaseAdmin
      .from('profiles')
      .select('id, email, auth_method')
      .eq('email', primaryEmail)
      .single()

    if (searchError && searchError.code !== 'PGRST116') {
      console.error('Profile search error:', searchError)
    }

    // If user exists, update auth method if needed
    if (existingUser) {
      if (existingUser.auth_method !== 'github') {
        const { error: updateError } = await supabaseAdmin
          .from('profiles')
          .update({
            auth_method: 'github',
            provider: 'github',
            provider_id: githubId,
            oauth_data: {
              name,
              picture,
              email: primaryEmail,
            },
            last_login_at: new Date().toISOString(),
            login_count: (existingUser as any).login_count ? (existingUser as any).login_count + 1 : 1,
          })
          .eq('id', existingUser.id)

        if (updateError) {
          console.error('Profile update error:', updateError)
        }
      }

      return res.status(200).json({
        id: existingUser.id,
        email: existingUser.email,
        name: name || primaryEmail,
        picture: picture || null,
        provider: 'github',
        message: 'Login successful',
      })
    }

    // User doesn't exist
    return res.status(404).json({
      error: 'User not found',
      message: 'No account found with this email. Please sign up first.',
    })
  } catch (error) {
    console.error('GitHub signin error:', error)
    return res.status(500).json({
      error: 'Internal server error',
      message: 'GitHub login failed'
    })
  }
}
