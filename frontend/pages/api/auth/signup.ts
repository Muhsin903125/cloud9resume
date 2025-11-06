import { NextApiRequest, NextApiResponse } from 'next'
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

// Client for user authentication (uses anon key)
const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Client for admin operations like profile creation (uses service role key)
const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey)

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  try {
    const { email, password, firstName, lastName, acceptTerms } = req.body

    // Basic validation
    if (!email || !password || !firstName || !lastName) {
      return res.status(400).json({
        error: 'Validation failed',
        message: 'All fields are required'
      })
    }

    if (password.length < 6) {
      return res.status(400).json({
        error: 'Validation failed',
        message: 'Password must be at least 6 characters long'
      })
    }

    if (!acceptTerms) {
      return res.status(400).json({
        error: 'Validation failed',
        message: 'You must accept the terms and conditions'
      })
    }

    // Sign up with Supabase
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          first_name: firstName,
          last_name: lastName,
          full_name: `${firstName} ${lastName}`,
        }
      }
    })

    if (error) {
      return res.status(400).json({
        error: 'Registration failed',
        message: error.message
      })
    }

    // Create user profile using admin client
    if (data.user) {
      const { error: profileError } = await supabaseAdmin
        .from('profiles')
        .insert({
          id: data.user.id,
          email: data.user.email,
          first_name: firstName,
          last_name: lastName,
          credits: 5, // Free credits for new users
          created_at: new Date().toISOString(),
        })

      if (profileError) {
        console.error('Profile creation error:', profileError)
        // Don't fail the signup if profile creation fails
        // We'll log it but still return success
      } else {
        console.log('Profile created successfully for user:', data.user.id)
      }
    }

    return res.status(201).json({
      user: {
        id: data.user?.id,
        email: data.user?.email,
      },
      message: 'Registration successful. Please check your email to verify your account.',
    })
  } catch (error) {
    console.error('Signup error:', error)
    return res.status(500).json({
      error: 'Internal server error',
      message: 'Registration failed'
    })
  }
}