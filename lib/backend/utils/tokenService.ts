import jwt from 'jsonwebtoken'
import { supabase } from '../supabaseClient'

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production'

export interface TokenPayload {
  userId: string
  email: string
  plan: string
  iat: number
  exp: number
}

/**
 * Generate JWT access token with user info and plan
 * @param userId - User ID
 * @param email - User email
 * @param plan - User plan (free, starter, pro, pro+)
 * @returns JWT token
 */
export const generateToken = async (
  userId: string,
  email: string,
  plan: string
): Promise<string> => {
  const expiresIn = 86400 // 24 hours

  try {
    const payload: Omit<TokenPayload, 'iat' | 'exp'> = {
      userId,
      email,
      plan,
    }

    const token = jwt.sign(payload, JWT_SECRET, {
      expiresIn,
      algorithm: 'HS256',
    })

    // Store token in user_tokens table for tracking/revocation
    const expiresAt = new Date(Date.now() + expiresIn * 1000)
    const { error } = await supabase.from('user_tokens').insert([
      {
        user_id: userId,
        token,
        expires_at: expiresAt.toISOString(),
        is_active: true,
      },
    ])

    if (error) {
      console.error('Error storing token:', error)
      // Still return token even if storage fails
    }

    return token
  } catch (error) {
    console.error('Token generation error:', error)
    throw new Error('Failed to generate access token')
  }
}

/**
 * Verify JWT token and check if it's still active
 * @param token - JWT token to verify
 * @returns Decoded token payload or null if invalid
 */
export const verifyToken = async (token: string): Promise<TokenPayload | null> => {
  try {
    // Decode and verify JWT
    const decoded = jwt.verify(token, JWT_SECRET) as TokenPayload

    // Check if token is still active in database
    const { data, error } = await supabase
      .from('user_tokens')
      .select('id, is_active')
      .eq('token', token)
      .eq('is_active', true)
      .single()

    if (error || !data) {
      console.warn('Token not found or revoked:', error)
      return null
    }

    return decoded
  } catch (error) {
    console.error('Token verification error:', error)
    return null
  }
}

/**
 * Revoke a token by marking it inactive
 * @param token - JWT token to revoke
 * @returns Success status
 */
export const revokeToken = async (token: string): Promise<boolean> => {
  try {
    const { error } = await supabase
      .from('user_tokens')
      .update({ is_active: false })
      .eq('token', token)

    if (error) {
      console.error('Error revoking token:', error)
      return false
    }

    return true
  } catch (error) {
    console.error('Token revocation error:', error)
    return false
  }
}

/**
 * Revoke all tokens for a user (logout all devices)
 * @param userId - User ID
 * @returns Success status
 */
export const revokeAllUserTokens = async (userId: string): Promise<boolean> => {
  try {
    const { error } = await supabase
      .from('user_tokens')
      .update({ is_active: false })
      .eq('user_id', userId)

    if (error) {
      console.error('Error revoking user tokens:', error)
      return false
    }

    return true
  } catch (error) {
    console.error('User token revocation error:', error)
    return false
  }
}

/**
 * Get user data from database
 * @param userId - User ID
 * @returns User data or null
 */
export const getUserById = async (userId: string) => {
  try {
    const { data, error } = await supabase
      .from('users')
      .select('id, email, name, plan, credits, created_at')
      .eq('id', userId)
      .single()

    if (error) {
      console.error('Error fetching user:', error)
      return null
    }

    return data
  } catch (error) {
    console.error('Error getting user:', error)
    return null
  }
}

/**
 * Update user plan
 * @param userId - User ID
 * @param plan - New plan (free, starter, pro, pro+)
 * @returns Success status
 */
export const updateUserPlan = async (
  userId: string,
  plan: 'free' | 'starter' | 'pro' | 'pro+'
): Promise<boolean> => {
  try {
    const { error } = await supabase
      .from('users')
      .update({ plan })
      .eq('id', userId)

    if (error) {
      console.error('Error updating user plan:', error)
      return false
    }

    return true
  } catch (error) {
    console.error('Error updating plan:', error)
    return false
  }
}

/**
 * Add credits to user
 * @param userId - User ID
 * @param amount - Amount to add
 * @returns New credit balance or null
 */
export const addUserCredits = async (
  userId: string,
  amount: number
): Promise<number | null> => {
  try {
    // First get current credits
    const { data: user, error: getError } = await supabase
      .from('users')
      .select('credits')
      .eq('id', userId)
      .single()

    if (getError) {
      console.error('Error fetching credits:', getError)
      return null
    }

    const newCredits = (user?.credits || 0) + amount

    // Update with new amount
    const { error: updateError } = await supabase
      .from('users')
      .update({ credits: newCredits })
      .eq('id', userId)

    if (updateError) {
      console.error('Error updating credits:', updateError)
      return null
    }

    return newCredits
  } catch (error) {
    console.error('Error adding credits:', error)
    return null
  }
}

/**
 * Deduct credits from user
 * @param userId - User ID
 * @param amount - Amount to deduct
 * @returns New credit balance or null if insufficient
 */
export const deductUserCredits = async (
  userId: string,
  amount: number
): Promise<number | null> => {
  try {
    // Fetch current credits
    const { data: user, error: getError } = await supabase
      .from('users')
      .select('credits')
      .eq('id', userId)
      .single()

    if (getError || !user) {
      console.error('Error fetching credits:', getError)
      return null
    }

    if (user.credits < amount) {
      console.warn(`Insufficient credits: have ${user.credits}, need ${amount}`)
      return null
    }

    const newCredits = user.credits - amount

    // Update with new amount
    const { error: updateError } = await supabase
      .from('users')
      .update({ credits: newCredits })
      .eq('id', userId)

    if (updateError) {
      console.error('Error updating credits:', updateError)
      return null
    }

    return newCredits
  } catch (error) {
    console.error('Error deducting credits:', error)
    return null
  }
}
