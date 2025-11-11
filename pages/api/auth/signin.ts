import { NextApiRequest, NextApiResponse } from 'next'
import { createClient } from '@supabase/supabase-js'
import { generateToken, getUserById } from '../../../lib/backend/utils/tokenService'
import bcrypt from 'bcryptjs'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
const JWT_SECRET = process.env.JWT_SECRET

// Client for database access
const supabase = createClient(supabaseUrl, supabaseAnonKey)

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  try {
    const { email, password } = req.body

    // Validation
    if (!email || !password) {
      return res.status(400).json({
        error: 'Validation failed',
        message: 'Email and password are required'
      })
    }

    if (!JWT_SECRET) {
      return res.status(500).json({
        error: 'Server error',
        message: 'JWT_SECRET not configured'
      })
    }

    // Fetch user from 'users' table (not Supabase Auth)
    const { data: user, error: userError } = await supabase
      .from('users')
      .select('id, email, password_hash, plan, credits')
      .eq('email', email)
      .eq('login_provider', 'email')
      .single()

    if (userError || !user) {
      return res.status(401).json({
        error: 'Authentication failed',
        message: 'Invalid email or password'
      })
    }

    // Verify password hash
    if (!user.password_hash) {
      return res.status(401).json({
        error: 'Authentication failed',
        message: 'This account uses social login, not email/password'
      })
    }

    const passwordMatch = await bcrypt.compare(password, user.password_hash)
    if (!passwordMatch) {
      return res.status(401).json({
        error: 'Authentication failed',
        message: 'Invalid email or password'
      })
    }

    // Generate JWT token with user plan info
    const accessToken = await generateToken(user.id, user.email, user.plan)

    return res.status(200).json({
      success: true,
      accessToken,
      expiresIn: 86400, // 24 hours in seconds
      user: {
        id: user.id,
        email: user.email,
        plan: user.plan,
        credits: user.credits
      },
      message: 'Login successful'
    })
  } catch (error) {
    console.error('Signin error:', error)
    return res.status(500).json({
      error: 'Internal server error',
      message: 'Login failed'
    })
  }
}