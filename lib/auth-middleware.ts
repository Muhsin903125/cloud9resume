import jwt from 'jsonwebtoken'
import type { NextApiRequest } from 'next'

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production'

export interface AuthenticatedRequest extends NextApiRequest {
  user?: {
    userId: string
    email?: string
    iat: number
    exp: number
  }
}

/**
 * Validates access token from Authorization header
 * Format: Authorization: Bearer <token>
 * 
 * Returns:
 * - On success: Authenticated request with user data
 * - On failure: null (caller should return 401)
 */
export function verifyAccessToken(req: NextApiRequest): AuthenticatedRequest['user'] | null {
  try {
    const authHeader = req.headers.authorization
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      console.warn('Missing or invalid Authorization header')
      return null
    }

    const token = authHeader.substring(7) // Remove "Bearer " prefix

    // Verify and decode token
    const decoded = jwt.verify(token, JWT_SECRET) as any

    if (!decoded.userId) {
      console.warn('Token missing userId')
      return null
    }

    return {
      userId: decoded.userId,
      email: decoded.email,
      iat: decoded.iat,
      exp: decoded.exp,
    }
  } catch (error) {
    if (error instanceof jwt.TokenExpiredError) {
      console.warn('Token expired:', error.message)
      return null
    }
    if (error instanceof jwt.JsonWebTokenError) {
      console.warn('Invalid token:', error.message)
      return null
    }
    console.error('Token verification error:', error)
    return null
  }
}

/**
 * Middleware function to protect API routes
 * Usage:
 * 
 * export default function handler(req: NextApiRequest, res: NextApiResponse) {
 *   const user = verifyAccessToken(req)
 *   if (!user) {
 *     return res.status(401).json({ 
 *       success: false, 
 *       error: 'Unauthorized. Invalid or expired token.' 
 *     })
 *   }
 *   
 *   // Now you can use user.userId in your API
 *   const userId = user.userId
 * }
 */
export function withAuth(
  handler: (req: AuthenticatedRequest, res: any) => Promise<void>
) {
  return async (req: NextApiRequest, res: any) => {
    const user = verifyAccessToken(req)

    if (!user) {
      return res.status(401).json({
        success: false,
        error: 'Unauthorized. Invalid or expired token.',
      })
    }

    ;(req as AuthenticatedRequest).user = user
    return handler(req as AuthenticatedRequest, res)
  }
}
