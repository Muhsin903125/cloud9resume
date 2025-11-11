import { NextApiRequest, NextApiResponse } from 'next'
import { createClient } from '@supabase/supabase-js'
import { generateToken } from '../../../lib/backend/utils/tokenService'

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
      return res.status(400).json({
        error: 'Token exchange failed',
        message: 'Failed to exchange authorization code for access token',
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
    const name = userInfo.name || `${userInfo.given_name || ''} ${userInfo.family_name || ''}`.trim()

    if (!email) {
      return res.status(400).json({
        error: 'Email not accessible',
        message: 'Could not retrieve email from LinkedIn profile'
      })
    }

    // Check if user exists
    const { data: existingUser } = await supabaseAdmin
      .from('users')
      .select('id, email, plan, credits')
      .eq('email', email)
      .single()

    let user = existingUser

    // Create user if doesn't exist
    if (!user) {
      const { data: newUser, error: createError } = await supabaseAdmin
        .from('users')
        .insert([{
          email,
          name,
          login_provider: 'linkedin',
          plan: 'free',
          credits: 0,
        }])
        .select('id, email, plan, credits')
        .single()

      if (createError || !newUser) {
        console.error('User creation error:', createError)
        return res.status(500).json({
          error: 'Failed to create user',
          message: 'Could not create account'
        })
      }

      user = newUser
    }

    // Generate JWT token
    const accessTokenJwt = await generateToken(user.id, user.email, user.plan)

    return res.status(200).json({
      success: true,
      accessToken: accessTokenJwt,
      expiresIn: 86400,
      user: {
        id: user.id,
        email: user.email,
        plan: user.plan,
        credits: user.credits,
      },
    })
  } catch (error) {
    console.error('LinkedIn signin error:', error)
    return res.status(500).json({
      error: 'Internal server error',
      message: 'LinkedIn login failed'
    })
  }
}
