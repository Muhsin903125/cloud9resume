import jwt from 'jsonwebtoken'

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production'

/**
 * Generate JWT access token for authenticated users
 * @param userId - User ID from Supabase auth
 * @param email - User email
 * @returns JWT access token
 */
export function generateAccessToken(userId: string, email: string): string {
  const expiresIn = 86400 // 24 hours in seconds

  try {
    const accessToken = jwt.sign(
      {
        userId,
        email,
        iat: Math.floor(Date.now() / 1000),
        exp: Math.floor(Date.now() / 1000) + expiresIn,
      },
      JWT_SECRET,
      { algorithm: 'HS256' }
    )

    return accessToken
  } catch (error) {
    console.error('Token generation error:', error)
    throw new Error('Failed to generate access token')
  }
}

/**
 * Generate access token response
 * @param userId - User ID
 * @param email - User email
 * @returns Object with accessToken and expiresIn
 */
export function generateTokenResponse(userId: string, email: string) {
  return {
    accessToken: generateAccessToken(userId, email),
    expiresIn: 86400, // 24 hours
  }
}
