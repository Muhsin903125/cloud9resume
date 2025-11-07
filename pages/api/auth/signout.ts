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
    // Sign out with Supabase
    const { error } = await supabase.auth.signOut()

    if (error) {
      return res.status(400).json({
        error: 'Signout failed',
        message: error.message
      })
    }

    return res.status(200).json({
      message: 'Signout successful',
    })
  } catch (error) {
    console.error('Signout error:', error)
    return res.status(500).json({
      error: 'Internal server error',
      message: 'Signout failed'
    })
  }
}