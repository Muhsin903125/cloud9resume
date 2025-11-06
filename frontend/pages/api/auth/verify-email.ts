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
    const { token, type } = req.body

    // Basic validation
    if (!token || !type) {
      return res.status(400).json({
        error: 'Validation failed',
        message: 'Token and type are required'
      })
    }

    // Verify email with token
    const { error } = await supabase.auth.verifyOtp({
      token_hash: token,
      type: type as any, // 'email' | 'recovery' | etc.
    })

    if (error) {
      return res.status(400).json({
        error: 'Email verification failed',
        message: error.message
      })
    }

    return res.status(200).json({
      message: 'Email verified successfully',
    })
  } catch (error) {
    console.error('Verify email error:', error)
    return res.status(500).json({
      error: 'Internal server error',
      message: 'Email verification failed'
    })
  }
}