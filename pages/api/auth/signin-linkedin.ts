import { NextApiRequest, NextApiResponse } from 'next'
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!
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
    const redirectUri = `${appUrl}/api/auth/callback/linkedin`
    
    console.log('LinkedIn token exchange attempt:', {
      appUrl,
      redirectUri,
      clientId: linkedinClientId ? '***' : 'MISSING',
      clientSecret: linkedinClientSecret ? '***' : 'MISSING',
    })

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
          redirect_uri: redirectUri,
        }).toString(),
      }
    )

    if (!tokenResponse.ok) {
      const errorData = await tokenResponse.json()
      console.error('LinkedIn token exchange error:', errorData)
      console.error('Request parameters used:', { redirectUri, clientId: linkedinClientId })
      return res.status(400).json({
        error: 'Token exchange failed',
        message: 'Failed to exchange authorization code for access token',
        debug: process.env.NODE_ENV === 'development' ? { redirectUri, hasClientId: !!linkedinClientId, hasSecret: !!linkedinClientSecret } : undefined
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
    // This endpoint returns standard OpenID Connect claims
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
    // Standard OpenID Connect claims from LinkedIn
    const email = userInfo.email
    const linkedinId = userInfo.sub // subject claim contains user ID (urn:li:person:xxxxxxxx)
    const name = userInfo.name || `${userInfo.given_name || ''} ${userInfo.family_name || ''}`.trim()
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
      .select('id, email, auth_method')
      .eq('email', email)
      .single()

    if (searchError && searchError.code !== 'PGRST116') {
      console.error('Profile search error:', searchError)
    }

    // If user exists, update auth method if needed
    if (existingUser) {
      if (existingUser.auth_method !== 'linkedin') {
        const { error: updateError } = await supabaseAdmin
          .from('profiles')
          .update({
            auth_method: 'linkedin',
            provider: 'linkedin',
            provider_id: linkedinId,
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
      }

      return res.status(200).json({
        id: existingUser.id,
        email: existingUser.email,
        name: name || email,
        picture: picture || null,
        provider: 'linkedin',
        message: 'Login successful',
      })
    }

    // User doesn't exist
    return res.status(404).json({
      error: 'User not found',
      message: 'No account found with this email. Please sign up first.',
    })
  } catch (error) {
    console.error('LinkedIn signin error:', error)
    return res.status(500).json({
      error: 'Internal server error',
      message: 'LinkedIn login failed'
    })
  }
}
