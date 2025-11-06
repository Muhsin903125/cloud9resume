import { NextApiRequest, NextApiResponse } from 'next'
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

// Client for user authentication (uses anon key)
const supabase = createClient(supabaseUrl, supabaseAnonKey)

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  try {
    const { email } = req.body

    // Basic validation
    if (!email) {
      return res.status(400).json({
        error: 'Validation failed',
        message: 'Email is required'
      })
    }

    // Send password reset email
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${process.env.NEXT_PUBLIC_API_URL}/reset-password`,
    })

    if (error) {
      return res.status(400).json({
        error: 'Password reset failed',
        message: error.message
      })
    }

    return res.status(200).json({
      message: 'Password reset email sent successfully. Please check your email.',
    })
  } catch (error) {
    console.error('Reset password error:', error)
    return res.status(500).json({
      error: 'Internal server error',
      message: 'Password reset failed'
    })
  }
}