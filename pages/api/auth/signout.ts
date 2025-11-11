import { NextApiResponse } from 'next'
import { withAuth, AuthenticatedRequest } from '../../../lib/backend/middleware/authMiddleware'
import { revokeToken, revokeAllUserTokens } from '../../../lib/backend/utils/tokenService'

/**
 * Signout/Logout Endpoint
 * 
 * Revokes the current token (single device logout)
 * Set revokeAll=true in body to logout all devices
 */

export default withAuth(async (req: AuthenticatedRequest, res: NextApiResponse) => {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  try {
    const { user } = req
    
    if (!user) {
      return res.status(401).json({ error: 'Unauthorized' })
    }

    const { revokeAll } = req.body

    if (revokeAll) {
      // Logout from all devices - revoke all user's tokens
      const success = await revokeAllUserTokens(user.userId)
      
      if (!success) {
        return res.status(500).json({
          error: 'Logout failed',
          message: 'Could not revoke tokens'
        })
      }

      return res.status(200).json({
        success: true,
        message: 'Logged out from all devices'
      })
    } else {
      // Logout from this device only - revoke current token
      const authHeader = req.headers.authorization
      if (!authHeader) {
        return res.status(400).json({
          error: 'Missing token',
          message: 'Authorization header required'
        })
      }

      const token = authHeader.split(' ')[1]
      const success = await revokeToken(token)

      if (!success) {
        return res.status(500).json({
          error: 'Logout failed',
          message: 'Could not revoke token'
        })
      }

      return res.status(200).json({
        success: true,
        message: 'Logged out successfully'
      })
    }
  } catch (error) {
    console.error('Signout error:', error)
    return res.status(500).json({
      error: 'Internal server error',
      message: 'Logout failed'
    })
  }
})