import type { NextApiRequest, NextApiResponse } from 'next'
import jwt from 'jsonwebtoken'

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production'
const TOKEN_EXPIRY = process.env.TOKEN_EXPIRY || '24h' // Token expires in 24 hours

interface TokenResponse {
  success: boolean
  accessToken?: string
  expiresIn?: number
  userId?: string
  error?: string
  message?: string
}

/**
 * POST /api/auth/generate-token
 * Generate JWT access token after successful login
 * 
 * Request body:
 * {
 *   "userId": "user-uuid",
 *   "email": "user@example.com"
 * }
 * 
 * Response:
 * {
 *   "success": true,
 *   "accessToken": "eyJhbGc...",
 *   "expiresIn": 86400,
 *   "userId": "user-uuid"
 * }
 */
export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<TokenResponse>
) {
  try {
    if (req.method !== 'POST') {
      return res.status(405).json({ success: false, error: 'Method not allowed' })
    }

    const { userId, email } = req.body

    // Validate required fields
    if (!userId) {
      return res.status(400).json({ 
        success: false, 
        error: 'userId is required' 
      })
    }

    // Calculate expiry time
    const expiresIn = parseInt(TOKEN_EXPIRY, 10) // 24 hours in seconds
    const expiresAt = new Date(Date.now() + expiresIn * 1000)

    // Create JWT token with userId and expiry
    const accessToken = jwt.sign(
      {
        userId,
        email,
        iat: Math.floor(Date.now() / 1000),
        exp: Math.floor(expiresAt.getTime() / 1000),
      },
      JWT_SECRET,
      { algorithm: 'HS256' }
    )

    return res.status(200).json({
      success: true,
      accessToken,
      expiresIn,
      userId,
      message: 'Access token generated successfully',
    })
  } catch (error) {
    console.error('Token generation error:', error)
    return res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Failed to generate token',
    })
  }
}
