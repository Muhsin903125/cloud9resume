import { NextApiRequest, NextApiResponse } from 'next'
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

// Admin client for password updates
const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey)

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  try {
    const { token, password } = req.body

    // Basic validation
    if (!token || !password) {
      return res.status(400).json({
        error: 'Validation failed',
        message: 'Token and password are required'
      })
    }

    if (password.length < 8) {
      return res.status(400).json({
        error: 'Validation failed',
        message: 'Password must be at least 8 characters long'
      })
    }

    // Extract user email from token (after hash verification)
    // Note: In a real implementation, you'd want to verify the token hash properly
    // For now, we'll use Supabase's built-in recovery token verification
    
    // Try to get the user associated with the recovery token
    const supabaseUrl_encoded = encodeURIComponent(supabaseUrl)
    const token_encoded = encodeURIComponent(token)
    
    // Alternative approach: Use the token directly to update password
    // Create a client that will use the recovery token
    const anonClient = createClient(supabaseUrl, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '')
    
    // Set the session with the recovery token
    const { data: sessionData, error: setSessionError } = await anonClient.auth.setSession({
      access_token: token,
      refresh_token: ''
    })

    if (setSessionError) {
      return res.status(400).json({
        error: 'Invalid or expired token',
        message: 'The password reset link is invalid or has expired'
      })
    }

    // Now update the password with the recovered session
    const { error: updateError } = await anonClient.auth.updateUser({
      password
    })

    if (updateError) {
      console.error('Password update error:', updateError)
      return res.status(400).json({
        error: 'Password update failed',
        message: 'Failed to update password. Please try again.'
      })
    }

    return res.status(200).json({
      message: 'Password reset successfully. You can now sign in with your new password.'
    })
  } catch (error) {
    console.error('Update password error:', error)
    return res.status(500).json({
      error: 'Internal server error',
      message: 'An error occurred while resetting your password'
    })
  }
}
