import { NextApiRequest, NextApiResponse } from 'next'
import { verifyToken, TokenPayload } from '../utils/tokenService'

export interface AuthenticatedRequest extends NextApiRequest {
  user?: TokenPayload
}

/**
 * Authentication middleware for API routes
 * Verifies Bearer token and attaches user data to request
 * 
 * Usage in protected endpoints:
 * export default authMiddleware(handler)
 * 
 * In your handler function:
 * const user = (req as AuthenticatedRequest).user
 * if (!user) return res.status(401).json({ error: 'Unauthorized' })
 */
export const authMiddleware = (
  handler: (req: AuthenticatedRequest, res: NextApiResponse) => Promise<void> | void
) => {
  return async (req: AuthenticatedRequest, res: NextApiResponse) => {
    // Get authorization header
    const authHeader = req.headers.authorization

    if (!authHeader) {
      return res.status(401).json({ error: 'Missing authorization header' })
    }

    // Extract token from "Bearer <token>"
    const parts = authHeader.split(' ')
    if (parts.length !== 2 || parts[0] !== 'Bearer') {
      return res.status(401).json({ error: 'Invalid authorization format' })
    }

    const token = parts[1]

    // Verify token and get decoded payload
    const decoded = await verifyToken(token)
    if (!decoded) {
      return res.status(401).json({ error: 'Invalid or expired token' })
    }

    // Attach user data to request object
    req.user = decoded

    // Call the actual handler
    try {
      return await handler(req, res)
    } catch (error) {
      console.error('Handler error:', error)
      return res.status(500).json({ error: 'Internal server error' })
    }
  }
}

/**
 * Wrapper for protected routes
 * Alias for authMiddleware - use whichever you prefer
 */
export const withAuth = authMiddleware

/**
 * Optional authentication middleware
 * Attaches user if token is valid, but doesn't fail if missing
 */
export const withOptionalAuth = (
  handler: (req: AuthenticatedRequest, res: NextApiResponse) => Promise<void> | void
) => {
  return async (req: AuthenticatedRequest, res: NextApiResponse) => {
    const authHeader = req.headers.authorization

    if (authHeader) {
      const parts = authHeader.split(' ')
      if (parts.length === 2 && parts[0] === 'Bearer') {
        const token = parts[1]
        const decoded = await verifyToken(token)
        if (decoded) {
          req.user = decoded
        }
      }
    }

    try {
      return await handler(req, res)
    } catch (error) {
      console.error('Handler error:', error)
      return res.status(500).json({ error: 'Internal server error' })
    }
  }
}